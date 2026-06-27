/**
 * Bundles scripts/completar.test.mts on the fly with esbuild (a transitive dep of vite)
 * and runs it on Node. Avoids adding a heavy test runner for a handful of pure-logic tests.
 */
import { build } from "esbuild";
import { tmpdir } from "os";
import { join } from "path";
import { pathToFileURL } from "url";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const entry = join(__dirname, "completar.test.mts");
const out = join(tmpdir(), `completar-test-${Date.now()}.mjs`);

await build({
  entryPoints: [entry],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: out,
  loader: { ".json": "json" },
  logLevel: "warning",
});

await import(pathToFileURL(out).href);
