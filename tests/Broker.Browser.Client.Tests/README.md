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

The browser test server is loopback-only. Its synthetic WebSocket supplies the
same frozen protobuf envelopes as the product gateway; the companion executable
owns the joined production transport acceptance.
