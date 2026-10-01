module GrowingLogEvidence_test {
  import GrowingLogEvidence.* from "./GrowingLogEvidence"
  import PolicyInvocationEvidence.* from "./GrowingLogEvidence"

  run healthyBoundaries = init.then(acquire).then(sampleInitial).then(validate("browser"))
    .then(consume("browser")).then(benignAppend).then(validate("normalization"))
    .then(consume("normalization")).then(benignAppend).then(validate("release"))
    .then(consume("release")).expect(invariant and evidence.consumedRevision == 3)

  run rewriteIsSticky = init.then(acquire).then(sampleInitial).then(validate("browser"))
    .then(consume("browser")).then(invalidate).then(close)
    .expect(invariant and evidence.stickyInvalid and evidence.phase == "closed")

  run unavailableCannotGrant = init.then(acquire).then(unavailable).then(close)
    .expect(invariant and evidence.validatedRevision == 0 and evidence.consumedRevision == 0)

  run unavailableAfterValidationRevokesCurrentAuthority = init.then(acquire).then(sampleInitial)
    .then(validate("browser")).then(unavailable)
    .expect(invariant and evidence.validatedRevision == 1 and not(evidence.authorityActive) and evidence.stickyInvalid)

  run unavailableAfterConsumptionPreservesHistoryOnly = init.then(acquire).then(sampleInitial)
    .then(validate("browser")).then(consume("browser")).then(unavailable)
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

  run policyInvocationCompletesSameClosure = policyInit.then(beginPolicy("invocation", "closure"))
    .then(readyPolicy("invocation", "closure")).then(evaluatedPolicy("invocation", "closure"))
    .then(completePolicy("invocation", "closure"))
    .expect(invocationInvariant and invocation.authority and invocation.phase == "completed")

  run policyClosureDriftIsSticky = policyInit.then(beginPolicy("invocation", "closure"))
    .then(readyPolicy("invocation", "closure")).then(policyDrift)
    .expect(invocationInvariant and not(invocation.authority) and invocation.stickyInvalid)
}
