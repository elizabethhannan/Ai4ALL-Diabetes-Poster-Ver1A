/* Version 2.0 — single source of truth for all poster numbers and public destinations. */
window.POSTER_DATA = {
  study: { participants: 75, variables: 46, features: 14, noImpairment: 55, impaired: 20, folds: 5 },
  models: [
    { id: "lr", short: "Model 1", name: "Logistic Regression", role: "Interpretable baseline", values: [75, 51, 45, 64, 41], takeaway: "A transparent baseline that makes the tradeoffs visible." },
    { id: "dt", short: "Model 2", name: "Decision Tree", role: "Interpretable branching classifier", values: [67, 56, 65, 60, 39], takeaway: "Recovered the largest share of impaired cases, but did not lead overall." },
    { id: "rf", short: "Model 3", name: "Random Forest", role: "Ensemble classifier", values: [80, 64, 55, 74, 49], takeaway: "Led four of five aggregate metrics; SHAP was used for interpretation." }
  ],
  metrics: ["Accuracy", "Macro F1", "Impaired recall", "ROC-AUC", "PR-AUC"],
  links: {
    poster: "https://elizabethhannan.github.io/Ai4ALL-Diabetes-Poster-Ver1A/",
    code: "https://github.com/elizabethhannan/AI4ALL_ClinicalMedicalDiabeties_EH-PRIVATE",
    prototype: "https://ai4all-diabetes-app-ml-model-3-random-forest.streamlit.app/",
    slides: "REPLACE_WITH_PUBLIC_SLIDES_URL"
  }
};
// End note: update values here only after confirming the final model export.
