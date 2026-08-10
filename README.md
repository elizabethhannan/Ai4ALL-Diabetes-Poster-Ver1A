# GE-79 MCI Research Poster — Version 2.0

Static GitHub Pages poster built to address the AI4ALL GitHub Page rubric at the highest standard:

- clear project overview, scientific context, inputs, output, and evolution;
- one accurate, interpretable visualization per model plus a complete metric comparison;
- direct model-selection rationale and metric definitions;
- explicit bias, mitigation, societal-impact, and future-validation sections;
- four QR-code resource cards, visible URLs, citations, and a code/documentation link.

## Publish

Upload `index.html`, `styles.css`, `script.js`, and `data.js` to the root of `Ai4ALL-Diabetes-Poster-Ver1A`, commit, then set **Settings → Pages → Deploy from a branch → main → / (root)**.

## Before publishing

The public presentation and coauthor links are set in `data.js`. The values in `models[].values` match the final Streamlit model-results comparison: Logistic Regression (0.547 / 0.508 / 0.500 / 0.534 / 0.369), Decision Tree (0.627 / 0.580 / 0.550 / 0.639 / 0.370), and Random Forest (0.747 / 0.594 / 0.250 / 0.648 / 0.441). This one file supplies every generated result chart, preventing mismatched numbers across the page.

## Custom visual insertion

The `.brain-placeholder` card in `index.html` is intentionally reserved for the brain-dots animation. It can be replaced with an iframe, a canvas element, or the final JavaScript component while keeping the layout intact.

## Evidence labels

The mini visualizations are explanatory figures, not screenshots: Logistic Regression shows its five recorded performance measures, Decision Tree represents its branching decision logic, and Random Forest represents its ensemble of trees. The grouped chart is the authoritative cross-model comparison and is generated only from `data.js`.

## License

The site declares CC BY-NC 4.0 for original poster materials. It does not override PhysioNet dataset access, attribution, or reuse terms.
