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

  run candidateCannotRenewBudget = init.then(acquire).then(beginSettlement("browser")).then(completeRecordCandidate)
    .expect(invariant and evidence.settlement.remaining == 31 and not(canBeginSettlement("browser")))

  run terminalSettlementCannotConsume = init.then(acquire).then(sampleInitial)
    .then(beginPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(readyPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(validate("browser")).then(evaluatedPolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(completePolicy("invocation","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(beginSettlement("browser")).then(recordSettlementDeadline)
    .expect(invariant and evidence.consumedRevision == 0 and not(canConsume("browser")))

  run retriesShareOneProbeBudget = init.then(acquire).then(beginSettlement("browser")).then(completeRecordCandidate).then(retrySettlement("browser")).then(incompleteRecordProbe).then(completeRecordCandidate).then(retrySettlement("browser"))
    .expect(invariant and evidence.settlement.phase == "probing" and evidence.settlement.remaining == 29 and not(canBeginSettlement("browser")))
}
