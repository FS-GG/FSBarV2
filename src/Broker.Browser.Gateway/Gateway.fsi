namespace Broker.Browser.Gateway

open System
open System.Threading
open System.Threading.Tasks
open Microsoft.Extensions.Hosting
open Broker.Protocol

module Gateway =
    type Config =
        { url: string
          path: string
          allowedOrigin: string
          credential: string
          credentialSessionId: Guid
          credentialExpiresAt: DateTimeOffset
          perspectiveId: string
          authTimeout: TimeSpan
          maxFrameBytes: int
          maxEntities: int }

    val defaultConfig : url:string -> origin:string -> credential:string -> sessionId:Guid -> Config
    val startAsync : hub:BrokerState.Hub -> config:Config -> cancellationToken:CancellationToken -> Task<IHost>
