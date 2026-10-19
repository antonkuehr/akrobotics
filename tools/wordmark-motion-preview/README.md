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

The website engine watches ancestor visibility so its introduction waits for the homepage navbar to finish appearing. The navbar plays one cycle on each appearance, then repeats every 10 seconds. The hero plays two cycles initially, one cycle when it reappears after scrolling away, and two cycles at each recurring 30–45 second interval. Recurring intervals are measured between cycle starts; the first idle interval begins after the introduction finishes. Reloading or clicking the navbar home link resets both logos. Hidden logos and tabs stop scheduling, and reduced motion keeps the resting smiley static. Motion timing and geometry remain editable in the installed settings files.
