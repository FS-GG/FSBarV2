module GrowingLogEvidence {
  type Evidence = {
    phase: str,
    generation: int,
    observedRevision: int,
    validatedRevision: int,
    intendedBoundary: str,
    consumedRevision: int,
    consumedBoundary: str,
    producerMatches: bool,
    logMatches: bool,
    sourceMatches: bool,
    rootsValid: bool,
    prefixIntact: bool,
    writerPresent: bool,
    authorityActive: bool,
    stickyInvalid: bool,
    policyPhase: str,
    policyInvocation: str,
    policyClosure: str,
  }

  var evidence: Evidence

  action init = evidence' = {
    phase: "empty", generation: 0, observedRevision: 0, validatedRevision: 0,
    consumedRevision: 0, consumedBoundary: "none", intendedBoundary: "none", producerMatches: false,
    logMatches: false, sourceMatches: false, rootsValid: false,
    prefixIntact: false, writerPresent: false, authorityActive: false, stickyInvalid: false,
    policyPhase: "none", policyInvocation: "none", policyClosure: "none",
  }

  action beginPolicy(invocation: str, closure: str): bool = all {
    evidence.phase != "invalid", evidence.phase != "unknown", evidence.phase != "closed",
    evidence.policyPhase == "none",
    invocation != "none", closure != "none",
    evidence' = { ...evidence, policyPhase: "started", policyInvocation: invocation, policyClosure: closure }
  }
  action readyPolicy(invocation: str, closure: str): bool = all {
    evidence.policyPhase == "started", evidence.policyInvocation == invocation, evidence.policyClosure == closure,
    evidence' = { ...evidence, policyPhase: "ready" }
  }
  action evaluatedPolicy(invocation: str, closure: str): bool = all {
    evidence.policyPhase == "ready", evidence.policyInvocation == invocation, evidence.policyClosure == closure,
    evidence' = { ...evidence, policyPhase: "evaluated" }
  }
  action completePolicy(invocation: str, closure: str): bool = all {
    evidence.policyPhase == "evaluated", evidence.policyInvocation == invocation, evidence.policyClosure == closure,
    evidence' = { ...evidence, policyPhase: "completed" }
  }
  action policyDrift = all {
    evidence.policyPhase != "none", evidence.policyPhase != "invalid",
    evidence' = { ...evidence, phase: "invalid", policyPhase: "invalid", stickyInvalid: true, authorityActive: false }
  }

  action acquire = all {
    evidence.phase == "empty",
    evidence' = { ...evidence, phase: "acquired", generation: 1,
      producerMatches: true, logMatches: true, sourceMatches: true,
      writerPresent: true }
  }

  action sampleInitial = all {
    evidence.phase == "acquired",
    evidence' = { ...evidence, phase: "sampled", observedRevision: 1,
      rootsValid: true, prefixIntact: true }
  }

  action validate(boundary: str): bool = all {
    evidence.phase == "sampled",
    boundary == "browser" or boundary == "normalization" or boundary == "release",
    not(evidence.stickyInvalid), evidence.producerMatches, evidence.logMatches,
    evidence.sourceMatches, evidence.writerPresent, evidence.rootsValid,
    evidence.prefixIntact,
    evidence' = { ...evidence, phase: "validated",
      validatedRevision: evidence.observedRevision, intendedBoundary: boundary,
      authorityActive: true }
  }

  action consume(boundary: str): bool = all {
    evidence.phase == "validated",
    evidence.policyPhase == "completed",
    boundary == "browser" or boundary == "normalization" or boundary == "release",
    evidence.validatedRevision == evidence.observedRevision,
    evidence.intendedBoundary == boundary,
    not(evidence.stickyInvalid),
    evidence' = { ...evidence, phase: "consumed",
      consumedRevision: evidence.observedRevision, consumedBoundary: boundary,
      authorityActive: false }
  }

  action benignAppend = all {
    evidence.phase == "validated" or evidence.phase == "consumed",
    evidence.observedRevision < 3,
    evidence' = { ...evidence, phase: "sampled",
      observedRevision: evidence.observedRevision + 1,
      rootsValid: true, prefixIntact: true, authorityActive: false,
      policyPhase: "none", policyInvocation: "none", policyClosure: "none" }
  }

  action pendingTail = all {
    evidence.phase == "acquired",
    evidence' = { ...evidence, phase: "sampled", observedRevision: 1,
      rootsValid: false, prefixIntact: true, authorityActive: false }
  }

  action staleBoundary = all {
    evidence.phase == "validated",
    evidence' = { ...evidence, phase: "invalid", stickyInvalid: true,
      authorityActive: false }
  }

  action invalidate = all {
    evidence.phase != "closed", evidence.phase != "invalid",
    evidence' = { ...evidence, phase: "invalid", stickyInvalid: true,
      prefixIntact: false, rootsValid: false, authorityActive: false }
  }

  action unavailable = all {
    evidence.phase != "closed", evidence.phase != "invalid",
    evidence' = { ...evidence, phase: "unknown", stickyInvalid: true,
      writerPresent: false, authorityActive: false }
  }

  // Environment-labelled invalid observations share the same sticky reducer edge.
  action prefixRewrite = invalidate
  action prefixTruncate = invalidate
  action replacement = invalidate
  action wrongWriter = invalidate
  action wrongGeneration = invalidate
  action wrongSource = invalidate
  action contradictorySuffix = invalidate

  action close = all {
    evidence.phase != "closed",
    evidence' = { ...evidence, phase: "closed", authorityActive: false }
  }

  action step = any {
    acquire, sampleInitial, validate("browser"), validate("normalization"), validate("release"),
    consume("browser"), consume("normalization"), consume("release"),
    benignAppend, pendingTail, staleBoundary, prefixRewrite, prefixTruncate, replacement, wrongWriter,
    wrongGeneration, wrongSource, contradictorySuffix, unavailable, close,
    beginPolicy("invocation", "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"), readyPolicy("invocation", "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"),
    evaluatedPolicy("invocation", "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"), completePolicy("invocation", "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"), policyDrift,
  }

  val consumedOnlyValidated = evidence.consumedRevision == 0 or
    evidence.consumedRevision <= evidence.validatedRevision
  val currentConsumptionMatchesValidation = evidence.phase != "consumed" or
    evidence.consumedRevision == evidence.validatedRevision
  val authorityRequiresIdentity = not(evidence.authorityActive) or all {
    evidence.producerMatches, evidence.logMatches, evidence.sourceMatches,
    evidence.writerPresent, evidence.phase == "validated",
  }
  val invalidityIsSticky = not(evidence.stickyInvalid) or
    evidence.phase == "invalid" or evidence.phase == "unknown" or evidence.phase == "closed"
  val terminalCannotValidate = (evidence.phase != "invalid" and evidence.phase != "unknown" and evidence.phase != "closed") or
    evidence.validatedRevision <= evidence.observedRevision
  val boundaryIsClosed = evidence.consumedBoundary == "none" or
    evidence.consumedBoundary == "browser" or evidence.consumedBoundary == "normalization" or
    evidence.consumedBoundary == "release"
  val intendedBoundaryIsClosed = evidence.intendedBoundary == "none" or
    evidence.intendedBoundary == "browser" or evidence.intendedBoundary == "normalization" or
    evidence.intendedBoundary == "release"
  val policyAuthorityIsCausal = evidence.phase != "consumed" or all {
    evidence.policyPhase == "completed", evidence.policyInvocation != "none", evidence.policyClosure != "none",
  }
  val invariant = all {
    consumedOnlyValidated, currentConsumptionMatchesValidation,
    authorityRequiresIdentity, invalidityIsSticky, terminalCannotValidate, boundaryIsClosed,
    intendedBoundaryIsClosed, policyAuthorityIsCausal,
  }
}
