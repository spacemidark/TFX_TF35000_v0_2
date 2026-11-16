# TFX changelog

## v0.2.0 — Content Studio

- Visible application branding is now `TFX` / `Created by Emine Yasan` / `TF35000`.
- Windows Electron product name and window title changed to TFX.
- Added local-first Content Studio for component metadata, custom components, chapter text and image overrides.
- Added IndexedDB persistence and JSON backup import/export.
- User-authored content is safely rendered as plain Markdown-like text (not arbitrary HTML or executable MDX).
- Retained all bundled illustrative image files unchanged.
- Added Turkish step-by-step user guide.

**Build status:** Source syntax checks and editor/store TypeScript checks were run. Full Vite/Electron packaging was not tested in this environment because npm dependency installation could not complete. No prebuilt EXE is included.
