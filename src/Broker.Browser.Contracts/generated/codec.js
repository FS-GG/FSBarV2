import Long from "long";
import protobuf from "protobufjs/minimal.js";
import { barc } from "./barc_browser.js";

protobuf.util.Long = Long;
protobuf.configure();

export const v1 = barc.browser.v1;

export function canonicalObject(type, bytes) {
  return type.toObject(type.decode(bytes), {
    longs: String,
    enums: String,
    bytes: String,
    defaults: false,
    arrays: true,
    oneofs: true
  });
}

export function encodeObject(type, value) {
  return type.encode(type.fromObject(value)).finish();
}
