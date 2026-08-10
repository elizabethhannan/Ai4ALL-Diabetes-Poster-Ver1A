"""
============================================================================
 GE-79 / CDED  -  Group 6C  |  AI4ALL Ignite 2026
 MODEL 2 of 3:  DECISION TREE  (Interpretable)   ***  PLACEHOLDER / STUB  ***
 Label to stamp on all figures:  GE-79 · Decision Tree · Interpretable
============================================================================
 >>> THIS FILE IS A TEMPLATE FOR THE TEAM TO COMPLETE. <<<
 The structure, paths, and output names are already set so Model 2 plugs
 into the project cleanly. Fill in each block marked  # TODO.

 WHERE THIS FILE GOES (PyCharm):
     AI4ALL_ML-Diabetes_-Ver_1_A/
     └── src/
         └── Model2_decision_tree.py      <-- THIS FILE

 IT MUST READ:
     ../data/GE79_MASTER_DATASET_V1.csv   (input dataset)
     ../outputs/FINAL_FEATURES.csv        (the 14 features, made by Model 1)

 IT MUST WRITE (to ../outputs/):
     fig_dt_tree.png            - the decision-tree diagram (the headline visual)
     fig_dt_confusion.png       - confusion matrix
     results_model2_tree.csv    - metrics row for the Phase-8 comparison table

 ----------------------------------------------------------------------------
 RUN ORDER:  Run Model 0 FIRST (it creates FINAL_FEATURES.csv). Then this file.
 ----------------------------------------------------------------------------

 THE CONTRACT (do not change these - it keeps all 3 models comparable):
   * Use the SAME 14 features from FINAL_FEATURES.csv. Do NOT re-select features.
   * Model:  DecisionTreeClassifier(max_depth=4, min_samples_leaf=5,
                                     class_weight="balanced", random_state=42)
   * Evaluate with 5-fold STRATIFIED cross-validation.
   * Target encoding:  0 = No Impairment,  1 = Impaired.
   * results_model2_tree.csv MUST have these exact columns:
       model, accuracy, precision_macro, recall_macro, f1_macro, recall_impaired
============================================================================
"""

import warnings
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import (accuracy_score, classification_report,
                             confusion_matrix, f1_score, precision_score,
                             recall_score)
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier, plot_tree

warnings.filterwarnings("ignore")
RANDOM_STATE = 42

# ---------------------------------------------------------------------------
# 0. CONFIG  (paths are relative to the src/ folder — already correct)
# ---------------------------------------------------------------------------
DATA_PATH = Path("../data/GE79_MASTER_DATASET_V1.csv")
FEATURES_PATH = Path("../outputs/FINAL_FEATURES.csv")
OUT_DIR = Path("../outputs")
OUT_DIR.mkdir(parents=True, exist_ok=True)

DATASET = "GE-79"
MODEL_NAME = "Decision Tree"
MODEL_ROLE = "Interpretable"
CLASS_0_LABEL = "No Impairment"      # code 0
CLASS_1_LABEL = "Impaired"           # code 1
ENCODING = f"0 = {CLASS_0_LABEL}, 1 = {CLASS_1_LABEL}"

TARGET_COL = "cognitive_status_label"
TARGET_MAP = {"Normal": 0, "Mild Impairment": 1}
DROP_COLS = ["patient_id", "visit", "cognitive_status_code",
             "cognitive_status_label", "gait_walk1_distance_m", "dm_status"]
ADD_MISSING_FLAG_FOR = ["diabetes_duration"]

NAVY, TEAL = "#1f3a5f", "#2a9d8f"


# ---------------------------------------------------------------------------
# 1. LOAD DATA + THE LOCKED FEATURE LIST   (this block is DONE for you)
# ---------------------------------------------------------------------------
def load_data_and_features():
    df = pd.read_csv(DATA_PATH)
    for col in ADD_MISSING_FLAG_FOR:
        df[f"{col}_missing"] = df[col].isnull().astype(int)
    y = df[TARGET_COL].map(TARGET_MAP)

    if FEATURES_PATH.exists():
        final_features = pd.read_csv(FEATURES_PATH)["final_features"].tolist()
        for col in ADD_MISSING_FLAG_FOR:
            flag = f"{col}_missing"
            if col in final_features and flag in df.columns and flag not in final_features:
                final_features.append(flag)
    else:
        raise FileNotFoundError(
            "FINAL_FEATURES.csv not found. Run Model 1 "
            "(Model0_feature_selection.py) FIRST.")

    X = df[final_features]
    print(f"Loaded {len(df)} patients, {X.shape[1]} features (from FINAL_FEATURES.csv)")
    return X, y


# ---------------------------------------------------------------------------
# 2. PREPROCESSOR   (this block is DONE for you — do not change)
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
# 3. BUILD THE DECISION TREE                                          # TODO 1
#    Return a DecisionTreeClassifier with EXACTLY these settings:
#       max_depth=4, min_samples_leaf=5,
#       class_weight="balanced", random_state=RANDOM_STATE
# ---------------------------------------------------------------------------
def get_decision_tree():
    # TODO 1: replace None with the DecisionTreeClassifier described above
    model = None
    return model


# ---------------------------------------------------------------------------
# 4. EVALUATE WITH 5-FOLD STRATIFIED CV                               # TODO 2
#    Steps:
#      a) pre = build_preprocessor(X)
#      b) pipe = Pipeline([("pre", pre), ("clf", get_decision_tree())])
#      c) cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
#      d) y_pred = cross_val_predict(pipe, X, y, cv=cv)
#      e) build a one-row results DataFrame with the EXACT columns in the contract
#      f) save it to  OUT_DIR / "results_model2_tree.csv"
#      g) return y_pred  (needed for the confusion matrix)
# ---------------------------------------------------------------------------
def evaluate(X, y):
    # TODO 2: implement steps a-g above
    y_pred = None
    return y_pred


# ---------------------------------------------------------------------------
# 5. FIGURE A — THE DECISION-TREE DIAGRAM (headline visual)           # TODO 3
#    Steps:
#      a) pre = build_preprocessor(X)
#      b) pipe = Pipeline([("pre", pre), ("clf", get_decision_tree())]); pipe.fit(X, y)
#      c) fig, ax = plt.subplots(figsize=(17, 8.5))
#      d) plot_tree(pipe.named_steps["clf"],
#                   feature_names=pipe.named_steps["pre"].get_feature_names_out(),
#                   class_names=[f"0:{CLASS_0_LABEL}", f"1:{CLASS_1_LABEL}"],
#                   filled=True, rounded=True, fontsize=8, ax=ax)
#      e) ax.set_title(f"{DATASET} · {MODEL_NAME} — Full Diagram\n"
#                      f"{MODEL_ROLE}  ({ENCODING})", fontweight="bold", fontsize=13)
#      f) plt.tight_layout(); plt.savefig(OUT_DIR / "fig_dt_tree.png", dpi=130); plt.close()
# ---------------------------------------------------------------------------
def plot_tree_diagram(X, y):
    # TODO 3: implement steps a-f above
    pass


# ---------------------------------------------------------------------------
# 6. FIGURE B — CONFUSION MATRIX   (this block is DONE for you)
#    Uses the y_pred returned by evaluate().
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
    ax.set_title(f"{DATASET} · {MODEL_NAME} — Confusion Matrix\n"
                 f"{MODEL_ROLE}, 5-fold CV  ({ENCODING})",
                 fontweight="bold", fontsize=11)
    plt.tight_layout()
    plt.savefig(OUT_DIR / "fig_dt_confusion.png", dpi=150)
    plt.close()
    print("Saved fig_dt_confusion.png")


# ---------------------------------------------------------------------------
# 7. MAIN   (wired up — works once TODOs 1-3 are filled in)
# ---------------------------------------------------------------------------
def main():
    print("=" * 64)
    print(" MODEL 2 of 3 — DECISION TREE  (GE-79 · Decision Tree · Interpretable)")
    print("=" * 64)
    X, y = load_data_and_features()

    y_pred = evaluate(X, y)                       # TODO 2 must return y_pred
    if y_pred is None:
        print("\n[!] evaluate() is not finished yet — complete TODO 2.")
        return

    plot_tree_diagram(X, y)                        # TODO 3
    plot_confusion(y, y_pred)

    print("\nPer-class report (Decision Tree):")
    print(classification_report(y, y_pred,
          target_names=[CLASS_0_LABEL, CLASS_1_LABEL], zero_division=0))
    print("\nDone. Outputs written to ../outputs/")


if __name__ == "__main__":
    main()
