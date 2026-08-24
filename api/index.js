// Committed entrypoint so Vercel's zero-config function detection finds a
// file here at build time. The real server is bundled by esbuild (see the
// "vercel-build" script) into ./_serverless-bundle.mjs, which is a fully
// self-contained ESM file (no extension-less relative imports), avoiding
// Node's native ESM loader crashing with ERR_MODULE_NOT_FOUND.
const mod = await import("./_serverless-bundle.mjs");
export default mod.default;
