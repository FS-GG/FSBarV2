# BARC browser client tests

The tests compile the real Fable/Elmish state machine, apply the shared wire
corpus to the client boundary, and run Chromium against the production bundle,
protobuf codec, dedicated Worker, and Rust manual guest.

```sh
cd src/Broker.Browser.Contracts && npm ci --ignore-scripts
cd ../Broker.Browser.Client && npm ci --ignore-scripts && npm run build
cd ../../tests/Broker.Browser.Client.Tests
npm ci --ignore-scripts
../../scripts/build-barc-guests.sh
npm test
```

After building `src/Broker.Browser.Preview` in Release, run the joined product
journey with:

```sh
BARC_RUN_ACTUAL_COMPANION=1 npm run test:actual
```

That test starts the actual companion at `/barc/`, pairs through its private
0600 handoff, exercises both bundled guests and custom file import, spans the
fixture's complete/stale/recovery/replacement lifecycle, records Chromium frame
processing p95/max and artifact hashes, and accepts the independent native-zero
qualification receipt only after clean companion teardown.

The browser test server is loopback-only. Its synthetic WebSocket supplies the
same frozen protobuf envelopes as the product gateway; the companion executable
owns the joined production transport acceptance.
