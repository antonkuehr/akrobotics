# Editable navbar wordmark

Open [motion-preview.html](motion-preview.html) locally, or visit it through the local preview server. The editor loads the **installed** website geometry, settings, engine and CSS; it has no public navigation link.

- Motion: edit [wordmark-settings.js](../../assets/js/wordmark-settings.js), or download revised settings from the editor and replace that file.
- Geometry: edit the SVGs in `editable-shapes/`, preserving the path IDs and font-space group, then run from the repository root:

  ```sh
  python3 tools/wordmark-motion-preview/tools/import-shape.py wide tools/wordmark-motion-preview/editable-shapes/wide.svg
  ```

  The importer updates `editable-shapes/shapes.json` and the **installed** [wordmark-shapes.js](../../assets/js/wordmark-shapes.js) directly. No duplicate runtime copy needs synchronising.

Advance the changed asset's cache query in all eight shared-navbar pages and the editor. Changes to the resting geometry also require updating the static wordmark, inline initial paths and favicon assets; the importer does not regenerate them.

Editable source artwork and the importer remain here. Original ZIP uploads, duplicate markup and preparation notes are stored locally under the ignored `.local-notes/repository-cleanup-2026-10-19/` archive; they are not website assets. The paths above describe the installed integration.

The website engine also watches ancestor visibility so its introduction waits for the current homepage navbar to finish appearing. It retains the supplied timing, geometry, session persistence and reduced-motion behaviour. The hero now uses the same editable animation, with an independent per-session intro count so it never consumes the navbar introduction. Both use the shared motion settings and pause when hidden or reduced motion is enabled.
