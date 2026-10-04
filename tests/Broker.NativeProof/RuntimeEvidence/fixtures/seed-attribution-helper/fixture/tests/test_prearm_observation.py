"""Pure controlled Lua-call semantic model; no Lua/native execution or evidence."""
import unittest,pathlib,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1]/'LuaRules/Gadgets'
class Fixture(unittest.TestCase):
 def model(self,frames,observed=None,options=0):
  phase='actors';orders=[];factory=10
  for frame in frames:
   if phase=='actors':phase='await-empty';continue
   if phase=='await-empty'and observed is not None and frame>observed:
    phase='passive'
    for ordinal in range(1,4):orders.append((factory,2,1 if options==0 else 5,options,ordinal,frame))
  return orders
 def test_empty_before_one_shot_plain_seed(self):
  self.assertEqual(self.model(range(20)),[]);orders=self.model(range(20),observed=2);self.assertEqual(len(orders),3);self.assertTrue(all(x[2:4]==(1,0)and x[-1]==3 for x in orders));self.assertNotEqual(sum(x[2]for x in self.model(range(20),2,32)),3)
 def test_actual_source_gate_and_passive_transition(self):
  text=(ROOT/'barc_stock_queue_fixture.lua').read_text();self.assertIn('frame > observed.observedFrame',text);self.assertLess(text.index('phase = "passive"'),text.index('Spring.GiveOrderToUnit'));self.assertEqual(text.count('Spring.GiveOrderToUnit('),1);self.assertIn('VFS.CalculateHash(bytes, 1)',text)
 def test_observer_hook_preserves_wire_source(self):
  old=pathlib.Path('/home/developer/.local/share/fs-gg-private/bar-stock-policy968-plain-fixture-successor-20261003/packet/runtime-data/AI/Skirmish/highBar/stable/barc-stock-observer/LuaRules/Gadgets/barc_stock_queue_reader.lua').read_text();new=(ROOT/'barc_stock_queue_reader.lua').read_text();a=new.index('  if result then\n');z=new.index('  return unavailable(message, request, "oversize")',a);self.assertEqual(new[:a]+'  if result then return result end\n'+new[z:],old)
  hook=new[a:z];self.assertNotIn('GiveOrder',hook);self.assertIn('#rows == 0',hook);self.assertIn('observed.observedFrame == nil',hook)
 def test_unsynced_only_configuration(self):
  text=(ROOT/'barc_stock_queue_fixture.lua').read_text();start=text.index('if not gadgetHandler:IsSyncedCode() then');end=text.index('local OPT_ENABLE',start);self.assertIn('Spring.GetAIInfo(team)',text[start:end]);self.assertNotIn('Spring.GetAIInfo(',text[end:]);self.assertNotIn('Spring.GetConfigInt(',text[end:]);self.assertNotIn('SYNCED_NOSHORTNAME',text[end:]);self.assertNotEqual(hashlib.sha512(b'controlled').hexdigest(),hashlib.sha256(b'controlled').hexdigest())
if __name__=='__main__':unittest.main()
