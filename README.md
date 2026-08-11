
```markdown
# 🛍️ Retail Digital Twin

**AI-powered Digital Twin platform for hyper-personalized customer journey simulation, built on real e-commerce behavioral data.**

> Internship project — F2: Retail Digital Twin for Hyper-Personalized Customer Journey Simulation

---

## 📖 Overview

This project builds a virtual "Digital Twin" for every customer in a large e-commerce dataset — a persistent profile derived from real browsing, cart, and purchase behavior. Each twin flows through a machine learning pipeline that predicts purchase probability and generates personalized product recommendations, surfaced through an interactive analytics dashboard.

Built on the **RetailRocket** dataset: 2.75M real e-commerce events from 1.4M customers over a 139-day window (May–Sep 2015).

---

## 🧠 Core Pipeline

```
Raw Events (RetailRocket)
      │
      ▼
Data Pipeline & EDA ──────────► Cleaned behavioral dataset
      │
      ▼
Digital Twin Engine ──────────► 1.4M customer profiles
      │   (segment, engagement level, CLV tier, behavior type)
      ▼
Engagement Prediction (XGBoost) ► Purchase probability per customer
      │
      ▼
Hybrid Recommendation Engine ──► Personalized product recommendations
      │
      ▼
Analytics Dashboard (Flask + React)
```

---

## ✨ Key Results

| Component | Metric | Result |
|---|---|---|
| Digital Twin Engine | Customer profiles generated | 1,407,580 |
| Engagement Prediction | Best model (XGBoost) ROC-AUC | 0.974 |
| Engagement Prediction | Precision / Recall | 0.30 / 0.87 |
| Recommendation Engine | HitRate@10 (hybrid vs. popularity baseline) | 0.0341 vs. 0.0302 (**+12.9%**) |
| Dataset | Total events analyzed | 2,756,101 |

All models are evaluated against explicit baselines (heuristic rule for prediction, popularity-only for recommendations) and validated with temporal train/test splits and 5-fold cross-validation.

---

## 🛠️ Tech Stack

**Data & ML:** Python, Pandas, NumPy, Scikit-learn, XGBoost, Jupyter
**Backend:** Flask, Flask-CORS
**Frontend:** React 19, TanStack Router/Start, Tailwind CSS, shadcn/ui, Recharts, TanStack Query
**Tooling:** bun, Git/GitHub

---

## 📂 Project Structure

```
retail-digital-twin/
├── backend/
│   ├── core/              # Digital Twin Engine, Recommendation Engine
│   ├── models/             # Engagement prediction (XGBoost pipeline)
│   ├── api/                 # Flask REST endpoints
│   ├── utils/               # Shared data loading
│   └── app.py                # Flask entry point
├── frontend/twinretailai-main/  # React dashboard (TanStack Start)
├── notebooks/               # Modules 1–4 development notebooks
├── datasets/
│   ├── raw/                    # RetailRocket source files (gitignored)
│   └── processed/           # Pipeline outputs (twins, predictions, recs)
├── research/                # EDA charts, model evaluation plots
└── requirements.txt
```

---

## 🚀 Running the Project

**Backend:**
```bash
pip install -r requirements.txt
python -m backend.app
```
Runs on `http://localhost:5000`

**Frontend:**
```bash
cd frontend/twinretailai-main
bun install
bun dev
```
Runs on `http://localhost:8080`

---

## 📊 Project Status

| Module | Status |
|---|---|
| 1 — Data Pipeline & EDA | ✅ Complete |
| 2 — Customer Digital Twin Engine | ✅ Complete |
| 3 — Engagement Prediction Pipeline | ✅ Complete |
| 4 — Recommendation Engine | ✅ Complete |
| 5 — Analytics Dashboard | 🟡 In progress (Executive Command Center live; remaining pages in development) |
| 6 — Scenario Simulation | 🔲 Planned |

**Dataset scope:** Currently built and validated on RetailRocket. Comparative analysis on YooChoose and Alibaba User Behavior datasets is planned but not yet started.

---

## 👥 Team

| Role | Member |
|---|---|
| Project Lead / ML & Backend | Syed Umar |
| Research & Comparative Analysis | Furqan Ahmed |
| Dataset Analysis & Presentation | Darzi Khaja Saleem Ahmed |

---

## 📌 Known Limitations

- Single-dataset validation (RetailRocket only) — cross-dataset generalization not yet tested
- Online-channel data only — no offline/POS data source integrated
- Recommendation catalog coverage is intentionally conservative (~0.15%) due to high dataset sparsity (0.84% purchase rate)
- Batch prediction pipeline — not yet a streaming/real-time architecture
```

One thing to fix before pasting: swap in your actual GitHub repo name/description if it differs, and update the team role descriptions once Furqan/Saleem's actual work lands. Everything else here is traceable to what's in your repo right now — nothing invented.
