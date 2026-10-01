module GrowingLogEvidence_test {
  import GrowingLogEvidence.* from "./GrowingLogEvidence"

  run healthyBoundaries = init.then(acquire).then(sampleInitial).then(validate("browser"))
    .then(consume("browser")).then(benignAppend).then(validate("normalization"))
    .then(consume("normalization")).then(benignAppend).then(validate("release"))
    .then(consume("release")).expect(invariant and evidence.consumedRevision == 3)

  run rewriteIsSticky = init.then(acquire).then(sampleInitial).then(validate("browser"))
    .then(consume("browser")).then(invalidate).then(close)
    .expect(invariant and evidence.stickyInvalid and evidence.phase == "closed")

  run unavailableCannotGrant = init.then(acquire).then(unavailable).then(close)
    .expect(invariant and evidence.validatedRevision == 0 and evidence.consumedRevision == 0)

  run truncateIsSticky = init.then(acquire).then(sampleInitial).then(prefixTruncate).then(close).expect(invariant and evidence.stickyInvalid)
  run replacementIsSticky = init.then(acquire).then(sampleInitial).then(replacement).then(close).expect(invariant and evidence.stickyInvalid)
  run wrongWriterIsSticky = init.then(acquire).then(sampleInitial).then(wrongWriter).then(close).expect(invariant and evidence.stickyInvalid)
  run wrongGenerationIsSticky = init.then(acquire).then(sampleInitial).then(wrongGeneration).then(close).expect(invariant and evidence.stickyInvalid)
  run wrongSourceIsSticky = init.then(acquire).then(sampleInitial).then(wrongSource).then(close).expect(invariant and evidence.stickyInvalid)
  run contradictorySuffixIsSticky = init.then(acquire).then(sampleInitial).then(contradictorySuffix).then(close).expect(invariant and evidence.stickyInvalid)
}
