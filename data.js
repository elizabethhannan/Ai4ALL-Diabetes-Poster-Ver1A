/* Version 2.5 — single source of truth for all poster numbers and public destinations. */
window.POSTER_DATA = {
  study: { participants: 75, variables: 46, features: 14, noImpairment: 55, impaired: 20, folds: 5 },
  models: [
    { id: "lr", short: "Model 1", name: "Logistic Regression", role: "Interpretable baseline", values: [54.7, 50.8, 50.0, 53.4, 36.9], matrix: [31, 24, 10, 10], takeaway: "The baseline found 10 of 20 impaired participants, but created 24 false alarms." },
    { id: "dt", short: "Model 2", name: "Decision Tree", role: "Interpretable branching classifier", values: [62.7, 58.0, 55.0, 63.9, 37.0], matrix: [36, 19, 9, 11], takeaway: "It identified the largest share of impaired participants: 11 of 20." },
    { id: "rf", short: "Model 3", name: "Random Forest", role: "Ensemble classifier", values: [74.7, 59.4, 25.0, 64.8, 44.1], matrix: [51, 4, 15, 5], takeaway: "It achieved the highest overall accuracy, but missed 15 of 20 impaired participants." }
  ],
  metrics: ["Accuracy", "Macro F1", "Impaired recall", "ROC-AUC", "PR-AUC"],
  shap: [
    ["Fasting glucose (mg/dL)", 0.685], ["Glucose (mg/dL)", 0.586], ["Global vasoreactivity", 0.538],
    ["Systolic blood pressure (SBP)", 0.475], ["White matter hyperintensities (WMH)", 0.336],
    ["Whole-brain perfusion", 0.287], ["sVCAM (ng/mL)", 0.253]
  ],
  links: {
    poster: "https://tinyurl.com/AI4ALL-GitHubPage",
    prototype: "https://tinyurl.com/AI4ALL-Streamlit-App",
    slides: "REPLACE_WITH_PUBLIC_SLIDES_URL",
    groupPrototype: "REPLACE_WITH_GROUP_6C_PROTOTYPE_APP_URL"
  }
};
// End note: update values here only after confirming the final model export.
