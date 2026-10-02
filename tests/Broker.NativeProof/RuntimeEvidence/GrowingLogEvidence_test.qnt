module GrowingLogEvidence_test {
  import GrowingLogEvidence.* from "./GrowingLogEvidence"

  run healthyBoundaries = init.then(beginPolicy("invocation1","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(readyPolicy("invocation1","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(acquire).then(sampleInitial).then(validate("browser"))
    .then(evaluatedPolicy("invocation1","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(completePolicy("invocation1","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(consume("browser")).then(completeBoundary("browser")).then(benignAppend).then(beginPolicy("invocation2","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(readyPolicy("invocation2","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(validate("normalization")).then(evaluatedPolicy("invocation2","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(completePolicy("invocation2","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(consume("normalization")).then(completeBoundary("normalization")).then(benignAppend).then(beginPolicy("invocation3","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(readyPolicy("invocation3","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(validate("release")).then(evaluatedPolicy("invocation3","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(completePolicy("invocation3","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(consume("release")).then(completeBoundary("release")).expect(invariant and evidence.consumedRevision == 3)

  run rewriteIsSticky = init.then(acquire).then(sampleInitial).then(beginPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(readyPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(evaluatedPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(completePolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(validate("browser"))
    .then(consume("browser")).then(invalidate).then(close)
    .expect(invariant and evidence.stickyInvalid and evidence.phase == "closed")

  run unavailableCannotGrant = init.then(acquire).then(unavailable).then(close)
    .expect(invariant and evidence.validatedRevision == 0 and evidence.consumedRevision == 0)

  run unavailableAfterValidationRevokesCurrentAuthority = init.then(acquire).then(sampleInitial)
    .then(validate("browser")).then(unavailable)
    .expect(invariant and evidence.validatedRevision == 1 and not(evidence.authorityActive) and evidence.stickyInvalid)

  run unavailableAfterConsumptionPreservesHistoryOnly = init.then(beginPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(readyPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(acquire).then(sampleInitial).then(validate("browser")).then(evaluatedPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(completePolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(consume("browser")).then(unavailable)
    .expect(invariant and evidence.consumedRevision == 1 and not(evidence.authorityActive) and evidence.stickyInvalid)

  run staleBoundaryCannotConsume = init.then(acquire).then(sampleInitial)
    .then(validate("browser")).then(staleBoundary)
    .expect(invariant and evidence.stickyInvalid and evidence.consumedRevision == 0)

  run pendingTailHasNoAuthority = init.then(acquire).then(pendingTail)
    .then(close).expect(invariant and evidence.validatedRevision == 0 and evidence.consumedRevision == 0)

  run closeRevokesCurrentAuthority = init.then(acquire).then(sampleInitial)
    .then(validate("browser")).then(close)
    .expect(invariant and evidence.validatedRevision == 1 and not(evidence.authorityActive))

  run truncateIsSticky = init.then(acquire).then(sampleInitial).then(prefixTruncate).then(close).expect(invariant and evidence.stickyInvalid)
  run replacementIsSticky = init.then(acquire).then(sampleInitial).then(replacement).then(close).expect(invariant and evidence.stickyInvalid)
  run wrongWriterIsSticky = init.then(acquire).then(sampleInitial).then(wrongWriter).then(close).expect(invariant and evidence.stickyInvalid)
  run wrongGenerationIsSticky = init.then(acquire).then(sampleInitial).then(wrongGeneration).then(close).expect(invariant and evidence.stickyInvalid)
  run wrongSourceIsSticky = init.then(acquire).then(sampleInitial).then(wrongSource).then(close).expect(invariant and evidence.stickyInvalid)
  run contradictorySuffixIsSticky = init.then(acquire).then(sampleInitial).then(contradictorySuffix).then(close).expect(invariant and evidence.stickyInvalid)

  run policyInvocationCompletesSameClosure = init.then(beginPolicy("invocation", "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(readyPolicy("invocation", "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(acquire).then(sampleInitial).then(validate("browser")).then(evaluatedPolicy("invocation", "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(completePolicy("invocation", "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .expect(invariant and evidence.policyPhase == "completed")

  run policyClosureDriftIsSticky = init.then(beginPolicy("invocation", "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(readyPolicy("invocation", "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(acquire).then(sampleInitial).then(validate("browser")).then(evaluatedPolicy("invocation", "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(policyDrift)
    .expect(invariant and evidence.policyPhase == "invalid" and evidence.stickyInvalid)


  run completeRecordWaitThenConsume = init.then(acquire).then(beginSettlement("browser")).then(incompleteRecordProbe).then(completeRecordCandidate).then(sampleInitial)
    .then(beginPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(readyPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(validate("browser")).then(evaluatedPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(completePolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(consume("browser"))
    .expect(invariant and evidence.consumedRevision == 1 and evidence.settlement.remaining == 30)

  run completeRecordWaitExhausted = init.then(acquire).then(beginSettlement("browser")).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(recordSettlementExhausted)
    .expect(invariant and evidence.observedRevision == 0 and evidence.consumedRevision == 0 and evidence.settlement.phase == "refused")

  run zeroBudgetCannotProbe = init.then(acquire).then(beginSettlement("browser")).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe)
    .expect(invariant and evidence.settlement.remaining == 0 and not(canProbe))

  run completeRecordWaitDeadline = init.then(acquire).then(beginSettlement("browser")).then(incompleteRecordProbe).then(recordSettlementDeadline)
    .expect(invariant and evidence.observedRevision == 0 and evidence.consumedRevision == 0 and evidence.settlement.phase == "deadline")

  run waitAfterConsumptionHasNoNewAuthority = init.then(acquire).then(beginSettlement("browser")).then(completeRecordCandidate).then(sampleInitial)
    .then(beginPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(readyPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(validate("browser")).then(evaluatedPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(completePolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(consume("browser")).then(completeBoundary("browser"))
    .then(beginSettlement("normalization")).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(recordSettlementExhausted)
    .expect(invariant and evidence.consumedRevision == 1 and not(evidence.authorityActive) and evidence.settlement.phase == "refused")

  run pendingThenCompleteResample = init.then(acquire).then(beginSettlement("browser")).then(completeRecordCandidate).then(pendingTail)
    .then(retrySettlement("browser")).then(incompleteRecordProbe).then(completeRecordCandidate).then(pendingCompleteResample)
    .then(beginPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(readyPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(validate("browser")).then(evaluatedPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(completePolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(consume("browser"))
    .expect(invariant and evidence.observedRevision == 2 and evidence.consumedRevision == 2 and evidence.settlement.remaining == 29)

  run sharedBudgetAcrossEvaluations = init.then(acquire).then(beginSettlement("browser")).then(completeRecordCandidate).then(sampleInitial).then(beginPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(readyPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(validate("browser")).then(evaluatedPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(completePolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(consume("browser")).then(retrySettlement("browser")).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(recordSettlementExhausted)
    .expect(invariant and evidence.observedRevision == 1 and evidence.settlement.phase == "refused" and evidence.settlement.remaining == 0)

  run lastProbeCandidateThenExhausted = init.then(acquire).then(beginSettlement("browser")).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(incompleteRecordProbe).then(completeRecordCandidate).then(sampleInitial).then(beginPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(readyPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(validate("browser")).then(evaluatedPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(completePolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(consume("browser")).then(retrySettlement("browser")).then(recordSettlementExhausted)
    .expect(invariant and evidence.observedRevision == 1 and evidence.settlement.phase == "refused" and evidence.settlement.remaining == 0)

  run candidateCannotRenewBudget = init.then(acquire).then(beginSettlement("browser")).then(completeRecordCandidate)
    .expect(invariant and evidence.settlement.remaining == 31 and not(canBeginSettlement("browser")))

  run terminalSettlementCannotConsume = init.then(acquire).then(sampleInitial)
    .then(beginPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(readyPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(validate("browser")).then(evaluatedPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(completePolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(beginSettlement("browser")).then(recordSettlementDeadline)
    .expect(invariant and evidence.consumedRevision == 0 and not(canConsume("browser")))

  run retriesShareOneProbeBudget = init.then(acquire).then(beginSettlement("browser")).then(completeRecordCandidate).then(retrySettlement("browser")).then(incompleteRecordProbe).then(completeRecordCandidate).then(retrySettlement("browser"))
    .expect(invariant and evidence.settlement.phase == "probing" and evidence.settlement.remaining == 29 and not(canBeginSettlement("browser")))

  pure val safeAtlas = { rawBytes: 120, rawSha256: "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd", completeBytes: 100, completeSha256: "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc", tailBytes: 20, tailSha256: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", completeRecords: 4, tailClass: "atlas" }
  pure val pendingRoot = { ...safeAtlas, tailClass: "pending" }
  pure val pendingUtf8 = { ...safeAtlas, tailClass: "pending-utf8" }
  action candidate = init.then(acquire).then(observeRaw(safeAtlas,true,1,1,1,5000000))
    .then(beginPolicy("rp2","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(readyPolicy("rp2","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(validate("browser")).then(evaluatedPolicy("rp2","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(completePolicy("rp2","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))

  run rp2SafeTailConsumesExactHorizon = candidate.then(beginFinalRead(10)).then(endFinalRead(20)).then(observeFinalSize(120,30)).then(consumeAt("browser",40,5000000))
    .expect(invariant and evidence.consumedPrefix.tailBytes == 20 and evidence.consumption.linearizedMicroseconds == 30)
  run rp2PostLAppendRemainsUnvalidated = candidate.then(beginFinalRead(10)).then(endFinalRead(20)).then(observeFinalSize(120,30)).then(producerAppend(10,true)).then(consumeAt("browser",40,5000000))
    .expect(invariant and evidence.producerBytes == 130 and evidence.consumedPrefix.rawBytes == 120 and not(evidence.authorityActive))
  run rp2NextBoundaryCannotReusePriorConsumption = candidate.then(beginFinalRead(10)).then(endFinalRead(20)).then(observeFinalSize(120,30)).then(consumeAt("browser",40,5000000)).then(completeBoundary("browser"))
    .then(producerAppend(10,true)).then(observeRaw({ ...safeAtlas, rawBytes: 130, tailBytes: 30, tailClass: "pending" },false,2,1,1,5000000))
    .expect(invariant and evidence.consumedRevision == 1 and evidence.observedRevision == 2 and not(canConsume("normalization")))
  run rp2ObservedGrowthRequiresReevaluation = candidate.then(beginFinalRead(10)).then(producerAppend(10,true)).then(endFinalRead(20)).then(observeFinalSize(130,30)).then(observedGrowth)
    .expect(invariant and evidence.consumedRevision == 0 and evidence.candidateBytes == 0 and not(canConsumeAt("browser",40,5000000)))
  run rp2PolicyAppendRequiresReevaluation = candidate.then(producerAppend(10,false)).then(beginFinalRead(10)).then(endFinalRead(20)).then(observeFinalSize(130,30))
    .expect(invariant and not(canConsumeAt("browser",40,5000000)))
  run rp2RelevantTailCannotValidate = init.then(acquire).then(observeRaw(pendingRoot,false,1,1,1,5000000))
    .expect(invariant and evidence.validatedRevision == 0 and not(canConsume("browser")))
  run rp2PartialUtf8CannotValidate = init.then(acquire).then(observeRaw(pendingUtf8,false,1,1,1,5000000))
    .expect(invariant and not(safeTail(evidence.prefix)) and evidence.consumedRevision == 0)
  run rp2NoRecordsCannotValidate = init.then(acquire).then(observeRaw({ ...safeAtlas, completeBytes: 0, tailBytes: 120, completeRecords: 0 },false,1,1,1,5000000))
    .expect(invariant and evidence.consumedRevision == 0)
  run rp2InventedLAndLateReleaseCannotConsume = candidate.then(beginFinalRead(10)).then(endFinalRead(20)).then(observeFinalSize(120,30))
    .expect(invariant and not(finalInterval(10,20,0,40,5000000)) and not(canConsumeAt("browser",5000000,5000000)) and not(canConsumeAt("browser",40,4000000)))
  run rp2StaleBoundaryCannotConsume = candidate.then(beginFinalRead(10)).then(endFinalRead(20)).then(observeFinalSize(120,30))
    .expect(invariant and not(canConsumeAt("normalization",40,5000000)))
  run rp2OneConsumptionPerCandidate = candidate.then(beginFinalRead(10)).then(endFinalRead(20)).then(observeFinalSize(120,30)).then(consumeAt("browser",40,5000000))
    .expect(invariant and not(canConsumeAt("browser",41,5000000)))
}
