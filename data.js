/* Version 2.0 — single source of truth for all poster numbers and public destinations. */
window.POSTER_DATA = {
  study: { participants: 75, variables: 46, features: 14, noImpairment: 55, impaired: 20, folds: 5 },
  models: [
    { id: "lr", short: "Model 1", name: "Logistic Regression", role: "Interpretable baseline", values: [54.7, 50.8, 50.0, 53.4, 36.9], takeaway: "A transparent baseline that makes the tradeoffs visible." },
    { id: "dt", short: "Model 2", name: "Decision Tree", role: "Interpretable branching classifier", values: [62.7, 58.0, 55.0, 63.9, 37.0], takeaway: "Detected the largest share of impaired cases, but did not lead overall." },
    { id: "rf", short: "Model 3", name: "Random Forest", role: "Ensemble classifier", values: [74.7, 59.4, 25.0, 64.8, 44.1], takeaway: "Led accuracy, macro F1, ROC-AUC, and PR-AUC; SHAP was used for interpretation." }
  ],
  metrics: ["Accuracy", "Macro F1", "Impaired recall", "ROC-AUC", "PR-AUC"],
  links: {
    poster: "https://elizabethhannan.github.io/Ai4ALL-Diabetes-Poster-Ver1A/",
    code: "https://github.com/elizabethhannan/AI4ALL_ClinicalMedicalDiabeties_EH-PRIVATE",
    prototype: "https://ai4all-diabetes-app-ml-model-3-random-forest.streamlit.app/",
    slides: "https://tinyurl.com/AI4ALL-Group6C-Presentation",
    elizabeth: "https://tinyurl.com/LinkedinEHannan",
    agastyya: "https://tinyurl.com/Linkedin-Agastyya-Kala"
  }
};
// End note: update values here only after confirming the final model export.
