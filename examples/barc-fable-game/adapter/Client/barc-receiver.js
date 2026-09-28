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

// Empty initial values deliberately leave endpoint, expected session UUID, and
// credential entry to the product's visible controls. Pairing values stay in memory.
const dispose = mount(root, {
  assetBaseUrl: new URL("./barc-preview/", document.baseURI).href
});

window.addEventListener("pagehide", () => dispose(), { once: true });
