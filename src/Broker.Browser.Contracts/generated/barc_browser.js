/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
const $Object = $util.global.Object, $undefined = $util.global.undefined, $Error = $util.global.Error, $RangeError = $util.global.RangeError, $TypeError = $util.global.TypeError, $Number = $util.global.Number, $String = $util.global.String, $Array = $util.global.Array, $parseInt = $util.global.parseInt, $BigInt = $util.global.BigInt, $isFinite = $util.global.isFinite;

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
                 * @member {number} definitionId
                 * @memberof barc.browser.v1.ObservedUnit
                 * @instance
                 */
                ObservedUnit.prototype.definitionId = 0;

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
                    if (message.definitionId != null && $Object.hasOwnProperty.call(message, "definitionId") && message.definitionId !== 0)
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
                                if (value = reader.uint32())
                                    message.definitionId = value;
                                else
                                    delete message.definitionId;
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
                        if ($Number(object.definitionId) !== 0)
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
                        object.definitionId = 0;
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
                 * @member {number} teamId
                 * @memberof barc.browser.v1.TeamEconomy
                 * @instance
                 */
                TeamEconomy.prototype.teamId = 0;

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
                    if (message.teamId != null && $Object.hasOwnProperty.call(message, "teamId") && message.teamId !== 0)
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
                                if (value = reader.int32())
                                    message.teamId = value;
                                else
                                    delete message.teamId;
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
                        if ($Number(object.teamId) !== 0)
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
                        object.teamId = 0;
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
                 * @property {Long|null} [observationSequence] GuestRequest observationSequence
                 * @property {barc.browser.v1.SelectInput.$Properties|null} [select] GuestRequest select
                 * @property {barc.browser.v1.GroundTargetInput.$Properties|null} [groundTarget] GuestRequest groundTarget
                 * @property {"select"|"groundTarget"} [input] GuestRequest input
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
                 *   observationSequence?: Long|null;
                 *   select?: barc.browser.v1.SelectInput.$Shape|null;
                 *   groundTarget?: barc.browser.v1.GroundTargetInput.$Shape|null;
                 *   $unknowns?: Array.<Uint8Array>;
                 * } & (
                 *   ({ input?: undefined; select?: null; groundTarget?: null }|{ input?: "select"; select: barc.browser.v1.SelectInput.$Shape; groundTarget?: null }|{ input?: "groundTarget"; select?: null; groundTarget: barc.browser.v1.GroundTargetInput.$Shape })
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
                 * GuestRequest observationSequence.
                 * @member {Long} observationSequence
                 * @memberof barc.browser.v1.GuestRequest
                 * @instance
                 */
                GuestRequest.prototype.observationSequence = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

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
                 * @member {"select"|"groundTarget"|undefined} input
                 * @memberof barc.browser.v1.GuestRequest
                 * @instance
                 */
                $Object.defineProperty(GuestRequest.prototype, "input", {
                    get: $util.oneOfGetter($oneOfFields = ["select", "groundTarget"]),
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
                    if (message.observationSequence != null && $Object.hasOwnProperty.call(message, "observationSequence") && (typeof message.observationSequence === "object" ? message.observationSequence.low || message.observationSequence.high : message.observationSequence !== 0))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.observationSequence);
                    if (message.select != null && $Object.hasOwnProperty.call(message, "select"))
                        $root.barc.browser.v1.SelectInput.encode(message.select, writer.uint32(/* id 10, wireType 2 =*/82).fork(), _depth + 1).ldelim();
                    if (message.groundTarget != null && $Object.hasOwnProperty.call(message, "groundTarget"))
                        $root.barc.browser.v1.GroundTargetInput.encode(message.groundTarget, writer.uint32(/* id 11, wireType 2 =*/90).fork(), _depth + 1).ldelim();
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
                                    message.observationSequence = value;
                                else
                                    delete message.observationSequence;
                                continue;
                            }
                        case 10: {
                                if (wireType !== 2)
                                    break;
                                message.select = $root.barc.browser.v1.SelectInput.decode(reader, reader.uint32(), $undefined, _depth + 1, message.select);
                                message.input = "select";
                                continue;
                            }
                        case 11: {
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
                    if (object.observationSequence != null)
                        if (typeof object.observationSequence === "object" ? object.observationSequence.low || object.observationSequence.high : $Number(object.observationSequence) !== 0)
                            if ($util.Long)
                                message.observationSequence = $util.Long.fromValue(object.observationSequence, true);
                            else if (typeof object.observationSequence === "string")
                                message.observationSequence = $parseInt(object.observationSequence, 10);
                            else if (typeof object.observationSequence === "number")
                                message.observationSequence = object.observationSequence;
                            else if (typeof object.observationSequence === "object")
                                message.observationSequence = new $util.LongBits(object.observationSequence.low >>> 0, object.observationSequence.high >>> 0).toNumber(true);
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
                            object.observationSequence = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                        } else
                            object.observationSequence = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
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
                    if (message.observationSequence != null && $Object.hasOwnProperty.call(message, "observationSequence"))
                        if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                            object.observationSequence = typeof message.observationSequence === "number" ? $BigInt(message.observationSequence) : $util.Long.fromBits(message.observationSequence.low >>> 0, message.observationSequence.high >>> 0, true).toBigInt();
                        else if (typeof message.observationSequence === "number")
                            object.observationSequence = options.longs === $String ? $String(message.observationSequence) : message.observationSequence;
                        else
                            object.observationSequence = options.longs === $String ? $util.Long.prototype.toString.call(message.observationSequence) : options.longs === $Number ? new $util.LongBits(message.observationSequence.low >>> 0, message.observationSequence.high >>> 0).toNumber(true) : message.observationSequence;
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
                    if (message.kind != null && $Object.hasOwnProperty.call(message, "kind") && message.kind !== 0)
                        writer.uint32(/* id 3, wireType 0 =*/24).int32(message.kind);
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

            return v1;
        })();

        return browser;
    })();

    return barc;
})();

export {
  $root as default
};
