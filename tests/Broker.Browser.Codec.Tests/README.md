# Fable browser codec compatibility

This executable is F# compiled by Fable 5.18.0. Its adapter imports the checked-in
`Broker.Browser.Contracts/generated/codec.js`; it contains no protobuf decoder and
does not reference the native C# contract assembly.

From the repository root, restore the exact dependencies and compile with the
repository-pinned Fable tool:

```console
dotnet restore tests/Broker.Browser.Codec.Tests/Broker.Browser.Codec.Tests.fsproj
npm ci --ignore-scripts --prefix src/Broker.Browser.Contracts
npm ci --ignore-scripts --prefix tests/Broker.Browser.Codec.Tests
dotnet tool run fable tests/Broker.Browser.Codec.Tests/Broker.Browser.Codec.Tests.fsproj \
  --outDir tests/Broker.Browser.Codec.Tests/output --noCache
npm test --prefix tests/Broker.Browser.Codec.Tests
```

`Fable.Core` is locked to 5.3.0 and the emitted Fable library is locked to 2.8.0.
The run consumes the unchanged shared manifest, wire files and semantic JSON.
