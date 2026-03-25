# 🌍 Aegis-Link
**Integrated Climate-Health Intelligence & Resource Dispatch System**

*Built for HackHustle 2.0 - CODE KNIGHT 2026 | Domain: Healthcare*

[![Live Demo](https://img.shields.io/badge/Demo-Live_Link-blue?style=for-the-badge)](INSERT_LIVE_LINK_HERE)
[![Video Pitch](https://img.shields.io/badge/Video-Pitch_Link-red?style=for-the-badge)](INSERT_VIDEO_LINK_HERE)

## 📌 The Problem
Currently, environmental disaster monitoring and healthcare responses are deeply siloed. While standard systems issue generic flood warnings, they fail to predict the subsequent, inevitable outbreaks of waterborne or vector-borne diseases. Relying on manual, post-disaster reporting causes a critical loss in the "Golden Hour" of medical response. Furthermore, during a crisis, vital resources (medical supplies, shelters, food) exist but are invisible to the citizens and NGOs who need them most due to a lack of real-time coordination.

## 💡 Our Solution: The Triple-Threat Engine
Aegis-Link is a proactive, dynamic "Geo-Resource Map" that bridges the gap between climate events and public health response.

1. **Predict (AI Engine):** Utilizes time-series ML models trained on extensive regional rainfall datasets to forecast flood probabilities and subsequent epidemic risks.
2. **Verify (Truth-Sync Module):** An NLP-driven validation layer that scrapes live news APIs and official weather feeds to cross-reference AI predictions with real-world, ground-truth events (e.g., incoming cyclones).
3. **Coordinate (Geo-Resource Map):** A live, interactive heat map connecting NGOs, the public, and government bodies. Users can toggle layers for [Flood Risk], [Epidemic Hotspots], and drop verified pins for [Free Food], [Low-Cost Shelter], or [Medical Supplies].

## 🛠️ Tech Stack
**Frontend:**
* React.js
* Leaflet.js / Google Maps API (Interactive Mapping)
* Tailwind CSS / Material-UI

**Backend & Database:**
* Node.js & Express.js
* MongoDB (NoSQL for dynamic, low-latency geospatial queries)

**AI / Machine Learning Layer:**
* Python
* LSTM & XGBoost (Time-series forecasting based on 25-year historical rainfall data)
* Natural Language Processing (NLP) for Truth-Sync scraping (NewsAPI, OpenWeatherMap)

## ⚙️ Local Setup & Installation

**1. Clone the repository**
```bash
git clone [https://github.com/YOUR_USERNAME/aegis-link.git](https://github.com/YOUR_USERNAME/aegis-link.git)
cd aegis-link
