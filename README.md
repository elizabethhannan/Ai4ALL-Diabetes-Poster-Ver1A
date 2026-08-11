# GE-79 MCI Research Poster — Version 2.5.1

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

## Custom visual insertion

The `.brain-placeholder` card in `index.html` is intentionally reserved for the brain-dots animation. It can be replaced with an iframe, a canvas element, or the final JavaScript component while keeping the layout intact.

## Evidence labels

The mini visualizations are explanatory figures, not screenshots: Logistic Regression shows its five recorded performance measures, Decision Tree represents its branching decision logic, and Random Forest represents its ensemble of trees. The grouped chart is the authoritative cross-model comparison and is generated only from `data.js`.

## License

The site declares CC BY-NC 4.0 for original poster materials. It does not override PhysioNet dataset access, attribution, or reuse terms.
# Version 2.5 update

This version retains every existing visualization and adds the project-owned model-results summary graphic, a shared confusion-matrix reading key, an explicit non-causation statement for SHAP interpretation, a layperson Takeaways section, and a Group 6C Prototype App QR/link placeholder. Replace `REPLACE_WITH_GROUP_6C_PROTOTYPE_APP_URL` in `data.js` before publishing.
