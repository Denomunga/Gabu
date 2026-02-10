// Root entry that forwards to the server source so external builds
// (e.g. Render's `npx esbuild src/index.ts ...`) find the correct file.
import './server/src/index.ts';
