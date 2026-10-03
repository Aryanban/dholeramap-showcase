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

### 5. OP to FP (Original Plot to Final Plot) Reconstitution Engine
* Town Planning in Gujarat reconstitutes raw agricultural holdings (Original Plots / OP) into developed, accessible urban plots (Final Plots / FP) with land deduction for public infrastructure and roads.
* DholeraMap indexes OP $\to$ FP reconstitution mappings, enabling instantaneous cross-referencing for landowners and legal due diligence teams.

### 6. DGDCR 2024 & Jantri Valuation Rules Engine
* Embeds statutory development controls from the **Dholera Comprehensive General Development Control Regulations (DGDCR 2024)**:
  * Computes permissible Base FSI and Chargeable FSI based on road width.
  * Maximum permissible ground coverage and mandatory front/rear/side setbacks.
  * Government Jantri circle rate valuations across Residential, Commercial, Industrial, and Knowledge & IT zones.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph BrowserMain ["Browser Main Thread"]
        UI["Next.js 15 UI / Tailwind CSS"]
        LeafletMap["Leaflet Tile Viewer (Deep-Zoom WebP Tiles)"]
        Reticle["Canvas Reticle & Hover Marker Overlay"]
        Search["Survey & Final Plot Search Index"]
    end

    subgraph WebWorker ["Dedicated Web Worker (Background Thread)"]
        DecodedState["Flat Typed Arrays (Int32Array, Float32Array)"]
        BBoxCheck["Bounding Box Bounding Culling"]
        Raycast["Even-Odd Raycasting Point-in-Polygon"]
    end

    subgraph StaticAssets ["Static Tile & Binary Storage"]
        TilePyramid["Z-X-Y WebP Tile Pyramids (/tiles/tp{1-6}/)"]
        BinaryParcels["parcels.bin (DPB1 Delta-Int32 Format)"]
    end

    LeafletMap --> TilePyramid
    UI -->|Load Scheme| BinaryParcels
    BinaryParcels -->|Zero-Copy Transferable ArrayBuffer| WebWorker
    WebWorker --> DecodedState
    LeafletMap -->|Click/Hover Coordinates (x,y)| WebWorker
    WebWorker --> BBoxCheck
    BBoxCheck --> Raycast
    Raycast -->|Instant Hit Event (Plot ID, Centroid)| BrowserMain
    BrowserMain --> Reticle
    Search --> UI
```

---

## 🛠️ Technical Specifications & Engineering Decisions

| Dimension | Engineering Decision | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router) + TypeScript 5** | Strong typing across parcel schemas, DGDCR regulatory constants, and fast server-rendered metadata for SEO. |
| **Geometry Engine** | **Custom `DPB1` Delta-Int32 Binary** | Eliminates 50MB+ GeoJSON bloat, cutting download payload by >80% and avoiding main-thread JSON deserialization delays. |
| **Spatial Hit Testing** | **Web Worker Raycasting** | Decouples spatial math from the UI render loop; mouse moves and clicks never cause dropped animation frames. |
| **Map Viewer** | **Leaflet with Custom Coordinate Projection** | Ultra-stable 60fps pan/zoom across multi-resolution raster tile pyramids on mobile and low-spec laptops. |
| **Regulatory Engine** | **DGDCR 2024 Rules Engine** | Instant calculation of permissible FSI and setbacks based on statutory road widths and zone classifications. |
| **Reconstitution** | **OP $\to$ FP Indexing** | Bridges the critical gap between revenue agricultural survey numbers and town planning reconstituted plots. |

---

## 🔒 Source Code & Proprietary Rights

> [!IMPORTANT]  
> **Proprietary Commercial Platform**  
> DholeraMap.com is a commercial SaaS and land intelligence platform.  
> The production codebase, tile generation pipeline, binary serialization tools, and compiled cadastral datasets are private intellectual property.  
> 
> This public showcase demonstrates the actual system architecture, binary format design, and engineering decisions behind the platform.

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
