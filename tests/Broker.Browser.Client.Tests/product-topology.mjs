export function selectProductUrl(ready, environment = process.env) {
  const externalReady = environment.BARC_EXTERNAL_READY_FILE;
  const externalProduct = environment.BARC_EXTERNAL_PRODUCT_URL;
  if (externalProduct && !externalReady) throw new Error("BARC_EXTERNAL_PRODUCT_URL requires BARC_EXTERNAL_READY_FILE");
  const selected = externalProduct || ready.staticBaseUrl;
  let parsed;
  try { parsed = new URL(selected); }
  catch { throw new Error("BARC product URL must be absolute"); }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("BARC product URL must use HTTP or HTTPS");
  return selected;
}
