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

            /** LiveActionKind enum. */
            enum LiveActionKind {

                /** LIVE_ACTION_KIND_UNSPECIFIED value */
                LIVE_ACTION_KIND_UNSPECIFIED = 0,

                /** LIVE_ACTION_KIND_STOP value */
                LIVE_ACTION_KIND_STOP = 1,

                /** LIVE_ACTION_KIND_MOVE value */
                LIVE_ACTION_KIND_MOVE = 2,

                /** LIVE_ACTION_KIND_ATTACK value */
                LIVE_ACTION_KIND_ATTACK = 3
            }

            /** MovePolicy enum. */
            enum MovePolicy {

                /** MOVE_POLICY_UNSPECIFIED value */
                MOVE_POLICY_UNSPECIFIED = 0,

                /** MOVE_POLICY_REPLACE value */
                MOVE_POLICY_REPLACE = 1,

                /** MOVE_POLICY_APPEND value */
                MOVE_POLICY_APPEND = 2
            }

            /** LiveInputSource enum. */
            enum LiveInputSource {

                /** LIVE_INPUT_SOURCE_UNSPECIFIED value */
                LIVE_INPUT_SOURCE_UNSPECIFIED = 0,

                /** LIVE_INPUT_SOURCE_POINTER value */
                LIVE_INPUT_SOURCE_POINTER = 1,

                /** LIVE_INPUT_SOURCE_KEYBOARD value */
                LIVE_INPUT_SOURCE_KEYBOARD = 2
            }

            /** ControllerStage enum. */
            enum ControllerStage {

                /** CONTROLLER_STAGE_UNSPECIFIED value */
                CONTROLLER_STAGE_UNSPECIFIED = 0,

                /** CONTROLLER_STAGE_ARM_REQUESTED value */
                CONTROLLER_STAGE_ARM_REQUESTED = 1,

                /** CONTROLLER_STAGE_ARM_NATIVE_CONFIRMED value */
                CONTROLLER_STAGE_ARM_NATIVE_CONFIRMED = 2,

                /** CONTROLLER_STAGE_REVOKE_REQUESTED value */
                CONTROLLER_STAGE_REVOKE_REQUESTED = 3,

                /** CONTROLLER_STAGE_REVOKE_NATIVE_CONFIRMED value */
                CONTROLLER_STAGE_REVOKE_NATIVE_CONFIRMED = 4,

                /** CONTROLLER_STAGE_EXPIRED value */
                CONTROLLER_STAGE_EXPIRED = 5,

                /** CONTROLLER_STAGE_REFUSED value */
                CONTROLLER_STAGE_REFUSED = 6,

                /** CONTROLLER_STAGE_UNAVAILABLE value */
                CONTROLLER_STAGE_UNAVAILABLE = 7
            }

            /** LiveResultStage enum. */
            enum LiveResultStage {

                /** LIVE_RESULT_STAGE_UNSPECIFIED value */
                LIVE_RESULT_STAGE_UNSPECIFIED = 0,

                /** LIVE_RESULT_STAGE_BROKER_ADMISSION value */
                LIVE_RESULT_STAGE_BROKER_ADMISSION = 1,

                /** LIVE_RESULT_STAGE_NATIVE_ADMISSION value */
                LIVE_RESULT_STAGE_NATIVE_ADMISSION = 2,

                /** LIVE_RESULT_STAGE_NATIVE_DISPATCH value */
                LIVE_RESULT_STAGE_NATIVE_DISPATCH = 3,

                /** LIVE_RESULT_STAGE_UNKNOWN value */
                LIVE_RESULT_STAGE_UNKNOWN = 4
            }

            /** LiveResultStatus enum. */
            enum LiveResultStatus {

                /** LIVE_RESULT_STATUS_UNSPECIFIED value */
                LIVE_RESULT_STATUS_UNSPECIFIED = 0,

                /** LIVE_RESULT_STATUS_ACCEPTED value */
                LIVE_RESULT_STATUS_ACCEPTED = 1,

                /** LIVE_RESULT_STATUS_REJECTED value */
                LIVE_RESULT_STATUS_REJECTED = 2,

                /** LIVE_RESULT_STATUS_APPLIED value */
                LIVE_RESULT_STATUS_APPLIED = 3,

                /** LIVE_RESULT_STATUS_SKIPPED value */
                LIVE_RESULT_STATUS_SKIPPED = 4,

                /** LIVE_RESULT_STATUS_EXPIRED value */
                LIVE_RESULT_STATUS_EXPIRED = 5,

                /** LIVE_RESULT_STATUS_UNKNOWN value */
                LIVE_RESULT_STATUS_UNKNOWN = 6
            }

            /** LiveResultDisposition enum. */
            enum LiveResultDisposition {

                /** LIVE_RESULT_DISPOSITION_UNSPECIFIED value */
                LIVE_RESULT_DISPOSITION_UNSPECIFIED = 0,

                /** LIVE_RESULT_DISPOSITION_RECORDED value */
                LIVE_RESULT_DISPOSITION_RECORDED = 1,

                /** LIVE_RESULT_DISPOSITION_DUPLICATE value */
                LIVE_RESULT_DISPOSITION_DUPLICATE = 2,

                /** LIVE_RESULT_DISPOSITION_LATE value */
                LIVE_RESULT_DISPOSITION_LATE = 3
            }

            /**
             * Properties of a UnitReference.
             * @deprecated Use barc.browser.v1.UnitReference.$Properties instead.
             */
            interface IUnitReference extends barc.browser.v1.UnitReference.$Properties {
            }

            /** Represents a UnitReference. */
            class UnitReference {

                /**
                 * Constructs a new UnitReference.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.UnitReference.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** UnitReference id. */
                id: Long;

                /** UnitReference lifetime. */
                lifetime: Long;

                /**
                 * Encodes the specified UnitReference message. Does not implicitly {@link barc.browser.v1.UnitReference.verify|verify} messages.
                 * @param message UnitReference message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.UnitReference.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified UnitReference message, length delimited. Does not implicitly {@link barc.browser.v1.UnitReference.verify|verify} messages.
                 * @param message UnitReference message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.UnitReference.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a UnitReference message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.UnitReference & barc.browser.v1.UnitReference.$Shape} UnitReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.UnitReference & barc.browser.v1.UnitReference.$Shape;

                /**
                 * Decodes a UnitReference message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.UnitReference & barc.browser.v1.UnitReference.$Shape} UnitReference
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.UnitReference & barc.browser.v1.UnitReference.$Shape;

                /**
                 * Creates a UnitReference message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns UnitReference
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.UnitReference;

                /**
                 * Creates a plain object from a UnitReference message. Also converts values to other types if specified.
                 * @param message UnitReference
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.UnitReference, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this UnitReference to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for UnitReference
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace UnitReference {

                /** Properties of a UnitReference. */
                interface $Properties {

                    /** UnitReference id */
                    id?: (Long|null);

                    /** UnitReference lifetime */
                    lifetime?: (Long|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a UnitReference. */
                type $Shape = barc.browser.v1.UnitReference.$Properties;
            }

            /**
             * Properties of an ObservationBasis.
             * @deprecated Use barc.browser.v1.ObservationBasis.$Properties instead.
             */
            interface IObservationBasis extends barc.browser.v1.ObservationBasis.$Properties {
            }

            /** Represents an ObservationBasis. */
            class ObservationBasis {

                /**
                 * Constructs a new ObservationBasis.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.ObservationBasis.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** ObservationBasis token. */
                token: Uint8Array;

                /** ObservationBasis stateSequence. */
                stateSequence: Long;

                /** ObservationBasis nativeFrame. */
                nativeFrame: number;

                /** ObservationBasis matchId. */
                matchId: Uint8Array;

                /** ObservationBasis processIncarnation. */
                processIncarnation: string;

                /** ObservationBasis stateChannelIncarnation. */
                stateChannelIncarnation: string;

                /**
                 * Encodes the specified ObservationBasis message. Does not implicitly {@link barc.browser.v1.ObservationBasis.verify|verify} messages.
                 * @param message ObservationBasis message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.ObservationBasis.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ObservationBasis message, length delimited. Does not implicitly {@link barc.browser.v1.ObservationBasis.verify|verify} messages.
                 * @param message ObservationBasis message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.ObservationBasis.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an ObservationBasis message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ObservationBasis & barc.browser.v1.ObservationBasis.$Shape} ObservationBasis
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.ObservationBasis & barc.browser.v1.ObservationBasis.$Shape;

                /**
                 * Decodes an ObservationBasis message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ObservationBasis & barc.browser.v1.ObservationBasis.$Shape} ObservationBasis
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.ObservationBasis & barc.browser.v1.ObservationBasis.$Shape;

                /**
                 * Creates an ObservationBasis message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ObservationBasis
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.ObservationBasis;

                /**
                 * Creates a plain object from an ObservationBasis message. Also converts values to other types if specified.
                 * @param message ObservationBasis
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.ObservationBasis, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ObservationBasis to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for ObservationBasis
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace ObservationBasis {

                /** Properties of an ObservationBasis. */
                interface $Properties {

                    /** ObservationBasis token */
                    token?: (Uint8Array|null);

                    /** ObservationBasis stateSequence */
                    stateSequence?: (Long|null);

                    /** ObservationBasis nativeFrame */
                    nativeFrame?: (number|null);

                    /** ObservationBasis matchId */
                    matchId?: (Uint8Array|null);

                    /** ObservationBasis processIncarnation */
                    processIncarnation?: (string|null);

                    /** ObservationBasis stateChannelIncarnation */
                    stateChannelIncarnation?: (string|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of an ObservationBasis. */
                type $Shape = barc.browser.v1.ObservationBasis.$Properties;
            }

            /**
             * Properties of a LiveModuleIdentity.
             * @deprecated Use barc.browser.v1.LiveModuleIdentity.$Properties instead.
             */
            interface ILiveModuleIdentity extends barc.browser.v1.LiveModuleIdentity.$Properties {
            }

            /** Represents a LiveModuleIdentity. */
            class LiveModuleIdentity {

                /**
                 * Constructs a new LiveModuleIdentity.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.LiveModuleIdentity.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** LiveModuleIdentity sha256. */
                sha256: Uint8Array;

                /** LiveModuleIdentity generation. */
                generation: Long;

                /**
                 * Encodes the specified LiveModuleIdentity message. Does not implicitly {@link barc.browser.v1.LiveModuleIdentity.verify|verify} messages.
                 * @param message LiveModuleIdentity message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.LiveModuleIdentity.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LiveModuleIdentity message, length delimited. Does not implicitly {@link barc.browser.v1.LiveModuleIdentity.verify|verify} messages.
                 * @param message LiveModuleIdentity message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.LiveModuleIdentity.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LiveModuleIdentity message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveModuleIdentity & barc.browser.v1.LiveModuleIdentity.$Shape} LiveModuleIdentity
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.LiveModuleIdentity & barc.browser.v1.LiveModuleIdentity.$Shape;

                /**
                 * Decodes a LiveModuleIdentity message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveModuleIdentity & barc.browser.v1.LiveModuleIdentity.$Shape} LiveModuleIdentity
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.LiveModuleIdentity & barc.browser.v1.LiveModuleIdentity.$Shape;

                /**
                 * Creates a LiveModuleIdentity message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LiveModuleIdentity
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.LiveModuleIdentity;

                /**
                 * Creates a plain object from a LiveModuleIdentity message. Also converts values to other types if specified.
                 * @param message LiveModuleIdentity
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.LiveModuleIdentity, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LiveModuleIdentity to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for LiveModuleIdentity
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace LiveModuleIdentity {

                /** Properties of a LiveModuleIdentity. */
                interface $Properties {

                    /** LiveModuleIdentity sha256 */
                    sha256?: (Uint8Array|null);

                    /** LiveModuleIdentity generation */
                    generation?: (Long|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a LiveModuleIdentity. */
                type $Shape = barc.browser.v1.LiveModuleIdentity.$Properties;
            }

            /**
             * Properties of a MapBounds.
             * @deprecated Use barc.browser.v1.MapBounds.$Properties instead.
             */
            interface IMapBounds extends barc.browser.v1.MapBounds.$Properties {
            }

            /** Represents a MapBounds. */
            class MapBounds {

                /**
                 * Constructs a new MapBounds.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.MapBounds.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** MapBounds minX. */
                minX: number;

                /** MapBounds maxX. */
                maxX: number;

                /** MapBounds minZ. */
                minZ: number;

                /** MapBounds maxZ. */
                maxZ: number;

                /** MapBounds terrainElevationAvailable. */
                terrainElevationAvailable: boolean;

                /**
                 * Encodes the specified MapBounds message. Does not implicitly {@link barc.browser.v1.MapBounds.verify|verify} messages.
                 * @param message MapBounds message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.MapBounds.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MapBounds message, length delimited. Does not implicitly {@link barc.browser.v1.MapBounds.verify|verify} messages.
                 * @param message MapBounds message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.MapBounds.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MapBounds message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.MapBounds & barc.browser.v1.MapBounds.$Shape} MapBounds
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.MapBounds & barc.browser.v1.MapBounds.$Shape;

                /**
                 * Decodes a MapBounds message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.MapBounds & barc.browser.v1.MapBounds.$Shape} MapBounds
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.MapBounds & barc.browser.v1.MapBounds.$Shape;

                /**
                 * Creates a MapBounds message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MapBounds
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.MapBounds;

                /**
                 * Creates a plain object from a MapBounds message. Also converts values to other types if specified.
                 * @param message MapBounds
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.MapBounds, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MapBounds to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for MapBounds
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace MapBounds {

                /** Properties of a MapBounds. */
                interface $Properties {

                    /** MapBounds minX */
                    minX?: (number|null);

                    /** MapBounds maxX */
                    maxX?: (number|null);

                    /** MapBounds minZ */
                    minZ?: (number|null);

                    /** MapBounds maxZ */
                    maxZ?: (number|null);

                    /** MapBounds terrainElevationAvailable */
                    terrainElevationAvailable?: (boolean|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a MapBounds. */
                type $Shape = barc.browser.v1.MapBounds.$Properties;
            }

            /**
             * Properties of a LiveLimits.
             * @deprecated Use barc.browser.v1.LiveLimits.$Properties instead.
             */
            interface ILiveLimits extends barc.browser.v1.LiveLimits.$Properties {
            }

            /** Represents a LiveLimits. */
            class LiveLimits {

                /**
                 * Constructs a new LiveLimits.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.LiveLimits.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** LiveLimits maxActorCount. */
                maxActorCount: number;

                /** LiveLimits maxInputBytes. */
                maxInputBytes: number;

                /** LiveLimits maxOutputBytes. */
                maxOutputBytes: number;

                /** LiveLimits maxFrameBytes. */
                maxFrameBytes: number;

                /** LiveLimits maxPendingInputs. */
                maxPendingInputs: number;

                /** LiveLimits maxModuleBytes. */
                maxModuleBytes: number;

                /** LiveLimits guestPhaseTimeoutMs. */
                guestPhaseTimeoutMs: number;

                /** LiveLimits maxObservationAgeMs. */
                maxObservationAgeMs: number;

                /** LiveLimits liveSnapshotCadenceFrames. */
                liveSnapshotCadenceFrames: number;

                /** LiveLimits maxNativeUnitId. */
                maxNativeUnitId: number;

                /** LiveLimits maxPendingParents. */
                maxPendingParents: number;

                /** LiveLimits maxRetainedResults. */
                maxRetainedResults: number;

                /**
                 * Encodes the specified LiveLimits message. Does not implicitly {@link barc.browser.v1.LiveLimits.verify|verify} messages.
                 * @param message LiveLimits message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.LiveLimits.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LiveLimits message, length delimited. Does not implicitly {@link barc.browser.v1.LiveLimits.verify|verify} messages.
                 * @param message LiveLimits message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.LiveLimits.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LiveLimits message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveLimits & barc.browser.v1.LiveLimits.$Shape} LiveLimits
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.LiveLimits & barc.browser.v1.LiveLimits.$Shape;

                /**
                 * Decodes a LiveLimits message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveLimits & barc.browser.v1.LiveLimits.$Shape} LiveLimits
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.LiveLimits & barc.browser.v1.LiveLimits.$Shape;

                /**
                 * Creates a LiveLimits message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LiveLimits
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.LiveLimits;

                /**
                 * Creates a plain object from a LiveLimits message. Also converts values to other types if specified.
                 * @param message LiveLimits
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.LiveLimits, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LiveLimits to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for LiveLimits
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace LiveLimits {

                /** Properties of a LiveLimits. */
                interface $Properties {

                    /** LiveLimits maxActorCount */
                    maxActorCount?: (number|null);

                    /** LiveLimits maxInputBytes */
                    maxInputBytes?: (number|null);

                    /** LiveLimits maxOutputBytes */
                    maxOutputBytes?: (number|null);

                    /** LiveLimits maxFrameBytes */
                    maxFrameBytes?: (number|null);

                    /** LiveLimits maxPendingInputs */
                    maxPendingInputs?: (number|null);

                    /** LiveLimits maxModuleBytes */
                    maxModuleBytes?: (number|null);

                    /** LiveLimits guestPhaseTimeoutMs */
                    guestPhaseTimeoutMs?: (number|null);

                    /** LiveLimits maxObservationAgeMs */
                    maxObservationAgeMs?: (number|null);

                    /** LiveLimits liveSnapshotCadenceFrames */
                    liveSnapshotCadenceFrames?: (number|null);

                    /** LiveLimits maxNativeUnitId */
                    maxNativeUnitId?: (number|null);

                    /** LiveLimits maxPendingParents */
                    maxPendingParents?: (number|null);

                    /** LiveLimits maxRetainedResults */
                    maxRetainedResults?: (number|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a LiveLimits. */
                type $Shape = barc.browser.v1.LiveLimits.$Properties;
            }

            /**
             * Properties of a LiveCapabilities.
             * @deprecated Use barc.browser.v1.LiveCapabilities.$Properties instead.
             */
            interface ILiveCapabilities extends barc.browser.v1.LiveCapabilities.$Properties {
            }

            /** Represents a LiveCapabilities. */
            class LiveCapabilities {

                /**
                 * Constructs a new LiveCapabilities.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.LiveCapabilities.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** LiveCapabilities stop. */
                stop: boolean;

                /** LiveCapabilities move. */
                move: boolean;

                /** LiveCapabilities attackVisibleUnit. */
                attackVisibleUnit: boolean;

                /** LiveCapabilities mapBounds. */
                mapBounds?: (barc.browser.v1.MapBounds.$Properties|null);

                /**
                 * Encodes the specified LiveCapabilities message. Does not implicitly {@link barc.browser.v1.LiveCapabilities.verify|verify} messages.
                 * @param message LiveCapabilities message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.LiveCapabilities.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LiveCapabilities message, length delimited. Does not implicitly {@link barc.browser.v1.LiveCapabilities.verify|verify} messages.
                 * @param message LiveCapabilities message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.LiveCapabilities.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LiveCapabilities message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveCapabilities & barc.browser.v1.LiveCapabilities.$Shape} LiveCapabilities
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.LiveCapabilities & barc.browser.v1.LiveCapabilities.$Shape;

                /**
                 * Decodes a LiveCapabilities message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveCapabilities & barc.browser.v1.LiveCapabilities.$Shape} LiveCapabilities
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.LiveCapabilities & barc.browser.v1.LiveCapabilities.$Shape;

                /**
                 * Creates a LiveCapabilities message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LiveCapabilities
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.LiveCapabilities;

                /**
                 * Creates a plain object from a LiveCapabilities message. Also converts values to other types if specified.
                 * @param message LiveCapabilities
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.LiveCapabilities, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LiveCapabilities to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for LiveCapabilities
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace LiveCapabilities {

                /** Properties of a LiveCapabilities. */
                interface $Properties {

                    /** LiveCapabilities stop */
                    stop?: (boolean|null);

                    /** LiveCapabilities move */
                    move?: (boolean|null);

                    /** LiveCapabilities attackVisibleUnit */
                    attackVisibleUnit?: (boolean|null);

                    /** LiveCapabilities mapBounds */
                    mapBounds?: (barc.browser.v1.MapBounds.$Properties|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a LiveCapabilities. */
                type $Shape = barc.browser.v1.LiveCapabilities.$Properties;
            }

            /**
             * Properties of a ControllerIdentity.
             * @deprecated Use barc.browser.v1.ControllerIdentity.$Properties instead.
             */
            interface IControllerIdentity extends barc.browser.v1.ControllerIdentity.$Properties {
            }

            /** Represents a ControllerIdentity. */
            class ControllerIdentity {

                /**
                 * Constructs a new ControllerIdentity.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.ControllerIdentity.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** ControllerIdentity sessionId. */
                sessionId: Uint8Array;

                /** ControllerIdentity controllerId. */
                controllerId: Uint8Array;

                /** ControllerIdentity controllerIncarnation. */
                controllerIncarnation: string;

                /** ControllerIdentity authorityEpoch. */
                authorityEpoch: Long;

                /**
                 * Encodes the specified ControllerIdentity message. Does not implicitly {@link barc.browser.v1.ControllerIdentity.verify|verify} messages.
                 * @param message ControllerIdentity message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.ControllerIdentity.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ControllerIdentity message, length delimited. Does not implicitly {@link barc.browser.v1.ControllerIdentity.verify|verify} messages.
                 * @param message ControllerIdentity message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.ControllerIdentity.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ControllerIdentity message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ControllerIdentity & barc.browser.v1.ControllerIdentity.$Shape} ControllerIdentity
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.ControllerIdentity & barc.browser.v1.ControllerIdentity.$Shape;

                /**
                 * Decodes a ControllerIdentity message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ControllerIdentity & barc.browser.v1.ControllerIdentity.$Shape} ControllerIdentity
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.ControllerIdentity & barc.browser.v1.ControllerIdentity.$Shape;

                /**
                 * Creates a ControllerIdentity message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ControllerIdentity
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.ControllerIdentity;

                /**
                 * Creates a plain object from a ControllerIdentity message. Also converts values to other types if specified.
                 * @param message ControllerIdentity
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.ControllerIdentity, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ControllerIdentity to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for ControllerIdentity
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace ControllerIdentity {

                /** Properties of a ControllerIdentity. */
                interface $Properties {

                    /** ControllerIdentity sessionId */
                    sessionId?: (Uint8Array|null);

                    /** ControllerIdentity controllerId */
                    controllerId?: (Uint8Array|null);

                    /** ControllerIdentity controllerIncarnation */
                    controllerIncarnation?: (string|null);

                    /** ControllerIdentity authorityEpoch */
                    authorityEpoch?: (Long|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a ControllerIdentity. */
                type $Shape = barc.browser.v1.ControllerIdentity.$Properties;
            }

            /**
             * Properties of a LiveBootstrap.
             * @deprecated Use barc.browser.v1.LiveBootstrap.$Properties instead.
             */
            interface ILiveBootstrap extends barc.browser.v1.LiveBootstrap.$Properties {
            }

            /** Represents a LiveBootstrap. */
            class LiveBootstrap {

                /**
                 * Constructs a new LiveBootstrap.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.LiveBootstrap.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** LiveBootstrap preview. */
                preview?: (barc.browser.v1.Bootstrap.$Properties|null);

                /** LiveBootstrap liveProfile. */
                liveProfile: string;

                /** LiveBootstrap controller. */
                controller?: (barc.browser.v1.ControllerIdentity.$Properties|null);

                /** LiveBootstrap module. */
                module?: (barc.browser.v1.LiveModuleIdentity.$Properties|null);

                /** LiveBootstrap limits. */
                limits?: (barc.browser.v1.LiveLimits.$Properties|null);

                /** LiveBootstrap capabilities. */
                capabilities?: (barc.browser.v1.LiveCapabilities.$Properties|null);

                /**
                 * Encodes the specified LiveBootstrap message. Does not implicitly {@link barc.browser.v1.LiveBootstrap.verify|verify} messages.
                 * @param message LiveBootstrap message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.LiveBootstrap.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LiveBootstrap message, length delimited. Does not implicitly {@link barc.browser.v1.LiveBootstrap.verify|verify} messages.
                 * @param message LiveBootstrap message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.LiveBootstrap.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LiveBootstrap message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveBootstrap & barc.browser.v1.LiveBootstrap.$Shape} LiveBootstrap
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.LiveBootstrap & barc.browser.v1.LiveBootstrap.$Shape;

                /**
                 * Decodes a LiveBootstrap message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveBootstrap & barc.browser.v1.LiveBootstrap.$Shape} LiveBootstrap
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.LiveBootstrap & barc.browser.v1.LiveBootstrap.$Shape;

                /**
                 * Creates a LiveBootstrap message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LiveBootstrap
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.LiveBootstrap;

                /**
                 * Creates a plain object from a LiveBootstrap message. Also converts values to other types if specified.
                 * @param message LiveBootstrap
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.LiveBootstrap, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LiveBootstrap to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for LiveBootstrap
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace LiveBootstrap {

                /** Properties of a LiveBootstrap. */
                interface $Properties {

                    /** LiveBootstrap preview */
                    preview?: (barc.browser.v1.Bootstrap.$Properties|null);

                    /** LiveBootstrap liveProfile */
                    liveProfile?: (string|null);

                    /** LiveBootstrap controller */
                    controller?: (barc.browser.v1.ControllerIdentity.$Properties|null);

                    /** LiveBootstrap module */
                    module?: (barc.browser.v1.LiveModuleIdentity.$Properties|null);

                    /** LiveBootstrap limits */
                    limits?: (barc.browser.v1.LiveLimits.$Properties|null);

                    /** LiveBootstrap capabilities */
                    capabilities?: (barc.browser.v1.LiveCapabilities.$Properties|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a LiveBootstrap. */
                type $Shape = barc.browser.v1.LiveBootstrap.$Properties;
            }

            /**
             * Properties of a LiveObservedUnit.
             * @deprecated Use barc.browser.v1.LiveObservedUnit.$Properties instead.
             */
            interface ILiveObservedUnit extends barc.browser.v1.LiveObservedUnit.$Properties {
            }

            /** Represents a LiveObservedUnit. */
            class LiveObservedUnit {

                /**
                 * Constructs a new LiveObservedUnit.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.LiveObservedUnit.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** LiveObservedUnit reference. */
                reference?: (barc.browser.v1.UnitReference.$Properties|null);

                /** LiveObservedUnit observation. */
                observation: barc.browser.v1.ObservationKind;

                /**
                 * Encodes the specified LiveObservedUnit message. Does not implicitly {@link barc.browser.v1.LiveObservedUnit.verify|verify} messages.
                 * @param message LiveObservedUnit message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.LiveObservedUnit.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LiveObservedUnit message, length delimited. Does not implicitly {@link barc.browser.v1.LiveObservedUnit.verify|verify} messages.
                 * @param message LiveObservedUnit message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.LiveObservedUnit.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LiveObservedUnit message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveObservedUnit & barc.browser.v1.LiveObservedUnit.$Shape} LiveObservedUnit
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.LiveObservedUnit & barc.browser.v1.LiveObservedUnit.$Shape;

                /**
                 * Decodes a LiveObservedUnit message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveObservedUnit & barc.browser.v1.LiveObservedUnit.$Shape} LiveObservedUnit
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.LiveObservedUnit & barc.browser.v1.LiveObservedUnit.$Shape;

                /**
                 * Creates a LiveObservedUnit message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LiveObservedUnit
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.LiveObservedUnit;

                /**
                 * Creates a plain object from a LiveObservedUnit message. Also converts values to other types if specified.
                 * @param message LiveObservedUnit
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.LiveObservedUnit, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LiveObservedUnit to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for LiveObservedUnit
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace LiveObservedUnit {

                /** Properties of a LiveObservedUnit. */
                interface $Properties {

                    /** LiveObservedUnit reference */
                    reference?: (barc.browser.v1.UnitReference.$Properties|null);

                    /** LiveObservedUnit observation */
                    observation?: (barc.browser.v1.ObservationKind|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a LiveObservedUnit. */
                type $Shape = barc.browser.v1.LiveObservedUnit.$Properties;
            }

            /**
             * Properties of a LiveObservation.
             * @deprecated Use barc.browser.v1.LiveObservation.$Properties instead.
             */
            interface ILiveObservation extends barc.browser.v1.LiveObservation.$Properties {
            }

            /** Represents a LiveObservation. */
            class LiveObservation {

                /**
                 * Constructs a new LiveObservation.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.LiveObservation.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** LiveObservation preview. */
                preview?: (barc.browser.v1.Observation.$Properties|null);

                /** LiveObservation basis. */
                basis?: (barc.browser.v1.ObservationBasis.$Properties|null);

                /** LiveObservation units. */
                units: barc.browser.v1.LiveObservedUnit.$Properties[];

                /**
                 * Encodes the specified LiveObservation message. Does not implicitly {@link barc.browser.v1.LiveObservation.verify|verify} messages.
                 * @param message LiveObservation message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.LiveObservation.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LiveObservation message, length delimited. Does not implicitly {@link barc.browser.v1.LiveObservation.verify|verify} messages.
                 * @param message LiveObservation message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.LiveObservation.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LiveObservation message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveObservation & barc.browser.v1.LiveObservation.$Shape} LiveObservation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.LiveObservation & barc.browser.v1.LiveObservation.$Shape;

                /**
                 * Decodes a LiveObservation message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveObservation & barc.browser.v1.LiveObservation.$Shape} LiveObservation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.LiveObservation & barc.browser.v1.LiveObservation.$Shape;

                /**
                 * Creates a LiveObservation message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LiveObservation
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.LiveObservation;

                /**
                 * Creates a plain object from a LiveObservation message. Also converts values to other types if specified.
                 * @param message LiveObservation
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.LiveObservation, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LiveObservation to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for LiveObservation
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace LiveObservation {

                /** Properties of a LiveObservation. */
                interface $Properties {

                    /** LiveObservation preview */
                    preview?: (barc.browser.v1.Observation.$Properties|null);

                    /** LiveObservation basis */
                    basis?: (barc.browser.v1.ObservationBasis.$Properties|null);

                    /** LiveObservation units */
                    units?: (barc.browser.v1.LiveObservedUnit.$Properties[]|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a LiveObservation. */
                type $Shape = barc.browser.v1.LiveObservation.$Properties;
            }

            /**
             * Properties of a StopAction.
             * @deprecated Use barc.browser.v1.StopAction.$Properties instead.
             */
            interface IStopAction extends barc.browser.v1.StopAction.$Properties {
            }

            /** Represents a StopAction. */
            class StopAction {

                /**
                 * Constructs a new StopAction.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.StopAction.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /**
                 * Encodes the specified StopAction message. Does not implicitly {@link barc.browser.v1.StopAction.verify|verify} messages.
                 * @param message StopAction message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.StopAction.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified StopAction message, length delimited. Does not implicitly {@link barc.browser.v1.StopAction.verify|verify} messages.
                 * @param message StopAction message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.StopAction.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a StopAction message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.StopAction & barc.browser.v1.StopAction.$Shape} StopAction
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.StopAction & barc.browser.v1.StopAction.$Shape;

                /**
                 * Decodes a StopAction message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.StopAction & barc.browser.v1.StopAction.$Shape} StopAction
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.StopAction & barc.browser.v1.StopAction.$Shape;

                /**
                 * Creates a StopAction message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns StopAction
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.StopAction;

                /**
                 * Creates a plain object from a StopAction message. Also converts values to other types if specified.
                 * @param message StopAction
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.StopAction, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this StopAction to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for StopAction
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace StopAction {

                /** Properties of a StopAction. */
                interface $Properties {

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a StopAction. */
                type $Shape = barc.browser.v1.StopAction.$Properties;
            }

            /**
             * Properties of a MoveTarget.
             * @deprecated Use barc.browser.v1.MoveTarget.$Properties instead.
             */
            interface IMoveTarget extends barc.browser.v1.MoveTarget.$Properties {
            }

            /** Represents a MoveTarget. */
            class MoveTarget {

                /**
                 * Constructs a new MoveTarget.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.MoveTarget.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** MoveTarget position. */
                position?: (barc.browser.v1.Position3.$Properties|null);

                /** MoveTarget policy. */
                policy: barc.browser.v1.MovePolicy;

                /**
                 * Encodes the specified MoveTarget message. Does not implicitly {@link barc.browser.v1.MoveTarget.verify|verify} messages.
                 * @param message MoveTarget message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.MoveTarget.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MoveTarget message, length delimited. Does not implicitly {@link barc.browser.v1.MoveTarget.verify|verify} messages.
                 * @param message MoveTarget message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.MoveTarget.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MoveTarget message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.MoveTarget & barc.browser.v1.MoveTarget.$Shape} MoveTarget
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.MoveTarget & barc.browser.v1.MoveTarget.$Shape;

                /**
                 * Decodes a MoveTarget message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.MoveTarget & barc.browser.v1.MoveTarget.$Shape} MoveTarget
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.MoveTarget & barc.browser.v1.MoveTarget.$Shape;

                /**
                 * Creates a MoveTarget message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MoveTarget
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.MoveTarget;

                /**
                 * Creates a plain object from a MoveTarget message. Also converts values to other types if specified.
                 * @param message MoveTarget
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.MoveTarget, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MoveTarget to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for MoveTarget
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace MoveTarget {

                /** Properties of a MoveTarget. */
                interface $Properties {

                    /** MoveTarget position */
                    position?: (barc.browser.v1.Position3.$Properties|null);

                    /** MoveTarget policy */
                    policy?: (barc.browser.v1.MovePolicy|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a MoveTarget. */
                type $Shape = barc.browser.v1.MoveTarget.$Properties;
            }

            /**
             * Properties of an AttackTarget.
             * @deprecated Use barc.browser.v1.AttackTarget.$Properties instead.
             */
            interface IAttackTarget extends barc.browser.v1.AttackTarget.$Properties {
            }

            /** Represents an AttackTarget. */
            class AttackTarget {

                /**
                 * Constructs a new AttackTarget.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.AttackTarget.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** AttackTarget target. */
                target?: (barc.browser.v1.UnitReference.$Properties|null);

                /**
                 * Encodes the specified AttackTarget message. Does not implicitly {@link barc.browser.v1.AttackTarget.verify|verify} messages.
                 * @param message AttackTarget message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.AttackTarget.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified AttackTarget message, length delimited. Does not implicitly {@link barc.browser.v1.AttackTarget.verify|verify} messages.
                 * @param message AttackTarget message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.AttackTarget.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an AttackTarget message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.AttackTarget & barc.browser.v1.AttackTarget.$Shape} AttackTarget
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.AttackTarget & barc.browser.v1.AttackTarget.$Shape;

                /**
                 * Decodes an AttackTarget message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.AttackTarget & barc.browser.v1.AttackTarget.$Shape} AttackTarget
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.AttackTarget & barc.browser.v1.AttackTarget.$Shape;

                /**
                 * Creates an AttackTarget message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns AttackTarget
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.AttackTarget;

                /**
                 * Creates a plain object from an AttackTarget message. Also converts values to other types if specified.
                 * @param message AttackTarget
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.AttackTarget, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this AttackTarget to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for AttackTarget
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace AttackTarget {

                /** Properties of an AttackTarget. */
                interface $Properties {

                    /** AttackTarget target */
                    target?: (barc.browser.v1.UnitReference.$Properties|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of an AttackTarget. */
                type $Shape = barc.browser.v1.AttackTarget.$Properties;
            }

            /**
             * Properties of a LiveIntent.
             * @deprecated Use barc.browser.v1.LiveIntent.$Properties instead.
             */
            interface ILiveIntent extends barc.browser.v1.LiveIntent.$Properties {
            }

            /** Represents a LiveIntent. */
            class LiveIntent {

                /**
                 * Constructs a new LiveIntent.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.LiveIntent.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** LiveIntent actors. */
                actors: barc.browser.v1.UnitReference.$Properties[];

                /** LiveIntent stop. */
                stop?: (barc.browser.v1.StopAction.$Properties|null);

                /** LiveIntent move. */
                move?: (barc.browser.v1.MoveTarget.$Properties|null);

                /** LiveIntent attack. */
                attack?: (barc.browser.v1.AttackTarget.$Properties|null);

                /** LiveIntent action. */
                action?: ("stop"|"move"|"attack");

                /**
                 * Encodes the specified LiveIntent message. Does not implicitly {@link barc.browser.v1.LiveIntent.verify|verify} messages.
                 * @param message LiveIntent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.LiveIntent.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LiveIntent message, length delimited. Does not implicitly {@link barc.browser.v1.LiveIntent.verify|verify} messages.
                 * @param message LiveIntent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.LiveIntent.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LiveIntent message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveIntent & barc.browser.v1.LiveIntent.$Shape} LiveIntent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.LiveIntent & barc.browser.v1.LiveIntent.$Shape;

                /**
                 * Decodes a LiveIntent message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveIntent & barc.browser.v1.LiveIntent.$Shape} LiveIntent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.LiveIntent & barc.browser.v1.LiveIntent.$Shape;

                /**
                 * Creates a LiveIntent message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LiveIntent
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.LiveIntent;

                /**
                 * Creates a plain object from a LiveIntent message. Also converts values to other types if specified.
                 * @param message LiveIntent
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.LiveIntent, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LiveIntent to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for LiveIntent
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace LiveIntent {

                /** Properties of a LiveIntent. */
                interface $Properties {

                    /** LiveIntent actors */
                    actors?: (barc.browser.v1.UnitReference.$Properties[]|null);

                    /** LiveIntent stop */
                    stop?: (barc.browser.v1.StopAction.$Properties|null);

                    /** LiveIntent move */
                    move?: (barc.browser.v1.MoveTarget.$Properties|null);

                    /** LiveIntent attack */
                    attack?: (barc.browser.v1.AttackTarget.$Properties|null);

                    /** LiveIntent action */
                    action?: ("stop"|"move"|"attack");

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Narrowed shape of a LiveIntent. */
                type $Shape = {
                  actors?: barc.browser.v1.UnitReference.$Shape[]|null;
                  stop?: barc.browser.v1.StopAction.$Shape|null;
                  move?: barc.browser.v1.MoveTarget.$Shape|null;
                  attack?: barc.browser.v1.AttackTarget.$Shape|null;
                  $unknowns?: Uint8Array[];
                } & (
                  ({ action?: undefined; stop?: null; move?: null; attack?: null }|{ action?: "stop"; stop: barc.browser.v1.StopAction.$Shape; move?: null; attack?: null }|{ action?: "move"; stop?: null; move: barc.browser.v1.MoveTarget.$Shape; attack?: null }|{ action?: "attack"; stop?: null; move?: null; attack: barc.browser.v1.AttackTarget.$Shape })
                );
            }

            /**
             * Properties of a LiveInputModifiers.
             * @deprecated Use barc.browser.v1.LiveInputModifiers.$Properties instead.
             */
            interface ILiveInputModifiers extends barc.browser.v1.LiveInputModifiers.$Properties {
            }

            /** Represents a LiveInputModifiers. */
            class LiveInputModifiers {

                /**
                 * Constructs a new LiveInputModifiers.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.LiveInputModifiers.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** LiveInputModifiers shift. */
                shift: boolean;

                /** LiveInputModifiers control. */
                control: boolean;

                /** LiveInputModifiers alt. */
                alt: boolean;

                /**
                 * Encodes the specified LiveInputModifiers message. Does not implicitly {@link barc.browser.v1.LiveInputModifiers.verify|verify} messages.
                 * @param message LiveInputModifiers message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.LiveInputModifiers.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LiveInputModifiers message, length delimited. Does not implicitly {@link barc.browser.v1.LiveInputModifiers.verify|verify} messages.
                 * @param message LiveInputModifiers message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.LiveInputModifiers.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LiveInputModifiers message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveInputModifiers & barc.browser.v1.LiveInputModifiers.$Shape} LiveInputModifiers
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.LiveInputModifiers & barc.browser.v1.LiveInputModifiers.$Shape;

                /**
                 * Decodes a LiveInputModifiers message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveInputModifiers & barc.browser.v1.LiveInputModifiers.$Shape} LiveInputModifiers
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.LiveInputModifiers & barc.browser.v1.LiveInputModifiers.$Shape;

                /**
                 * Creates a LiveInputModifiers message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LiveInputModifiers
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.LiveInputModifiers;

                /**
                 * Creates a plain object from a LiveInputModifiers message. Also converts values to other types if specified.
                 * @param message LiveInputModifiers
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.LiveInputModifiers, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LiveInputModifiers to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for LiveInputModifiers
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace LiveInputModifiers {

                /** Properties of a LiveInputModifiers. */
                interface $Properties {

                    /** LiveInputModifiers shift */
                    shift?: (boolean|null);

                    /** LiveInputModifiers control */
                    control?: (boolean|null);

                    /** LiveInputModifiers alt */
                    alt?: (boolean|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a LiveInputModifiers. */
                type $Shape = barc.browser.v1.LiveInputModifiers.$Properties;
            }

            /**
             * Properties of a LiveActorSelection.
             * @deprecated Use barc.browser.v1.LiveActorSelection.$Properties instead.
             */
            interface ILiveActorSelection extends barc.browser.v1.LiveActorSelection.$Properties {
            }

            /** Represents a LiveActorSelection. */
            class LiveActorSelection {

                /**
                 * Constructs a new LiveActorSelection.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.LiveActorSelection.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** LiveActorSelection actors. */
                actors: barc.browser.v1.UnitReference.$Properties[];

                /**
                 * Encodes the specified LiveActorSelection message. Does not implicitly {@link barc.browser.v1.LiveActorSelection.verify|verify} messages.
                 * @param message LiveActorSelection message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.LiveActorSelection.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LiveActorSelection message, length delimited. Does not implicitly {@link barc.browser.v1.LiveActorSelection.verify|verify} messages.
                 * @param message LiveActorSelection message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.LiveActorSelection.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LiveActorSelection message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveActorSelection & barc.browser.v1.LiveActorSelection.$Shape} LiveActorSelection
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.LiveActorSelection & barc.browser.v1.LiveActorSelection.$Shape;

                /**
                 * Decodes a LiveActorSelection message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveActorSelection & barc.browser.v1.LiveActorSelection.$Shape} LiveActorSelection
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.LiveActorSelection & barc.browser.v1.LiveActorSelection.$Shape;

                /**
                 * Creates a LiveActorSelection message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LiveActorSelection
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.LiveActorSelection;

                /**
                 * Creates a plain object from a LiveActorSelection message. Also converts values to other types if specified.
                 * @param message LiveActorSelection
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.LiveActorSelection, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LiveActorSelection to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for LiveActorSelection
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace LiveActorSelection {

                /** Properties of a LiveActorSelection. */
                interface $Properties {

                    /** LiveActorSelection actors */
                    actors?: (barc.browser.v1.UnitReference.$Properties[]|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a LiveActorSelection. */
                type $Shape = barc.browser.v1.LiveActorSelection.$Properties;
            }

            /**
             * Properties of a LiveManualInput.
             * @deprecated Use barc.browser.v1.LiveManualInput.$Properties instead.
             */
            interface ILiveManualInput extends barc.browser.v1.LiveManualInput.$Properties {
            }

            /** Represents a LiveManualInput. */
            class LiveManualInput {

                /**
                 * Constructs a new LiveManualInput.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.LiveManualInput.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** LiveManualInput source. */
                source: barc.browser.v1.LiveInputSource;

                /** LiveManualInput modifiers. */
                modifiers?: (barc.browser.v1.LiveInputModifiers.$Properties|null);

                /** LiveManualInput select. */
                select?: (barc.browser.v1.LiveActorSelection.$Properties|null);

                /** LiveManualInput action. */
                action?: (barc.browser.v1.LiveIntent.$Properties|null);

                /** LiveManualInput input. */
                input?: ("select"|"action");

                /**
                 * Encodes the specified LiveManualInput message. Does not implicitly {@link barc.browser.v1.LiveManualInput.verify|verify} messages.
                 * @param message LiveManualInput message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.LiveManualInput.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LiveManualInput message, length delimited. Does not implicitly {@link barc.browser.v1.LiveManualInput.verify|verify} messages.
                 * @param message LiveManualInput message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.LiveManualInput.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LiveManualInput message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveManualInput & barc.browser.v1.LiveManualInput.$Shape} LiveManualInput
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.LiveManualInput & barc.browser.v1.LiveManualInput.$Shape;

                /**
                 * Decodes a LiveManualInput message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveManualInput & barc.browser.v1.LiveManualInput.$Shape} LiveManualInput
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.LiveManualInput & barc.browser.v1.LiveManualInput.$Shape;

                /**
                 * Creates a LiveManualInput message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LiveManualInput
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.LiveManualInput;

                /**
                 * Creates a plain object from a LiveManualInput message. Also converts values to other types if specified.
                 * @param message LiveManualInput
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.LiveManualInput, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LiveManualInput to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for LiveManualInput
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace LiveManualInput {

                /** Properties of a LiveManualInput. */
                interface $Properties {

                    /** LiveManualInput source */
                    source?: (barc.browser.v1.LiveInputSource|null);

                    /** LiveManualInput modifiers */
                    modifiers?: (barc.browser.v1.LiveInputModifiers.$Properties|null);

                    /** LiveManualInput select */
                    select?: (barc.browser.v1.LiveActorSelection.$Properties|null);

                    /** LiveManualInput action */
                    action?: (barc.browser.v1.LiveIntent.$Properties|null);

                    /** LiveManualInput input */
                    input?: ("select"|"action");

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Narrowed shape of a LiveManualInput. */
                type $Shape = {
                  source?: barc.browser.v1.LiveInputSource|null;
                  modifiers?: barc.browser.v1.LiveInputModifiers.$Shape|null;
                  select?: barc.browser.v1.LiveActorSelection.$Shape|null;
                  action?: barc.browser.v1.LiveIntent.$Shape|null;
                  $unknowns?: Uint8Array[];
                } & (
                  ({ input?: undefined; select?: null; action?: null }|{ input?: "select"; select: barc.browser.v1.LiveActorSelection.$Shape; action?: null }|{ input?: "action"; select?: null; action: barc.browser.v1.LiveIntent.$Shape })
                );
            }

            /**
             * Properties of a LiveResult.
             * @deprecated Use barc.browser.v1.LiveResult.$Properties instead.
             */
            interface ILiveResult extends barc.browser.v1.LiveResult.$Properties {
            }

            /** Represents a LiveResult. */
            class LiveResult {

                /**
                 * Constructs a new LiveResult.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.LiveResult.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** LiveResult resultSequence. */
                resultSequence: Long;

                /** LiveResult parentId. */
                parentId: Uint8Array;

                /** LiveResult inputId. */
                inputId: Uint8Array;

                /** LiveResult module. */
                module?: (barc.browser.v1.LiveModuleIdentity.$Properties|null);

                /** LiveResult basis. */
                basis?: (barc.browser.v1.ObservationBasis.$Properties|null);

                /** LiveResult controller. */
                controller?: (barc.browser.v1.ControllerIdentity.$Properties|null);

                /** LiveResult batchSequence. */
                batchSequence: Long;

                /** LiveResult correlationId. */
                correlationId: Long;

                /** LiveResult childIndex. */
                childIndex: number;

                /** LiveResult childCount. */
                childCount: number;

                /** LiveResult actor. */
                actor?: (barc.browser.v1.UnitReference.$Properties|null);

                /** LiveResult stage. */
                stage: barc.browser.v1.LiveResultStage;

                /** LiveResult status. */
                status: barc.browser.v1.LiveResultStatus;

                /** LiveResult disposition. */
                disposition: barc.browser.v1.LiveResultDisposition;

                /** LiveResult reason. */
                reason: string;

                /** LiveResult nativeFrame. */
                nativeFrame?: (number|null);

                /** LiveResult commandChannelIncarnation. */
                commandChannelIncarnation: string;

                /**
                 * Encodes the specified LiveResult message. Does not implicitly {@link barc.browser.v1.LiveResult.verify|verify} messages.
                 * @param message LiveResult message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.LiveResult.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LiveResult message, length delimited. Does not implicitly {@link barc.browser.v1.LiveResult.verify|verify} messages.
                 * @param message LiveResult message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.LiveResult.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LiveResult message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveResult & barc.browser.v1.LiveResult.$Shape} LiveResult
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.LiveResult & barc.browser.v1.LiveResult.$Shape;

                /**
                 * Decodes a LiveResult message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveResult & barc.browser.v1.LiveResult.$Shape} LiveResult
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.LiveResult & barc.browser.v1.LiveResult.$Shape;

                /**
                 * Creates a LiveResult message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LiveResult
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.LiveResult;

                /**
                 * Creates a plain object from a LiveResult message. Also converts values to other types if specified.
                 * @param message LiveResult
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.LiveResult, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LiveResult to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for LiveResult
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace LiveResult {

                /** Properties of a LiveResult. */
                interface $Properties {

                    /** LiveResult resultSequence */
                    resultSequence?: (Long|null);

                    /** LiveResult parentId */
                    parentId?: (Uint8Array|null);

                    /** LiveResult inputId */
                    inputId?: (Uint8Array|null);

                    /** LiveResult module */
                    module?: (barc.browser.v1.LiveModuleIdentity.$Properties|null);

                    /** LiveResult basis */
                    basis?: (barc.browser.v1.ObservationBasis.$Properties|null);

                    /** LiveResult controller */
                    controller?: (barc.browser.v1.ControllerIdentity.$Properties|null);

                    /** LiveResult batchSequence */
                    batchSequence?: (Long|null);

                    /** LiveResult correlationId */
                    correlationId?: (Long|null);

                    /** LiveResult childIndex */
                    childIndex?: (number|null);

                    /** LiveResult childCount */
                    childCount?: (number|null);

                    /** LiveResult actor */
                    actor?: (barc.browser.v1.UnitReference.$Properties|null);

                    /** LiveResult stage */
                    stage?: (barc.browser.v1.LiveResultStage|null);

                    /** LiveResult status */
                    status?: (barc.browser.v1.LiveResultStatus|null);

                    /** LiveResult disposition */
                    disposition?: (barc.browser.v1.LiveResultDisposition|null);

                    /** LiveResult reason */
                    reason?: (string|null);

                    /** LiveResult nativeFrame */
                    nativeFrame?: (number|null);

                    /** LiveResult commandChannelIncarnation */
                    commandChannelIncarnation?: (string|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a LiveResult. */
                type $Shape = barc.browser.v1.LiveResult.$Properties;
            }

            /**
             * Properties of a LiveGuestRequest.
             * @deprecated Use barc.browser.v1.LiveGuestRequest.$Properties instead.
             */
            interface ILiveGuestRequest extends barc.browser.v1.LiveGuestRequest.$Properties {
            }

            /** Represents a LiveGuestRequest. */
            class LiveGuestRequest {

                /**
                 * Constructs a new LiveGuestRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.LiveGuestRequest.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** LiveGuestRequest inputId. */
                inputId: Uint8Array;

                /** LiveGuestRequest sessionId. */
                sessionId: Uint8Array;

                /** LiveGuestRequest moduleGeneration. */
                moduleGeneration: Long;

                /** LiveGuestRequest basis. */
                basis?: (barc.browser.v1.ObservationBasis.$Properties|null);

                /** LiveGuestRequest initialize. */
                initialize?: (barc.browser.v1.LiveBootstrap.$Properties|null);

                /** LiveGuestRequest observation. */
                observation?: (barc.browser.v1.LiveObservation.$Properties|null);

                /** LiveGuestRequest result. */
                result?: (barc.browser.v1.LiveResult.$Properties|null);

                /** LiveGuestRequest manualInput. */
                manualInput?: (barc.browser.v1.LiveManualInput.$Properties|null);

                /** LiveGuestRequest input. */
                input?: ("initialize"|"observation"|"result"|"manualInput");

                /**
                 * Encodes the specified LiveGuestRequest message. Does not implicitly {@link barc.browser.v1.LiveGuestRequest.verify|verify} messages.
                 * @param message LiveGuestRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.LiveGuestRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LiveGuestRequest message, length delimited. Does not implicitly {@link barc.browser.v1.LiveGuestRequest.verify|verify} messages.
                 * @param message LiveGuestRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.LiveGuestRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LiveGuestRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveGuestRequest & barc.browser.v1.LiveGuestRequest.$Shape} LiveGuestRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.LiveGuestRequest & barc.browser.v1.LiveGuestRequest.$Shape;

                /**
                 * Decodes a LiveGuestRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveGuestRequest & barc.browser.v1.LiveGuestRequest.$Shape} LiveGuestRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.LiveGuestRequest & barc.browser.v1.LiveGuestRequest.$Shape;

                /**
                 * Creates a LiveGuestRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LiveGuestRequest
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.LiveGuestRequest;

                /**
                 * Creates a plain object from a LiveGuestRequest message. Also converts values to other types if specified.
                 * @param message LiveGuestRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.LiveGuestRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LiveGuestRequest to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for LiveGuestRequest
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace LiveGuestRequest {

                /** Properties of a LiveGuestRequest. */
                interface $Properties {

                    /** LiveGuestRequest inputId */
                    inputId?: (Uint8Array|null);

                    /** LiveGuestRequest sessionId */
                    sessionId?: (Uint8Array|null);

                    /** LiveGuestRequest moduleGeneration */
                    moduleGeneration?: (Long|null);

                    /** LiveGuestRequest basis */
                    basis?: (barc.browser.v1.ObservationBasis.$Properties|null);

                    /** LiveGuestRequest initialize */
                    initialize?: (barc.browser.v1.LiveBootstrap.$Properties|null);

                    /** LiveGuestRequest observation */
                    observation?: (barc.browser.v1.LiveObservation.$Properties|null);

                    /** LiveGuestRequest result */
                    result?: (barc.browser.v1.LiveResult.$Properties|null);

                    /** LiveGuestRequest manualInput */
                    manualInput?: (barc.browser.v1.LiveManualInput.$Properties|null);

                    /** LiveGuestRequest input */
                    input?: ("initialize"|"observation"|"result"|"manualInput");

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Narrowed shape of a LiveGuestRequest. */
                type $Shape = {
                  inputId?: Uint8Array|null;
                  sessionId?: Uint8Array|null;
                  moduleGeneration?: Long|null;
                  basis?: barc.browser.v1.ObservationBasis.$Shape|null;
                  initialize?: barc.browser.v1.LiveBootstrap.$Shape|null;
                  observation?: barc.browser.v1.LiveObservation.$Shape|null;
                  result?: barc.browser.v1.LiveResult.$Shape|null;
                  manualInput?: barc.browser.v1.LiveManualInput.$Shape|null;
                  $unknowns?: Uint8Array[];
                } & (
                  ({ input?: undefined; initialize?: null; observation?: null; result?: null; manualInput?: null }|{ input?: "initialize"; initialize: barc.browser.v1.LiveBootstrap.$Shape; observation?: null; result?: null; manualInput?: null }|{ input?: "observation"; initialize?: null; observation: barc.browser.v1.LiveObservation.$Shape; result?: null; manualInput?: null }|{ input?: "result"; initialize?: null; observation?: null; result: barc.browser.v1.LiveResult.$Shape; manualInput?: null }|{ input?: "manualInput"; initialize?: null; observation?: null; result?: null; manualInput: barc.browser.v1.LiveManualInput.$Shape })
                );
            }

            /**
             * Properties of a LiveGuestResponse.
             * @deprecated Use barc.browser.v1.LiveGuestResponse.$Properties instead.
             */
            interface ILiveGuestResponse extends barc.browser.v1.LiveGuestResponse.$Properties {
            }

            /** Represents a LiveGuestResponse. */
            class LiveGuestResponse {

                /**
                 * Constructs a new LiveGuestResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.LiveGuestResponse.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** LiveGuestResponse inputId. */
                inputId: Uint8Array;

                /** LiveGuestResponse sessionId. */
                sessionId: Uint8Array;

                /** LiveGuestResponse moduleGeneration. */
                moduleGeneration: Long;

                /** LiveGuestResponse basis. */
                basis?: (barc.browser.v1.ObservationBasis.$Properties|null);

                /** LiveGuestResponse acknowledgment. */
                acknowledgment: barc.browser.v1.GuestAckStatus;

                /** LiveGuestResponse refusalDetail. */
                refusalDetail: string;

                /** LiveGuestResponse intent. */
                intent?: (barc.browser.v1.LiveIntent.$Properties|null);

                /**
                 * Encodes the specified LiveGuestResponse message. Does not implicitly {@link barc.browser.v1.LiveGuestResponse.verify|verify} messages.
                 * @param message LiveGuestResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.LiveGuestResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LiveGuestResponse message, length delimited. Does not implicitly {@link barc.browser.v1.LiveGuestResponse.verify|verify} messages.
                 * @param message LiveGuestResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.LiveGuestResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LiveGuestResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveGuestResponse & barc.browser.v1.LiveGuestResponse.$Shape} LiveGuestResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.LiveGuestResponse & barc.browser.v1.LiveGuestResponse.$Shape;

                /**
                 * Decodes a LiveGuestResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveGuestResponse & barc.browser.v1.LiveGuestResponse.$Shape} LiveGuestResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.LiveGuestResponse & barc.browser.v1.LiveGuestResponse.$Shape;

                /**
                 * Creates a LiveGuestResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LiveGuestResponse
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.LiveGuestResponse;

                /**
                 * Creates a plain object from a LiveGuestResponse message. Also converts values to other types if specified.
                 * @param message LiveGuestResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.LiveGuestResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LiveGuestResponse to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for LiveGuestResponse
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace LiveGuestResponse {

                /** Properties of a LiveGuestResponse. */
                interface $Properties {

                    /** LiveGuestResponse inputId */
                    inputId?: (Uint8Array|null);

                    /** LiveGuestResponse sessionId */
                    sessionId?: (Uint8Array|null);

                    /** LiveGuestResponse moduleGeneration */
                    moduleGeneration?: (Long|null);

                    /** LiveGuestResponse basis */
                    basis?: (barc.browser.v1.ObservationBasis.$Properties|null);

                    /** LiveGuestResponse acknowledgment */
                    acknowledgment?: (barc.browser.v1.GuestAckStatus|null);

                    /** LiveGuestResponse refusalDetail */
                    refusalDetail?: (string|null);

                    /** LiveGuestResponse intent */
                    intent?: (barc.browser.v1.LiveIntent.$Properties|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a LiveGuestResponse. */
                type $Shape = {
                  inputId?: Uint8Array|null;
                  sessionId?: Uint8Array|null;
                  moduleGeneration?: Long|null;
                  basis?: barc.browser.v1.ObservationBasis.$Shape|null;
                  acknowledgment?: barc.browser.v1.GuestAckStatus|null;
                  refusalDetail?: string|null;
                  intent?: barc.browser.v1.LiveIntent.$Shape|null;
                  $unknowns?: Uint8Array[];
                };
            }

            /**
             * Properties of an ArmController.
             * @deprecated Use barc.browser.v1.ArmController.$Properties instead.
             */
            interface IArmController extends barc.browser.v1.ArmController.$Properties {
            }

            /** Represents an ArmController. */
            class ArmController {

                /**
                 * Constructs a new ArmController.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.ArmController.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** ArmController controller. */
                controller?: (barc.browser.v1.ControllerIdentity.$Properties|null);

                /** ArmController module. */
                module?: (barc.browser.v1.LiveModuleIdentity.$Properties|null);

                /**
                 * Encodes the specified ArmController message. Does not implicitly {@link barc.browser.v1.ArmController.verify|verify} messages.
                 * @param message ArmController message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.ArmController.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ArmController message, length delimited. Does not implicitly {@link barc.browser.v1.ArmController.verify|verify} messages.
                 * @param message ArmController message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.ArmController.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an ArmController message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ArmController & barc.browser.v1.ArmController.$Shape} ArmController
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.ArmController & barc.browser.v1.ArmController.$Shape;

                /**
                 * Decodes an ArmController message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ArmController & barc.browser.v1.ArmController.$Shape} ArmController
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.ArmController & barc.browser.v1.ArmController.$Shape;

                /**
                 * Creates an ArmController message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ArmController
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.ArmController;

                /**
                 * Creates a plain object from an ArmController message. Also converts values to other types if specified.
                 * @param message ArmController
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.ArmController, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ArmController to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for ArmController
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace ArmController {

                /** Properties of an ArmController. */
                interface $Properties {

                    /** ArmController controller */
                    controller?: (barc.browser.v1.ControllerIdentity.$Properties|null);

                    /** ArmController module */
                    module?: (barc.browser.v1.LiveModuleIdentity.$Properties|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of an ArmController. */
                type $Shape = barc.browser.v1.ArmController.$Properties;
            }

            /**
             * Properties of a RevokeController.
             * @deprecated Use barc.browser.v1.RevokeController.$Properties instead.
             */
            interface IRevokeController extends barc.browser.v1.RevokeController.$Properties {
            }

            /** Represents a RevokeController. */
            class RevokeController {

                /**
                 * Constructs a new RevokeController.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.RevokeController.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** RevokeController controller. */
                controller?: (barc.browser.v1.ControllerIdentity.$Properties|null);

                /** RevokeController reason. */
                reason: string;

                /**
                 * Encodes the specified RevokeController message. Does not implicitly {@link barc.browser.v1.RevokeController.verify|verify} messages.
                 * @param message RevokeController message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.RevokeController.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified RevokeController message, length delimited. Does not implicitly {@link barc.browser.v1.RevokeController.verify|verify} messages.
                 * @param message RevokeController message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.RevokeController.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a RevokeController message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.RevokeController & barc.browser.v1.RevokeController.$Shape} RevokeController
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.RevokeController & barc.browser.v1.RevokeController.$Shape;

                /**
                 * Decodes a RevokeController message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.RevokeController & barc.browser.v1.RevokeController.$Shape} RevokeController
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.RevokeController & barc.browser.v1.RevokeController.$Shape;

                /**
                 * Creates a RevokeController message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns RevokeController
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.RevokeController;

                /**
                 * Creates a plain object from a RevokeController message. Also converts values to other types if specified.
                 * @param message RevokeController
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.RevokeController, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this RevokeController to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for RevokeController
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace RevokeController {

                /** Properties of a RevokeController. */
                interface $Properties {

                    /** RevokeController controller */
                    controller?: (barc.browser.v1.ControllerIdentity.$Properties|null);

                    /** RevokeController reason */
                    reason?: (string|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a RevokeController. */
                type $Shape = barc.browser.v1.RevokeController.$Properties;
            }

            /**
             * Properties of a SubmitLiveIntent.
             * @deprecated Use barc.browser.v1.SubmitLiveIntent.$Properties instead.
             */
            interface ISubmitLiveIntent extends barc.browser.v1.SubmitLiveIntent.$Properties {
            }

            /** Represents a SubmitLiveIntent. */
            class SubmitLiveIntent {

                /**
                 * Constructs a new SubmitLiveIntent.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.SubmitLiveIntent.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** SubmitLiveIntent parentId. */
                parentId: Uint8Array;

                /** SubmitLiveIntent inputId. */
                inputId: Uint8Array;

                /** SubmitLiveIntent controller. */
                controller?: (barc.browser.v1.ControllerIdentity.$Properties|null);

                /** SubmitLiveIntent module. */
                module?: (barc.browser.v1.LiveModuleIdentity.$Properties|null);

                /** SubmitLiveIntent basis. */
                basis?: (barc.browser.v1.ObservationBasis.$Properties|null);

                /** SubmitLiveIntent intent. */
                intent?: (barc.browser.v1.LiveIntent.$Properties|null);

                /**
                 * Encodes the specified SubmitLiveIntent message. Does not implicitly {@link barc.browser.v1.SubmitLiveIntent.verify|verify} messages.
                 * @param message SubmitLiveIntent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.SubmitLiveIntent.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified SubmitLiveIntent message, length delimited. Does not implicitly {@link barc.browser.v1.SubmitLiveIntent.verify|verify} messages.
                 * @param message SubmitLiveIntent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.SubmitLiveIntent.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a SubmitLiveIntent message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.SubmitLiveIntent & barc.browser.v1.SubmitLiveIntent.$Shape} SubmitLiveIntent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.SubmitLiveIntent & barc.browser.v1.SubmitLiveIntent.$Shape;

                /**
                 * Decodes a SubmitLiveIntent message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.SubmitLiveIntent & barc.browser.v1.SubmitLiveIntent.$Shape} SubmitLiveIntent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.SubmitLiveIntent & barc.browser.v1.SubmitLiveIntent.$Shape;

                /**
                 * Creates a SubmitLiveIntent message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns SubmitLiveIntent
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.SubmitLiveIntent;

                /**
                 * Creates a plain object from a SubmitLiveIntent message. Also converts values to other types if specified.
                 * @param message SubmitLiveIntent
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.SubmitLiveIntent, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this SubmitLiveIntent to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for SubmitLiveIntent
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace SubmitLiveIntent {

                /** Properties of a SubmitLiveIntent. */
                interface $Properties {

                    /** SubmitLiveIntent parentId */
                    parentId?: (Uint8Array|null);

                    /** SubmitLiveIntent inputId */
                    inputId?: (Uint8Array|null);

                    /** SubmitLiveIntent controller */
                    controller?: (barc.browser.v1.ControllerIdentity.$Properties|null);

                    /** SubmitLiveIntent module */
                    module?: (barc.browser.v1.LiveModuleIdentity.$Properties|null);

                    /** SubmitLiveIntent basis */
                    basis?: (barc.browser.v1.ObservationBasis.$Properties|null);

                    /** SubmitLiveIntent intent */
                    intent?: (barc.browser.v1.LiveIntent.$Properties|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a SubmitLiveIntent. */
                type $Shape = {
                  parentId?: Uint8Array|null;
                  inputId?: Uint8Array|null;
                  controller?: barc.browser.v1.ControllerIdentity.$Shape|null;
                  module?: barc.browser.v1.LiveModuleIdentity.$Shape|null;
                  basis?: barc.browser.v1.ObservationBasis.$Shape|null;
                  intent?: barc.browser.v1.LiveIntent.$Shape|null;
                  $unknowns?: Uint8Array[];
                };
            }

            /**
             * Properties of a ControllerState.
             * @deprecated Use barc.browser.v1.ControllerState.$Properties instead.
             */
            interface IControllerState extends barc.browser.v1.ControllerState.$Properties {
            }

            /** Represents a ControllerState. */
            class ControllerState {

                /**
                 * Constructs a new ControllerState.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.ControllerState.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** ControllerState stateSequence. */
                stateSequence: Long;

                /** ControllerState controller. */
                controller?: (barc.browser.v1.ControllerIdentity.$Properties|null);

                /** ControllerState module. */
                module?: (barc.browser.v1.LiveModuleIdentity.$Properties|null);

                /** ControllerState stage. */
                stage: barc.browser.v1.ControllerStage;

                /** ControllerState reason. */
                reason: string;

                /**
                 * Encodes the specified ControllerState message. Does not implicitly {@link barc.browser.v1.ControllerState.verify|verify} messages.
                 * @param message ControllerState message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.ControllerState.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ControllerState message, length delimited. Does not implicitly {@link barc.browser.v1.ControllerState.verify|verify} messages.
                 * @param message ControllerState message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.ControllerState.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ControllerState message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.ControllerState & barc.browser.v1.ControllerState.$Shape} ControllerState
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.ControllerState & barc.browser.v1.ControllerState.$Shape;

                /**
                 * Decodes a ControllerState message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.ControllerState & barc.browser.v1.ControllerState.$Shape} ControllerState
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.ControllerState & barc.browser.v1.ControllerState.$Shape;

                /**
                 * Creates a ControllerState message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ControllerState
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.ControllerState;

                /**
                 * Creates a plain object from a ControllerState message. Also converts values to other types if specified.
                 * @param message ControllerState
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.ControllerState, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ControllerState to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for ControllerState
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace ControllerState {

                /** Properties of a ControllerState. */
                interface $Properties {

                    /** ControllerState stateSequence */
                    stateSequence?: (Long|null);

                    /** ControllerState controller */
                    controller?: (barc.browser.v1.ControllerIdentity.$Properties|null);

                    /** ControllerState module */
                    module?: (barc.browser.v1.LiveModuleIdentity.$Properties|null);

                    /** ControllerState stage */
                    stage?: (barc.browser.v1.ControllerStage|null);

                    /** ControllerState reason */
                    reason?: (string|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a ControllerState. */
                type $Shape = barc.browser.v1.ControllerState.$Properties;
            }

            /**
             * Properties of a LiveClientEnvelope.
             * @deprecated Use barc.browser.v1.LiveClientEnvelope.$Properties instead.
             */
            interface ILiveClientEnvelope extends barc.browser.v1.LiveClientEnvelope.$Properties {
            }

            /** Represents a LiveClientEnvelope. */
            class LiveClientEnvelope {

                /**
                 * Constructs a new LiveClientEnvelope.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.LiveClientEnvelope.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** LiveClientEnvelope authenticate. */
                authenticate?: (barc.browser.v1.ClientAuth.$Properties|null);

                /** LiveClientEnvelope arm. */
                arm?: (barc.browser.v1.ArmController.$Properties|null);

                /** LiveClientEnvelope revoke. */
                revoke?: (barc.browser.v1.RevokeController.$Properties|null);

                /** LiveClientEnvelope submit. */
                submit?: (barc.browser.v1.SubmitLiveIntent.$Properties|null);

                /** LiveClientEnvelope body. */
                body?: ("authenticate"|"arm"|"revoke"|"submit");

                /**
                 * Encodes the specified LiveClientEnvelope message. Does not implicitly {@link barc.browser.v1.LiveClientEnvelope.verify|verify} messages.
                 * @param message LiveClientEnvelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.LiveClientEnvelope.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LiveClientEnvelope message, length delimited. Does not implicitly {@link barc.browser.v1.LiveClientEnvelope.verify|verify} messages.
                 * @param message LiveClientEnvelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.LiveClientEnvelope.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LiveClientEnvelope message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveClientEnvelope & barc.browser.v1.LiveClientEnvelope.$Shape} LiveClientEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.LiveClientEnvelope & barc.browser.v1.LiveClientEnvelope.$Shape;

                /**
                 * Decodes a LiveClientEnvelope message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveClientEnvelope & barc.browser.v1.LiveClientEnvelope.$Shape} LiveClientEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.LiveClientEnvelope & barc.browser.v1.LiveClientEnvelope.$Shape;

                /**
                 * Creates a LiveClientEnvelope message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LiveClientEnvelope
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.LiveClientEnvelope;

                /**
                 * Creates a plain object from a LiveClientEnvelope message. Also converts values to other types if specified.
                 * @param message LiveClientEnvelope
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.LiveClientEnvelope, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LiveClientEnvelope to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for LiveClientEnvelope
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace LiveClientEnvelope {

                /** Properties of a LiveClientEnvelope. */
                interface $Properties {

                    /** LiveClientEnvelope authenticate */
                    authenticate?: (barc.browser.v1.ClientAuth.$Properties|null);

                    /** LiveClientEnvelope arm */
                    arm?: (barc.browser.v1.ArmController.$Properties|null);

                    /** LiveClientEnvelope revoke */
                    revoke?: (barc.browser.v1.RevokeController.$Properties|null);

                    /** LiveClientEnvelope submit */
                    submit?: (barc.browser.v1.SubmitLiveIntent.$Properties|null);

                    /** LiveClientEnvelope body */
                    body?: ("authenticate"|"arm"|"revoke"|"submit");

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Narrowed shape of a LiveClientEnvelope. */
                type $Shape = {
                  authenticate?: barc.browser.v1.ClientAuth.$Shape|null;
                  arm?: barc.browser.v1.ArmController.$Shape|null;
                  revoke?: barc.browser.v1.RevokeController.$Shape|null;
                  submit?: barc.browser.v1.SubmitLiveIntent.$Shape|null;
                  $unknowns?: Uint8Array[];
                } & (
                  ({ body?: undefined; authenticate?: null; arm?: null; revoke?: null; submit?: null }|{ body?: "authenticate"; authenticate: barc.browser.v1.ClientAuth.$Shape; arm?: null; revoke?: null; submit?: null }|{ body?: "arm"; authenticate?: null; arm: barc.browser.v1.ArmController.$Shape; revoke?: null; submit?: null }|{ body?: "revoke"; authenticate?: null; arm?: null; revoke: barc.browser.v1.RevokeController.$Shape; submit?: null }|{ body?: "submit"; authenticate?: null; arm?: null; revoke?: null; submit: barc.browser.v1.SubmitLiveIntent.$Shape })
                );
            }

            /**
             * Properties of a LiveServerEnvelope.
             * @deprecated Use barc.browser.v1.LiveServerEnvelope.$Properties instead.
             */
            interface ILiveServerEnvelope extends barc.browser.v1.LiveServerEnvelope.$Properties {
            }

            /** Represents a LiveServerEnvelope. */
            class LiveServerEnvelope {

                /**
                 * Constructs a new LiveServerEnvelope.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: barc.browser.v1.LiveServerEnvelope.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** LiveServerEnvelope bootstrap. */
                bootstrap?: (barc.browser.v1.LiveBootstrap.$Properties|null);

                /** LiveServerEnvelope observation. */
                observation?: (barc.browser.v1.LiveObservation.$Properties|null);

                /** LiveServerEnvelope controllerState. */
                controllerState?: (barc.browser.v1.ControllerState.$Properties|null);

                /** LiveServerEnvelope result. */
                result?: (barc.browser.v1.LiveResult.$Properties|null);

                /** LiveServerEnvelope guestInput. */
                guestInput?: (barc.browser.v1.LiveGuestRequest.$Properties|null);

                /** LiveServerEnvelope body. */
                body?: ("bootstrap"|"observation"|"controllerState"|"result"|"guestInput");

                /**
                 * Encodes the specified LiveServerEnvelope message. Does not implicitly {@link barc.browser.v1.LiveServerEnvelope.verify|verify} messages.
                 * @param message LiveServerEnvelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: barc.browser.v1.LiveServerEnvelope.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LiveServerEnvelope message, length delimited. Does not implicitly {@link barc.browser.v1.LiveServerEnvelope.verify|verify} messages.
                 * @param message LiveServerEnvelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encodeDelimited(message: barc.browser.v1.LiveServerEnvelope.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LiveServerEnvelope message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {barc.browser.v1.LiveServerEnvelope & barc.browser.v1.LiveServerEnvelope.$Shape} LiveServerEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): barc.browser.v1.LiveServerEnvelope & barc.browser.v1.LiveServerEnvelope.$Shape;

                /**
                 * Decodes a LiveServerEnvelope message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns {barc.browser.v1.LiveServerEnvelope & barc.browser.v1.LiveServerEnvelope.$Shape} LiveServerEnvelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): barc.browser.v1.LiveServerEnvelope & barc.browser.v1.LiveServerEnvelope.$Shape;

                /**
                 * Creates a LiveServerEnvelope message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LiveServerEnvelope
                 */
                static fromObject(object: { [k: string]: any }): barc.browser.v1.LiveServerEnvelope;

                /**
                 * Creates a plain object from a LiveServerEnvelope message. Also converts values to other types if specified.
                 * @param message LiveServerEnvelope
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: barc.browser.v1.LiveServerEnvelope, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LiveServerEnvelope to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };

                /**
                 * Gets the type url for LiveServerEnvelope
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace LiveServerEnvelope {

                /** Properties of a LiveServerEnvelope. */
                interface $Properties {

                    /** LiveServerEnvelope bootstrap */
                    bootstrap?: (barc.browser.v1.LiveBootstrap.$Properties|null);

                    /** LiveServerEnvelope observation */
                    observation?: (barc.browser.v1.LiveObservation.$Properties|null);

                    /** LiveServerEnvelope controllerState */
                    controllerState?: (barc.browser.v1.ControllerState.$Properties|null);

                    /** LiveServerEnvelope result */
                    result?: (barc.browser.v1.LiveResult.$Properties|null);

                    /** LiveServerEnvelope guestInput */
                    guestInput?: (barc.browser.v1.LiveGuestRequest.$Properties|null);

                    /** LiveServerEnvelope body */
                    body?: ("bootstrap"|"observation"|"controllerState"|"result"|"guestInput");

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Narrowed shape of a LiveServerEnvelope. */
                type $Shape = {
                  bootstrap?: barc.browser.v1.LiveBootstrap.$Shape|null;
                  observation?: barc.browser.v1.LiveObservation.$Shape|null;
                  controllerState?: barc.browser.v1.ControllerState.$Shape|null;
                  result?: barc.browser.v1.LiveResult.$Shape|null;
                  guestInput?: barc.browser.v1.LiveGuestRequest.$Shape|null;
                  $unknowns?: Uint8Array[];
                } & (
                  ({ body?: undefined; bootstrap?: null; observation?: null; controllerState?: null; result?: null; guestInput?: null }|{ body?: "bootstrap"; bootstrap: barc.browser.v1.LiveBootstrap.$Shape; observation?: null; controllerState?: null; result?: null; guestInput?: null }|{ body?: "observation"; bootstrap?: null; observation: barc.browser.v1.LiveObservation.$Shape; controllerState?: null; result?: null; guestInput?: null }|{ body?: "controllerState"; bootstrap?: null; observation?: null; controllerState: barc.browser.v1.ControllerState.$Shape; result?: null; guestInput?: null }|{ body?: "result"; bootstrap?: null; observation?: null; controllerState?: null; result: barc.browser.v1.LiveResult.$Shape; guestInput?: null }|{ body?: "guestInput"; bootstrap?: null; observation?: null; controllerState?: null; result?: null; guestInput: barc.browser.v1.LiveGuestRequest.$Shape })
                );
            }
        }
    }
}
