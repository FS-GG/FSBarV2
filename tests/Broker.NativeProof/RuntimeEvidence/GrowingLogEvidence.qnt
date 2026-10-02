module GrowingLogEvidence {
  // Opaque SHA-256 values name concrete byte strings. Codec qualification
  // independently derives them from bytes; collision resistance is assumed.
  type Prefix = { rawBytes: int, rawSha256: str, completeBytes: int, completeSha256: str,
    tailBytes: int, tailSha256: str, completeRecords: int, tailClass: str }
  type Consumption = { boundary: str, revision: int, rawBytes: int, rawSha256: str,
    readStartMicroseconds: int, readEndMicroseconds: int, linearizedMicroseconds: int,
    releasedMicroseconds: int, deadlineMicroseconds: int }
  pure val emptyPrefix = { rawBytes: 0, rawSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", completeBytes: 0, completeSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", tailBytes: 0, tailSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", completeRecords: 0, tailClass: "empty" }
  pure val noConsumption = { boundary: "none", revision: 0, rawBytes: 0, rawSha256: "", readStartMicroseconds: 0, readEndMicroseconds: 0, linearizedMicroseconds: 0, releasedMicroseconds: 0, deadlineMicroseconds: 0 }
  pure def historicalPrefix(bytes: int, hash: str): Prefix = { rawBytes: bytes, rawSha256: hash, completeBytes: bytes, completeSha256: hash, tailBytes: 0, tailSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", completeRecords: 1, tailClass: "empty" }
  pure def recombines(value: Prefix): bool = all { value.rawBytes >= 0, value.rawBytes <= 10485760,
    value.completeBytes >= 0, value.tailBytes >= 0, value.rawBytes == value.completeBytes + value.tailBytes,
    value.completeRecords >= 0, value.completeRecords <= 65536 }
  pure def safeTail(value: Prefix): bool = value.tailClass == "empty" or value.tailClass == "atlas"

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
    prefix: Prefix, consumedPrefix: Prefix, consumption: Consumption,
    producerBytes: int, producerContradiction: bool,
    candidateBytes: int, candidateSha256: str,
    finalPhase: str, finalSize: int, readStart: int, readEnd: int, linearized: int,
    evaluations: int, attemptId: int, probeCount: int, deadlineMicroseconds: int,

  }

  var evidence: Evidence

  action init = evidence' = {
    phase: "empty", generation: 0, observedRevision: 0, validatedRevision: 0,
    consumedRevision: 0, consumedBoundary: "none", intendedBoundary: "none", producerMatches: false,
    logMatches: false, sourceMatches: false, rootsValid: false,
    prefixIntact: false, writerPresent: false, authorityActive: false, stickyInvalid: false,
    policyPhase: "none", policyInvocation: "none", policyClosure: "none",
    settlement: { phase: "idle", boundary: "none", remaining: 32, deadlineAvailable: true },
    prefix: emptyPrefix, consumedPrefix: emptyPrefix, consumption: noConsumption,
    producerBytes: 0, producerContradiction: false, candidateBytes: 0, candidateSha256: "",
    finalPhase: "none", finalSize: 0, readStart: 0, readEnd: 0, linearized: 0, evaluations: 0, attemptId: 0, probeCount: 0, deadlineMicroseconds: 0,
  }

  action beginPolicy(invocation: str, closure: str): bool = all {
    evidence.phase != "invalid", evidence.phase != "unknown", evidence.phase != "closed",
    evidence.policyPhase == "none",
    evidence.settlement.phase == "idle" or evidence.settlement.phase == "candidate",
    evidence.settlement.deadlineAvailable,
    invocation != "none", closure != "none", evidence.evaluations <= 3,
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
    evidence.settlement.deadlineAvailable, evidence.settlement.remaining >= 0,
    evidence' = { ...evidence, authorityActive: false,
      settlement: { ...evidence.settlement, phase: "probing" } }
  }

  def canProbe: bool = all {
    evidence.settlement.phase == "probing", evidence.settlement.deadlineAvailable,
    evidence.settlement.remaining > 0,
  }

  action incompleteRecordProbe = all {
    canProbe,
    evidence' = { ...evidence,
      settlement: { ...evidence.settlement, phase: "probing", remaining: evidence.settlement.remaining - 1 } }
  }

  action completeRecordCandidate = all {
    canProbe,
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
      rootsValid: true, prefixIntact: true, prefix: historicalPrefix(100,"cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"), producerBytes: 100, evaluations: 1, attemptId: 1, probeCount: 1, deadlineMicroseconds: 5000000 }
  }

  action pendingCompleteResample = all {
    evidence.phase == "sampled", not(evidence.stickyInvalid),
    evidence.settlement.phase == "candidate", evidence.observedRevision < 3,
    evidence' = { ...evidence, observedRevision: evidence.observedRevision + 1,
      rootsValid: true, prefixIntact: true, authorityActive: false, prefix: historicalPrefix(120,"dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"), producerBytes: 120, evaluations: evidence.evaluations + 1, probeCount: evidence.probeCount + 1 }
  }

  action validate(boundary: str): bool = all {
    evidence.phase == "sampled",
    evidence.settlement.phase == "idle" or evidence.settlement.phase == "candidate",
    evidence.settlement.phase == "idle" or evidence.settlement.boundary == boundary,
    boundary == "browser" or boundary == "normalization" or boundary == "release",
    not(evidence.stickyInvalid), evidence.producerMatches, evidence.logMatches,
    evidence.sourceMatches, evidence.writerPresent, evidence.rootsValid,
    evidence.prefixIntact, safeTail(evidence.prefix), evidence.prefix.completeRecords > 0,
    evidence' = { ...evidence, phase: "validated",
      validatedRevision: evidence.observedRevision, intendedBoundary: boundary,
      authorityActive: false, candidateBytes: evidence.prefix.rawBytes, candidateSha256: evidence.prefix.rawSha256, finalPhase: "none" }
  }

  def canConsume(boundary: str): bool = all {
    evidence.phase == "validated",
    evidence.policyPhase == "completed",
    boundary == "browser" or boundary == "normalization" or boundary == "release",
    evidence.validatedRevision == evidence.observedRevision,
    evidence.intendedBoundary == boundary,
    evidence.settlement.deadlineAvailable,
    evidence.settlement.phase == "idle" or all { evidence.settlement.phase == "candidate", evidence.settlement.boundary == boundary },
    not(evidence.stickyInvalid),
  }

  pure def finalInterval(start: int, end: int, at: int, release: int, deadline: int): bool = all {
    start >= 0, end >= start, at >= end, release >= at, deadline > 0, deadline <= 5000000, release < deadline,
  }
  pure def consumedState(value: Evidence, boundary: str, start: int, end: int, at: int, release: int, deadline: int): Evidence = {
    ...value, phase: "consumed", consumedRevision: value.observedRevision, consumedBoundary: boundary,
    authorityActive: false, consumedPrefix: value.prefix, finalPhase: "released", finalSize: value.prefix.rawBytes,
    readStart: start, readEnd: end, linearized: at,
    consumption: { boundary: boundary, revision: value.observedRevision, rawBytes: value.prefix.rawBytes, rawSha256: value.prefix.rawSha256,
      readStartMicroseconds: start, readEndMicroseconds: end, linearizedMicroseconds: at, releasedMicroseconds: release, deadlineMicroseconds: deadline },
  }
  // Historical predecessor fixtures use one atomic final observation. New
  // concrete traces use the split read/size/release actions below.
  action consume(boundary: str): bool = all {
    canConsume(boundary), recombines(evidence.prefix), safeTail(evidence.prefix), evidence.prefix.completeRecords > 0,
    evidence' = consumedState(evidence,boundary,1,2,3,4,5000000),
  }
  action beginFinalRead(start: int): bool = all {
    (evidence.phase == "validated" or evidence.phase == "sampled"), evidence.policyPhase == "completed", not(evidence.stickyInvalid), evidence.finalPhase == "none", start >= 0,
    evidence' = { ...evidence, finalPhase: "reading", readStart: start },
  }
  action endFinalRead(end: int): bool = all {
    evidence.finalPhase == "reading", end >= evidence.readStart, evidence.prefixIntact,
    evidence' = { ...evidence, finalPhase: "read", readEnd: end },
  }
  action observeFinalSize(observedBytes: int, at: int): bool = all {
    evidence.finalPhase == "read", at >= evidence.readEnd, observedBytes == evidence.producerBytes, observedBytes >= evidence.prefix.rawBytes, observedBytes <= 10485760,
    evidence' = { ...evidence, finalSize: observedBytes, linearized: at,
      finalPhase: if (observedBytes == evidence.prefix.rawBytes) "unchanged" else "grown",
      authorityActive: false },
  }
  def canConsumeAt(boundary: str, release: int, deadline: int): bool = all {
    canConsume(boundary), evidence.finalPhase == "unchanged", evidence.finalSize == evidence.candidateBytes,
    evidence.prefix.rawBytes == evidence.candidateBytes, evidence.prefix.rawSha256 == evidence.candidateSha256,
    recombines(evidence.prefix), safeTail(evidence.prefix), evidence.prefix.completeRecords > 0, deadline == evidence.deadlineMicroseconds,
    finalInterval(evidence.readStart,evidence.readEnd,evidence.linearized,release,deadline),
  }
  action consumeAt(boundary: str, release: int, deadline: int): bool = all {
    canConsumeAt(boundary,release,deadline),
    evidence' = consumedState(evidence,boundary,evidence.readStart,evidence.readEnd,evidence.linearized,release,deadline),
  }
  action producerSize(observedBytes: int, contradictory: bool): bool = all {
    evidence.phase != "closed", observedBytes >= evidence.producerBytes,
    evidence' = { ...evidence, producerBytes: observedBytes, producerContradiction: evidence.producerContradiction or contradictory },
  }
  action producerAppend(bytes: int, contradictory: bool): bool = all {
    evidence.phase != "closed", bytes > 0,
    evidence' = { ...evidence, producerBytes: evidence.producerBytes + bytes,
      producerContradiction: evidence.producerContradiction or contradictory },
  }
  action observedGrowth = all {
    evidence.finalPhase == "grown", evidence.finalSize > evidence.candidateBytes,
    evidence' = { ...evidence, phase: "sampled", rootsValid: false, authorityActive: false,
      candidateBytes: 0, candidateSha256: "", finalPhase: "none", policyPhase: "none", policyInvocation: "none", policyClosure: "none" },
  }
  action retryObserved(boundary: str): bool = all {
    evidence.settlement.phase == "candidate", evidence.settlement.boundary == boundary,
    evidence.settlement.deadlineAvailable, evidence.settlement.remaining >= 0,
    evidence.phase == "sampled" or evidence.phase == "validated",
    evidence' = { ...evidence, phase: "sampled", candidateBytes: 0, candidateSha256: "", finalPhase: "none",
      policyPhase: "none", policyInvocation: "none", policyClosure: "none",
      settlement: { ...evidence.settlement, phase: "probing" } },
  }
  action revokeObserved(missing: bool): bool = all {
    not(evidence.stickyInvalid),
    evidence' = { ...evidence, phase: if (missing) "unknown" else "invalid", stickyInvalid: true,
      candidateBytes: 0, candidateSha256: "", authorityActive: false,
      writerPresent: if (missing) false else evidence.writerPresent },
  }
  action rejectRaw(value: Prefix, attempt: int, probes: int, evaluation: int, deadline: int): bool = all {
    recombines(value), value.rawBytes >= evidence.prefix.rawBytes, evaluation > 0, evaluation <= 3, probes > 0, probes <= 32,
    deadline > 0, deadline <= 5000000,
    (attempt == evidence.attemptId and evaluation == evidence.evaluations + 1 and probes > evidence.probeCount and deadline == evidence.deadlineMicroseconds)
      or (attempt == evidence.attemptId + 1 and evaluation == 1 and (evidence.phase == "acquired" or evidence.phase == "consumed")),
    evidence' = { ...evidence, phase: "invalid", stickyInvalid: true, rootsValid: false, prefixIntact: true,
      prefix: value, producerBytes: if (evidence.producerBytes > value.rawBytes) evidence.producerBytes else value.rawBytes,
      attemptId: attempt, probeCount: probes, evaluations: evaluation, deadlineMicroseconds: deadline,
      observedRevision: evidence.observedRevision + 1, candidateBytes: 0, candidateSha256: "", authorityActive: false },
  }
  action observeRaw(value: Prefix, roots: bool, attempt: int, probes: int, evaluation: int, deadline: int): bool = all {
    evidence.phase == "acquired" or evidence.phase == "sampled" or evidence.phase == "validated" or evidence.phase == "consumed",
    not(evidence.stickyInvalid), evidence.writerPresent, evidence.prefixIntact or evidence.phase == "acquired",
    recombines(value), value.rawBytes >= evidence.prefix.rawBytes,
    probes > 0, probes <= 32, evaluation > 0, evaluation <= 3, deadline > 0, deadline <= 5000000,
    (attempt == evidence.attemptId and evaluation == evidence.evaluations + 1 and probes > evidence.probeCount and deadline == evidence.deadlineMicroseconds)
      or (attempt == evidence.attemptId + 1 and evaluation == 1 and (evidence.phase == "acquired" or evidence.phase == "consumed")),
    evidence' = { ...evidence, phase: "sampled", observedRevision: evidence.observedRevision + 1,
      prefix: value, rootsValid: roots, prefixIntact: true, producerBytes: if (evidence.producerBytes > value.rawBytes) evidence.producerBytes else value.rawBytes, attemptId: attempt, probeCount: probes, evaluations: evaluation, deadlineMicroseconds: deadline,
      candidateBytes: 0, candidateSha256: "", authorityActive: false, finalPhase: "none" },
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
      policyPhase: "none", policyInvocation: "none", policyClosure: "none",
      prefix: if (evidence.observedRevision == 1) historicalPrefix(120,"dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd") else historicalPrefix(140,"eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
      producerBytes: if (evidence.observedRevision == 1) 120 else 140,
      attemptId: evidence.attemptId + 1, probeCount: 1, evaluations: 1, finalPhase: "none", candidateBytes: 0, candidateSha256: "" }
  }

  action pendingTail = all {
    evidence.phase == "acquired",
    evidence' = { ...evidence, phase: "sampled", observedRevision: 1,
      rootsValid: false, prefixIntact: true, authorityActive: false, prefix: historicalPrefix(100,"cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"), producerBytes: 100, evaluations: 1, attemptId: 1, probeCount: 1, deadlineMicroseconds: 5000000 }
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
    beginFinalRead(1), endFinalRead(2), observeFinalSize(evidence.prefix.rawBytes,3),
    consumeAt("browser",4,5000000), consumeAt("normalization",4,5000000), consumeAt("release",4,5000000),
    producerAppend(1,false), producerAppend(1,true), observedGrowth,
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
  val prefixRecombines = recombines(evidence.prefix)
  val candidateHasNoReusableAuthority = not(evidence.authorityActive)
  val consumedHorizonIsNamed = evidence.phase != "consumed" or all {
    evidence.consumedPrefix == evidence.prefix, evidence.consumption.rawBytes == evidence.prefix.rawBytes,
    evidence.consumption.rawSha256 == evidence.prefix.rawSha256, evidence.finalSize == evidence.prefix.rawBytes,
    safeTail(evidence.prefix), evidence.rootsValid, evidence.prefix.completeRecords > 0,
    finalInterval(evidence.consumption.readStartMicroseconds,evidence.consumption.readEndMicroseconds,evidence.consumption.linearizedMicroseconds,evidence.consumption.releasedMicroseconds,evidence.consumption.deadlineMicroseconds),
  }
  val evaluationsAreBounded = evidence.evaluations >= 0 and evidence.evaluations <= 3
  val invariant = all {
    prefixRecombines, candidateHasNoReusableAuthority, consumedHorizonIsNamed, evaluationsAreBounded,
    consumedOnlyValidated, currentConsumptionMatchesValidation,
    authorityRequiresIdentity, invalidityIsSticky, terminalCannotValidate, boundaryIsClosed,
    intendedBoundaryIsClosed, policyAuthorityIsCausal, settlementIsBounded, waitingDoesNotAuthorize,
    terminalSettlementDoesNotAuthorize, settlementBoundaryIsClosed, idleSettlementHasNoBoundary,
  }
}
