import * as $protobuf from "protobufjs";
import Long = require("long");

/** Namespace barc. */
export namespace barc {

    /** Namespace browser. */
    namespace browser {

        /** Namespace v1. */
        namespace v1 {

            /** PreviewMode enum. */
            enum PreviewMode {

                /** PREVIEW_MODE_UNSPECIFIED value */
                PREVIEW_MODE_UNSPECIFIED = 0,

                /** PREVIEW_MODE_READ_ONLY value */
                PREVIEW_MODE_READ_ONLY = 1
            }

            /** ValidityStatus enum. */
            enum ValidityStatus {

                /** VALIDITY_STATUS_UNSPECIFIED value */
                VALIDITY_STATUS_UNSPECIFIED = 0,

                /** VALIDITY_STATUS_CURRENT value */
                VALIDITY_STATUS_CURRENT = 1,

                /** VALIDITY_STATUS_STALE value */
                VALIDITY_STATUS_STALE = 2
            }

            /** ObservationKind enum. */
            enum ObservationKind {

                /** OBSERVATION_KIND_UNSPECIFIED value */
                OBSERVATION_KIND_UNSPECIFIED = 0,

                /** OBSERVATION_KIND_OWN value */
                OBSERVATION_KIND_OWN = 1,

                /** OBSERVATION_KIND_VISUAL value */
                OBSERVATION_KIND_VISUAL = 2,

                /** OBSERVATION_KIND_RADAR value */
                OBSERVATION_KIND_RADAR = 3
            }

            /** IntentKind enum. */
            enum IntentKind {

                /** INTENT_KIND_UNSPECIFIED value */
                INTENT_KIND_UNSPECIFIED = 0,

                /** INTENT_KIND_MOVE value */
                INTENT_KIND_MOVE = 1
            }

            /** GuestAckStatus enum. */
            enum GuestAckStatus {

                /** GUEST_ACK_STATUS_UNSPECIFIED value */
                GUEST_ACK_STATUS_UNSPECIFIED = 0,

                /** GUEST_ACK_STATUS_CONSUMED value */
                GUEST_ACK_STATUS_CONSUMED = 1,

                /** GUEST_ACK_STATUS_REFUSED value */
                GUEST_ACK_STATUS_REFUSED = 2
            }

            /**
             * Properties of a Limits.
             * @deprecated Use barc.browser.v1.Limits.$Properties instead.
             */
            interface ILimits extends barc.browser.v1.Limits.$Properties {
            }

            /** Represents a Limits. */
            class Limits {

                /**
                 * Constructs a new Limits.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.Limits.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Limits maxFrameBytes. */
                maxFrameBytes: number;

                /** Limits authTimeoutMs. */
                authTimeoutMs: number;

                /** Limits maxEntities. */
                maxEntities: number;

                /**
                 * Encodes the specified Limits message. Does not implicitly {@link barc.browser.v1.Limits.verify|verify} messages.
                 * @param message Limits message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.Limits.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Limits message, length delimited. Does not implicitly {@link barc.browser.v1.Limits.verify|verify} messages.
                 * @param message Limits message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.Limits.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Limits message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.Limits & barc.browser.v1.Limits.$Shape} Limits
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.Limits & barc.browser.v1.Limits.$Shape;

                /**
                 * Decodes a Limits message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.Limits & barc.browser.v1.Limits.$Shape} Limits
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.Limits & barc.browser.v1.Limits.$Shape;

                /**
                 * Creates a Limits message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Limits
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.Limits;

                /**
                 * Creates a plain object from a Limits message. Also converts values to other types if specified.
                 * @param message Limits
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.Limits, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Limits to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for Limits
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace Limits {

                /** Properties of a Limits. */
                interface $Properties {

                    /** Limits maxFrameBytes */
                    maxFrameBytes?: (number|null);

                    /** Limits authTimeoutMs */
                    authTimeoutMs?: (number|null);

                    /** Limits maxEntities */
                    maxEntities?: (number|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Limits. */
                type $Shape = barc.browser.v1.Limits.$Properties;
            }

            /**
             * Properties of a ClientAuth.
             * @deprecated Use barc.browser.v1.ClientAuth.$Properties instead.
             */
            interface IClientAuth extends barc.browser.v1.ClientAuth.$Properties {
            }

            /** Represents a ClientAuth. */
            class ClientAuth {

                /**
                 * Constructs a new ClientAuth.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.ClientAuth.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** ClientAuth game. */
                game: string;

                /** ClientAuth protocolVersion. */
                protocolVersion: string;

                /** ClientAuth profile. */
                profile: string;

                /** ClientAuth credential. */
                credential: string;

                /** ClientAuth origin. */
                origin: string;

                /** ClientAuth expectedSessionId. */
                expectedSessionId: Uint8Array;

                /**
                 * Encodes the specified ClientAuth message. Does not implicitly {@link barc.browser.v1.ClientAuth.verify|verify} messages.
                 * @param message ClientAuth message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.ClientAuth.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ClientAuth message, length delimited. Does not implicitly {@link barc.browser.v1.ClientAuth.verify|verify} messages.
                 * @param message ClientAuth message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.ClientAuth.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ClientAuth message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ClientAuth & barc.browser.v1.ClientAuth.$Shape} ClientAuth
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.ClientAuth & barc.browser.v1.ClientAuth.$Shape;

                /**
                 * Decodes a ClientAuth message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ClientAuth & barc.browser.v1.ClientAuth.$Shape} ClientAuth
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.ClientAuth & barc.browser.v1.ClientAuth.$Shape;

                /**
                 * Creates a ClientAuth message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ClientAuth
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.ClientAuth;

                /**
                 * Creates a plain object from a ClientAuth message. Also converts values to other types if specified.
                 * @param message ClientAuth
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.ClientAuth, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ClientAuth to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for ClientAuth
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace ClientAuth {

                /** Properties of a ClientAuth. */
                interface $Properties {

                    /** ClientAuth game */
                    game?: (string|null);

                    /** ClientAuth protocolVersion */
                    protocolVersion?: (string|null);

                    /** ClientAuth profile */
                    profile?: (string|null);

                    /** ClientAuth credential */
                    credential?: (string|null);

                    /** ClientAuth origin */
                    origin?: (string|null);

                    /** ClientAuth expectedSessionId */
                    expectedSessionId?: (Uint8Array|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a ClientAuth. */
                type $Shape = barc.browser.v1.ClientAuth.$Properties;
            }

            /**
             * Properties of a Bootstrap.
             * @deprecated Use barc.browser.v1.Bootstrap.$Properties instead.
             */
            interface IBootstrap extends barc.browser.v1.Bootstrap.$Properties {
            }

            /** Represents a Bootstrap. */
            class Bootstrap {

                /**
                 * Constructs a new Bootstrap.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.Bootstrap.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Bootstrap game. */
                game: string;

                /** Bootstrap protocolVersion. */
                protocolVersion: string;

                /** Bootstrap profile. */
                profile: string;

                /** Bootstrap sessionId. */
                sessionId: Uint8Array;

                /** Bootstrap perspectiveId. */
                perspectiveId: string;

                /** Bootstrap mode. */
                mode: barc.browser.v1.PreviewMode;

                /** Bootstrap validity. */
                validity?: (barc.browser.v1.Validity.$Properties|null);

                /** Bootstrap limits. */
                limits?: (barc.browser.v1.Limits.$Properties|null);

                /**
                 * Encodes the specified Bootstrap message. Does not implicitly {@link barc.browser.v1.Bootstrap.verify|verify} messages.
                 * @param message Bootstrap message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.Bootstrap.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Bootstrap message, length delimited. Does not implicitly {@link barc.browser.v1.Bootstrap.verify|verify} messages.
                 * @param message Bootstrap message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.Bootstrap.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Bootstrap message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.Bootstrap & barc.browser.v1.Bootstrap.$Shape} Bootstrap
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.Bootstrap & barc.browser.v1.Bootstrap.$Shape;

                /**
                 * Decodes a Bootstrap message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.Bootstrap & barc.browser.v1.Bootstrap.$Shape} Bootstrap
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.Bootstrap & barc.browser.v1.Bootstrap.$Shape;

                /**
                 * Creates a Bootstrap message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Bootstrap
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.Bootstrap;

                /**
                 * Creates a plain object from a Bootstrap message. Also converts values to other types if specified.
                 * @param message Bootstrap
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.Bootstrap, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Bootstrap to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for Bootstrap
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace Bootstrap {

                /** Properties of a Bootstrap. */
                interface $Properties {

                    /** Bootstrap game */
                    game?: (string|null);

                    /** Bootstrap protocolVersion */
                    protocolVersion?: (string|null);

                    /** Bootstrap profile */
                    profile?: (string|null);

                    /** Bootstrap sessionId */
                    sessionId?: (Uint8Array|null);

                    /** Bootstrap perspectiveId */
                    perspectiveId?: (string|null);

                    /** Bootstrap mode */
                    mode?: (barc.browser.v1.PreviewMode|null);

                    /** Bootstrap validity */
                    validity?: (barc.browser.v1.Validity.$Properties|null);

                    /** Bootstrap limits */
                    limits?: (barc.browser.v1.Limits.$Properties|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Bootstrap. */
                type $Shape = barc.browser.v1.Bootstrap.$Properties;
            }

            /**
             * Properties of a Validity.
             * @deprecated Use barc.browser.v1.Validity.$Properties instead.
             */
            interface IValidity extends barc.browser.v1.Validity.$Properties {
            }

            /** Represents a Validity. */
            class Validity {

                /**
                 * Constructs a new Validity.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.Validity.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Validity status. */
                status: barc.browser.v1.ValidityStatus;

                /** Validity lastSequence. */
                lastSequence: Long;

                /** Validity receivedSequence. */
                receivedSequence?: (Long|null);

                /** Validity detail. */
                detail: string;

                /**
                 * Encodes the specified Validity message. Does not implicitly {@link barc.browser.v1.Validity.verify|verify} messages.
                 * @param message Validity message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.Validity.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Validity message, length delimited. Does not implicitly {@link barc.browser.v1.Validity.verify|verify} messages.
                 * @param message Validity message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.Validity.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Validity message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.Validity & barc.browser.v1.Validity.$Shape} Validity
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.Validity & barc.browser.v1.Validity.$Shape;

                /**
                 * Decodes a Validity message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.Validity & barc.browser.v1.Validity.$Shape} Validity
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.Validity & barc.browser.v1.Validity.$Shape;

                /**
                 * Creates a Validity message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Validity
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.Validity;

                /**
                 * Creates a plain object from a Validity message. Also converts values to other types if specified.
                 * @param message Validity
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.Validity, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Validity to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for Validity
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace Validity {

                /** Properties of a Validity. */
                interface $Properties {

                    /** Validity status */
                    status?: (barc.browser.v1.ValidityStatus|null);

                    /** Validity lastSequence */
                    lastSequence?: (Long|null);

                    /** Validity receivedSequence */
                    receivedSequence?: (Long|null);

                    /** Validity detail */
                    detail?: (string|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Validity. */
                type $Shape = barc.browser.v1.Validity.$Properties;
            }

            /**
             * Properties of a Position3.
             * @deprecated Use barc.browser.v1.Position3.$Properties instead.
             */
            interface IPosition3 extends barc.browser.v1.Position3.$Properties {
            }

            /** Represents a Position3. */
            class Position3 {

                /**
                 * Constructs a new Position3.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.Position3.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Position3 x. */
                x: number;

                /** Position3 elevation. */
                elevation?: (number|null);

                /** Position3 z. */
                z: number;

                /**
                 * Encodes the specified Position3 message. Does not implicitly {@link barc.browser.v1.Position3.verify|verify} messages.
                 * @param message Position3 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.Position3.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Position3 message, length delimited. Does not implicitly {@link barc.browser.v1.Position3.verify|verify} messages.
                 * @param message Position3 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.Position3.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Position3 message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.Position3 & barc.browser.v1.Position3.$Shape} Position3
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.Position3 & barc.browser.v1.Position3.$Shape;

                /**
                 * Decodes a Position3 message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.Position3 & barc.browser.v1.Position3.$Shape} Position3
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.Position3 & barc.browser.v1.Position3.$Shape;

                /**
                 * Creates a Position3 message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Position3
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.Position3;

                /**
                 * Creates a plain object from a Position3 message. Also converts values to other types if specified.
                 * @param message Position3
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.Position3, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Position3 to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for Position3
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace Position3 {

                /** Properties of a Position3. */
                interface $Properties {

                    /** Position3 x */
                    x?: (number|null);

                    /** Position3 elevation */
                    elevation?: (number|null);

                    /** Position3 z */
                    z?: (number|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Position3. */
                type $Shape = barc.browser.v1.Position3.$Properties;
            }

            /**
             * Properties of an ObservedUnit.
             * @deprecated Use barc.browser.v1.ObservedUnit.$Properties instead.
             */
            interface IObservedUnit extends barc.browser.v1.ObservedUnit.$Properties {
            }

            /** Represents an ObservedUnit. */
            class ObservedUnit {

                /**
                 * Constructs a new ObservedUnit.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.ObservedUnit.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** ObservedUnit id. */
                id: Long;

                /** ObservedUnit definitionId. */
                definitionId?: (number|null);

                /** ObservedUnit teamId. */
                teamId?: (number|null);

                /** ObservedUnit observation. */
                observation: barc.browser.v1.ObservationKind;

                /** ObservedUnit position. */
                position?: (barc.browser.v1.Position3.$Properties|null);

                /** ObservedUnit health. */
                health?: (number|null);

                /** ObservedUnit maxHealth. */
                maxHealth?: (number|null);

                /** ObservedUnit generation. */
                generation?: (Long|null);

                /**
                 * Encodes the specified ObservedUnit message. Does not implicitly {@link barc.browser.v1.ObservedUnit.verify|verify} messages.
                 * @param message ObservedUnit message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.ObservedUnit.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ObservedUnit message, length delimited. Does not implicitly {@link barc.browser.v1.ObservedUnit.verify|verify} messages.
                 * @param message ObservedUnit message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.ObservedUnit.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an ObservedUnit message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ObservedUnit & barc.browser.v1.ObservedUnit.$Shape} ObservedUnit
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.ObservedUnit & barc.browser.v1.ObservedUnit.$Shape;

                /**
                 * Decodes an ObservedUnit message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ObservedUnit & barc.browser.v1.ObservedUnit.$Shape} ObservedUnit
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.ObservedUnit & barc.browser.v1.ObservedUnit.$Shape;

                /**
                 * Creates an ObservedUnit message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ObservedUnit
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.ObservedUnit;

                /**
                 * Creates a plain object from an ObservedUnit message. Also converts values to other types if specified.
                 * @param message ObservedUnit
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.ObservedUnit, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ObservedUnit to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for ObservedUnit
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace ObservedUnit {

                /** Properties of an ObservedUnit. */
                interface $Properties {

                    /** ObservedUnit id */
                    id?: (Long|null);

                    /** ObservedUnit definitionId */
                    definitionId?: (number|null);

                    /** ObservedUnit teamId */
                    teamId?: (number|null);

                    /** ObservedUnit observation */
                    observation?: (barc.browser.v1.ObservationKind|null);

                    /** ObservedUnit position */
                    position?: (barc.browser.v1.Position3.$Properties|null);

                    /** ObservedUnit health */
                    health?: (number|null);

                    /** ObservedUnit maxHealth */
                    maxHealth?: (number|null);

                    /** ObservedUnit generation */
                    generation?: (Long|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of an ObservedUnit. */
                type $Shape = barc.browser.v1.ObservedUnit.$Properties;
            }

            /**
             * Properties of an ObservedFeature.
             * @deprecated Use barc.browser.v1.ObservedFeature.$Properties instead.
             */
            interface IObservedFeature extends barc.browser.v1.ObservedFeature.$Properties {
            }

            /** Represents an ObservedFeature. */
            class ObservedFeature {

                /**
                 * Constructs a new ObservedFeature.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.ObservedFeature.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** ObservedFeature id. */
                id: Long;

                /** ObservedFeature definitionId. */
                definitionId: number;

                /** ObservedFeature position. */
                position?: (barc.browser.v1.Position3.$Properties|null);

                /**
                 * Encodes the specified ObservedFeature message. Does not implicitly {@link barc.browser.v1.ObservedFeature.verify|verify} messages.
                 * @param message ObservedFeature message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.ObservedFeature.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ObservedFeature message, length delimited. Does not implicitly {@link barc.browser.v1.ObservedFeature.verify|verify} messages.
                 * @param message ObservedFeature message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.ObservedFeature.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an ObservedFeature message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ObservedFeature & barc.browser.v1.ObservedFeature.$Shape} ObservedFeature
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.ObservedFeature & barc.browser.v1.ObservedFeature.$Shape;

                /**
                 * Decodes an ObservedFeature message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ObservedFeature & barc.browser.v1.ObservedFeature.$Shape} ObservedFeature
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.ObservedFeature & barc.browser.v1.ObservedFeature.$Shape;

                /**
                 * Creates an ObservedFeature message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ObservedFeature
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.ObservedFeature;

                /**
                 * Creates a plain object from an ObservedFeature message. Also converts values to other types if specified.
                 * @param message ObservedFeature
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.ObservedFeature, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ObservedFeature to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for ObservedFeature
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace ObservedFeature {

                /** Properties of an ObservedFeature. */
                interface $Properties {

                    /** ObservedFeature id */
                    id?: (Long|null);

                    /** ObservedFeature definitionId */
                    definitionId?: (number|null);

                    /** ObservedFeature position */
                    position?: (barc.browser.v1.Position3.$Properties|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of an ObservedFeature. */
                type $Shape = barc.browser.v1.ObservedFeature.$Properties;
            }

            /**
             * Properties of a ResourceAmount.
             * @deprecated Use barc.browser.v1.ResourceAmount.$Properties instead.
             */
            interface IResourceAmount extends barc.browser.v1.ResourceAmount.$Properties {
            }

            /** Represents a ResourceAmount. */
            class ResourceAmount {

                /**
                 * Constructs a new ResourceAmount.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.ResourceAmount.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** ResourceAmount current. */
                current?: (number|null);

                /** ResourceAmount storage. */
                storage?: (number|null);

                /** ResourceAmount income. */
                income?: (number|null);

                /** ResourceAmount expenditure. */
                expenditure?: (number|null);

                /**
                 * Encodes the specified ResourceAmount message. Does not implicitly {@link barc.browser.v1.ResourceAmount.verify|verify} messages.
                 * @param message ResourceAmount message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.ResourceAmount.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ResourceAmount message, length delimited. Does not implicitly {@link barc.browser.v1.ResourceAmount.verify|verify} messages.
                 * @param message ResourceAmount message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.ResourceAmount.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ResourceAmount message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ResourceAmount & barc.browser.v1.ResourceAmount.$Shape} ResourceAmount
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.ResourceAmount & barc.browser.v1.ResourceAmount.$Shape;

                /**
                 * Decodes a ResourceAmount message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ResourceAmount & barc.browser.v1.ResourceAmount.$Shape} ResourceAmount
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.ResourceAmount & barc.browser.v1.ResourceAmount.$Shape;

                /**
                 * Creates a ResourceAmount message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ResourceAmount
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.ResourceAmount;

                /**
                 * Creates a plain object from a ResourceAmount message. Also converts values to other types if specified.
                 * @param message ResourceAmount
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.ResourceAmount, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ResourceAmount to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for ResourceAmount
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace ResourceAmount {

                /** Properties of a ResourceAmount. */
                interface $Properties {

                    /** ResourceAmount current */
                    current?: (number|null);

                    /** ResourceAmount storage */
                    storage?: (number|null);

                    /** ResourceAmount income */
                    income?: (number|null);

                    /** ResourceAmount expenditure */
                    expenditure?: (number|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a ResourceAmount. */
                type $Shape = barc.browser.v1.ResourceAmount.$Properties;
            }

            /**
             * Properties of a TeamEconomy.
             * @deprecated Use barc.browser.v1.TeamEconomy.$Properties instead.
             */
            interface ITeamEconomy extends barc.browser.v1.TeamEconomy.$Properties {
            }

            /** Represents a TeamEconomy. */
            class TeamEconomy {

                /**
                 * Constructs a new TeamEconomy.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.TeamEconomy.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** TeamEconomy teamId. */
                teamId?: (number|null);

                /** TeamEconomy metal. */
                metal?: (barc.browser.v1.ResourceAmount.$Properties|null);

                /** TeamEconomy energy. */
                energy?: (barc.browser.v1.ResourceAmount.$Properties|null);

                /**
                 * Encodes the specified TeamEconomy message. Does not implicitly {@link barc.browser.v1.TeamEconomy.verify|verify} messages.
                 * @param message TeamEconomy message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.TeamEconomy.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified TeamEconomy message, length delimited. Does not implicitly {@link barc.browser.v1.TeamEconomy.verify|verify} messages.
                 * @param message TeamEconomy message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.TeamEconomy.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a TeamEconomy message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.TeamEconomy & barc.browser.v1.TeamEconomy.$Shape} TeamEconomy
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.TeamEconomy & barc.browser.v1.TeamEconomy.$Shape;

                /**
                 * Decodes a TeamEconomy message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.TeamEconomy & barc.browser.v1.TeamEconomy.$Shape} TeamEconomy
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.TeamEconomy & barc.browser.v1.TeamEconomy.$Shape;

                /**
                 * Creates a TeamEconomy message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns TeamEconomy
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.TeamEconomy;

                /**
                 * Creates a plain object from a TeamEconomy message. Also converts values to other types if specified.
                 * @param message TeamEconomy
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.TeamEconomy, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this TeamEconomy to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for TeamEconomy
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace TeamEconomy {

                /** Properties of a TeamEconomy. */
                interface $Properties {

                    /** TeamEconomy teamId */
                    teamId?: (number|null);

                    /** TeamEconomy metal */
                    metal?: (barc.browser.v1.ResourceAmount.$Properties|null);

                    /** TeamEconomy energy */
                    energy?: (barc.browser.v1.ResourceAmount.$Properties|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a TeamEconomy. */
                type $Shape = barc.browser.v1.TeamEconomy.$Properties;
            }

            /**
             * Properties of an Observation.
             * @deprecated Use barc.browser.v1.Observation.$Properties instead.
             */
            interface IObservation extends barc.browser.v1.Observation.$Properties {
            }

            /** Represents an Observation. */
            class Observation {

                /**
                 * Constructs a new Observation.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.Observation.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Observation sessionId. */
                sessionId: Uint8Array;

                /** Observation sequence. */
                sequence: Long;

                /** Observation capturedAtUnixMs. */
                capturedAtUnixMs: Long;

                /** Observation perspectiveId. */
                perspectiveId: string;

                /** Observation validity. */
                validity?: (barc.browser.v1.Validity.$Properties|null);

                /** Observation units. */
                units: barc.browser.v1.ObservedUnit.$Properties[];

                /** Observation features. */
                features: barc.browser.v1.ObservedFeature.$Properties[];

                /** Observation teamEconomy. */
                teamEconomy?: (barc.browser.v1.TeamEconomy.$Properties|null);

                /**
                 * Encodes the specified Observation message. Does not implicitly {@link barc.browser.v1.Observation.verify|verify} messages.
                 * @param message Observation message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.Observation.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Observation message, length delimited. Does not implicitly {@link barc.browser.v1.Observation.verify|verify} messages.
                 * @param message Observation message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.Observation.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an Observation message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.Observation & barc.browser.v1.Observation.$Shape} Observation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.Observation & barc.browser.v1.Observation.$Shape;

                /**
                 * Decodes an Observation message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.Observation & barc.browser.v1.Observation.$Shape} Observation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.Observation & barc.browser.v1.Observation.$Shape;

                /**
                 * Creates an Observation message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Observation
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.Observation;

                /**
                 * Creates a plain object from an Observation message. Also converts values to other types if specified.
                 * @param message Observation
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.Observation, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Observation to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for Observation
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace Observation {

                /** Properties of an Observation. */
                interface $Properties {

                    /** Observation sessionId */
                    sessionId?: (Uint8Array|null);

                    /** Observation sequence */
                    sequence?: (Long|null);

                    /** Observation capturedAtUnixMs */
                    capturedAtUnixMs?: (Long|null);

                    /** Observation perspectiveId */
                    perspectiveId?: (string|null);

                    /** Observation validity */
                    validity?: (barc.browser.v1.Validity.$Properties|null);

                    /** Observation units */
                    units?: (barc.browser.v1.ObservedUnit.$Properties[]|null);

                    /** Observation features */
                    features?: (barc.browser.v1.ObservedFeature.$Properties[]|null);

                    /** Observation teamEconomy */
                    teamEconomy?: (barc.browser.v1.TeamEconomy.$Properties|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of an Observation. */
                type $Shape = barc.browser.v1.Observation.$Properties;
            }

            /**
             * Properties of a SelectInput.
             * @deprecated Use barc.browser.v1.SelectInput.$Properties instead.
             */
            interface ISelectInput extends barc.browser.v1.SelectInput.$Properties {
            }

            /** Represents a SelectInput. */
            class SelectInput {

                /**
                 * Constructs a new SelectInput.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.SelectInput.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** SelectInput unitIds. */
                unitIds: Long[];

                /**
                 * Encodes the specified SelectInput message. Does not implicitly {@link barc.browser.v1.SelectInput.verify|verify} messages.
                 * @param message SelectInput message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.SelectInput.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified SelectInput message, length delimited. Does not implicitly {@link barc.browser.v1.SelectInput.verify|verify} messages.
                 * @param message SelectInput message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.SelectInput.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a SelectInput message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.SelectInput & barc.browser.v1.SelectInput.$Shape} SelectInput
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.SelectInput & barc.browser.v1.SelectInput.$Shape;

                /**
                 * Decodes a SelectInput message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.SelectInput & barc.browser.v1.SelectInput.$Shape} SelectInput
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.SelectInput & barc.browser.v1.SelectInput.$Shape;

                /**
                 * Creates a SelectInput message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns SelectInput
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.SelectInput;

                /**
                 * Creates a plain object from a SelectInput message. Also converts values to other types if specified.
                 * @param message SelectInput
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.SelectInput, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this SelectInput to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for SelectInput
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace SelectInput {

                /** Properties of a SelectInput. */
                interface $Properties {

                    /** SelectInput unitIds */
                    unitIds?: (Long[]|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a SelectInput. */
                type $Shape = barc.browser.v1.SelectInput.$Properties;
            }

            /**
             * Properties of a GroundTargetInput.
             * @deprecated Use barc.browser.v1.GroundTargetInput.$Properties instead.
             */
            interface IGroundTargetInput extends barc.browser.v1.GroundTargetInput.$Properties {
            }

            /** Represents a GroundTargetInput. */
            class GroundTargetInput {

                /**
                 * Constructs a new GroundTargetInput.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.GroundTargetInput.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** GroundTargetInput position. */
                position?: (barc.browser.v1.Position3.$Properties|null);

                /**
                 * Encodes the specified GroundTargetInput message. Does not implicitly {@link barc.browser.v1.GroundTargetInput.verify|verify} messages.
                 * @param message GroundTargetInput message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.GroundTargetInput.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GroundTargetInput message, length delimited. Does not implicitly {@link barc.browser.v1.GroundTargetInput.verify|verify} messages.
                 * @param message GroundTargetInput message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.GroundTargetInput.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GroundTargetInput message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.GroundTargetInput & barc.browser.v1.GroundTargetInput.$Shape} GroundTargetInput
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.GroundTargetInput & barc.browser.v1.GroundTargetInput.$Shape;

                /**
                 * Decodes a GroundTargetInput message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.GroundTargetInput & barc.browser.v1.GroundTargetInput.$Shape} GroundTargetInput
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.GroundTargetInput & barc.browser.v1.GroundTargetInput.$Shape;

                /**
                 * Creates a GroundTargetInput message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GroundTargetInput
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.GroundTargetInput;

                /**
                 * Creates a plain object from a GroundTargetInput message. Also converts values to other types if specified.
                 * @param message GroundTargetInput
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.GroundTargetInput, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GroundTargetInput to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for GroundTargetInput
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace GroundTargetInput {

                /** Properties of a GroundTargetInput. */
                interface $Properties {

                    /** GroundTargetInput position */
                    position?: (barc.browser.v1.Position3.$Properties|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a GroundTargetInput. */
                type $Shape = barc.browser.v1.GroundTargetInput.$Properties;
            }

            /**
             * Properties of a GuestRequest.
             * @deprecated Use barc.browser.v1.GuestRequest.$Properties instead.
             */
            interface IGuestRequest extends barc.browser.v1.GuestRequest.$Properties {
            }

            /** Represents a GuestRequest. */
            class GuestRequest {

                /**
                 * Constructs a new GuestRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.GuestRequest.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** GuestRequest requestId. */
                requestId: Long;

                /** GuestRequest sessionId. */
                sessionId: Uint8Array;

                /** GuestRequest contextSequence. */
                contextSequence: Long;

                /** GuestRequest initialize. */
                initialize?: (barc.browser.v1.Bootstrap.$Properties|null);

                /** GuestRequest observation. */
                observation?: (barc.browser.v1.Observation.$Properties|null);

                /** GuestRequest select. */
                select?: (barc.browser.v1.SelectInput.$Properties|null);

                /** GuestRequest groundTarget. */
                groundTarget?: (barc.browser.v1.GroundTargetInput.$Properties|null);

                /** GuestRequest input. */
                input?: ("initialize"|"observation"|"select"|"groundTarget");

                /**
                 * Encodes the specified GuestRequest message. Does not implicitly {@link barc.browser.v1.GuestRequest.verify|verify} messages.
                 * @param message GuestRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.GuestRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GuestRequest message, length delimited. Does not implicitly {@link barc.browser.v1.GuestRequest.verify|verify} messages.
                 * @param message GuestRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.GuestRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GuestRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.GuestRequest & barc.browser.v1.GuestRequest.$Shape} GuestRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.GuestRequest & barc.browser.v1.GuestRequest.$Shape;

                /**
                 * Decodes a GuestRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.GuestRequest & barc.browser.v1.GuestRequest.$Shape} GuestRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.GuestRequest & barc.browser.v1.GuestRequest.$Shape;

                /**
                 * Creates a GuestRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GuestRequest
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.GuestRequest;

                /**
                 * Creates a plain object from a GuestRequest message. Also converts values to other types if specified.
                 * @param message GuestRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.GuestRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GuestRequest to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for GuestRequest
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace GuestRequest {

                /** Properties of a GuestRequest. */
                interface $Properties {

                    /** GuestRequest requestId */
                    requestId?: (Long|null);

                    /** GuestRequest sessionId */
                    sessionId?: (Uint8Array|null);

                    /** GuestRequest contextSequence */
                    contextSequence?: (Long|null);

                    /** GuestRequest initialize */
                    initialize?: (barc.browser.v1.Bootstrap.$Properties|null);

                    /** GuestRequest observation */
                    observation?: (barc.browser.v1.Observation.$Properties|null);

                    /** GuestRequest select */
                    select?: (barc.browser.v1.SelectInput.$Properties|null);

                    /** GuestRequest groundTarget */
                    groundTarget?: (barc.browser.v1.GroundTargetInput.$Properties|null);

                    /** GuestRequest input */
                    input?: ("initialize"|"observation"|"select"|"groundTarget");

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Narrowed shape of a GuestRequest. */
                type $Shape = {
                  requestId?: Long|null;
                  sessionId?: Uint8Array|null;
                  contextSequence?: Long|null;
                  initialize?: barc.browser.v1.Bootstrap.$Shape|null;
                  observation?: barc.browser.v1.Observation.$Shape|null;
                  select?: barc.browser.v1.SelectInput.$Shape|null;
                  groundTarget?: barc.browser.v1.GroundTargetInput.$Shape|null;
                  $unknowns?: Uint8Array[];
                } & (
                  ({ input?: undefined; initialize?: null; observation?: null; select?: null; groundTarget?: null }|{ input?: "initialize"; initialize: barc.browser.v1.Bootstrap.$Shape; observation?: null; select?: null; groundTarget?: null }|{ input?: "observation"; initialize?: null; observation: barc.browser.v1.Observation.$Shape; select?: null; groundTarget?: null }|{ input?: "select"; initialize?: null; observation?: null; select: barc.browser.v1.SelectInput.$Shape; groundTarget?: null }|{ input?: "groundTarget"; initialize?: null; observation?: null; select?: null; groundTarget: barc.browser.v1.GroundTargetInput.$Shape })
                );
            }

            /**
             * Properties of a MovePreview.
             * @deprecated Use barc.browser.v1.MovePreview.$Properties instead.
             */
            interface IMovePreview extends barc.browser.v1.MovePreview.$Properties {
            }

            /** Represents a MovePreview. */
            class MovePreview {

                /**
                 * Constructs a new MovePreview.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.MovePreview.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** MovePreview unitIds. */
                unitIds: Long[];

                /** MovePreview groundTarget. */
                groundTarget?: (barc.browser.v1.Position3.$Properties|null);

                /**
                 * Encodes the specified MovePreview message. Does not implicitly {@link barc.browser.v1.MovePreview.verify|verify} messages.
                 * @param message MovePreview message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.MovePreview.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MovePreview message, length delimited. Does not implicitly {@link barc.browser.v1.MovePreview.verify|verify} messages.
                 * @param message MovePreview message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.MovePreview.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MovePreview message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.MovePreview & barc.browser.v1.MovePreview.$Shape} MovePreview
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.MovePreview & barc.browser.v1.MovePreview.$Shape;

                /**
                 * Decodes a MovePreview message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.MovePreview & barc.browser.v1.MovePreview.$Shape} MovePreview
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.MovePreview & barc.browser.v1.MovePreview.$Shape;

                /**
                 * Creates a MovePreview message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MovePreview
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.MovePreview;

                /**
                 * Creates a plain object from a MovePreview message. Also converts values to other types if specified.
                 * @param message MovePreview
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.MovePreview, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MovePreview to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for MovePreview
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace MovePreview {

                /** Properties of a MovePreview. */
                interface $Properties {

                    /** MovePreview unitIds */
                    unitIds?: (Long[]|null);

                    /** MovePreview groundTarget */
                    groundTarget?: (barc.browser.v1.Position3.$Properties|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a MovePreview. */
                type $Shape = barc.browser.v1.MovePreview.$Properties;
            }

            /**
             * Properties of a GuestResponse.
             * @deprecated Use barc.browser.v1.GuestResponse.$Properties instead.
             */
            interface IGuestResponse extends barc.browser.v1.GuestResponse.$Properties {
            }

            /** Represents a GuestResponse. */
            class GuestResponse {

                /**
                 * Constructs a new GuestResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.GuestResponse.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** GuestResponse requestId. */
                requestId: Long;

                /** GuestResponse sessionId. */
                sessionId: Uint8Array;

                /** GuestResponse consumedSequence. */
                consumedSequence: Long;

                /** GuestResponse acknowledgment. */
                acknowledgment: barc.browser.v1.GuestAckStatus;

                /** GuestResponse refusalDetail. */
                refusalDetail: string;

                /** GuestResponse kind. */
                kind: barc.browser.v1.IntentKind;

                /** GuestResponse move. */
                move?: (barc.browser.v1.MovePreview.$Properties|null);

                /** GuestResponse preview. */
                preview?: "move";

                /**
                 * Encodes the specified GuestResponse message. Does not implicitly {@link barc.browser.v1.GuestResponse.verify|verify} messages.
                 * @param message GuestResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.GuestResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GuestResponse message, length delimited. Does not implicitly {@link barc.browser.v1.GuestResponse.verify|verify} messages.
                 * @param message GuestResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.GuestResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GuestResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.GuestResponse & barc.browser.v1.GuestResponse.$Shape} GuestResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.GuestResponse & barc.browser.v1.GuestResponse.$Shape;

                /**
                 * Decodes a GuestResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.GuestResponse & barc.browser.v1.GuestResponse.$Shape} GuestResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.GuestResponse & barc.browser.v1.GuestResponse.$Shape;

                /**
                 * Creates a GuestResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GuestResponse
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.GuestResponse;

                /**
                 * Creates a plain object from a GuestResponse message. Also converts values to other types if specified.
                 * @param message GuestResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.GuestResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GuestResponse to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for GuestResponse
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace GuestResponse {

                /** Properties of a GuestResponse. */
                interface $Properties {

                    /** GuestResponse requestId */
                    requestId?: (Long|null);

                    /** GuestResponse sessionId */
                    sessionId?: (Uint8Array|null);

                    /** GuestResponse consumedSequence */
                    consumedSequence?: (Long|null);

                    /** GuestResponse acknowledgment */
                    acknowledgment?: (barc.browser.v1.GuestAckStatus|null);

                    /** GuestResponse refusalDetail */
                    refusalDetail?: (string|null);

                    /** GuestResponse kind */
                    kind?: (barc.browser.v1.IntentKind|null);

                    /** GuestResponse move */
                    move?: (barc.browser.v1.MovePreview.$Properties|null);

                    /** GuestResponse preview */
                    preview?: "move";

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Narrowed shape of a GuestResponse. */
                type $Shape = {
                  requestId?: Long|null;
                  sessionId?: Uint8Array|null;
                  consumedSequence?: Long|null;
                  acknowledgment?: barc.browser.v1.GuestAckStatus|null;
                  refusalDetail?: string|null;
                  kind?: barc.browser.v1.IntentKind|null;
                  move?: barc.browser.v1.MovePreview.$Shape|null;
                  $unknowns?: Uint8Array[];
                } & (
                  ({ preview?: undefined; move?: null }|{ preview?: "move"; move: barc.browser.v1.MovePreview.$Shape })
                );
            }

            /**
             * Properties of a ServerEnvelope.
             * @deprecated Use barc.browser.v1.ServerEnvelope.$Properties instead.
             */
            interface IServerEnvelope extends barc.browser.v1.ServerEnvelope.$Properties {
            }

            /** Represents a ServerEnvelope. */
            class ServerEnvelope {

                /**
                 * Constructs a new ServerEnvelope.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.ServerEnvelope.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** ServerEnvelope bootstrap. */
                bootstrap?: (barc.browser.v1.Bootstrap.$Properties|null);

                /** ServerEnvelope observation. */
                observation?: (barc.browser.v1.Observation.$Properties|null);

                /** ServerEnvelope preview. */
                preview?: (barc.browser.v1.GuestResponse.$Properties|null);

                /** ServerEnvelope body. */
                body?: ("bootstrap"|"observation"|"preview");

                /**
                 * Encodes the specified ServerEnvelope message. Does not implicitly {@link barc.browser.v1.ServerEnvelope.verify|verify} messages.
                 * @param message ServerEnvelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.ServerEnvelope.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ServerEnvelope message, length delimited. Does not implicitly {@link barc.browser.v1.ServerEnvelope.verify|verify} messages.
                 * @param message ServerEnvelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.ServerEnvelope.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ServerEnvelope message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ServerEnvelope & barc.browser.v1.ServerEnvelope.$Shape} ServerEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.ServerEnvelope & barc.browser.v1.ServerEnvelope.$Shape;

                /**
                 * Decodes a ServerEnvelope message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ServerEnvelope & barc.browser.v1.ServerEnvelope.$Shape} ServerEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.ServerEnvelope & barc.browser.v1.ServerEnvelope.$Shape;

                /**
                 * Creates a ServerEnvelope message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ServerEnvelope
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.ServerEnvelope;

                /**
                 * Creates a plain object from a ServerEnvelope message. Also converts values to other types if specified.
                 * @param message ServerEnvelope
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.ServerEnvelope, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ServerEnvelope to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for ServerEnvelope
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace ServerEnvelope {

                /** Properties of a ServerEnvelope. */
                interface $Properties {

                    /** ServerEnvelope bootstrap */
                    bootstrap?: (barc.browser.v1.Bootstrap.$Properties|null);

                    /** ServerEnvelope observation */
                    observation?: (barc.browser.v1.Observation.$Properties|null);

                    /** ServerEnvelope preview */
                    preview?: (barc.browser.v1.GuestResponse.$Properties|null);

                    /** ServerEnvelope body */
                    body?: ("bootstrap"|"observation"|"preview");

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Narrowed shape of a ServerEnvelope. */
                type $Shape = {
                  bootstrap?: barc.browser.v1.Bootstrap.$Shape|null;
                  observation?: barc.browser.v1.Observation.$Shape|null;
                  preview?: barc.browser.v1.GuestResponse.$Shape|null;
                  $unknowns?: Uint8Array[];
                } & (
                  ({ body?: undefined; bootstrap?: null; observation?: null; preview?: null }|{ body?: "bootstrap"; bootstrap: barc.browser.v1.Bootstrap.$Shape; observation?: null; preview?: null }|{ body?: "observation"; bootstrap?: null; observation: barc.browser.v1.Observation.$Shape; preview?: null }|{ body?: "preview"; bootstrap?: null; observation?: null; preview: barc.browser.v1.GuestResponse.$Shape })
                );
            }

            /**
             * Properties of a ClientEnvelope.
             * @deprecated Use barc.browser.v1.ClientEnvelope.$Properties instead.
             */
            interface IClientEnvelope extends barc.browser.v1.ClientEnvelope.$Properties {
            }

            /** Represents a ClientEnvelope. */
            class ClientEnvelope {

                /**
                 * Constructs a new ClientEnvelope.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.ClientEnvelope.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** ClientEnvelope authenticate. */
                authenticate?: (barc.browser.v1.ClientAuth.$Properties|null);

                /** ClientEnvelope body. */
                body?: "authenticate";

                /**
                 * Encodes the specified ClientEnvelope message. Does not implicitly {@link barc.browser.v1.ClientEnvelope.verify|verify} messages.
                 * @param message ClientEnvelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.ClientEnvelope.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ClientEnvelope message, length delimited. Does not implicitly {@link barc.browser.v1.ClientEnvelope.verify|verify} messages.
                 * @param message ClientEnvelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.ClientEnvelope.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ClientEnvelope message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ClientEnvelope & barc.browser.v1.ClientEnvelope.$Shape} ClientEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.ClientEnvelope & barc.browser.v1.ClientEnvelope.$Shape;

                /**
                 * Decodes a ClientEnvelope message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ClientEnvelope & barc.browser.v1.ClientEnvelope.$Shape} ClientEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.ClientEnvelope & barc.browser.v1.ClientEnvelope.$Shape;

                /**
                 * Creates a ClientEnvelope message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ClientEnvelope
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.ClientEnvelope;

                /**
                 * Creates a plain object from a ClientEnvelope message. Also converts values to other types if specified.
                 * @param message ClientEnvelope
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.ClientEnvelope, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ClientEnvelope to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for ClientEnvelope
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace ClientEnvelope {

                /** Properties of a ClientEnvelope. */
                interface $Properties {

                    /** ClientEnvelope authenticate */
                    authenticate?: (barc.browser.v1.ClientAuth.$Properties|null);

                    /** ClientEnvelope body */
                    body?: "authenticate";

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Narrowed shape of a ClientEnvelope. */
                type $Shape = {
                  authenticate?: barc.browser.v1.ClientAuth.$Shape|null;
                  $unknowns?: Uint8Array[];
                } & (
                  ({ body?: undefined; authenticate?: null }|{ body?: "authenticate"; authenticate: barc.browser.v1.ClientAuth.$Shape })
                );
            }
        }
    }
}
