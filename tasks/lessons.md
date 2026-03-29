# Lessons Learned

## 2026-03-29: Gemini model versioning
**Failure mode:** Suggested Gemini 2.5 Flash when 3.1/3 Flash was available.
**Detection signal:** User corrected twice, increasingly frustrated.
**Prevention rule:** NEVER guess Gemini model versions from memory. Always check project memory or do a web search. The confirmed model for this project is `gemini-3-flash-preview`.

## 2026-03-29: Attie image checkerboard
**Failure mode:** Nano Banana Pro generates images with checkerboard pattern baked into the pixel data (not true alpha transparency), despite the PNG having a 4-channel RGBA format.
**Detection signal:** Checkerboard visible in browser against non-white backgrounds.
**Prevention rule:** Always verify alpha transparency by checking corner pixel values after conversion. If RGB values are ~220-226 or ~250-255 with no saturation, the "transparency" is fake. Run the aggressive checkerboard removal script.

## 2026-03-29: Sticky quest bar size
**Failure mode:** Initial quest bar had 5 stat cards + 6 route nodes = massive sticky element eating half the viewport.
**Detection signal:** Visual inspection showed bar consuming too much screen real estate.
**Prevention rule:** Sticky elements should be single-line. A compact nav bar with emoji + numbers beats a dashboard-style grid that follows you down the page.

## 2026-03-29: Next.js type-checking scripts directory
**Failure mode:** Build-time scripts in `scripts/` used dynamic imports (`pdf-parse`, `mammoth`) that Next.js tried to type-check and failed.
**Detection signal:** `npm run build` failed with type errors in script files.
**Prevention rule:** Add `"scripts"` to `tsconfig.json` `exclude` array when scripts use Node-only packages not compatible with Next.js bundling.
