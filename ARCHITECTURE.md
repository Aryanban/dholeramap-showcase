# 🏛️ DholeraMap Technical Architecture & Spatial Pipeline

This document outlines the engineering architecture, data ingestion lifecycle, and spatial optimization strategies powering **[DholeraMap.com](https://dholeramap.com)**.

---

## 1. Geospatial Data Ingestion & Normalization

### The Challenge
Original cadastral data for Dholera SIR was scattered across:
1. Legacy DWG/DXF AutoCAD blueprints with varying spatial coordinate references.
2. Hardcopy Town Planning (TP 1 through TP 6) statutory notification maps.
3. Revenue Department Village Survey maps with inconsistent scale references.

### The Ingestion Pipeline
1. **Coordinate Harmonization:** Standardized all projection systems to **EPSG:4326 (WGS84)** and projected coordinates to **EPSG:3857 (Web Mercator)** for browser map engine compatibility.
2. **Polygon Simplification & Topology Preservation:** Applied modified Douglas-Peucker algorithms with topology preservation (preventing overlapping parcels and gaps between adjacent agricultural survey numbers).
3. **Property Schema Standard:** Harmonized 19,146 parcels into a strict JSON schema:
   ```typescript
   interface CadastralParcel {
     id: string;              // Unique parcel hash
     surveyNo: string;        // Official Revenue Survey Number
     finalPlotNo?: string;    // TP Scheme Final Plot (FP)
     originalPlotNo?: string; // Original Plot (OP)
     village: string;         // Revenue Village (e.g. Kadipur, Sodhi, Otariya)
     tpScheme: number;        // Town Planning Scheme (1-6)
     zoning: ZoneClassification; // Industrial, Residential, Knowledge & IT, etc.
     areaSqMeters: number;    // Land parcel area
     jantriRatePerSqM: number;// Statutory benchmark rate
     coordinates: [number, number][][]; // Bounding polygon
   }
   ```

---

## 2. Rendering Engine Architecture

### 2D Cadastral Atlas (Sub-Second Interactive Viewport)
- **Viewport-Driven Spatial Culling:** Instead of parsing tens of thousands of SVG/DOM elements, the canvas renderer uses a spatial **R-Tree index** (`rbush`). Only polygons intersecting the active screen bounding box `(minX, minY, maxX, maxY)` are rendered.
- **Level-of-Detail (LOD) Pyramid:**
  - **Zoom 8–11 (Regional Macro View):** Renders regional boundary outlines and expressway corridors.
  - **Zoom 12–14 (TP Scheme View):** Dynamically shades statutory zoning colors (Residential, High-Density Commercial, Logistics).
  - **Zoom 15–19 (Cadastral Micro View):** Renders individual parcel boundary vectors, survey numbers, and centroid labels.

### 3D Globe & Camera Path Engine (CesiumJS)
- Leverages WebGL shaders and Google Photorealistic 3D Tiles.
- Pre-computed spline interpolation for smooth, cinematic transitions between key smart city hubs (e.g., Tata Semiconductor Fab $\rightarrow$ Dholera International Airport $\rightarrow$ ABCD Hub).

---

## 3. Real-Time Temporal Satellite Stream

- **Source:** ESA Copernicus Sentinel-2 Level-2A (Bottom of Atmosphere reflectance).
- **Update Frequency:** Re-visits Dholera SIR every 5 days.
- **Bands:** True-color RGB (B04, B03, B02) and False-Color Infrared (B08, B04, B03) for automated ground disturbance and vegetation indexing.
- **Delivery:** Cloudflare Edge-cached WebP tiles at sub-100ms latency.

---

## 4. Edge Infrastructure & Security

- **Edge CDN:** Immutable caching with Cloudflare Edge Workers for static vector tiles (`Cache-Control: public, max-age=31536000, immutable`).
- **Resilience:** Static fallback layers ensure 100% platform uptime even under heavy concurrent traffic spikes.

---

<p align="center">
  <b>DholeraMap.com Engineering Whitepaper</b>
</p>
