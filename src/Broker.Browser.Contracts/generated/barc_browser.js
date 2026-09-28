/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
const $Object = $util.global.Object, $undefined = $util.global.undefined, $Error = $util.global.Error, $RangeError = $util.global.RangeError, $TypeError = $util.global.TypeError, $Number = $util.global.Number, $String = $util.global.String, $Array = $util.global.Array, $parseInt = $util.global.parseInt, $BigInt = $util.global.BigInt, $isFinite = $util.global.isFinite, $Boolean = $util.global.Boolean;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const barc = $root.barc = (() => {

    /**
     * Namespace barc.
     * @exports barc
     * @namespace
     */
    const barc = {};

    barc.browser = (function() {

        /**
         * Namespace browser.
         * @memberof barc
         * @namespace
         */
        const browser = {};

        browser.v1 = (function() {

            /**
             * Namespace v1.
             * @memberof barc.browser
             * @namespace
             */
            const v1 = {};

            /**
             * PreviewMode enum.
             * @name barc.browser.v1.PreviewMode
             * @enum {number}
             * @property {number} PREVIEW_MODE_UNSPECIFIED=0 PREVIEW_MODE_UNSPECIFIED value
             * @property {number} PREVIEW_MODE_READ_ONLY=1 PREVIEW_MODE_READ_ONLY value
             */
            v1.PreviewMode = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "PREVIEW_MODE_UNSPECIFIED"] = 0;
                values[valuesById[1] = "PREVIEW_MODE_READ_ONLY"] = 1;
                return values;
            })();

            /**
             * ValidityStatus enum.
             * @name barc.browser.v1.ValidityStatus
             * @enum {number}
             * @property {number} VALIDITY_STATUS_UNSPECIFIED=0 VALIDITY_STATUS_UNSPECIFIED value
             * @property {number} VALIDITY_STATUS_CURRENT=1 VALIDITY_STATUS_CURRENT value
             * @property {number} VALIDITY_STATUS_STALE=2 VALIDITY_STATUS_STALE value
             */
            v1.ValidityStatus = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "VALIDITY_STATUS_UNSPECIFIED"] = 0;
                values[valuesById[1] = "VALIDITY_STATUS_CURRENT"] = 1;
                values[valuesById[2] = "VALIDITY_STATUS_STALE"] = 2;
                return values;
            })();

            /**
             * ObservationKind enum.
             * @name barc.browser.v1.ObservationKind
             * @enum {number}
             * @property {number} OBSERVATION_KIND_UNSPECIFIED=0 OBSERVATION_KIND_UNSPECIFIED value
             * @property {number} OBSERVATION_KIND_OWN=1 OBSERVATION_KIND_OWN value
             * @property {number} OBSERVATION_KIND_VISUAL=2 OBSERVATION_KIND_VISUAL value
             * @property {number} OBSERVATION_KIND_RADAR=3 OBSERVATION_KIND_RADAR value
             */
            v1.ObservationKind = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "OBSERVATION_KIND_UNSPECIFIED"] = 0;
                values[valuesById[1] = "OBSERVATION_KIND_OWN"] = 1;
                values[valuesById[2] = "OBSERVATION_KIND_VISUAL"] = 2;
                values[valuesById[3] = "OBSERVATION_KIND_RADAR"] = 3;
                return values;
            })();

            /**
             * IntentKind enum.
             * @name barc.browser.v1.IntentKind
             * @enum {number}
             * @property {number} INTENT_KIND_UNSPECIFIED=0 INTENT_KIND_UNSPECIFIED value
             * @property {number} INTENT_KIND_MOVE=1 INTENT_KIND_MOVE value
             */
            v1.IntentKind = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "INTENT_KIND_UNSPECIFIED"] = 0;
                values[valuesById[1] = "INTENT_KIND_MOVE"] = 1;
                return values;
            })();

            /**
             * GuestAckStatus enum.
             * @name barc.browser.v1.GuestAckStatus
             * @enum {number}
             * @property {number} GUEST_ACK_STATUS_UNSPECIFIED=0 GUEST_ACK_STATUS_UNSPECIFIED value
             * @property {number} GUEST_ACK_STATUS_CONSUMED=1 GUEST_ACK_STATUS_CONSUMED value
             * @property {number} GUEST_ACK_STATUS_REFUSED=2 GUEST_ACK_STATUS_REFUSED value
             */
            v1.GuestAckStatus = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "GUEST_ACK_STATUS_UNSPECIFIED"] = 0;
                values[valuesById[1] = "GUEST_ACK_STATUS_CONSUMED"] = 1;
                values[valuesById[2] = "GUEST_ACK_STATUS_REFUSED"] = 2;
                return values;
            })();

            v1.Limits = (function() {

                /**
                 * Properties of a Limits.
                 * @typedef {Object} barc.browser.v1.Limits.$Properties
                 * @property {number|null} [maxFrameBytes] Limits maxFrameBytes
                 * @property {number|null} [authTimeoutMs] Limits authTimeoutMs
                 * @property {number|null} [maxEntities] Limits maxEntities
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Limits.
                 * @memberof barc.browser.v1
                 * @interface ILimits
                 * @augments barc.browser.v1.Limits.$Properties
                 * @deprecated Use barc.browser.v1.Limits.$Properties instead.
                 */

                /**
                 * Shape of a Limits.
                 * @typedef {barc.browser.v1.Limits.$Properties} barc.browser.v1.Limits.$Shape
                 */

                /**
                 * Constructs a new Limits.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a Limits.
                 * @constructor
                 * @param {barc.browser.v1.Limits.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Limits = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Limits maxFrameBytes.
                 * @member {number} maxFrameBytes
                 * @memberof barc.browser.v1.Limits
                 * @instance
                 */
                Limits.prototype.maxFrameBytes = 0;

                /**
                 * Limits authTimeoutMs.
                 * @member {number} authTimeoutMs
                 * @memberof barc.browser.v1.Limits
                 * @instance
                 */
                Limits.prototype.authTimeoutMs = 0;

                /**
                 * Limits maxEntities.
                 * @member {number} maxEntities
                 * @memberof barc.browser.v1.Limits
                 * @instance
                 */
                Limits.prototype.maxEntities = 0;

                /**
                 * Encodes the specified Limits message. Does not implicitly {@link barc.browser.v1.Limits.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.Limits
                 * @static
                 * @param {barc.browser.v1.Limits.$Properties} message Limits message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Limits.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.maxFrameBytes != null && $Object.hasOwnProperty.call(message, "maxFrameBytes") && message.maxFrameBytes !== 0)
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.maxFrameBytes);
                    if (message.authTimeoutMs != null && $Object.hasOwnProperty.call(message, "authTimeoutMs") && message.authTimeoutMs !== 0)
                        writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.authTimeoutMs);
                    if (message.maxEntities != null && $Object.hasOwnProperty.call(message, "maxEntities") && message.maxEntities !== 0)
                        writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.maxEntities);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified Limits message, length delimited. Does not implicitly {@link barc.browser.v1.Limits.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.Limits
                 * @static
                 * @param {barc.browser.v1.Limits.$Properties} message Limits message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Limits.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a Limits message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.Limits
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.Limits & barc.browser.v1.Limits.$Shape} Limits
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Limits.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.Limits();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.maxFrameBytes = value;
                                else
                                    delete message.maxFrameBytes;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.authTimeoutMs = value;
                                else
                                    delete message.authTimeoutMs;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.maxEntities = value;
                                else
                                    delete message.maxEntities;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a Limits message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.Limits
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.Limits & barc.browser.v1.Limits.$Shape} Limits
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Limits.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a Limits message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.Limits
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.Limits} Limits
                 */
                Limits.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.Limits)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.Limits: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.Limits();
                    if (object.maxFrameBytes != null)
                        if ($Number(object.maxFrameBytes) !== 0)
                            message.maxFrameBytes = object.maxFrameBytes >>> 0;
                    if (object.authTimeoutMs != null)
                        if ($Number(object.authTimeoutMs) !== 0)
                            message.authTimeoutMs = object.authTimeoutMs >>> 0;
                    if (object.maxEntities != null)
                        if ($Number(object.maxEntities) !== 0)
                            message.maxEntities = object.maxEntities >>> 0;
                    return message;
                };

                /**
                 * Creates a plain object from a Limits message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.Limits
                 * @static
                 * @param {barc.browser.v1.Limits} message Limits
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Limits.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.maxFrameBytes = 0;
                        object.authTimeoutMs = 0;
                        object.maxEntities = 0;
                    }
                    if (message.maxFrameBytes != null && $Object.hasOwnProperty.call(message, "maxFrameBytes"))
                        object.maxFrameBytes = message.maxFrameBytes;
                    if (message.authTimeoutMs != null && $Object.hasOwnProperty.call(message, "authTimeoutMs"))
                        object.authTimeoutMs = message.authTimeoutMs;
                    if (message.maxEntities != null && $Object.hasOwnProperty.call(message, "maxEntities"))
                        object.maxEntities = message.maxEntities;
                    return object;
                };

                /**
                 * Converts this Limits to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.Limits
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Limits.prototype.toJSON = function() {
                    return Limits.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for Limits
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.Limits
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                Limits.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.Limits";
                };

                return Limits;
            })();

            v1.ClientAuth = (function() {

                /**
                 * Properties of a ClientAuth.
                 * @typedef {Object} barc.browser.v1.ClientAuth.$Properties
                 * @property {string|null} [game] ClientAuth game
                 * @property {string|null} [protocolVersion] ClientAuth protocolVersion
                 * @property {string|null} [profile] ClientAuth profile
                 * @property {string|null} [credential] ClientAuth credential
                 * @property {string|null} [origin] ClientAuth origin
                 * @property {Uint8Array|null} [expectedSessionId] ClientAuth expectedSessionId
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a ClientAuth.
                 * @memberof barc.browser.v1
                 * @interface IClientAuth
                 * @augments barc.browser.v1.ClientAuth.$Properties
                 * @deprecated Use barc.browser.v1.ClientAuth.$Properties instead.
                 */

                /**
                 * Shape of a ClientAuth.
                 * @typedef {barc.browser.v1.ClientAuth.$Properties} barc.browser.v1.ClientAuth.$Shape
                 */

                /**
                 * Constructs a new ClientAuth.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a ClientAuth.
                 * @constructor
                 * @param {barc.browser.v1.ClientAuth.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const ClientAuth = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * ClientAuth game.
                 * @member {string} game
                 * @memberof barc.browser.v1.ClientAuth
                 * @instance
                 */
                ClientAuth.prototype.game = "";

                /**
                 * ClientAuth protocolVersion.
                 * @member {string} protocolVersion
                 * @memberof barc.browser.v1.ClientAuth
                 * @instance
                 */
                ClientAuth.prototype.protocolVersion = "";

                /**
                 * ClientAuth profile.
                 * @member {string} profile
                 * @memberof barc.browser.v1.ClientAuth
                 * @instance
                 */
                ClientAuth.prototype.profile = "";

                /**
                 * ClientAuth credential.
                 * @member {string} credential
                 * @memberof barc.browser.v1.ClientAuth
                 * @instance
                 */
                ClientAuth.prototype.credential = "";

                /**
                 * ClientAuth origin.
                 * @member {string} origin
                 * @memberof barc.browser.v1.ClientAuth
                 * @instance
                 */
                ClientAuth.prototype.origin = "";

                /**
                 * ClientAuth expectedSessionId.
                 * @member {Uint8Array} expectedSessionId
                 * @memberof barc.browser.v1.ClientAuth
                 * @instance
                 */
                ClientAuth.prototype.expectedSessionId = $util.newBuffer([]);

                /**
                 * Encodes the specified ClientAuth message. Does not implicitly {@link barc.browser.v1.ClientAuth.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.ClientAuth
                 * @static
                 * @param {barc.browser.v1.ClientAuth.$Properties} message ClientAuth message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ClientAuth.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.game != null && $Object.hasOwnProperty.call(message, "game") && message.game !== "")
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.game);
                    if (message.protocolVersion != null && $Object.hasOwnProperty.call(message, "protocolVersion") && message.protocolVersion !== "")
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.protocolVersion);
                    if (message.profile != null && $Object.hasOwnProperty.call(message, "profile") && message.profile !== "")
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.profile);
                    if (message.credential != null && $Object.hasOwnProperty.call(message, "credential") && message.credential !== "")
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.credential);
                    if (message.origin != null && $Object.hasOwnProperty.call(message, "origin") && message.origin !== "")
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.origin);
                    if (message.expectedSessionId != null && $Object.hasOwnProperty.call(message, "expectedSessionId") && message.expectedSessionId.length)
                        writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.expectedSessionId);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ClientAuth message, length delimited. Does not implicitly {@link barc.browser.v1.ClientAuth.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.ClientAuth
                 * @static
                 * @param {barc.browser.v1.ClientAuth.$Properties} message ClientAuth message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ClientAuth.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a ClientAuth message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.ClientAuth
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ClientAuth & barc.browser.v1.ClientAuth.$Shape} ClientAuth
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ClientAuth.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.ClientAuth();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.game = value;
                                else
                                    delete message.game;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.protocolVersion = value;
                                else
                                    delete message.protocolVersion;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.profile = value;
                                else
                                    delete message.profile;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.credential = value;
                                else
                                    delete message.credential;
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.origin = value;
                                else
                                    delete message.origin;
                                continue;
                            }
                        case 6: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.expectedSessionId = value;
                                else
                                    delete message.expectedSessionId;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a ClientAuth message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.ClientAuth
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ClientAuth & barc.browser.v1.ClientAuth.$Shape} ClientAuth
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ClientAuth.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a ClientAuth message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.ClientAuth
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.ClientAuth} ClientAuth
                 */
                ClientAuth.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.ClientAuth)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.ClientAuth: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.ClientAuth();
                    if (object.game != null)
                        if (typeof object.game !== "string" || object.game.length)
                            message.game = $String(object.game);
                    if (object.protocolVersion != null)
                        if (typeof object.protocolVersion !== "string" || object.protocolVersion.length)
                            message.protocolVersion = $String(object.protocolVersion);
                    if (object.profile != null)
                        if (typeof object.profile !== "string" || object.profile.length)
                            message.profile = $String(object.profile);
                    if (object.credential != null)
                        if (typeof object.credential !== "string" || object.credential.length)
                            message.credential = $String(object.credential);
                    if (object.origin != null)
                        if (typeof object.origin !== "string" || object.origin.length)
                            message.origin = $String(object.origin);
                    if (object.expectedSessionId != null)
                        if (object.expectedSessionId.length)
                            if (typeof object.expectedSessionId === "string")
                                $util.base64.decode(object.expectedSessionId, message.expectedSessionId = $util.newBuffer($util.base64.length(object.expectedSessionId)), 0);
                            else if (object.expectedSessionId.length >= 0)
                                message.expectedSessionId = object.expectedSessionId;
                    return message;
                };

                /**
                 * Creates a plain object from a ClientAuth message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.ClientAuth
                 * @static
                 * @param {barc.browser.v1.ClientAuth} message ClientAuth
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ClientAuth.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.game = "";
                        object.protocolVersion = "";
                        object.profile = "";
                        object.credential = "";
                        object.origin = "";
                        if (options.bytes === $String)
                            object.expectedSessionId = "";
                        else {
                            object.expectedSessionId = [];
                            if (options.bytes !== $Array)
                                object.expectedSessionId = $util.newBuffer(object.expectedSessionId);
                        }
                    }
                    if (message.game != null && $Object.hasOwnProperty.call(message, "game"))
                        object.game = message.game;
                    if (message.protocolVersion != null && $Object.hasOwnProperty.call(message, "protocolVersion"))
                        object.protocolVersion = message.protocolVersion;
                    if (message.profile != null && $Object.hasOwnProperty.call(message, "profile"))
                        object.profile = message.profile;
                    if (message.credential != null && $Object.hasOwnProperty.call(message, "credential"))
                        object.credential = message.credential;
                    if (message.origin != null && $Object.hasOwnProperty.call(message, "origin"))
                        object.origin = message.origin;
                    if (message.expectedSessionId != null && $Object.hasOwnProperty.call(message, "expectedSessionId"))
                        object.expectedSessionId = options.bytes === $String ? $util.base64.encode(message.expectedSessionId, 0, message.expectedSessionId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.expectedSessionId) : message.expectedSessionId;
                    return object;
                };

                /**
                 * Converts this ClientAuth to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.ClientAuth
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ClientAuth.prototype.toJSON = function() {
                    return ClientAuth.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for ClientAuth
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.ClientAuth
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                ClientAuth.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.ClientAuth";
                };

                return ClientAuth;
            })();

            v1.Bootstrap = (function() {

                /**
                 * Properties of a Bootstrap.
                 * @typedef {Object} barc.browser.v1.Bootstrap.$Properties
                 * @property {string|null} [game] Bootstrap game
                 * @property {string|null} [protocolVersion] Bootstrap protocolVersion
                 * @property {string|null} [profile] Bootstrap profile
                 * @property {Uint8Array|null} [sessionId] Bootstrap sessionId
                 * @property {string|null} [perspectiveId] Bootstrap perspectiveId
                 * @property {barc.browser.v1.PreviewMode|null} [mode] Bootstrap mode
                 * @property {barc.browser.v1.Validity.$Properties|null} [validity] Bootstrap validity
                 * @property {barc.browser.v1.Limits.$Properties|null} [limits] Bootstrap limits
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Bootstrap.
                 * @memberof barc.browser.v1
                 * @interface IBootstrap
                 * @augments barc.browser.v1.Bootstrap.$Properties
                 * @deprecated Use barc.browser.v1.Bootstrap.$Properties instead.
                 */

                /**
                 * Shape of a Bootstrap.
                 * @typedef {barc.browser.v1.Bootstrap.$Properties} barc.browser.v1.Bootstrap.$Shape
                 */

                /**
                 * Constructs a new Bootstrap.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a Bootstrap.
                 * @constructor
                 * @param {barc.browser.v1.Bootstrap.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Bootstrap = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Bootstrap game.
                 * @member {string} game
                 * @memberof barc.browser.v1.Bootstrap
                 * @instance
                 */
                Bootstrap.prototype.game = "";

                /**
                 * Bootstrap protocolVersion.
                 * @member {string} protocolVersion
                 * @memberof barc.browser.v1.Bootstrap
                 * @instance
                 */
                Bootstrap.prototype.protocolVersion = "";

                /**
                 * Bootstrap profile.
                 * @member {string} profile
                 * @memberof barc.browser.v1.Bootstrap
                 * @instance
                 */
                Bootstrap.prototype.profile = "";

                /**
                 * Bootstrap sessionId.
                 * @member {Uint8Array} sessionId
                 * @memberof barc.browser.v1.Bootstrap
                 * @instance
                 */
                Bootstrap.prototype.sessionId = $util.newBuffer([]);

                /**
                 * Bootstrap perspectiveId.
                 * @member {string} perspectiveId
                 * @memberof barc.browser.v1.Bootstrap
                 * @instance
                 */
                Bootstrap.prototype.perspectiveId = "";

                /**
                 * Bootstrap mode.
                 * @member {barc.browser.v1.PreviewMode} mode
                 * @memberof barc.browser.v1.Bootstrap
                 * @instance
                 */
                Bootstrap.prototype.mode = 0;

                /**
                 * Bootstrap validity.
                 * @member {barc.browser.v1.Validity.$Properties|null|undefined} validity
                 * @memberof barc.browser.v1.Bootstrap
                 * @instance
                 */
                Bootstrap.prototype.validity = null;

                /**
                 * Bootstrap limits.
                 * @member {barc.browser.v1.Limits.$Properties|null|undefined} limits
                 * @memberof barc.browser.v1.Bootstrap
                 * @instance
                 */
                Bootstrap.prototype.limits = null;

                /**
                 * Encodes the specified Bootstrap message. Does not implicitly {@link barc.browser.v1.Bootstrap.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.Bootstrap
                 * @static
                 * @param {barc.browser.v1.Bootstrap.$Properties} message Bootstrap message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Bootstrap.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.game != null && $Object.hasOwnProperty.call(message, "game") && message.game !== "")
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.game);
                    if (message.protocolVersion != null && $Object.hasOwnProperty.call(message, "protocolVersion") && message.protocolVersion !== "")
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.protocolVersion);
                    if (message.profile != null && $Object.hasOwnProperty.call(message, "profile") && message.profile !== "")
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.profile);
                    if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId.length)
                        writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.sessionId);
                    if (message.perspectiveId != null && $Object.hasOwnProperty.call(message, "perspectiveId") && message.perspectiveId !== "")
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.perspectiveId);
                    if (message.mode != null && $Object.hasOwnProperty.call(message, "mode") && message.mode !== 0)
                        writer.uint32(/* id 6, wireType 0 =*/48).int32(message.mode);
                    if (message.validity != null && $Object.hasOwnProperty.call(message, "validity"))
                        $root.barc.browser.v1.Validity.encode(message.validity, writer.uint32(/* id 7, wireType 2 =*/58).fork(), _depth + 1).ldelim();
                    if (message.limits != null && $Object.hasOwnProperty.call(message, "limits"))
                        $root.barc.browser.v1.Limits.encode(message.limits, writer.uint32(/* id 8, wireType 2 =*/66).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified Bootstrap message, length delimited. Does not implicitly {@link barc.browser.v1.Bootstrap.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.Bootstrap
                 * @static
                 * @param {barc.browser.v1.Bootstrap.$Properties} message Bootstrap message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Bootstrap.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a Bootstrap message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.Bootstrap
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.Bootstrap & barc.browser.v1.Bootstrap.$Shape} Bootstrap
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Bootstrap.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.Bootstrap();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.game = value;
                                else
                                    delete message.game;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.protocolVersion = value;
                                else
                                    delete message.protocolVersion;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.profile = value;
                                else
                                    delete message.profile;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.sessionId = value;
                                else
                                    delete message.sessionId;
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.perspectiveId = value;
                                else
                                    delete message.perspectiveId;
                                continue;
                            }
                        case 6: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.int32())
                                    message.mode = value;
                                else
                                    delete message.mode;
                                continue;
                            }
                        case 7: {
                                if (wireType !== 2)
                                    break;
                                message.validity = $root.barc.browser.v1.Validity.decode(reader, reader.uint32(), $undefined, _depth + 1, message.validity);
                                continue;
                            }
                        case 8: {
                                if (wireType !== 2)
                                    break;
                                message.limits = $root.barc.browser.v1.Limits.decode(reader, reader.uint32(), $undefined, _depth + 1, message.limits);
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a Bootstrap message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.Bootstrap
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.Bootstrap & barc.browser.v1.Bootstrap.$Shape} Bootstrap
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Bootstrap.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a Bootstrap message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.Bootstrap
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.Bootstrap} Bootstrap
                 */
                Bootstrap.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.Bootstrap)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.Bootstrap: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.Bootstrap();
                    if (object.game != null)
                        if (typeof object.game !== "string" || object.game.length)
                            message.game = $String(object.game);
                    if (object.protocolVersion != null)
                        if (typeof object.protocolVersion !== "string" || object.protocolVersion.length)
                            message.protocolVersion = $String(object.protocolVersion);
                    if (object.profile != null)
                        if (typeof object.profile !== "string" || object.profile.length)
                            message.profile = $String(object.profile);
                    if (object.sessionId != null)
                        if (object.sessionId.length)
                            if (typeof object.sessionId === "string")
                                $util.base64.decode(object.sessionId, message.sessionId = $util.newBuffer($util.base64.length(object.sessionId)), 0);
                            else if (object.sessionId.length >= 0)
                                message.sessionId = object.sessionId;
                    if (object.perspectiveId != null)
                        if (typeof object.perspectiveId !== "string" || object.perspectiveId.length)
                            message.perspectiveId = $String(object.perspectiveId);
                    if (object.mode !== 0 && (typeof object.mode !== "string" || $root.barc.browser.v1.PreviewMode[object.mode] !== 0))
                        switch (object.mode) {
                        case "PREVIEW_MODE_UNSPECIFIED":
                        case 0:
                            message.mode = 0;
                            break;
                        case "PREVIEW_MODE_READ_ONLY":
                        case 1:
                            message.mode = 1;
                            break;
                        default:
                            if (typeof object.mode === "number" && (object.mode | 0) === object.mode)
                                message.mode = object.mode;
                        }
                    if (object.validity != null) {
                        if (!$util.isObject(object.validity))
                            throw $TypeError(".barc.browser.v1.Bootstrap.validity: object expected");
                        message.validity = $root.barc.browser.v1.Validity.fromObject(object.validity, _depth + 1);
                    }
                    if (object.limits != null) {
                        if (!$util.isObject(object.limits))
                            throw $TypeError(".barc.browser.v1.Bootstrap.limits: object expected");
                        message.limits = $root.barc.browser.v1.Limits.fromObject(object.limits, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a Bootstrap message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.Bootstrap
                 * @static
                 * @param {barc.browser.v1.Bootstrap} message Bootstrap
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Bootstrap.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.game = "";
                        object.protocolVersion = "";
                        object.profile = "";
                        if (options.bytes === $String)
                            object.sessionId = "";
                        else {
                            object.sessionId = [];
                            if (options.bytes !== $Array)
                                object.sessionId = $util.newBuffer(object.sessionId);
                        }
                        object.perspectiveId = "";
                        object.mode = options.enums === $String ? "PREVIEW_MODE_UNSPECIFIED" : 0;
                        object.validity = null;
                        object.limits = null;
                    }
                    if (message.game != null && $Object.hasOwnProperty.call(message, "game"))
                        object.game = message.game;
                    if (message.protocolVersion != null && $Object.hasOwnProperty.call(message, "protocolVersion"))
                        object.protocolVersion = message.protocolVersion;
                    if (message.profile != null && $Object.hasOwnProperty.call(message, "profile"))
                        object.profile = message.profile;
                    if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                        object.sessionId = options.bytes === $String ? $util.base64.encode(message.sessionId, 0, message.sessionId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.sessionId) : message.sessionId;
                    if (message.perspectiveId != null && $Object.hasOwnProperty.call(message, "perspectiveId"))
                        object.perspectiveId = message.perspectiveId;
                    if (message.mode != null && $Object.hasOwnProperty.call(message, "mode"))
                        object.mode = options.enums === $String ? $root.barc.browser.v1.PreviewMode[message.mode] === $undefined ? message.mode : $root.barc.browser.v1.PreviewMode[message.mode] : message.mode;
                    if (message.validity != null && $Object.hasOwnProperty.call(message, "validity"))
                        object.validity = $root.barc.browser.v1.Validity.toObject(message.validity, options, _depth + 1);
                    if (message.limits != null && $Object.hasOwnProperty.call(message, "limits"))
                        object.limits = $root.barc.browser.v1.Limits.toObject(message.limits, options, _depth + 1);
                    return object;
                };

                /**
                 * Converts this Bootstrap to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.Bootstrap
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Bootstrap.prototype.toJSON = function() {
                    return Bootstrap.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for Bootstrap
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.Bootstrap
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                Bootstrap.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.Bootstrap";
                };

                return Bootstrap;
            })();

            v1.Validity = (function() {

                /**
                 * Properties of a Validity.
                 * @typedef {Object} barc.browser.v1.Validity.$Properties
                 * @property {barc.browser.v1.ValidityStatus|null} [status] Validity status
                 * @property {Long|null} [lastSequence] Validity lastSequence
                 * @property {Long|null} [receivedSequence] Validity receivedSequence
                 * @property {string|null} [detail] Validity detail
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Validity.
                 * @memberof barc.browser.v1
                 * @interface IValidity
                 * @augments barc.browser.v1.Validity.$Properties
                 * @deprecated Use barc.browser.v1.Validity.$Properties instead.
                 */

                /**
                 * Shape of a Validity.
                 * @typedef {barc.browser.v1.Validity.$Properties} barc.browser.v1.Validity.$Shape
                 */

                /**
                 * Constructs a new Validity.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a Validity.
                 * @constructor
                 * @param {barc.browser.v1.Validity.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Validity = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Validity status.
                 * @member {barc.browser.v1.ValidityStatus} status
                 * @memberof barc.browser.v1.Validity
                 * @instance
                 */
                Validity.prototype.status = 0;

                /**
                 * Validity lastSequence.
                 * @member {Long} lastSequence
                 * @memberof barc.browser.v1.Validity
                 * @instance
                 */
                Validity.prototype.lastSequence = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * Validity receivedSequence.
                 * @member {Long|null|undefined} receivedSequence
                 * @memberof barc.browser.v1.Validity
                 * @instance
                 */
                Validity.prototype.receivedSequence = null;

                /**
                 * Validity detail.
                 * @member {string} detail
                 * @memberof barc.browser.v1.Validity
                 * @instance
                 */
                Validity.prototype.detail = "";

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                // Virtual OneOf for proto3 optional field
                $Object.defineProperty(Validity.prototype, "_receivedSequence", {
                    get: $util.oneOfGetter($oneOfFields = ["receivedSequence"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified Validity message. Does not implicitly {@link barc.browser.v1.Validity.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.Validity
                 * @static
                 * @param {barc.browser.v1.Validity.$Properties} message Validity message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Validity.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.status != null && $Object.hasOwnProperty.call(message, "status") && message.status !== 0)
                        writer.uint32(/* id 1, wireType 0 =*/8).int32(message.status);
                    if (message.lastSequence != null && $Object.hasOwnProperty.call(message, "lastSequence") && (typeof message.lastSequence === "object" ? message.lastSequence.low || message.lastSequence.high : message.lastSequence !== 0))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.lastSequence);
                    if (message.receivedSequence != null && $Object.hasOwnProperty.call(message, "receivedSequence"))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.receivedSequence);
                    if (message.detail != null && $Object.hasOwnProperty.call(message, "detail") && message.detail !== "")
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.detail);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified Validity message, length delimited. Does not implicitly {@link barc.browser.v1.Validity.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.Validity
                 * @static
                 * @param {barc.browser.v1.Validity.$Properties} message Validity message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Validity.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a Validity message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.Validity
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.Validity & barc.browser.v1.Validity.$Shape} Validity
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Validity.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.Validity();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.int32())
                                    message.status = value;
                                else
                                    delete message.status;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.lastSequence = value;
                                else
                                    delete message.lastSequence;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 0)
                                    break;
                                message.receivedSequence = reader.uint64();
                                message._receivedSequence = "receivedSequence";
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.detail = value;
                                else
                                    delete message.detail;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a Validity message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.Validity
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.Validity & barc.browser.v1.Validity.$Shape} Validity
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Validity.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a Validity message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.Validity
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.Validity} Validity
                 */
                Validity.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.Validity)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.Validity: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.Validity();
                    if (object.status !== 0 && (typeof object.status !== "string" || $root.barc.browser.v1.ValidityStatus[object.status] !== 0))
                        switch (object.status) {
                        case "VALIDITY_STATUS_UNSPECIFIED":
                        case 0:
                            message.status = 0;
                            break;
                        case "VALIDITY_STATUS_CURRENT":
                        case 1:
                            message.status = 1;
                            break;
                        case "VALIDITY_STATUS_STALE":
                        case 2:
                            message.status = 2;
                            break;
                        default:
                            if (typeof object.status === "number" && (object.status | 0) === object.status)
                                message.status = object.status;
                        }
                    if (object.lastSequence != null)
                        if (typeof object.lastSequence === "object" ? object.lastSequence.low || object.lastSequence.high : $Number(object.lastSequence) !== 0)
                            if ($util.Long)
                                message.lastSequence = $util.Long.fromValue(object.lastSequence, true);
                            else if (typeof object.lastSequence === "string")
                                message.lastSequence = $parseInt(object.lastSequence, 10);
                            else if (typeof object.lastSequence === "number")
                                message.lastSequence = object.lastSequence;
                            else if (typeof object.lastSequence === "object")
                                message.lastSequence = new $util.LongBits(object.lastSequence.low >>> 0, object.lastSequence.high >>> 0).toNumber(true);
                    if (object.receivedSequence != null)
                        if ($util.Long)
                            message.receivedSequence = $util.Long.fromValue(object.receivedSequence, true);
                        else if (typeof object.receivedSequence === "string")
                            message.receivedSequence = $parseInt(object.receivedSequence, 10);
                        else if (typeof object.receivedSequence === "number")
                            message.receivedSequence = object.receivedSequence;
                        else if (typeof object.receivedSequence === "object")
                            message.receivedSequence = new $util.LongBits(object.receivedSequence.low >>> 0, object.receivedSequence.high >>> 0).toNumber(true);
                    if (object.detail != null)
                        if (typeof object.detail !== "string" || object.detail.length)
                            message.detail = $String(object.detail);
                    return message;
                };

                /**
                 * Creates a plain object from a Validity message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.Validity
                 * @static
                 * @param {barc.browser.v1.Validity} message Validity
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Validity.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.status = options.enums === $String ? "VALIDITY_STATUS_UNSPECIFIED" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.lastSequence = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.lastSequence = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        object.detail = "";
                    }
                    if (message.status != null && $Object.hasOwnProperty.call(message, "status"))
                        object.status = options.enums === $String ? $root.barc.browser.v1.ValidityStatus[message.status] === $undefined ? message.status : $root.barc.browser.v1.ValidityStatus[message.status] : message.status;
                    if (message.lastSequence != null && $Object.hasOwnProperty.call(message, "lastSequence"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.lastSequence = typeof message.lastSequence === "number" ? $BigInt(message.lastSequence) : $util.Long.fromBits(message.lastSequence.low >>> 0, message.lastSequence.high >>> 0, true).toBigInt();
                        else if (typeof message.lastSequence === "number")
                            object.lastSequence = options.longs === $String ? $String(message.lastSequence) : message.lastSequence;
                        else
                            object.lastSequence = options.longs === $String ? $util.Long.prototype.toString.call(message.lastSequence) : options.longs === $Number ? new $util.LongBits(message.lastSequence.low >>> 0, message.lastSequence.high >>> 0).toNumber(true) : message.lastSequence;
                    if (message.receivedSequence != null && $Object.hasOwnProperty.call(message, "receivedSequence"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.receivedSequence = typeof message.receivedSequence === "number" ? $BigInt(message.receivedSequence) : $util.Long.fromBits(message.receivedSequence.low >>> 0, message.receivedSequence.high >>> 0, true).toBigInt();
                        else if (typeof message.receivedSequence === "number")
                            object.receivedSequence = options.longs === $String ? $String(message.receivedSequence) : message.receivedSequence;
                        else
                            object.receivedSequence = options.longs === $String ? $util.Long.prototype.toString.call(message.receivedSequence) : options.longs === $Number ? new $util.LongBits(message.receivedSequence.low >>> 0, message.receivedSequence.high >>> 0).toNumber(true) : message.receivedSequence;
                    if (message.detail != null && $Object.hasOwnProperty.call(message, "detail"))
                        object.detail = message.detail;
                    return object;
                };

                /**
                 * Converts this Validity to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.Validity
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Validity.prototype.toJSON = function() {
                    return Validity.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for Validity
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.Validity
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                Validity.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.Validity";
                };

                return Validity;
            })();

            v1.Position3 = (function() {

                /**
                 * Properties of a Position3.
                 * @typedef {Object} barc.browser.v1.Position3.$Properties
                 * @property {number|null} [x] Position3 x
                 * @property {number|null} [elevation] Position3 elevation
                 * @property {number|null} [z] Position3 z
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Position3.
                 * @memberof barc.browser.v1
                 * @interface IPosition3
                 * @augments barc.browser.v1.Position3.$Properties
                 * @deprecated Use barc.browser.v1.Position3.$Properties instead.
                 */

                /**
                 * Shape of a Position3.
                 * @typedef {barc.browser.v1.Position3.$Properties} barc.browser.v1.Position3.$Shape
                 */

                /**
                 * Constructs a new Position3.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a Position3.
                 * @constructor
                 * @param {barc.browser.v1.Position3.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Position3 = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Position3 x.
                 * @member {number} x
                 * @memberof barc.browser.v1.Position3
                 * @instance
                 */
                Position3.prototype.x = 0;

                /**
                 * Position3 elevation.
                 * @member {number|null|undefined} elevation
                 * @memberof barc.browser.v1.Position3
                 * @instance
                 */
                Position3.prototype.elevation = null;

                /**
                 * Position3 z.
                 * @member {number} z
                 * @memberof barc.browser.v1.Position3
                 * @instance
                 */
                Position3.prototype.z = 0;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                // Virtual OneOf for proto3 optional field
                $Object.defineProperty(Position3.prototype, "_elevation", {
                    get: $util.oneOfGetter($oneOfFields = ["elevation"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified Position3 message. Does not implicitly {@link barc.browser.v1.Position3.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.Position3
                 * @static
                 * @param {barc.browser.v1.Position3.$Properties} message Position3 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Position3.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.x != null && $Object.hasOwnProperty.call(message, "x") && !$Object.is(message.x, 0))
                        writer.uint32(/* id 1, wireType 5 =*/13).float(message.x);
                    if (message.elevation != null && $Object.hasOwnProperty.call(message, "elevation"))
                        writer.uint32(/* id 2, wireType 5 =*/21).float(message.elevation);
                    if (message.z != null && $Object.hasOwnProperty.call(message, "z") && !$Object.is(message.z, 0))
                        writer.uint32(/* id 3, wireType 5 =*/29).float(message.z);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified Position3 message, length delimited. Does not implicitly {@link barc.browser.v1.Position3.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.Position3
                 * @static
                 * @param {barc.browser.v1.Position3.$Properties} message Position3 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Position3.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a Position3 message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.Position3
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.Position3 & barc.browser.v1.Position3.$Shape} Position3
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Position3.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.Position3();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.x = value;
                                else
                                    delete message.x;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 5)
                                    break;
                                message.elevation = reader.float();
                                message._elevation = "elevation";
                                continue;
                            }
                        case 3: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.z = value;
                                else
                                    delete message.z;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a Position3 message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.Position3
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.Position3 & barc.browser.v1.Position3.$Shape} Position3
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Position3.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a Position3 message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.Position3
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.Position3} Position3
                 */
                Position3.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.Position3)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.Position3: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.Position3();
                    if (object.x != null)
                        if (!$Object.is($Number(object.x), 0))
                            message.x = $Number(object.x);
                    if (object.elevation != null)
                        message.elevation = $Number(object.elevation);
                    if (object.z != null)
                        if (!$Object.is($Number(object.z), 0))
                            message.z = $Number(object.z);
                    return message;
                };

                /**
                 * Creates a plain object from a Position3 message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.Position3
                 * @static
                 * @param {barc.browser.v1.Position3} message Position3
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Position3.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.x = 0;
                        object.z = 0;
                    }
                    if (message.x != null && $Object.hasOwnProperty.call(message, "x"))
                        object.x = options.json && !$isFinite(message.x) ? $String(message.x) : message.x;
                    if (message.elevation != null && $Object.hasOwnProperty.call(message, "elevation"))
                        object.elevation = options.json && !$isFinite(message.elevation) ? $String(message.elevation) : message.elevation;
                    if (message.z != null && $Object.hasOwnProperty.call(message, "z"))
                        object.z = options.json && !$isFinite(message.z) ? $String(message.z) : message.z;
                    return object;
                };

                /**
                 * Converts this Position3 to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.Position3
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Position3.prototype.toJSON = function() {
                    return Position3.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for Position3
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.Position3
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                Position3.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.Position3";
                };

                return Position3;
            })();

            v1.ObservedUnit = (function() {

                /**
                 * Properties of an ObservedUnit.
                 * @typedef {Object} barc.browser.v1.ObservedUnit.$Properties
                 * @property {Long|null} [id] ObservedUnit id
                 * @property {number|null} [definitionId] ObservedUnit definitionId
                 * @property {number|null} [teamId] ObservedUnit teamId
                 * @property {barc.browser.v1.ObservationKind|null} [observation] ObservedUnit observation
                 * @property {barc.browser.v1.Position3.$Properties|null} [position] ObservedUnit position
                 * @property {number|null} [health] ObservedUnit health
                 * @property {number|null} [maxHealth] ObservedUnit maxHealth
                 * @property {Long|null} [generation] ObservedUnit generation
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of an ObservedUnit.
                 * @memberof barc.browser.v1
                 * @interface IObservedUnit
                 * @augments barc.browser.v1.ObservedUnit.$Properties
                 * @deprecated Use barc.browser.v1.ObservedUnit.$Properties instead.
                 */

                /**
                 * Shape of an ObservedUnit.
                 * @typedef {barc.browser.v1.ObservedUnit.$Properties} barc.browser.v1.ObservedUnit.$Shape
                 */

                /**
                 * Constructs a new ObservedUnit.
                 * @memberof barc.browser.v1
                 * @classdesc Represents an ObservedUnit.
                 * @constructor
                 * @param {barc.browser.v1.ObservedUnit.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const ObservedUnit = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * ObservedUnit id.
                 * @member {Long} id
                 * @memberof barc.browser.v1.ObservedUnit
                 * @instance
                 */
                ObservedUnit.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * ObservedUnit definitionId.
                 * @member {number|null|undefined} definitionId
                 * @memberof barc.browser.v1.ObservedUnit
                 * @instance
                 */
                ObservedUnit.prototype.definitionId = null;

                /**
                 * ObservedUnit teamId.
                 * @member {number|null|undefined} teamId
                 * @memberof barc.browser.v1.ObservedUnit
                 * @instance
                 */
                ObservedUnit.prototype.teamId = null;

                /**
                 * ObservedUnit observation.
                 * @member {barc.browser.v1.ObservationKind} observation
                 * @memberof barc.browser.v1.ObservedUnit
                 * @instance
                 */
                ObservedUnit.prototype.observation = 0;

                /**
                 * ObservedUnit position.
                 * @member {barc.browser.v1.Position3.$Properties|null|undefined} position
                 * @memberof barc.browser.v1.ObservedUnit
                 * @instance
                 */
                ObservedUnit.prototype.position = null;

                /**
                 * ObservedUnit health.
                 * @member {number|null|undefined} health
                 * @memberof barc.browser.v1.ObservedUnit
                 * @instance
                 */
                ObservedUnit.prototype.health = null;

                /**
                 * ObservedUnit maxHealth.
                 * @member {number|null|undefined} maxHealth
                 * @memberof barc.browser.v1.ObservedUnit
                 * @instance
                 */
                ObservedUnit.prototype.maxHealth = null;

                /**
                 * ObservedUnit generation.
                 * @member {Long|null|undefined} generation
                 * @memberof barc.browser.v1.ObservedUnit
                 * @instance
                 */
                ObservedUnit.prototype.generation = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                // Virtual OneOf for proto3 optional field
                $Object.defineProperty(ObservedUnit.prototype, "_definitionId", {
                    get: $util.oneOfGetter($oneOfFields = ["definitionId"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                // Virtual OneOf for proto3 optional field
                $Object.defineProperty(ObservedUnit.prototype, "_teamId", {
                    get: $util.oneOfGetter($oneOfFields = ["teamId"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                // Virtual OneOf for proto3 optional field
                $Object.defineProperty(ObservedUnit.prototype, "_health", {
                    get: $util.oneOfGetter($oneOfFields = ["health"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                // Virtual OneOf for proto3 optional field
                $Object.defineProperty(ObservedUnit.prototype, "_maxHealth", {
                    get: $util.oneOfGetter($oneOfFields = ["maxHealth"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                // Virtual OneOf for proto3 optional field
                $Object.defineProperty(ObservedUnit.prototype, "_generation", {
                    get: $util.oneOfGetter($oneOfFields = ["generation"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified ObservedUnit message. Does not implicitly {@link barc.browser.v1.ObservedUnit.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.ObservedUnit
                 * @static
                 * @param {barc.browser.v1.ObservedUnit.$Properties} message ObservedUnit message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ObservedUnit.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.id != null && $Object.hasOwnProperty.call(message, "id") && (typeof message.id === "object" ? message.id.low || message.id.high : message.id !== 0))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
                    if (message.definitionId != null && $Object.hasOwnProperty.call(message, "definitionId"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.definitionId);
                    if (message.teamId != null && $Object.hasOwnProperty.call(message, "teamId"))
                        writer.uint32(/* id 3, wireType 0 =*/24).int32(message.teamId);
                    if (message.observation != null && $Object.hasOwnProperty.call(message, "observation") && message.observation !== 0)
                        writer.uint32(/* id 4, wireType 0 =*/32).int32(message.observation);
                    if (message.position != null && $Object.hasOwnProperty.call(message, "position"))
                        $root.barc.browser.v1.Position3.encode(message.position, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
                    if (message.health != null && $Object.hasOwnProperty.call(message, "health"))
                        writer.uint32(/* id 6, wireType 5 =*/53).float(message.health);
                    if (message.maxHealth != null && $Object.hasOwnProperty.call(message, "maxHealth"))
                        writer.uint32(/* id 7, wireType 5 =*/61).float(message.maxHealth);
                    if (message.generation != null && $Object.hasOwnProperty.call(message, "generation"))
                        writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.generation);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ObservedUnit message, length delimited. Does not implicitly {@link barc.browser.v1.ObservedUnit.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.ObservedUnit
                 * @static
                 * @param {barc.browser.v1.ObservedUnit.$Properties} message ObservedUnit message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ObservedUnit.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes an ObservedUnit message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.ObservedUnit
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ObservedUnit & barc.browser.v1.ObservedUnit.$Shape} ObservedUnit
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ObservedUnit.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.ObservedUnit();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.id = value;
                                else
                                    delete message.id;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 0)
                                    break;
                                message.definitionId = reader.uint32();
                                message._definitionId = "definitionId";
                                continue;
                            }
                        case 3: {
                                if (wireType !== 0)
                                    break;
                                message.teamId = reader.int32();
                                message._teamId = "teamId";
                                continue;
                            }
                        case 4: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.int32())
                                    message.observation = value;
                                else
                                    delete message.observation;
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                message.position = $root.barc.browser.v1.Position3.decode(reader, reader.uint32(), $undefined, _depth + 1, message.position);
                                continue;
                            }
                        case 6: {
                                if (wireType !== 5)
                                    break;
                                message.health = reader.float();
                                message._health = "health";
                                continue;
                            }
                        case 7: {
                                if (wireType !== 5)
                                    break;
                                message.maxHealth = reader.float();
                                message._maxHealth = "maxHealth";
                                continue;
                            }
                        case 8: {
                                if (wireType !== 0)
                                    break;
                                message.generation = reader.uint64();
                                message._generation = "generation";
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes an ObservedUnit message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.ObservedUnit
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ObservedUnit & barc.browser.v1.ObservedUnit.$Shape} ObservedUnit
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ObservedUnit.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates an ObservedUnit message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.ObservedUnit
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.ObservedUnit} ObservedUnit
                 */
                ObservedUnit.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.ObservedUnit)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.ObservedUnit: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.ObservedUnit();
                    if (object.id != null)
                        if (typeof object.id === "object" ? object.id.low || object.id.high : $Number(object.id) !== 0)
                            if ($util.Long)
                                message.id = $util.Long.fromValue(object.id, true);
                            else if (typeof object.id === "string")
                                message.id = $parseInt(object.id, 10);
                            else if (typeof object.id === "number")
                                message.id = object.id;
                            else if (typeof object.id === "object")
                                message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
                    if (object.definitionId != null)
                        message.definitionId = object.definitionId >>> 0;
                    if (object.teamId != null)
                        message.teamId = object.teamId | 0;
                    if (object.observation !== 0 && (typeof object.observation !== "string" || $root.barc.browser.v1.ObservationKind[object.observation] !== 0))
                        switch (object.observation) {
                        case "OBSERVATION_KIND_UNSPECIFIED":
                        case 0:
                            message.observation = 0;
                            break;
                        case "OBSERVATION_KIND_OWN":
                        case 1:
                            message.observation = 1;
                            break;
                        case "OBSERVATION_KIND_VISUAL":
                        case 2:
                            message.observation = 2;
                            break;
                        case "OBSERVATION_KIND_RADAR":
                        case 3:
                            message.observation = 3;
                            break;
                        default:
                            if (typeof object.observation === "number" && (object.observation | 0) === object.observation)
                                message.observation = object.observation;
                        }
                    if (object.position != null) {
                        if (!$util.isObject(object.position))
                            throw $TypeError(".barc.browser.v1.ObservedUnit.position: object expected");
                        message.position = $root.barc.browser.v1.Position3.fromObject(object.position, _depth + 1);
                    }
                    if (object.health != null)
                        message.health = $Number(object.health);
                    if (object.maxHealth != null)
                        message.maxHealth = $Number(object.maxHealth);
                    if (object.generation != null)
                        if ($util.Long)
                            message.generation = $util.Long.fromValue(object.generation, true);
                        else if (typeof object.generation === "string")
                            message.generation = $parseInt(object.generation, 10);
                        else if (typeof object.generation === "number")
                            message.generation = object.generation;
                        else if (typeof object.generation === "object")
                            message.generation = new $util.LongBits(object.generation.low >>> 0, object.generation.high >>> 0).toNumber(true);
                    return message;
                };

                /**
                 * Creates a plain object from an ObservedUnit message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.ObservedUnit
                 * @static
                 * @param {barc.browser.v1.ObservedUnit} message ObservedUnit
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ObservedUnit.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.id = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.id = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        object.observation = options.enums === $String ? "OBSERVATION_KIND_UNSPECIFIED" : 0;
                        object.position = null;
                    }
                    if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.id = typeof message.id === "number" ? $BigInt(message.id) : $util.Long.fromBits(message.id.low >>> 0, message.id.high >>> 0, true).toBigInt();
                        else if (typeof message.id === "number")
                            object.id = options.longs === $String ? $String(message.id) : message.id;
                        else
                            object.id = options.longs === $String ? $util.Long.prototype.toString.call(message.id) : options.longs === $Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
                    if (message.definitionId != null && $Object.hasOwnProperty.call(message, "definitionId"))
                        object.definitionId = message.definitionId;
                    if (message.teamId != null && $Object.hasOwnProperty.call(message, "teamId"))
                        object.teamId = message.teamId;
                    if (message.observation != null && $Object.hasOwnProperty.call(message, "observation"))
                        object.observation = options.enums === $String ? $root.barc.browser.v1.ObservationKind[message.observation] === $undefined ? message.observation : $root.barc.browser.v1.ObservationKind[message.observation] : message.observation;
                    if (message.position != null && $Object.hasOwnProperty.call(message, "position"))
                        object.position = $root.barc.browser.v1.Position3.toObject(message.position, options, _depth + 1);
                    if (message.health != null && $Object.hasOwnProperty.call(message, "health"))
                        object.health = options.json && !$isFinite(message.health) ? $String(message.health) : message.health;
                    if (message.maxHealth != null && $Object.hasOwnProperty.call(message, "maxHealth"))
                        object.maxHealth = options.json && !$isFinite(message.maxHealth) ? $String(message.maxHealth) : message.maxHealth;
                    if (message.generation != null && $Object.hasOwnProperty.call(message, "generation"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.generation = typeof message.generation === "number" ? $BigInt(message.generation) : $util.Long.fromBits(message.generation.low >>> 0, message.generation.high >>> 0, true).toBigInt();
                        else if (typeof message.generation === "number")
                            object.generation = options.longs === $String ? $String(message.generation) : message.generation;
                        else
                            object.generation = options.longs === $String ? $util.Long.prototype.toString.call(message.generation) : options.longs === $Number ? new $util.LongBits(message.generation.low >>> 0, message.generation.high >>> 0).toNumber(true) : message.generation;
                    return object;
                };

                /**
                 * Converts this ObservedUnit to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.ObservedUnit
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ObservedUnit.prototype.toJSON = function() {
                    return ObservedUnit.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for ObservedUnit
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.ObservedUnit
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                ObservedUnit.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.ObservedUnit";
                };

                return ObservedUnit;
            })();

            v1.ObservedFeature = (function() {

                /**
                 * Properties of an ObservedFeature.
                 * @typedef {Object} barc.browser.v1.ObservedFeature.$Properties
                 * @property {Long|null} [id] ObservedFeature id
                 * @property {number|null} [definitionId] ObservedFeature definitionId
                 * @property {barc.browser.v1.Position3.$Properties|null} [position] ObservedFeature position
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of an ObservedFeature.
                 * @memberof barc.browser.v1
                 * @interface IObservedFeature
                 * @augments barc.browser.v1.ObservedFeature.$Properties
                 * @deprecated Use barc.browser.v1.ObservedFeature.$Properties instead.
                 */

                /**
                 * Shape of an ObservedFeature.
                 * @typedef {barc.browser.v1.ObservedFeature.$Properties} barc.browser.v1.ObservedFeature.$Shape
                 */

                /**
                 * Constructs a new ObservedFeature.
                 * @memberof barc.browser.v1
                 * @classdesc Represents an ObservedFeature.
                 * @constructor
                 * @param {barc.browser.v1.ObservedFeature.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const ObservedFeature = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * ObservedFeature id.
                 * @member {Long} id
                 * @memberof barc.browser.v1.ObservedFeature
                 * @instance
                 */
                ObservedFeature.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * ObservedFeature definitionId.
                 * @member {number} definitionId
                 * @memberof barc.browser.v1.ObservedFeature
                 * @instance
                 */
                ObservedFeature.prototype.definitionId = 0;

                /**
                 * ObservedFeature position.
                 * @member {barc.browser.v1.Position3.$Properties|null|undefined} position
                 * @memberof barc.browser.v1.ObservedFeature
                 * @instance
                 */
                ObservedFeature.prototype.position = null;

                /**
                 * Encodes the specified ObservedFeature message. Does not implicitly {@link barc.browser.v1.ObservedFeature.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.ObservedFeature
                 * @static
                 * @param {barc.browser.v1.ObservedFeature.$Properties} message ObservedFeature message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ObservedFeature.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.id != null && $Object.hasOwnProperty.call(message, "id") && (typeof message.id === "object" ? message.id.low || message.id.high : message.id !== 0))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
                    if (message.definitionId != null && $Object.hasOwnProperty.call(message, "definitionId") && message.definitionId !== 0)
                        writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.definitionId);
                    if (message.position != null && $Object.hasOwnProperty.call(message, "position"))
                        $root.barc.browser.v1.Position3.encode(message.position, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ObservedFeature message, length delimited. Does not implicitly {@link barc.browser.v1.ObservedFeature.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.ObservedFeature
                 * @static
                 * @param {barc.browser.v1.ObservedFeature.$Properties} message ObservedFeature message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ObservedFeature.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes an ObservedFeature message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.ObservedFeature
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ObservedFeature & barc.browser.v1.ObservedFeature.$Shape} ObservedFeature
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ObservedFeature.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.ObservedFeature();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.id = value;
                                else
                                    delete message.id;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.definitionId = value;
                                else
                                    delete message.definitionId;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                message.position = $root.barc.browser.v1.Position3.decode(reader, reader.uint32(), $undefined, _depth + 1, message.position);
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes an ObservedFeature message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.ObservedFeature
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ObservedFeature & barc.browser.v1.ObservedFeature.$Shape} ObservedFeature
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ObservedFeature.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates an ObservedFeature message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.ObservedFeature
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.ObservedFeature} ObservedFeature
                 */
                ObservedFeature.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.ObservedFeature)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.ObservedFeature: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.ObservedFeature();
                    if (object.id != null)
                        if (typeof object.id === "object" ? object.id.low || object.id.high : $Number(object.id) !== 0)
                            if ($util.Long)
                                message.id = $util.Long.fromValue(object.id, true);
                            else if (typeof object.id === "string")
                                message.id = $parseInt(object.id, 10);
                            else if (typeof object.id === "number")
                                message.id = object.id;
                            else if (typeof object.id === "object")
                                message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
                    if (object.definitionId != null)
                        if ($Number(object.definitionId) !== 0)
                            message.definitionId = object.definitionId >>> 0;
                    if (object.position != null) {
                        if (!$util.isObject(object.position))
                            throw $TypeError(".barc.browser.v1.ObservedFeature.position: object expected");
                        message.position = $root.barc.browser.v1.Position3.fromObject(object.position, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from an ObservedFeature message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.ObservedFeature
                 * @static
                 * @param {barc.browser.v1.ObservedFeature} message ObservedFeature
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ObservedFeature.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.id = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.id = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        object.definitionId = 0;
                        object.position = null;
                    }
                    if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.id = typeof message.id === "number" ? $BigInt(message.id) : $util.Long.fromBits(message.id.low >>> 0, message.id.high >>> 0, true).toBigInt();
                        else if (typeof message.id === "number")
                            object.id = options.longs === $String ? $String(message.id) : message.id;
                        else
                            object.id = options.longs === $String ? $util.Long.prototype.toString.call(message.id) : options.longs === $Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
                    if (message.definitionId != null && $Object.hasOwnProperty.call(message, "definitionId"))
                        object.definitionId = message.definitionId;
                    if (message.position != null && $Object.hasOwnProperty.call(message, "position"))
                        object.position = $root.barc.browser.v1.Position3.toObject(message.position, options, _depth + 1);
                    return object;
                };

                /**
                 * Converts this ObservedFeature to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.ObservedFeature
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ObservedFeature.prototype.toJSON = function() {
                    return ObservedFeature.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for ObservedFeature
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.ObservedFeature
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                ObservedFeature.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.ObservedFeature";
                };

                return ObservedFeature;
            })();

            v1.ResourceAmount = (function() {

                /**
                 * Properties of a ResourceAmount.
                 * @typedef {Object} barc.browser.v1.ResourceAmount.$Properties
                 * @property {number|null} [current] ResourceAmount current
                 * @property {number|null} [storage] ResourceAmount storage
                 * @property {number|null} [income] ResourceAmount income
                 * @property {number|null} [expenditure] ResourceAmount expenditure
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a ResourceAmount.
                 * @memberof barc.browser.v1
                 * @interface IResourceAmount
                 * @augments barc.browser.v1.ResourceAmount.$Properties
                 * @deprecated Use barc.browser.v1.ResourceAmount.$Properties instead.
                 */

                /**
                 * Shape of a ResourceAmount.
                 * @typedef {barc.browser.v1.ResourceAmount.$Properties} barc.browser.v1.ResourceAmount.$Shape
                 */

                /**
                 * Constructs a new ResourceAmount.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a ResourceAmount.
                 * @constructor
                 * @param {barc.browser.v1.ResourceAmount.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const ResourceAmount = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * ResourceAmount current.
                 * @member {number|null|undefined} current
                 * @memberof barc.browser.v1.ResourceAmount
                 * @instance
                 */
                ResourceAmount.prototype.current = null;

                /**
                 * ResourceAmount storage.
                 * @member {number|null|undefined} storage
                 * @memberof barc.browser.v1.ResourceAmount
                 * @instance
                 */
                ResourceAmount.prototype.storage = null;

                /**
                 * ResourceAmount income.
                 * @member {number|null|undefined} income
                 * @memberof barc.browser.v1.ResourceAmount
                 * @instance
                 */
                ResourceAmount.prototype.income = null;

                /**
                 * ResourceAmount expenditure.
                 * @member {number|null|undefined} expenditure
                 * @memberof barc.browser.v1.ResourceAmount
                 * @instance
                 */
                ResourceAmount.prototype.expenditure = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                // Virtual OneOf for proto3 optional field
                $Object.defineProperty(ResourceAmount.prototype, "_current", {
                    get: $util.oneOfGetter($oneOfFields = ["current"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                // Virtual OneOf for proto3 optional field
                $Object.defineProperty(ResourceAmount.prototype, "_storage", {
                    get: $util.oneOfGetter($oneOfFields = ["storage"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                // Virtual OneOf for proto3 optional field
                $Object.defineProperty(ResourceAmount.prototype, "_income", {
                    get: $util.oneOfGetter($oneOfFields = ["income"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                // Virtual OneOf for proto3 optional field
                $Object.defineProperty(ResourceAmount.prototype, "_expenditure", {
                    get: $util.oneOfGetter($oneOfFields = ["expenditure"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified ResourceAmount message. Does not implicitly {@link barc.browser.v1.ResourceAmount.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.ResourceAmount
                 * @static
                 * @param {barc.browser.v1.ResourceAmount.$Properties} message ResourceAmount message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ResourceAmount.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.current != null && $Object.hasOwnProperty.call(message, "current"))
                        writer.uint32(/* id 1, wireType 1 =*/9).double(message.current);
                    if (message.storage != null && $Object.hasOwnProperty.call(message, "storage"))
                        writer.uint32(/* id 2, wireType 1 =*/17).double(message.storage);
                    if (message.income != null && $Object.hasOwnProperty.call(message, "income"))
                        writer.uint32(/* id 3, wireType 1 =*/25).double(message.income);
                    if (message.expenditure != null && $Object.hasOwnProperty.call(message, "expenditure"))
                        writer.uint32(/* id 4, wireType 1 =*/33).double(message.expenditure);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ResourceAmount message, length delimited. Does not implicitly {@link barc.browser.v1.ResourceAmount.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.ResourceAmount
                 * @static
                 * @param {barc.browser.v1.ResourceAmount.$Properties} message ResourceAmount message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ResourceAmount.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a ResourceAmount message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.ResourceAmount
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ResourceAmount & barc.browser.v1.ResourceAmount.$Shape} ResourceAmount
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ResourceAmount.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.ResourceAmount();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 1)
                                    break;
                                message.current = reader.double();
                                message._current = "current";
                                continue;
                            }
                        case 2: {
                                if (wireType !== 1)
                                    break;
                                message.storage = reader.double();
                                message._storage = "storage";
                                continue;
                            }
                        case 3: {
                                if (wireType !== 1)
                                    break;
                                message.income = reader.double();
                                message._income = "income";
                                continue;
                            }
                        case 4: {
                                if (wireType !== 1)
                                    break;
                                message.expenditure = reader.double();
                                message._expenditure = "expenditure";
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a ResourceAmount message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.ResourceAmount
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ResourceAmount & barc.browser.v1.ResourceAmount.$Shape} ResourceAmount
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ResourceAmount.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a ResourceAmount message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.ResourceAmount
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.ResourceAmount} ResourceAmount
                 */
                ResourceAmount.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.ResourceAmount)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.ResourceAmount: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.ResourceAmount();
                    if (object.current != null)
                        message.current = $Number(object.current);
                    if (object.storage != null)
                        message.storage = $Number(object.storage);
                    if (object.income != null)
                        message.income = $Number(object.income);
                    if (object.expenditure != null)
                        message.expenditure = $Number(object.expenditure);
                    return message;
                };

                /**
                 * Creates a plain object from a ResourceAmount message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.ResourceAmount
                 * @static
                 * @param {barc.browser.v1.ResourceAmount} message ResourceAmount
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ResourceAmount.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (message.current != null && $Object.hasOwnProperty.call(message, "current"))
                        object.current = options.json && !$isFinite(message.current) ? $String(message.current) : message.current;
                    if (message.storage != null && $Object.hasOwnProperty.call(message, "storage"))
                        object.storage = options.json && !$isFinite(message.storage) ? $String(message.storage) : message.storage;
                    if (message.income != null && $Object.hasOwnProperty.call(message, "income"))
                        object.income = options.json && !$isFinite(message.income) ? $String(message.income) : message.income;
                    if (message.expenditure != null && $Object.hasOwnProperty.call(message, "expenditure"))
                        object.expenditure = options.json && !$isFinite(message.expenditure) ? $String(message.expenditure) : message.expenditure;
                    return object;
                };

                /**
                 * Converts this ResourceAmount to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.ResourceAmount
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ResourceAmount.prototype.toJSON = function() {
                    return ResourceAmount.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for ResourceAmount
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.ResourceAmount
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                ResourceAmount.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.ResourceAmount";
                };

                return ResourceAmount;
            })();

            v1.TeamEconomy = (function() {

                /**
                 * Properties of a TeamEconomy.
                 * @typedef {Object} barc.browser.v1.TeamEconomy.$Properties
                 * @property {number|null} [teamId] TeamEconomy teamId
                 * @property {barc.browser.v1.ResourceAmount.$Properties|null} [metal] TeamEconomy metal
                 * @property {barc.browser.v1.ResourceAmount.$Properties|null} [energy] TeamEconomy energy
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a TeamEconomy.
                 * @memberof barc.browser.v1
                 * @interface ITeamEconomy
                 * @augments barc.browser.v1.TeamEconomy.$Properties
                 * @deprecated Use barc.browser.v1.TeamEconomy.$Properties instead.
                 */

                /**
                 * Shape of a TeamEconomy.
                 * @typedef {barc.browser.v1.TeamEconomy.$Properties} barc.browser.v1.TeamEconomy.$Shape
                 */

                /**
                 * Constructs a new TeamEconomy.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a TeamEconomy.
                 * @constructor
                 * @param {barc.browser.v1.TeamEconomy.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const TeamEconomy = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * TeamEconomy teamId.
                 * @member {number|null|undefined} teamId
                 * @memberof barc.browser.v1.TeamEconomy
                 * @instance
                 */
                TeamEconomy.prototype.teamId = null;

                /**
                 * TeamEconomy metal.
                 * @member {barc.browser.v1.ResourceAmount.$Properties|null|undefined} metal
                 * @memberof barc.browser.v1.TeamEconomy
                 * @instance
                 */
                TeamEconomy.prototype.metal = null;

                /**
                 * TeamEconomy energy.
                 * @member {barc.browser.v1.ResourceAmount.$Properties|null|undefined} energy
                 * @memberof barc.browser.v1.TeamEconomy
                 * @instance
                 */
                TeamEconomy.prototype.energy = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                // Virtual OneOf for proto3 optional field
                $Object.defineProperty(TeamEconomy.prototype, "_teamId", {
                    get: $util.oneOfGetter($oneOfFields = ["teamId"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified TeamEconomy message. Does not implicitly {@link barc.browser.v1.TeamEconomy.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.TeamEconomy
                 * @static
                 * @param {barc.browser.v1.TeamEconomy.$Properties} message TeamEconomy message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                TeamEconomy.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.teamId != null && $Object.hasOwnProperty.call(message, "teamId"))
                        writer.uint32(/* id 1, wireType 0 =*/8).int32(message.teamId);
                    if (message.metal != null && $Object.hasOwnProperty.call(message, "metal"))
                        $root.barc.browser.v1.ResourceAmount.encode(message.metal, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                    if (message.energy != null && $Object.hasOwnProperty.call(message, "energy"))
                        $root.barc.browser.v1.ResourceAmount.encode(message.energy, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified TeamEconomy message, length delimited. Does not implicitly {@link barc.browser.v1.TeamEconomy.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.TeamEconomy
                 * @static
                 * @param {barc.browser.v1.TeamEconomy.$Properties} message TeamEconomy message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                TeamEconomy.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a TeamEconomy message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.TeamEconomy
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.TeamEconomy & barc.browser.v1.TeamEconomy.$Shape} TeamEconomy
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                TeamEconomy.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.TeamEconomy();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                message.teamId = reader.int32();
                                message._teamId = "teamId";
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                message.metal = $root.barc.browser.v1.ResourceAmount.decode(reader, reader.uint32(), $undefined, _depth + 1, message.metal);
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                message.energy = $root.barc.browser.v1.ResourceAmount.decode(reader, reader.uint32(), $undefined, _depth + 1, message.energy);
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a TeamEconomy message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.TeamEconomy
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.TeamEconomy & barc.browser.v1.TeamEconomy.$Shape} TeamEconomy
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                TeamEconomy.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a TeamEconomy message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.TeamEconomy
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.TeamEconomy} TeamEconomy
                 */
                TeamEconomy.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.TeamEconomy)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.TeamEconomy: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.TeamEconomy();
                    if (object.teamId != null)
                        message.teamId = object.teamId | 0;
                    if (object.metal != null) {
                        if (!$util.isObject(object.metal))
                            throw $TypeError(".barc.browser.v1.TeamEconomy.metal: object expected");
                        message.metal = $root.barc.browser.v1.ResourceAmount.fromObject(object.metal, _depth + 1);
                    }
                    if (object.energy != null) {
                        if (!$util.isObject(object.energy))
                            throw $TypeError(".barc.browser.v1.TeamEconomy.energy: object expected");
                        message.energy = $root.barc.browser.v1.ResourceAmount.fromObject(object.energy, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a TeamEconomy message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.TeamEconomy
                 * @static
                 * @param {barc.browser.v1.TeamEconomy} message TeamEconomy
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                TeamEconomy.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.metal = null;
                        object.energy = null;
                    }
                    if (message.teamId != null && $Object.hasOwnProperty.call(message, "teamId"))
                        object.teamId = message.teamId;
                    if (message.metal != null && $Object.hasOwnProperty.call(message, "metal"))
                        object.metal = $root.barc.browser.v1.ResourceAmount.toObject(message.metal, options, _depth + 1);
                    if (message.energy != null && $Object.hasOwnProperty.call(message, "energy"))
                        object.energy = $root.barc.browser.v1.ResourceAmount.toObject(message.energy, options, _depth + 1);
                    return object;
                };

                /**
                 * Converts this TeamEconomy to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.TeamEconomy
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                TeamEconomy.prototype.toJSON = function() {
                    return TeamEconomy.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for TeamEconomy
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.TeamEconomy
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                TeamEconomy.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.TeamEconomy";
                };

                return TeamEconomy;
            })();

            v1.Observation = (function() {

                /**
                 * Properties of an Observation.
                 * @typedef {Object} barc.browser.v1.Observation.$Properties
                 * @property {Uint8Array|null} [sessionId] Observation sessionId
                 * @property {Long|null} [sequence] Observation sequence
                 * @property {Long|null} [capturedAtUnixMs] Observation capturedAtUnixMs
                 * @property {string|null} [perspectiveId] Observation perspectiveId
                 * @property {barc.browser.v1.Validity.$Properties|null} [validity] Observation validity
                 * @property {Array.<barc.browser.v1.ObservedUnit.$Properties>|null} [units] Observation units
                 * @property {Array.<barc.browser.v1.ObservedFeature.$Properties>|null} [features] Observation features
                 * @property {barc.browser.v1.TeamEconomy.$Properties|null} [teamEconomy] Observation teamEconomy
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of an Observation.
                 * @memberof barc.browser.v1
                 * @interface IObservation
                 * @augments barc.browser.v1.Observation.$Properties
                 * @deprecated Use barc.browser.v1.Observation.$Properties instead.
                 */

                /**
                 * Shape of an Observation.
                 * @typedef {barc.browser.v1.Observation.$Properties} barc.browser.v1.Observation.$Shape
                 */

                /**
                 * Constructs a new Observation.
                 * @memberof barc.browser.v1
                 * @classdesc Represents an Observation.
                 * @constructor
                 * @param {barc.browser.v1.Observation.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Observation = function (properties) {
                    this.units = [];
                    this.features = [];
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Observation sessionId.
                 * @member {Uint8Array} sessionId
                 * @memberof barc.browser.v1.Observation
                 * @instance
                 */
                Observation.prototype.sessionId = $util.newBuffer([]);

                /**
                 * Observation sequence.
                 * @member {Long} sequence
                 * @memberof barc.browser.v1.Observation
                 * @instance
                 */
                Observation.prototype.sequence = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * Observation capturedAtUnixMs.
                 * @member {Long} capturedAtUnixMs
                 * @memberof barc.browser.v1.Observation
                 * @instance
                 */
                Observation.prototype.capturedAtUnixMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * Observation perspectiveId.
                 * @member {string} perspectiveId
                 * @memberof barc.browser.v1.Observation
                 * @instance
                 */
                Observation.prototype.perspectiveId = "";

                /**
                 * Observation validity.
                 * @member {barc.browser.v1.Validity.$Properties|null|undefined} validity
                 * @memberof barc.browser.v1.Observation
                 * @instance
                 */
                Observation.prototype.validity = null;

                /**
                 * Observation units.
                 * @member {Array.<barc.browser.v1.ObservedUnit.$Properties>} units
                 * @memberof barc.browser.v1.Observation
                 * @instance
                 */
                Observation.prototype.units = $util.emptyArray;

                /**
                 * Observation features.
                 * @member {Array.<barc.browser.v1.ObservedFeature.$Properties>} features
                 * @memberof barc.browser.v1.Observation
                 * @instance
                 */
                Observation.prototype.features = $util.emptyArray;

                /**
                 * Observation teamEconomy.
                 * @member {barc.browser.v1.TeamEconomy.$Properties|null|undefined} teamEconomy
                 * @memberof barc.browser.v1.Observation
                 * @instance
                 */
                Observation.prototype.teamEconomy = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                // Virtual OneOf for proto3 optional field
                $Object.defineProperty(Observation.prototype, "_teamEconomy", {
                    get: $util.oneOfGetter($oneOfFields = ["teamEconomy"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified Observation message. Does not implicitly {@link barc.browser.v1.Observation.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.Observation
                 * @static
                 * @param {barc.browser.v1.Observation.$Properties} message Observation message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Observation.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId.length)
                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.sessionId);
                    if (message.sequence != null && $Object.hasOwnProperty.call(message, "sequence") && (typeof message.sequence === "object" ? message.sequence.low || message.sequence.high : message.sequence !== 0))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.sequence);
                    if (message.capturedAtUnixMs != null && $Object.hasOwnProperty.call(message, "capturedAtUnixMs") && (typeof message.capturedAtUnixMs === "object" ? message.capturedAtUnixMs.low || message.capturedAtUnixMs.high : message.capturedAtUnixMs !== 0))
                        writer.uint32(/* id 3, wireType 0 =*/24).int64(message.capturedAtUnixMs);
                    if (message.perspectiveId != null && $Object.hasOwnProperty.call(message, "perspectiveId") && message.perspectiveId !== "")
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.perspectiveId);
                    if (message.validity != null && $Object.hasOwnProperty.call(message, "validity"))
                        $root.barc.browser.v1.Validity.encode(message.validity, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
                    if (message.units != null && message.units.length)
                        for (let i = 0; i < message.units.length; ++i)
                            $root.barc.browser.v1.ObservedUnit.encode(message.units[i], writer.uint32(/* id 6, wireType 2 =*/50).fork(), _depth + 1).ldelim();
                    if (message.features != null && message.features.length)
                        for (let i = 0; i < message.features.length; ++i)
                            $root.barc.browser.v1.ObservedFeature.encode(message.features[i], writer.uint32(/* id 7, wireType 2 =*/58).fork(), _depth + 1).ldelim();
                    if (message.teamEconomy != null && $Object.hasOwnProperty.call(message, "teamEconomy"))
                        $root.barc.browser.v1.TeamEconomy.encode(message.teamEconomy, writer.uint32(/* id 8, wireType 2 =*/66).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified Observation message, length delimited. Does not implicitly {@link barc.browser.v1.Observation.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.Observation
                 * @static
                 * @param {barc.browser.v1.Observation.$Properties} message Observation message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Observation.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes an Observation message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.Observation
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.Observation & barc.browser.v1.Observation.$Shape} Observation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Observation.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.Observation();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.sessionId = value;
                                else
                                    delete message.sessionId;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.sequence = value;
                                else
                                    delete message.sequence;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.int64()) === "object" ? value.low || value.high : value !== 0)
                                    message.capturedAtUnixMs = value;
                                else
                                    delete message.capturedAtUnixMs;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.perspectiveId = value;
                                else
                                    delete message.perspectiveId;
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                message.validity = $root.barc.browser.v1.Validity.decode(reader, reader.uint32(), $undefined, _depth + 1, message.validity);
                                continue;
                            }
                        case 6: {
                                if (wireType !== 2)
                                    break;
                                if (!(message.units && message.units.length))
                                    message.units = [];
                                message.units.push($root.barc.browser.v1.ObservedUnit.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                continue;
                            }
                        case 7: {
                                if (wireType !== 2)
                                    break;
                                if (!(message.features && message.features.length))
                                    message.features = [];
                                message.features.push($root.barc.browser.v1.ObservedFeature.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                continue;
                            }
                        case 8: {
                                if (wireType !== 2)
                                    break;
                                message.teamEconomy = $root.barc.browser.v1.TeamEconomy.decode(reader, reader.uint32(), $undefined, _depth + 1, message.teamEconomy);
                                message._teamEconomy = "teamEconomy";
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes an Observation message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.Observation
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.Observation & barc.browser.v1.Observation.$Shape} Observation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Observation.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates an Observation message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.Observation
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.Observation} Observation
                 */
                Observation.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.Observation)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.Observation: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.Observation();
                    if (object.sessionId != null)
                        if (object.sessionId.length)
                            if (typeof object.sessionId === "string")
                                $util.base64.decode(object.sessionId, message.sessionId = $util.newBuffer($util.base64.length(object.sessionId)), 0);
                            else if (object.sessionId.length >= 0)
                                message.sessionId = object.sessionId;
                    if (object.sequence != null)
                        if (typeof object.sequence === "object" ? object.sequence.low || object.sequence.high : $Number(object.sequence) !== 0)
                            if ($util.Long)
                                message.sequence = $util.Long.fromValue(object.sequence, true);
                            else if (typeof object.sequence === "string")
                                message.sequence = $parseInt(object.sequence, 10);
                            else if (typeof object.sequence === "number")
                                message.sequence = object.sequence;
                            else if (typeof object.sequence === "object")
                                message.sequence = new $util.LongBits(object.sequence.low >>> 0, object.sequence.high >>> 0).toNumber(true);
                    if (object.capturedAtUnixMs != null)
                        if (typeof object.capturedAtUnixMs === "object" ? object.capturedAtUnixMs.low || object.capturedAtUnixMs.high : $Number(object.capturedAtUnixMs) !== 0)
                            if ($util.Long)
                                message.capturedAtUnixMs = $util.Long.fromValue(object.capturedAtUnixMs, false);
                            else if (typeof object.capturedAtUnixMs === "string")
                                message.capturedAtUnixMs = $parseInt(object.capturedAtUnixMs, 10);
                            else if (typeof object.capturedAtUnixMs === "number")
                                message.capturedAtUnixMs = object.capturedAtUnixMs;
                            else if (typeof object.capturedAtUnixMs === "object")
                                message.capturedAtUnixMs = new $util.LongBits(object.capturedAtUnixMs.low >>> 0, object.capturedAtUnixMs.high >>> 0).toNumber();
                    if (object.perspectiveId != null)
                        if (typeof object.perspectiveId !== "string" || object.perspectiveId.length)
                            message.perspectiveId = $String(object.perspectiveId);
                    if (object.validity != null) {
                        if (!$util.isObject(object.validity))
                            throw $TypeError(".barc.browser.v1.Observation.validity: object expected");
                        message.validity = $root.barc.browser.v1.Validity.fromObject(object.validity, _depth + 1);
                    }
                    if (object.units) {
                        if (!$Array.isArray(object.units))
                            throw $TypeError(".barc.browser.v1.Observation.units: array expected");
                        message.units = $Array(object.units.length);
                        for (let i = 0; i < object.units.length; ++i) {
                            if (!$util.isObject(object.units[i]))
                                throw $TypeError(".barc.browser.v1.Observation.units: object expected");
                            message.units[i] = $root.barc.browser.v1.ObservedUnit.fromObject(object.units[i], _depth + 1);
                        }
                    }
                    if (object.features) {
                        if (!$Array.isArray(object.features))
                            throw $TypeError(".barc.browser.v1.Observation.features: array expected");
                        message.features = $Array(object.features.length);
                        for (let i = 0; i < object.features.length; ++i) {
                            if (!$util.isObject(object.features[i]))
                                throw $TypeError(".barc.browser.v1.Observation.features: object expected");
                            message.features[i] = $root.barc.browser.v1.ObservedFeature.fromObject(object.features[i], _depth + 1);
                        }
                    }
                    if (object.teamEconomy != null) {
                        if (!$util.isObject(object.teamEconomy))
                            throw $TypeError(".barc.browser.v1.Observation.teamEconomy: object expected");
                        message.teamEconomy = $root.barc.browser.v1.TeamEconomy.fromObject(object.teamEconomy, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from an Observation message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.Observation
                 * @static
                 * @param {barc.browser.v1.Observation} message Observation
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Observation.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.arrays || options.defaults) {
                        object.units = [];
                        object.features = [];
                    }
                    if (options.defaults) {
                        if (options.bytes === $String)
                            object.sessionId = "";
                        else {
                            object.sessionId = [];
                            if (options.bytes !== $Array)
                                object.sessionId = $util.newBuffer(object.sessionId);
                        }
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.sequence = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.sequence = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.capturedAtUnixMs = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.capturedAtUnixMs = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        object.perspectiveId = "";
                        object.validity = null;
                    }
                    if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                        object.sessionId = options.bytes === $String ? $util.base64.encode(message.sessionId, 0, message.sessionId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.sessionId) : message.sessionId;
                    if (message.sequence != null && $Object.hasOwnProperty.call(message, "sequence"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.sequence = typeof message.sequence === "number" ? $BigInt(message.sequence) : $util.Long.fromBits(message.sequence.low >>> 0, message.sequence.high >>> 0, true).toBigInt();
                        else if (typeof message.sequence === "number")
                            object.sequence = options.longs === $String ? $String(message.sequence) : message.sequence;
                        else
                            object.sequence = options.longs === $String ? $util.Long.prototype.toString.call(message.sequence) : options.longs === $Number ? new $util.LongBits(message.sequence.low >>> 0, message.sequence.high >>> 0).toNumber(true) : message.sequence;
                    if (message.capturedAtUnixMs != null && $Object.hasOwnProperty.call(message, "capturedAtUnixMs"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.capturedAtUnixMs = typeof message.capturedAtUnixMs === "number" ? $BigInt(message.capturedAtUnixMs) : $util.Long.fromBits(message.capturedAtUnixMs.low >>> 0, message.capturedAtUnixMs.high >>> 0, false).toBigInt();
                        else if (typeof message.capturedAtUnixMs === "number")
                            object.capturedAtUnixMs = options.longs === $String ? $String(message.capturedAtUnixMs) : message.capturedAtUnixMs;
                        else
                            object.capturedAtUnixMs = options.longs === $String ? $util.Long.prototype.toString.call(message.capturedAtUnixMs) : options.longs === $Number ? new $util.LongBits(message.capturedAtUnixMs.low >>> 0, message.capturedAtUnixMs.high >>> 0).toNumber() : message.capturedAtUnixMs;
                    if (message.perspectiveId != null && $Object.hasOwnProperty.call(message, "perspectiveId"))
                        object.perspectiveId = message.perspectiveId;
                    if (message.validity != null && $Object.hasOwnProperty.call(message, "validity"))
                        object.validity = $root.barc.browser.v1.Validity.toObject(message.validity, options, _depth + 1);
                    if (message.units && message.units.length) {
                        object.units = $Array(message.units.length);
                        for (let j = 0; j < message.units.length; ++j)
                            object.units[j] = $root.barc.browser.v1.ObservedUnit.toObject(message.units[j], options, _depth + 1);
                    }
                    if (message.features && message.features.length) {
                        object.features = $Array(message.features.length);
                        for (let j = 0; j < message.features.length; ++j)
                            object.features[j] = $root.barc.browser.v1.ObservedFeature.toObject(message.features[j], options, _depth + 1);
                    }
                    if (message.teamEconomy != null && $Object.hasOwnProperty.call(message, "teamEconomy"))
                        object.teamEconomy = $root.barc.browser.v1.TeamEconomy.toObject(message.teamEconomy, options, _depth + 1);
                    return object;
                };

                /**
                 * Converts this Observation to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.Observation
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Observation.prototype.toJSON = function() {
                    return Observation.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for Observation
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.Observation
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                Observation.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.Observation";
                };

                return Observation;
            })();

            v1.SelectInput = (function() {

                /**
                 * Properties of a SelectInput.
                 * @typedef {Object} barc.browser.v1.SelectInput.$Properties
                 * @property {Array.<Long>|null} [unitIds] SelectInput unitIds
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a SelectInput.
                 * @memberof barc.browser.v1
                 * @interface ISelectInput
                 * @augments barc.browser.v1.SelectInput.$Properties
                 * @deprecated Use barc.browser.v1.SelectInput.$Properties instead.
                 */

                /**
                 * Shape of a SelectInput.
                 * @typedef {barc.browser.v1.SelectInput.$Properties} barc.browser.v1.SelectInput.$Shape
                 */

                /**
                 * Constructs a new SelectInput.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a SelectInput.
                 * @constructor
                 * @param {barc.browser.v1.SelectInput.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const SelectInput = function (properties) {
                    this.unitIds = [];
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * SelectInput unitIds.
                 * @member {Array.<Long>} unitIds
                 * @memberof barc.browser.v1.SelectInput
                 * @instance
                 */
                SelectInput.prototype.unitIds = $util.emptyArray;

                /**
                 * Encodes the specified SelectInput message. Does not implicitly {@link barc.browser.v1.SelectInput.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.SelectInput
                 * @static
                 * @param {barc.browser.v1.SelectInput.$Properties} message SelectInput message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SelectInput.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.unitIds != null && message.unitIds.length)
                        writer.uint32(/* id 1, wireType 2 =*/10).uint64s(message.unitIds);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified SelectInput message, length delimited. Does not implicitly {@link barc.browser.v1.SelectInput.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.SelectInput
                 * @static
                 * @param {barc.browser.v1.SelectInput.$Properties} message SelectInput message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SelectInput.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a SelectInput message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.SelectInput
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.SelectInput & barc.browser.v1.SelectInput.$Shape} SelectInput
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SelectInput.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.SelectInput();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType === 2) {
                                    if (!(message.unitIds && message.unitIds.length))
                                        message.unitIds = [];
                                    reader.uint64s(message.unitIds);
                                    continue;
                                }
                                if (wireType !== 0)
                                    break;
                                if (!(message.unitIds && message.unitIds.length))
                                    message.unitIds = [];
                                message.unitIds.push(reader.uint64());
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a SelectInput message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.SelectInput
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.SelectInput & barc.browser.v1.SelectInput.$Shape} SelectInput
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SelectInput.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a SelectInput message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.SelectInput
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.SelectInput} SelectInput
                 */
                SelectInput.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.SelectInput)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.SelectInput: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.SelectInput();
                    if (object.unitIds) {
                        if (!$Array.isArray(object.unitIds))
                            throw $TypeError(".barc.browser.v1.SelectInput.unitIds: array expected");
                        message.unitIds = $Array(object.unitIds.length);
                        for (let i = 0; i < object.unitIds.length; ++i)
                            if ($util.Long)
                                message.unitIds[i] = $util.Long.fromValue(object.unitIds[i], true);
                            else if (typeof object.unitIds[i] === "string")
                                message.unitIds[i] = $parseInt(object.unitIds[i], 10);
                            else if (typeof object.unitIds[i] === "number")
                                message.unitIds[i] = object.unitIds[i];
                            else if (typeof object.unitIds[i] === "object")
                                message.unitIds[i] = new $util.LongBits(object.unitIds[i].low >>> 0, object.unitIds[i].high >>> 0).toNumber(true);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a SelectInput message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.SelectInput
                 * @static
                 * @param {barc.browser.v1.SelectInput} message SelectInput
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                SelectInput.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.unitIds = [];
                    if (message.unitIds && message.unitIds.length) {
                        object.unitIds = $Array(message.unitIds.length);
                        for (let j = 0; j < message.unitIds.length; ++j)
                            if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                                object.unitIds[j] = typeof message.unitIds[j] === "number" ? $BigInt(message.unitIds[j]) : $util.Long.fromBits(message.unitIds[j].low >>> 0, message.unitIds[j].high >>> 0, true).toBigInt();
                            else if (typeof message.unitIds[j] === "number")
                                object.unitIds[j] = options.longs === $String ? $String(message.unitIds[j]) : message.unitIds[j];
                            else
                                object.unitIds[j] = options.longs === $String ? $util.Long.prototype.toString.call(message.unitIds[j]) : options.longs === $Number ? new $util.LongBits(message.unitIds[j].low >>> 0, message.unitIds[j].high >>> 0).toNumber(true) : message.unitIds[j];
                    }
                    return object;
                };

                /**
                 * Converts this SelectInput to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.SelectInput
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                SelectInput.prototype.toJSON = function() {
                    return SelectInput.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for SelectInput
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.SelectInput
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                SelectInput.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.SelectInput";
                };

                return SelectInput;
            })();

            v1.GroundTargetInput = (function() {

                /**
                 * Properties of a GroundTargetInput.
                 * @typedef {Object} barc.browser.v1.GroundTargetInput.$Properties
                 * @property {barc.browser.v1.Position3.$Properties|null} [position] GroundTargetInput position
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a GroundTargetInput.
                 * @memberof barc.browser.v1
                 * @interface IGroundTargetInput
                 * @augments barc.browser.v1.GroundTargetInput.$Properties
                 * @deprecated Use barc.browser.v1.GroundTargetInput.$Properties instead.
                 */

                /**
                 * Shape of a GroundTargetInput.
                 * @typedef {barc.browser.v1.GroundTargetInput.$Properties} barc.browser.v1.GroundTargetInput.$Shape
                 */

                /**
                 * Constructs a new GroundTargetInput.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a GroundTargetInput.
                 * @constructor
                 * @param {barc.browser.v1.GroundTargetInput.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const GroundTargetInput = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * GroundTargetInput position.
                 * @member {barc.browser.v1.Position3.$Properties|null|undefined} position
                 * @memberof barc.browser.v1.GroundTargetInput
                 * @instance
                 */
                GroundTargetInput.prototype.position = null;

                /**
                 * Encodes the specified GroundTargetInput message. Does not implicitly {@link barc.browser.v1.GroundTargetInput.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.GroundTargetInput
                 * @static
                 * @param {barc.browser.v1.GroundTargetInput.$Properties} message GroundTargetInput message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GroundTargetInput.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.position != null && $Object.hasOwnProperty.call(message, "position"))
                        $root.barc.browser.v1.Position3.encode(message.position, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified GroundTargetInput message, length delimited. Does not implicitly {@link barc.browser.v1.GroundTargetInput.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.GroundTargetInput
                 * @static
                 * @param {barc.browser.v1.GroundTargetInput.$Properties} message GroundTargetInput message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GroundTargetInput.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a GroundTargetInput message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.GroundTargetInput
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.GroundTargetInput & barc.browser.v1.GroundTargetInput.$Shape} GroundTargetInput
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                GroundTargetInput.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.GroundTargetInput();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                message.position = $root.barc.browser.v1.Position3.decode(reader, reader.uint32(), $undefined, _depth + 1, message.position);
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a GroundTargetInput message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.GroundTargetInput
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.GroundTargetInput & barc.browser.v1.GroundTargetInput.$Shape} GroundTargetInput
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                GroundTargetInput.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a GroundTargetInput message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.GroundTargetInput
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.GroundTargetInput} GroundTargetInput
                 */
                GroundTargetInput.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.GroundTargetInput)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.GroundTargetInput: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.GroundTargetInput();
                    if (object.position != null) {
                        if (!$util.isObject(object.position))
                            throw $TypeError(".barc.browser.v1.GroundTargetInput.position: object expected");
                        message.position = $root.barc.browser.v1.Position3.fromObject(object.position, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a GroundTargetInput message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.GroundTargetInput
                 * @static
                 * @param {barc.browser.v1.GroundTargetInput} message GroundTargetInput
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                GroundTargetInput.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults)
                        object.position = null;
                    if (message.position != null && $Object.hasOwnProperty.call(message, "position"))
                        object.position = $root.barc.browser.v1.Position3.toObject(message.position, options, _depth + 1);
                    return object;
                };

                /**
                 * Converts this GroundTargetInput to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.GroundTargetInput
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                GroundTargetInput.prototype.toJSON = function() {
                    return GroundTargetInput.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for GroundTargetInput
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.GroundTargetInput
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                GroundTargetInput.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.GroundTargetInput";
                };

                return GroundTargetInput;
            })();

            v1.GuestRequest = (function() {

                /**
                 * Properties of a GuestRequest.
                 * @typedef {Object} barc.browser.v1.GuestRequest.$Properties
                 * @property {Long|null} [requestId] GuestRequest requestId
                 * @property {Uint8Array|null} [sessionId] GuestRequest sessionId
                 * @property {Long|null} [contextSequence] GuestRequest contextSequence
                 * @property {barc.browser.v1.Bootstrap.$Properties|null} [initialize] GuestRequest initialize
                 * @property {barc.browser.v1.Observation.$Properties|null} [observation] GuestRequest observation
                 * @property {barc.browser.v1.SelectInput.$Properties|null} [select] GuestRequest select
                 * @property {barc.browser.v1.GroundTargetInput.$Properties|null} [groundTarget] GuestRequest groundTarget
                 * @property {"initialize"|"observation"|"select"|"groundTarget"} [input] GuestRequest input
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a GuestRequest.
                 * @memberof barc.browser.v1
                 * @interface IGuestRequest
                 * @augments barc.browser.v1.GuestRequest.$Properties
                 * @deprecated Use barc.browser.v1.GuestRequest.$Properties instead.
                 */

                /**
                 * Narrowed shape of a GuestRequest.
                 * @typedef {{
                 *   requestId?: Long|null;
                 *   sessionId?: Uint8Array|null;
                 *   contextSequence?: Long|null;
                 *   initialize?: barc.browser.v1.Bootstrap.$Shape|null;
                 *   observation?: barc.browser.v1.Observation.$Shape|null;
                 *   select?: barc.browser.v1.SelectInput.$Shape|null;
                 *   groundTarget?: barc.browser.v1.GroundTargetInput.$Shape|null;
                 *   $unknowns?: Array.<Uint8Array>;
                 * } & (
                 *   ({ input?: undefined; initialize?: null; observation?: null; select?: null; groundTarget?: null }|{ input?: "initialize"; initialize: barc.browser.v1.Bootstrap.$Shape; observation?: null; select?: null; groundTarget?: null }|{ input?: "observation"; initialize?: null; observation: barc.browser.v1.Observation.$Shape; select?: null; groundTarget?: null }|{ input?: "select"; initialize?: null; observation?: null; select: barc.browser.v1.SelectInput.$Shape; groundTarget?: null }|{ input?: "groundTarget"; initialize?: null; observation?: null; select?: null; groundTarget: barc.browser.v1.GroundTargetInput.$Shape })
                 * )} barc.browser.v1.GuestRequest.$Shape
                 */

                /**
                 * Constructs a new GuestRequest.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a GuestRequest.
                 * @constructor
                 * @param {barc.browser.v1.GuestRequest.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const GuestRequest = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * GuestRequest requestId.
                 * @member {Long} requestId
                 * @memberof barc.browser.v1.GuestRequest
                 * @instance
                 */
                GuestRequest.prototype.requestId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * GuestRequest sessionId.
                 * @member {Uint8Array} sessionId
                 * @memberof barc.browser.v1.GuestRequest
                 * @instance
                 */
                GuestRequest.prototype.sessionId = $util.newBuffer([]);

                /**
                 * GuestRequest contextSequence.
                 * @member {Long} contextSequence
                 * @memberof barc.browser.v1.GuestRequest
                 * @instance
                 */
                GuestRequest.prototype.contextSequence = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * GuestRequest initialize.
                 * @member {barc.browser.v1.Bootstrap.$Properties|null|undefined} initialize
                 * @memberof barc.browser.v1.GuestRequest
                 * @instance
                 */
                GuestRequest.prototype.initialize = null;

                /**
                 * GuestRequest observation.
                 * @member {barc.browser.v1.Observation.$Properties|null|undefined} observation
                 * @memberof barc.browser.v1.GuestRequest
                 * @instance
                 */
                GuestRequest.prototype.observation = null;

                /**
                 * GuestRequest select.
                 * @member {barc.browser.v1.SelectInput.$Properties|null|undefined} select
                 * @memberof barc.browser.v1.GuestRequest
                 * @instance
                 */
                GuestRequest.prototype.select = null;

                /**
                 * GuestRequest groundTarget.
                 * @member {barc.browser.v1.GroundTargetInput.$Properties|null|undefined} groundTarget
                 * @memberof barc.browser.v1.GuestRequest
                 * @instance
                 */
                GuestRequest.prototype.groundTarget = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * GuestRequest input.
                 * @member {"initialize"|"observation"|"select"|"groundTarget"|undefined} input
                 * @memberof barc.browser.v1.GuestRequest
                 * @instance
                 */
                $Object.defineProperty(GuestRequest.prototype, "input", {
                    get: $util.oneOfGetter($oneOfFields = ["initialize", "observation", "select", "groundTarget"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified GuestRequest message. Does not implicitly {@link barc.browser.v1.GuestRequest.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.GuestRequest
                 * @static
                 * @param {barc.browser.v1.GuestRequest.$Properties} message GuestRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GuestRequest.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId") && (typeof message.requestId === "object" ? message.requestId.low || message.requestId.high : message.requestId !== 0))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.requestId);
                    if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId.length)
                        writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.sessionId);
                    if (message.contextSequence != null && $Object.hasOwnProperty.call(message, "contextSequence") && (typeof message.contextSequence === "object" ? message.contextSequence.low || message.contextSequence.high : message.contextSequence !== 0))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.contextSequence);
                    if (message.initialize != null && $Object.hasOwnProperty.call(message, "initialize"))
                        $root.barc.browser.v1.Bootstrap.encode(message.initialize, writer.uint32(/* id 10, wireType 2 =*/82).fork(), _depth + 1).ldelim();
                    if (message.observation != null && $Object.hasOwnProperty.call(message, "observation"))
                        $root.barc.browser.v1.Observation.encode(message.observation, writer.uint32(/* id 11, wireType 2 =*/90).fork(), _depth + 1).ldelim();
                    if (message.select != null && $Object.hasOwnProperty.call(message, "select"))
                        $root.barc.browser.v1.SelectInput.encode(message.select, writer.uint32(/* id 12, wireType 2 =*/98).fork(), _depth + 1).ldelim();
                    if (message.groundTarget != null && $Object.hasOwnProperty.call(message, "groundTarget"))
                        $root.barc.browser.v1.GroundTargetInput.encode(message.groundTarget, writer.uint32(/* id 13, wireType 2 =*/106).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified GuestRequest message, length delimited. Does not implicitly {@link barc.browser.v1.GuestRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.GuestRequest
                 * @static
                 * @param {barc.browser.v1.GuestRequest.$Properties} message GuestRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GuestRequest.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a GuestRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.GuestRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.GuestRequest & barc.browser.v1.GuestRequest.$Shape} GuestRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                GuestRequest.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.GuestRequest();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.requestId = value;
                                else
                                    delete message.requestId;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.sessionId = value;
                                else
                                    delete message.sessionId;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.contextSequence = value;
                                else
                                    delete message.contextSequence;
                                continue;
                            }
                        case 10: {
                                if (wireType !== 2)
                                    break;
                                message.initialize = $root.barc.browser.v1.Bootstrap.decode(reader, reader.uint32(), $undefined, _depth + 1, message.initialize);
                                message.input = "initialize";
                                continue;
                            }
                        case 11: {
                                if (wireType !== 2)
                                    break;
                                message.observation = $root.barc.browser.v1.Observation.decode(reader, reader.uint32(), $undefined, _depth + 1, message.observation);
                                message.input = "observation";
                                continue;
                            }
                        case 12: {
                                if (wireType !== 2)
                                    break;
                                message.select = $root.barc.browser.v1.SelectInput.decode(reader, reader.uint32(), $undefined, _depth + 1, message.select);
                                message.input = "select";
                                continue;
                            }
                        case 13: {
                                if (wireType !== 2)
                                    break;
                                message.groundTarget = $root.barc.browser.v1.GroundTargetInput.decode(reader, reader.uint32(), $undefined, _depth + 1, message.groundTarget);
                                message.input = "groundTarget";
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a GuestRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.GuestRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.GuestRequest & barc.browser.v1.GuestRequest.$Shape} GuestRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                GuestRequest.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a GuestRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.GuestRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.GuestRequest} GuestRequest
                 */
                GuestRequest.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.GuestRequest)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.GuestRequest: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.GuestRequest();
                    if (object.requestId != null)
                        if (typeof object.requestId === "object" ? object.requestId.low || object.requestId.high : $Number(object.requestId) !== 0)
                            if ($util.Long)
                                message.requestId = $util.Long.fromValue(object.requestId, true);
                            else if (typeof object.requestId === "string")
                                message.requestId = $parseInt(object.requestId, 10);
                            else if (typeof object.requestId === "number")
                                message.requestId = object.requestId;
                            else if (typeof object.requestId === "object")
                                message.requestId = new $util.LongBits(object.requestId.low >>> 0, object.requestId.high >>> 0).toNumber(true);
                    if (object.sessionId != null)
                        if (object.sessionId.length)
                            if (typeof object.sessionId === "string")
                                $util.base64.decode(object.sessionId, message.sessionId = $util.newBuffer($util.base64.length(object.sessionId)), 0);
                            else if (object.sessionId.length >= 0)
                                message.sessionId = object.sessionId;
                    if (object.contextSequence != null)
                        if (typeof object.contextSequence === "object" ? object.contextSequence.low || object.contextSequence.high : $Number(object.contextSequence) !== 0)
                            if ($util.Long)
                                message.contextSequence = $util.Long.fromValue(object.contextSequence, true);
                            else if (typeof object.contextSequence === "string")
                                message.contextSequence = $parseInt(object.contextSequence, 10);
                            else if (typeof object.contextSequence === "number")
                                message.contextSequence = object.contextSequence;
                            else if (typeof object.contextSequence === "object")
                                message.contextSequence = new $util.LongBits(object.contextSequence.low >>> 0, object.contextSequence.high >>> 0).toNumber(true);
                    if (object.initialize != null) {
                        if (!$util.isObject(object.initialize))
                            throw $TypeError(".barc.browser.v1.GuestRequest.initialize: object expected");
                        message.initialize = $root.barc.browser.v1.Bootstrap.fromObject(object.initialize, _depth + 1);
                    }
                    if (object.observation != null) {
                        if (!$util.isObject(object.observation))
                            throw $TypeError(".barc.browser.v1.GuestRequest.observation: object expected");
                        message.observation = $root.barc.browser.v1.Observation.fromObject(object.observation, _depth + 1);
                    }
                    if (object.select != null) {
                        if (!$util.isObject(object.select))
                            throw $TypeError(".barc.browser.v1.GuestRequest.select: object expected");
                        message.select = $root.barc.browser.v1.SelectInput.fromObject(object.select, _depth + 1);
                    }
                    if (object.groundTarget != null) {
                        if (!$util.isObject(object.groundTarget))
                            throw $TypeError(".barc.browser.v1.GuestRequest.groundTarget: object expected");
                        message.groundTarget = $root.barc.browser.v1.GroundTargetInput.fromObject(object.groundTarget, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a GuestRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.GuestRequest
                 * @static
                 * @param {barc.browser.v1.GuestRequest} message GuestRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                GuestRequest.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.requestId = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.requestId = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        if (options.bytes === $String)
                            object.sessionId = "";
                        else {
                            object.sessionId = [];
                            if (options.bytes !== $Array)
                                object.sessionId = $util.newBuffer(object.sessionId);
                        }
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.contextSequence = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.contextSequence = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                    }
                    if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.requestId = typeof message.requestId === "number" ? $BigInt(message.requestId) : $util.Long.fromBits(message.requestId.low >>> 0, message.requestId.high >>> 0, true).toBigInt();
                        else if (typeof message.requestId === "number")
                            object.requestId = options.longs === $String ? $String(message.requestId) : message.requestId;
                        else
                            object.requestId = options.longs === $String ? $util.Long.prototype.toString.call(message.requestId) : options.longs === $Number ? new $util.LongBits(message.requestId.low >>> 0, message.requestId.high >>> 0).toNumber(true) : message.requestId;
                    if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                        object.sessionId = options.bytes === $String ? $util.base64.encode(message.sessionId, 0, message.sessionId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.sessionId) : message.sessionId;
                    if (message.contextSequence != null && $Object.hasOwnProperty.call(message, "contextSequence"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.contextSequence = typeof message.contextSequence === "number" ? $BigInt(message.contextSequence) : $util.Long.fromBits(message.contextSequence.low >>> 0, message.contextSequence.high >>> 0, true).toBigInt();
                        else if (typeof message.contextSequence === "number")
                            object.contextSequence = options.longs === $String ? $String(message.contextSequence) : message.contextSequence;
                        else
                            object.contextSequence = options.longs === $String ? $util.Long.prototype.toString.call(message.contextSequence) : options.longs === $Number ? new $util.LongBits(message.contextSequence.low >>> 0, message.contextSequence.high >>> 0).toNumber(true) : message.contextSequence;
                    if (message.initialize != null && $Object.hasOwnProperty.call(message, "initialize")) {
                        object.initialize = $root.barc.browser.v1.Bootstrap.toObject(message.initialize, options, _depth + 1);
                        if (options.oneofs)
                            object.input = "initialize";
                    }
                    if (message.observation != null && $Object.hasOwnProperty.call(message, "observation")) {
                        object.observation = $root.barc.browser.v1.Observation.toObject(message.observation, options, _depth + 1);
                        if (options.oneofs)
                            object.input = "observation";
                    }
                    if (message.select != null && $Object.hasOwnProperty.call(message, "select")) {
                        object.select = $root.barc.browser.v1.SelectInput.toObject(message.select, options, _depth + 1);
                        if (options.oneofs)
                            object.input = "select";
                    }
                    if (message.groundTarget != null && $Object.hasOwnProperty.call(message, "groundTarget")) {
                        object.groundTarget = $root.barc.browser.v1.GroundTargetInput.toObject(message.groundTarget, options, _depth + 1);
                        if (options.oneofs)
                            object.input = "groundTarget";
                    }
                    return object;
                };

                /**
                 * Converts this GuestRequest to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.GuestRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                GuestRequest.prototype.toJSON = function() {
                    return GuestRequest.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for GuestRequest
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.GuestRequest
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                GuestRequest.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.GuestRequest";
                };

                return GuestRequest;
            })();

            v1.MovePreview = (function() {

                /**
                 * Properties of a MovePreview.
                 * @typedef {Object} barc.browser.v1.MovePreview.$Properties
                 * @property {Array.<Long>|null} [unitIds] MovePreview unitIds
                 * @property {barc.browser.v1.Position3.$Properties|null} [groundTarget] MovePreview groundTarget
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a MovePreview.
                 * @memberof barc.browser.v1
                 * @interface IMovePreview
                 * @augments barc.browser.v1.MovePreview.$Properties
                 * @deprecated Use barc.browser.v1.MovePreview.$Properties instead.
                 */

                /**
                 * Shape of a MovePreview.
                 * @typedef {barc.browser.v1.MovePreview.$Properties} barc.browser.v1.MovePreview.$Shape
                 */

                /**
                 * Constructs a new MovePreview.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a MovePreview.
                 * @constructor
                 * @param {barc.browser.v1.MovePreview.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const MovePreview = function (properties) {
                    this.unitIds = [];
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * MovePreview unitIds.
                 * @member {Array.<Long>} unitIds
                 * @memberof barc.browser.v1.MovePreview
                 * @instance
                 */
                MovePreview.prototype.unitIds = $util.emptyArray;

                /**
                 * MovePreview groundTarget.
                 * @member {barc.browser.v1.Position3.$Properties|null|undefined} groundTarget
                 * @memberof barc.browser.v1.MovePreview
                 * @instance
                 */
                MovePreview.prototype.groundTarget = null;

                /**
                 * Encodes the specified MovePreview message. Does not implicitly {@link barc.browser.v1.MovePreview.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.MovePreview
                 * @static
                 * @param {barc.browser.v1.MovePreview.$Properties} message MovePreview message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MovePreview.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.unitIds != null && message.unitIds.length)
                        writer.uint32(/* id 1, wireType 2 =*/10).uint64s(message.unitIds);
                    if (message.groundTarget != null && $Object.hasOwnProperty.call(message, "groundTarget"))
                        $root.barc.browser.v1.Position3.encode(message.groundTarget, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified MovePreview message, length delimited. Does not implicitly {@link barc.browser.v1.MovePreview.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.MovePreview
                 * @static
                 * @param {barc.browser.v1.MovePreview.$Properties} message MovePreview message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MovePreview.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a MovePreview message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.MovePreview
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.MovePreview & barc.browser.v1.MovePreview.$Shape} MovePreview
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MovePreview.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.MovePreview();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType === 2) {
                                    if (!(message.unitIds && message.unitIds.length))
                                        message.unitIds = [];
                                    reader.uint64s(message.unitIds);
                                    continue;
                                }
                                if (wireType !== 0)
                                    break;
                                if (!(message.unitIds && message.unitIds.length))
                                    message.unitIds = [];
                                message.unitIds.push(reader.uint64());
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                message.groundTarget = $root.barc.browser.v1.Position3.decode(reader, reader.uint32(), $undefined, _depth + 1, message.groundTarget);
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a MovePreview message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.MovePreview
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.MovePreview & barc.browser.v1.MovePreview.$Shape} MovePreview
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MovePreview.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a MovePreview message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.MovePreview
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.MovePreview} MovePreview
                 */
                MovePreview.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.MovePreview)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.MovePreview: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.MovePreview();
                    if (object.unitIds) {
                        if (!$Array.isArray(object.unitIds))
                            throw $TypeError(".barc.browser.v1.MovePreview.unitIds: array expected");
                        message.unitIds = $Array(object.unitIds.length);
                        for (let i = 0; i < object.unitIds.length; ++i)
                            if ($util.Long)
                                message.unitIds[i] = $util.Long.fromValue(object.unitIds[i], true);
                            else if (typeof object.unitIds[i] === "string")
                                message.unitIds[i] = $parseInt(object.unitIds[i], 10);
                            else if (typeof object.unitIds[i] === "number")
                                message.unitIds[i] = object.unitIds[i];
                            else if (typeof object.unitIds[i] === "object")
                                message.unitIds[i] = new $util.LongBits(object.unitIds[i].low >>> 0, object.unitIds[i].high >>> 0).toNumber(true);
                    }
                    if (object.groundTarget != null) {
                        if (!$util.isObject(object.groundTarget))
                            throw $TypeError(".barc.browser.v1.MovePreview.groundTarget: object expected");
                        message.groundTarget = $root.barc.browser.v1.Position3.fromObject(object.groundTarget, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a MovePreview message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.MovePreview
                 * @static
                 * @param {barc.browser.v1.MovePreview} message MovePreview
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                MovePreview.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.unitIds = [];
                    if (options.defaults)
                        object.groundTarget = null;
                    if (message.unitIds && message.unitIds.length) {
                        object.unitIds = $Array(message.unitIds.length);
                        for (let j = 0; j < message.unitIds.length; ++j)
                            if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                                object.unitIds[j] = typeof message.unitIds[j] === "number" ? $BigInt(message.unitIds[j]) : $util.Long.fromBits(message.unitIds[j].low >>> 0, message.unitIds[j].high >>> 0, true).toBigInt();
                            else if (typeof message.unitIds[j] === "number")
                                object.unitIds[j] = options.longs === $String ? $String(message.unitIds[j]) : message.unitIds[j];
                            else
                                object.unitIds[j] = options.longs === $String ? $util.Long.prototype.toString.call(message.unitIds[j]) : options.longs === $Number ? new $util.LongBits(message.unitIds[j].low >>> 0, message.unitIds[j].high >>> 0).toNumber(true) : message.unitIds[j];
                    }
                    if (message.groundTarget != null && $Object.hasOwnProperty.call(message, "groundTarget"))
                        object.groundTarget = $root.barc.browser.v1.Position3.toObject(message.groundTarget, options, _depth + 1);
                    return object;
                };

                /**
                 * Converts this MovePreview to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.MovePreview
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                MovePreview.prototype.toJSON = function() {
                    return MovePreview.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for MovePreview
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.MovePreview
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                MovePreview.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.MovePreview";
                };

                return MovePreview;
            })();

            v1.GuestResponse = (function() {

                /**
                 * Properties of a GuestResponse.
                 * @typedef {Object} barc.browser.v1.GuestResponse.$Properties
                 * @property {Long|null} [requestId] GuestResponse requestId
                 * @property {Uint8Array|null} [sessionId] GuestResponse sessionId
                 * @property {Long|null} [consumedSequence] GuestResponse consumedSequence
                 * @property {barc.browser.v1.GuestAckStatus|null} [acknowledgment] GuestResponse acknowledgment
                 * @property {string|null} [refusalDetail] GuestResponse refusalDetail
                 * @property {barc.browser.v1.IntentKind|null} [kind] GuestResponse kind
                 * @property {barc.browser.v1.MovePreview.$Properties|null} [move] GuestResponse move
                 * @property {"move"} [preview] GuestResponse preview
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a GuestResponse.
                 * @memberof barc.browser.v1
                 * @interface IGuestResponse
                 * @augments barc.browser.v1.GuestResponse.$Properties
                 * @deprecated Use barc.browser.v1.GuestResponse.$Properties instead.
                 */

                /**
                 * Narrowed shape of a GuestResponse.
                 * @typedef {{
                 *   requestId?: Long|null;
                 *   sessionId?: Uint8Array|null;
                 *   consumedSequence?: Long|null;
                 *   acknowledgment?: barc.browser.v1.GuestAckStatus|null;
                 *   refusalDetail?: string|null;
                 *   kind?: barc.browser.v1.IntentKind|null;
                 *   move?: barc.browser.v1.MovePreview.$Shape|null;
                 *   $unknowns?: Array.<Uint8Array>;
                 * } & (
                 *   ({ preview?: undefined; move?: null }|{ preview?: "move"; move: barc.browser.v1.MovePreview.$Shape })
                 * )} barc.browser.v1.GuestResponse.$Shape
                 */

                /**
                 * Constructs a new GuestResponse.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a GuestResponse.
                 * @constructor
                 * @param {barc.browser.v1.GuestResponse.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const GuestResponse = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * GuestResponse requestId.
                 * @member {Long} requestId
                 * @memberof barc.browser.v1.GuestResponse
                 * @instance
                 */
                GuestResponse.prototype.requestId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * GuestResponse sessionId.
                 * @member {Uint8Array} sessionId
                 * @memberof barc.browser.v1.GuestResponse
                 * @instance
                 */
                GuestResponse.prototype.sessionId = $util.newBuffer([]);

                /**
                 * GuestResponse consumedSequence.
                 * @member {Long} consumedSequence
                 * @memberof barc.browser.v1.GuestResponse
                 * @instance
                 */
                GuestResponse.prototype.consumedSequence = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * GuestResponse acknowledgment.
                 * @member {barc.browser.v1.GuestAckStatus} acknowledgment
                 * @memberof barc.browser.v1.GuestResponse
                 * @instance
                 */
                GuestResponse.prototype.acknowledgment = 0;

                /**
                 * GuestResponse refusalDetail.
                 * @member {string} refusalDetail
                 * @memberof barc.browser.v1.GuestResponse
                 * @instance
                 */
                GuestResponse.prototype.refusalDetail = "";

                /**
                 * GuestResponse kind.
                 * @member {barc.browser.v1.IntentKind} kind
                 * @memberof barc.browser.v1.GuestResponse
                 * @instance
                 */
                GuestResponse.prototype.kind = 0;

                /**
                 * GuestResponse move.
                 * @member {barc.browser.v1.MovePreview.$Properties|null|undefined} move
                 * @memberof barc.browser.v1.GuestResponse
                 * @instance
                 */
                GuestResponse.prototype.move = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * GuestResponse preview.
                 * @member {"move"|undefined} preview
                 * @memberof barc.browser.v1.GuestResponse
                 * @instance
                 */
                $Object.defineProperty(GuestResponse.prototype, "preview", {
                    get: $util.oneOfGetter($oneOfFields = ["move"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified GuestResponse message. Does not implicitly {@link barc.browser.v1.GuestResponse.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.GuestResponse
                 * @static
                 * @param {barc.browser.v1.GuestResponse.$Properties} message GuestResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GuestResponse.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId") && (typeof message.requestId === "object" ? message.requestId.low || message.requestId.high : message.requestId !== 0))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.requestId);
                    if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId.length)
                        writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.sessionId);
                    if (message.consumedSequence != null && $Object.hasOwnProperty.call(message, "consumedSequence") && (typeof message.consumedSequence === "object" ? message.consumedSequence.low || message.consumedSequence.high : message.consumedSequence !== 0))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.consumedSequence);
                    if (message.acknowledgment != null && $Object.hasOwnProperty.call(message, "acknowledgment") && message.acknowledgment !== 0)
                        writer.uint32(/* id 4, wireType 0 =*/32).int32(message.acknowledgment);
                    if (message.refusalDetail != null && $Object.hasOwnProperty.call(message, "refusalDetail") && message.refusalDetail !== "")
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.refusalDetail);
                    if (message.kind != null && $Object.hasOwnProperty.call(message, "kind") && message.kind !== 0)
                        writer.uint32(/* id 6, wireType 0 =*/48).int32(message.kind);
                    if (message.move != null && $Object.hasOwnProperty.call(message, "move"))
                        $root.barc.browser.v1.MovePreview.encode(message.move, writer.uint32(/* id 10, wireType 2 =*/82).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified GuestResponse message, length delimited. Does not implicitly {@link barc.browser.v1.GuestResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.GuestResponse
                 * @static
                 * @param {barc.browser.v1.GuestResponse.$Properties} message GuestResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GuestResponse.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a GuestResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.GuestResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.GuestResponse & barc.browser.v1.GuestResponse.$Shape} GuestResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                GuestResponse.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.GuestResponse();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.requestId = value;
                                else
                                    delete message.requestId;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.sessionId = value;
                                else
                                    delete message.sessionId;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.consumedSequence = value;
                                else
                                    delete message.consumedSequence;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.int32())
                                    message.acknowledgment = value;
                                else
                                    delete message.acknowledgment;
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.refusalDetail = value;
                                else
                                    delete message.refusalDetail;
                                continue;
                            }
                        case 6: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.int32())
                                    message.kind = value;
                                else
                                    delete message.kind;
                                continue;
                            }
                        case 10: {
                                if (wireType !== 2)
                                    break;
                                message.move = $root.barc.browser.v1.MovePreview.decode(reader, reader.uint32(), $undefined, _depth + 1, message.move);
                                message.preview = "move";
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a GuestResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.GuestResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.GuestResponse & barc.browser.v1.GuestResponse.$Shape} GuestResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                GuestResponse.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a GuestResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.GuestResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.GuestResponse} GuestResponse
                 */
                GuestResponse.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.GuestResponse)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.GuestResponse: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.GuestResponse();
                    if (object.requestId != null)
                        if (typeof object.requestId === "object" ? object.requestId.low || object.requestId.high : $Number(object.requestId) !== 0)
                            if ($util.Long)
                                message.requestId = $util.Long.fromValue(object.requestId, true);
                            else if (typeof object.requestId === "string")
                                message.requestId = $parseInt(object.requestId, 10);
                            else if (typeof object.requestId === "number")
                                message.requestId = object.requestId;
                            else if (typeof object.requestId === "object")
                                message.requestId = new $util.LongBits(object.requestId.low >>> 0, object.requestId.high >>> 0).toNumber(true);
                    if (object.sessionId != null)
                        if (object.sessionId.length)
                            if (typeof object.sessionId === "string")
                                $util.base64.decode(object.sessionId, message.sessionId = $util.newBuffer($util.base64.length(object.sessionId)), 0);
                            else if (object.sessionId.length >= 0)
                                message.sessionId = object.sessionId;
                    if (object.consumedSequence != null)
                        if (typeof object.consumedSequence === "object" ? object.consumedSequence.low || object.consumedSequence.high : $Number(object.consumedSequence) !== 0)
                            if ($util.Long)
                                message.consumedSequence = $util.Long.fromValue(object.consumedSequence, true);
                            else if (typeof object.consumedSequence === "string")
                                message.consumedSequence = $parseInt(object.consumedSequence, 10);
                            else if (typeof object.consumedSequence === "number")
                                message.consumedSequence = object.consumedSequence;
                            else if (typeof object.consumedSequence === "object")
                                message.consumedSequence = new $util.LongBits(object.consumedSequence.low >>> 0, object.consumedSequence.high >>> 0).toNumber(true);
                    if (object.acknowledgment !== 0 && (typeof object.acknowledgment !== "string" || $root.barc.browser.v1.GuestAckStatus[object.acknowledgment] !== 0))
                        switch (object.acknowledgment) {
                        case "GUEST_ACK_STATUS_UNSPECIFIED":
                        case 0:
                            message.acknowledgment = 0;
                            break;
                        case "GUEST_ACK_STATUS_CONSUMED":
                        case 1:
                            message.acknowledgment = 1;
                            break;
                        case "GUEST_ACK_STATUS_REFUSED":
                        case 2:
                            message.acknowledgment = 2;
                            break;
                        default:
                            if (typeof object.acknowledgment === "number" && (object.acknowledgment | 0) === object.acknowledgment)
                                message.acknowledgment = object.acknowledgment;
                        }
                    if (object.refusalDetail != null)
                        if (typeof object.refusalDetail !== "string" || object.refusalDetail.length)
                            message.refusalDetail = $String(object.refusalDetail);
                    if (object.kind !== 0 && (typeof object.kind !== "string" || $root.barc.browser.v1.IntentKind[object.kind] !== 0))
                        switch (object.kind) {
                        case "INTENT_KIND_UNSPECIFIED":
                        case 0:
                            message.kind = 0;
                            break;
                        case "INTENT_KIND_MOVE":
                        case 1:
                            message.kind = 1;
                            break;
                        default:
                            if (typeof object.kind === "number" && (object.kind | 0) === object.kind)
                                message.kind = object.kind;
                        }
                    if (object.move != null) {
                        if (!$util.isObject(object.move))
                            throw $TypeError(".barc.browser.v1.GuestResponse.move: object expected");
                        message.move = $root.barc.browser.v1.MovePreview.fromObject(object.move, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a GuestResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.GuestResponse
                 * @static
                 * @param {barc.browser.v1.GuestResponse} message GuestResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                GuestResponse.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.requestId = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.requestId = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        if (options.bytes === $String)
                            object.sessionId = "";
                        else {
                            object.sessionId = [];
                            if (options.bytes !== $Array)
                                object.sessionId = $util.newBuffer(object.sessionId);
                        }
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.consumedSequence = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.consumedSequence = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        object.acknowledgment = options.enums === $String ? "GUEST_ACK_STATUS_UNSPECIFIED" : 0;
                        object.refusalDetail = "";
                        object.kind = options.enums === $String ? "INTENT_KIND_UNSPECIFIED" : 0;
                    }
                    if (message.requestId != null && $Object.hasOwnProperty.call(message, "requestId"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.requestId = typeof message.requestId === "number" ? $BigInt(message.requestId) : $util.Long.fromBits(message.requestId.low >>> 0, message.requestId.high >>> 0, true).toBigInt();
                        else if (typeof message.requestId === "number")
                            object.requestId = options.longs === $String ? $String(message.requestId) : message.requestId;
                        else
                            object.requestId = options.longs === $String ? $util.Long.prototype.toString.call(message.requestId) : options.longs === $Number ? new $util.LongBits(message.requestId.low >>> 0, message.requestId.high >>> 0).toNumber(true) : message.requestId;
                    if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                        object.sessionId = options.bytes === $String ? $util.base64.encode(message.sessionId, 0, message.sessionId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.sessionId) : message.sessionId;
                    if (message.consumedSequence != null && $Object.hasOwnProperty.call(message, "consumedSequence"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.consumedSequence = typeof message.consumedSequence === "number" ? $BigInt(message.consumedSequence) : $util.Long.fromBits(message.consumedSequence.low >>> 0, message.consumedSequence.high >>> 0, true).toBigInt();
                        else if (typeof message.consumedSequence === "number")
                            object.consumedSequence = options.longs === $String ? $String(message.consumedSequence) : message.consumedSequence;
                        else
                            object.consumedSequence = options.longs === $String ? $util.Long.prototype.toString.call(message.consumedSequence) : options.longs === $Number ? new $util.LongBits(message.consumedSequence.low >>> 0, message.consumedSequence.high >>> 0).toNumber(true) : message.consumedSequence;
                    if (message.acknowledgment != null && $Object.hasOwnProperty.call(message, "acknowledgment"))
                        object.acknowledgment = options.enums === $String ? $root.barc.browser.v1.GuestAckStatus[message.acknowledgment] === $undefined ? message.acknowledgment : $root.barc.browser.v1.GuestAckStatus[message.acknowledgment] : message.acknowledgment;
                    if (message.refusalDetail != null && $Object.hasOwnProperty.call(message, "refusalDetail"))
                        object.refusalDetail = message.refusalDetail;
                    if (message.kind != null && $Object.hasOwnProperty.call(message, "kind"))
                        object.kind = options.enums === $String ? $root.barc.browser.v1.IntentKind[message.kind] === $undefined ? message.kind : $root.barc.browser.v1.IntentKind[message.kind] : message.kind;
                    if (message.move != null && $Object.hasOwnProperty.call(message, "move")) {
                        object.move = $root.barc.browser.v1.MovePreview.toObject(message.move, options, _depth + 1);
                        if (options.oneofs)
                            object.preview = "move";
                    }
                    return object;
                };

                /**
                 * Converts this GuestResponse to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.GuestResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                GuestResponse.prototype.toJSON = function() {
                    return GuestResponse.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for GuestResponse
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.GuestResponse
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                GuestResponse.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.GuestResponse";
                };

                return GuestResponse;
            })();

            v1.ServerEnvelope = (function() {

                /**
                 * Properties of a ServerEnvelope.
                 * @typedef {Object} barc.browser.v1.ServerEnvelope.$Properties
                 * @property {barc.browser.v1.Bootstrap.$Properties|null} [bootstrap] ServerEnvelope bootstrap
                 * @property {barc.browser.v1.Observation.$Properties|null} [observation] ServerEnvelope observation
                 * @property {barc.browser.v1.GuestResponse.$Properties|null} [preview] ServerEnvelope preview
                 * @property {"bootstrap"|"observation"|"preview"} [body] ServerEnvelope body
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a ServerEnvelope.
                 * @memberof barc.browser.v1
                 * @interface IServerEnvelope
                 * @augments barc.browser.v1.ServerEnvelope.$Properties
                 * @deprecated Use barc.browser.v1.ServerEnvelope.$Properties instead.
                 */

                /**
                 * Narrowed shape of a ServerEnvelope.
                 * @typedef {{
                 *   bootstrap?: barc.browser.v1.Bootstrap.$Shape|null;
                 *   observation?: barc.browser.v1.Observation.$Shape|null;
                 *   preview?: barc.browser.v1.GuestResponse.$Shape|null;
                 *   $unknowns?: Array.<Uint8Array>;
                 * } & (
                 *   ({ body?: undefined; bootstrap?: null; observation?: null; preview?: null }|{ body?: "bootstrap"; bootstrap: barc.browser.v1.Bootstrap.$Shape; observation?: null; preview?: null }|{ body?: "observation"; bootstrap?: null; observation: barc.browser.v1.Observation.$Shape; preview?: null }|{ body?: "preview"; bootstrap?: null; observation?: null; preview: barc.browser.v1.GuestResponse.$Shape })
                 * )} barc.browser.v1.ServerEnvelope.$Shape
                 */

                /**
                 * Constructs a new ServerEnvelope.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a ServerEnvelope.
                 * @constructor
                 * @param {barc.browser.v1.ServerEnvelope.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const ServerEnvelope = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * ServerEnvelope bootstrap.
                 * @member {barc.browser.v1.Bootstrap.$Properties|null|undefined} bootstrap
                 * @memberof barc.browser.v1.ServerEnvelope
                 * @instance
                 */
                ServerEnvelope.prototype.bootstrap = null;

                /**
                 * ServerEnvelope observation.
                 * @member {barc.browser.v1.Observation.$Properties|null|undefined} observation
                 * @memberof barc.browser.v1.ServerEnvelope
                 * @instance
                 */
                ServerEnvelope.prototype.observation = null;

                /**
                 * ServerEnvelope preview.
                 * @member {barc.browser.v1.GuestResponse.$Properties|null|undefined} preview
                 * @memberof barc.browser.v1.ServerEnvelope
                 * @instance
                 */
                ServerEnvelope.prototype.preview = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * ServerEnvelope body.
                 * @member {"bootstrap"|"observation"|"preview"|undefined} body
                 * @memberof barc.browser.v1.ServerEnvelope
                 * @instance
                 */
                $Object.defineProperty(ServerEnvelope.prototype, "body", {
                    get: $util.oneOfGetter($oneOfFields = ["bootstrap", "observation", "preview"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified ServerEnvelope message. Does not implicitly {@link barc.browser.v1.ServerEnvelope.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.ServerEnvelope
                 * @static
                 * @param {barc.browser.v1.ServerEnvelope.$Properties} message ServerEnvelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ServerEnvelope.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.bootstrap != null && $Object.hasOwnProperty.call(message, "bootstrap"))
                        $root.barc.browser.v1.Bootstrap.encode(message.bootstrap, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.observation != null && $Object.hasOwnProperty.call(message, "observation"))
                        $root.barc.browser.v1.Observation.encode(message.observation, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                    if (message.preview != null && $Object.hasOwnProperty.call(message, "preview"))
                        $root.barc.browser.v1.GuestResponse.encode(message.preview, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ServerEnvelope message, length delimited. Does not implicitly {@link barc.browser.v1.ServerEnvelope.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.ServerEnvelope
                 * @static
                 * @param {barc.browser.v1.ServerEnvelope.$Properties} message ServerEnvelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ServerEnvelope.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a ServerEnvelope message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.ServerEnvelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ServerEnvelope & barc.browser.v1.ServerEnvelope.$Shape} ServerEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ServerEnvelope.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.ServerEnvelope();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                message.bootstrap = $root.barc.browser.v1.Bootstrap.decode(reader, reader.uint32(), $undefined, _depth + 1, message.bootstrap);
                                message.body = "bootstrap";
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                message.observation = $root.barc.browser.v1.Observation.decode(reader, reader.uint32(), $undefined, _depth + 1, message.observation);
                                message.body = "observation";
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                message.preview = $root.barc.browser.v1.GuestResponse.decode(reader, reader.uint32(), $undefined, _depth + 1, message.preview);
                                message.body = "preview";
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a ServerEnvelope message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.ServerEnvelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ServerEnvelope & barc.browser.v1.ServerEnvelope.$Shape} ServerEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ServerEnvelope.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a ServerEnvelope message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.ServerEnvelope
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.ServerEnvelope} ServerEnvelope
                 */
                ServerEnvelope.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.ServerEnvelope)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.ServerEnvelope: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.ServerEnvelope();
                    if (object.bootstrap != null) {
                        if (!$util.isObject(object.bootstrap))
                            throw $TypeError(".barc.browser.v1.ServerEnvelope.bootstrap: object expected");
                        message.bootstrap = $root.barc.browser.v1.Bootstrap.fromObject(object.bootstrap, _depth + 1);
                    }
                    if (object.observation != null) {
                        if (!$util.isObject(object.observation))
                            throw $TypeError(".barc.browser.v1.ServerEnvelope.observation: object expected");
                        message.observation = $root.barc.browser.v1.Observation.fromObject(object.observation, _depth + 1);
                    }
                    if (object.preview != null) {
                        if (!$util.isObject(object.preview))
                            throw $TypeError(".barc.browser.v1.ServerEnvelope.preview: object expected");
                        message.preview = $root.barc.browser.v1.GuestResponse.fromObject(object.preview, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ServerEnvelope message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.ServerEnvelope
                 * @static
                 * @param {barc.browser.v1.ServerEnvelope} message ServerEnvelope
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ServerEnvelope.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (message.bootstrap != null && $Object.hasOwnProperty.call(message, "bootstrap")) {
                        object.bootstrap = $root.barc.browser.v1.Bootstrap.toObject(message.bootstrap, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "bootstrap";
                    }
                    if (message.observation != null && $Object.hasOwnProperty.call(message, "observation")) {
                        object.observation = $root.barc.browser.v1.Observation.toObject(message.observation, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "observation";
                    }
                    if (message.preview != null && $Object.hasOwnProperty.call(message, "preview")) {
                        object.preview = $root.barc.browser.v1.GuestResponse.toObject(message.preview, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "preview";
                    }
                    return object;
                };

                /**
                 * Converts this ServerEnvelope to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.ServerEnvelope
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ServerEnvelope.prototype.toJSON = function() {
                    return ServerEnvelope.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for ServerEnvelope
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.ServerEnvelope
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                ServerEnvelope.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.ServerEnvelope";
                };

                return ServerEnvelope;
            })();

            v1.ClientEnvelope = (function() {

                /**
                 * Properties of a ClientEnvelope.
                 * @typedef {Object} barc.browser.v1.ClientEnvelope.$Properties
                 * @property {barc.browser.v1.ClientAuth.$Properties|null} [authenticate] ClientEnvelope authenticate
                 * @property {"authenticate"} [body] ClientEnvelope body
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a ClientEnvelope.
                 * @memberof barc.browser.v1
                 * @interface IClientEnvelope
                 * @augments barc.browser.v1.ClientEnvelope.$Properties
                 * @deprecated Use barc.browser.v1.ClientEnvelope.$Properties instead.
                 */

                /**
                 * Narrowed shape of a ClientEnvelope.
                 * @typedef {{
                 *   authenticate?: barc.browser.v1.ClientAuth.$Shape|null;
                 *   $unknowns?: Array.<Uint8Array>;
                 * } & (
                 *   ({ body?: undefined; authenticate?: null }|{ body?: "authenticate"; authenticate: barc.browser.v1.ClientAuth.$Shape })
                 * )} barc.browser.v1.ClientEnvelope.$Shape
                 */

                /**
                 * Constructs a new ClientEnvelope.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a ClientEnvelope.
                 * @constructor
                 * @param {barc.browser.v1.ClientEnvelope.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const ClientEnvelope = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * ClientEnvelope authenticate.
                 * @member {barc.browser.v1.ClientAuth.$Properties|null|undefined} authenticate
                 * @memberof barc.browser.v1.ClientEnvelope
                 * @instance
                 */
                ClientEnvelope.prototype.authenticate = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * ClientEnvelope body.
                 * @member {"authenticate"|undefined} body
                 * @memberof barc.browser.v1.ClientEnvelope
                 * @instance
                 */
                $Object.defineProperty(ClientEnvelope.prototype, "body", {
                    get: $util.oneOfGetter($oneOfFields = ["authenticate"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified ClientEnvelope message. Does not implicitly {@link barc.browser.v1.ClientEnvelope.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.ClientEnvelope
                 * @static
                 * @param {barc.browser.v1.ClientEnvelope.$Properties} message ClientEnvelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ClientEnvelope.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.authenticate != null && $Object.hasOwnProperty.call(message, "authenticate"))
                        $root.barc.browser.v1.ClientAuth.encode(message.authenticate, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ClientEnvelope message, length delimited. Does not implicitly {@link barc.browser.v1.ClientEnvelope.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.ClientEnvelope
                 * @static
                 * @param {barc.browser.v1.ClientEnvelope.$Properties} message ClientEnvelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ClientEnvelope.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a ClientEnvelope message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.ClientEnvelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ClientEnvelope & barc.browser.v1.ClientEnvelope.$Shape} ClientEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ClientEnvelope.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.ClientEnvelope();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                message.authenticate = $root.barc.browser.v1.ClientAuth.decode(reader, reader.uint32(), $undefined, _depth + 1, message.authenticate);
                                message.body = "authenticate";
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a ClientEnvelope message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.ClientEnvelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ClientEnvelope & barc.browser.v1.ClientEnvelope.$Shape} ClientEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ClientEnvelope.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a ClientEnvelope message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.ClientEnvelope
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.ClientEnvelope} ClientEnvelope
                 */
                ClientEnvelope.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.ClientEnvelope)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.ClientEnvelope: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.ClientEnvelope();
                    if (object.authenticate != null) {
                        if (!$util.isObject(object.authenticate))
                            throw $TypeError(".barc.browser.v1.ClientEnvelope.authenticate: object expected");
                        message.authenticate = $root.barc.browser.v1.ClientAuth.fromObject(object.authenticate, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ClientEnvelope message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.ClientEnvelope
                 * @static
                 * @param {barc.browser.v1.ClientEnvelope} message ClientEnvelope
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ClientEnvelope.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (message.authenticate != null && $Object.hasOwnProperty.call(message, "authenticate")) {
                        object.authenticate = $root.barc.browser.v1.ClientAuth.toObject(message.authenticate, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "authenticate";
                    }
                    return object;
                };

                /**
                 * Converts this ClientEnvelope to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.ClientEnvelope
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ClientEnvelope.prototype.toJSON = function() {
                    return ClientEnvelope.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for ClientEnvelope
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.ClientEnvelope
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                ClientEnvelope.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.ClientEnvelope";
                };

                return ClientEnvelope;
            })();

            /**
             * LiveActionKind enum.
             * @name barc.browser.v1.LiveActionKind
             * @enum {number}
             * @property {number} LIVE_ACTION_KIND_UNSPECIFIED=0 LIVE_ACTION_KIND_UNSPECIFIED value
             * @property {number} LIVE_ACTION_KIND_STOP=1 LIVE_ACTION_KIND_STOP value
             * @property {number} LIVE_ACTION_KIND_MOVE=2 LIVE_ACTION_KIND_MOVE value
             * @property {number} LIVE_ACTION_KIND_ATTACK=3 LIVE_ACTION_KIND_ATTACK value
             */
            v1.LiveActionKind = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "LIVE_ACTION_KIND_UNSPECIFIED"] = 0;
                values[valuesById[1] = "LIVE_ACTION_KIND_STOP"] = 1;
                values[valuesById[2] = "LIVE_ACTION_KIND_MOVE"] = 2;
                values[valuesById[3] = "LIVE_ACTION_KIND_ATTACK"] = 3;
                return values;
            })();

            /**
             * MovePolicy enum.
             * @name barc.browser.v1.MovePolicy
             * @enum {number}
             * @property {number} MOVE_POLICY_UNSPECIFIED=0 MOVE_POLICY_UNSPECIFIED value
             * @property {number} MOVE_POLICY_REPLACE=1 MOVE_POLICY_REPLACE value
             * @property {number} MOVE_POLICY_APPEND=2 MOVE_POLICY_APPEND value
             */
            v1.MovePolicy = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "MOVE_POLICY_UNSPECIFIED"] = 0;
                values[valuesById[1] = "MOVE_POLICY_REPLACE"] = 1;
                values[valuesById[2] = "MOVE_POLICY_APPEND"] = 2;
                return values;
            })();

            /**
             * LiveInputSource enum.
             * @name barc.browser.v1.LiveInputSource
             * @enum {number}
             * @property {number} LIVE_INPUT_SOURCE_UNSPECIFIED=0 LIVE_INPUT_SOURCE_UNSPECIFIED value
             * @property {number} LIVE_INPUT_SOURCE_POINTER=1 LIVE_INPUT_SOURCE_POINTER value
             * @property {number} LIVE_INPUT_SOURCE_KEYBOARD=2 LIVE_INPUT_SOURCE_KEYBOARD value
             */
            v1.LiveInputSource = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "LIVE_INPUT_SOURCE_UNSPECIFIED"] = 0;
                values[valuesById[1] = "LIVE_INPUT_SOURCE_POINTER"] = 1;
                values[valuesById[2] = "LIVE_INPUT_SOURCE_KEYBOARD"] = 2;
                return values;
            })();

            /**
             * ControllerStage enum.
             * @name barc.browser.v1.ControllerStage
             * @enum {number}
             * @property {number} CONTROLLER_STAGE_UNSPECIFIED=0 CONTROLLER_STAGE_UNSPECIFIED value
             * @property {number} CONTROLLER_STAGE_ARM_REQUESTED=1 CONTROLLER_STAGE_ARM_REQUESTED value
             * @property {number} CONTROLLER_STAGE_ARM_NATIVE_CONFIRMED=2 CONTROLLER_STAGE_ARM_NATIVE_CONFIRMED value
             * @property {number} CONTROLLER_STAGE_REVOKE_REQUESTED=3 CONTROLLER_STAGE_REVOKE_REQUESTED value
             * @property {number} CONTROLLER_STAGE_REVOKE_NATIVE_CONFIRMED=4 CONTROLLER_STAGE_REVOKE_NATIVE_CONFIRMED value
             * @property {number} CONTROLLER_STAGE_EXPIRED=5 CONTROLLER_STAGE_EXPIRED value
             * @property {number} CONTROLLER_STAGE_REFUSED=6 CONTROLLER_STAGE_REFUSED value
             * @property {number} CONTROLLER_STAGE_UNAVAILABLE=7 CONTROLLER_STAGE_UNAVAILABLE value
             */
            v1.ControllerStage = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "CONTROLLER_STAGE_UNSPECIFIED"] = 0;
                values[valuesById[1] = "CONTROLLER_STAGE_ARM_REQUESTED"] = 1;
                values[valuesById[2] = "CONTROLLER_STAGE_ARM_NATIVE_CONFIRMED"] = 2;
                values[valuesById[3] = "CONTROLLER_STAGE_REVOKE_REQUESTED"] = 3;
                values[valuesById[4] = "CONTROLLER_STAGE_REVOKE_NATIVE_CONFIRMED"] = 4;
                values[valuesById[5] = "CONTROLLER_STAGE_EXPIRED"] = 5;
                values[valuesById[6] = "CONTROLLER_STAGE_REFUSED"] = 6;
                values[valuesById[7] = "CONTROLLER_STAGE_UNAVAILABLE"] = 7;
                return values;
            })();

            /**
             * LiveResultStage enum.
             * @name barc.browser.v1.LiveResultStage
             * @enum {number}
             * @property {number} LIVE_RESULT_STAGE_UNSPECIFIED=0 LIVE_RESULT_STAGE_UNSPECIFIED value
             * @property {number} LIVE_RESULT_STAGE_BROKER_ADMISSION=1 LIVE_RESULT_STAGE_BROKER_ADMISSION value
             * @property {number} LIVE_RESULT_STAGE_NATIVE_ADMISSION=2 LIVE_RESULT_STAGE_NATIVE_ADMISSION value
             * @property {number} LIVE_RESULT_STAGE_NATIVE_DISPATCH=3 LIVE_RESULT_STAGE_NATIVE_DISPATCH value
             * @property {number} LIVE_RESULT_STAGE_UNKNOWN=4 LIVE_RESULT_STAGE_UNKNOWN value
             */
            v1.LiveResultStage = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "LIVE_RESULT_STAGE_UNSPECIFIED"] = 0;
                values[valuesById[1] = "LIVE_RESULT_STAGE_BROKER_ADMISSION"] = 1;
                values[valuesById[2] = "LIVE_RESULT_STAGE_NATIVE_ADMISSION"] = 2;
                values[valuesById[3] = "LIVE_RESULT_STAGE_NATIVE_DISPATCH"] = 3;
                values[valuesById[4] = "LIVE_RESULT_STAGE_UNKNOWN"] = 4;
                return values;
            })();

            /**
             * LiveResultStatus enum.
             * @name barc.browser.v1.LiveResultStatus
             * @enum {number}
             * @property {number} LIVE_RESULT_STATUS_UNSPECIFIED=0 LIVE_RESULT_STATUS_UNSPECIFIED value
             * @property {number} LIVE_RESULT_STATUS_ACCEPTED=1 LIVE_RESULT_STATUS_ACCEPTED value
             * @property {number} LIVE_RESULT_STATUS_REJECTED=2 LIVE_RESULT_STATUS_REJECTED value
             * @property {number} LIVE_RESULT_STATUS_APPLIED=3 LIVE_RESULT_STATUS_APPLIED value
             * @property {number} LIVE_RESULT_STATUS_SKIPPED=4 LIVE_RESULT_STATUS_SKIPPED value
             * @property {number} LIVE_RESULT_STATUS_EXPIRED=5 LIVE_RESULT_STATUS_EXPIRED value
             * @property {number} LIVE_RESULT_STATUS_UNKNOWN=6 LIVE_RESULT_STATUS_UNKNOWN value
             */
            v1.LiveResultStatus = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "LIVE_RESULT_STATUS_UNSPECIFIED"] = 0;
                values[valuesById[1] = "LIVE_RESULT_STATUS_ACCEPTED"] = 1;
                values[valuesById[2] = "LIVE_RESULT_STATUS_REJECTED"] = 2;
                values[valuesById[3] = "LIVE_RESULT_STATUS_APPLIED"] = 3;
                values[valuesById[4] = "LIVE_RESULT_STATUS_SKIPPED"] = 4;
                values[valuesById[5] = "LIVE_RESULT_STATUS_EXPIRED"] = 5;
                values[valuesById[6] = "LIVE_RESULT_STATUS_UNKNOWN"] = 6;
                return values;
            })();

            /**
             * LiveResultDisposition enum.
             * @name barc.browser.v1.LiveResultDisposition
             * @enum {number}
             * @property {number} LIVE_RESULT_DISPOSITION_UNSPECIFIED=0 LIVE_RESULT_DISPOSITION_UNSPECIFIED value
             * @property {number} LIVE_RESULT_DISPOSITION_RECORDED=1 LIVE_RESULT_DISPOSITION_RECORDED value
             * @property {number} LIVE_RESULT_DISPOSITION_DUPLICATE=2 LIVE_RESULT_DISPOSITION_DUPLICATE value
             * @property {number} LIVE_RESULT_DISPOSITION_LATE=3 LIVE_RESULT_DISPOSITION_LATE value
             */
            v1.LiveResultDisposition = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "LIVE_RESULT_DISPOSITION_UNSPECIFIED"] = 0;
                values[valuesById[1] = "LIVE_RESULT_DISPOSITION_RECORDED"] = 1;
                values[valuesById[2] = "LIVE_RESULT_DISPOSITION_DUPLICATE"] = 2;
                values[valuesById[3] = "LIVE_RESULT_DISPOSITION_LATE"] = 3;
                return values;
            })();

            v1.UnitReference = (function() {

                /**
                 * Properties of a UnitReference.
                 * @typedef {Object} barc.browser.v1.UnitReference.$Properties
                 * @property {Long|null} [id] UnitReference id
                 * @property {Long|null} [lifetime] UnitReference lifetime
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a UnitReference.
                 * @memberof barc.browser.v1
                 * @interface IUnitReference
                 * @augments barc.browser.v1.UnitReference.$Properties
                 * @deprecated Use barc.browser.v1.UnitReference.$Properties instead.
                 */

                /**
                 * Shape of a UnitReference.
                 * @typedef {barc.browser.v1.UnitReference.$Properties} barc.browser.v1.UnitReference.$Shape
                 */

                /**
                 * Constructs a new UnitReference.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a UnitReference.
                 * @constructor
                 * @param {barc.browser.v1.UnitReference.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const UnitReference = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * UnitReference id.
                 * @member {Long} id
                 * @memberof barc.browser.v1.UnitReference
                 * @instance
                 */
                UnitReference.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * UnitReference lifetime.
                 * @member {Long} lifetime
                 * @memberof barc.browser.v1.UnitReference
                 * @instance
                 */
                UnitReference.prototype.lifetime = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * Encodes the specified UnitReference message. Does not implicitly {@link barc.browser.v1.UnitReference.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.UnitReference
                 * @static
                 * @param {barc.browser.v1.UnitReference.$Properties} message UnitReference message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                UnitReference.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.id != null && $Object.hasOwnProperty.call(message, "id") && (typeof message.id === "object" ? message.id.low || message.id.high : message.id !== 0))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
                    if (message.lifetime != null && $Object.hasOwnProperty.call(message, "lifetime") && (typeof message.lifetime === "object" ? message.lifetime.low || message.lifetime.high : message.lifetime !== 0))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.lifetime);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified UnitReference message, length delimited. Does not implicitly {@link barc.browser.v1.UnitReference.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.UnitReference
                 * @static
                 * @param {barc.browser.v1.UnitReference.$Properties} message UnitReference message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                UnitReference.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a UnitReference message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.UnitReference
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.UnitReference & barc.browser.v1.UnitReference.$Shape} UnitReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                UnitReference.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.UnitReference();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.id = value;
                                else
                                    delete message.id;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.lifetime = value;
                                else
                                    delete message.lifetime;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a UnitReference message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.UnitReference
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.UnitReference & barc.browser.v1.UnitReference.$Shape} UnitReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                UnitReference.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a UnitReference message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.UnitReference
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.UnitReference} UnitReference
                 */
                UnitReference.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.UnitReference)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.UnitReference: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.UnitReference();
                    if (object.id != null)
                        if (typeof object.id === "object" ? object.id.low || object.id.high : $Number(object.id) !== 0)
                            if ($util.Long)
                                message.id = $util.Long.fromValue(object.id, true);
                            else if (typeof object.id === "string")
                                message.id = $parseInt(object.id, 10);
                            else if (typeof object.id === "number")
                                message.id = object.id;
                            else if (typeof object.id === "object")
                                message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
                    if (object.lifetime != null)
                        if (typeof object.lifetime === "object" ? object.lifetime.low || object.lifetime.high : $Number(object.lifetime) !== 0)
                            if ($util.Long)
                                message.lifetime = $util.Long.fromValue(object.lifetime, true);
                            else if (typeof object.lifetime === "string")
                                message.lifetime = $parseInt(object.lifetime, 10);
                            else if (typeof object.lifetime === "number")
                                message.lifetime = object.lifetime;
                            else if (typeof object.lifetime === "object")
                                message.lifetime = new $util.LongBits(object.lifetime.low >>> 0, object.lifetime.high >>> 0).toNumber(true);
                    return message;
                };

                /**
                 * Creates a plain object from a UnitReference message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.UnitReference
                 * @static
                 * @param {barc.browser.v1.UnitReference} message UnitReference
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                UnitReference.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.id = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.id = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.lifetime = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.lifetime = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                    }
                    if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.id = typeof message.id === "number" ? $BigInt(message.id) : $util.Long.fromBits(message.id.low >>> 0, message.id.high >>> 0, true).toBigInt();
                        else if (typeof message.id === "number")
                            object.id = options.longs === $String ? $String(message.id) : message.id;
                        else
                            object.id = options.longs === $String ? $util.Long.prototype.toString.call(message.id) : options.longs === $Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
                    if (message.lifetime != null && $Object.hasOwnProperty.call(message, "lifetime"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.lifetime = typeof message.lifetime === "number" ? $BigInt(message.lifetime) : $util.Long.fromBits(message.lifetime.low >>> 0, message.lifetime.high >>> 0, true).toBigInt();
                        else if (typeof message.lifetime === "number")
                            object.lifetime = options.longs === $String ? $String(message.lifetime) : message.lifetime;
                        else
                            object.lifetime = options.longs === $String ? $util.Long.prototype.toString.call(message.lifetime) : options.longs === $Number ? new $util.LongBits(message.lifetime.low >>> 0, message.lifetime.high >>> 0).toNumber(true) : message.lifetime;
                    return object;
                };

                /**
                 * Converts this UnitReference to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.UnitReference
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                UnitReference.prototype.toJSON = function() {
                    return UnitReference.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for UnitReference
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.UnitReference
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                UnitReference.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.UnitReference";
                };

                return UnitReference;
            })();

            v1.ObservationBasis = (function() {

                /**
                 * Properties of an ObservationBasis.
                 * @typedef {Object} barc.browser.v1.ObservationBasis.$Properties
                 * @property {Uint8Array|null} [token] ObservationBasis token
                 * @property {Long|null} [stateSequence] ObservationBasis stateSequence
                 * @property {number|null} [nativeFrame] ObservationBasis nativeFrame
                 * @property {Uint8Array|null} [matchId] ObservationBasis matchId
                 * @property {string|null} [processIncarnation] ObservationBasis processIncarnation
                 * @property {string|null} [stateChannelIncarnation] ObservationBasis stateChannelIncarnation
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of an ObservationBasis.
                 * @memberof barc.browser.v1
                 * @interface IObservationBasis
                 * @augments barc.browser.v1.ObservationBasis.$Properties
                 * @deprecated Use barc.browser.v1.ObservationBasis.$Properties instead.
                 */

                /**
                 * Shape of an ObservationBasis.
                 * @typedef {barc.browser.v1.ObservationBasis.$Properties} barc.browser.v1.ObservationBasis.$Shape
                 */

                /**
                 * Constructs a new ObservationBasis.
                 * @memberof barc.browser.v1
                 * @classdesc Represents an ObservationBasis.
                 * @constructor
                 * @param {barc.browser.v1.ObservationBasis.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const ObservationBasis = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * ObservationBasis token.
                 * @member {Uint8Array} token
                 * @memberof barc.browser.v1.ObservationBasis
                 * @instance
                 */
                ObservationBasis.prototype.token = $util.newBuffer([]);

                /**
                 * ObservationBasis stateSequence.
                 * @member {Long} stateSequence
                 * @memberof barc.browser.v1.ObservationBasis
                 * @instance
                 */
                ObservationBasis.prototype.stateSequence = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * ObservationBasis nativeFrame.
                 * @member {number} nativeFrame
                 * @memberof barc.browser.v1.ObservationBasis
                 * @instance
                 */
                ObservationBasis.prototype.nativeFrame = 0;

                /**
                 * ObservationBasis matchId.
                 * @member {Uint8Array} matchId
                 * @memberof barc.browser.v1.ObservationBasis
                 * @instance
                 */
                ObservationBasis.prototype.matchId = $util.newBuffer([]);

                /**
                 * ObservationBasis processIncarnation.
                 * @member {string} processIncarnation
                 * @memberof barc.browser.v1.ObservationBasis
                 * @instance
                 */
                ObservationBasis.prototype.processIncarnation = "";

                /**
                 * ObservationBasis stateChannelIncarnation.
                 * @member {string} stateChannelIncarnation
                 * @memberof barc.browser.v1.ObservationBasis
                 * @instance
                 */
                ObservationBasis.prototype.stateChannelIncarnation = "";

                /**
                 * Encodes the specified ObservationBasis message. Does not implicitly {@link barc.browser.v1.ObservationBasis.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.ObservationBasis
                 * @static
                 * @param {barc.browser.v1.ObservationBasis.$Properties} message ObservationBasis message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ObservationBasis.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.token != null && $Object.hasOwnProperty.call(message, "token") && message.token.length)
                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.token);
                    if (message.stateSequence != null && $Object.hasOwnProperty.call(message, "stateSequence") && (typeof message.stateSequence === "object" ? message.stateSequence.low || message.stateSequence.high : message.stateSequence !== 0))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.stateSequence);
                    if (message.nativeFrame != null && $Object.hasOwnProperty.call(message, "nativeFrame") && message.nativeFrame !== 0)
                        writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.nativeFrame);
                    if (message.matchId != null && $Object.hasOwnProperty.call(message, "matchId") && message.matchId.length)
                        writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.matchId);
                    if (message.processIncarnation != null && $Object.hasOwnProperty.call(message, "processIncarnation") && message.processIncarnation !== "")
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.processIncarnation);
                    if (message.stateChannelIncarnation != null && $Object.hasOwnProperty.call(message, "stateChannelIncarnation") && message.stateChannelIncarnation !== "")
                        writer.uint32(/* id 6, wireType 2 =*/50).string(message.stateChannelIncarnation);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ObservationBasis message, length delimited. Does not implicitly {@link barc.browser.v1.ObservationBasis.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.ObservationBasis
                 * @static
                 * @param {barc.browser.v1.ObservationBasis.$Properties} message ObservationBasis message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ObservationBasis.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes an ObservationBasis message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.ObservationBasis
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ObservationBasis & barc.browser.v1.ObservationBasis.$Shape} ObservationBasis
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ObservationBasis.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.ObservationBasis();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.token = value;
                                else
                                    delete message.token;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.stateSequence = value;
                                else
                                    delete message.stateSequence;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.nativeFrame = value;
                                else
                                    delete message.nativeFrame;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.matchId = value;
                                else
                                    delete message.matchId;
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.processIncarnation = value;
                                else
                                    delete message.processIncarnation;
                                continue;
                            }
                        case 6: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.stateChannelIncarnation = value;
                                else
                                    delete message.stateChannelIncarnation;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes an ObservationBasis message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.ObservationBasis
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ObservationBasis & barc.browser.v1.ObservationBasis.$Shape} ObservationBasis
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ObservationBasis.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates an ObservationBasis message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.ObservationBasis
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.ObservationBasis} ObservationBasis
                 */
                ObservationBasis.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.ObservationBasis)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.ObservationBasis: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.ObservationBasis();
                    if (object.token != null)
                        if (object.token.length)
                            if (typeof object.token === "string")
                                $util.base64.decode(object.token, message.token = $util.newBuffer($util.base64.length(object.token)), 0);
                            else if (object.token.length >= 0)
                                message.token = object.token;
                    if (object.stateSequence != null)
                        if (typeof object.stateSequence === "object" ? object.stateSequence.low || object.stateSequence.high : $Number(object.stateSequence) !== 0)
                            if ($util.Long)
                                message.stateSequence = $util.Long.fromValue(object.stateSequence, true);
                            else if (typeof object.stateSequence === "string")
                                message.stateSequence = $parseInt(object.stateSequence, 10);
                            else if (typeof object.stateSequence === "number")
                                message.stateSequence = object.stateSequence;
                            else if (typeof object.stateSequence === "object")
                                message.stateSequence = new $util.LongBits(object.stateSequence.low >>> 0, object.stateSequence.high >>> 0).toNumber(true);
                    if (object.nativeFrame != null)
                        if ($Number(object.nativeFrame) !== 0)
                            message.nativeFrame = object.nativeFrame >>> 0;
                    if (object.matchId != null)
                        if (object.matchId.length)
                            if (typeof object.matchId === "string")
                                $util.base64.decode(object.matchId, message.matchId = $util.newBuffer($util.base64.length(object.matchId)), 0);
                            else if (object.matchId.length >= 0)
                                message.matchId = object.matchId;
                    if (object.processIncarnation != null)
                        if (typeof object.processIncarnation !== "string" || object.processIncarnation.length)
                            message.processIncarnation = $String(object.processIncarnation);
                    if (object.stateChannelIncarnation != null)
                        if (typeof object.stateChannelIncarnation !== "string" || object.stateChannelIncarnation.length)
                            message.stateChannelIncarnation = $String(object.stateChannelIncarnation);
                    return message;
                };

                /**
                 * Creates a plain object from an ObservationBasis message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.ObservationBasis
                 * @static
                 * @param {barc.browser.v1.ObservationBasis} message ObservationBasis
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ObservationBasis.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        if (options.bytes === $String)
                            object.token = "";
                        else {
                            object.token = [];
                            if (options.bytes !== $Array)
                                object.token = $util.newBuffer(object.token);
                        }
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.stateSequence = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.stateSequence = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        object.nativeFrame = 0;
                        if (options.bytes === $String)
                            object.matchId = "";
                        else {
                            object.matchId = [];
                            if (options.bytes !== $Array)
                                object.matchId = $util.newBuffer(object.matchId);
                        }
                        object.processIncarnation = "";
                        object.stateChannelIncarnation = "";
                    }
                    if (message.token != null && $Object.hasOwnProperty.call(message, "token"))
                        object.token = options.bytes === $String ? $util.base64.encode(message.token, 0, message.token.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.token) : message.token;
                    if (message.stateSequence != null && $Object.hasOwnProperty.call(message, "stateSequence"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.stateSequence = typeof message.stateSequence === "number" ? $BigInt(message.stateSequence) : $util.Long.fromBits(message.stateSequence.low >>> 0, message.stateSequence.high >>> 0, true).toBigInt();
                        else if (typeof message.stateSequence === "number")
                            object.stateSequence = options.longs === $String ? $String(message.stateSequence) : message.stateSequence;
                        else
                            object.stateSequence = options.longs === $String ? $util.Long.prototype.toString.call(message.stateSequence) : options.longs === $Number ? new $util.LongBits(message.stateSequence.low >>> 0, message.stateSequence.high >>> 0).toNumber(true) : message.stateSequence;
                    if (message.nativeFrame != null && $Object.hasOwnProperty.call(message, "nativeFrame"))
                        object.nativeFrame = message.nativeFrame;
                    if (message.matchId != null && $Object.hasOwnProperty.call(message, "matchId"))
                        object.matchId = options.bytes === $String ? $util.base64.encode(message.matchId, 0, message.matchId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.matchId) : message.matchId;
                    if (message.processIncarnation != null && $Object.hasOwnProperty.call(message, "processIncarnation"))
                        object.processIncarnation = message.processIncarnation;
                    if (message.stateChannelIncarnation != null && $Object.hasOwnProperty.call(message, "stateChannelIncarnation"))
                        object.stateChannelIncarnation = message.stateChannelIncarnation;
                    return object;
                };

                /**
                 * Converts this ObservationBasis to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.ObservationBasis
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ObservationBasis.prototype.toJSON = function() {
                    return ObservationBasis.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for ObservationBasis
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.ObservationBasis
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                ObservationBasis.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.ObservationBasis";
                };

                return ObservationBasis;
            })();

            v1.LiveModuleIdentity = (function() {

                /**
                 * Properties of a LiveModuleIdentity.
                 * @typedef {Object} barc.browser.v1.LiveModuleIdentity.$Properties
                 * @property {Uint8Array|null} [sha256] LiveModuleIdentity sha256
                 * @property {Long|null} [generation] LiveModuleIdentity generation
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a LiveModuleIdentity.
                 * @memberof barc.browser.v1
                 * @interface ILiveModuleIdentity
                 * @augments barc.browser.v1.LiveModuleIdentity.$Properties
                 * @deprecated Use barc.browser.v1.LiveModuleIdentity.$Properties instead.
                 */

                /**
                 * Shape of a LiveModuleIdentity.
                 * @typedef {barc.browser.v1.LiveModuleIdentity.$Properties} barc.browser.v1.LiveModuleIdentity.$Shape
                 */

                /**
                 * Constructs a new LiveModuleIdentity.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a LiveModuleIdentity.
                 * @constructor
                 * @param {barc.browser.v1.LiveModuleIdentity.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const LiveModuleIdentity = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * LiveModuleIdentity sha256.
                 * @member {Uint8Array} sha256
                 * @memberof barc.browser.v1.LiveModuleIdentity
                 * @instance
                 */
                LiveModuleIdentity.prototype.sha256 = $util.newBuffer([]);

                /**
                 * LiveModuleIdentity generation.
                 * @member {Long} generation
                 * @memberof barc.browser.v1.LiveModuleIdentity
                 * @instance
                 */
                LiveModuleIdentity.prototype.generation = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * Encodes the specified LiveModuleIdentity message. Does not implicitly {@link barc.browser.v1.LiveModuleIdentity.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.LiveModuleIdentity
                 * @static
                 * @param {barc.browser.v1.LiveModuleIdentity.$Properties} message LiveModuleIdentity message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveModuleIdentity.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.sha256 != null && $Object.hasOwnProperty.call(message, "sha256") && message.sha256.length)
                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.sha256);
                    if (message.generation != null && $Object.hasOwnProperty.call(message, "generation") && (typeof message.generation === "object" ? message.generation.low || message.generation.high : message.generation !== 0))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.generation);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified LiveModuleIdentity message, length delimited. Does not implicitly {@link barc.browser.v1.LiveModuleIdentity.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.LiveModuleIdentity
                 * @static
                 * @param {barc.browser.v1.LiveModuleIdentity.$Properties} message LiveModuleIdentity message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveModuleIdentity.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a LiveModuleIdentity message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.LiveModuleIdentity
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveModuleIdentity & barc.browser.v1.LiveModuleIdentity.$Shape} LiveModuleIdentity
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveModuleIdentity.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.LiveModuleIdentity();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.sha256 = value;
                                else
                                    delete message.sha256;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.generation = value;
                                else
                                    delete message.generation;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a LiveModuleIdentity message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.LiveModuleIdentity
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveModuleIdentity & barc.browser.v1.LiveModuleIdentity.$Shape} LiveModuleIdentity
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveModuleIdentity.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a LiveModuleIdentity message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.LiveModuleIdentity
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.LiveModuleIdentity} LiveModuleIdentity
                 */
                LiveModuleIdentity.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.LiveModuleIdentity)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.LiveModuleIdentity: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.LiveModuleIdentity();
                    if (object.sha256 != null)
                        if (object.sha256.length)
                            if (typeof object.sha256 === "string")
                                $util.base64.decode(object.sha256, message.sha256 = $util.newBuffer($util.base64.length(object.sha256)), 0);
                            else if (object.sha256.length >= 0)
                                message.sha256 = object.sha256;
                    if (object.generation != null)
                        if (typeof object.generation === "object" ? object.generation.low || object.generation.high : $Number(object.generation) !== 0)
                            if ($util.Long)
                                message.generation = $util.Long.fromValue(object.generation, true);
                            else if (typeof object.generation === "string")
                                message.generation = $parseInt(object.generation, 10);
                            else if (typeof object.generation === "number")
                                message.generation = object.generation;
                            else if (typeof object.generation === "object")
                                message.generation = new $util.LongBits(object.generation.low >>> 0, object.generation.high >>> 0).toNumber(true);
                    return message;
                };

                /**
                 * Creates a plain object from a LiveModuleIdentity message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.LiveModuleIdentity
                 * @static
                 * @param {barc.browser.v1.LiveModuleIdentity} message LiveModuleIdentity
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                LiveModuleIdentity.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        if (options.bytes === $String)
                            object.sha256 = "";
                        else {
                            object.sha256 = [];
                            if (options.bytes !== $Array)
                                object.sha256 = $util.newBuffer(object.sha256);
                        }
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.generation = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.generation = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                    }
                    if (message.sha256 != null && $Object.hasOwnProperty.call(message, "sha256"))
                        object.sha256 = options.bytes === $String ? $util.base64.encode(message.sha256, 0, message.sha256.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.sha256) : message.sha256;
                    if (message.generation != null && $Object.hasOwnProperty.call(message, "generation"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.generation = typeof message.generation === "number" ? $BigInt(message.generation) : $util.Long.fromBits(message.generation.low >>> 0, message.generation.high >>> 0, true).toBigInt();
                        else if (typeof message.generation === "number")
                            object.generation = options.longs === $String ? $String(message.generation) : message.generation;
                        else
                            object.generation = options.longs === $String ? $util.Long.prototype.toString.call(message.generation) : options.longs === $Number ? new $util.LongBits(message.generation.low >>> 0, message.generation.high >>> 0).toNumber(true) : message.generation;
                    return object;
                };

                /**
                 * Converts this LiveModuleIdentity to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.LiveModuleIdentity
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                LiveModuleIdentity.prototype.toJSON = function() {
                    return LiveModuleIdentity.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for LiveModuleIdentity
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.LiveModuleIdentity
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                LiveModuleIdentity.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.LiveModuleIdentity";
                };

                return LiveModuleIdentity;
            })();

            v1.MapBounds = (function() {

                /**
                 * Properties of a MapBounds.
                 * @typedef {Object} barc.browser.v1.MapBounds.$Properties
                 * @property {number|null} [minX] MapBounds minX
                 * @property {number|null} [maxX] MapBounds maxX
                 * @property {number|null} [minZ] MapBounds minZ
                 * @property {number|null} [maxZ] MapBounds maxZ
                 * @property {boolean|null} [terrainElevationAvailable] MapBounds terrainElevationAvailable
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a MapBounds.
                 * @memberof barc.browser.v1
                 * @interface IMapBounds
                 * @augments barc.browser.v1.MapBounds.$Properties
                 * @deprecated Use barc.browser.v1.MapBounds.$Properties instead.
                 */

                /**
                 * Shape of a MapBounds.
                 * @typedef {barc.browser.v1.MapBounds.$Properties} barc.browser.v1.MapBounds.$Shape
                 */

                /**
                 * Constructs a new MapBounds.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a MapBounds.
                 * @constructor
                 * @param {barc.browser.v1.MapBounds.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const MapBounds = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * MapBounds minX.
                 * @member {number} minX
                 * @memberof barc.browser.v1.MapBounds
                 * @instance
                 */
                MapBounds.prototype.minX = 0;

                /**
                 * MapBounds maxX.
                 * @member {number} maxX
                 * @memberof barc.browser.v1.MapBounds
                 * @instance
                 */
                MapBounds.prototype.maxX = 0;

                /**
                 * MapBounds minZ.
                 * @member {number} minZ
                 * @memberof barc.browser.v1.MapBounds
                 * @instance
                 */
                MapBounds.prototype.minZ = 0;

                /**
                 * MapBounds maxZ.
                 * @member {number} maxZ
                 * @memberof barc.browser.v1.MapBounds
                 * @instance
                 */
                MapBounds.prototype.maxZ = 0;

                /**
                 * MapBounds terrainElevationAvailable.
                 * @member {boolean} terrainElevationAvailable
                 * @memberof barc.browser.v1.MapBounds
                 * @instance
                 */
                MapBounds.prototype.terrainElevationAvailable = false;

                /**
                 * Encodes the specified MapBounds message. Does not implicitly {@link barc.browser.v1.MapBounds.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.MapBounds
                 * @static
                 * @param {barc.browser.v1.MapBounds.$Properties} message MapBounds message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MapBounds.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.minX != null && $Object.hasOwnProperty.call(message, "minX") && !$Object.is(message.minX, 0))
                        writer.uint32(/* id 1, wireType 5 =*/13).float(message.minX);
                    if (message.maxX != null && $Object.hasOwnProperty.call(message, "maxX") && !$Object.is(message.maxX, 0))
                        writer.uint32(/* id 2, wireType 5 =*/21).float(message.maxX);
                    if (message.minZ != null && $Object.hasOwnProperty.call(message, "minZ") && !$Object.is(message.minZ, 0))
                        writer.uint32(/* id 3, wireType 5 =*/29).float(message.minZ);
                    if (message.maxZ != null && $Object.hasOwnProperty.call(message, "maxZ") && !$Object.is(message.maxZ, 0))
                        writer.uint32(/* id 4, wireType 5 =*/37).float(message.maxZ);
                    if (message.terrainElevationAvailable != null && $Object.hasOwnProperty.call(message, "terrainElevationAvailable") && message.terrainElevationAvailable !== false)
                        writer.uint32(/* id 5, wireType 0 =*/40).bool(message.terrainElevationAvailable);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified MapBounds message, length delimited. Does not implicitly {@link barc.browser.v1.MapBounds.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.MapBounds
                 * @static
                 * @param {barc.browser.v1.MapBounds.$Properties} message MapBounds message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MapBounds.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a MapBounds message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.MapBounds
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.MapBounds & barc.browser.v1.MapBounds.$Shape} MapBounds
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MapBounds.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.MapBounds();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.minX = value;
                                else
                                    delete message.minX;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.maxX = value;
                                else
                                    delete message.maxX;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.minZ = value;
                                else
                                    delete message.minZ;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.maxZ = value;
                                else
                                    delete message.maxZ;
                                continue;
                            }
                        case 5: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.bool())
                                    message.terrainElevationAvailable = value;
                                else
                                    delete message.terrainElevationAvailable;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a MapBounds message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.MapBounds
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.MapBounds & barc.browser.v1.MapBounds.$Shape} MapBounds
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MapBounds.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a MapBounds message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.MapBounds
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.MapBounds} MapBounds
                 */
                MapBounds.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.MapBounds)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.MapBounds: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.MapBounds();
                    if (object.minX != null)
                        if (!$Object.is($Number(object.minX), 0))
                            message.minX = $Number(object.minX);
                    if (object.maxX != null)
                        if (!$Object.is($Number(object.maxX), 0))
                            message.maxX = $Number(object.maxX);
                    if (object.minZ != null)
                        if (!$Object.is($Number(object.minZ), 0))
                            message.minZ = $Number(object.minZ);
                    if (object.maxZ != null)
                        if (!$Object.is($Number(object.maxZ), 0))
                            message.maxZ = $Number(object.maxZ);
                    if (object.terrainElevationAvailable != null)
                        if (object.terrainElevationAvailable)
                            message.terrainElevationAvailable = $Boolean(object.terrainElevationAvailable);
                    return message;
                };

                /**
                 * Creates a plain object from a MapBounds message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.MapBounds
                 * @static
                 * @param {barc.browser.v1.MapBounds} message MapBounds
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                MapBounds.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.minX = 0;
                        object.maxX = 0;
                        object.minZ = 0;
                        object.maxZ = 0;
                        object.terrainElevationAvailable = false;
                    }
                    if (message.minX != null && $Object.hasOwnProperty.call(message, "minX"))
                        object.minX = options.json && !$isFinite(message.minX) ? $String(message.minX) : message.minX;
                    if (message.maxX != null && $Object.hasOwnProperty.call(message, "maxX"))
                        object.maxX = options.json && !$isFinite(message.maxX) ? $String(message.maxX) : message.maxX;
                    if (message.minZ != null && $Object.hasOwnProperty.call(message, "minZ"))
                        object.minZ = options.json && !$isFinite(message.minZ) ? $String(message.minZ) : message.minZ;
                    if (message.maxZ != null && $Object.hasOwnProperty.call(message, "maxZ"))
                        object.maxZ = options.json && !$isFinite(message.maxZ) ? $String(message.maxZ) : message.maxZ;
                    if (message.terrainElevationAvailable != null && $Object.hasOwnProperty.call(message, "terrainElevationAvailable"))
                        object.terrainElevationAvailable = message.terrainElevationAvailable;
                    return object;
                };

                /**
                 * Converts this MapBounds to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.MapBounds
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                MapBounds.prototype.toJSON = function() {
                    return MapBounds.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for MapBounds
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.MapBounds
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                MapBounds.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.MapBounds";
                };

                return MapBounds;
            })();

            v1.LiveLimits = (function() {

                /**
                 * Properties of a LiveLimits.
                 * @typedef {Object} barc.browser.v1.LiveLimits.$Properties
                 * @property {number|null} [maxActorCount] LiveLimits maxActorCount
                 * @property {number|null} [maxInputBytes] LiveLimits maxInputBytes
                 * @property {number|null} [maxOutputBytes] LiveLimits maxOutputBytes
                 * @property {number|null} [maxFrameBytes] LiveLimits maxFrameBytes
                 * @property {number|null} [maxPendingInputs] LiveLimits maxPendingInputs
                 * @property {number|null} [maxModuleBytes] LiveLimits maxModuleBytes
                 * @property {number|null} [guestPhaseTimeoutMs] LiveLimits guestPhaseTimeoutMs
                 * @property {number|null} [maxObservationAgeMs] LiveLimits maxObservationAgeMs
                 * @property {number|null} [liveSnapshotCadenceFrames] LiveLimits liveSnapshotCadenceFrames
                 * @property {number|null} [maxNativeUnitId] LiveLimits maxNativeUnitId
                 * @property {number|null} [maxPendingParents] LiveLimits maxPendingParents
                 * @property {number|null} [maxRetainedResults] LiveLimits maxRetainedResults
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a LiveLimits.
                 * @memberof barc.browser.v1
                 * @interface ILiveLimits
                 * @augments barc.browser.v1.LiveLimits.$Properties
                 * @deprecated Use barc.browser.v1.LiveLimits.$Properties instead.
                 */

                /**
                 * Shape of a LiveLimits.
                 * @typedef {barc.browser.v1.LiveLimits.$Properties} barc.browser.v1.LiveLimits.$Shape
                 */

                /**
                 * Constructs a new LiveLimits.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a LiveLimits.
                 * @constructor
                 * @param {barc.browser.v1.LiveLimits.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const LiveLimits = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * LiveLimits maxActorCount.
                 * @member {number} maxActorCount
                 * @memberof barc.browser.v1.LiveLimits
                 * @instance
                 */
                LiveLimits.prototype.maxActorCount = 0;

                /**
                 * LiveLimits maxInputBytes.
                 * @member {number} maxInputBytes
                 * @memberof barc.browser.v1.LiveLimits
                 * @instance
                 */
                LiveLimits.prototype.maxInputBytes = 0;

                /**
                 * LiveLimits maxOutputBytes.
                 * @member {number} maxOutputBytes
                 * @memberof barc.browser.v1.LiveLimits
                 * @instance
                 */
                LiveLimits.prototype.maxOutputBytes = 0;

                /**
                 * LiveLimits maxFrameBytes.
                 * @member {number} maxFrameBytes
                 * @memberof barc.browser.v1.LiveLimits
                 * @instance
                 */
                LiveLimits.prototype.maxFrameBytes = 0;

                /**
                 * LiveLimits maxPendingInputs.
                 * @member {number} maxPendingInputs
                 * @memberof barc.browser.v1.LiveLimits
                 * @instance
                 */
                LiveLimits.prototype.maxPendingInputs = 0;

                /**
                 * LiveLimits maxModuleBytes.
                 * @member {number} maxModuleBytes
                 * @memberof barc.browser.v1.LiveLimits
                 * @instance
                 */
                LiveLimits.prototype.maxModuleBytes = 0;

                /**
                 * LiveLimits guestPhaseTimeoutMs.
                 * @member {number} guestPhaseTimeoutMs
                 * @memberof barc.browser.v1.LiveLimits
                 * @instance
                 */
                LiveLimits.prototype.guestPhaseTimeoutMs = 0;

                /**
                 * LiveLimits maxObservationAgeMs.
                 * @member {number} maxObservationAgeMs
                 * @memberof barc.browser.v1.LiveLimits
                 * @instance
                 */
                LiveLimits.prototype.maxObservationAgeMs = 0;

                /**
                 * LiveLimits liveSnapshotCadenceFrames.
                 * @member {number} liveSnapshotCadenceFrames
                 * @memberof barc.browser.v1.LiveLimits
                 * @instance
                 */
                LiveLimits.prototype.liveSnapshotCadenceFrames = 0;

                /**
                 * LiveLimits maxNativeUnitId.
                 * @member {number} maxNativeUnitId
                 * @memberof barc.browser.v1.LiveLimits
                 * @instance
                 */
                LiveLimits.prototype.maxNativeUnitId = 0;

                /**
                 * LiveLimits maxPendingParents.
                 * @member {number} maxPendingParents
                 * @memberof barc.browser.v1.LiveLimits
                 * @instance
                 */
                LiveLimits.prototype.maxPendingParents = 0;

                /**
                 * LiveLimits maxRetainedResults.
                 * @member {number} maxRetainedResults
                 * @memberof barc.browser.v1.LiveLimits
                 * @instance
                 */
                LiveLimits.prototype.maxRetainedResults = 0;

                /**
                 * Encodes the specified LiveLimits message. Does not implicitly {@link barc.browser.v1.LiveLimits.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.LiveLimits
                 * @static
                 * @param {barc.browser.v1.LiveLimits.$Properties} message LiveLimits message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveLimits.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.maxActorCount != null && $Object.hasOwnProperty.call(message, "maxActorCount") && message.maxActorCount !== 0)
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.maxActorCount);
                    if (message.maxInputBytes != null && $Object.hasOwnProperty.call(message, "maxInputBytes") && message.maxInputBytes !== 0)
                        writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.maxInputBytes);
                    if (message.maxOutputBytes != null && $Object.hasOwnProperty.call(message, "maxOutputBytes") && message.maxOutputBytes !== 0)
                        writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.maxOutputBytes);
                    if (message.maxFrameBytes != null && $Object.hasOwnProperty.call(message, "maxFrameBytes") && message.maxFrameBytes !== 0)
                        writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.maxFrameBytes);
                    if (message.maxPendingInputs != null && $Object.hasOwnProperty.call(message, "maxPendingInputs") && message.maxPendingInputs !== 0)
                        writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.maxPendingInputs);
                    if (message.maxModuleBytes != null && $Object.hasOwnProperty.call(message, "maxModuleBytes") && message.maxModuleBytes !== 0)
                        writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.maxModuleBytes);
                    if (message.guestPhaseTimeoutMs != null && $Object.hasOwnProperty.call(message, "guestPhaseTimeoutMs") && message.guestPhaseTimeoutMs !== 0)
                        writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.guestPhaseTimeoutMs);
                    if (message.maxObservationAgeMs != null && $Object.hasOwnProperty.call(message, "maxObservationAgeMs") && message.maxObservationAgeMs !== 0)
                        writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.maxObservationAgeMs);
                    if (message.liveSnapshotCadenceFrames != null && $Object.hasOwnProperty.call(message, "liveSnapshotCadenceFrames") && message.liveSnapshotCadenceFrames !== 0)
                        writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.liveSnapshotCadenceFrames);
                    if (message.maxNativeUnitId != null && $Object.hasOwnProperty.call(message, "maxNativeUnitId") && message.maxNativeUnitId !== 0)
                        writer.uint32(/* id 10, wireType 0 =*/80).uint32(message.maxNativeUnitId);
                    if (message.maxPendingParents != null && $Object.hasOwnProperty.call(message, "maxPendingParents") && message.maxPendingParents !== 0)
                        writer.uint32(/* id 11, wireType 0 =*/88).uint32(message.maxPendingParents);
                    if (message.maxRetainedResults != null && $Object.hasOwnProperty.call(message, "maxRetainedResults") && message.maxRetainedResults !== 0)
                        writer.uint32(/* id 12, wireType 0 =*/96).uint32(message.maxRetainedResults);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified LiveLimits message, length delimited. Does not implicitly {@link barc.browser.v1.LiveLimits.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.LiveLimits
                 * @static
                 * @param {barc.browser.v1.LiveLimits.$Properties} message LiveLimits message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveLimits.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a LiveLimits message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.LiveLimits
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveLimits & barc.browser.v1.LiveLimits.$Shape} LiveLimits
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveLimits.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.LiveLimits();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.maxActorCount = value;
                                else
                                    delete message.maxActorCount;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.maxInputBytes = value;
                                else
                                    delete message.maxInputBytes;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.maxOutputBytes = value;
                                else
                                    delete message.maxOutputBytes;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.maxFrameBytes = value;
                                else
                                    delete message.maxFrameBytes;
                                continue;
                            }
                        case 5: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.maxPendingInputs = value;
                                else
                                    delete message.maxPendingInputs;
                                continue;
                            }
                        case 6: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.maxModuleBytes = value;
                                else
                                    delete message.maxModuleBytes;
                                continue;
                            }
                        case 7: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.guestPhaseTimeoutMs = value;
                                else
                                    delete message.guestPhaseTimeoutMs;
                                continue;
                            }
                        case 8: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.maxObservationAgeMs = value;
                                else
                                    delete message.maxObservationAgeMs;
                                continue;
                            }
                        case 9: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.liveSnapshotCadenceFrames = value;
                                else
                                    delete message.liveSnapshotCadenceFrames;
                                continue;
                            }
                        case 10: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.maxNativeUnitId = value;
                                else
                                    delete message.maxNativeUnitId;
                                continue;
                            }
                        case 11: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.maxPendingParents = value;
                                else
                                    delete message.maxPendingParents;
                                continue;
                            }
                        case 12: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.maxRetainedResults = value;
                                else
                                    delete message.maxRetainedResults;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a LiveLimits message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.LiveLimits
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveLimits & barc.browser.v1.LiveLimits.$Shape} LiveLimits
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveLimits.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a LiveLimits message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.LiveLimits
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.LiveLimits} LiveLimits
                 */
                LiveLimits.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.LiveLimits)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.LiveLimits: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.LiveLimits();
                    if (object.maxActorCount != null)
                        if ($Number(object.maxActorCount) !== 0)
                            message.maxActorCount = object.maxActorCount >>> 0;
                    if (object.maxInputBytes != null)
                        if ($Number(object.maxInputBytes) !== 0)
                            message.maxInputBytes = object.maxInputBytes >>> 0;
                    if (object.maxOutputBytes != null)
                        if ($Number(object.maxOutputBytes) !== 0)
                            message.maxOutputBytes = object.maxOutputBytes >>> 0;
                    if (object.maxFrameBytes != null)
                        if ($Number(object.maxFrameBytes) !== 0)
                            message.maxFrameBytes = object.maxFrameBytes >>> 0;
                    if (object.maxPendingInputs != null)
                        if ($Number(object.maxPendingInputs) !== 0)
                            message.maxPendingInputs = object.maxPendingInputs >>> 0;
                    if (object.maxModuleBytes != null)
                        if ($Number(object.maxModuleBytes) !== 0)
                            message.maxModuleBytes = object.maxModuleBytes >>> 0;
                    if (object.guestPhaseTimeoutMs != null)
                        if ($Number(object.guestPhaseTimeoutMs) !== 0)
                            message.guestPhaseTimeoutMs = object.guestPhaseTimeoutMs >>> 0;
                    if (object.maxObservationAgeMs != null)
                        if ($Number(object.maxObservationAgeMs) !== 0)
                            message.maxObservationAgeMs = object.maxObservationAgeMs >>> 0;
                    if (object.liveSnapshotCadenceFrames != null)
                        if ($Number(object.liveSnapshotCadenceFrames) !== 0)
                            message.liveSnapshotCadenceFrames = object.liveSnapshotCadenceFrames >>> 0;
                    if (object.maxNativeUnitId != null)
                        if ($Number(object.maxNativeUnitId) !== 0)
                            message.maxNativeUnitId = object.maxNativeUnitId >>> 0;
                    if (object.maxPendingParents != null)
                        if ($Number(object.maxPendingParents) !== 0)
                            message.maxPendingParents = object.maxPendingParents >>> 0;
                    if (object.maxRetainedResults != null)
                        if ($Number(object.maxRetainedResults) !== 0)
                            message.maxRetainedResults = object.maxRetainedResults >>> 0;
                    return message;
                };

                /**
                 * Creates a plain object from a LiveLimits message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.LiveLimits
                 * @static
                 * @param {barc.browser.v1.LiveLimits} message LiveLimits
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                LiveLimits.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.maxActorCount = 0;
                        object.maxInputBytes = 0;
                        object.maxOutputBytes = 0;
                        object.maxFrameBytes = 0;
                        object.maxPendingInputs = 0;
                        object.maxModuleBytes = 0;
                        object.guestPhaseTimeoutMs = 0;
                        object.maxObservationAgeMs = 0;
                        object.liveSnapshotCadenceFrames = 0;
                        object.maxNativeUnitId = 0;
                        object.maxPendingParents = 0;
                        object.maxRetainedResults = 0;
                    }
                    if (message.maxActorCount != null && $Object.hasOwnProperty.call(message, "maxActorCount"))
                        object.maxActorCount = message.maxActorCount;
                    if (message.maxInputBytes != null && $Object.hasOwnProperty.call(message, "maxInputBytes"))
                        object.maxInputBytes = message.maxInputBytes;
                    if (message.maxOutputBytes != null && $Object.hasOwnProperty.call(message, "maxOutputBytes"))
                        object.maxOutputBytes = message.maxOutputBytes;
                    if (message.maxFrameBytes != null && $Object.hasOwnProperty.call(message, "maxFrameBytes"))
                        object.maxFrameBytes = message.maxFrameBytes;
                    if (message.maxPendingInputs != null && $Object.hasOwnProperty.call(message, "maxPendingInputs"))
                        object.maxPendingInputs = message.maxPendingInputs;
                    if (message.maxModuleBytes != null && $Object.hasOwnProperty.call(message, "maxModuleBytes"))
                        object.maxModuleBytes = message.maxModuleBytes;
                    if (message.guestPhaseTimeoutMs != null && $Object.hasOwnProperty.call(message, "guestPhaseTimeoutMs"))
                        object.guestPhaseTimeoutMs = message.guestPhaseTimeoutMs;
                    if (message.maxObservationAgeMs != null && $Object.hasOwnProperty.call(message, "maxObservationAgeMs"))
                        object.maxObservationAgeMs = message.maxObservationAgeMs;
                    if (message.liveSnapshotCadenceFrames != null && $Object.hasOwnProperty.call(message, "liveSnapshotCadenceFrames"))
                        object.liveSnapshotCadenceFrames = message.liveSnapshotCadenceFrames;
                    if (message.maxNativeUnitId != null && $Object.hasOwnProperty.call(message, "maxNativeUnitId"))
                        object.maxNativeUnitId = message.maxNativeUnitId;
                    if (message.maxPendingParents != null && $Object.hasOwnProperty.call(message, "maxPendingParents"))
                        object.maxPendingParents = message.maxPendingParents;
                    if (message.maxRetainedResults != null && $Object.hasOwnProperty.call(message, "maxRetainedResults"))
                        object.maxRetainedResults = message.maxRetainedResults;
                    return object;
                };

                /**
                 * Converts this LiveLimits to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.LiveLimits
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                LiveLimits.prototype.toJSON = function() {
                    return LiveLimits.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for LiveLimits
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.LiveLimits
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                LiveLimits.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.LiveLimits";
                };

                return LiveLimits;
            })();

            v1.LiveCapabilities = (function() {

                /**
                 * Properties of a LiveCapabilities.
                 * @typedef {Object} barc.browser.v1.LiveCapabilities.$Properties
                 * @property {boolean|null} [stop] LiveCapabilities stop
                 * @property {boolean|null} [move] LiveCapabilities move
                 * @property {boolean|null} [attackVisibleUnit] LiveCapabilities attackVisibleUnit
                 * @property {barc.browser.v1.MapBounds.$Properties|null} [mapBounds] LiveCapabilities mapBounds
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a LiveCapabilities.
                 * @memberof barc.browser.v1
                 * @interface ILiveCapabilities
                 * @augments barc.browser.v1.LiveCapabilities.$Properties
                 * @deprecated Use barc.browser.v1.LiveCapabilities.$Properties instead.
                 */

                /**
                 * Shape of a LiveCapabilities.
                 * @typedef {barc.browser.v1.LiveCapabilities.$Properties} barc.browser.v1.LiveCapabilities.$Shape
                 */

                /**
                 * Constructs a new LiveCapabilities.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a LiveCapabilities.
                 * @constructor
                 * @param {barc.browser.v1.LiveCapabilities.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const LiveCapabilities = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * LiveCapabilities stop.
                 * @member {boolean} stop
                 * @memberof barc.browser.v1.LiveCapabilities
                 * @instance
                 */
                LiveCapabilities.prototype.stop = false;

                /**
                 * LiveCapabilities move.
                 * @member {boolean} move
                 * @memberof barc.browser.v1.LiveCapabilities
                 * @instance
                 */
                LiveCapabilities.prototype.move = false;

                /**
                 * LiveCapabilities attackVisibleUnit.
                 * @member {boolean} attackVisibleUnit
                 * @memberof barc.browser.v1.LiveCapabilities
                 * @instance
                 */
                LiveCapabilities.prototype.attackVisibleUnit = false;

                /**
                 * LiveCapabilities mapBounds.
                 * @member {barc.browser.v1.MapBounds.$Properties|null|undefined} mapBounds
                 * @memberof barc.browser.v1.LiveCapabilities
                 * @instance
                 */
                LiveCapabilities.prototype.mapBounds = null;

                /**
                 * Encodes the specified LiveCapabilities message. Does not implicitly {@link barc.browser.v1.LiveCapabilities.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.LiveCapabilities
                 * @static
                 * @param {barc.browser.v1.LiveCapabilities.$Properties} message LiveCapabilities message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveCapabilities.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.stop != null && $Object.hasOwnProperty.call(message, "stop") && message.stop !== false)
                        writer.uint32(/* id 1, wireType 0 =*/8).bool(message.stop);
                    if (message.move != null && $Object.hasOwnProperty.call(message, "move") && message.move !== false)
                        writer.uint32(/* id 2, wireType 0 =*/16).bool(message.move);
                    if (message.attackVisibleUnit != null && $Object.hasOwnProperty.call(message, "attackVisibleUnit") && message.attackVisibleUnit !== false)
                        writer.uint32(/* id 3, wireType 0 =*/24).bool(message.attackVisibleUnit);
                    if (message.mapBounds != null && $Object.hasOwnProperty.call(message, "mapBounds"))
                        $root.barc.browser.v1.MapBounds.encode(message.mapBounds, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified LiveCapabilities message, length delimited. Does not implicitly {@link barc.browser.v1.LiveCapabilities.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.LiveCapabilities
                 * @static
                 * @param {barc.browser.v1.LiveCapabilities.$Properties} message LiveCapabilities message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveCapabilities.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a LiveCapabilities message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.LiveCapabilities
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveCapabilities & barc.browser.v1.LiveCapabilities.$Shape} LiveCapabilities
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveCapabilities.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.LiveCapabilities();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.bool())
                                    message.stop = value;
                                else
                                    delete message.stop;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.bool())
                                    message.move = value;
                                else
                                    delete message.move;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.bool())
                                    message.attackVisibleUnit = value;
                                else
                                    delete message.attackVisibleUnit;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                message.mapBounds = $root.barc.browser.v1.MapBounds.decode(reader, reader.uint32(), $undefined, _depth + 1, message.mapBounds);
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a LiveCapabilities message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.LiveCapabilities
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveCapabilities & barc.browser.v1.LiveCapabilities.$Shape} LiveCapabilities
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveCapabilities.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a LiveCapabilities message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.LiveCapabilities
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.LiveCapabilities} LiveCapabilities
                 */
                LiveCapabilities.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.LiveCapabilities)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.LiveCapabilities: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.LiveCapabilities();
                    if (object.stop != null)
                        if (object.stop)
                            message.stop = $Boolean(object.stop);
                    if (object.move != null)
                        if (object.move)
                            message.move = $Boolean(object.move);
                    if (object.attackVisibleUnit != null)
                        if (object.attackVisibleUnit)
                            message.attackVisibleUnit = $Boolean(object.attackVisibleUnit);
                    if (object.mapBounds != null) {
                        if (!$util.isObject(object.mapBounds))
                            throw $TypeError(".barc.browser.v1.LiveCapabilities.mapBounds: object expected");
                        message.mapBounds = $root.barc.browser.v1.MapBounds.fromObject(object.mapBounds, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a LiveCapabilities message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.LiveCapabilities
                 * @static
                 * @param {barc.browser.v1.LiveCapabilities} message LiveCapabilities
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                LiveCapabilities.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.stop = false;
                        object.move = false;
                        object.attackVisibleUnit = false;
                        object.mapBounds = null;
                    }
                    if (message.stop != null && $Object.hasOwnProperty.call(message, "stop"))
                        object.stop = message.stop;
                    if (message.move != null && $Object.hasOwnProperty.call(message, "move"))
                        object.move = message.move;
                    if (message.attackVisibleUnit != null && $Object.hasOwnProperty.call(message, "attackVisibleUnit"))
                        object.attackVisibleUnit = message.attackVisibleUnit;
                    if (message.mapBounds != null && $Object.hasOwnProperty.call(message, "mapBounds"))
                        object.mapBounds = $root.barc.browser.v1.MapBounds.toObject(message.mapBounds, options, _depth + 1);
                    return object;
                };

                /**
                 * Converts this LiveCapabilities to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.LiveCapabilities
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                LiveCapabilities.prototype.toJSON = function() {
                    return LiveCapabilities.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for LiveCapabilities
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.LiveCapabilities
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                LiveCapabilities.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.LiveCapabilities";
                };

                return LiveCapabilities;
            })();

            v1.ControllerIdentity = (function() {

                /**
                 * Properties of a ControllerIdentity.
                 * @typedef {Object} barc.browser.v1.ControllerIdentity.$Properties
                 * @property {Uint8Array|null} [sessionId] ControllerIdentity sessionId
                 * @property {Uint8Array|null} [controllerId] ControllerIdentity controllerId
                 * @property {string|null} [controllerIncarnation] ControllerIdentity controllerIncarnation
                 * @property {Long|null} [authorityEpoch] ControllerIdentity authorityEpoch
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a ControllerIdentity.
                 * @memberof barc.browser.v1
                 * @interface IControllerIdentity
                 * @augments barc.browser.v1.ControllerIdentity.$Properties
                 * @deprecated Use barc.browser.v1.ControllerIdentity.$Properties instead.
                 */

                /**
                 * Shape of a ControllerIdentity.
                 * @typedef {barc.browser.v1.ControllerIdentity.$Properties} barc.browser.v1.ControllerIdentity.$Shape
                 */

                /**
                 * Constructs a new ControllerIdentity.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a ControllerIdentity.
                 * @constructor
                 * @param {barc.browser.v1.ControllerIdentity.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const ControllerIdentity = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * ControllerIdentity sessionId.
                 * @member {Uint8Array} sessionId
                 * @memberof barc.browser.v1.ControllerIdentity
                 * @instance
                 */
                ControllerIdentity.prototype.sessionId = $util.newBuffer([]);

                /**
                 * ControllerIdentity controllerId.
                 * @member {Uint8Array} controllerId
                 * @memberof barc.browser.v1.ControllerIdentity
                 * @instance
                 */
                ControllerIdentity.prototype.controllerId = $util.newBuffer([]);

                /**
                 * ControllerIdentity controllerIncarnation.
                 * @member {string} controllerIncarnation
                 * @memberof barc.browser.v1.ControllerIdentity
                 * @instance
                 */
                ControllerIdentity.prototype.controllerIncarnation = "";

                /**
                 * ControllerIdentity authorityEpoch.
                 * @member {Long} authorityEpoch
                 * @memberof barc.browser.v1.ControllerIdentity
                 * @instance
                 */
                ControllerIdentity.prototype.authorityEpoch = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * Encodes the specified ControllerIdentity message. Does not implicitly {@link barc.browser.v1.ControllerIdentity.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.ControllerIdentity
                 * @static
                 * @param {barc.browser.v1.ControllerIdentity.$Properties} message ControllerIdentity message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ControllerIdentity.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId.length)
                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.sessionId);
                    if (message.controllerId != null && $Object.hasOwnProperty.call(message, "controllerId") && message.controllerId.length)
                        writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.controllerId);
                    if (message.controllerIncarnation != null && $Object.hasOwnProperty.call(message, "controllerIncarnation") && message.controllerIncarnation !== "")
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.controllerIncarnation);
                    if (message.authorityEpoch != null && $Object.hasOwnProperty.call(message, "authorityEpoch") && (typeof message.authorityEpoch === "object" ? message.authorityEpoch.low || message.authorityEpoch.high : message.authorityEpoch !== 0))
                        writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.authorityEpoch);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ControllerIdentity message, length delimited. Does not implicitly {@link barc.browser.v1.ControllerIdentity.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.ControllerIdentity
                 * @static
                 * @param {barc.browser.v1.ControllerIdentity.$Properties} message ControllerIdentity message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ControllerIdentity.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a ControllerIdentity message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.ControllerIdentity
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ControllerIdentity & barc.browser.v1.ControllerIdentity.$Shape} ControllerIdentity
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ControllerIdentity.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.ControllerIdentity();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.sessionId = value;
                                else
                                    delete message.sessionId;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.controllerId = value;
                                else
                                    delete message.controllerId;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.controllerIncarnation = value;
                                else
                                    delete message.controllerIncarnation;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.authorityEpoch = value;
                                else
                                    delete message.authorityEpoch;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a ControllerIdentity message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.ControllerIdentity
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ControllerIdentity & barc.browser.v1.ControllerIdentity.$Shape} ControllerIdentity
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ControllerIdentity.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a ControllerIdentity message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.ControllerIdentity
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.ControllerIdentity} ControllerIdentity
                 */
                ControllerIdentity.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.ControllerIdentity)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.ControllerIdentity: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.ControllerIdentity();
                    if (object.sessionId != null)
                        if (object.sessionId.length)
                            if (typeof object.sessionId === "string")
                                $util.base64.decode(object.sessionId, message.sessionId = $util.newBuffer($util.base64.length(object.sessionId)), 0);
                            else if (object.sessionId.length >= 0)
                                message.sessionId = object.sessionId;
                    if (object.controllerId != null)
                        if (object.controllerId.length)
                            if (typeof object.controllerId === "string")
                                $util.base64.decode(object.controllerId, message.controllerId = $util.newBuffer($util.base64.length(object.controllerId)), 0);
                            else if (object.controllerId.length >= 0)
                                message.controllerId = object.controllerId;
                    if (object.controllerIncarnation != null)
                        if (typeof object.controllerIncarnation !== "string" || object.controllerIncarnation.length)
                            message.controllerIncarnation = $String(object.controllerIncarnation);
                    if (object.authorityEpoch != null)
                        if (typeof object.authorityEpoch === "object" ? object.authorityEpoch.low || object.authorityEpoch.high : $Number(object.authorityEpoch) !== 0)
                            if ($util.Long)
                                message.authorityEpoch = $util.Long.fromValue(object.authorityEpoch, true);
                            else if (typeof object.authorityEpoch === "string")
                                message.authorityEpoch = $parseInt(object.authorityEpoch, 10);
                            else if (typeof object.authorityEpoch === "number")
                                message.authorityEpoch = object.authorityEpoch;
                            else if (typeof object.authorityEpoch === "object")
                                message.authorityEpoch = new $util.LongBits(object.authorityEpoch.low >>> 0, object.authorityEpoch.high >>> 0).toNumber(true);
                    return message;
                };

                /**
                 * Creates a plain object from a ControllerIdentity message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.ControllerIdentity
                 * @static
                 * @param {barc.browser.v1.ControllerIdentity} message ControllerIdentity
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ControllerIdentity.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        if (options.bytes === $String)
                            object.sessionId = "";
                        else {
                            object.sessionId = [];
                            if (options.bytes !== $Array)
                                object.sessionId = $util.newBuffer(object.sessionId);
                        }
                        if (options.bytes === $String)
                            object.controllerId = "";
                        else {
                            object.controllerId = [];
                            if (options.bytes !== $Array)
                                object.controllerId = $util.newBuffer(object.controllerId);
                        }
                        object.controllerIncarnation = "";
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.authorityEpoch = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.authorityEpoch = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                    }
                    if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                        object.sessionId = options.bytes === $String ? $util.base64.encode(message.sessionId, 0, message.sessionId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.sessionId) : message.sessionId;
                    if (message.controllerId != null && $Object.hasOwnProperty.call(message, "controllerId"))
                        object.controllerId = options.bytes === $String ? $util.base64.encode(message.controllerId, 0, message.controllerId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.controllerId) : message.controllerId;
                    if (message.controllerIncarnation != null && $Object.hasOwnProperty.call(message, "controllerIncarnation"))
                        object.controllerIncarnation = message.controllerIncarnation;
                    if (message.authorityEpoch != null && $Object.hasOwnProperty.call(message, "authorityEpoch"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.authorityEpoch = typeof message.authorityEpoch === "number" ? $BigInt(message.authorityEpoch) : $util.Long.fromBits(message.authorityEpoch.low >>> 0, message.authorityEpoch.high >>> 0, true).toBigInt();
                        else if (typeof message.authorityEpoch === "number")
                            object.authorityEpoch = options.longs === $String ? $String(message.authorityEpoch) : message.authorityEpoch;
                        else
                            object.authorityEpoch = options.longs === $String ? $util.Long.prototype.toString.call(message.authorityEpoch) : options.longs === $Number ? new $util.LongBits(message.authorityEpoch.low >>> 0, message.authorityEpoch.high >>> 0).toNumber(true) : message.authorityEpoch;
                    return object;
                };

                /**
                 * Converts this ControllerIdentity to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.ControllerIdentity
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ControllerIdentity.prototype.toJSON = function() {
                    return ControllerIdentity.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for ControllerIdentity
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.ControllerIdentity
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                ControllerIdentity.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.ControllerIdentity";
                };

                return ControllerIdentity;
            })();

            v1.LiveBootstrap = (function() {

                /**
                 * Properties of a LiveBootstrap.
                 * @typedef {Object} barc.browser.v1.LiveBootstrap.$Properties
                 * @property {barc.browser.v1.Bootstrap.$Properties|null} [preview] LiveBootstrap preview
                 * @property {string|null} [liveProfile] LiveBootstrap liveProfile
                 * @property {barc.browser.v1.ControllerIdentity.$Properties|null} [controller] LiveBootstrap controller
                 * @property {barc.browser.v1.LiveModuleIdentity.$Properties|null} [module] LiveBootstrap module
                 * @property {barc.browser.v1.LiveLimits.$Properties|null} [limits] LiveBootstrap limits
                 * @property {barc.browser.v1.LiveCapabilities.$Properties|null} [capabilities] LiveBootstrap capabilities
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a LiveBootstrap.
                 * @memberof barc.browser.v1
                 * @interface ILiveBootstrap
                 * @augments barc.browser.v1.LiveBootstrap.$Properties
                 * @deprecated Use barc.browser.v1.LiveBootstrap.$Properties instead.
                 */

                /**
                 * Shape of a LiveBootstrap.
                 * @typedef {barc.browser.v1.LiveBootstrap.$Properties} barc.browser.v1.LiveBootstrap.$Shape
                 */

                /**
                 * Constructs a new LiveBootstrap.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a LiveBootstrap.
                 * @constructor
                 * @param {barc.browser.v1.LiveBootstrap.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const LiveBootstrap = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * LiveBootstrap preview.
                 * @member {barc.browser.v1.Bootstrap.$Properties|null|undefined} preview
                 * @memberof barc.browser.v1.LiveBootstrap
                 * @instance
                 */
                LiveBootstrap.prototype.preview = null;

                /**
                 * LiveBootstrap liveProfile.
                 * @member {string} liveProfile
                 * @memberof barc.browser.v1.LiveBootstrap
                 * @instance
                 */
                LiveBootstrap.prototype.liveProfile = "";

                /**
                 * LiveBootstrap controller.
                 * @member {barc.browser.v1.ControllerIdentity.$Properties|null|undefined} controller
                 * @memberof barc.browser.v1.LiveBootstrap
                 * @instance
                 */
                LiveBootstrap.prototype.controller = null;

                /**
                 * LiveBootstrap module.
                 * @member {barc.browser.v1.LiveModuleIdentity.$Properties|null|undefined} module
                 * @memberof barc.browser.v1.LiveBootstrap
                 * @instance
                 */
                LiveBootstrap.prototype.module = null;

                /**
                 * LiveBootstrap limits.
                 * @member {barc.browser.v1.LiveLimits.$Properties|null|undefined} limits
                 * @memberof barc.browser.v1.LiveBootstrap
                 * @instance
                 */
                LiveBootstrap.prototype.limits = null;

                /**
                 * LiveBootstrap capabilities.
                 * @member {barc.browser.v1.LiveCapabilities.$Properties|null|undefined} capabilities
                 * @memberof barc.browser.v1.LiveBootstrap
                 * @instance
                 */
                LiveBootstrap.prototype.capabilities = null;

                /**
                 * Encodes the specified LiveBootstrap message. Does not implicitly {@link barc.browser.v1.LiveBootstrap.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.LiveBootstrap
                 * @static
                 * @param {barc.browser.v1.LiveBootstrap.$Properties} message LiveBootstrap message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveBootstrap.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.preview != null && $Object.hasOwnProperty.call(message, "preview"))
                        $root.barc.browser.v1.Bootstrap.encode(message.preview, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.liveProfile != null && $Object.hasOwnProperty.call(message, "liveProfile") && message.liveProfile !== "")
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.liveProfile);
                    if (message.controller != null && $Object.hasOwnProperty.call(message, "controller"))
                        $root.barc.browser.v1.ControllerIdentity.encode(message.controller, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                    if (message.module != null && $Object.hasOwnProperty.call(message, "module"))
                        $root.barc.browser.v1.LiveModuleIdentity.encode(message.module, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
                    if (message.limits != null && $Object.hasOwnProperty.call(message, "limits"))
                        $root.barc.browser.v1.LiveLimits.encode(message.limits, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
                    if (message.capabilities != null && $Object.hasOwnProperty.call(message, "capabilities"))
                        $root.barc.browser.v1.LiveCapabilities.encode(message.capabilities, writer.uint32(/* id 6, wireType 2 =*/50).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified LiveBootstrap message, length delimited. Does not implicitly {@link barc.browser.v1.LiveBootstrap.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.LiveBootstrap
                 * @static
                 * @param {barc.browser.v1.LiveBootstrap.$Properties} message LiveBootstrap message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveBootstrap.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a LiveBootstrap message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.LiveBootstrap
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveBootstrap & barc.browser.v1.LiveBootstrap.$Shape} LiveBootstrap
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveBootstrap.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.LiveBootstrap();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                message.preview = $root.barc.browser.v1.Bootstrap.decode(reader, reader.uint32(), $undefined, _depth + 1, message.preview);
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.liveProfile = value;
                                else
                                    delete message.liveProfile;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                message.controller = $root.barc.browser.v1.ControllerIdentity.decode(reader, reader.uint32(), $undefined, _depth + 1, message.controller);
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                message.module = $root.barc.browser.v1.LiveModuleIdentity.decode(reader, reader.uint32(), $undefined, _depth + 1, message.module);
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                message.limits = $root.barc.browser.v1.LiveLimits.decode(reader, reader.uint32(), $undefined, _depth + 1, message.limits);
                                continue;
                            }
                        case 6: {
                                if (wireType !== 2)
                                    break;
                                message.capabilities = $root.barc.browser.v1.LiveCapabilities.decode(reader, reader.uint32(), $undefined, _depth + 1, message.capabilities);
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a LiveBootstrap message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.LiveBootstrap
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveBootstrap & barc.browser.v1.LiveBootstrap.$Shape} LiveBootstrap
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveBootstrap.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a LiveBootstrap message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.LiveBootstrap
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.LiveBootstrap} LiveBootstrap
                 */
                LiveBootstrap.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.LiveBootstrap)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.LiveBootstrap: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.LiveBootstrap();
                    if (object.preview != null) {
                        if (!$util.isObject(object.preview))
                            throw $TypeError(".barc.browser.v1.LiveBootstrap.preview: object expected");
                        message.preview = $root.barc.browser.v1.Bootstrap.fromObject(object.preview, _depth + 1);
                    }
                    if (object.liveProfile != null)
                        if (typeof object.liveProfile !== "string" || object.liveProfile.length)
                            message.liveProfile = $String(object.liveProfile);
                    if (object.controller != null) {
                        if (!$util.isObject(object.controller))
                            throw $TypeError(".barc.browser.v1.LiveBootstrap.controller: object expected");
                        message.controller = $root.barc.browser.v1.ControllerIdentity.fromObject(object.controller, _depth + 1);
                    }
                    if (object.module != null) {
                        if (!$util.isObject(object.module))
                            throw $TypeError(".barc.browser.v1.LiveBootstrap.module: object expected");
                        message.module = $root.barc.browser.v1.LiveModuleIdentity.fromObject(object.module, _depth + 1);
                    }
                    if (object.limits != null) {
                        if (!$util.isObject(object.limits))
                            throw $TypeError(".barc.browser.v1.LiveBootstrap.limits: object expected");
                        message.limits = $root.barc.browser.v1.LiveLimits.fromObject(object.limits, _depth + 1);
                    }
                    if (object.capabilities != null) {
                        if (!$util.isObject(object.capabilities))
                            throw $TypeError(".barc.browser.v1.LiveBootstrap.capabilities: object expected");
                        message.capabilities = $root.barc.browser.v1.LiveCapabilities.fromObject(object.capabilities, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a LiveBootstrap message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.LiveBootstrap
                 * @static
                 * @param {barc.browser.v1.LiveBootstrap} message LiveBootstrap
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                LiveBootstrap.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.preview = null;
                        object.liveProfile = "";
                        object.controller = null;
                        object.module = null;
                        object.limits = null;
                        object.capabilities = null;
                    }
                    if (message.preview != null && $Object.hasOwnProperty.call(message, "preview"))
                        object.preview = $root.barc.browser.v1.Bootstrap.toObject(message.preview, options, _depth + 1);
                    if (message.liveProfile != null && $Object.hasOwnProperty.call(message, "liveProfile"))
                        object.liveProfile = message.liveProfile;
                    if (message.controller != null && $Object.hasOwnProperty.call(message, "controller"))
                        object.controller = $root.barc.browser.v1.ControllerIdentity.toObject(message.controller, options, _depth + 1);
                    if (message.module != null && $Object.hasOwnProperty.call(message, "module"))
                        object.module = $root.barc.browser.v1.LiveModuleIdentity.toObject(message.module, options, _depth + 1);
                    if (message.limits != null && $Object.hasOwnProperty.call(message, "limits"))
                        object.limits = $root.barc.browser.v1.LiveLimits.toObject(message.limits, options, _depth + 1);
                    if (message.capabilities != null && $Object.hasOwnProperty.call(message, "capabilities"))
                        object.capabilities = $root.barc.browser.v1.LiveCapabilities.toObject(message.capabilities, options, _depth + 1);
                    return object;
                };

                /**
                 * Converts this LiveBootstrap to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.LiveBootstrap
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                LiveBootstrap.prototype.toJSON = function() {
                    return LiveBootstrap.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for LiveBootstrap
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.LiveBootstrap
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                LiveBootstrap.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.LiveBootstrap";
                };

                return LiveBootstrap;
            })();

            v1.LiveObservedUnit = (function() {

                /**
                 * Properties of a LiveObservedUnit.
                 * @typedef {Object} barc.browser.v1.LiveObservedUnit.$Properties
                 * @property {barc.browser.v1.UnitReference.$Properties|null} [reference] LiveObservedUnit reference
                 * @property {barc.browser.v1.ObservationKind|null} [observation] LiveObservedUnit observation
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a LiveObservedUnit.
                 * @memberof barc.browser.v1
                 * @interface ILiveObservedUnit
                 * @augments barc.browser.v1.LiveObservedUnit.$Properties
                 * @deprecated Use barc.browser.v1.LiveObservedUnit.$Properties instead.
                 */

                /**
                 * Shape of a LiveObservedUnit.
                 * @typedef {barc.browser.v1.LiveObservedUnit.$Properties} barc.browser.v1.LiveObservedUnit.$Shape
                 */

                /**
                 * Constructs a new LiveObservedUnit.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a LiveObservedUnit.
                 * @constructor
                 * @param {barc.browser.v1.LiveObservedUnit.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const LiveObservedUnit = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * LiveObservedUnit reference.
                 * @member {barc.browser.v1.UnitReference.$Properties|null|undefined} reference
                 * @memberof barc.browser.v1.LiveObservedUnit
                 * @instance
                 */
                LiveObservedUnit.prototype.reference = null;

                /**
                 * LiveObservedUnit observation.
                 * @member {barc.browser.v1.ObservationKind} observation
                 * @memberof barc.browser.v1.LiveObservedUnit
                 * @instance
                 */
                LiveObservedUnit.prototype.observation = 0;

                /**
                 * Encodes the specified LiveObservedUnit message. Does not implicitly {@link barc.browser.v1.LiveObservedUnit.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.LiveObservedUnit
                 * @static
                 * @param {barc.browser.v1.LiveObservedUnit.$Properties} message LiveObservedUnit message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveObservedUnit.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.reference != null && $Object.hasOwnProperty.call(message, "reference"))
                        $root.barc.browser.v1.UnitReference.encode(message.reference, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.observation != null && $Object.hasOwnProperty.call(message, "observation") && message.observation !== 0)
                        writer.uint32(/* id 2, wireType 0 =*/16).int32(message.observation);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified LiveObservedUnit message, length delimited. Does not implicitly {@link barc.browser.v1.LiveObservedUnit.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.LiveObservedUnit
                 * @static
                 * @param {barc.browser.v1.LiveObservedUnit.$Properties} message LiveObservedUnit message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveObservedUnit.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a LiveObservedUnit message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.LiveObservedUnit
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveObservedUnit & barc.browser.v1.LiveObservedUnit.$Shape} LiveObservedUnit
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveObservedUnit.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.LiveObservedUnit();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                message.reference = $root.barc.browser.v1.UnitReference.decode(reader, reader.uint32(), $undefined, _depth + 1, message.reference);
                                continue;
                            }
                        case 2: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.int32())
                                    message.observation = value;
                                else
                                    delete message.observation;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a LiveObservedUnit message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.LiveObservedUnit
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveObservedUnit & barc.browser.v1.LiveObservedUnit.$Shape} LiveObservedUnit
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveObservedUnit.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a LiveObservedUnit message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.LiveObservedUnit
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.LiveObservedUnit} LiveObservedUnit
                 */
                LiveObservedUnit.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.LiveObservedUnit)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.LiveObservedUnit: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.LiveObservedUnit();
                    if (object.reference != null) {
                        if (!$util.isObject(object.reference))
                            throw $TypeError(".barc.browser.v1.LiveObservedUnit.reference: object expected");
                        message.reference = $root.barc.browser.v1.UnitReference.fromObject(object.reference, _depth + 1);
                    }
                    if (object.observation !== 0 && (typeof object.observation !== "string" || $root.barc.browser.v1.ObservationKind[object.observation] !== 0))
                        switch (object.observation) {
                        case "OBSERVATION_KIND_UNSPECIFIED":
                        case 0:
                            message.observation = 0;
                            break;
                        case "OBSERVATION_KIND_OWN":
                        case 1:
                            message.observation = 1;
                            break;
                        case "OBSERVATION_KIND_VISUAL":
                        case 2:
                            message.observation = 2;
                            break;
                        case "OBSERVATION_KIND_RADAR":
                        case 3:
                            message.observation = 3;
                            break;
                        default:
                            if (typeof object.observation === "number" && (object.observation | 0) === object.observation)
                                message.observation = object.observation;
                        }
                    return message;
                };

                /**
                 * Creates a plain object from a LiveObservedUnit message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.LiveObservedUnit
                 * @static
                 * @param {barc.browser.v1.LiveObservedUnit} message LiveObservedUnit
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                LiveObservedUnit.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.reference = null;
                        object.observation = options.enums === $String ? "OBSERVATION_KIND_UNSPECIFIED" : 0;
                    }
                    if (message.reference != null && $Object.hasOwnProperty.call(message, "reference"))
                        object.reference = $root.barc.browser.v1.UnitReference.toObject(message.reference, options, _depth + 1);
                    if (message.observation != null && $Object.hasOwnProperty.call(message, "observation"))
                        object.observation = options.enums === $String ? $root.barc.browser.v1.ObservationKind[message.observation] === $undefined ? message.observation : $root.barc.browser.v1.ObservationKind[message.observation] : message.observation;
                    return object;
                };

                /**
                 * Converts this LiveObservedUnit to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.LiveObservedUnit
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                LiveObservedUnit.prototype.toJSON = function() {
                    return LiveObservedUnit.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for LiveObservedUnit
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.LiveObservedUnit
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                LiveObservedUnit.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.LiveObservedUnit";
                };

                return LiveObservedUnit;
            })();

            v1.LiveObservation = (function() {

                /**
                 * Properties of a LiveObservation.
                 * @typedef {Object} barc.browser.v1.LiveObservation.$Properties
                 * @property {barc.browser.v1.Observation.$Properties|null} [preview] LiveObservation preview
                 * @property {barc.browser.v1.ObservationBasis.$Properties|null} [basis] LiveObservation basis
                 * @property {Array.<barc.browser.v1.LiveObservedUnit.$Properties>|null} [units] LiveObservation units
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a LiveObservation.
                 * @memberof barc.browser.v1
                 * @interface ILiveObservation
                 * @augments barc.browser.v1.LiveObservation.$Properties
                 * @deprecated Use barc.browser.v1.LiveObservation.$Properties instead.
                 */

                /**
                 * Shape of a LiveObservation.
                 * @typedef {barc.browser.v1.LiveObservation.$Properties} barc.browser.v1.LiveObservation.$Shape
                 */

                /**
                 * Constructs a new LiveObservation.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a LiveObservation.
                 * @constructor
                 * @param {barc.browser.v1.LiveObservation.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const LiveObservation = function (properties) {
                    this.units = [];
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * LiveObservation preview.
                 * @member {barc.browser.v1.Observation.$Properties|null|undefined} preview
                 * @memberof barc.browser.v1.LiveObservation
                 * @instance
                 */
                LiveObservation.prototype.preview = null;

                /**
                 * LiveObservation basis.
                 * @member {barc.browser.v1.ObservationBasis.$Properties|null|undefined} basis
                 * @memberof barc.browser.v1.LiveObservation
                 * @instance
                 */
                LiveObservation.prototype.basis = null;

                /**
                 * LiveObservation units.
                 * @member {Array.<barc.browser.v1.LiveObservedUnit.$Properties>} units
                 * @memberof barc.browser.v1.LiveObservation
                 * @instance
                 */
                LiveObservation.prototype.units = $util.emptyArray;

                /**
                 * Encodes the specified LiveObservation message. Does not implicitly {@link barc.browser.v1.LiveObservation.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.LiveObservation
                 * @static
                 * @param {barc.browser.v1.LiveObservation.$Properties} message LiveObservation message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveObservation.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.preview != null && $Object.hasOwnProperty.call(message, "preview"))
                        $root.barc.browser.v1.Observation.encode(message.preview, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.basis != null && $Object.hasOwnProperty.call(message, "basis"))
                        $root.barc.browser.v1.ObservationBasis.encode(message.basis, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                    if (message.units != null && message.units.length)
                        for (let i = 0; i < message.units.length; ++i)
                            $root.barc.browser.v1.LiveObservedUnit.encode(message.units[i], writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified LiveObservation message, length delimited. Does not implicitly {@link barc.browser.v1.LiveObservation.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.LiveObservation
                 * @static
                 * @param {barc.browser.v1.LiveObservation.$Properties} message LiveObservation message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveObservation.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a LiveObservation message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.LiveObservation
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveObservation & barc.browser.v1.LiveObservation.$Shape} LiveObservation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveObservation.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.LiveObservation();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                message.preview = $root.barc.browser.v1.Observation.decode(reader, reader.uint32(), $undefined, _depth + 1, message.preview);
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                message.basis = $root.barc.browser.v1.ObservationBasis.decode(reader, reader.uint32(), $undefined, _depth + 1, message.basis);
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                if (!(message.units && message.units.length))
                                    message.units = [];
                                message.units.push($root.barc.browser.v1.LiveObservedUnit.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a LiveObservation message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.LiveObservation
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveObservation & barc.browser.v1.LiveObservation.$Shape} LiveObservation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveObservation.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a LiveObservation message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.LiveObservation
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.LiveObservation} LiveObservation
                 */
                LiveObservation.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.LiveObservation)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.LiveObservation: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.LiveObservation();
                    if (object.preview != null) {
                        if (!$util.isObject(object.preview))
                            throw $TypeError(".barc.browser.v1.LiveObservation.preview: object expected");
                        message.preview = $root.barc.browser.v1.Observation.fromObject(object.preview, _depth + 1);
                    }
                    if (object.basis != null) {
                        if (!$util.isObject(object.basis))
                            throw $TypeError(".barc.browser.v1.LiveObservation.basis: object expected");
                        message.basis = $root.barc.browser.v1.ObservationBasis.fromObject(object.basis, _depth + 1);
                    }
                    if (object.units) {
                        if (!$Array.isArray(object.units))
                            throw $TypeError(".barc.browser.v1.LiveObservation.units: array expected");
                        message.units = $Array(object.units.length);
                        for (let i = 0; i < object.units.length; ++i) {
                            if (!$util.isObject(object.units[i]))
                                throw $TypeError(".barc.browser.v1.LiveObservation.units: object expected");
                            message.units[i] = $root.barc.browser.v1.LiveObservedUnit.fromObject(object.units[i], _depth + 1);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a LiveObservation message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.LiveObservation
                 * @static
                 * @param {barc.browser.v1.LiveObservation} message LiveObservation
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                LiveObservation.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.units = [];
                    if (options.defaults) {
                        object.preview = null;
                        object.basis = null;
                    }
                    if (message.preview != null && $Object.hasOwnProperty.call(message, "preview"))
                        object.preview = $root.barc.browser.v1.Observation.toObject(message.preview, options, _depth + 1);
                    if (message.basis != null && $Object.hasOwnProperty.call(message, "basis"))
                        object.basis = $root.barc.browser.v1.ObservationBasis.toObject(message.basis, options, _depth + 1);
                    if (message.units && message.units.length) {
                        object.units = $Array(message.units.length);
                        for (let j = 0; j < message.units.length; ++j)
                            object.units[j] = $root.barc.browser.v1.LiveObservedUnit.toObject(message.units[j], options, _depth + 1);
                    }
                    return object;
                };

                /**
                 * Converts this LiveObservation to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.LiveObservation
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                LiveObservation.prototype.toJSON = function() {
                    return LiveObservation.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for LiveObservation
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.LiveObservation
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                LiveObservation.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.LiveObservation";
                };

                return LiveObservation;
            })();

            v1.StopAction = (function() {

                /**
                 * Properties of a StopAction.
                 * @typedef {Object} barc.browser.v1.StopAction.$Properties
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a StopAction.
                 * @memberof barc.browser.v1
                 * @interface IStopAction
                 * @augments barc.browser.v1.StopAction.$Properties
                 * @deprecated Use barc.browser.v1.StopAction.$Properties instead.
                 */

                /**
                 * Shape of a StopAction.
                 * @typedef {barc.browser.v1.StopAction.$Properties} barc.browser.v1.StopAction.$Shape
                 */

                /**
                 * Constructs a new StopAction.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a StopAction.
                 * @constructor
                 * @param {barc.browser.v1.StopAction.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const StopAction = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Encodes the specified StopAction message. Does not implicitly {@link barc.browser.v1.StopAction.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.StopAction
                 * @static
                 * @param {barc.browser.v1.StopAction.$Properties} message StopAction message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                StopAction.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified StopAction message, length delimited. Does not implicitly {@link barc.browser.v1.StopAction.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.StopAction
                 * @static
                 * @param {barc.browser.v1.StopAction.$Properties} message StopAction message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                StopAction.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a StopAction message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.StopAction
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.StopAction & barc.browser.v1.StopAction.$Shape} StopAction
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                StopAction.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.StopAction();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        reader.skipType(tag & 7, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a StopAction message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.StopAction
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.StopAction & barc.browser.v1.StopAction.$Shape} StopAction
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                StopAction.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a StopAction message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.StopAction
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.StopAction} StopAction
                 */
                StopAction.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.StopAction)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.StopAction: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    return new $root.barc.browser.v1.StopAction();
                };

                /**
                 * Creates a plain object from a StopAction message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.StopAction
                 * @static
                 * @param {barc.browser.v1.StopAction} message StopAction
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                StopAction.toObject = function () {
                    return {};
                };

                /**
                 * Converts this StopAction to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.StopAction
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                StopAction.prototype.toJSON = function() {
                    return StopAction.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for StopAction
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.StopAction
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                StopAction.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.StopAction";
                };

                return StopAction;
            })();

            v1.MoveTarget = (function() {

                /**
                 * Properties of a MoveTarget.
                 * @typedef {Object} barc.browser.v1.MoveTarget.$Properties
                 * @property {barc.browser.v1.Position3.$Properties|null} [position] MoveTarget position
                 * @property {barc.browser.v1.MovePolicy|null} [policy] MoveTarget policy
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a MoveTarget.
                 * @memberof barc.browser.v1
                 * @interface IMoveTarget
                 * @augments barc.browser.v1.MoveTarget.$Properties
                 * @deprecated Use barc.browser.v1.MoveTarget.$Properties instead.
                 */

                /**
                 * Shape of a MoveTarget.
                 * @typedef {barc.browser.v1.MoveTarget.$Properties} barc.browser.v1.MoveTarget.$Shape
                 */

                /**
                 * Constructs a new MoveTarget.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a MoveTarget.
                 * @constructor
                 * @param {barc.browser.v1.MoveTarget.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const MoveTarget = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * MoveTarget position.
                 * @member {barc.browser.v1.Position3.$Properties|null|undefined} position
                 * @memberof barc.browser.v1.MoveTarget
                 * @instance
                 */
                MoveTarget.prototype.position = null;

                /**
                 * MoveTarget policy.
                 * @member {barc.browser.v1.MovePolicy} policy
                 * @memberof barc.browser.v1.MoveTarget
                 * @instance
                 */
                MoveTarget.prototype.policy = 0;

                /**
                 * Encodes the specified MoveTarget message. Does not implicitly {@link barc.browser.v1.MoveTarget.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.MoveTarget
                 * @static
                 * @param {barc.browser.v1.MoveTarget.$Properties} message MoveTarget message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MoveTarget.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.position != null && $Object.hasOwnProperty.call(message, "position"))
                        $root.barc.browser.v1.Position3.encode(message.position, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.policy != null && $Object.hasOwnProperty.call(message, "policy") && message.policy !== 0)
                        writer.uint32(/* id 2, wireType 0 =*/16).int32(message.policy);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified MoveTarget message, length delimited. Does not implicitly {@link barc.browser.v1.MoveTarget.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.MoveTarget
                 * @static
                 * @param {barc.browser.v1.MoveTarget.$Properties} message MoveTarget message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MoveTarget.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a MoveTarget message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.MoveTarget
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.MoveTarget & barc.browser.v1.MoveTarget.$Shape} MoveTarget
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MoveTarget.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.MoveTarget();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                message.position = $root.barc.browser.v1.Position3.decode(reader, reader.uint32(), $undefined, _depth + 1, message.position);
                                continue;
                            }
                        case 2: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.int32())
                                    message.policy = value;
                                else
                                    delete message.policy;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a MoveTarget message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.MoveTarget
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.MoveTarget & barc.browser.v1.MoveTarget.$Shape} MoveTarget
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MoveTarget.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a MoveTarget message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.MoveTarget
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.MoveTarget} MoveTarget
                 */
                MoveTarget.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.MoveTarget)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.MoveTarget: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.MoveTarget();
                    if (object.position != null) {
                        if (!$util.isObject(object.position))
                            throw $TypeError(".barc.browser.v1.MoveTarget.position: object expected");
                        message.position = $root.barc.browser.v1.Position3.fromObject(object.position, _depth + 1);
                    }
                    if (object.policy !== 0 && (typeof object.policy !== "string" || $root.barc.browser.v1.MovePolicy[object.policy] !== 0))
                        switch (object.policy) {
                        case "MOVE_POLICY_UNSPECIFIED":
                        case 0:
                            message.policy = 0;
                            break;
                        case "MOVE_POLICY_REPLACE":
                        case 1:
                            message.policy = 1;
                            break;
                        case "MOVE_POLICY_APPEND":
                        case 2:
                            message.policy = 2;
                            break;
                        default:
                            if (typeof object.policy === "number" && (object.policy | 0) === object.policy)
                                message.policy = object.policy;
                        }
                    return message;
                };

                /**
                 * Creates a plain object from a MoveTarget message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.MoveTarget
                 * @static
                 * @param {barc.browser.v1.MoveTarget} message MoveTarget
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                MoveTarget.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.position = null;
                        object.policy = options.enums === $String ? "MOVE_POLICY_UNSPECIFIED" : 0;
                    }
                    if (message.position != null && $Object.hasOwnProperty.call(message, "position"))
                        object.position = $root.barc.browser.v1.Position3.toObject(message.position, options, _depth + 1);
                    if (message.policy != null && $Object.hasOwnProperty.call(message, "policy"))
                        object.policy = options.enums === $String ? $root.barc.browser.v1.MovePolicy[message.policy] === $undefined ? message.policy : $root.barc.browser.v1.MovePolicy[message.policy] : message.policy;
                    return object;
                };

                /**
                 * Converts this MoveTarget to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.MoveTarget
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                MoveTarget.prototype.toJSON = function() {
                    return MoveTarget.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for MoveTarget
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.MoveTarget
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                MoveTarget.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.MoveTarget";
                };

                return MoveTarget;
            })();

            v1.AttackTarget = (function() {

                /**
                 * Properties of an AttackTarget.
                 * @typedef {Object} barc.browser.v1.AttackTarget.$Properties
                 * @property {barc.browser.v1.UnitReference.$Properties|null} [target] AttackTarget target
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of an AttackTarget.
                 * @memberof barc.browser.v1
                 * @interface IAttackTarget
                 * @augments barc.browser.v1.AttackTarget.$Properties
                 * @deprecated Use barc.browser.v1.AttackTarget.$Properties instead.
                 */

                /**
                 * Shape of an AttackTarget.
                 * @typedef {barc.browser.v1.AttackTarget.$Properties} barc.browser.v1.AttackTarget.$Shape
                 */

                /**
                 * Constructs a new AttackTarget.
                 * @memberof barc.browser.v1
                 * @classdesc Represents an AttackTarget.
                 * @constructor
                 * @param {barc.browser.v1.AttackTarget.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const AttackTarget = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * AttackTarget target.
                 * @member {barc.browser.v1.UnitReference.$Properties|null|undefined} target
                 * @memberof barc.browser.v1.AttackTarget
                 * @instance
                 */
                AttackTarget.prototype.target = null;

                /**
                 * Encodes the specified AttackTarget message. Does not implicitly {@link barc.browser.v1.AttackTarget.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.AttackTarget
                 * @static
                 * @param {barc.browser.v1.AttackTarget.$Properties} message AttackTarget message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                AttackTarget.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.target != null && $Object.hasOwnProperty.call(message, "target"))
                        $root.barc.browser.v1.UnitReference.encode(message.target, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified AttackTarget message, length delimited. Does not implicitly {@link barc.browser.v1.AttackTarget.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.AttackTarget
                 * @static
                 * @param {barc.browser.v1.AttackTarget.$Properties} message AttackTarget message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                AttackTarget.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes an AttackTarget message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.AttackTarget
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.AttackTarget & barc.browser.v1.AttackTarget.$Shape} AttackTarget
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                AttackTarget.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.AttackTarget();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                message.target = $root.barc.browser.v1.UnitReference.decode(reader, reader.uint32(), $undefined, _depth + 1, message.target);
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes an AttackTarget message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.AttackTarget
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.AttackTarget & barc.browser.v1.AttackTarget.$Shape} AttackTarget
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                AttackTarget.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates an AttackTarget message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.AttackTarget
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.AttackTarget} AttackTarget
                 */
                AttackTarget.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.AttackTarget)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.AttackTarget: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.AttackTarget();
                    if (object.target != null) {
                        if (!$util.isObject(object.target))
                            throw $TypeError(".barc.browser.v1.AttackTarget.target: object expected");
                        message.target = $root.barc.browser.v1.UnitReference.fromObject(object.target, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from an AttackTarget message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.AttackTarget
                 * @static
                 * @param {barc.browser.v1.AttackTarget} message AttackTarget
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                AttackTarget.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults)
                        object.target = null;
                    if (message.target != null && $Object.hasOwnProperty.call(message, "target"))
                        object.target = $root.barc.browser.v1.UnitReference.toObject(message.target, options, _depth + 1);
                    return object;
                };

                /**
                 * Converts this AttackTarget to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.AttackTarget
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                AttackTarget.prototype.toJSON = function() {
                    return AttackTarget.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for AttackTarget
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.AttackTarget
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                AttackTarget.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.AttackTarget";
                };

                return AttackTarget;
            })();

            v1.LiveIntent = (function() {

                /**
                 * Properties of a LiveIntent.
                 * @typedef {Object} barc.browser.v1.LiveIntent.$Properties
                 * @property {Array.<barc.browser.v1.UnitReference.$Properties>|null} [actors] LiveIntent actors
                 * @property {barc.browser.v1.StopAction.$Properties|null} [stop] LiveIntent stop
                 * @property {barc.browser.v1.MoveTarget.$Properties|null} [move] LiveIntent move
                 * @property {barc.browser.v1.AttackTarget.$Properties|null} [attack] LiveIntent attack
                 * @property {"stop"|"move"|"attack"} [action] LiveIntent action
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a LiveIntent.
                 * @memberof barc.browser.v1
                 * @interface ILiveIntent
                 * @augments barc.browser.v1.LiveIntent.$Properties
                 * @deprecated Use barc.browser.v1.LiveIntent.$Properties instead.
                 */

                /**
                 * Narrowed shape of a LiveIntent.
                 * @typedef {{
                 *   actors?: Array.<barc.browser.v1.UnitReference.$Shape>|null;
                 *   stop?: barc.browser.v1.StopAction.$Shape|null;
                 *   move?: barc.browser.v1.MoveTarget.$Shape|null;
                 *   attack?: barc.browser.v1.AttackTarget.$Shape|null;
                 *   $unknowns?: Array.<Uint8Array>;
                 * } & (
                 *   ({ action?: undefined; stop?: null; move?: null; attack?: null }|{ action?: "stop"; stop: barc.browser.v1.StopAction.$Shape; move?: null; attack?: null }|{ action?: "move"; stop?: null; move: barc.browser.v1.MoveTarget.$Shape; attack?: null }|{ action?: "attack"; stop?: null; move?: null; attack: barc.browser.v1.AttackTarget.$Shape })
                 * )} barc.browser.v1.LiveIntent.$Shape
                 */

                /**
                 * Constructs a new LiveIntent.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a LiveIntent.
                 * @constructor
                 * @param {barc.browser.v1.LiveIntent.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const LiveIntent = function (properties) {
                    this.actors = [];
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * LiveIntent actors.
                 * @member {Array.<barc.browser.v1.UnitReference.$Properties>} actors
                 * @memberof barc.browser.v1.LiveIntent
                 * @instance
                 */
                LiveIntent.prototype.actors = $util.emptyArray;

                /**
                 * LiveIntent stop.
                 * @member {barc.browser.v1.StopAction.$Properties|null|undefined} stop
                 * @memberof barc.browser.v1.LiveIntent
                 * @instance
                 */
                LiveIntent.prototype.stop = null;

                /**
                 * LiveIntent move.
                 * @member {barc.browser.v1.MoveTarget.$Properties|null|undefined} move
                 * @memberof barc.browser.v1.LiveIntent
                 * @instance
                 */
                LiveIntent.prototype.move = null;

                /**
                 * LiveIntent attack.
                 * @member {barc.browser.v1.AttackTarget.$Properties|null|undefined} attack
                 * @memberof barc.browser.v1.LiveIntent
                 * @instance
                 */
                LiveIntent.prototype.attack = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * LiveIntent action.
                 * @member {"stop"|"move"|"attack"|undefined} action
                 * @memberof barc.browser.v1.LiveIntent
                 * @instance
                 */
                $Object.defineProperty(LiveIntent.prototype, "action", {
                    get: $util.oneOfGetter($oneOfFields = ["stop", "move", "attack"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified LiveIntent message. Does not implicitly {@link barc.browser.v1.LiveIntent.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.LiveIntent
                 * @static
                 * @param {barc.browser.v1.LiveIntent.$Properties} message LiveIntent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveIntent.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.actors != null && message.actors.length)
                        for (let i = 0; i < message.actors.length; ++i)
                            $root.barc.browser.v1.UnitReference.encode(message.actors[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.stop != null && $Object.hasOwnProperty.call(message, "stop"))
                        $root.barc.browser.v1.StopAction.encode(message.stop, writer.uint32(/* id 10, wireType 2 =*/82).fork(), _depth + 1).ldelim();
                    if (message.move != null && $Object.hasOwnProperty.call(message, "move"))
                        $root.barc.browser.v1.MoveTarget.encode(message.move, writer.uint32(/* id 11, wireType 2 =*/90).fork(), _depth + 1).ldelim();
                    if (message.attack != null && $Object.hasOwnProperty.call(message, "attack"))
                        $root.barc.browser.v1.AttackTarget.encode(message.attack, writer.uint32(/* id 12, wireType 2 =*/98).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified LiveIntent message, length delimited. Does not implicitly {@link barc.browser.v1.LiveIntent.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.LiveIntent
                 * @static
                 * @param {barc.browser.v1.LiveIntent.$Properties} message LiveIntent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveIntent.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a LiveIntent message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.LiveIntent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveIntent & barc.browser.v1.LiveIntent.$Shape} LiveIntent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveIntent.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.LiveIntent();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if (!(message.actors && message.actors.length))
                                    message.actors = [];
                                message.actors.push($root.barc.browser.v1.UnitReference.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                continue;
                            }
                        case 10: {
                                if (wireType !== 2)
                                    break;
                                message.stop = $root.barc.browser.v1.StopAction.decode(reader, reader.uint32(), $undefined, _depth + 1, message.stop);
                                message.action = "stop";
                                continue;
                            }
                        case 11: {
                                if (wireType !== 2)
                                    break;
                                message.move = $root.barc.browser.v1.MoveTarget.decode(reader, reader.uint32(), $undefined, _depth + 1, message.move);
                                message.action = "move";
                                continue;
                            }
                        case 12: {
                                if (wireType !== 2)
                                    break;
                                message.attack = $root.barc.browser.v1.AttackTarget.decode(reader, reader.uint32(), $undefined, _depth + 1, message.attack);
                                message.action = "attack";
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a LiveIntent message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.LiveIntent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveIntent & barc.browser.v1.LiveIntent.$Shape} LiveIntent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveIntent.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a LiveIntent message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.LiveIntent
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.LiveIntent} LiveIntent
                 */
                LiveIntent.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.LiveIntent)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.LiveIntent: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.LiveIntent();
                    if (object.actors) {
                        if (!$Array.isArray(object.actors))
                            throw $TypeError(".barc.browser.v1.LiveIntent.actors: array expected");
                        message.actors = $Array(object.actors.length);
                        for (let i = 0; i < object.actors.length; ++i) {
                            if (!$util.isObject(object.actors[i]))
                                throw $TypeError(".barc.browser.v1.LiveIntent.actors: object expected");
                            message.actors[i] = $root.barc.browser.v1.UnitReference.fromObject(object.actors[i], _depth + 1);
                        }
                    }
                    if (object.stop != null) {
                        if (!$util.isObject(object.stop))
                            throw $TypeError(".barc.browser.v1.LiveIntent.stop: object expected");
                        message.stop = $root.barc.browser.v1.StopAction.fromObject(object.stop, _depth + 1);
                    }
                    if (object.move != null) {
                        if (!$util.isObject(object.move))
                            throw $TypeError(".barc.browser.v1.LiveIntent.move: object expected");
                        message.move = $root.barc.browser.v1.MoveTarget.fromObject(object.move, _depth + 1);
                    }
                    if (object.attack != null) {
                        if (!$util.isObject(object.attack))
                            throw $TypeError(".barc.browser.v1.LiveIntent.attack: object expected");
                        message.attack = $root.barc.browser.v1.AttackTarget.fromObject(object.attack, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a LiveIntent message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.LiveIntent
                 * @static
                 * @param {barc.browser.v1.LiveIntent} message LiveIntent
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                LiveIntent.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.actors = [];
                    if (message.actors && message.actors.length) {
                        object.actors = $Array(message.actors.length);
                        for (let j = 0; j < message.actors.length; ++j)
                            object.actors[j] = $root.barc.browser.v1.UnitReference.toObject(message.actors[j], options, _depth + 1);
                    }
                    if (message.stop != null && $Object.hasOwnProperty.call(message, "stop")) {
                        object.stop = $root.barc.browser.v1.StopAction.toObject(message.stop, options, _depth + 1);
                        if (options.oneofs)
                            object.action = "stop";
                    }
                    if (message.move != null && $Object.hasOwnProperty.call(message, "move")) {
                        object.move = $root.barc.browser.v1.MoveTarget.toObject(message.move, options, _depth + 1);
                        if (options.oneofs)
                            object.action = "move";
                    }
                    if (message.attack != null && $Object.hasOwnProperty.call(message, "attack")) {
                        object.attack = $root.barc.browser.v1.AttackTarget.toObject(message.attack, options, _depth + 1);
                        if (options.oneofs)
                            object.action = "attack";
                    }
                    return object;
                };

                /**
                 * Converts this LiveIntent to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.LiveIntent
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                LiveIntent.prototype.toJSON = function() {
                    return LiveIntent.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for LiveIntent
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.LiveIntent
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                LiveIntent.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.LiveIntent";
                };

                return LiveIntent;
            })();

            v1.LiveInputModifiers = (function() {

                /**
                 * Properties of a LiveInputModifiers.
                 * @typedef {Object} barc.browser.v1.LiveInputModifiers.$Properties
                 * @property {boolean|null} [shift] LiveInputModifiers shift
                 * @property {boolean|null} [control] LiveInputModifiers control
                 * @property {boolean|null} [alt] LiveInputModifiers alt
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a LiveInputModifiers.
                 * @memberof barc.browser.v1
                 * @interface ILiveInputModifiers
                 * @augments barc.browser.v1.LiveInputModifiers.$Properties
                 * @deprecated Use barc.browser.v1.LiveInputModifiers.$Properties instead.
                 */

                /**
                 * Shape of a LiveInputModifiers.
                 * @typedef {barc.browser.v1.LiveInputModifiers.$Properties} barc.browser.v1.LiveInputModifiers.$Shape
                 */

                /**
                 * Constructs a new LiveInputModifiers.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a LiveInputModifiers.
                 * @constructor
                 * @param {barc.browser.v1.LiveInputModifiers.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const LiveInputModifiers = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * LiveInputModifiers shift.
                 * @member {boolean} shift
                 * @memberof barc.browser.v1.LiveInputModifiers
                 * @instance
                 */
                LiveInputModifiers.prototype.shift = false;

                /**
                 * LiveInputModifiers control.
                 * @member {boolean} control
                 * @memberof barc.browser.v1.LiveInputModifiers
                 * @instance
                 */
                LiveInputModifiers.prototype.control = false;

                /**
                 * LiveInputModifiers alt.
                 * @member {boolean} alt
                 * @memberof barc.browser.v1.LiveInputModifiers
                 * @instance
                 */
                LiveInputModifiers.prototype.alt = false;

                /**
                 * Encodes the specified LiveInputModifiers message. Does not implicitly {@link barc.browser.v1.LiveInputModifiers.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.LiveInputModifiers
                 * @static
                 * @param {barc.browser.v1.LiveInputModifiers.$Properties} message LiveInputModifiers message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveInputModifiers.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.shift != null && $Object.hasOwnProperty.call(message, "shift") && message.shift !== false)
                        writer.uint32(/* id 1, wireType 0 =*/8).bool(message.shift);
                    if (message.control != null && $Object.hasOwnProperty.call(message, "control") && message.control !== false)
                        writer.uint32(/* id 2, wireType 0 =*/16).bool(message.control);
                    if (message.alt != null && $Object.hasOwnProperty.call(message, "alt") && message.alt !== false)
                        writer.uint32(/* id 3, wireType 0 =*/24).bool(message.alt);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified LiveInputModifiers message, length delimited. Does not implicitly {@link barc.browser.v1.LiveInputModifiers.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.LiveInputModifiers
                 * @static
                 * @param {barc.browser.v1.LiveInputModifiers.$Properties} message LiveInputModifiers message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveInputModifiers.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a LiveInputModifiers message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.LiveInputModifiers
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveInputModifiers & barc.browser.v1.LiveInputModifiers.$Shape} LiveInputModifiers
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveInputModifiers.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.LiveInputModifiers();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.bool())
                                    message.shift = value;
                                else
                                    delete message.shift;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.bool())
                                    message.control = value;
                                else
                                    delete message.control;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.bool())
                                    message.alt = value;
                                else
                                    delete message.alt;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a LiveInputModifiers message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.LiveInputModifiers
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveInputModifiers & barc.browser.v1.LiveInputModifiers.$Shape} LiveInputModifiers
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveInputModifiers.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a LiveInputModifiers message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.LiveInputModifiers
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.LiveInputModifiers} LiveInputModifiers
                 */
                LiveInputModifiers.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.LiveInputModifiers)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.LiveInputModifiers: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.LiveInputModifiers();
                    if (object.shift != null)
                        if (object.shift)
                            message.shift = $Boolean(object.shift);
                    if (object.control != null)
                        if (object.control)
                            message.control = $Boolean(object.control);
                    if (object.alt != null)
                        if (object.alt)
                            message.alt = $Boolean(object.alt);
                    return message;
                };

                /**
                 * Creates a plain object from a LiveInputModifiers message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.LiveInputModifiers
                 * @static
                 * @param {barc.browser.v1.LiveInputModifiers} message LiveInputModifiers
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                LiveInputModifiers.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.shift = false;
                        object.control = false;
                        object.alt = false;
                    }
                    if (message.shift != null && $Object.hasOwnProperty.call(message, "shift"))
                        object.shift = message.shift;
                    if (message.control != null && $Object.hasOwnProperty.call(message, "control"))
                        object.control = message.control;
                    if (message.alt != null && $Object.hasOwnProperty.call(message, "alt"))
                        object.alt = message.alt;
                    return object;
                };

                /**
                 * Converts this LiveInputModifiers to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.LiveInputModifiers
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                LiveInputModifiers.prototype.toJSON = function() {
                    return LiveInputModifiers.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for LiveInputModifiers
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.LiveInputModifiers
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                LiveInputModifiers.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.LiveInputModifiers";
                };

                return LiveInputModifiers;
            })();

            v1.LiveActorSelection = (function() {

                /**
                 * Properties of a LiveActorSelection.
                 * @typedef {Object} barc.browser.v1.LiveActorSelection.$Properties
                 * @property {Array.<barc.browser.v1.UnitReference.$Properties>|null} [actors] LiveActorSelection actors
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a LiveActorSelection.
                 * @memberof barc.browser.v1
                 * @interface ILiveActorSelection
                 * @augments barc.browser.v1.LiveActorSelection.$Properties
                 * @deprecated Use barc.browser.v1.LiveActorSelection.$Properties instead.
                 */

                /**
                 * Shape of a LiveActorSelection.
                 * @typedef {barc.browser.v1.LiveActorSelection.$Properties} barc.browser.v1.LiveActorSelection.$Shape
                 */

                /**
                 * Constructs a new LiveActorSelection.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a LiveActorSelection.
                 * @constructor
                 * @param {barc.browser.v1.LiveActorSelection.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const LiveActorSelection = function (properties) {
                    this.actors = [];
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * LiveActorSelection actors.
                 * @member {Array.<barc.browser.v1.UnitReference.$Properties>} actors
                 * @memberof barc.browser.v1.LiveActorSelection
                 * @instance
                 */
                LiveActorSelection.prototype.actors = $util.emptyArray;

                /**
                 * Encodes the specified LiveActorSelection message. Does not implicitly {@link barc.browser.v1.LiveActorSelection.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.LiveActorSelection
                 * @static
                 * @param {barc.browser.v1.LiveActorSelection.$Properties} message LiveActorSelection message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveActorSelection.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.actors != null && message.actors.length)
                        for (let i = 0; i < message.actors.length; ++i)
                            $root.barc.browser.v1.UnitReference.encode(message.actors[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified LiveActorSelection message, length delimited. Does not implicitly {@link barc.browser.v1.LiveActorSelection.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.LiveActorSelection
                 * @static
                 * @param {barc.browser.v1.LiveActorSelection.$Properties} message LiveActorSelection message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveActorSelection.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a LiveActorSelection message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.LiveActorSelection
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveActorSelection & barc.browser.v1.LiveActorSelection.$Shape} LiveActorSelection
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveActorSelection.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.LiveActorSelection();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if (!(message.actors && message.actors.length))
                                    message.actors = [];
                                message.actors.push($root.barc.browser.v1.UnitReference.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a LiveActorSelection message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.LiveActorSelection
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveActorSelection & barc.browser.v1.LiveActorSelection.$Shape} LiveActorSelection
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveActorSelection.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a LiveActorSelection message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.LiveActorSelection
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.LiveActorSelection} LiveActorSelection
                 */
                LiveActorSelection.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.LiveActorSelection)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.LiveActorSelection: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.LiveActorSelection();
                    if (object.actors) {
                        if (!$Array.isArray(object.actors))
                            throw $TypeError(".barc.browser.v1.LiveActorSelection.actors: array expected");
                        message.actors = $Array(object.actors.length);
                        for (let i = 0; i < object.actors.length; ++i) {
                            if (!$util.isObject(object.actors[i]))
                                throw $TypeError(".barc.browser.v1.LiveActorSelection.actors: object expected");
                            message.actors[i] = $root.barc.browser.v1.UnitReference.fromObject(object.actors[i], _depth + 1);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a LiveActorSelection message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.LiveActorSelection
                 * @static
                 * @param {barc.browser.v1.LiveActorSelection} message LiveActorSelection
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                LiveActorSelection.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.actors = [];
                    if (message.actors && message.actors.length) {
                        object.actors = $Array(message.actors.length);
                        for (let j = 0; j < message.actors.length; ++j)
                            object.actors[j] = $root.barc.browser.v1.UnitReference.toObject(message.actors[j], options, _depth + 1);
                    }
                    return object;
                };

                /**
                 * Converts this LiveActorSelection to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.LiveActorSelection
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                LiveActorSelection.prototype.toJSON = function() {
                    return LiveActorSelection.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for LiveActorSelection
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.LiveActorSelection
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                LiveActorSelection.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.LiveActorSelection";
                };

                return LiveActorSelection;
            })();

            v1.LiveManualInput = (function() {

                /**
                 * Properties of a LiveManualInput.
                 * @typedef {Object} barc.browser.v1.LiveManualInput.$Properties
                 * @property {barc.browser.v1.LiveInputSource|null} [source] LiveManualInput source
                 * @property {barc.browser.v1.LiveInputModifiers.$Properties|null} [modifiers] LiveManualInput modifiers
                 * @property {barc.browser.v1.LiveActorSelection.$Properties|null} [select] LiveManualInput select
                 * @property {barc.browser.v1.LiveIntent.$Properties|null} [action] LiveManualInput action
                 * @property {"select"|"action"} [input] LiveManualInput input
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a LiveManualInput.
                 * @memberof barc.browser.v1
                 * @interface ILiveManualInput
                 * @augments barc.browser.v1.LiveManualInput.$Properties
                 * @deprecated Use barc.browser.v1.LiveManualInput.$Properties instead.
                 */

                /**
                 * Narrowed shape of a LiveManualInput.
                 * @typedef {{
                 *   source?: barc.browser.v1.LiveInputSource|null;
                 *   modifiers?: barc.browser.v1.LiveInputModifiers.$Shape|null;
                 *   select?: barc.browser.v1.LiveActorSelection.$Shape|null;
                 *   action?: barc.browser.v1.LiveIntent.$Shape|null;
                 *   $unknowns?: Array.<Uint8Array>;
                 * } & (
                 *   ({ input?: undefined; select?: null; action?: null }|{ input?: "select"; select: barc.browser.v1.LiveActorSelection.$Shape; action?: null }|{ input?: "action"; select?: null; action: barc.browser.v1.LiveIntent.$Shape })
                 * )} barc.browser.v1.LiveManualInput.$Shape
                 */

                /**
                 * Constructs a new LiveManualInput.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a LiveManualInput.
                 * @constructor
                 * @param {barc.browser.v1.LiveManualInput.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const LiveManualInput = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * LiveManualInput source.
                 * @member {barc.browser.v1.LiveInputSource} source
                 * @memberof barc.browser.v1.LiveManualInput
                 * @instance
                 */
                LiveManualInput.prototype.source = 0;

                /**
                 * LiveManualInput modifiers.
                 * @member {barc.browser.v1.LiveInputModifiers.$Properties|null|undefined} modifiers
                 * @memberof barc.browser.v1.LiveManualInput
                 * @instance
                 */
                LiveManualInput.prototype.modifiers = null;

                /**
                 * LiveManualInput select.
                 * @member {barc.browser.v1.LiveActorSelection.$Properties|null|undefined} select
                 * @memberof barc.browser.v1.LiveManualInput
                 * @instance
                 */
                LiveManualInput.prototype.select = null;

                /**
                 * LiveManualInput action.
                 * @member {barc.browser.v1.LiveIntent.$Properties|null|undefined} action
                 * @memberof barc.browser.v1.LiveManualInput
                 * @instance
                 */
                LiveManualInput.prototype.action = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * LiveManualInput input.
                 * @member {"select"|"action"|undefined} input
                 * @memberof barc.browser.v1.LiveManualInput
                 * @instance
                 */
                $Object.defineProperty(LiveManualInput.prototype, "input", {
                    get: $util.oneOfGetter($oneOfFields = ["select", "action"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified LiveManualInput message. Does not implicitly {@link barc.browser.v1.LiveManualInput.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.LiveManualInput
                 * @static
                 * @param {barc.browser.v1.LiveManualInput.$Properties} message LiveManualInput message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveManualInput.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.source != null && $Object.hasOwnProperty.call(message, "source") && message.source !== 0)
                        writer.uint32(/* id 1, wireType 0 =*/8).int32(message.source);
                    if (message.modifiers != null && $Object.hasOwnProperty.call(message, "modifiers"))
                        $root.barc.browser.v1.LiveInputModifiers.encode(message.modifiers, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                    if (message.select != null && $Object.hasOwnProperty.call(message, "select"))
                        $root.barc.browser.v1.LiveActorSelection.encode(message.select, writer.uint32(/* id 10, wireType 2 =*/82).fork(), _depth + 1).ldelim();
                    if (message.action != null && $Object.hasOwnProperty.call(message, "action"))
                        $root.barc.browser.v1.LiveIntent.encode(message.action, writer.uint32(/* id 11, wireType 2 =*/90).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified LiveManualInput message, length delimited. Does not implicitly {@link barc.browser.v1.LiveManualInput.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.LiveManualInput
                 * @static
                 * @param {barc.browser.v1.LiveManualInput.$Properties} message LiveManualInput message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveManualInput.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a LiveManualInput message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.LiveManualInput
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveManualInput & barc.browser.v1.LiveManualInput.$Shape} LiveManualInput
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveManualInput.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.LiveManualInput();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.int32())
                                    message.source = value;
                                else
                                    delete message.source;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                message.modifiers = $root.barc.browser.v1.LiveInputModifiers.decode(reader, reader.uint32(), $undefined, _depth + 1, message.modifiers);
                                continue;
                            }
                        case 10: {
                                if (wireType !== 2)
                                    break;
                                message.select = $root.barc.browser.v1.LiveActorSelection.decode(reader, reader.uint32(), $undefined, _depth + 1, message.select);
                                message.input = "select";
                                continue;
                            }
                        case 11: {
                                if (wireType !== 2)
                                    break;
                                message.action = $root.barc.browser.v1.LiveIntent.decode(reader, reader.uint32(), $undefined, _depth + 1, message.action);
                                message.input = "action";
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a LiveManualInput message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.LiveManualInput
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveManualInput & barc.browser.v1.LiveManualInput.$Shape} LiveManualInput
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveManualInput.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a LiveManualInput message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.LiveManualInput
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.LiveManualInput} LiveManualInput
                 */
                LiveManualInput.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.LiveManualInput)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.LiveManualInput: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.LiveManualInput();
                    if (object.source !== 0 && (typeof object.source !== "string" || $root.barc.browser.v1.LiveInputSource[object.source] !== 0))
                        switch (object.source) {
                        case "LIVE_INPUT_SOURCE_UNSPECIFIED":
                        case 0:
                            message.source = 0;
                            break;
                        case "LIVE_INPUT_SOURCE_POINTER":
                        case 1:
                            message.source = 1;
                            break;
                        case "LIVE_INPUT_SOURCE_KEYBOARD":
                        case 2:
                            message.source = 2;
                            break;
                        default:
                            if (typeof object.source === "number" && (object.source | 0) === object.source)
                                message.source = object.source;
                        }
                    if (object.modifiers != null) {
                        if (!$util.isObject(object.modifiers))
                            throw $TypeError(".barc.browser.v1.LiveManualInput.modifiers: object expected");
                        message.modifiers = $root.barc.browser.v1.LiveInputModifiers.fromObject(object.modifiers, _depth + 1);
                    }
                    if (object.select != null) {
                        if (!$util.isObject(object.select))
                            throw $TypeError(".barc.browser.v1.LiveManualInput.select: object expected");
                        message.select = $root.barc.browser.v1.LiveActorSelection.fromObject(object.select, _depth + 1);
                    }
                    if (object.action != null) {
                        if (!$util.isObject(object.action))
                            throw $TypeError(".barc.browser.v1.LiveManualInput.action: object expected");
                        message.action = $root.barc.browser.v1.LiveIntent.fromObject(object.action, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a LiveManualInput message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.LiveManualInput
                 * @static
                 * @param {barc.browser.v1.LiveManualInput} message LiveManualInput
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                LiveManualInput.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.source = options.enums === $String ? "LIVE_INPUT_SOURCE_UNSPECIFIED" : 0;
                        object.modifiers = null;
                    }
                    if (message.source != null && $Object.hasOwnProperty.call(message, "source"))
                        object.source = options.enums === $String ? $root.barc.browser.v1.LiveInputSource[message.source] === $undefined ? message.source : $root.barc.browser.v1.LiveInputSource[message.source] : message.source;
                    if (message.modifiers != null && $Object.hasOwnProperty.call(message, "modifiers"))
                        object.modifiers = $root.barc.browser.v1.LiveInputModifiers.toObject(message.modifiers, options, _depth + 1);
                    if (message.select != null && $Object.hasOwnProperty.call(message, "select")) {
                        object.select = $root.barc.browser.v1.LiveActorSelection.toObject(message.select, options, _depth + 1);
                        if (options.oneofs)
                            object.input = "select";
                    }
                    if (message.action != null && $Object.hasOwnProperty.call(message, "action")) {
                        object.action = $root.barc.browser.v1.LiveIntent.toObject(message.action, options, _depth + 1);
                        if (options.oneofs)
                            object.input = "action";
                    }
                    return object;
                };

                /**
                 * Converts this LiveManualInput to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.LiveManualInput
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                LiveManualInput.prototype.toJSON = function() {
                    return LiveManualInput.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for LiveManualInput
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.LiveManualInput
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                LiveManualInput.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.LiveManualInput";
                };

                return LiveManualInput;
            })();

            v1.LiveResult = (function() {

                /**
                 * Properties of a LiveResult.
                 * @typedef {Object} barc.browser.v1.LiveResult.$Properties
                 * @property {Long|null} [resultSequence] LiveResult resultSequence
                 * @property {Uint8Array|null} [parentId] LiveResult parentId
                 * @property {Uint8Array|null} [inputId] LiveResult inputId
                 * @property {barc.browser.v1.LiveModuleIdentity.$Properties|null} [module] LiveResult module
                 * @property {barc.browser.v1.ObservationBasis.$Properties|null} [basis] LiveResult basis
                 * @property {barc.browser.v1.ControllerIdentity.$Properties|null} [controller] LiveResult controller
                 * @property {Long|null} [batchSequence] LiveResult batchSequence
                 * @property {Long|null} [correlationId] LiveResult correlationId
                 * @property {number|null} [childIndex] LiveResult childIndex
                 * @property {number|null} [childCount] LiveResult childCount
                 * @property {barc.browser.v1.UnitReference.$Properties|null} [actor] LiveResult actor
                 * @property {barc.browser.v1.LiveResultStage|null} [stage] LiveResult stage
                 * @property {barc.browser.v1.LiveResultStatus|null} [status] LiveResult status
                 * @property {barc.browser.v1.LiveResultDisposition|null} [disposition] LiveResult disposition
                 * @property {string|null} [reason] LiveResult reason
                 * @property {number|null} [nativeFrame] LiveResult nativeFrame
                 * @property {string|null} [commandChannelIncarnation] LiveResult commandChannelIncarnation
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a LiveResult.
                 * @memberof barc.browser.v1
                 * @interface ILiveResult
                 * @augments barc.browser.v1.LiveResult.$Properties
                 * @deprecated Use barc.browser.v1.LiveResult.$Properties instead.
                 */

                /**
                 * Shape of a LiveResult.
                 * @typedef {barc.browser.v1.LiveResult.$Properties} barc.browser.v1.LiveResult.$Shape
                 */

                /**
                 * Constructs a new LiveResult.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a LiveResult.
                 * @constructor
                 * @param {barc.browser.v1.LiveResult.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const LiveResult = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * LiveResult resultSequence.
                 * @member {Long} resultSequence
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.resultSequence = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * LiveResult parentId.
                 * @member {Uint8Array} parentId
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.parentId = $util.newBuffer([]);

                /**
                 * LiveResult inputId.
                 * @member {Uint8Array} inputId
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.inputId = $util.newBuffer([]);

                /**
                 * LiveResult module.
                 * @member {barc.browser.v1.LiveModuleIdentity.$Properties|null|undefined} module
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.module = null;

                /**
                 * LiveResult basis.
                 * @member {barc.browser.v1.ObservationBasis.$Properties|null|undefined} basis
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.basis = null;

                /**
                 * LiveResult controller.
                 * @member {barc.browser.v1.ControllerIdentity.$Properties|null|undefined} controller
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.controller = null;

                /**
                 * LiveResult batchSequence.
                 * @member {Long} batchSequence
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.batchSequence = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * LiveResult correlationId.
                 * @member {Long} correlationId
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.correlationId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * LiveResult childIndex.
                 * @member {number} childIndex
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.childIndex = 0;

                /**
                 * LiveResult childCount.
                 * @member {number} childCount
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.childCount = 0;

                /**
                 * LiveResult actor.
                 * @member {barc.browser.v1.UnitReference.$Properties|null|undefined} actor
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.actor = null;

                /**
                 * LiveResult stage.
                 * @member {barc.browser.v1.LiveResultStage} stage
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.stage = 0;

                /**
                 * LiveResult status.
                 * @member {barc.browser.v1.LiveResultStatus} status
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.status = 0;

                /**
                 * LiveResult disposition.
                 * @member {barc.browser.v1.LiveResultDisposition} disposition
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.disposition = 0;

                /**
                 * LiveResult reason.
                 * @member {string} reason
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.reason = "";

                /**
                 * LiveResult nativeFrame.
                 * @member {number|null|undefined} nativeFrame
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.nativeFrame = null;

                /**
                 * LiveResult commandChannelIncarnation.
                 * @member {string} commandChannelIncarnation
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 */
                LiveResult.prototype.commandChannelIncarnation = "";

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                // Virtual OneOf for proto3 optional field
                $Object.defineProperty(LiveResult.prototype, "_nativeFrame", {
                    get: $util.oneOfGetter($oneOfFields = ["nativeFrame"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified LiveResult message. Does not implicitly {@link barc.browser.v1.LiveResult.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.LiveResult
                 * @static
                 * @param {barc.browser.v1.LiveResult.$Properties} message LiveResult message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveResult.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.resultSequence != null && $Object.hasOwnProperty.call(message, "resultSequence") && (typeof message.resultSequence === "object" ? message.resultSequence.low || message.resultSequence.high : message.resultSequence !== 0))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.resultSequence);
                    if (message.parentId != null && $Object.hasOwnProperty.call(message, "parentId") && message.parentId.length)
                        writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.parentId);
                    if (message.inputId != null && $Object.hasOwnProperty.call(message, "inputId") && message.inputId.length)
                        writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.inputId);
                    if (message.module != null && $Object.hasOwnProperty.call(message, "module"))
                        $root.barc.browser.v1.LiveModuleIdentity.encode(message.module, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
                    if (message.basis != null && $Object.hasOwnProperty.call(message, "basis"))
                        $root.barc.browser.v1.ObservationBasis.encode(message.basis, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
                    if (message.controller != null && $Object.hasOwnProperty.call(message, "controller"))
                        $root.barc.browser.v1.ControllerIdentity.encode(message.controller, writer.uint32(/* id 6, wireType 2 =*/50).fork(), _depth + 1).ldelim();
                    if (message.batchSequence != null && $Object.hasOwnProperty.call(message, "batchSequence") && (typeof message.batchSequence === "object" ? message.batchSequence.low || message.batchSequence.high : message.batchSequence !== 0))
                        writer.uint32(/* id 7, wireType 0 =*/56).uint64(message.batchSequence);
                    if (message.correlationId != null && $Object.hasOwnProperty.call(message, "correlationId") && (typeof message.correlationId === "object" ? message.correlationId.low || message.correlationId.high : message.correlationId !== 0))
                        writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.correlationId);
                    if (message.childIndex != null && $Object.hasOwnProperty.call(message, "childIndex") && message.childIndex !== 0)
                        writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.childIndex);
                    if (message.childCount != null && $Object.hasOwnProperty.call(message, "childCount") && message.childCount !== 0)
                        writer.uint32(/* id 10, wireType 0 =*/80).uint32(message.childCount);
                    if (message.actor != null && $Object.hasOwnProperty.call(message, "actor"))
                        $root.barc.browser.v1.UnitReference.encode(message.actor, writer.uint32(/* id 11, wireType 2 =*/90).fork(), _depth + 1).ldelim();
                    if (message.stage != null && $Object.hasOwnProperty.call(message, "stage") && message.stage !== 0)
                        writer.uint32(/* id 12, wireType 0 =*/96).int32(message.stage);
                    if (message.status != null && $Object.hasOwnProperty.call(message, "status") && message.status !== 0)
                        writer.uint32(/* id 13, wireType 0 =*/104).int32(message.status);
                    if (message.disposition != null && $Object.hasOwnProperty.call(message, "disposition") && message.disposition !== 0)
                        writer.uint32(/* id 14, wireType 0 =*/112).int32(message.disposition);
                    if (message.reason != null && $Object.hasOwnProperty.call(message, "reason") && message.reason !== "")
                        writer.uint32(/* id 15, wireType 2 =*/122).string(message.reason);
                    if (message.nativeFrame != null && $Object.hasOwnProperty.call(message, "nativeFrame"))
                        writer.uint32(/* id 16, wireType 0 =*/128).uint32(message.nativeFrame);
                    if (message.commandChannelIncarnation != null && $Object.hasOwnProperty.call(message, "commandChannelIncarnation") && message.commandChannelIncarnation !== "")
                        writer.uint32(/* id 17, wireType 2 =*/138).string(message.commandChannelIncarnation);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified LiveResult message, length delimited. Does not implicitly {@link barc.browser.v1.LiveResult.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.LiveResult
                 * @static
                 * @param {barc.browser.v1.LiveResult.$Properties} message LiveResult message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveResult.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a LiveResult message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.LiveResult
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveResult & barc.browser.v1.LiveResult.$Shape} LiveResult
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveResult.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.LiveResult();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.resultSequence = value;
                                else
                                    delete message.resultSequence;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.parentId = value;
                                else
                                    delete message.parentId;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.inputId = value;
                                else
                                    delete message.inputId;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                message.module = $root.barc.browser.v1.LiveModuleIdentity.decode(reader, reader.uint32(), $undefined, _depth + 1, message.module);
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                message.basis = $root.barc.browser.v1.ObservationBasis.decode(reader, reader.uint32(), $undefined, _depth + 1, message.basis);
                                continue;
                            }
                        case 6: {
                                if (wireType !== 2)
                                    break;
                                message.controller = $root.barc.browser.v1.ControllerIdentity.decode(reader, reader.uint32(), $undefined, _depth + 1, message.controller);
                                continue;
                            }
                        case 7: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.batchSequence = value;
                                else
                                    delete message.batchSequence;
                                continue;
                            }
                        case 8: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.correlationId = value;
                                else
                                    delete message.correlationId;
                                continue;
                            }
                        case 9: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.childIndex = value;
                                else
                                    delete message.childIndex;
                                continue;
                            }
                        case 10: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.childCount = value;
                                else
                                    delete message.childCount;
                                continue;
                            }
                        case 11: {
                                if (wireType !== 2)
                                    break;
                                message.actor = $root.barc.browser.v1.UnitReference.decode(reader, reader.uint32(), $undefined, _depth + 1, message.actor);
                                continue;
                            }
                        case 12: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.int32())
                                    message.stage = value;
                                else
                                    delete message.stage;
                                continue;
                            }
                        case 13: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.int32())
                                    message.status = value;
                                else
                                    delete message.status;
                                continue;
                            }
                        case 14: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.int32())
                                    message.disposition = value;
                                else
                                    delete message.disposition;
                                continue;
                            }
                        case 15: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.reason = value;
                                else
                                    delete message.reason;
                                continue;
                            }
                        case 16: {
                                if (wireType !== 0)
                                    break;
                                message.nativeFrame = reader.uint32();
                                message._nativeFrame = "nativeFrame";
                                continue;
                            }
                        case 17: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.commandChannelIncarnation = value;
                                else
                                    delete message.commandChannelIncarnation;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a LiveResult message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.LiveResult
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveResult & barc.browser.v1.LiveResult.$Shape} LiveResult
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveResult.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a LiveResult message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.LiveResult
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.LiveResult} LiveResult
                 */
                LiveResult.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.LiveResult)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.LiveResult: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.LiveResult();
                    if (object.resultSequence != null)
                        if (typeof object.resultSequence === "object" ? object.resultSequence.low || object.resultSequence.high : $Number(object.resultSequence) !== 0)
                            if ($util.Long)
                                message.resultSequence = $util.Long.fromValue(object.resultSequence, true);
                            else if (typeof object.resultSequence === "string")
                                message.resultSequence = $parseInt(object.resultSequence, 10);
                            else if (typeof object.resultSequence === "number")
                                message.resultSequence = object.resultSequence;
                            else if (typeof object.resultSequence === "object")
                                message.resultSequence = new $util.LongBits(object.resultSequence.low >>> 0, object.resultSequence.high >>> 0).toNumber(true);
                    if (object.parentId != null)
                        if (object.parentId.length)
                            if (typeof object.parentId === "string")
                                $util.base64.decode(object.parentId, message.parentId = $util.newBuffer($util.base64.length(object.parentId)), 0);
                            else if (object.parentId.length >= 0)
                                message.parentId = object.parentId;
                    if (object.inputId != null)
                        if (object.inputId.length)
                            if (typeof object.inputId === "string")
                                $util.base64.decode(object.inputId, message.inputId = $util.newBuffer($util.base64.length(object.inputId)), 0);
                            else if (object.inputId.length >= 0)
                                message.inputId = object.inputId;
                    if (object.module != null) {
                        if (!$util.isObject(object.module))
                            throw $TypeError(".barc.browser.v1.LiveResult.module: object expected");
                        message.module = $root.barc.browser.v1.LiveModuleIdentity.fromObject(object.module, _depth + 1);
                    }
                    if (object.basis != null) {
                        if (!$util.isObject(object.basis))
                            throw $TypeError(".barc.browser.v1.LiveResult.basis: object expected");
                        message.basis = $root.barc.browser.v1.ObservationBasis.fromObject(object.basis, _depth + 1);
                    }
                    if (object.controller != null) {
                        if (!$util.isObject(object.controller))
                            throw $TypeError(".barc.browser.v1.LiveResult.controller: object expected");
                        message.controller = $root.barc.browser.v1.ControllerIdentity.fromObject(object.controller, _depth + 1);
                    }
                    if (object.batchSequence != null)
                        if (typeof object.batchSequence === "object" ? object.batchSequence.low || object.batchSequence.high : $Number(object.batchSequence) !== 0)
                            if ($util.Long)
                                message.batchSequence = $util.Long.fromValue(object.batchSequence, true);
                            else if (typeof object.batchSequence === "string")
                                message.batchSequence = $parseInt(object.batchSequence, 10);
                            else if (typeof object.batchSequence === "number")
                                message.batchSequence = object.batchSequence;
                            else if (typeof object.batchSequence === "object")
                                message.batchSequence = new $util.LongBits(object.batchSequence.low >>> 0, object.batchSequence.high >>> 0).toNumber(true);
                    if (object.correlationId != null)
                        if (typeof object.correlationId === "object" ? object.correlationId.low || object.correlationId.high : $Number(object.correlationId) !== 0)
                            if ($util.Long)
                                message.correlationId = $util.Long.fromValue(object.correlationId, true);
                            else if (typeof object.correlationId === "string")
                                message.correlationId = $parseInt(object.correlationId, 10);
                            else if (typeof object.correlationId === "number")
                                message.correlationId = object.correlationId;
                            else if (typeof object.correlationId === "object")
                                message.correlationId = new $util.LongBits(object.correlationId.low >>> 0, object.correlationId.high >>> 0).toNumber(true);
                    if (object.childIndex != null)
                        if ($Number(object.childIndex) !== 0)
                            message.childIndex = object.childIndex >>> 0;
                    if (object.childCount != null)
                        if ($Number(object.childCount) !== 0)
                            message.childCount = object.childCount >>> 0;
                    if (object.actor != null) {
                        if (!$util.isObject(object.actor))
                            throw $TypeError(".barc.browser.v1.LiveResult.actor: object expected");
                        message.actor = $root.barc.browser.v1.UnitReference.fromObject(object.actor, _depth + 1);
                    }
                    if (object.stage !== 0 && (typeof object.stage !== "string" || $root.barc.browser.v1.LiveResultStage[object.stage] !== 0))
                        switch (object.stage) {
                        case "LIVE_RESULT_STAGE_UNSPECIFIED":
                        case 0:
                            message.stage = 0;
                            break;
                        case "LIVE_RESULT_STAGE_BROKER_ADMISSION":
                        case 1:
                            message.stage = 1;
                            break;
                        case "LIVE_RESULT_STAGE_NATIVE_ADMISSION":
                        case 2:
                            message.stage = 2;
                            break;
                        case "LIVE_RESULT_STAGE_NATIVE_DISPATCH":
                        case 3:
                            message.stage = 3;
                            break;
                        case "LIVE_RESULT_STAGE_UNKNOWN":
                        case 4:
                            message.stage = 4;
                            break;
                        default:
                            if (typeof object.stage === "number" && (object.stage | 0) === object.stage)
                                message.stage = object.stage;
                        }
                    if (object.status !== 0 && (typeof object.status !== "string" || $root.barc.browser.v1.LiveResultStatus[object.status] !== 0))
                        switch (object.status) {
                        case "LIVE_RESULT_STATUS_UNSPECIFIED":
                        case 0:
                            message.status = 0;
                            break;
                        case "LIVE_RESULT_STATUS_ACCEPTED":
                        case 1:
                            message.status = 1;
                            break;
                        case "LIVE_RESULT_STATUS_REJECTED":
                        case 2:
                            message.status = 2;
                            break;
                        case "LIVE_RESULT_STATUS_APPLIED":
                        case 3:
                            message.status = 3;
                            break;
                        case "LIVE_RESULT_STATUS_SKIPPED":
                        case 4:
                            message.status = 4;
                            break;
                        case "LIVE_RESULT_STATUS_EXPIRED":
                        case 5:
                            message.status = 5;
                            break;
                        case "LIVE_RESULT_STATUS_UNKNOWN":
                        case 6:
                            message.status = 6;
                            break;
                        default:
                            if (typeof object.status === "number" && (object.status | 0) === object.status)
                                message.status = object.status;
                        }
                    if (object.disposition !== 0 && (typeof object.disposition !== "string" || $root.barc.browser.v1.LiveResultDisposition[object.disposition] !== 0))
                        switch (object.disposition) {
                        case "LIVE_RESULT_DISPOSITION_UNSPECIFIED":
                        case 0:
                            message.disposition = 0;
                            break;
                        case "LIVE_RESULT_DISPOSITION_RECORDED":
                        case 1:
                            message.disposition = 1;
                            break;
                        case "LIVE_RESULT_DISPOSITION_DUPLICATE":
                        case 2:
                            message.disposition = 2;
                            break;
                        case "LIVE_RESULT_DISPOSITION_LATE":
                        case 3:
                            message.disposition = 3;
                            break;
                        default:
                            if (typeof object.disposition === "number" && (object.disposition | 0) === object.disposition)
                                message.disposition = object.disposition;
                        }
                    if (object.reason != null)
                        if (typeof object.reason !== "string" || object.reason.length)
                            message.reason = $String(object.reason);
                    if (object.nativeFrame != null)
                        message.nativeFrame = object.nativeFrame >>> 0;
                    if (object.commandChannelIncarnation != null)
                        if (typeof object.commandChannelIncarnation !== "string" || object.commandChannelIncarnation.length)
                            message.commandChannelIncarnation = $String(object.commandChannelIncarnation);
                    return message;
                };

                /**
                 * Creates a plain object from a LiveResult message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.LiveResult
                 * @static
                 * @param {barc.browser.v1.LiveResult} message LiveResult
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                LiveResult.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.resultSequence = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.resultSequence = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        if (options.bytes === $String)
                            object.parentId = "";
                        else {
                            object.parentId = [];
                            if (options.bytes !== $Array)
                                object.parentId = $util.newBuffer(object.parentId);
                        }
                        if (options.bytes === $String)
                            object.inputId = "";
                        else {
                            object.inputId = [];
                            if (options.bytes !== $Array)
                                object.inputId = $util.newBuffer(object.inputId);
                        }
                        object.module = null;
                        object.basis = null;
                        object.controller = null;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.batchSequence = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.batchSequence = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.correlationId = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.correlationId = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        object.childIndex = 0;
                        object.childCount = 0;
                        object.actor = null;
                        object.stage = options.enums === $String ? "LIVE_RESULT_STAGE_UNSPECIFIED" : 0;
                        object.status = options.enums === $String ? "LIVE_RESULT_STATUS_UNSPECIFIED" : 0;
                        object.disposition = options.enums === $String ? "LIVE_RESULT_DISPOSITION_UNSPECIFIED" : 0;
                        object.reason = "";
                        object.commandChannelIncarnation = "";
                    }
                    if (message.resultSequence != null && $Object.hasOwnProperty.call(message, "resultSequence"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.resultSequence = typeof message.resultSequence === "number" ? $BigInt(message.resultSequence) : $util.Long.fromBits(message.resultSequence.low >>> 0, message.resultSequence.high >>> 0, true).toBigInt();
                        else if (typeof message.resultSequence === "number")
                            object.resultSequence = options.longs === $String ? $String(message.resultSequence) : message.resultSequence;
                        else
                            object.resultSequence = options.longs === $String ? $util.Long.prototype.toString.call(message.resultSequence) : options.longs === $Number ? new $util.LongBits(message.resultSequence.low >>> 0, message.resultSequence.high >>> 0).toNumber(true) : message.resultSequence;
                    if (message.parentId != null && $Object.hasOwnProperty.call(message, "parentId"))
                        object.parentId = options.bytes === $String ? $util.base64.encode(message.parentId, 0, message.parentId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.parentId) : message.parentId;
                    if (message.inputId != null && $Object.hasOwnProperty.call(message, "inputId"))
                        object.inputId = options.bytes === $String ? $util.base64.encode(message.inputId, 0, message.inputId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.inputId) : message.inputId;
                    if (message.module != null && $Object.hasOwnProperty.call(message, "module"))
                        object.module = $root.barc.browser.v1.LiveModuleIdentity.toObject(message.module, options, _depth + 1);
                    if (message.basis != null && $Object.hasOwnProperty.call(message, "basis"))
                        object.basis = $root.barc.browser.v1.ObservationBasis.toObject(message.basis, options, _depth + 1);
                    if (message.controller != null && $Object.hasOwnProperty.call(message, "controller"))
                        object.controller = $root.barc.browser.v1.ControllerIdentity.toObject(message.controller, options, _depth + 1);
                    if (message.batchSequence != null && $Object.hasOwnProperty.call(message, "batchSequence"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.batchSequence = typeof message.batchSequence === "number" ? $BigInt(message.batchSequence) : $util.Long.fromBits(message.batchSequence.low >>> 0, message.batchSequence.high >>> 0, true).toBigInt();
                        else if (typeof message.batchSequence === "number")
                            object.batchSequence = options.longs === $String ? $String(message.batchSequence) : message.batchSequence;
                        else
                            object.batchSequence = options.longs === $String ? $util.Long.prototype.toString.call(message.batchSequence) : options.longs === $Number ? new $util.LongBits(message.batchSequence.low >>> 0, message.batchSequence.high >>> 0).toNumber(true) : message.batchSequence;
                    if (message.correlationId != null && $Object.hasOwnProperty.call(message, "correlationId"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.correlationId = typeof message.correlationId === "number" ? $BigInt(message.correlationId) : $util.Long.fromBits(message.correlationId.low >>> 0, message.correlationId.high >>> 0, true).toBigInt();
                        else if (typeof message.correlationId === "number")
                            object.correlationId = options.longs === $String ? $String(message.correlationId) : message.correlationId;
                        else
                            object.correlationId = options.longs === $String ? $util.Long.prototype.toString.call(message.correlationId) : options.longs === $Number ? new $util.LongBits(message.correlationId.low >>> 0, message.correlationId.high >>> 0).toNumber(true) : message.correlationId;
                    if (message.childIndex != null && $Object.hasOwnProperty.call(message, "childIndex"))
                        object.childIndex = message.childIndex;
                    if (message.childCount != null && $Object.hasOwnProperty.call(message, "childCount"))
                        object.childCount = message.childCount;
                    if (message.actor != null && $Object.hasOwnProperty.call(message, "actor"))
                        object.actor = $root.barc.browser.v1.UnitReference.toObject(message.actor, options, _depth + 1);
                    if (message.stage != null && $Object.hasOwnProperty.call(message, "stage"))
                        object.stage = options.enums === $String ? $root.barc.browser.v1.LiveResultStage[message.stage] === $undefined ? message.stage : $root.barc.browser.v1.LiveResultStage[message.stage] : message.stage;
                    if (message.status != null && $Object.hasOwnProperty.call(message, "status"))
                        object.status = options.enums === $String ? $root.barc.browser.v1.LiveResultStatus[message.status] === $undefined ? message.status : $root.barc.browser.v1.LiveResultStatus[message.status] : message.status;
                    if (message.disposition != null && $Object.hasOwnProperty.call(message, "disposition"))
                        object.disposition = options.enums === $String ? $root.barc.browser.v1.LiveResultDisposition[message.disposition] === $undefined ? message.disposition : $root.barc.browser.v1.LiveResultDisposition[message.disposition] : message.disposition;
                    if (message.reason != null && $Object.hasOwnProperty.call(message, "reason"))
                        object.reason = message.reason;
                    if (message.nativeFrame != null && $Object.hasOwnProperty.call(message, "nativeFrame"))
                        object.nativeFrame = message.nativeFrame;
                    if (message.commandChannelIncarnation != null && $Object.hasOwnProperty.call(message, "commandChannelIncarnation"))
                        object.commandChannelIncarnation = message.commandChannelIncarnation;
                    return object;
                };

                /**
                 * Converts this LiveResult to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.LiveResult
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                LiveResult.prototype.toJSON = function() {
                    return LiveResult.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for LiveResult
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.LiveResult
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                LiveResult.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.LiveResult";
                };

                return LiveResult;
            })();

            v1.LiveGuestRequest = (function() {

                /**
                 * Properties of a LiveGuestRequest.
                 * @typedef {Object} barc.browser.v1.LiveGuestRequest.$Properties
                 * @property {Uint8Array|null} [inputId] LiveGuestRequest inputId
                 * @property {Uint8Array|null} [sessionId] LiveGuestRequest sessionId
                 * @property {Long|null} [moduleGeneration] LiveGuestRequest moduleGeneration
                 * @property {barc.browser.v1.ObservationBasis.$Properties|null} [basis] LiveGuestRequest basis
                 * @property {barc.browser.v1.LiveBootstrap.$Properties|null} [initialize] LiveGuestRequest initialize
                 * @property {barc.browser.v1.LiveObservation.$Properties|null} [observation] LiveGuestRequest observation
                 * @property {barc.browser.v1.LiveResult.$Properties|null} [result] LiveGuestRequest result
                 * @property {barc.browser.v1.LiveManualInput.$Properties|null} [manualInput] LiveGuestRequest manualInput
                 * @property {"initialize"|"observation"|"result"|"manualInput"} [input] LiveGuestRequest input
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a LiveGuestRequest.
                 * @memberof barc.browser.v1
                 * @interface ILiveGuestRequest
                 * @augments barc.browser.v1.LiveGuestRequest.$Properties
                 * @deprecated Use barc.browser.v1.LiveGuestRequest.$Properties instead.
                 */

                /**
                 * Narrowed shape of a LiveGuestRequest.
                 * @typedef {{
                 *   inputId?: Uint8Array|null;
                 *   sessionId?: Uint8Array|null;
                 *   moduleGeneration?: Long|null;
                 *   basis?: barc.browser.v1.ObservationBasis.$Shape|null;
                 *   initialize?: barc.browser.v1.LiveBootstrap.$Shape|null;
                 *   observation?: barc.browser.v1.LiveObservation.$Shape|null;
                 *   result?: barc.browser.v1.LiveResult.$Shape|null;
                 *   manualInput?: barc.browser.v1.LiveManualInput.$Shape|null;
                 *   $unknowns?: Array.<Uint8Array>;
                 * } & (
                 *   ({ input?: undefined; initialize?: null; observation?: null; result?: null; manualInput?: null }|{ input?: "initialize"; initialize: barc.browser.v1.LiveBootstrap.$Shape; observation?: null; result?: null; manualInput?: null }|{ input?: "observation"; initialize?: null; observation: barc.browser.v1.LiveObservation.$Shape; result?: null; manualInput?: null }|{ input?: "result"; initialize?: null; observation?: null; result: barc.browser.v1.LiveResult.$Shape; manualInput?: null }|{ input?: "manualInput"; initialize?: null; observation?: null; result?: null; manualInput: barc.browser.v1.LiveManualInput.$Shape })
                 * )} barc.browser.v1.LiveGuestRequest.$Shape
                 */

                /**
                 * Constructs a new LiveGuestRequest.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a LiveGuestRequest.
                 * @constructor
                 * @param {barc.browser.v1.LiveGuestRequest.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const LiveGuestRequest = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * LiveGuestRequest inputId.
                 * @member {Uint8Array} inputId
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @instance
                 */
                LiveGuestRequest.prototype.inputId = $util.newBuffer([]);

                /**
                 * LiveGuestRequest sessionId.
                 * @member {Uint8Array} sessionId
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @instance
                 */
                LiveGuestRequest.prototype.sessionId = $util.newBuffer([]);

                /**
                 * LiveGuestRequest moduleGeneration.
                 * @member {Long} moduleGeneration
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @instance
                 */
                LiveGuestRequest.prototype.moduleGeneration = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * LiveGuestRequest basis.
                 * @member {barc.browser.v1.ObservationBasis.$Properties|null|undefined} basis
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @instance
                 */
                LiveGuestRequest.prototype.basis = null;

                /**
                 * LiveGuestRequest initialize.
                 * @member {barc.browser.v1.LiveBootstrap.$Properties|null|undefined} initialize
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @instance
                 */
                LiveGuestRequest.prototype.initialize = null;

                /**
                 * LiveGuestRequest observation.
                 * @member {barc.browser.v1.LiveObservation.$Properties|null|undefined} observation
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @instance
                 */
                LiveGuestRequest.prototype.observation = null;

                /**
                 * LiveGuestRequest result.
                 * @member {barc.browser.v1.LiveResult.$Properties|null|undefined} result
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @instance
                 */
                LiveGuestRequest.prototype.result = null;

                /**
                 * LiveGuestRequest manualInput.
                 * @member {barc.browser.v1.LiveManualInput.$Properties|null|undefined} manualInput
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @instance
                 */
                LiveGuestRequest.prototype.manualInput = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * LiveGuestRequest input.
                 * @member {"initialize"|"observation"|"result"|"manualInput"|undefined} input
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @instance
                 */
                $Object.defineProperty(LiveGuestRequest.prototype, "input", {
                    get: $util.oneOfGetter($oneOfFields = ["initialize", "observation", "result", "manualInput"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified LiveGuestRequest message. Does not implicitly {@link barc.browser.v1.LiveGuestRequest.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @static
                 * @param {barc.browser.v1.LiveGuestRequest.$Properties} message LiveGuestRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveGuestRequest.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.inputId != null && $Object.hasOwnProperty.call(message, "inputId") && message.inputId.length)
                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.inputId);
                    if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId.length)
                        writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.sessionId);
                    if (message.moduleGeneration != null && $Object.hasOwnProperty.call(message, "moduleGeneration") && (typeof message.moduleGeneration === "object" ? message.moduleGeneration.low || message.moduleGeneration.high : message.moduleGeneration !== 0))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.moduleGeneration);
                    if (message.basis != null && $Object.hasOwnProperty.call(message, "basis"))
                        $root.barc.browser.v1.ObservationBasis.encode(message.basis, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
                    if (message.initialize != null && $Object.hasOwnProperty.call(message, "initialize"))
                        $root.barc.browser.v1.LiveBootstrap.encode(message.initialize, writer.uint32(/* id 10, wireType 2 =*/82).fork(), _depth + 1).ldelim();
                    if (message.observation != null && $Object.hasOwnProperty.call(message, "observation"))
                        $root.barc.browser.v1.LiveObservation.encode(message.observation, writer.uint32(/* id 11, wireType 2 =*/90).fork(), _depth + 1).ldelim();
                    if (message.result != null && $Object.hasOwnProperty.call(message, "result"))
                        $root.barc.browser.v1.LiveResult.encode(message.result, writer.uint32(/* id 12, wireType 2 =*/98).fork(), _depth + 1).ldelim();
                    if (message.manualInput != null && $Object.hasOwnProperty.call(message, "manualInput"))
                        $root.barc.browser.v1.LiveManualInput.encode(message.manualInput, writer.uint32(/* id 13, wireType 2 =*/106).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified LiveGuestRequest message, length delimited. Does not implicitly {@link barc.browser.v1.LiveGuestRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @static
                 * @param {barc.browser.v1.LiveGuestRequest.$Properties} message LiveGuestRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveGuestRequest.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a LiveGuestRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveGuestRequest & barc.browser.v1.LiveGuestRequest.$Shape} LiveGuestRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveGuestRequest.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.LiveGuestRequest();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.inputId = value;
                                else
                                    delete message.inputId;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.sessionId = value;
                                else
                                    delete message.sessionId;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.moduleGeneration = value;
                                else
                                    delete message.moduleGeneration;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                message.basis = $root.barc.browser.v1.ObservationBasis.decode(reader, reader.uint32(), $undefined, _depth + 1, message.basis);
                                continue;
                            }
                        case 10: {
                                if (wireType !== 2)
                                    break;
                                message.initialize = $root.barc.browser.v1.LiveBootstrap.decode(reader, reader.uint32(), $undefined, _depth + 1, message.initialize);
                                message.input = "initialize";
                                continue;
                            }
                        case 11: {
                                if (wireType !== 2)
                                    break;
                                message.observation = $root.barc.browser.v1.LiveObservation.decode(reader, reader.uint32(), $undefined, _depth + 1, message.observation);
                                message.input = "observation";
                                continue;
                            }
                        case 12: {
                                if (wireType !== 2)
                                    break;
                                message.result = $root.barc.browser.v1.LiveResult.decode(reader, reader.uint32(), $undefined, _depth + 1, message.result);
                                message.input = "result";
                                continue;
                            }
                        case 13: {
                                if (wireType !== 2)
                                    break;
                                message.manualInput = $root.barc.browser.v1.LiveManualInput.decode(reader, reader.uint32(), $undefined, _depth + 1, message.manualInput);
                                message.input = "manualInput";
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a LiveGuestRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveGuestRequest & barc.browser.v1.LiveGuestRequest.$Shape} LiveGuestRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveGuestRequest.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a LiveGuestRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.LiveGuestRequest} LiveGuestRequest
                 */
                LiveGuestRequest.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.LiveGuestRequest)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.LiveGuestRequest: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.LiveGuestRequest();
                    if (object.inputId != null)
                        if (object.inputId.length)
                            if (typeof object.inputId === "string")
                                $util.base64.decode(object.inputId, message.inputId = $util.newBuffer($util.base64.length(object.inputId)), 0);
                            else if (object.inputId.length >= 0)
                                message.inputId = object.inputId;
                    if (object.sessionId != null)
                        if (object.sessionId.length)
                            if (typeof object.sessionId === "string")
                                $util.base64.decode(object.sessionId, message.sessionId = $util.newBuffer($util.base64.length(object.sessionId)), 0);
                            else if (object.sessionId.length >= 0)
                                message.sessionId = object.sessionId;
                    if (object.moduleGeneration != null)
                        if (typeof object.moduleGeneration === "object" ? object.moduleGeneration.low || object.moduleGeneration.high : $Number(object.moduleGeneration) !== 0)
                            if ($util.Long)
                                message.moduleGeneration = $util.Long.fromValue(object.moduleGeneration, true);
                            else if (typeof object.moduleGeneration === "string")
                                message.moduleGeneration = $parseInt(object.moduleGeneration, 10);
                            else if (typeof object.moduleGeneration === "number")
                                message.moduleGeneration = object.moduleGeneration;
                            else if (typeof object.moduleGeneration === "object")
                                message.moduleGeneration = new $util.LongBits(object.moduleGeneration.low >>> 0, object.moduleGeneration.high >>> 0).toNumber(true);
                    if (object.basis != null) {
                        if (!$util.isObject(object.basis))
                            throw $TypeError(".barc.browser.v1.LiveGuestRequest.basis: object expected");
                        message.basis = $root.barc.browser.v1.ObservationBasis.fromObject(object.basis, _depth + 1);
                    }
                    if (object.initialize != null) {
                        if (!$util.isObject(object.initialize))
                            throw $TypeError(".barc.browser.v1.LiveGuestRequest.initialize: object expected");
                        message.initialize = $root.barc.browser.v1.LiveBootstrap.fromObject(object.initialize, _depth + 1);
                    }
                    if (object.observation != null) {
                        if (!$util.isObject(object.observation))
                            throw $TypeError(".barc.browser.v1.LiveGuestRequest.observation: object expected");
                        message.observation = $root.barc.browser.v1.LiveObservation.fromObject(object.observation, _depth + 1);
                    }
                    if (object.result != null) {
                        if (!$util.isObject(object.result))
                            throw $TypeError(".barc.browser.v1.LiveGuestRequest.result: object expected");
                        message.result = $root.barc.browser.v1.LiveResult.fromObject(object.result, _depth + 1);
                    }
                    if (object.manualInput != null) {
                        if (!$util.isObject(object.manualInput))
                            throw $TypeError(".barc.browser.v1.LiveGuestRequest.manualInput: object expected");
                        message.manualInput = $root.barc.browser.v1.LiveManualInput.fromObject(object.manualInput, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a LiveGuestRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @static
                 * @param {barc.browser.v1.LiveGuestRequest} message LiveGuestRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                LiveGuestRequest.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        if (options.bytes === $String)
                            object.inputId = "";
                        else {
                            object.inputId = [];
                            if (options.bytes !== $Array)
                                object.inputId = $util.newBuffer(object.inputId);
                        }
                        if (options.bytes === $String)
                            object.sessionId = "";
                        else {
                            object.sessionId = [];
                            if (options.bytes !== $Array)
                                object.sessionId = $util.newBuffer(object.sessionId);
                        }
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.moduleGeneration = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.moduleGeneration = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        object.basis = null;
                    }
                    if (message.inputId != null && $Object.hasOwnProperty.call(message, "inputId"))
                        object.inputId = options.bytes === $String ? $util.base64.encode(message.inputId, 0, message.inputId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.inputId) : message.inputId;
                    if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                        object.sessionId = options.bytes === $String ? $util.base64.encode(message.sessionId, 0, message.sessionId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.sessionId) : message.sessionId;
                    if (message.moduleGeneration != null && $Object.hasOwnProperty.call(message, "moduleGeneration"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.moduleGeneration = typeof message.moduleGeneration === "number" ? $BigInt(message.moduleGeneration) : $util.Long.fromBits(message.moduleGeneration.low >>> 0, message.moduleGeneration.high >>> 0, true).toBigInt();
                        else if (typeof message.moduleGeneration === "number")
                            object.moduleGeneration = options.longs === $String ? $String(message.moduleGeneration) : message.moduleGeneration;
                        else
                            object.moduleGeneration = options.longs === $String ? $util.Long.prototype.toString.call(message.moduleGeneration) : options.longs === $Number ? new $util.LongBits(message.moduleGeneration.low >>> 0, message.moduleGeneration.high >>> 0).toNumber(true) : message.moduleGeneration;
                    if (message.basis != null && $Object.hasOwnProperty.call(message, "basis"))
                        object.basis = $root.barc.browser.v1.ObservationBasis.toObject(message.basis, options, _depth + 1);
                    if (message.initialize != null && $Object.hasOwnProperty.call(message, "initialize")) {
                        object.initialize = $root.barc.browser.v1.LiveBootstrap.toObject(message.initialize, options, _depth + 1);
                        if (options.oneofs)
                            object.input = "initialize";
                    }
                    if (message.observation != null && $Object.hasOwnProperty.call(message, "observation")) {
                        object.observation = $root.barc.browser.v1.LiveObservation.toObject(message.observation, options, _depth + 1);
                        if (options.oneofs)
                            object.input = "observation";
                    }
                    if (message.result != null && $Object.hasOwnProperty.call(message, "result")) {
                        object.result = $root.barc.browser.v1.LiveResult.toObject(message.result, options, _depth + 1);
                        if (options.oneofs)
                            object.input = "result";
                    }
                    if (message.manualInput != null && $Object.hasOwnProperty.call(message, "manualInput")) {
                        object.manualInput = $root.barc.browser.v1.LiveManualInput.toObject(message.manualInput, options, _depth + 1);
                        if (options.oneofs)
                            object.input = "manualInput";
                    }
                    return object;
                };

                /**
                 * Converts this LiveGuestRequest to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                LiveGuestRequest.prototype.toJSON = function() {
                    return LiveGuestRequest.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for LiveGuestRequest
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.LiveGuestRequest
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                LiveGuestRequest.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.LiveGuestRequest";
                };

                return LiveGuestRequest;
            })();

            v1.LiveGuestResponse = (function() {

                /**
                 * Properties of a LiveGuestResponse.
                 * @typedef {Object} barc.browser.v1.LiveGuestResponse.$Properties
                 * @property {Uint8Array|null} [inputId] LiveGuestResponse inputId
                 * @property {Uint8Array|null} [sessionId] LiveGuestResponse sessionId
                 * @property {Long|null} [moduleGeneration] LiveGuestResponse moduleGeneration
                 * @property {barc.browser.v1.ObservationBasis.$Properties|null} [basis] LiveGuestResponse basis
                 * @property {barc.browser.v1.GuestAckStatus|null} [acknowledgment] LiveGuestResponse acknowledgment
                 * @property {string|null} [refusalDetail] LiveGuestResponse refusalDetail
                 * @property {barc.browser.v1.LiveIntent.$Properties|null} [intent] LiveGuestResponse intent
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a LiveGuestResponse.
                 * @memberof barc.browser.v1
                 * @interface ILiveGuestResponse
                 * @augments barc.browser.v1.LiveGuestResponse.$Properties
                 * @deprecated Use barc.browser.v1.LiveGuestResponse.$Properties instead.
                 */

                /**
                 * Shape of a LiveGuestResponse.
                 * @typedef {{
                 *   inputId?: Uint8Array|null;
                 *   sessionId?: Uint8Array|null;
                 *   moduleGeneration?: Long|null;
                 *   basis?: barc.browser.v1.ObservationBasis.$Shape|null;
                 *   acknowledgment?: barc.browser.v1.GuestAckStatus|null;
                 *   refusalDetail?: string|null;
                 *   intent?: barc.browser.v1.LiveIntent.$Shape|null;
                 *   $unknowns?: Array.<Uint8Array>;
                 * }} barc.browser.v1.LiveGuestResponse.$Shape
                 */

                /**
                 * Constructs a new LiveGuestResponse.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a LiveGuestResponse.
                 * @constructor
                 * @param {barc.browser.v1.LiveGuestResponse.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const LiveGuestResponse = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * LiveGuestResponse inputId.
                 * @member {Uint8Array} inputId
                 * @memberof barc.browser.v1.LiveGuestResponse
                 * @instance
                 */
                LiveGuestResponse.prototype.inputId = $util.newBuffer([]);

                /**
                 * LiveGuestResponse sessionId.
                 * @member {Uint8Array} sessionId
                 * @memberof barc.browser.v1.LiveGuestResponse
                 * @instance
                 */
                LiveGuestResponse.prototype.sessionId = $util.newBuffer([]);

                /**
                 * LiveGuestResponse moduleGeneration.
                 * @member {Long} moduleGeneration
                 * @memberof barc.browser.v1.LiveGuestResponse
                 * @instance
                 */
                LiveGuestResponse.prototype.moduleGeneration = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * LiveGuestResponse basis.
                 * @member {barc.browser.v1.ObservationBasis.$Properties|null|undefined} basis
                 * @memberof barc.browser.v1.LiveGuestResponse
                 * @instance
                 */
                LiveGuestResponse.prototype.basis = null;

                /**
                 * LiveGuestResponse acknowledgment.
                 * @member {barc.browser.v1.GuestAckStatus} acknowledgment
                 * @memberof barc.browser.v1.LiveGuestResponse
                 * @instance
                 */
                LiveGuestResponse.prototype.acknowledgment = 0;

                /**
                 * LiveGuestResponse refusalDetail.
                 * @member {string} refusalDetail
                 * @memberof barc.browser.v1.LiveGuestResponse
                 * @instance
                 */
                LiveGuestResponse.prototype.refusalDetail = "";

                /**
                 * LiveGuestResponse intent.
                 * @member {barc.browser.v1.LiveIntent.$Properties|null|undefined} intent
                 * @memberof barc.browser.v1.LiveGuestResponse
                 * @instance
                 */
                LiveGuestResponse.prototype.intent = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                // Virtual OneOf for proto3 optional field
                $Object.defineProperty(LiveGuestResponse.prototype, "_intent", {
                    get: $util.oneOfGetter($oneOfFields = ["intent"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified LiveGuestResponse message. Does not implicitly {@link barc.browser.v1.LiveGuestResponse.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.LiveGuestResponse
                 * @static
                 * @param {barc.browser.v1.LiveGuestResponse.$Properties} message LiveGuestResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveGuestResponse.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.inputId != null && $Object.hasOwnProperty.call(message, "inputId") && message.inputId.length)
                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.inputId);
                    if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId.length)
                        writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.sessionId);
                    if (message.moduleGeneration != null && $Object.hasOwnProperty.call(message, "moduleGeneration") && (typeof message.moduleGeneration === "object" ? message.moduleGeneration.low || message.moduleGeneration.high : message.moduleGeneration !== 0))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.moduleGeneration);
                    if (message.basis != null && $Object.hasOwnProperty.call(message, "basis"))
                        $root.barc.browser.v1.ObservationBasis.encode(message.basis, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
                    if (message.acknowledgment != null && $Object.hasOwnProperty.call(message, "acknowledgment") && message.acknowledgment !== 0)
                        writer.uint32(/* id 5, wireType 0 =*/40).int32(message.acknowledgment);
                    if (message.refusalDetail != null && $Object.hasOwnProperty.call(message, "refusalDetail") && message.refusalDetail !== "")
                        writer.uint32(/* id 6, wireType 2 =*/50).string(message.refusalDetail);
                    if (message.intent != null && $Object.hasOwnProperty.call(message, "intent"))
                        $root.barc.browser.v1.LiveIntent.encode(message.intent, writer.uint32(/* id 10, wireType 2 =*/82).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified LiveGuestResponse message, length delimited. Does not implicitly {@link barc.browser.v1.LiveGuestResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.LiveGuestResponse
                 * @static
                 * @param {barc.browser.v1.LiveGuestResponse.$Properties} message LiveGuestResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveGuestResponse.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a LiveGuestResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.LiveGuestResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveGuestResponse & barc.browser.v1.LiveGuestResponse.$Shape} LiveGuestResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveGuestResponse.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.LiveGuestResponse();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.inputId = value;
                                else
                                    delete message.inputId;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.sessionId = value;
                                else
                                    delete message.sessionId;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.moduleGeneration = value;
                                else
                                    delete message.moduleGeneration;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                message.basis = $root.barc.browser.v1.ObservationBasis.decode(reader, reader.uint32(), $undefined, _depth + 1, message.basis);
                                continue;
                            }
                        case 5: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.int32())
                                    message.acknowledgment = value;
                                else
                                    delete message.acknowledgment;
                                continue;
                            }
                        case 6: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.refusalDetail = value;
                                else
                                    delete message.refusalDetail;
                                continue;
                            }
                        case 10: {
                                if (wireType !== 2)
                                    break;
                                message.intent = $root.barc.browser.v1.LiveIntent.decode(reader, reader.uint32(), $undefined, _depth + 1, message.intent);
                                message._intent = "intent";
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a LiveGuestResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.LiveGuestResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveGuestResponse & barc.browser.v1.LiveGuestResponse.$Shape} LiveGuestResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveGuestResponse.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a LiveGuestResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.LiveGuestResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.LiveGuestResponse} LiveGuestResponse
                 */
                LiveGuestResponse.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.LiveGuestResponse)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.LiveGuestResponse: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.LiveGuestResponse();
                    if (object.inputId != null)
                        if (object.inputId.length)
                            if (typeof object.inputId === "string")
                                $util.base64.decode(object.inputId, message.inputId = $util.newBuffer($util.base64.length(object.inputId)), 0);
                            else if (object.inputId.length >= 0)
                                message.inputId = object.inputId;
                    if (object.sessionId != null)
                        if (object.sessionId.length)
                            if (typeof object.sessionId === "string")
                                $util.base64.decode(object.sessionId, message.sessionId = $util.newBuffer($util.base64.length(object.sessionId)), 0);
                            else if (object.sessionId.length >= 0)
                                message.sessionId = object.sessionId;
                    if (object.moduleGeneration != null)
                        if (typeof object.moduleGeneration === "object" ? object.moduleGeneration.low || object.moduleGeneration.high : $Number(object.moduleGeneration) !== 0)
                            if ($util.Long)
                                message.moduleGeneration = $util.Long.fromValue(object.moduleGeneration, true);
                            else if (typeof object.moduleGeneration === "string")
                                message.moduleGeneration = $parseInt(object.moduleGeneration, 10);
                            else if (typeof object.moduleGeneration === "number")
                                message.moduleGeneration = object.moduleGeneration;
                            else if (typeof object.moduleGeneration === "object")
                                message.moduleGeneration = new $util.LongBits(object.moduleGeneration.low >>> 0, object.moduleGeneration.high >>> 0).toNumber(true);
                    if (object.basis != null) {
                        if (!$util.isObject(object.basis))
                            throw $TypeError(".barc.browser.v1.LiveGuestResponse.basis: object expected");
                        message.basis = $root.barc.browser.v1.ObservationBasis.fromObject(object.basis, _depth + 1);
                    }
                    if (object.acknowledgment !== 0 && (typeof object.acknowledgment !== "string" || $root.barc.browser.v1.GuestAckStatus[object.acknowledgment] !== 0))
                        switch (object.acknowledgment) {
                        case "GUEST_ACK_STATUS_UNSPECIFIED":
                        case 0:
                            message.acknowledgment = 0;
                            break;
                        case "GUEST_ACK_STATUS_CONSUMED":
                        case 1:
                            message.acknowledgment = 1;
                            break;
                        case "GUEST_ACK_STATUS_REFUSED":
                        case 2:
                            message.acknowledgment = 2;
                            break;
                        default:
                            if (typeof object.acknowledgment === "number" && (object.acknowledgment | 0) === object.acknowledgment)
                                message.acknowledgment = object.acknowledgment;
                        }
                    if (object.refusalDetail != null)
                        if (typeof object.refusalDetail !== "string" || object.refusalDetail.length)
                            message.refusalDetail = $String(object.refusalDetail);
                    if (object.intent != null) {
                        if (!$util.isObject(object.intent))
                            throw $TypeError(".barc.browser.v1.LiveGuestResponse.intent: object expected");
                        message.intent = $root.barc.browser.v1.LiveIntent.fromObject(object.intent, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a LiveGuestResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.LiveGuestResponse
                 * @static
                 * @param {barc.browser.v1.LiveGuestResponse} message LiveGuestResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                LiveGuestResponse.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        if (options.bytes === $String)
                            object.inputId = "";
                        else {
                            object.inputId = [];
                            if (options.bytes !== $Array)
                                object.inputId = $util.newBuffer(object.inputId);
                        }
                        if (options.bytes === $String)
                            object.sessionId = "";
                        else {
                            object.sessionId = [];
                            if (options.bytes !== $Array)
                                object.sessionId = $util.newBuffer(object.sessionId);
                        }
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.moduleGeneration = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.moduleGeneration = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        object.basis = null;
                        object.acknowledgment = options.enums === $String ? "GUEST_ACK_STATUS_UNSPECIFIED" : 0;
                        object.refusalDetail = "";
                    }
                    if (message.inputId != null && $Object.hasOwnProperty.call(message, "inputId"))
                        object.inputId = options.bytes === $String ? $util.base64.encode(message.inputId, 0, message.inputId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.inputId) : message.inputId;
                    if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                        object.sessionId = options.bytes === $String ? $util.base64.encode(message.sessionId, 0, message.sessionId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.sessionId) : message.sessionId;
                    if (message.moduleGeneration != null && $Object.hasOwnProperty.call(message, "moduleGeneration"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.moduleGeneration = typeof message.moduleGeneration === "number" ? $BigInt(message.moduleGeneration) : $util.Long.fromBits(message.moduleGeneration.low >>> 0, message.moduleGeneration.high >>> 0, true).toBigInt();
                        else if (typeof message.moduleGeneration === "number")
                            object.moduleGeneration = options.longs === $String ? $String(message.moduleGeneration) : message.moduleGeneration;
                        else
                            object.moduleGeneration = options.longs === $String ? $util.Long.prototype.toString.call(message.moduleGeneration) : options.longs === $Number ? new $util.LongBits(message.moduleGeneration.low >>> 0, message.moduleGeneration.high >>> 0).toNumber(true) : message.moduleGeneration;
                    if (message.basis != null && $Object.hasOwnProperty.call(message, "basis"))
                        object.basis = $root.barc.browser.v1.ObservationBasis.toObject(message.basis, options, _depth + 1);
                    if (message.acknowledgment != null && $Object.hasOwnProperty.call(message, "acknowledgment"))
                        object.acknowledgment = options.enums === $String ? $root.barc.browser.v1.GuestAckStatus[message.acknowledgment] === $undefined ? message.acknowledgment : $root.barc.browser.v1.GuestAckStatus[message.acknowledgment] : message.acknowledgment;
                    if (message.refusalDetail != null && $Object.hasOwnProperty.call(message, "refusalDetail"))
                        object.refusalDetail = message.refusalDetail;
                    if (message.intent != null && $Object.hasOwnProperty.call(message, "intent"))
                        object.intent = $root.barc.browser.v1.LiveIntent.toObject(message.intent, options, _depth + 1);
                    return object;
                };

                /**
                 * Converts this LiveGuestResponse to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.LiveGuestResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                LiveGuestResponse.prototype.toJSON = function() {
                    return LiveGuestResponse.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for LiveGuestResponse
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.LiveGuestResponse
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                LiveGuestResponse.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.LiveGuestResponse";
                };

                return LiveGuestResponse;
            })();

            v1.ArmController = (function() {

                /**
                 * Properties of an ArmController.
                 * @typedef {Object} barc.browser.v1.ArmController.$Properties
                 * @property {barc.browser.v1.ControllerIdentity.$Properties|null} [controller] ArmController controller
                 * @property {barc.browser.v1.LiveModuleIdentity.$Properties|null} [module] ArmController module
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of an ArmController.
                 * @memberof barc.browser.v1
                 * @interface IArmController
                 * @augments barc.browser.v1.ArmController.$Properties
                 * @deprecated Use barc.browser.v1.ArmController.$Properties instead.
                 */

                /**
                 * Shape of an ArmController.
                 * @typedef {barc.browser.v1.ArmController.$Properties} barc.browser.v1.ArmController.$Shape
                 */

                /**
                 * Constructs a new ArmController.
                 * @memberof barc.browser.v1
                 * @classdesc Represents an ArmController.
                 * @constructor
                 * @param {barc.browser.v1.ArmController.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const ArmController = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * ArmController controller.
                 * @member {barc.browser.v1.ControllerIdentity.$Properties|null|undefined} controller
                 * @memberof barc.browser.v1.ArmController
                 * @instance
                 */
                ArmController.prototype.controller = null;

                /**
                 * ArmController module.
                 * @member {barc.browser.v1.LiveModuleIdentity.$Properties|null|undefined} module
                 * @memberof barc.browser.v1.ArmController
                 * @instance
                 */
                ArmController.prototype.module = null;

                /**
                 * Encodes the specified ArmController message. Does not implicitly {@link barc.browser.v1.ArmController.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.ArmController
                 * @static
                 * @param {barc.browser.v1.ArmController.$Properties} message ArmController message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ArmController.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.controller != null && $Object.hasOwnProperty.call(message, "controller"))
                        $root.barc.browser.v1.ControllerIdentity.encode(message.controller, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.module != null && $Object.hasOwnProperty.call(message, "module"))
                        $root.barc.browser.v1.LiveModuleIdentity.encode(message.module, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ArmController message, length delimited. Does not implicitly {@link barc.browser.v1.ArmController.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.ArmController
                 * @static
                 * @param {barc.browser.v1.ArmController.$Properties} message ArmController message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ArmController.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes an ArmController message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.ArmController
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ArmController & barc.browser.v1.ArmController.$Shape} ArmController
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ArmController.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.ArmController();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                message.controller = $root.barc.browser.v1.ControllerIdentity.decode(reader, reader.uint32(), $undefined, _depth + 1, message.controller);
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                message.module = $root.barc.browser.v1.LiveModuleIdentity.decode(reader, reader.uint32(), $undefined, _depth + 1, message.module);
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes an ArmController message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.ArmController
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ArmController & barc.browser.v1.ArmController.$Shape} ArmController
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ArmController.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates an ArmController message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.ArmController
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.ArmController} ArmController
                 */
                ArmController.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.ArmController)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.ArmController: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.ArmController();
                    if (object.controller != null) {
                        if (!$util.isObject(object.controller))
                            throw $TypeError(".barc.browser.v1.ArmController.controller: object expected");
                        message.controller = $root.barc.browser.v1.ControllerIdentity.fromObject(object.controller, _depth + 1);
                    }
                    if (object.module != null) {
                        if (!$util.isObject(object.module))
                            throw $TypeError(".barc.browser.v1.ArmController.module: object expected");
                        message.module = $root.barc.browser.v1.LiveModuleIdentity.fromObject(object.module, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from an ArmController message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.ArmController
                 * @static
                 * @param {barc.browser.v1.ArmController} message ArmController
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ArmController.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.controller = null;
                        object.module = null;
                    }
                    if (message.controller != null && $Object.hasOwnProperty.call(message, "controller"))
                        object.controller = $root.barc.browser.v1.ControllerIdentity.toObject(message.controller, options, _depth + 1);
                    if (message.module != null && $Object.hasOwnProperty.call(message, "module"))
                        object.module = $root.barc.browser.v1.LiveModuleIdentity.toObject(message.module, options, _depth + 1);
                    return object;
                };

                /**
                 * Converts this ArmController to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.ArmController
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ArmController.prototype.toJSON = function() {
                    return ArmController.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for ArmController
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.ArmController
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                ArmController.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.ArmController";
                };

                return ArmController;
            })();

            v1.RevokeController = (function() {

                /**
                 * Properties of a RevokeController.
                 * @typedef {Object} barc.browser.v1.RevokeController.$Properties
                 * @property {barc.browser.v1.ControllerIdentity.$Properties|null} [controller] RevokeController controller
                 * @property {string|null} [reason] RevokeController reason
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a RevokeController.
                 * @memberof barc.browser.v1
                 * @interface IRevokeController
                 * @augments barc.browser.v1.RevokeController.$Properties
                 * @deprecated Use barc.browser.v1.RevokeController.$Properties instead.
                 */

                /**
                 * Shape of a RevokeController.
                 * @typedef {barc.browser.v1.RevokeController.$Properties} barc.browser.v1.RevokeController.$Shape
                 */

                /**
                 * Constructs a new RevokeController.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a RevokeController.
                 * @constructor
                 * @param {barc.browser.v1.RevokeController.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const RevokeController = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * RevokeController controller.
                 * @member {barc.browser.v1.ControllerIdentity.$Properties|null|undefined} controller
                 * @memberof barc.browser.v1.RevokeController
                 * @instance
                 */
                RevokeController.prototype.controller = null;

                /**
                 * RevokeController reason.
                 * @member {string} reason
                 * @memberof barc.browser.v1.RevokeController
                 * @instance
                 */
                RevokeController.prototype.reason = "";

                /**
                 * Encodes the specified RevokeController message. Does not implicitly {@link barc.browser.v1.RevokeController.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.RevokeController
                 * @static
                 * @param {barc.browser.v1.RevokeController.$Properties} message RevokeController message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                RevokeController.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.controller != null && $Object.hasOwnProperty.call(message, "controller"))
                        $root.barc.browser.v1.ControllerIdentity.encode(message.controller, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.reason != null && $Object.hasOwnProperty.call(message, "reason") && message.reason !== "")
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.reason);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified RevokeController message, length delimited. Does not implicitly {@link barc.browser.v1.RevokeController.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.RevokeController
                 * @static
                 * @param {barc.browser.v1.RevokeController.$Properties} message RevokeController message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                RevokeController.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a RevokeController message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.RevokeController
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.RevokeController & barc.browser.v1.RevokeController.$Shape} RevokeController
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                RevokeController.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.RevokeController();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                message.controller = $root.barc.browser.v1.ControllerIdentity.decode(reader, reader.uint32(), $undefined, _depth + 1, message.controller);
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.reason = value;
                                else
                                    delete message.reason;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a RevokeController message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.RevokeController
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.RevokeController & barc.browser.v1.RevokeController.$Shape} RevokeController
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                RevokeController.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a RevokeController message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.RevokeController
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.RevokeController} RevokeController
                 */
                RevokeController.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.RevokeController)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.RevokeController: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.RevokeController();
                    if (object.controller != null) {
                        if (!$util.isObject(object.controller))
                            throw $TypeError(".barc.browser.v1.RevokeController.controller: object expected");
                        message.controller = $root.barc.browser.v1.ControllerIdentity.fromObject(object.controller, _depth + 1);
                    }
                    if (object.reason != null)
                        if (typeof object.reason !== "string" || object.reason.length)
                            message.reason = $String(object.reason);
                    return message;
                };

                /**
                 * Creates a plain object from a RevokeController message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.RevokeController
                 * @static
                 * @param {barc.browser.v1.RevokeController} message RevokeController
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                RevokeController.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.controller = null;
                        object.reason = "";
                    }
                    if (message.controller != null && $Object.hasOwnProperty.call(message, "controller"))
                        object.controller = $root.barc.browser.v1.ControllerIdentity.toObject(message.controller, options, _depth + 1);
                    if (message.reason != null && $Object.hasOwnProperty.call(message, "reason"))
                        object.reason = message.reason;
                    return object;
                };

                /**
                 * Converts this RevokeController to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.RevokeController
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                RevokeController.prototype.toJSON = function() {
                    return RevokeController.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for RevokeController
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.RevokeController
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                RevokeController.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.RevokeController";
                };

                return RevokeController;
            })();

            v1.SubmitLiveIntent = (function() {

                /**
                 * Properties of a SubmitLiveIntent.
                 * @typedef {Object} barc.browser.v1.SubmitLiveIntent.$Properties
                 * @property {Uint8Array|null} [parentId] SubmitLiveIntent parentId
                 * @property {Uint8Array|null} [inputId] SubmitLiveIntent inputId
                 * @property {barc.browser.v1.ControllerIdentity.$Properties|null} [controller] SubmitLiveIntent controller
                 * @property {barc.browser.v1.LiveModuleIdentity.$Properties|null} [module] SubmitLiveIntent module
                 * @property {barc.browser.v1.ObservationBasis.$Properties|null} [basis] SubmitLiveIntent basis
                 * @property {barc.browser.v1.LiveIntent.$Properties|null} [intent] SubmitLiveIntent intent
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a SubmitLiveIntent.
                 * @memberof barc.browser.v1
                 * @interface ISubmitLiveIntent
                 * @augments barc.browser.v1.SubmitLiveIntent.$Properties
                 * @deprecated Use barc.browser.v1.SubmitLiveIntent.$Properties instead.
                 */

                /**
                 * Shape of a SubmitLiveIntent.
                 * @typedef {{
                 *   parentId?: Uint8Array|null;
                 *   inputId?: Uint8Array|null;
                 *   controller?: barc.browser.v1.ControllerIdentity.$Shape|null;
                 *   module?: barc.browser.v1.LiveModuleIdentity.$Shape|null;
                 *   basis?: barc.browser.v1.ObservationBasis.$Shape|null;
                 *   intent?: barc.browser.v1.LiveIntent.$Shape|null;
                 *   $unknowns?: Array.<Uint8Array>;
                 * }} barc.browser.v1.SubmitLiveIntent.$Shape
                 */

                /**
                 * Constructs a new SubmitLiveIntent.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a SubmitLiveIntent.
                 * @constructor
                 * @param {barc.browser.v1.SubmitLiveIntent.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const SubmitLiveIntent = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * SubmitLiveIntent parentId.
                 * @member {Uint8Array} parentId
                 * @memberof barc.browser.v1.SubmitLiveIntent
                 * @instance
                 */
                SubmitLiveIntent.prototype.parentId = $util.newBuffer([]);

                /**
                 * SubmitLiveIntent inputId.
                 * @member {Uint8Array} inputId
                 * @memberof barc.browser.v1.SubmitLiveIntent
                 * @instance
                 */
                SubmitLiveIntent.prototype.inputId = $util.newBuffer([]);

                /**
                 * SubmitLiveIntent controller.
                 * @member {barc.browser.v1.ControllerIdentity.$Properties|null|undefined} controller
                 * @memberof barc.browser.v1.SubmitLiveIntent
                 * @instance
                 */
                SubmitLiveIntent.prototype.controller = null;

                /**
                 * SubmitLiveIntent module.
                 * @member {barc.browser.v1.LiveModuleIdentity.$Properties|null|undefined} module
                 * @memberof barc.browser.v1.SubmitLiveIntent
                 * @instance
                 */
                SubmitLiveIntent.prototype.module = null;

                /**
                 * SubmitLiveIntent basis.
                 * @member {barc.browser.v1.ObservationBasis.$Properties|null|undefined} basis
                 * @memberof barc.browser.v1.SubmitLiveIntent
                 * @instance
                 */
                SubmitLiveIntent.prototype.basis = null;

                /**
                 * SubmitLiveIntent intent.
                 * @member {barc.browser.v1.LiveIntent.$Properties|null|undefined} intent
                 * @memberof barc.browser.v1.SubmitLiveIntent
                 * @instance
                 */
                SubmitLiveIntent.prototype.intent = null;

                /**
                 * Encodes the specified SubmitLiveIntent message. Does not implicitly {@link barc.browser.v1.SubmitLiveIntent.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.SubmitLiveIntent
                 * @static
                 * @param {barc.browser.v1.SubmitLiveIntent.$Properties} message SubmitLiveIntent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SubmitLiveIntent.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.parentId != null && $Object.hasOwnProperty.call(message, "parentId") && message.parentId.length)
                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.parentId);
                    if (message.inputId != null && $Object.hasOwnProperty.call(message, "inputId") && message.inputId.length)
                        writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.inputId);
                    if (message.controller != null && $Object.hasOwnProperty.call(message, "controller"))
                        $root.barc.browser.v1.ControllerIdentity.encode(message.controller, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                    if (message.module != null && $Object.hasOwnProperty.call(message, "module"))
                        $root.barc.browser.v1.LiveModuleIdentity.encode(message.module, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
                    if (message.basis != null && $Object.hasOwnProperty.call(message, "basis"))
                        $root.barc.browser.v1.ObservationBasis.encode(message.basis, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
                    if (message.intent != null && $Object.hasOwnProperty.call(message, "intent"))
                        $root.barc.browser.v1.LiveIntent.encode(message.intent, writer.uint32(/* id 6, wireType 2 =*/50).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified SubmitLiveIntent message, length delimited. Does not implicitly {@link barc.browser.v1.SubmitLiveIntent.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.SubmitLiveIntent
                 * @static
                 * @param {barc.browser.v1.SubmitLiveIntent.$Properties} message SubmitLiveIntent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SubmitLiveIntent.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a SubmitLiveIntent message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.SubmitLiveIntent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.SubmitLiveIntent & barc.browser.v1.SubmitLiveIntent.$Shape} SubmitLiveIntent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SubmitLiveIntent.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.SubmitLiveIntent();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.parentId = value;
                                else
                                    delete message.parentId;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.bytes()).length)
                                    message.inputId = value;
                                else
                                    delete message.inputId;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                message.controller = $root.barc.browser.v1.ControllerIdentity.decode(reader, reader.uint32(), $undefined, _depth + 1, message.controller);
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                message.module = $root.barc.browser.v1.LiveModuleIdentity.decode(reader, reader.uint32(), $undefined, _depth + 1, message.module);
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                message.basis = $root.barc.browser.v1.ObservationBasis.decode(reader, reader.uint32(), $undefined, _depth + 1, message.basis);
                                continue;
                            }
                        case 6: {
                                if (wireType !== 2)
                                    break;
                                message.intent = $root.barc.browser.v1.LiveIntent.decode(reader, reader.uint32(), $undefined, _depth + 1, message.intent);
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a SubmitLiveIntent message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.SubmitLiveIntent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.SubmitLiveIntent & barc.browser.v1.SubmitLiveIntent.$Shape} SubmitLiveIntent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SubmitLiveIntent.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a SubmitLiveIntent message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.SubmitLiveIntent
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.SubmitLiveIntent} SubmitLiveIntent
                 */
                SubmitLiveIntent.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.SubmitLiveIntent)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.SubmitLiveIntent: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.SubmitLiveIntent();
                    if (object.parentId != null)
                        if (object.parentId.length)
                            if (typeof object.parentId === "string")
                                $util.base64.decode(object.parentId, message.parentId = $util.newBuffer($util.base64.length(object.parentId)), 0);
                            else if (object.parentId.length >= 0)
                                message.parentId = object.parentId;
                    if (object.inputId != null)
                        if (object.inputId.length)
                            if (typeof object.inputId === "string")
                                $util.base64.decode(object.inputId, message.inputId = $util.newBuffer($util.base64.length(object.inputId)), 0);
                            else if (object.inputId.length >= 0)
                                message.inputId = object.inputId;
                    if (object.controller != null) {
                        if (!$util.isObject(object.controller))
                            throw $TypeError(".barc.browser.v1.SubmitLiveIntent.controller: object expected");
                        message.controller = $root.barc.browser.v1.ControllerIdentity.fromObject(object.controller, _depth + 1);
                    }
                    if (object.module != null) {
                        if (!$util.isObject(object.module))
                            throw $TypeError(".barc.browser.v1.SubmitLiveIntent.module: object expected");
                        message.module = $root.barc.browser.v1.LiveModuleIdentity.fromObject(object.module, _depth + 1);
                    }
                    if (object.basis != null) {
                        if (!$util.isObject(object.basis))
                            throw $TypeError(".barc.browser.v1.SubmitLiveIntent.basis: object expected");
                        message.basis = $root.barc.browser.v1.ObservationBasis.fromObject(object.basis, _depth + 1);
                    }
                    if (object.intent != null) {
                        if (!$util.isObject(object.intent))
                            throw $TypeError(".barc.browser.v1.SubmitLiveIntent.intent: object expected");
                        message.intent = $root.barc.browser.v1.LiveIntent.fromObject(object.intent, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a SubmitLiveIntent message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.SubmitLiveIntent
                 * @static
                 * @param {barc.browser.v1.SubmitLiveIntent} message SubmitLiveIntent
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                SubmitLiveIntent.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        if (options.bytes === $String)
                            object.parentId = "";
                        else {
                            object.parentId = [];
                            if (options.bytes !== $Array)
                                object.parentId = $util.newBuffer(object.parentId);
                        }
                        if (options.bytes === $String)
                            object.inputId = "";
                        else {
                            object.inputId = [];
                            if (options.bytes !== $Array)
                                object.inputId = $util.newBuffer(object.inputId);
                        }
                        object.controller = null;
                        object.module = null;
                        object.basis = null;
                        object.intent = null;
                    }
                    if (message.parentId != null && $Object.hasOwnProperty.call(message, "parentId"))
                        object.parentId = options.bytes === $String ? $util.base64.encode(message.parentId, 0, message.parentId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.parentId) : message.parentId;
                    if (message.inputId != null && $Object.hasOwnProperty.call(message, "inputId"))
                        object.inputId = options.bytes === $String ? $util.base64.encode(message.inputId, 0, message.inputId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.inputId) : message.inputId;
                    if (message.controller != null && $Object.hasOwnProperty.call(message, "controller"))
                        object.controller = $root.barc.browser.v1.ControllerIdentity.toObject(message.controller, options, _depth + 1);
                    if (message.module != null && $Object.hasOwnProperty.call(message, "module"))
                        object.module = $root.barc.browser.v1.LiveModuleIdentity.toObject(message.module, options, _depth + 1);
                    if (message.basis != null && $Object.hasOwnProperty.call(message, "basis"))
                        object.basis = $root.barc.browser.v1.ObservationBasis.toObject(message.basis, options, _depth + 1);
                    if (message.intent != null && $Object.hasOwnProperty.call(message, "intent"))
                        object.intent = $root.barc.browser.v1.LiveIntent.toObject(message.intent, options, _depth + 1);
                    return object;
                };

                /**
                 * Converts this SubmitLiveIntent to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.SubmitLiveIntent
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                SubmitLiveIntent.prototype.toJSON = function() {
                    return SubmitLiveIntent.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for SubmitLiveIntent
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.SubmitLiveIntent
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                SubmitLiveIntent.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.SubmitLiveIntent";
                };

                return SubmitLiveIntent;
            })();

            v1.ControllerState = (function() {

                /**
                 * Properties of a ControllerState.
                 * @typedef {Object} barc.browser.v1.ControllerState.$Properties
                 * @property {Long|null} [stateSequence] ControllerState stateSequence
                 * @property {barc.browser.v1.ControllerIdentity.$Properties|null} [controller] ControllerState controller
                 * @property {barc.browser.v1.LiveModuleIdentity.$Properties|null} [module] ControllerState module
                 * @property {barc.browser.v1.ControllerStage|null} [stage] ControllerState stage
                 * @property {string|null} [reason] ControllerState reason
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a ControllerState.
                 * @memberof barc.browser.v1
                 * @interface IControllerState
                 * @augments barc.browser.v1.ControllerState.$Properties
                 * @deprecated Use barc.browser.v1.ControllerState.$Properties instead.
                 */

                /**
                 * Shape of a ControllerState.
                 * @typedef {barc.browser.v1.ControllerState.$Properties} barc.browser.v1.ControllerState.$Shape
                 */

                /**
                 * Constructs a new ControllerState.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a ControllerState.
                 * @constructor
                 * @param {barc.browser.v1.ControllerState.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const ControllerState = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * ControllerState stateSequence.
                 * @member {Long} stateSequence
                 * @memberof barc.browser.v1.ControllerState
                 * @instance
                 */
                ControllerState.prototype.stateSequence = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * ControllerState controller.
                 * @member {barc.browser.v1.ControllerIdentity.$Properties|null|undefined} controller
                 * @memberof barc.browser.v1.ControllerState
                 * @instance
                 */
                ControllerState.prototype.controller = null;

                /**
                 * ControllerState module.
                 * @member {barc.browser.v1.LiveModuleIdentity.$Properties|null|undefined} module
                 * @memberof barc.browser.v1.ControllerState
                 * @instance
                 */
                ControllerState.prototype.module = null;

                /**
                 * ControllerState stage.
                 * @member {barc.browser.v1.ControllerStage} stage
                 * @memberof barc.browser.v1.ControllerState
                 * @instance
                 */
                ControllerState.prototype.stage = 0;

                /**
                 * ControllerState reason.
                 * @member {string} reason
                 * @memberof barc.browser.v1.ControllerState
                 * @instance
                 */
                ControllerState.prototype.reason = "";

                /**
                 * Encodes the specified ControllerState message. Does not implicitly {@link barc.browser.v1.ControllerState.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.ControllerState
                 * @static
                 * @param {barc.browser.v1.ControllerState.$Properties} message ControllerState message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ControllerState.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.stateSequence != null && $Object.hasOwnProperty.call(message, "stateSequence") && (typeof message.stateSequence === "object" ? message.stateSequence.low || message.stateSequence.high : message.stateSequence !== 0))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.stateSequence);
                    if (message.controller != null && $Object.hasOwnProperty.call(message, "controller"))
                        $root.barc.browser.v1.ControllerIdentity.encode(message.controller, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                    if (message.module != null && $Object.hasOwnProperty.call(message, "module"))
                        $root.barc.browser.v1.LiveModuleIdentity.encode(message.module, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                    if (message.stage != null && $Object.hasOwnProperty.call(message, "stage") && message.stage !== 0)
                        writer.uint32(/* id 4, wireType 0 =*/32).int32(message.stage);
                    if (message.reason != null && $Object.hasOwnProperty.call(message, "reason") && message.reason !== "")
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.reason);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ControllerState message, length delimited. Does not implicitly {@link barc.browser.v1.ControllerState.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.ControllerState
                 * @static
                 * @param {barc.browser.v1.ControllerState.$Properties} message ControllerState message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ControllerState.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a ControllerState message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.ControllerState
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ControllerState & barc.browser.v1.ControllerState.$Shape} ControllerState
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ControllerState.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message, value;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.ControllerState();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                    message.stateSequence = value;
                                else
                                    delete message.stateSequence;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                message.controller = $root.barc.browser.v1.ControllerIdentity.decode(reader, reader.uint32(), $undefined, _depth + 1, message.controller);
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                message.module = $root.barc.browser.v1.LiveModuleIdentity.decode(reader, reader.uint32(), $undefined, _depth + 1, message.module);
                                continue;
                            }
                        case 4: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.int32())
                                    message.stage = value;
                                else
                                    delete message.stage;
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                if ((value = reader.stringVerify()).length)
                                    message.reason = value;
                                else
                                    delete message.reason;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a ControllerState message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.ControllerState
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ControllerState & barc.browser.v1.ControllerState.$Shape} ControllerState
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ControllerState.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a ControllerState message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.ControllerState
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.ControllerState} ControllerState
                 */
                ControllerState.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.ControllerState)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.ControllerState: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.ControllerState();
                    if (object.stateSequence != null)
                        if (typeof object.stateSequence === "object" ? object.stateSequence.low || object.stateSequence.high : $Number(object.stateSequence) !== 0)
                            if ($util.Long)
                                message.stateSequence = $util.Long.fromValue(object.stateSequence, true);
                            else if (typeof object.stateSequence === "string")
                                message.stateSequence = $parseInt(object.stateSequence, 10);
                            else if (typeof object.stateSequence === "number")
                                message.stateSequence = object.stateSequence;
                            else if (typeof object.stateSequence === "object")
                                message.stateSequence = new $util.LongBits(object.stateSequence.low >>> 0, object.stateSequence.high >>> 0).toNumber(true);
                    if (object.controller != null) {
                        if (!$util.isObject(object.controller))
                            throw $TypeError(".barc.browser.v1.ControllerState.controller: object expected");
                        message.controller = $root.barc.browser.v1.ControllerIdentity.fromObject(object.controller, _depth + 1);
                    }
                    if (object.module != null) {
                        if (!$util.isObject(object.module))
                            throw $TypeError(".barc.browser.v1.ControllerState.module: object expected");
                        message.module = $root.barc.browser.v1.LiveModuleIdentity.fromObject(object.module, _depth + 1);
                    }
                    if (object.stage !== 0 && (typeof object.stage !== "string" || $root.barc.browser.v1.ControllerStage[object.stage] !== 0))
                        switch (object.stage) {
                        case "CONTROLLER_STAGE_UNSPECIFIED":
                        case 0:
                            message.stage = 0;
                            break;
                        case "CONTROLLER_STAGE_ARM_REQUESTED":
                        case 1:
                            message.stage = 1;
                            break;
                        case "CONTROLLER_STAGE_ARM_NATIVE_CONFIRMED":
                        case 2:
                            message.stage = 2;
                            break;
                        case "CONTROLLER_STAGE_REVOKE_REQUESTED":
                        case 3:
                            message.stage = 3;
                            break;
                        case "CONTROLLER_STAGE_REVOKE_NATIVE_CONFIRMED":
                        case 4:
                            message.stage = 4;
                            break;
                        case "CONTROLLER_STAGE_EXPIRED":
                        case 5:
                            message.stage = 5;
                            break;
                        case "CONTROLLER_STAGE_REFUSED":
                        case 6:
                            message.stage = 6;
                            break;
                        case "CONTROLLER_STAGE_UNAVAILABLE":
                        case 7:
                            message.stage = 7;
                            break;
                        default:
                            if (typeof object.stage === "number" && (object.stage | 0) === object.stage)
                                message.stage = object.stage;
                        }
                    if (object.reason != null)
                        if (typeof object.reason !== "string" || object.reason.length)
                            message.reason = $String(object.reason);
                    return message;
                };

                /**
                 * Creates a plain object from a ControllerState message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.ControllerState
                 * @static
                 * @param {barc.browser.v1.ControllerState} message ControllerState
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ControllerState.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.stateSequence = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.stateSequence = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                        object.controller = null;
                        object.module = null;
                        object.stage = options.enums === $String ? "CONTROLLER_STAGE_UNSPECIFIED" : 0;
                        object.reason = "";
                    }
                    if (message.stateSequence != null && $Object.hasOwnProperty.call(message, "stateSequence"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.stateSequence = typeof message.stateSequence === "number" ? $BigInt(message.stateSequence) : $util.Long.fromBits(message.stateSequence.low >>> 0, message.stateSequence.high >>> 0, true).toBigInt();
                        else if (typeof message.stateSequence === "number")
                            object.stateSequence = options.longs === $String ? $String(message.stateSequence) : message.stateSequence;
                        else
                            object.stateSequence = options.longs === $String ? $util.Long.prototype.toString.call(message.stateSequence) : options.longs === $Number ? new $util.LongBits(message.stateSequence.low >>> 0, message.stateSequence.high >>> 0).toNumber(true) : message.stateSequence;
                    if (message.controller != null && $Object.hasOwnProperty.call(message, "controller"))
                        object.controller = $root.barc.browser.v1.ControllerIdentity.toObject(message.controller, options, _depth + 1);
                    if (message.module != null && $Object.hasOwnProperty.call(message, "module"))
                        object.module = $root.barc.browser.v1.LiveModuleIdentity.toObject(message.module, options, _depth + 1);
                    if (message.stage != null && $Object.hasOwnProperty.call(message, "stage"))
                        object.stage = options.enums === $String ? $root.barc.browser.v1.ControllerStage[message.stage] === $undefined ? message.stage : $root.barc.browser.v1.ControllerStage[message.stage] : message.stage;
                    if (message.reason != null && $Object.hasOwnProperty.call(message, "reason"))
                        object.reason = message.reason;
                    return object;
                };

                /**
                 * Converts this ControllerState to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.ControllerState
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ControllerState.prototype.toJSON = function() {
                    return ControllerState.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for ControllerState
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.ControllerState
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                ControllerState.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.ControllerState";
                };

                return ControllerState;
            })();

            v1.LiveClientEnvelope = (function() {

                /**
                 * Properties of a LiveClientEnvelope.
                 * @typedef {Object} barc.browser.v1.LiveClientEnvelope.$Properties
                 * @property {barc.browser.v1.ClientAuth.$Properties|null} [authenticate] LiveClientEnvelope authenticate
                 * @property {barc.browser.v1.ArmController.$Properties|null} [arm] LiveClientEnvelope arm
                 * @property {barc.browser.v1.RevokeController.$Properties|null} [revoke] LiveClientEnvelope revoke
                 * @property {barc.browser.v1.SubmitLiveIntent.$Properties|null} [submit] LiveClientEnvelope submit
                 * @property {"authenticate"|"arm"|"revoke"|"submit"} [body] LiveClientEnvelope body
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a LiveClientEnvelope.
                 * @memberof barc.browser.v1
                 * @interface ILiveClientEnvelope
                 * @augments barc.browser.v1.LiveClientEnvelope.$Properties
                 * @deprecated Use barc.browser.v1.LiveClientEnvelope.$Properties instead.
                 */

                /**
                 * Narrowed shape of a LiveClientEnvelope.
                 * @typedef {{
                 *   authenticate?: barc.browser.v1.ClientAuth.$Shape|null;
                 *   arm?: barc.browser.v1.ArmController.$Shape|null;
                 *   revoke?: barc.browser.v1.RevokeController.$Shape|null;
                 *   submit?: barc.browser.v1.SubmitLiveIntent.$Shape|null;
                 *   $unknowns?: Array.<Uint8Array>;
                 * } & (
                 *   ({ body?: undefined; authenticate?: null; arm?: null; revoke?: null; submit?: null }|{ body?: "authenticate"; authenticate: barc.browser.v1.ClientAuth.$Shape; arm?: null; revoke?: null; submit?: null }|{ body?: "arm"; authenticate?: null; arm: barc.browser.v1.ArmController.$Shape; revoke?: null; submit?: null }|{ body?: "revoke"; authenticate?: null; arm?: null; revoke: barc.browser.v1.RevokeController.$Shape; submit?: null }|{ body?: "submit"; authenticate?: null; arm?: null; revoke?: null; submit: barc.browser.v1.SubmitLiveIntent.$Shape })
                 * )} barc.browser.v1.LiveClientEnvelope.$Shape
                 */

                /**
                 * Constructs a new LiveClientEnvelope.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a LiveClientEnvelope.
                 * @constructor
                 * @param {barc.browser.v1.LiveClientEnvelope.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const LiveClientEnvelope = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * LiveClientEnvelope authenticate.
                 * @member {barc.browser.v1.ClientAuth.$Properties|null|undefined} authenticate
                 * @memberof barc.browser.v1.LiveClientEnvelope
                 * @instance
                 */
                LiveClientEnvelope.prototype.authenticate = null;

                /**
                 * LiveClientEnvelope arm.
                 * @member {barc.browser.v1.ArmController.$Properties|null|undefined} arm
                 * @memberof barc.browser.v1.LiveClientEnvelope
                 * @instance
                 */
                LiveClientEnvelope.prototype.arm = null;

                /**
                 * LiveClientEnvelope revoke.
                 * @member {barc.browser.v1.RevokeController.$Properties|null|undefined} revoke
                 * @memberof barc.browser.v1.LiveClientEnvelope
                 * @instance
                 */
                LiveClientEnvelope.prototype.revoke = null;

                /**
                 * LiveClientEnvelope submit.
                 * @member {barc.browser.v1.SubmitLiveIntent.$Properties|null|undefined} submit
                 * @memberof barc.browser.v1.LiveClientEnvelope
                 * @instance
                 */
                LiveClientEnvelope.prototype.submit = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * LiveClientEnvelope body.
                 * @member {"authenticate"|"arm"|"revoke"|"submit"|undefined} body
                 * @memberof barc.browser.v1.LiveClientEnvelope
                 * @instance
                 */
                $Object.defineProperty(LiveClientEnvelope.prototype, "body", {
                    get: $util.oneOfGetter($oneOfFields = ["authenticate", "arm", "revoke", "submit"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified LiveClientEnvelope message. Does not implicitly {@link barc.browser.v1.LiveClientEnvelope.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.LiveClientEnvelope
                 * @static
                 * @param {barc.browser.v1.LiveClientEnvelope.$Properties} message LiveClientEnvelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveClientEnvelope.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.authenticate != null && $Object.hasOwnProperty.call(message, "authenticate"))
                        $root.barc.browser.v1.ClientAuth.encode(message.authenticate, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.arm != null && $Object.hasOwnProperty.call(message, "arm"))
                        $root.barc.browser.v1.ArmController.encode(message.arm, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                    if (message.revoke != null && $Object.hasOwnProperty.call(message, "revoke"))
                        $root.barc.browser.v1.RevokeController.encode(message.revoke, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                    if (message.submit != null && $Object.hasOwnProperty.call(message, "submit"))
                        $root.barc.browser.v1.SubmitLiveIntent.encode(message.submit, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified LiveClientEnvelope message, length delimited. Does not implicitly {@link barc.browser.v1.LiveClientEnvelope.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.LiveClientEnvelope
                 * @static
                 * @param {barc.browser.v1.LiveClientEnvelope.$Properties} message LiveClientEnvelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveClientEnvelope.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a LiveClientEnvelope message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.LiveClientEnvelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveClientEnvelope & barc.browser.v1.LiveClientEnvelope.$Shape} LiveClientEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveClientEnvelope.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.LiveClientEnvelope();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                message.authenticate = $root.barc.browser.v1.ClientAuth.decode(reader, reader.uint32(), $undefined, _depth + 1, message.authenticate);
                                message.body = "authenticate";
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                message.arm = $root.barc.browser.v1.ArmController.decode(reader, reader.uint32(), $undefined, _depth + 1, message.arm);
                                message.body = "arm";
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                message.revoke = $root.barc.browser.v1.RevokeController.decode(reader, reader.uint32(), $undefined, _depth + 1, message.revoke);
                                message.body = "revoke";
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                message.submit = $root.barc.browser.v1.SubmitLiveIntent.decode(reader, reader.uint32(), $undefined, _depth + 1, message.submit);
                                message.body = "submit";
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a LiveClientEnvelope message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.LiveClientEnvelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveClientEnvelope & barc.browser.v1.LiveClientEnvelope.$Shape} LiveClientEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveClientEnvelope.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a LiveClientEnvelope message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.LiveClientEnvelope
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.LiveClientEnvelope} LiveClientEnvelope
                 */
                LiveClientEnvelope.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.LiveClientEnvelope)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.LiveClientEnvelope: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.LiveClientEnvelope();
                    if (object.authenticate != null) {
                        if (!$util.isObject(object.authenticate))
                            throw $TypeError(".barc.browser.v1.LiveClientEnvelope.authenticate: object expected");
                        message.authenticate = $root.barc.browser.v1.ClientAuth.fromObject(object.authenticate, _depth + 1);
                    }
                    if (object.arm != null) {
                        if (!$util.isObject(object.arm))
                            throw $TypeError(".barc.browser.v1.LiveClientEnvelope.arm: object expected");
                        message.arm = $root.barc.browser.v1.ArmController.fromObject(object.arm, _depth + 1);
                    }
                    if (object.revoke != null) {
                        if (!$util.isObject(object.revoke))
                            throw $TypeError(".barc.browser.v1.LiveClientEnvelope.revoke: object expected");
                        message.revoke = $root.barc.browser.v1.RevokeController.fromObject(object.revoke, _depth + 1);
                    }
                    if (object.submit != null) {
                        if (!$util.isObject(object.submit))
                            throw $TypeError(".barc.browser.v1.LiveClientEnvelope.submit: object expected");
                        message.submit = $root.barc.browser.v1.SubmitLiveIntent.fromObject(object.submit, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a LiveClientEnvelope message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.LiveClientEnvelope
                 * @static
                 * @param {barc.browser.v1.LiveClientEnvelope} message LiveClientEnvelope
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                LiveClientEnvelope.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (message.authenticate != null && $Object.hasOwnProperty.call(message, "authenticate")) {
                        object.authenticate = $root.barc.browser.v1.ClientAuth.toObject(message.authenticate, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "authenticate";
                    }
                    if (message.arm != null && $Object.hasOwnProperty.call(message, "arm")) {
                        object.arm = $root.barc.browser.v1.ArmController.toObject(message.arm, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "arm";
                    }
                    if (message.revoke != null && $Object.hasOwnProperty.call(message, "revoke")) {
                        object.revoke = $root.barc.browser.v1.RevokeController.toObject(message.revoke, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "revoke";
                    }
                    if (message.submit != null && $Object.hasOwnProperty.call(message, "submit")) {
                        object.submit = $root.barc.browser.v1.SubmitLiveIntent.toObject(message.submit, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "submit";
                    }
                    return object;
                };

                /**
                 * Converts this LiveClientEnvelope to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.LiveClientEnvelope
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                LiveClientEnvelope.prototype.toJSON = function() {
                    return LiveClientEnvelope.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for LiveClientEnvelope
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.LiveClientEnvelope
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                LiveClientEnvelope.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.LiveClientEnvelope";
                };

                return LiveClientEnvelope;
            })();

            v1.LiveServerEnvelope = (function() {

                /**
                 * Properties of a LiveServerEnvelope.
                 * @typedef {Object} barc.browser.v1.LiveServerEnvelope.$Properties
                 * @property {barc.browser.v1.LiveBootstrap.$Properties|null} [bootstrap] LiveServerEnvelope bootstrap
                 * @property {barc.browser.v1.LiveObservation.$Properties|null} [observation] LiveServerEnvelope observation
                 * @property {barc.browser.v1.ControllerState.$Properties|null} [controllerState] LiveServerEnvelope controllerState
                 * @property {barc.browser.v1.LiveResult.$Properties|null} [result] LiveServerEnvelope result
                 * @property {barc.browser.v1.LiveGuestRequest.$Properties|null} [guestInput] LiveServerEnvelope guestInput
                 * @property {"bootstrap"|"observation"|"controllerState"|"result"|"guestInput"} [body] LiveServerEnvelope body
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a LiveServerEnvelope.
                 * @memberof barc.browser.v1
                 * @interface ILiveServerEnvelope
                 * @augments barc.browser.v1.LiveServerEnvelope.$Properties
                 * @deprecated Use barc.browser.v1.LiveServerEnvelope.$Properties instead.
                 */

                /**
                 * Narrowed shape of a LiveServerEnvelope.
                 * @typedef {{
                 *   bootstrap?: barc.browser.v1.LiveBootstrap.$Shape|null;
                 *   observation?: barc.browser.v1.LiveObservation.$Shape|null;
                 *   controllerState?: barc.browser.v1.ControllerState.$Shape|null;
                 *   result?: barc.browser.v1.LiveResult.$Shape|null;
                 *   guestInput?: barc.browser.v1.LiveGuestRequest.$Shape|null;
                 *   $unknowns?: Array.<Uint8Array>;
                 * } & (
                 *   ({ body?: undefined; bootstrap?: null; observation?: null; controllerState?: null; result?: null; guestInput?: null }|{ body?: "bootstrap"; bootstrap: barc.browser.v1.LiveBootstrap.$Shape; observation?: null; controllerState?: null; result?: null; guestInput?: null }|{ body?: "observation"; bootstrap?: null; observation: barc.browser.v1.LiveObservation.$Shape; controllerState?: null; result?: null; guestInput?: null }|{ body?: "controllerState"; bootstrap?: null; observation?: null; controllerState: barc.browser.v1.ControllerState.$Shape; result?: null; guestInput?: null }|{ body?: "result"; bootstrap?: null; observation?: null; controllerState?: null; result: barc.browser.v1.LiveResult.$Shape; guestInput?: null }|{ body?: "guestInput"; bootstrap?: null; observation?: null; controllerState?: null; result?: null; guestInput: barc.browser.v1.LiveGuestRequest.$Shape })
                 * )} barc.browser.v1.LiveServerEnvelope.$Shape
                 */

                /**
                 * Constructs a new LiveServerEnvelope.
                 * @memberof barc.browser.v1
                 * @classdesc Represents a LiveServerEnvelope.
                 * @constructor
                 * @param {barc.browser.v1.LiveServerEnvelope.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const LiveServerEnvelope = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * LiveServerEnvelope bootstrap.
                 * @member {barc.browser.v1.LiveBootstrap.$Properties|null|undefined} bootstrap
                 * @memberof barc.browser.v1.LiveServerEnvelope
                 * @instance
                 */
                LiveServerEnvelope.prototype.bootstrap = null;

                /**
                 * LiveServerEnvelope observation.
                 * @member {barc.browser.v1.LiveObservation.$Properties|null|undefined} observation
                 * @memberof barc.browser.v1.LiveServerEnvelope
                 * @instance
                 */
                LiveServerEnvelope.prototype.observation = null;

                /**
                 * LiveServerEnvelope controllerState.
                 * @member {barc.browser.v1.ControllerState.$Properties|null|undefined} controllerState
                 * @memberof barc.browser.v1.LiveServerEnvelope
                 * @instance
                 */
                LiveServerEnvelope.prototype.controllerState = null;

                /**
                 * LiveServerEnvelope result.
                 * @member {barc.browser.v1.LiveResult.$Properties|null|undefined} result
                 * @memberof barc.browser.v1.LiveServerEnvelope
                 * @instance
                 */
                LiveServerEnvelope.prototype.result = null;

                /**
                 * LiveServerEnvelope guestInput.
                 * @member {barc.browser.v1.LiveGuestRequest.$Properties|null|undefined} guestInput
                 * @memberof barc.browser.v1.LiveServerEnvelope
                 * @instance
                 */
                LiveServerEnvelope.prototype.guestInput = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * LiveServerEnvelope body.
                 * @member {"bootstrap"|"observation"|"controllerState"|"result"|"guestInput"|undefined} body
                 * @memberof barc.browser.v1.LiveServerEnvelope
                 * @instance
                 */
                $Object.defineProperty(LiveServerEnvelope.prototype, "body", {
                    get: $util.oneOfGetter($oneOfFields = ["bootstrap", "observation", "controllerState", "result", "guestInput"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Encodes the specified LiveServerEnvelope message. Does not implicitly {@link barc.browser.v1.LiveServerEnvelope.verify|verify} messages.
                 * @function encode
                 * @memberof barc.browser.v1.LiveServerEnvelope
                 * @static
                 * @param {barc.browser.v1.LiveServerEnvelope.$Properties} message LiveServerEnvelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveServerEnvelope.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.bootstrap != null && $Object.hasOwnProperty.call(message, "bootstrap"))
                        $root.barc.browser.v1.LiveBootstrap.encode(message.bootstrap, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.observation != null && $Object.hasOwnProperty.call(message, "observation"))
                        $root.barc.browser.v1.LiveObservation.encode(message.observation, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                    if (message.controllerState != null && $Object.hasOwnProperty.call(message, "controllerState"))
                        $root.barc.browser.v1.ControllerState.encode(message.controllerState, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                    if (message.result != null && $Object.hasOwnProperty.call(message, "result"))
                        $root.barc.browser.v1.LiveResult.encode(message.result, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
                    if (message.guestInput != null && $Object.hasOwnProperty.call(message, "guestInput"))
                        $root.barc.browser.v1.LiveGuestRequest.encode(message.guestInput, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Encodes the specified LiveServerEnvelope message, length delimited. Does not implicitly {@link barc.browser.v1.LiveServerEnvelope.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof barc.browser.v1.LiveServerEnvelope
                 * @static
                 * @param {barc.browser.v1.LiveServerEnvelope.$Properties} message LiveServerEnvelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                LiveServerEnvelope.encodeDelimited = function(message, writer) {
                    return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                };

                /**
                 * Decodes a LiveServerEnvelope message from the specified reader or buffer.
                 * @function decode
                 * @memberof barc.browser.v1.LiveServerEnvelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveServerEnvelope & barc.browser.v1.LiveServerEnvelope.$Shape} LiveServerEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveServerEnvelope.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.barc.browser.v1.LiveServerEnvelope();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                message.bootstrap = $root.barc.browser.v1.LiveBootstrap.decode(reader, reader.uint32(), $undefined, _depth + 1, message.bootstrap);
                                message.body = "bootstrap";
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                message.observation = $root.barc.browser.v1.LiveObservation.decode(reader, reader.uint32(), $undefined, _depth + 1, message.observation);
                                message.body = "observation";
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                message.controllerState = $root.barc.browser.v1.ControllerState.decode(reader, reader.uint32(), $undefined, _depth + 1, message.controllerState);
                                message.body = "controllerState";
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                message.result = $root.barc.browser.v1.LiveResult.decode(reader, reader.uint32(), $undefined, _depth + 1, message.result);
                                message.body = "result";
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                message.guestInput = $root.barc.browser.v1.LiveGuestRequest.decode(reader, reader.uint32(), $undefined, _depth + 1, message.guestInput);
                                message.body = "guestInput";
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Decodes a LiveServerEnvelope message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof barc.browser.v1.LiveServerEnvelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveServerEnvelope & barc.browser.v1.LiveServerEnvelope.$Shape} LiveServerEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                LiveServerEnvelope.decodeDelimited = function(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Creates a LiveServerEnvelope message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof barc.browser.v1.LiveServerEnvelope
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {barc.browser.v1.LiveServerEnvelope} LiveServerEnvelope
                 */
                LiveServerEnvelope.fromObject = function (object, _depth) {
                    if (object instanceof $root.barc.browser.v1.LiveServerEnvelope)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".barc.browser.v1.LiveServerEnvelope: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.barc.browser.v1.LiveServerEnvelope();
                    if (object.bootstrap != null) {
                        if (!$util.isObject(object.bootstrap))
                            throw $TypeError(".barc.browser.v1.LiveServerEnvelope.bootstrap: object expected");
                        message.bootstrap = $root.barc.browser.v1.LiveBootstrap.fromObject(object.bootstrap, _depth + 1);
                    }
                    if (object.observation != null) {
                        if (!$util.isObject(object.observation))
                            throw $TypeError(".barc.browser.v1.LiveServerEnvelope.observation: object expected");
                        message.observation = $root.barc.browser.v1.LiveObservation.fromObject(object.observation, _depth + 1);
                    }
                    if (object.controllerState != null) {
                        if (!$util.isObject(object.controllerState))
                            throw $TypeError(".barc.browser.v1.LiveServerEnvelope.controllerState: object expected");
                        message.controllerState = $root.barc.browser.v1.ControllerState.fromObject(object.controllerState, _depth + 1);
                    }
                    if (object.result != null) {
                        if (!$util.isObject(object.result))
                            throw $TypeError(".barc.browser.v1.LiveServerEnvelope.result: object expected");
                        message.result = $root.barc.browser.v1.LiveResult.fromObject(object.result, _depth + 1);
                    }
                    if (object.guestInput != null) {
                        if (!$util.isObject(object.guestInput))
                            throw $TypeError(".barc.browser.v1.LiveServerEnvelope.guestInput: object expected");
                        message.guestInput = $root.barc.browser.v1.LiveGuestRequest.fromObject(object.guestInput, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a LiveServerEnvelope message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof barc.browser.v1.LiveServerEnvelope
                 * @static
                 * @param {barc.browser.v1.LiveServerEnvelope} message LiveServerEnvelope
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                LiveServerEnvelope.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (message.bootstrap != null && $Object.hasOwnProperty.call(message, "bootstrap")) {
                        object.bootstrap = $root.barc.browser.v1.LiveBootstrap.toObject(message.bootstrap, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "bootstrap";
                    }
                    if (message.observation != null && $Object.hasOwnProperty.call(message, "observation")) {
                        object.observation = $root.barc.browser.v1.LiveObservation.toObject(message.observation, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "observation";
                    }
                    if (message.controllerState != null && $Object.hasOwnProperty.call(message, "controllerState")) {
                        object.controllerState = $root.barc.browser.v1.ControllerState.toObject(message.controllerState, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "controllerState";
                    }
                    if (message.result != null && $Object.hasOwnProperty.call(message, "result")) {
                        object.result = $root.barc.browser.v1.LiveResult.toObject(message.result, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "result";
                    }
                    if (message.guestInput != null && $Object.hasOwnProperty.call(message, "guestInput")) {
                        object.guestInput = $root.barc.browser.v1.LiveGuestRequest.toObject(message.guestInput, options, _depth + 1);
                        if (options.oneofs)
                            object.body = "guestInput";
                    }
                    return object;
                };

                /**
                 * Converts this LiveServerEnvelope to JSON.
                 * @function toJSON
                 * @memberof barc.browser.v1.LiveServerEnvelope
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                LiveServerEnvelope.prototype.toJSON = function() {
                    return LiveServerEnvelope.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the type url for LiveServerEnvelope
                 * @function getTypeUrl
                 * @memberof barc.browser.v1.LiveServerEnvelope
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                LiveServerEnvelope.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/barc.browser.v1.LiveServerEnvelope";
                };

                return LiveServerEnvelope;
            })();

            return v1;
        })();

        return browser;
    })();

    return barc;
})();

export {
  $root as default
};
