# GE-79 MCI Research Poster — Version 2.5.5

Static GitHub Pages poster built to address the AI4ALL GitHub Page rubric at the highest standard:

- clear project overview, scientific context, inputs, output, and evolution;
- one accurate, interpretable visualization per model plus the five-metric Streamlit comparison;
- direct model-selection rationale and metric definitions;
- explicit bias, mitigation, societal-impact, and future-validation sections;
- four QR-code resource cards, visible URLs, citations, and a code/documentation link.

## Publish

Upload `index.html`, `styles.css`, `script.js`, and `data.js` to the root of `Ai4ALL-Diabetes-Poster-Ver1A`, commit, then set **Settings → Pages → Deploy from a branch → main → / (root)**.

## Before publishing

Open `data.js` and replace `REPLACE_WITH_PUBLIC_SLIDES_URL` with the public presentation URL. The poster now matches the supplied Streamlit comparison: Accuracy, Macro F1, impaired recall, ROC-AUC, and PR-AUC. This one file supplies every result chart, so it prevents mismatched numbers across the page.

## Interactive brain visual

The first header panel now contains a self-contained canvas animation; no React, npm package, or D3 installation is required. It uses `assets/brain/brain-head.png` as an overlay, removes its aqua backdrop in the browser, recolors its near-black elements to the poster’s dark evergreen, and preserves its 1 px white outline. Move the pointer over the panel to gently displace the particle field.

## Add the presentation video

The optional video card appears directly beneath **01 · Question and Study Design**. Export a compressed MP4 that is under 10 minutes, name it `group-6c-presentation.mp4`, and upload it to `assets/video/`. It will play in place on GitHub Pages. Keep the file reasonably small (ideally under 100 MB); GitHub will reject individual files larger than 100 MB.

## Evidence labels

The mini visualizations are explanatory figures, not screenshots: Logistic Regression shows its five recorded performance measures, Decision Tree represents its branching decision logic, and Random Forest represents its ensemble of trees. The grouped chart is the authoritative cross-model comparison and is generated only from `data.js`.

## License

The site declares CC BY-NC 4.0 for original poster materials. It does not override PhysioNet dataset access, attribution, or reuse terms.
# Version 2.5 update

This version retains the existing visualizations, combines the model-results interpretation into Figure 1, adds the supplied Streamlit performance/SHAP evidence panel as Figure 2, adds supplied QR assets, places coauthor QR links in the header, includes APA 7 references, preserves the SHAP non-causation statement, and includes layperson Takeaways.
