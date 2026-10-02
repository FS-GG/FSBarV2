module GrowingLogEvidence {
  type Settlement = { phase: str, boundary: str, remaining: int, deadlineAvailable: bool }
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
    settlement: Settlement,
  }

  var evidence: Evidence

  action init = evidence' = {
    phase: "empty", generation: 0, observedRevision: 0, validatedRevision: 0,
    consumedRevision: 0, consumedBoundary: "none", intendedBoundary: "none", producerMatches: false,
    logMatches: false, sourceMatches: false, rootsValid: false,
    prefixIntact: false, writerPresent: false, authorityActive: false, stickyInvalid: false,
    policyPhase: "none", policyInvocation: "none", policyClosure: "none",
    settlement: { phase: "idle", boundary: "none", remaining: 32, deadlineAvailable: true },
  }

  action beginPolicy(invocation: str, closure: str): bool = all {
    evidence.phase != "invalid", evidence.phase != "unknown", evidence.phase != "closed",
    evidence.policyPhase == "none",
    evidence.settlement.phase == "idle" or evidence.settlement.phase == "candidate",
    evidence.settlement.deadlineAvailable,
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

  def canBeginSettlement(boundary: str): bool = all {
    evidence.phase != "invalid", evidence.phase != "unknown", evidence.phase != "closed",
    evidence.settlement.phase == "idle",
    boundary == "browser" or boundary == "normalization" or boundary == "release",
  }

  action beginSettlement(boundary: str): bool = all {
    canBeginSettlement(boundary),
    evidence' = { ...evidence, authorityActive: false,
      settlement: { phase: "probing", boundary: boundary, remaining: 32, deadlineAvailable: true } }
  }

  action retrySettlement(boundary: str): bool = all {
    evidence.phase != "invalid", evidence.phase != "unknown", evidence.phase != "closed",
    evidence.settlement.phase == "candidate", evidence.settlement.boundary == boundary,
    evidence.settlement.deadlineAvailable, evidence.settlement.remaining > 0,
    evidence' = { ...evidence, authorityActive: false,
      settlement: { ...evidence.settlement, phase: "probing" } }
  }

  action incompleteRecordProbe = all {
    evidence.settlement.phase == "probing", evidence.settlement.deadlineAvailable,
    evidence.settlement.remaining > 0,
    evidence' = { ...evidence,
      settlement: { ...evidence.settlement, phase: "probing", remaining: evidence.settlement.remaining - 1 } }
  }

  action completeRecordCandidate = all {
    evidence.settlement.phase == "probing", evidence.settlement.deadlineAvailable,
    evidence.settlement.remaining > 0,
    evidence' = { ...evidence,
      settlement: { ...evidence.settlement, phase: "candidate", remaining: evidence.settlement.remaining - 1 } }
  }

  action recordSettlementExhausted = all {
    evidence.settlement.phase == "probing", evidence.settlement.remaining == 0,
    evidence' = { ...evidence, authorityActive: false,
      settlement: { ...evidence.settlement, phase: "refused" } }
  }

  action recordSettlementDeadline = all {
    evidence.settlement.phase == "probing",
    evidence' = { ...evidence, authorityActive: false,
      settlement: { ...evidence.settlement, phase: "deadline", deadlineAvailable: false } }
  }

  action sampleInitial = all {
    evidence.phase == "acquired",
    evidence.settlement.phase == "idle" or evidence.settlement.phase == "candidate",
    evidence' = { ...evidence, phase: "sampled", observedRevision: 1,
      rootsValid: true, prefixIntact: true }
  }

  action pendingCompleteResample = all {
    evidence.phase == "sampled", not(evidence.stickyInvalid),
    evidence.settlement.phase == "candidate", evidence.observedRevision < 3,
    evidence' = { ...evidence, observedRevision: evidence.observedRevision + 1,
      rootsValid: true, prefixIntact: true, authorityActive: false }
  }

  action validate(boundary: str): bool = all {
    evidence.phase == "sampled",
    evidence.settlement.phase == "idle" or evidence.settlement.phase == "candidate",
    evidence.settlement.phase == "idle" or evidence.settlement.boundary == boundary,
    boundary == "browser" or boundary == "normalization" or boundary == "release",
    not(evidence.stickyInvalid), evidence.producerMatches, evidence.logMatches,
    evidence.sourceMatches, evidence.writerPresent, evidence.rootsValid,
    evidence.prefixIntact,
    evidence' = { ...evidence, phase: "validated",
      validatedRevision: evidence.observedRevision, intendedBoundary: boundary,
      authorityActive: true }
  }

  def canConsume(boundary: str): bool = all {
    evidence.phase == "validated",
    evidence.policyPhase == "completed",
    boundary == "browser" or boundary == "normalization" or boundary == "release",
    evidence.validatedRevision == evidence.observedRevision,
    evidence.intendedBoundary == boundary,
    evidence.authorityActive, evidence.settlement.deadlineAvailable,
    evidence.settlement.phase == "idle" or all { evidence.settlement.phase == "candidate", evidence.settlement.boundary == boundary },
    not(evidence.stickyInvalid),
  }

  action consume(boundary: str): bool = all {
    canConsume(boundary),
    evidence' = { ...evidence, phase: "consumed",
      consumedRevision: evidence.observedRevision, consumedBoundary: boundary,
      authorityActive: false }
  }

  action completeBoundary(boundary: str): bool = all {
    evidence.phase == "consumed", evidence.consumedBoundary == boundary,
    evidence.settlement.phase == "idle" or all { evidence.settlement.phase == "candidate", evidence.settlement.boundary == boundary },
    evidence' = { ...evidence,
      settlement: { ...evidence.settlement, phase: "idle", boundary: "none" } }
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
    acquire, beginSettlement("browser"), beginSettlement("normalization"), beginSettlement("release"),
    retrySettlement("browser"), retrySettlement("normalization"), retrySettlement("release"), incompleteRecordProbe, completeRecordCandidate,
    recordSettlementExhausted, recordSettlementDeadline, pendingCompleteResample,
    sampleInitial, validate("browser"), validate("normalization"), validate("release"),
    consume("browser"), consume("normalization"), consume("release"),
    completeBoundary("browser"), completeBoundary("normalization"), completeBoundary("release"),
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
  val settlementIsBounded = evidence.settlement.remaining >= 0 and evidence.settlement.remaining <= 32
  val waitingDoesNotAuthorize = evidence.settlement.phase != "probing" or not(evidence.authorityActive)
  val terminalSettlementDoesNotAuthorize =
    (evidence.settlement.phase != "deadline" and evidence.settlement.phase != "refused") or not(evidence.authorityActive)
  val settlementBoundaryIsClosed = evidence.settlement.boundary == "none" or evidence.settlement.boundary == "browser" or evidence.settlement.boundary == "normalization" or evidence.settlement.boundary == "release"
  val idleSettlementHasNoBoundary = evidence.settlement.phase != "idle" or evidence.settlement.boundary == "none"
  val invariant = all {
    consumedOnlyValidated, currentConsumptionMatchesValidation,
    authorityRequiresIdentity, invalidityIsSticky, terminalCannotValidate, boundaryIsClosed,
    intendedBoundaryIsClosed, policyAuthorityIsCausal, settlementIsBounded, waitingDoesNotAuthorize,
    terminalSettlementDoesNotAuthorize, settlementBoundaryIsClosed, idleSettlementHasNoBoundary,
  }
}
