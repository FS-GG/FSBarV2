namespace Broker.Browser.Live

open System
open Broker.Browser.Contracts
open Broker.Protocol

module LiveBoundary =
    val arm : sessionId:Guid -> request:ArmController -> now:DateTimeOffset -> state:LiveControl.State -> Result<unit,string>
    val revoke : sessionId:Guid -> request:RevokeController -> now:DateTimeOffset -> state:LiveControl.State -> Result<unit,string>
    val submit : sessionId:Guid -> request:SubmitLiveIntent -> now:DateTimeOffset -> state:LiveControl.State -> Result<LiveResult list,string>
    val feedbackEnvelope : feedback:LiveControl.Feedback -> LiveServerEnvelope
    val controllerEnvelope : update:LiveControl.ControllerUpdate -> LiveServerEnvelope
    val bootstrap : sessionId:Guid -> perspectiveId:string -> state:LiveControl.State -> Result<LiveServerEnvelope,string>
    val observation : value:Observation -> state:LiveControl.State -> Result<LiveServerEnvelope,string>
