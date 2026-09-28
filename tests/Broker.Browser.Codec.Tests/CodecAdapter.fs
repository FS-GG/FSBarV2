module Broker.Browser.Codec.Tests.CodecAdapter

open Fable.Core
open Fable.Core.JsInterop

[<Import("v1", "../../src/Broker.Browser.Contracts/generated/codec.js")>]
let private v1: obj = jsNative

[<Import("canonicalObject", "../../src/Broker.Browser.Contracts/generated/codec.js")>]
let private canonicalObject (messageType: obj) (bytes: obj) : obj = jsNative

[<Import("encodeObject", "../../src/Broker.Browser.Contracts/generated/codec.js")>]
let private encodeObject (messageType: obj) (value: obj) : obj = jsNative

[<Emit("$0[$1]")>]
let property (value: obj) (name: string) : obj = jsNative

[<Emit("$0[$1]")>]
let stringProperty (value: obj) (name: string) : string = jsNative

[<Emit("$0[$1]")>]
let numberProperty (value: obj) (name: string) : float = jsNative

[<Emit("$0.length")>]
let length (value: obj) : int = jsNative

[<Emit("Object.hasOwn($0, $1)")>]
let hasOwn (value: obj) (name: string) : bool = jsNative

[<Emit("JSON.stringify($0)")>]
let json (value: obj) : string = jsNative

[<Emit("JSON.parse($0)")>]
let parseJson (value: string) : obj = jsNative

[<Emit("Buffer.from($0).equals(Buffer.from($1))")>]
let bytesEqual (left: obj) (right: obj) : bool = jsNative

let private messageType (name: string) =
    let typeName =
        if name.StartsWith("auth-") then
            "ClientEnvelope"
        elif name = "guest-no-action-ack" || name = "guest-move-preview" then
            "GuestResponse"
        elif name.StartsWith("guest-") then
            "GuestRequest"
        else
            "ServerEnvelope"

    property v1 typeName

let decode name bytes = canonicalObject (messageType name) bytes

let reencode name canonical = encodeObject (messageType name) canonical
