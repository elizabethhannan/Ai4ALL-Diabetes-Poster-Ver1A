"""
============================================================================
 GE-79 / CDED  -  Group 6C  |  AI4ALL Ignite 2026
 MODEL 0:  FEATURE SELECTION  (Random Forest importance ranking)
 Label stamped on the figure:  GE-79 · Feature Selection
============================================================================
 WHERE THIS FILE GOES (PyCharm):
     AI4ALL_ML-Diabetes_-Ver_1_A/
     └── src/
         └── Model0_feature_selection.py      <-- THIS FILE

 IT READS:
     ../data/GE79_MASTER_DATASET_V1.csv   (input dataset)

 IT WRITES (to ../outputs/):
     FINAL_FEATURES.csv                 <-- the 14 features Models 1, 2 & 3 reuse
     feature_importance_fullscope.csv   - full ranking of every candidate feature
     fig_feature_selection.png          - top-12 importance chart

 ----------------------------------------------------------------------------
 RUN ORDER:  RUN THIS FILE FIRST. It creates FINAL_FEATURES.csv, which
             Model 1 (Logistic Regression), Model 2 (Decision Tree), and
             Model 3 (Random Forest) all read.
 ----------------------------------------------------------------------------

 WHAT THIS DOES (Phase 4 — feature selection)
   FULL SCOPE: all six biomarker domains are offered as candidate features.
   A Random Forest scores each feature's importance. Because the dataset is
   small (n=75), a single ranking is noisy, so importance is AVERAGED over
   20 random seeds for stability. A short list of science-based ANCHORS
   (glycemic, BP, vasoreactivity, perfusion, white-matter) is always kept,
   because the CDED literature says they matter. The final set is:
       FINAL_FEATURES = top-12 ranked features  UNION  science anchors = 14

 TARGET ENCODING
   0 = No Impairment   (MMSE >= 28, "Normal")
   1 = Impaired        (MMSE 25-27)

 LEAKAGE CONTROL
   - MMSE (defines the label) is NOT a feature -> no target leakage.
   - One row per patient (Visit 2)             -> no repeated-measures leakage.
   - Imputation + scaling happen INSIDE the importance pipeline.
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
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

warnings.filterwarnings("ignore")
RANDOM_STATE = 42

# ---------------------------------------------------------------------------
# 0. CONFIG  (paths are relative to the src/ folder this file runs from)
# ---------------------------------------------------------------------------
DATA_PATH = Path("../data/GE79_MASTER_DATASET_V1.csv")
OUT_DIR = Path("../outputs")
OUT_DIR.mkdir(parents=True, exist_ok=True)

DATASET = "GE-79"
CLASS_0_LABEL = "No Impairment"
CLASS_1_LABEL = "Impaired"
ENCODING = f"0 = {CLASS_0_LABEL}, 1 = {CLASS_1_LABEL}"

TARGET_COL = "cognitive_status_label"
TARGET_MAP = {"Normal": 0, "Mild Impairment": 1}

# Never-predictors: ids, target, 100%-missing column, duplicate of `group`
DROP_COLS = ["patient_id", "visit", "cognitive_status_code",
             "cognitive_status_label", "gait_walk1_distance_m", "dm_status"]

# Keep diabetes_duration (45% missing) WITH a missingness flag
ADD_MISSING_FLAG_FOR = ["diabetes_duration"]

# Science-based anchors — kept regardless of ranking (CDED literature support)
SCIENCE_ANCHORS = ["glucose_mg_dl", "fasting_glucose_mg_dl", "hba1c_percent",
                   "daytime_sbp", "global_vasoreactivity",
                   "perfusion_whole_brain_baseline_whole", "wmh_registered",
                   "diabetes_duration"]

N_TOP_FEATURES = 12          # how many data-ranked features to keep
N_STABILITY_SEEDS = 20       # average importance over this many seeds

TEAL = "#2a9d8f"


# ---------------------------------------------------------------------------
# 1. LOAD DATA
# ---------------------------------------------------------------------------
def load_data():
    df = pd.read_csv(DATA_PATH)
    for col in ADD_MISSING_FLAG_FOR:                 # missingness indicator
        df[f"{col}_missing"] = df[col].isnull().astype(int)
    y = df[TARGET_COL].map(TARGET_MAP)
    X = df.drop(columns=DROP_COLS)
    print(f"Loaded {DATA_PATH.name}: {len(df)} patients, "
          f"{X.shape[1]} candidate features (full scope)")
    print("Target:", df[TARGET_COL].value_counts().to_dict())
    return X, y


# ---------------------------------------------------------------------------
# 2. PREPROCESSOR (fit inside the importance pipeline -> no leakage)
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
# 3. FEATURE SELECTION — stability-averaged RF importance + science anchors
# ---------------------------------------------------------------------------
def select_features(X, y):
    pre = build_preprocessor(X)
    runs = []
    for seed in range(N_STABILITY_SEEDS):
        rf = Pipeline([("pre", pre),
                       ("clf", RandomForestClassifier(
                            n_estimators=400, max_depth=6, min_samples_leaf=3,
                            class_weight="balanced", random_state=seed))])
        rf.fit(X, y)
        names = rf.named_steps["pre"].get_feature_names_out()
        runs.append(pd.Series(rf.named_steps["clf"].feature_importances_, index=names))

    imp = pd.concat(runs, axis=1)
    ranking = (pd.DataFrame({"feature": imp.index,
                             "importance_mean": imp.mean(axis=1).values,
                             "importance_std": imp.std(axis=1).values})
               .sort_values("importance_mean", ascending=False))
    ranking["feature"] = (ranking["feature"]
                          .str.replace("num__", "", regex=False)
                          .str.replace("cat__", "", regex=False))
    ranking.to_csv(OUT_DIR / "feature_importance_fullscope.csv", index=False)

    top = list(dict.fromkeys(ranking["feature"].head(N_TOP_FEATURES)))
    final = sorted(set(top) | set(SCIENCE_ANCHORS))
    print(f"\nSelected {len(final)} FINAL_FEATURES "
          f"(top {N_TOP_FEATURES} ranked + {len(SCIENCE_ANCHORS)} science anchors):")
    for f in final:
        print("   -", f)

    # importance bar chart (top 12, with stability error bars)
    top_df = ranking.head(12)
    fig, ax = plt.subplots(figsize=(7.4, 5))
    ax.barh(top_df["feature"][::-1], top_df["importance_mean"][::-1],
            xerr=top_df["importance_std"][::-1], color=TEAL,
            edgecolor="white", error_kw={"ecolor": "#888888"})
    ax.set_title(f"{DATASET} · Random Forest — Feature Selection\n"
                 f"Top 12 biomarkers (importance over 20 seeds)",
                 fontweight="bold", fontsize=11)
    ax.set_xlabel("Mean importance (± std)")
    ax.spines[["top", "right"]].set_visible(False)
    plt.tight_layout()
    plt.savefig(OUT_DIR / "fig_feature_selection.png", dpi=150)
    plt.close()
    print("Saved fig_feature_selection.png")
    return final


# ---------------------------------------------------------------------------
# 4. MAIN
# ---------------------------------------------------------------------------
def main():
    print("=" * 64)
    print(" MODEL 0 — FEATURE SELECTION  (GE-79 · Random Forest importance)")
    print("=" * 64)
    X, y = load_data()
    final_features = select_features(X, y)
    pd.Series(final_features, name="final_features").to_csv(
        OUT_DIR / "FINAL_FEATURES.csv", index=False)
    print(f"\nSaved FINAL_FEATURES.csv ({len(final_features)} features).")
    print("Next: run Model 1 (Logistic Regression), then Models 2 and 3.")


if __name__ == "__main__":
    main()
