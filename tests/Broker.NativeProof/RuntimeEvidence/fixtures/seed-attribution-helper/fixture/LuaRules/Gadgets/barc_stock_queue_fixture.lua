function gadget:GetInfo()
  return {
    name = "HighBar BARC Stock Queue Fixture",
    desc = "Setup-only actors and bounded pre-readiness production for BARC-01.5 stock qualification",
    author = "HighBar",
    version = "3",
    date = "2026-10-01",
    license = "MIT",
    layer = 1003,
    enabled = true,
  }
end

-- Finite observations only. Hex strings prevent whitespace/log framing ambiguity.
local options = Spring.GetModOptions() or {}
local nonce = options.highbar_barc_prearm_nonce
local prearm = type(nonce) == "string" and #nonce >= 1 and #nonce <= 64
  and nonce:match("^[%w._-]+$") ~= nil
local function hex(value)
  if type(value) ~= "string" or #value > 4096 then return nil end
  if value == "" then return "-" end
  return (value:gsub(".", function(c) return string.format("%02x", string.byte(c)) end))
end
local function observe(kind, frame, fields)
  if not prearm then return end
  local keys = {}
  for key in pairs(fields) do keys[#keys + 1] = key end
  table.sort(keys)
  local row = "BARC_PREARM_V1 kind=" .. kind .. " nonce=" .. nonce .. " frame=" .. tostring(frame)
  for _, key in ipairs(keys) do row = row .. " " .. key .. "=" .. tostring(fields[key]) end
  Spring.Echo(row)
end
local function rejected(frame, reason) observe("refused", frame, {reason=reason}) end
local paths = {"LuaRules/Gadgets/barc_stock_queue_fixture.lua", "LuaRules/Gadgets/barc_stock_queue_reader.lua"}

if not gadgetHandler:IsSyncedCode() then
  local observed = false
  function gadget:GameFrame(frame)
    if observed or not prearm or frame < 1 then return end
    observed = true
    -- Unsynced only: synced GetAIInfo returns deliberately substituted identities.
    local teams = Spring.GetTeamList()
    if type(teams) ~= "table" or #teams > 256 then return rejected(frame, "team_inventory") end
    for _, team in ipairs(teams) do
      local id, name, host, short, version, aiOptions = Spring.GetAIInfo(team)
      if id ~= nil then
        if type(aiOptions) ~= "table" or short == "UNKNOWN" or short == "SYNCED_NOSHORTNAME" then
          return rejected(frame, "ai_identity")
        end
        local keys, encoded = {}, {}
        for key in pairs(aiOptions) do keys[#keys + 1] = key end
        if #keys > 32 then return rejected(frame, "ai_options_bound") end
        table.sort(keys)
        for _, key in ipairs(keys) do
          local k, value = hex(key), hex(aiOptions[key])
          if not k or not value then return rejected(frame, "ai_options") end
          encoded[#encoded + 1] = k .. ":" .. value
        end
        if not hex(name) or not hex(short) or not hex(version) then return rejected(frame, "ai_strings") end
        observe("ai", frame, {team=team, id=id, name=hex(name), host=host,
          short=hex(short), version=hex(version), options=hex(table.concat(encoded, ","))})
      end
    end
    for _, key in ipairs({"Headless", "LogFlush", "LogFlushLevel"}) do
      local value = Spring.GetConfigInt(key)
      if type(value) ~= "number" or value % 1 ~= 0 then return rejected(frame, "effective_config") end
      observe("config", frame, {key=hex(key), type="int", value=hex(tostring(value))})
    end
    for _, path in ipairs(paths) do
      local archive = VFS.GetArchiveContainingFile(path, VFS.ZIP)
      local absolute = VFS.GetFileAbsolutePath(path, VFS.ZIP)
      if archive == nil and absolute == nil then return rejected(frame, "vfs_lookup") end
      observe("vfs", frame, {path=hex(path), archive=hex(archive or ""), absolute=hex(absolute or "")})
    end
  end
  return
end

local OPT_ENABLE = "highbar_barc_stock_fixture"
local OPT_TEAM = "highbar_barc_stock_team"
local OPT_ENEMY_TEAM = "highbar_barc_stock_enemy_team"
local PREFIX = "highbar_barc_stock_fixture"
local OLD_PRODUCTION_COUNT = 3
local done = false
local phase = "actors"
local selected = nil

local function enabled(value)
  return value == true or value == 1 or value == "1"
end

local function fail(reason)
  done = true
  rejected(Spring.GetGameFrame(), reason)
  Spring.Echo(string.format("%s kind=setup status=failed reason=%s", PREFIX, reason))
end

local function liveTeam(teamID)
  if type(teamID) ~= "number" or teamID < 0 or teamID % 1 ~= 0 then return false end
  local _, _, isDead = Spring.GetTeamInfo(teamID, false)
  return isDead == false
end

local function create(name, x, z, facing, teamID)
  local def = UnitDefNames[name]
  if not def or type(def.id) ~= "number" then return nil, "missing_definition_" .. name end
  local y = Spring.GetGroundHeight(x, z)
  local unitID = Spring.CreateUnit(name, x, y, z, facing, teamID)
  if type(unitID) ~= "number" then return nil, "create_failed_" .. name end
  return unitID, nil
end

local function setup(frame)
  local options = Spring.GetModOptions() or {}
  if not enabled(options[OPT_ENABLE]) then return end
  local teamID = tonumber(options[OPT_TEAM])
  local enemyTeamID = tonumber(options[OPT_ENEMY_TEAM])
  if not liveTeam(teamID) or not liveTeam(enemyTeamID) or teamID == enemyTeamID then
    return fail("invalid_distinct_live_teams")
  end

  local factory, factoryError = create("armvp", 1024, 1024, "south", teamID)
  if not factory then return fail(factoryError) end
  local builder, builderError = create("armck", 1248, 1024, "south", teamID)
  if not builder then return fail(builderError) end
  local enemy, enemyError = create("corak", 1536, 1024, "north", enemyTeamID)
  if not enemy then return fail(enemyError) end
  if factory == builder or factory == enemy or builder == enemy then
    return fail("actor_identity_collision")
  end

  Spring.SetTeamResource(teamID, "ms", 10000)
  Spring.SetTeamResource(teamID, "es", 10000)
  Spring.SetTeamResource(teamID, "m", 8000)
  Spring.SetTeamResource(teamID, "e", 8000)
  Spring.SetUnitAlwaysVisible(enemy, true)

  local oldDefinition = UnitDefNames.armfav
  local distinctDefinition = UnitDefNames.armflash
  if not oldDefinition or not distinctDefinition or oldDefinition.id == distinctDefinition.id then
    return fail("production_definitions_missing_or_equal")
  end
  if not prearm then return fail("prearm_nonce_required") end
  for _, path in ipairs(paths) do
    local bytes = VFS.LoadFile(path, VFS.ZIP)
    if type(bytes) ~= "string" or #bytes == 0 or #bytes > 131072 then return fail("vfs_content_bound") end
    local hash = VFS.CalculateHash(bytes, 1) -- actual engine SHA-512, never SHA-256
    if type(hash) ~= "string" or #hash ~= 128 or not hash:match("^[0-9a-f]+$") then return fail("vfs_hash") end
    observe("content", frame, {path=hex(path), bytes=#bytes, sha512=hash})
  end
  if not hex(Game.mapName) or not hex(Game.gameName) or type(Game.mapChecksum) ~= "string"
    or type(Game.modChecksum) ~= "string" then return fail("archive_identity") end
  observe("archives", frame, {map=hex(Game.mapName), game=hex(Game.gameName),
    map_sha512=Game.mapChecksum, game_sha512=Game.modChecksum})
  selected = {factory=factory, builder=builder, enemy=enemy, team=teamID, enemyTeam=enemyTeamID,
    seed=oldDefinition.id, product=distinctDefinition.id}
  GG.BARCPrearmEmpty = {nonce=nonce, factory=factory, team=teamID, observedFrame=nil}
  observe("actors", frame, {team=teamID, enemy=enemyTeamID, factory=factory, builder=builder,
    target=enemy, seed=oldDefinition.id, product=distinctDefinition.id})
  phase = "await-empty"
end

local function enqueue(frame)
  local factory, oldDefinition = selected.factory, {id=selected.seed}
  -- Set passive before issuing any order; a refusal can never trigger a retry.
  done = true
  phase = "passive"
  for index = 1, OLD_PRODUCTION_COUNT do
    local optionsBits = 0
    if Spring.GiveOrderToUnit(factory, -oldDefinition.id, {}, optionsBits) == false then
      return fail("old_production_order_refused")
    end
    observe("order", frame, {factory=factory, ordinal=index, definition=oldDefinition.id, count=1, options=optionsBits})
  end
  local queue = Spring.GetFactoryCommands(factory, OLD_PRODUCTION_COUNT + 1) or {}
  if #queue ~= OLD_PRODUCTION_COUNT then return fail("old_production_count_changed") end
  for index = 1, OLD_PRODUCTION_COUNT do
    if not queue[index] or queue[index].id ~= -oldDefinition.id then
      return fail("old_production_order_changed")
    end
  end

  for index = 1, OLD_PRODUCTION_COUNT do
    local command = queue[index]
    if type(command.tag) ~= "number" or command.tag < 0 or command.tag % 1 ~= 0
      or type(command.options) ~= "table" or command.options.coded ~= 0 then return fail("queue_fields") end
    observe("queue", frame, {factory=factory, ordinal=index, definition=oldDefinition.id,
      tag=command.tag, options=command.options.coded})
  end
  observe("complete", frame, {factory=factory, count=OLD_PRODUCTION_COUNT,
    empty_frame=GG.BARCPrearmEmpty.observedFrame})
  local teamID, enemyTeamID, builder, enemy = selected.team, selected.enemyTeam, selected.builder, selected.enemy
  local distinctDefinition = {id=selected.product}

  done = true
  Spring.Echo(string.format(
    "%s kind=ready frame=%d team=%d enemy_team=%d factory=%d builder=%d visible_enemy=%d old_definition=%d distinct_product=%d old_production_count=%d post_ready_mutation=zero",
    PREFIX, frame, teamID, enemyTeamID, factory, builder, enemy,
    oldDefinition.id, distinctDefinition.id, OLD_PRODUCTION_COUNT))
end

function gadget:GameFrame(frame)
  if done or frame < 1 then return end
  if phase == "actors" then return setup(frame) end
  if phase == "await-empty" then
    local observed = GG.BARCPrearmEmpty
    if observed and observed.nonce == nonce and observed.factory == selected.factory
      and type(observed.observedFrame) == "number" and frame > observed.observedFrame then
      observe("empty", observed.observedFrame, {factory=selected.factory, observed_frame=observed.observedFrame})
      enqueue(frame)
    end
  end
end
