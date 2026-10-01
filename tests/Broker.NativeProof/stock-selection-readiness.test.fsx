#r "bin/Release/net10.0/Google.Protobuf.dll"
#r "bin/Release/net10.0/Broker.Contracts.dll"
#r "bin/Release/net10.0/Broker.NativeProof.dll"
open Highbar.V1
open Broker.NativeProof
let snapshot () = TacticalSnapshotMetadata.empty()
let actor id current allowed =
    let value=NativeActorTacticalMetadata.empty()
    let reference=NativeUnitReference.empty()
    reference.Id<-id;reference.Lifetime<-uint64 id+1UL
    value.Actor<-ValueSome reference
    let queue=NativeObservedQueue.empty()
    queue.Domain<-NativeQueueDomain.FactoryProduction;queue.Complete<-true;queue.EvidenceScheme<-enum<NativeQueueEvidenceScheme> 2
    match current with
    | Some definition -> let entry=NativeObservedQueueEntry.empty() in entry.DefinitionId<-ValueSome definition;queue.Entries.Add entry
    | None -> queue.Entries.Add(NativeObservedQueueEntry.empty())
    value.Queue.Add queue
    let descriptor=NativeTacticalCommandDescriptor.empty()
    descriptor.Kind<-NativeTacticalDescriptorKind.NativeTacticalDescriptorFactoryProduce
    descriptor.AllowedDefinitionIds.AddRange allowed
    value.Descriptors.Add descriptor
    value
let unavailable expected tactical =
    match LiveHost.selectStockFactory tactical with Error reason when reason=expected -> () | result -> failwithf "unexpected selection result %A" result
let empty=snapshot()
unavailable "complete nonempty scheme-2 factory production queue unavailable" empty
let missing=snapshot()
missing.Actors.Add(actor 42u None [100u;101u])
unavailable "factory production definition unavailable" missing
let same=snapshot()
same.Actors.Add(actor 42u (Some 100u) [100u])
unavailable "distinct allowed factory product unavailable" same
let late=snapshot()
late.Actors.Add(actor 42u (Some 100u) [100u])
unavailable "distinct allowed factory product unavailable" late
late.Actors.Add(actor 43u (Some 100u) [100u;101u])
match LiveHost.selectStockFactory late with
| Ok selected ->
    if selected.FactoryReference.Id<>43u || selected.CurrentDefinition<>100u || selected.DistinctProductDefinition<>101u then failwith "selector did not retain the usable second factory"
    late.Actors.Clear()
    if selected.FactoryReference.Id<>43u || selected.ObservedQueue.Entries.Count<>1 then failwith "retained selection changed with later projection mutation"
| Error reason -> failwith reason
printfn "stock-shared-selection-ok"
