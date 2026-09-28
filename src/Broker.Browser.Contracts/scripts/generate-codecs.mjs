import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const out = resolve(root, "generated");
mkdirSync(out, { recursive: true });
const pbjs = resolve(root, "node_modules", ".bin", "pbjs");
const pbts = resolve(root, "node_modules", ".bin", "pbts");
execFileSync(pbjs, ["-t", "static-module", "-w", "es6", "--force-long", "--no-create", "--no-verify", "-o", resolve(out, "barc_browser.js"), resolve(root, "barc_browser.proto"), resolve(root, "barc_live.proto")], { stdio: "inherit" });
execFileSync(pbts, ["-o", resolve(out, "barc_browser.d.ts"), resolve(out, "barc_browser.js")], { stdio: "inherit" });
