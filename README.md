````markdown
# 🛍️ Retail Digital Twin

**AI-powered Retail Digital Twin platform for hyper-personalized customer journey simulation.**

> **F2 — Retail Digital Twin for Hyper-Personalized Customer Journey Simulation**

## 📖 Overview

This project creates a **Digital Twin for retail customers** using real e-commerce behavioral data. The system analyzes customer activity, predicts purchase probability, generates personalized recommendations, and presents the results through an interactive analytics platform.

**Current primary dataset:** RetailRocket  
**2.75M+ events • 1.4M customers • May–September 2015**

## 🧠 System Pipeline

```text
RetailRocket Events
       ↓
Data Processing & EDA
       ↓
Customer Digital Twin
       ↓
Purchase Prediction (XGBoost)
       ↓
Hybrid Recommendation Engine
       ↓
Analytics Dashboard
````

## ✨ Key Results

| Component                      |        Result |
| ------------------------------ | ------------: |
| Customer Digital Twins         | **1,407,580** |
| Events Processed               | **2,756,101** |
| XGBoost ROC-AUC                |     **0.974** |
| Prediction Precision           |      **0.30** |
| Prediction Recall              |      **0.87** |
| Recommendation HitRate@10      |    **0.0341** |
| Popularity Baseline HitRate@10 |    **0.0302** |

## 🛠️ Tech Stack

**ML/Data:** Python • Pandas • NumPy • Scikit-learn • XGBoost • Jupyter

**Backend:** Flask • Flask-CORS • REST APIs

**Frontend:** React • TanStack Start • Tailwind CSS • shadcn/ui • Recharts • TanStack Query

**Tools:** Git • GitHub • Bun

## 📂 Structure

```text
retail-digital-twin/
├── backend/
│   ├── core/
│   ├── models/
│   ├── api/
│   ├── utils/
│   └── app.py
├── frontend/
├── notebooks/
├── datasets/
│   ├── raw/
│   └── processed/
├── research/
└── requirements.txt
```

## 🚀 Run

### Backend

```bash
pip install -r requirements.txt
python -m backend.app
```

Runs on `http://localhost:5000`

### Frontend

```bash
cd frontend/twinretailai-main
bun install
bun dev
```

Runs on `http://localhost:8080`

## 📊 Status

| Module                | Status |
| --------------------- | :----: |
| Data Pipeline & EDA   |    ✅   |
| Customer Digital Twin |    ✅   |
| Engagement Prediction |    ✅   |
| Recommendation Engine |    ✅   |
| Analytics Dashboard   |   🟡   |
| Scenario Simulation   |   🔲   |

## 🌐 Dataset Expansion

The current system is validated primarily on **RetailRocket**.

**YooChoose** and **Alibaba User Behavior** are planned for comparative and cross-dataset analysis.

## ⚠️ Current Limitations

* Primarily validated on one dataset
* Offline/POS data is not yet integrated
* Full omnichannel capability is still under development
* Scenario simulation is planned
* Current prediction pipeline is primarily batch-based

## 👥 Team

* **Syed Umar** — Project Lead / ML & Backend
* **Furqan Ahmed** — Research & Comparative Analysis
* **Darzi Khaja Saleem Ahmed** — Dataset Analysis & Presentation

---

### 🎯 Vision

**Observe → Understand → Predict → Recommend → Simulate → Optimize**

Building an intelligent retail platform capable of understanding customers, predicting their behavior, recommending personalized actions, and eventually simulating customer journeys across online and offline channels.
