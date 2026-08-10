"""
============================================================================
 GE-79 / CDED  -  Group 6C  |  AI4ALL Ignite 2026
 MODEL 3 of 3:  RANDOM FOREST  (Ensemble + Feature Importance)
 Label stamped on all figures:  GE-79 · Random Forest · Ensemble
============================================================================
 WHERE THIS FILE GOES (PyCharm):
     AI4ALL_ML-Diabetes_-Ver_1_A/
     └── src/
         └── model3_random_forest.py      <-- THIS FILE

 IT READS:
     ../data/GE79_MASTER_DATASET_V1.csv   (input dataset)
     ../outputs/FINAL_FEATURES.csv        (the 14 features, written by Model 1)

 IT WRITES (to ../outputs/):
     fig_rf_importance.png        - top-12 feature importance bar chart
     fig_rf_confusion.png         - confusion matrix
     results_model3_forest.csv    - metrics row for the comparison table

 ----------------------------------------------------------------------------
 RUN ORDER:  Model 1 must run first (it creates FINAL_FEATURES.csv).
             Then Model 2 and Model 3 can run in any order.
 ----------------------------------------------------------------------------

 WHAT THIS MODEL IS
   Random Forest = an ENSEMBLE of many decision trees. Each tree votes, and
   the majority vote is the prediction. Averaging many trees usually reduces
   the over-fitting a single tree suffers from, and the forest can rank how
   important each feature was across all its trees.

 TARGET ENCODING
   0 = No Impairment   (MMSE >= 28, "Normal")
   1 = Impaired        (MMSE 25-27)

 HONESTY NOTE (read the printed results)
   On this small, imbalanced dataset (n=75, 73% "No Impairment") the Random
   Forest tends to chase accuracy by predicting the majority class, which can
   drive minority-class (Impaired) recall toward 0. The majority-class
   baseline accuracy is 0.733 -- any model at or below that is not actually
   beating a constant guess. We report macro-F1 and Impaired recall so this
   is visible and honestly discussed, per the AI4ALL bias rubric.

 LEAKAGE CONTROL
   - MMSE (defines the label) is NOT a feature  -> no target leakage.
   - One row per patient (Visit 2)              -> no repeated-measures leakage.
   - Imputation + scaling happen INSIDE the CV folds via a Pipeline.
============================================================================
"""

import warnings
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")                 # headless-safe; figures save to file
import matplotlib.pyplot as plt

from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (accuracy_score, classification_report,
                             confusion_matrix, f1_score, precision_score,
                             recall_score)
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

warnings.filterwarnings("ignore")
RANDOM_STATE = 42

# ---------------------------------------------------------------------------
# 0. CONFIG  (paths are relative to the src/ folder this file runs from)
# ---------------------------------------------------------------------------
DATA_PATH = Path("../data/GE79_MASTER_DATASET_V1.csv")
FEATURES_PATH = Path("../outputs/FINAL_FEATURES.csv")     # written by Model 1
OUT_DIR = Path("../outputs")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Figure-label standard:  DATASET · MODEL · description (encoding)
DATASET = "GE-79"
MODEL_NAME = "Random Forest"
MODEL_ROLE = "Ensemble"
CLASS_0_LABEL = "No Impairment"      # code 0
CLASS_1_LABEL = "Impaired"           # code 1
ENCODING = f"0 = {CLASS_0_LABEL}, 1 = {CLASS_1_LABEL}"

TARGET_COL = "cognitive_status_label"
TARGET_MAP = {"Normal": 0, "Mild Impairment": 1}

# Same never-predictors used across all models
DROP_COLS = ["patient_id", "visit", "cognitive_status_code",
             "cognitive_status_label", "gait_walk1_distance_m", "dm_status"]
ADD_MISSING_FLAG_FOR = ["diabetes_duration"]   # 45% missing -> impute + flag

NAVY, TEAL = "#1f3a5f", "#2a9d8f"


def caption(description):
    """DATASET · MODEL · description (encoding) -- consistent on every figure."""
    return f"{DATASET} · {MODEL_NAME} — {description}\n{MODEL_ROLE} model  ({ENCODING})"


# ---------------------------------------------------------------------------
# 1. LOAD DATA + THE LOCKED FEATURE LIST
# ---------------------------------------------------------------------------
def load_data_and_features():
    df = pd.read_csv(DATA_PATH)
    for col in ADD_MISSING_FLAG_FOR:               # missingness indicator feature
        df[f"{col}_missing"] = df[col].isnull().astype(int)

    y = df[TARGET_COL].map(TARGET_MAP)

    # Reuse the exact 14 features Model 1 selected, so all models are comparable.
    if FEATURES_PATH.exists():
        final_features = pd.read_csv(FEATURES_PATH)["final_features"].tolist()
        # include the missing-flag column if the model needs it
        for col in ADD_MISSING_FLAG_FOR:
            flag = f"{col}_missing"
            if col in final_features and flag in df.columns and flag not in final_features:
                final_features.append(flag)
        print(f"Loaded {len(final_features)} FINAL_FEATURES from {FEATURES_PATH.name}")
    else:
        # Fallback so the file still runs if Model 1 hasn't been run yet.
        print("WARNING: FINAL_FEATURES.csv not found -- run Model 1 first. "
              "Falling back to all candidate features.")
        final_features = [c for c in df.columns
                          if c not in DROP_COLS and c != TARGET_COL]

    X = df[final_features]
    print(f"Dataset: {len(df)} patients | features used: {X.shape[1]}")
    print("Target:", df[TARGET_COL].value_counts().to_dict())
    return X, y


# ---------------------------------------------------------------------------
# 2. PREPROCESSING (fit inside CV folds only -> no leakage)
# ---------------------------------------------------------------------------
def build_preprocessor(X):
    numeric = X.select_dtypes(include=np.number).columns.tolist()
    categorical = X.select_dtypes(include="object").columns.tolist()
    num_pipe = Pipeline([("impute", SimpleImputer(strategy="median")),
                         ("scale", StandardScaler())])
    cat_pipe = Pipeline([("impute", SimpleImputer(strategy="most_frequent")),
                         ("encode", OneHotEncoder(drop="first", handle_unknown="ignore"))])
    return ColumnTransformer([("num", num_pipe, numeric),
                              ("cat", cat_pipe, categorical)])


# ---------------------------------------------------------------------------
# 3. THE RANDOM FOREST
#    n_estimators=400 : number of trees in the forest
#    max_depth=6       : limit each tree's depth (small dataset -> avoid overfit)
#    min_samples_leaf=3: a leaf must hold >=3 patients (smooths predictions)
#    class_weight=balanced: up-weights the minority "Impaired" class
# ---------------------------------------------------------------------------
def get_random_forest():
    return RandomForestClassifier(
        n_estimators=400, max_depth=6, min_samples_leaf=3,
        class_weight="balanced", random_state=RANDOM_STATE)


# ---------------------------------------------------------------------------
# 4. EVALUATE WITH 5-FOLD STRATIFIED CROSS-VALIDATION
# ---------------------------------------------------------------------------
def evaluate(X, y):
    pre = build_preprocessor(X)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    # majority-class baseline = the bar to beat (0.733 accuracy)
    base = Pipeline([("pre", pre), ("clf", DummyClassifier(strategy="most_frequent"))])
    base_pred = cross_val_predict(base, X, y, cv=cv)

    rf = Pipeline([("pre", pre), ("clf", get_random_forest())])
    rf_pred = cross_val_predict(rf, X, y, cv=cv)

    def row(name, yp):
        return {"model": name,
                "accuracy": round(accuracy_score(y, yp), 3),
                "precision_macro": round(precision_score(y, yp, average="macro", zero_division=0), 3),
                "recall_macro": round(recall_score(y, yp, average="macro", zero_division=0), 3),
                "f1_macro": round(f1_score(y, yp, average="macro", zero_division=0), 3),
                "recall_impaired": round(recall_score(y, yp, pos_label=1, zero_division=0), 3)}

    results = pd.DataFrame([row("Baseline (majority)", base_pred),
                            row("Random Forest", rf_pred)])
    results.to_csv(OUT_DIR / "results_model3_forest.csv", index=False)

    print("\n=== MODEL 3: Random Forest — 5-fold CV results ===")
    print(results.to_string(index=False))
    print("\nMajority-class baseline accuracy = 0.733 (always predicts 'No Impairment').")
    print("\nPer-class report (Random Forest):")
    print(classification_report(y, rf_pred,
          target_names=[CLASS_0_LABEL, CLASS_1_LABEL], zero_division=0))
    return rf_pred


# ---------------------------------------------------------------------------
# 5. FIGURE A — FEATURE IMPORTANCE (the Random Forest's signature output)
# ---------------------------------------------------------------------------
def plot_feature_importance(X, y):
    pre = build_preprocessor(X)
    rf = Pipeline([("pre", pre), ("clf", get_random_forest())])
    rf.fit(X, y)                                    # fit on full data for ranking

    names = rf.named_steps["pre"].get_feature_names_out()
    importances = rf.named_steps["clf"].feature_importances_
    fi = (pd.DataFrame({"feature": names, "importance": importances})
          .sort_values("importance", ascending=False).head(12))
    fi["feature"] = (fi["feature"].str.replace("num__", "", regex=False)
                                  .str.replace("cat__", "", regex=False))
    fi.to_csv(OUT_DIR / "feature_importance_model3.csv", index=False)

    fig, ax = plt.subplots(figsize=(7.4, 5))
    ax.barh(fi["feature"][::-1], fi["importance"][::-1], color=TEAL, edgecolor="white")
    ax.set_title(f"{DATASET} · {MODEL_NAME} — Top 12 Features\n"
                 f"{MODEL_ROLE}  ({ENCODING})", fontweight="bold", fontsize=11)
    ax.set_xlabel("Importance")
    ax.spines[["top", "right"]].set_visible(False)
    plt.tight_layout()
    plt.savefig(OUT_DIR / "fig_rf_importance.png", dpi=150)
    plt.close()
    print("Saved fig_rf_importance.png")


# ---------------------------------------------------------------------------
# 6. FIGURE B — CONFUSION MATRIX
# ---------------------------------------------------------------------------
def plot_confusion(y, y_pred):
    cm = confusion_matrix(y, y_pred)
    fig, ax = plt.subplots(figsize=(5.4, 4.9))
    ax.imshow(cm, cmap="Blues")
    lab = [f"0 · {CLASS_0_LABEL}", f"1 · {CLASS_1_LABEL}"]
    ax.set_xticks([0, 1]); ax.set_yticks([0, 1])
    ax.set_xticklabels(lab); ax.set_yticklabels(lab)
    for i in range(2):
        for j in range(2):
            ax.text(j, i, cm[i, j], ha="center", va="center", fontsize=18,
                    fontweight="bold", color="white" if cm[i, j] > cm.max() / 2 else NAVY)
    ax.set_xlabel("Predicted", fontweight="bold")
    ax.set_ylabel("Actual", fontweight="bold")
    ax.set_title(caption("Confusion Matrix"), fontweight="bold", fontsize=11)
    plt.tight_layout()
    plt.savefig(OUT_DIR / "fig_rf_confusion.png", dpi=150)
    plt.close()
    print("Saved fig_rf_confusion.png")


# ---------------------------------------------------------------------------
# 7. MAIN
# ---------------------------------------------------------------------------
def main():
    print("=" * 64)
    print(" MODEL 3 of 3 — RANDOM FOREST  (GE-79 · Random Forest · Ensemble)")
    print("=" * 64)
    X, y = load_data_and_features()
    y_pred = evaluate(X, y)
    plot_feature_importance(X, y)
    plot_confusion(y, y_pred)
    print("\nDone. Outputs written to ../outputs/")


if __name__ == "__main__":
    main()
