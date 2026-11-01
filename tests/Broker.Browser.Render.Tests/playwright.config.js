// Chromium launch flags: the fdev runner exports its own (GPU or software) as FDEV_CHROMIUM_ARGS_JSON; the hosted
// runner has no GPU, so it uses software WebGL (SwiftShader), which is enough for the real WebGL backends.
const args = process.env.FDEV_CHROMIUM_ARGS_JSON ? JSON.parse(process.env.FDEV_CHROMIUM_ARGS_JSON) : ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"];
export default { testDir: "browser", testMatch: "*.spec.js", timeout: 60000, use: { browserName: "chromium", headless: true, launchOptions: { args } } };
