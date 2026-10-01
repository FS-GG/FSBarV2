#r "bin/Release/net10.0/Google.Protobuf.dll"
#r "bin/Release/net10.0/Broker.Contracts.dll"
#r "bin/Release/net10.0/Broker.NativeProof.dll"
open Highbar.V1
open Broker.NativeProof
let snapshot () = TacticalSnapshotMetadata.empty()
let actor () =
    let value=NativeActorTacticalMetadata.empty()
    let reference=NativeUnitReference.empty()
    reference.Id<-42u;reference.Lifetime<-7UL
    value.Actor <- ValueSome reference
    value
let queue definition =
    let value=NativeObservedQueue.empty()
    value.Domain<-NativeQueueDomain.FactoryProduction;value.Complete<-true;value.EvidenceScheme<-enum<NativeQueueEvidenceScheme> 2
    match definition with Some id -> value.Entries.Add(let entry=NativeObservedQueueEntry.empty() in entry.DefinitionId<-ValueSome id;entry) | None -> value.Entries.Add(NativeObservedQueueEntry.empty())
    value
let descriptor ids =
    let value=NativeTacticalCommandDescriptor.empty()
    value.Kind<-NativeTacticalDescriptorKind.NativeTacticalDescriptorFactoryProduce
    value.AllowedDefinitionIds.AddRange ids
    value
let check expected tactical label = if LiveHost.stockFactoryAvailable tactical<>expected then failwith label
let empty=snapshot()
check false empty "empty tactical snapshot became ready"
let missing=snapshot()
let missingActor=actor()
missingActor.Queue.Add(queue None)
missingActor.Descriptors.Add(descriptor [100u;101u])
missing.Actors.Add missingActor
check false missing "missing definition became ready"
let same=snapshot()
let sameActor=actor()
sameActor.Queue.Add(queue (Some 100u))
sameActor.Descriptors.Add(descriptor [100u])
same.Actors.Add sameActor
check false same "no distinct product became ready"
let ready=snapshot()
let readyActor=actor()
readyActor.Queue.Add(queue (Some 100u))
readyActor.Descriptors.Add(descriptor [100u;101u])
ready.Actors.Add readyActor
check true ready "usable stock factory did not become ready"
printfn "stock-selection-readiness-ok"
