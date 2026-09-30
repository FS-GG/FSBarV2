const invalid = (message) => { throw new Error(`invalid BARC protobuf: ${message}`); };

class Reader {
  constructor(bytes) { this.bytes = bytes; this.index = 0; }
  get done() { return this.index === this.bytes.length; }
  byte() { if (this.index >= this.bytes.length) invalid("truncated input"); return this.bytes[this.index++]; }
  varint() {
    let value = 0n;
    for (let shift = 0n; shift <= 63n; shift += 7n) {
      const byte = this.byte();
      if (shift === 63n && byte > 1) invalid("varint overflow");
      value |= BigInt(byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) return value;
    }
    invalid("unterminated varint");
  }
  lengthDelimited() {
    const length = Number(this.varint());
    const end = this.index + length;
    if (!Number.isSafeInteger(length) || end > this.bytes.length) invalid("truncated length-delimited field");
    const value = this.bytes.subarray(this.index, end);
    this.index = end;
    return value;
  }
  fixed32() {
    const end = this.index + 4;
    if (end > this.bytes.length) invalid("truncated fixed32 field");
    const value = new DataView(this.bytes.buffer, this.bytes.byteOffset + this.index, 4).getFloat32(0, true);
    this.index = end;
    return value;
  }
  skip(wire) {
    if (wire === 0) this.varint();
    else if (wire === 1) this.index += 8;
    else if (wire === 2) this.lengthDelimited();
    else if (wire === 5) this.index += 4;
    else invalid("unsupported wire type");
    if (this.index > this.bytes.length) invalid("truncated field");
  }
}

const equalBytes = (left, right) => left.length === right.length && left.every((value, index) => value === right[index]);

const validatePosition = (bytes) => {
  const reader = new Reader(bytes);
  while (!reader.done) {
    const key = reader.varint();
    const field = Number(key >> 3n);
    const wire = Number(key & 7n);
    if ((field === 1 || field === 2 || field === 3) && wire === 5) {
      if (!Number.isFinite(reader.fixed32())) invalid("Move ground target contains a non-finite coordinate");
    } else reader.skip(wire);
  }
};

const validateMove = (bytes) => {
  const reader = new Reader(bytes);
  const unitIds = [];
  let groundTarget = null;
  while (!reader.done) {
    const key = reader.varint();
    const field = Number(key >> 3n);
    const wire = Number(key & 7n);
    if (field === 1 && wire === 0) unitIds.push(reader.varint());
    else if (field === 1 && wire === 2) {
      const packed = new Reader(reader.lengthDelimited());
      while (!packed.done) unitIds.push(packed.varint());
    } else if (field === 2 && wire === 2) groundTarget = reader.lengthDelimited();
    else reader.skip(wire);
    if (unitIds.length > 64) invalid("Move preview exceeds its unit identity limit");
  }
  if (unitIds.length === 0 || unitIds.some((value) => value === 0n)) invalid("Move preview requires nonzero unit identities");
  if (new Set(unitIds).size !== unitIds.length) invalid("Move preview contains duplicate unit identities");
  if (groundTarget === null) invalid("Move preview requires a ground target");
  validatePosition(groundTarget);
};

function previewRequestIdentity(bytesLike) {
  const reader = new Reader(Uint8Array.from(bytesLike));
  let requestId;
  let sessionId;
  let contextSequence = 0n;
  while (!reader.done) {
    const key = reader.varint();
    const field = Number(key >> 3n);
    const wire = Number(key & 7n);
    if (field === 1 && wire === 0) requestId = reader.varint();
    else if (field === 2 && wire === 2) sessionId = reader.lengthDelimited();
    else if (field === 3 && wire === 0) contextSequence = reader.varint();
    else reader.skip(wire);
  }
  if (requestId === undefined || sessionId === undefined || sessionId.length === 0) invalid("request identity is incomplete");
  return { requestId, sessionId: Uint8Array.from(sessionId), contextSequence };
}

const liveReference = bytes => {
  const reader = new Reader(bytes); let id = 0n, lifetime = 0n;
  while (!reader.done) { const key = reader.varint(), field = Number(key >> 3n), wire = Number(key & 7n);
    if (field === 1 && wire === 0) id = reader.varint();
    else if (field === 2 && wire === 0) lifetime = reader.varint();
    else reader.skip(wire);
  }
  if (lifetime === 0n) invalid("live unit reference requires a nonzero lifetime");
  return { id, lifetime };
};

const validateBinding = bytes => {
  const reader = new Reader(bytes); let actor = null, revision = 0n; const domains = new Set();
  while (!reader.done) { const key=reader.varint(),field=Number(key>>3n),wire=Number(key&7n);
    if(field===1&&wire===2)actor=liveReference(reader.lengthDelimited());
    else if(field===2&&wire===0)revision=reader.varint();
    else if(field===3&&wire===2){const queue=new Reader(reader.lengthDelimited());let domain=0n,queueRevision=0n;while(!queue.done){const q=queue.varint(),f=Number(q>>3n),w=Number(q&7n);if(f===1&&w===0)domain=queue.varint();else if(f===2&&w===0)queueRevision=queue.varint();else queue.skip(w)}if(![1n,2n,3n].includes(domain)||queueRevision===0n||domains.has(domain.toString()))invalid("tactical queue revision binding is invalid");domains.add(domain.toString())}
    else reader.skip(wire);
  }
  if(!actor||revision===0n)invalid("tactical actor binding is incomplete");return actor;
};

const validateTacticalAction = (field, bytes) => {
  const reader=new Reader(bytes);let definition=0n,count=0n,position=null,reference=null,policy=0n,catalogue=null,catalogueRevision=0n,facing=0n,radius=null,expectedRevision=0n,editKind=0n,domain=0n,editField=0,modeKind=0n,modeValue=0n;
  while(!reader.done){const key=reader.varint(),f=Number(key>>3n),w=Number(key&7n);
    if([13,19].includes(field)&&f===1&&w===0)definition=reader.varint();
    else if(field===19&&f===2&&w===0)count=reader.varint();
    else if((field===13&&f===2||field===18&&f===1||field===20&&f===1)&&w===2)position=reader.lengthDelimited();
    else if([14,15,16,17].includes(field)&&f===1&&w===2)reference=liveReference(reader.lengthDelimited());
    else if(([14,15,16,17].includes(field)&&f===2||field===18&&f===3||field===19&&f===3||field===13&&f===4)&&w===0)policy=reader.varint();
    else if(field===13&&f===3&&w===0)facing=reader.varint();
    else if(field===13&&f===5&&w===2||field===19&&f===4&&w===2)catalogue=reader.lengthDelimited();
    else if(field===13&&f===6&&w===0||field===19&&f===5&&w===0)catalogueRevision=reader.varint();
    else if(field===18&&f===2&&w===5)radius=reader.fixed32();
    else if(field===21&&f===1&&w===0)expectedRevision=reader.varint();
    else if(field===21&&f===2&&w===0)editKind=reader.varint();
    else if(field===21&&f===3&&w===0)domain=reader.varint();
    else if(field===21&&[10,11,12].includes(f)){editField=f; if(w===2){const insert=new Reader(reader.lengthDelimited());let action=0n;while(!insert.done){const q=insert.varint(),x=Number(q>>3n),y=Number(q&7n);if(x===2&&y===0)action=insert.varint();else insert.skip(y)}if(action<1n||action>13n)invalid("tactical queue insertion action is unknown")}else if(w===0)reader.varint();else reader.skip(w)}
    else if(field===22&&f===1&&w===0)modeKind=reader.varint();
    else if(field===22&&f===2&&w===0)modeValue=reader.varint();
    else reader.skip(w);
  }
  if(position)validatePosition(position);
  if(field===13&&(definition===0n||!position||![1n,2n,3n,4n].includes(facing)||![1n,2n,3n].includes(policy)||!catalogue?.length||catalogueRevision===0n))invalid("tactical Build is incomplete");
  if([14,15,16,17].includes(field)&&(!reference||![1n,2n,3n].includes(policy)))invalid("tactical reference target is incomplete");
  if(field===18&&(!position||!Number.isFinite(radius)||radius<=0||![1n,2n,3n].includes(policy)))invalid("tactical area target is invalid");
  if(field===19&&(definition===0n||count===0n||![1n,2n,3n].includes(policy)||!catalogue?.length||catalogueRevision===0n))invalid("factory production is incomplete");
  if(field===20&&!position)invalid("factory rally position is missing");
  if(field===21&&(expectedRevision===0n||![1n,2n,3n].includes(editKind)||![1n,2n,3n].includes(domain)||editField!==Number(editKind)+9))invalid("tactical queue edit is invalid");
  if(field===22&&(![12n,13n].includes(modeKind)||![1n,2n].includes(modeValue)))invalid("tactical mode is unavailable or invalid");
};

const validateLiveIntent = bytes => {
  const reader = new Reader(bytes), actors = [], bindings = []; let action = null, actionBytes = null;
  while (!reader.done) { const key = reader.varint(), field = Number(key >> 3n), wire = Number(key & 7n);
    if (field === 1 && wire === 2) actors.push(liveReference(reader.lengthDelimited()));
    else if(field===2&&wire===2)bindings.push(validateBinding(reader.lengthDelimited()));
    else if (field >= 10 && field <= 22 && wire === 2) { if (action !== null) invalid("live intent has multiple actions"); action = field; actionBytes = reader.lengthDelimited(); }
    else reader.skip(wire);
    if (actors.length > 64) invalid("live intent exceeds its actor limit");
  }
  if (actors.length === 0 || action === null) invalid("live intent requires actors and one action");
  if (new Set(actors.map(actor => actor.id.toString())).size !== actors.length) invalid("live intent contains duplicate actor identities");
  if(action>=13){if(bindings.length!==actors.length||bindings.some((binding,index)=>binding.id!==actors[index].id||binding.lifetime!==actors[index].lifetime))invalid("tactical intent actor bindings do not match actors");validateTacticalAction(action,actionBytes)}
  if (action === 11) {
    const move = new Reader(actionBytes); let position = null, policy = 0n;
    while (!move.done) { const key = move.varint(), field = Number(key >> 3n), wire = Number(key & 7n);
      if (field === 1 && wire === 2) position = move.lengthDelimited();
      else if (field === 2 && wire === 0) policy = move.varint();
      else move.skip(wire);
    }
    if (position === null || ![1n, 2n].includes(policy)) invalid("live Move requires a position and semantic policy");
    validatePosition(position);
  } else if (action === 12) {
    const attack = new Reader(actionBytes); let target = null;
    while (!attack.done) { const key = attack.varint(), field = Number(key >> 3n), wire = Number(key & 7n);
      if (field === 1 && wire === 2) target = liveReference(attack.lengthDelimited()); else attack.skip(wire);
    }
    if (target === null || actors.some(actor => actor.id === target.id)) invalid("live Attack requires a distinct target reference");
  }
};

function liveRequestIdentity(bytesLike) {
  const reader = new Reader(Uint8Array.from(bytesLike)); let inputId, sessionId, moduleGeneration = 0n, basis;
  while (!reader.done) { const key = reader.varint(), field = Number(key >> 3n), wire = Number(key & 7n);
    if (field === 1 && wire === 2) inputId = reader.lengthDelimited();
    else if (field === 2 && wire === 2) sessionId = reader.lengthDelimited();
    else if (field === 3 && wire === 0) moduleGeneration = reader.varint();
    else if (field === 4 && wire === 2) basis = reader.lengthDelimited();
    else reader.skip(wire);
  }
  if (!inputId?.length || !sessionId?.length || moduleGeneration === 0n || !basis?.length) invalid("live request identity is incomplete");
  return { profile: "live", inputId: Uint8Array.from(inputId), sessionId: Uint8Array.from(sessionId), moduleGeneration, basis: Uint8Array.from(basis) };
}

export function requestIdentity(bytesLike) {
  const bytes = Uint8Array.from(bytesLike);
  return bytes[0] === 0x0a ? liveRequestIdentity(bytes) : { profile: "preview", ...previewRequestIdentity(bytes) };
}

function validatePreviewGuestResponse(bytesLike, expected) {
  const bytes = Uint8Array.from(bytesLike);
  const reader = new Reader(bytes);
  let requestId;
  let sessionId;
  let consumedSequence = 0n;
  let acknowledgment = 0n;
  let kind = 0n;
  let move = null;
  while (!reader.done) {
    const key = reader.varint();
    const field = Number(key >> 3n);
    const wire = Number(key & 7n);
    if (field === 1 && wire === 0) requestId = reader.varint();
    else if (field === 2 && wire === 2) sessionId = reader.lengthDelimited();
    else if (field === 3 && wire === 0) consumedSequence = reader.varint();
    else if (field === 4 && wire === 0) acknowledgment = reader.varint();
    else if (field === 6 && wire === 0) kind = reader.varint();
    else if (field === 10 && wire === 2) move = reader.lengthDelimited();
    else reader.skip(wire);
  }
  if (requestId !== expected.requestId || !equalBytes(sessionId ?? [], expected.sessionId)) invalid("response identity does not match its request");
  if (consumedSequence !== expected.contextSequence) invalid("response consumed sequence does not match its request");
  if (acknowledgment !== 1n) invalid("response did not acknowledge consumption");
  if (!((kind === 0n && move === null) || (kind === 1n && move !== null))) invalid("response preview and intent kind disagree");
  if (move !== null) validateMove(move);
  return bytes;
}

function validateLiveGuestResponse(bytesLike, expected) {
  const bytes = Uint8Array.from(bytesLike), reader = new Reader(bytes);
  let inputId, sessionId, moduleGeneration = 0n, basis, acknowledgment = 0n, intent = null;
  while (!reader.done) { const key = reader.varint(), field = Number(key >> 3n), wire = Number(key & 7n);
    if (field === 1 && wire === 2) inputId = reader.lengthDelimited();
    else if (field === 2 && wire === 2) sessionId = reader.lengthDelimited();
    else if (field === 3 && wire === 0) moduleGeneration = reader.varint();
    else if (field === 4 && wire === 2) basis = reader.lengthDelimited();
    else if (field === 5 && wire === 0) acknowledgment = reader.varint();
    else if (field === 10 && wire === 2) intent = reader.lengthDelimited();
    else reader.skip(wire);
  }
  if (!equalBytes(inputId ?? [], expected.inputId) || !equalBytes(sessionId ?? [], expected.sessionId)
      || moduleGeneration !== expected.moduleGeneration || !equalBytes(basis ?? [], expected.basis)) invalid("live response identity does not match its request");
  if (acknowledgment !== 1n) invalid("live response did not acknowledge consumption");
  if (intent !== null) validateLiveIntent(intent);
  return bytes;
}

export function validateGuestResponse(bytesLike, expected) {
  return expected.profile === "live" ? validateLiveGuestResponse(bytesLike, expected) : validatePreviewGuestResponse(bytesLike, expected);
}
