# BARC browser contracts

`barc_browser.proto` is the only payload schema for the read-only BAR preview
and guest ABI. Its protobuf package is `barc.browser.v1`; generated .NET types
use `Broker.Browser.Contracts`. The checked-in browser codec is an ES module
exporting `barc.browser.v1` plus `codec.js`, whose canonical conversion renders
every 64-bit integer as a decimal string.

Pinned generation:

```console
npm ci --ignore-scripts
npm run generate
npm run corpus
```

The pins are protobuf.js 8.8.0, protobufjs-cli 2.7.0, Long 5.3.2,
Google.Protobuf 3.34.1 and Grpc.Tools 2.76.0. The corpus manifest binds the
schema, every wire fixture and their ordered bundle hash. Generated code is
reviewed source; `node_modules`, build outputs and package publication are not
part of this preview.
