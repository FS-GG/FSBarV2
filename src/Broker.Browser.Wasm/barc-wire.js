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

export function requestIdentity(bytesLike) {
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

export function validateGuestResponse(bytesLike, expected) {
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
