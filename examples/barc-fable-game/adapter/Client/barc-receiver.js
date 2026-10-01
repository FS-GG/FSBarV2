const moduleUrl = new URL(
  "./barc-preview/src/Broker.Browser.Client/dist/assets/barc-preview.js",
  document.baseURI
);
const { mount } = await import(/* @vite-ignore */ moduleUrl.href);

const root = document.getElementById("barc-preview-root");

if (!(root instanceof HTMLElement)) {
  throw new Error("BAR preview root is missing");
}

const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = new URL(
  "./barc-preview/src/Broker.Browser.Client/dist/assets/barc-preview.css",
  document.baseURI
).href;
document.head.appendChild(stylesheet);

const profile = new URL(document.location.href).searchParams.get("barc-profile");
if (
  profile !== null &&
  profile !== "barc-preview-v1" &&
  profile !== "barc-live-v1" &&
  profile !== "barc-live-tactical-v1" &&
  profile !== "barc-live-tactical-stock-v1"
) {
  throw new Error(`Unsupported BAR receiver profile: ${profile}`);
}

// Empty initial values deliberately leave endpoint, expected session UUID, and
// credential entry to the product's visible controls. Pairing values stay in memory.
// Omission preserves the exact preview route; live is an explicit receiver opt-in.
const options = {
  assetBaseUrl: new URL("./barc-preview/", document.baseURI).href
};
if (profile === "barc-live-v1" || profile === "barc-live-tactical-v1" || profile === "barc-live-tactical-stock-v1") {
  options.profile = profile;
}
const dispose = mount(root, options);

window.addEventListener("pagehide", () => dispose(), { once: true });
