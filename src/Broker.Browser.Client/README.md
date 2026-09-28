# BARC browser client

This package builds the reusable read-only tactical preview component. It owns
pairing, strict incoming-envelope validation, guest lifecycle and the DOM/SVG
view. It has no native command transport.

```js
import { mount } from "./assets/barc-preview.js";

const handle = mount(document.querySelector("#barc-preview"), {
  assetBaseUrl: new URL("./", document.baseURI).href,
});
// Later: handle.dispose()
```

`assetBaseUrl` must be an absolute trusted asset root ending in `/`. Optional
`initialGatewayUrl`, `initialExpectedSessionId`, and `initialCredential` values
are held in memory only. The
standard companion leaves them unset so an operator pairs through the visible
controls with credentials received through its private ready file.

Pointer, arrow-key, and numeric target input share one domain path and a
0.25-world-unit target quantum. The quantized coordinate is the protobuf guest
input. Validated guest output remains byte-semantically raw; display formatting
does not rewrite coordinates produced by an independently authored guest.

Build with the repository-pinned Fable 5.18.0 tool and exact package locks:

```sh
dotnet restore Broker.Browser.Client.fsproj --locked-mode
npm ci --ignore-scripts
npm run build
```
