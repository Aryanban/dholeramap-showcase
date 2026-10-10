<div align="center">
  <img src="assets/logo.png" alt="DholeraMap Logo" width="120" />
  <h1>DholeraMap.com</h1>
  <p><b>Interactive Cadastral GIS Atlas & Spatial Linework Engine for Dholera Smart City</b></p>
  <p><i>Sub-millisecond Web Worker parcel hit-testing, WebP tile pyramids & DGDCR 2024 regulatory intelligence for 18,161 parcels across TP 1–6.</i></p>

  <p>
    <a href="https://dholeramap.com" target="_blank">
      <img src="https://img.shields.io/badge/🚀_Live_Production-dholeramap.com-0052FF?style=for-the-badge&logoColor=white" alt="Live App" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js%2015-000000?style=flat-square&logo=next.js&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript%205-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Leaflet%20GIS-199900?style=flat-square&logo=leaflet&logoColor=white" />
    <img src="https://img.shields.io/badge/Web%20Workers-FF6600?style=flat-square&logo=html5&logoColor=white" />
    <img src="https://img.shields.io/badge/Delta--Int32%20Binary-0284C7?style=flat-square" />
    <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
    <img src="https://img.shields.io/badge/Cloudflare%20CDN-F38020?style=flat-square&logo=cloudflare&logoColor=white" />
  </p>
</div>

---

## 🌟 What DholeraMap Actually Is

**DholeraMap.com** is an open-access interactive GIS intelligence platform built specifically for the **Dholera Special Investment Region (DSIR)** in Gujarat, India — India's premier greenfield smart city within the Delhi-Mumbai Industrial Corridor (DMIC).

### The Real-World Problem
Official Town Planning (TP) statutory blueprints, revenue village maps, and reconstitution records for Dholera's 6 Town Planning schemes (TP 1 through TP 6) were scattered across gigabytes of unindexed government raster scans, fragmented PDF gazettes, and complex CAD linework. Landowners, brokers, and institutional investors had no unified way to:
1. Search an agricultural **Revenue Survey Number** and see what **Final Plot (FP)** it was reconstituted into.
2. Inspect the exact statutory road width abutting their plot.
3. Calculate permissible **Floor Space Index (FSI)** and ground coverage under the **DGDCR 2024** development regulations.
4. Query government **Jantri benchmark rates** for real estate due diligence.

DholeraMap organizes and digitizes **18,161 statutory cadastral parcels across 22 revenue villages**, serving them smoothly in the browser on both mobile and desktop.

---

## 📸 Platform Capabilities & Visuals

<div align="center">
  <table>
    <tr>
      <td width="50%" align="center">
        <img src="assets/dholera_activation_area_masterplan.jpg" alt="TP Scheme Master Plan" width="100%" />
        <br/><b>Town Planning (TP) Statutory Zoning Linework</b>
      </td>
      <td width="50%" align="center">
        <img src="assets/tata_semiconductor_fab.jpg" alt="Tata Semiconductor Fab" width="100%" />
        <br/><b>Anchor Hubs: Tata ₹91,000 Cr Semiconductor Mega-Fab</b>
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <img src="assets/dholera_airport_expressway.jpg" alt="Ahmedabad-Dholera Expressway" width="100%" />
        <br/><b>Expressway & International Airport Spine</b>
      </td>
      <td width="50%" align="center">
        <img src="assets/dholera_land_records.jpg" alt="Land Records & Due Diligence" width="100%" />
        <br/><b>Revenue Survey Records & Jantri Due Diligence</b>
      </td>
    </tr>
  </table>
</div>

---

## ⚡ Core Engineering Innovations

### 1. The Bottleneck: Why Traditional GeoJSON Crashes Browsers
Shipping 18,161 complex parcel boundary polygons as traditional GeoJSON to the browser requires **50MB+ of raw JSON**, causing severe browser memory spikes, 2–3 second JSON parse freezes, and dropped frames whenever attaching mouse event handlers to thousands of DOM SVG paths.

### 2. Custom Binary Parcel Serialization (`DPB1` / `parcels.bin`)
To eliminate JSON parse overhead, parcel geometries are compiled into an optimized binary format:
* **Header:** `"DPB1"` magic bytes, canvas dimensions, parcel counts, string tables, and coordinate scale factors.
* **Strings Table:** Compact string dictionary mapping village names and plot identifiers.
* **44-Byte Parcel Records:** Pre-computed bounding box (`bbox`), vertex offsets (`voff`), vertex count (`vcount`), flags, key index, and centroid coordinates.
* **Delta-Int32 Vertex Array:** Coordinates are encoded as running sums of `int32` deltas from the parcel origin, reducing coordinate payload sizes by **over 80%**.

### 3. Off-Main-Thread Web Worker Hit Testing (`parcels-worker.ts`)
* When a scheme loads, the binary buffer is passed to a dedicated **Web Worker** using **Transferable ArrayBuffers** (`postMessage(..., [buffer])`) for zero-copy memory transfer.
* The worker decodes the buffer into flat typed arrays (`Uint32Array`, `Float32Array`, `Int32Array`, `Uint16Array`).
* **Even-Odd Raycasting Point-in-Polygon:** When a user clicks or hovers over the map canvas, coordinates are sent to the worker, which evaluates bounding boxes and executes raycasting math off the main thread.
* **Result:** **Zero UI freeze, zero main-thread lag**, and instant plot selection.

### 4. Deep-Zoom Tile Pyramid (Leaflet Custom CRS & WebP)
* Statutory TP scheme blueprints are sliced into multi-resolution Z-X-Y tile pyramids (`/tiles/tp1/` through `/tiles/tp6/`) encoded as lightweight WebP tiles.
* Sits on top of Leaflet with a custom coordinate reference system, giving users smooth deep-zoom exploration from macro regional scale down to individual plot boundaries without consuming excessive device memory.

### 5. Building Upon Live Satellite Map Overlays & Dual-Pane Orthorectification (`SatelliteOverlayViewer.tsx`)
Rather than rendering statutory cadastral blueprints in an abstract CAD vacuum, DholeraMap **builds directly upon live, high-resolution satellite imagery**, aligning theoretical town planning schemes with physical ground reality:
* **Dual-Pane Compositing Engine:** Decouples rendering into two hardware-accelerated Leaflet panes:
  * `satellitePane` (zIndex: 200): Sub-meter aerial satellite photography (Google Hybrid, Sentinel-2 temporal imagery, and Carto base layers) calibrated to maintain 100% crispness and true terrain colors.
  * `tpPane` (zIndex: 300): Statutory Town Planning schemes (TP 1 through TP 6), Development Plan (DP 2040) zoning boundaries, and 23 revenue village perimeters.
* **GPU-Accelerated CSS Blend Modes & Alpha Sliders:** Uses `mix-blend-mode: multiply` alongside interactive opacity sliders ($0\%$ to $100\%$). Physical ground truth — such as the **₹91,000 Cr Tata Semiconductor Mega-Fab**, Ahmedabad-Dholera Expressway alignments, canal culverts, and agricultural field bunds — shines cleanly through statutory zoning polygons without washing out fine cadastral linework.
* **Sub-Centimeter Geodetic Ground Control Points (GCP):** Cadastral scans are georeferenced against Dual-Frequency RTK / Differential GPS (DGPS) survey monuments tied directly to **Survey of India (SOI) GTS benchmarks**, projecting seamlessly into **WGS 84 (EPSG:4326)** and **UTM Zone 43N (EPSG:32643)** with sub-0.15m RMSE.
* **Dual-Geometry Satellite Inspection & Visual Beacons:** Clicking anywhere on the live satellite canvas drops a high-visibility locator beacon and queries `/api/gis/explore`, instantly rendering:
  * **Emerald Green Dashed Vector (`#22c55e`):** The ancestral agricultural Revenue Survey Number boundary.
  * **Vivid Red Solid Vector (`#ef4444`):** The reconstituted statutory Final Plot (FP) boundary.
* **Field Geodesic Ruler & Live GPS Beacon:** Integrated polyline geodesic distance calculation (`isMeasuring`) and live GPS positioning allow surveyors and investors to conduct on-site field verifications directly from a smartphone browser.

### 6. OP to FP (Original Plot to Final Plot) Reconstitution Engine
* Town Planning in Gujarat reconstitutes raw agricultural holdings (Original Plots / OP) into developed, accessible urban plots (Final Plots / FP) with land deduction for public infrastructure and roads.
* DholeraMap indexes OP $\to$ FP reconstitution mappings, enabling instantaneous cross-referencing for landowners and legal due diligence teams.

### 7. DGDCR 2024 & Jantri Valuation Rules Engine
* Embeds statutory development controls from the **Dholera Comprehensive General Development Control Regulations (DGDCR 2024)**:
  * Computes permissible Base FSI and Chargeable FSI based on road width.
  * Maximum permissible ground coverage and mandatory front/rear/side setbacks.
  * Government Jantri circle rate valuations across Residential, Commercial, Industrial, and Knowledge & IT zones.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph BrowserMain ["Browser Main Thread (Next.js 15 UI)"]
        UI["UI Layer / Tailwind CSS / Radix HUD"]
        LeafletContainer["Leaflet Map Engine"]
        Reticle["Visual Beacon & Hover Marker"]
        Ruler["Geodesic Distance Ruler"]
        Search["Survey & Final Plot Search Index"]
    end

    subgraph DualPanes ["Dual Leaflet Hardware Panes"]
        SatPane["satellitePane (zIndex: 200)<br/>Sub-meter Aerial Photography"]
        TpPane["tpPane (zIndex: 300)<br/>mix-blend-mode: multiply & Opacity Slider"]
    end

    subgraph WebWorker ["Dedicated Web Worker (Background Thread)"]
        DecodedState["Flat Typed Arrays (Int32Array, Float32Array)"]
        BBoxCheck["Bounding Box Bounding Culling"]
        Raycast["Even-Odd Raycasting Point-in-Polygon"]
    end

    subgraph StaticAndLiveAssets ["Data, Tile & Satellite Sources"]
        SatStream["Live Satellite Stream (Google Hybrid / Sentinel-2 / Carto)"]
        TilePyramid["Z-X-Y WebP Tile Pyramids (/tiles/tp{1-6}/)"]
        BinaryParcels["parcels.bin (DPB1 Delta-Int32 Format)"]
        ExploreAPI["/api/gis/explore (Reverse Spatial Geocoding)"]
    end

    LeafletContainer --> SatPane
    LeafletContainer --> TpPane
    SatStream --> SatPane
    TilePyramid --> TpPane
    
    UI -->|Load Scheme| BinaryParcels
    BinaryParcels -->|Zero-Copy ArrayBuffer Transfer| WebWorker
    WebWorker --> DecodedState
    
    LeafletContainer -->|Click / Hover (x, y)| WebWorker
    WebWorker --> BBoxCheck
    BBoxCheck --> Raycast
    Raycast -->|Instant Hit (FP ID, Centroid)| BrowserMain
    
    LeafletContainer -->|Map Click (Lat, Lng)| ExploreAPI
    ExploreAPI -->|Green Survey + Red FP Polygons| TpPane
    BrowserMain --> Reticle
    BrowserMain --> Ruler
    Search --> UI
```

---

## 🛠️ Technical Specifications & Engineering Decisions

| Dimension | Engineering Decision | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router) + TypeScript 5** | Strong typing across parcel schemas, DGDCR regulatory constants, and fast server-rendered metadata for SEO. |
| **Geometry Engine** | **Custom `DPB1` Delta-Int32 Binary** | Eliminates 50MB+ GeoJSON bloat, cutting download payload by >80% and avoiding main-thread JSON deserialization delays. |
| **Spatial Hit Testing** | **Web Worker Raycasting** | Decouples spatial math from the UI render loop; mouse moves and clicks never cause dropped animation frames. |
| **Satellite Overlay Engine** | **Dual-Pane Compositing & CSS `mix-blend-mode: multiply`** | Superimposes statutory cadastral linework and DP 2040 zoning over high-resolution live satellite imagery without obscuring ground truth. |
| **Geodesic Alignment** | **WGS 84 (EPSG:4326) / UTM Zone 43N with RTK-DGPS GCPs** | Eliminates scan distortion with sub-centimeter calibration tied to Survey of India GTS benchmarks. |
| **Map Viewer** | **Leaflet with Custom Coordinate Projection** | Ultra-stable 60fps pan/zoom across multi-resolution raster tile pyramids on mobile and low-spec laptops. |
| **Regulatory Engine** | **DGDCR 2024 Rules Engine** | Instant calculation of permissible FSI and setbacks based on statutory road widths and zone classifications. |
| **Reconstitution** | **OP $\to$ FP Indexing** | Bridges the critical gap between revenue agricultural survey numbers and town planning reconstituted plots. |

---

## 🔒 Source Code & Hackathon Evaluation Notice

> [!IMPORTANT]  
> **Source-Available Evaluation Repository**  
> The core application source code (Next.js 15 App Router, TypeScript components, Web Worker spatial hit-testing engine, RFC 9727 API discovery, and content negotiation middleware) is included in this repository for technical evaluation and hackathon judging (**ForgeHacks 2026**).  
> 
> **Moat & Data Protection**:  
> To protect commercial intellectual property:  
> 1. Multi-gigabyte statutory WGS84 tile pyramids (`/tiles/*`) and the compiled 18,161 parcel binary coordinate matrix (`parcels.bin`) are served from DholeraMap's production CDN edge and are substituted in this repository with lightweight verification fixtures (`public/tiles/sample/parcels.bin` and `public/data/`).  
> 2. All live payment secrets, Clerk private keys, and production API credentials have been sanitized into [`.env.example`](.env.example).  
> 3. All code is protected under the **Source-Available & Evaluation License** in [`LICENSE`](LICENSE), permitting technical review and competition judging while strictly prohibiting unauthorized commercial cloning, reproduction, or redistribution.  
> 
> To experience the full production platform with all 18,161 parcels and 6 Town Planning schemes, visit **[dholeramap.com](https://dholeramap.com)**.

---

## 👨‍💻 Engineering & Contact

**Aryan Bansal**  
*Full-Stack Engineer & Founder • IIIT Delhi*  
- 🌐 **Live Platform:** [https://dholeramap.com](https://dholeramap.com)
- 💼 **Personal Portfolio:** [https://www.webforge.me](https://www.webforge.me)
- 🔗 **LinkedIn:** [linkedin.com/in/aryan-bansal-b29b69370](https://www.linkedin.com/in/aryan-bansal-b29b69370/)
- ✉️ **Inquiries:** `contact@dholeramap.com` / `aryan24120@iiitd.ac.in`

<div align="center">
  <sub>© 2026 DholeraMap.com • All rights reserved.</sub>
</div>
