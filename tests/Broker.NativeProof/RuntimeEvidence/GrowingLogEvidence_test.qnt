module GrowingLogEvidence_test {
  import GrowingLogEvidence.* from "./GrowingLogEvidence"

  run healthyBoundaries = init.then(beginPolicy("invocation1","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(readyPolicy("invocation1","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(acquire).then(sampleInitial).then(validate("browser"))
    .then(evaluatedPolicy("invocation1","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(completePolicy("invocation1","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(consume("browser")).then(benignAppend).then(beginPolicy("invocation2","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(readyPolicy("invocation2","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(validate("normalization")).then(evaluatedPolicy("invocation2","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(completePolicy("invocation2","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(consume("normalization")).then(benignAppend).then(beginPolicy("invocation3","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(readyPolicy("invocation3","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(validate("release")).then(evaluatedPolicy("invocation3","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).then(completePolicy("invocation3","cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"))
    .then(consume("release")).expect(invariant and evidence.consumedRevision == 3)

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
}
