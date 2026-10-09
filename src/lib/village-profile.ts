/**
 * src/lib/village-profile.ts
 *
 * Per-village content engine for the /village/[slug] template.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * 22 village pages were generated from one template with the village name
 * swapped in. Empirically the no-survey villages were ~99% identical to each
 * other (1–3 unique words per page) and every village rendered the *same*
 * hardcoded "Town Planning Standards" table — textbook thin/templated content
 * that Google deindexes.
 *
 * THE FIX
 * -------
 * Two levers that both derive from real data, so the content varies because
 * the underlying facts vary:
 *
 * 1. ZONE NARRATIVES. All 22 functional-zone labels are unique to a single
 *    village, so a zone-keyed paragraph gives every village genuinely distinct
 *    prose about what its designation permits and what drives its value.
 * 2. COMPUTED STATS. For the 13 villages with published parcels, the standards
 *    block is replaced with figures computed from the actual gazetted
 *    registry (parcel count, median/largest area, road tiers, derived FAR
 *    range) instead of one shared hardcoded table.
 */

import { surveysForVillage } from '@/lib/gazetted-surveys';
import { getSchemeDGDCR } from '@/lib/dgdcr';

export interface ZoneNarrative {
  /** What the designation permits — plain English, 2–3 sentences. */
  what: string;
  /** What drives land value in this designation. */
  value: string;
  /** What a buyer must verify before paying. */
  buyer: string;
  /** Longer development outlook — used for villages whose per-parcel records
   *  are not yet published, so their page body is genuinely unique prose
   *  rather than a shared "pending" boilerplate with the name swapped. */
  development: string;
  /** Three zone-specific due-diligence checks. Generic legal advice
   *  paraphrased 22 ways is what made the old template duplicate; these are
   *  genuinely different because what matters differs by designation. */
  diligence: [string, string, string];
}

/**
 * Keyed by the exact `zone` string in src/lib/villages.ts. Every zone is
 * unique to one village, so each entry is read by exactly one page.
 */
export const ZONE_NARRATIVES: Record<string, ZoneNarrative> = {
  'Residential & Knowledge': {
    what: 'Residential & Knowledge combines R-1 residential development with institutional and educational institutions. Plots here are planned for housing, schools and research-oriented campuses rather than for standalone industry, so the permitted building envelope follows the residential DGDCR tables.',
    value: 'Value follows two things: abutting road width, which sets the permissible FAR, and proximity to the institutional anchors that generate steady housing demand. Residential land in a serviced TP 1 village sits in the strongest asking band in the SIR.',
    buyer: 'Confirm the abutting road width on the TP plan before trusting any price — two plots in the same village can carry very different FAR. Then verify the 7/12 land use is NA-converted and the Form 4/5 final plot schedule is gazetted.',
    development: 'Development here follows the SIR’s first-phase residential build-out: serviced final plots, institutional campuses and the supporting neighbourhood retail. Construction activity is visible on the serviced frontage, and absorption has been strongest where trunk utilities are already energised.',
    diligence: [
      'Confirm the plot’s abutting road width on the TP plan — residential FAR rises sharply on wider frontage, so the same village holds plots with very different build rights.',
      'Check that the 7/12 land use reads non-agricultural and that the Form 4/5 final plot schedule is gazetted, since residential plots here are often sold before reconstitution completes.',
      'Verify institutional setbacks if the parcel adjoins a campus — knowledge-zone master plans impose buffer requirements that reduce buildable area.',
    ],
  },
  'Expressway & Logistics': {
    what: 'Expressway & Logistics is designated for warehousing, freight handling and distribution uses that depend on direct highway access. Development is oriented toward the expressway corridor and its interchange structure rather than toward the city centre.',
    value: 'Value is almost entirely a function of usable access — proximity to an interchange plus an abutting service or TP road that can actually carry goods vehicles. A plot touching the expressway with no legal entry is worth far less than one further along a usable road.',
    buyer: 'Establish where the nearest interchange is and whether the plot has road frontage that connects to it. Verify the abutting road width, because logistics users need wide frontage for vehicle movement, and confirm the zoning permits warehouse use.',
    development: 'Development is tied to the expressway corridor’s freight role: distribution warehouses, trucking yards and transit-oriented commercial nodes cluster near the interchange structure. Build-out is mid-cycle — several logistics shells are operational while further parcels await servicing.',
    diligence: [
      'Establish the distance to the nearest interchange and whether the plot connects to it by a usable road — expressway-adjacent land with no legal entry is worth a fraction of interchange-connected land.',
      'Confirm the DGDCR envelope supports warehouse-scale development: logistics users need deep floor plates, yard space and wide road frontage for goods vehicles.',
      'Check whether the land use permits warehousing, since corridor-adjacent agricultural parcels are sometimes marketed as logistics sites without NA conversion.',
    ],
  },
  'Educational & University Zone': {
    what: 'Educational & University Zone is reserved for university campuses, higher-education institutions and the supporting residential and commercial development that a student population requires. It is an institutional-led district, not a general residential or industrial one.',
    value: 'Value is anchored by the institutional master plan: land adjoining a sanctioned campus benefits from captive demand for staff and student housing, while land further away behaves like ordinary peripheral residential land.',
    buyer: 'Confirm the campus boundaries on the TP plan, since the premium only attaches to land genuinely adjoining the institutional footprint, and verify the plot is inside the SIR boundary and NA-converted before paying an institutional-adjacency price.',
    development: 'Development is anchored by the planned institutional campus district: university and college land parcels, student and staff housing, and the commercial activity a campus population attracts. Campus construction phasing, not general residential demand, sets the pace here.',
    diligence: [
      'Confirm the campus boundaries on the institutional master plan — the price premium only attaches to land genuinely adjoining the sanctioned campus footprint.',
      'Verify the plot is inside the SIR boundary and NA-converted, since institutional-adjacent land is often oversold as university-adjacent when it sits outside the designated area.',
      'Check for institutional master-plan reservations that could reserve the parcel for campus expansion rather than private development.',
    ],
  },
  'High Access Mixed': {
    what: 'High Access Mixed is a mixed-use designation along a high-access corridor, permitting a blend of residential, commercial and limited office uses at higher density than a purely residential zone.',
    value: 'Value is driven by the corridor itself: plots abutting the wide TP roads carry the highest FAR and the strongest commercial conversion potential, making them materially more valuable than interior residential parcels.',
    buyer: 'Verify the exact abutting road width, because the mixed-use FAR uplift attaches to road frontage, not to the zone label. Confirm permitted uses for the specific plot and check the Form 4/5 reconstitution schedule.',
    development: 'Development is a mixed-use corridor build: ground-floor commercial with residential or office above, concentrated along the wide TP road. Because the mixed-use FAR uplift follows the road frontage, the corridor is developing as a continuous high-density spine rather than scattered plots.',
    diligence: [
      'Verify the exact abutting road width — the mixed-use FAR uplift attaches to road frontage, so interior plots do not share the corridor’s build rights.',
      'Confirm the permitted mix of uses for the specific plot, since mixed-use designations allow residential, commercial and office in varying proportions by frontage.',
      'Check the Form 4/5 reconstitution schedule, because corridor plots are frequently renumbered during final plot reconstitution.',
    ],
  },
  'Solar Park & Clean Tech': {
    what: 'Solar Park & Clean Tech is designated for renewable energy generation and the equipment manufacturing that supports it. Expect large land parcels with low ground coverage and height envelopes sized for industrial plant rather than housing.',
    value: 'Value reflects two different uses: large contiguous parcels suit generation, while smaller serviced parcels suit the manufacturing supply chain. Per-parcel value depends heavily on which of those the plot can realistically serve.',
    buyer: 'Large parcels here are often unserviced or only partially serviced, so confirm trunk infrastructure status before paying a serviced price. Verify permitted uses, since recreation or residential conversion is generally not allowed.',
    development: 'Development is dominated by the renewable-energy programme: large generation arrays on the solar-park parcels, with equipment-manufacturing and clean-tech supply-chain plots on the serviced periphery. The two uses price very differently, so per-parcel value depends on which the plot can serve.',
    diligence: [
      'Confirm trunk-infrastructure status before paying a serviced price — large parcels here are often only partially serviced despite industrial asking rates.',
      'Verify the plot can actually serve generation or equipment manufacturing given its size, frontage and grid interconnection position.',
      'Check that permitted uses exclude residential or recreational conversion, since renewable-zoned land cannot be repurposed for housing.',
    ],
  },
  'Rail Terminal & Industrial Core': {
    what: 'Rail Terminal & Industrial Core is planned around rail-served heavy industry, where plots are sized and zoned for manufacturing that benefits from direct freight rail access alongside road connectivity.',
    value: 'Value is driven by industrial demand for rail-accessible land, which commands a premium over road-only industrial parcels. The strongest prices attach to parcels with both rail proximity and a wide abutting road.',
    buyer: 'Confirm the rail terminal alignment on the TP plan and the plot’s actual distance to it. Verify the industrial DGDCR envelope, the NA land use and the final plot schedule — industrial parcels are frequently unserviced despite asking serviced prices.',
    development: 'Development is paced by the rail terminal and its siding infrastructure: heavy-plant parcels with direct freight access come to market as the terminal phases open, and road-only industrial parcels fill in between. Rail proximity, not village identity, determines which parcels command the industrial premium.',
    diligence: [
      'Confirm the rail terminal alignment and the plot’s actual distance to the siding — the industrial premium attaches to rail proximity, not to the village name.',
      'Verify the industrial DGDCR envelope from the abutting road width, since heavy-plant build rights differ sharply from ordinary industrial parcels.',
      'Check servicing status: industrial parcels in this designation are frequently unserviced despite being quoted at serviced industrial rates.',
    ],
  },
  'Renewable Hub': {
    what: 'Renewable Hub clusters renewable energy generation and related green-technology uses. It is an industrial-family designation with envelopes for plant and equipment rather than for residential development.',
    value: 'Value tracks the renewable supply chain: parcels that can host generation or equipment processing are worth more than those too small or poorly connected to serve either.',
    buyer: 'Confirm the plot can actually serve a renewable use given its size and frontage, verify the industrial DGDCR envelope and the trunk-infrastructure status, and check the 7/12 land use before paying an industrial price.',
    development: 'Development centres on the renewable cluster: generation capacity, grid interconnection and the green-technology supply chain. Parcels large enough to host generation are being absorbed first, with smaller processing and workshop plots following as the cluster matures.',
    diligence: [
      'Confirm the plot can serve a renewable use given its size and grid interconnection — parcels too small for generation may also be unsuitable for equipment processing.',
      'Verify the industrial DGDCR envelope and permitted uses, since renewable designations generally exclude residential conversion.',
      'Check trunk-infrastructure status and grid access, because renewable parcels derive value from interconnection rather than road frontage alone.',
    ],
  },
  'Waterfront & Coastal Tourism': {
    what: 'Waterfront & Coastal Tourism is designated for hospitality, leisure and tourism uses along the Gulf of Khambhat coastline. It is among the few non-industrial designations, with envelopes suited to resorts and supporting retail.',
    value: 'Value depends on genuine waterfront proximity and access, both of which vary sharply within the zone. Coastal-adjacent parcels command a tourism premium; inland parcels in the same designation do not.',
    buyer: 'Verify actual proximity to the coast and whether the plot has legal access to the waterfront, since the premium attaches to access rather than to the zone label. Confirm tourism permitted uses and check the coastal regulation position.',
    development: 'Development is the slowest-moving of the designations: hospitality and leisure projects depend on coastal access, environmental clearance and supporting connectivity, so build-out is earliest on parcels with genuine waterfront frontage and later inland.',
    diligence: [
      'Verify actual waterfront proximity and legal access to the coast — the tourism premium attaches to access, not to the zone label.',
      'Check coastal regulation and environmental clearance positions, which restrict construction within defined coastal setback distances.',
      'Confirm the hospitality permitted uses and whether the plot’s envelope supports resort-scale development rather than ordinary residential build.',
    ],
  },
  'City Center Commercial': {
    what: 'City Center Commercial is the central business district designation, carrying the highest commercial FAR and height envelopes in the SIR. It is planned for corporate, retail and mixed-use development rather than for industry or housing-led growth.',
    value: 'Value is the highest in the region on a per-square-yard basis because the CBD envelope supports the most buildable floor area. The official DICDL card prices city-centre land at the top of its rate table.',
    buyer: 'The premium here is real but must be verified: confirm the plot genuinely carries the high-access or city-centre envelope (it follows the abutting road width), and confirm the NA land use permits commercial construction.',
    development: 'Development is the most ambitious in the SIR: corporate towers, retail malls and mixed-use high-rise on the highest-FAR parcels. Because the envelope supports the most buildable floor area, city-centre land carries the strongest per-square-yard asking rates — and the longest development horizon.',
    diligence: [
      'Confirm the plot genuinely carries the high-access or city-centre envelope — the commercial FAR follows the abutting road width, so not every CBD plot supports tower-scale build.',
      'Verify the 7/12 land use permits commercial construction, since city-centre land is sometimes still recorded as agricultural before NA conversion.',
      'Check the final plot reconstitution schedule, because CBD parcels are frequently renumbered and their areas adjusted during reconstitution.',
    ],
  },
  'Residential & Civic': {
    what: 'Residential & Civic combines R-1 residential plots with civic amenities — community facilities, local administration and neighbourhood-scale services that support a resident population.',
    value: 'Value follows the ordinary residential logic of the serviced TP 1 band: road frontage sets FAR, and proximity to civic amenities supports steady occupancy demand.',
    buyer: 'Confirm the abutting road width and the resulting residential FAR envelope, verify the 7/12 is NA-converted, and check the final plot reconstitution schedule before committing.',
    development: 'Development is steady residential absorption: serviced final plots, civic amenities and neighbourhood-scale retail supporting a resident population. Construction is most advanced where trunk utilities are live, which is what supports the serviced-land premium.',
    diligence: [
      'Confirm the abutting road width and the resulting residential FAR envelope, which sets what you may legally build on the plot.',
      'Verify the 7/12 is NA-converted and that the Form 4/5 final plot schedule is gazetted before committing to a price.',
      'Check proximity to civic amenities on the master plan, since the residential premium partly reflects access to those facilities.',
    ],
  },
  'Heavy Industrial & Tech Parks': {
    what: 'Heavy Industrial & Tech Parks is designated for heavy engineering alongside technology-led manufacturing parks. Parcels are zoned for industrial plant, with envelopes sized for mid-to-high industrial buildings.',
    value: 'Value is driven by industrial absorption — demand from manufacturing tenants and owners — and by whether trunk infrastructure is actually live on the plot. Serviced industrial land in the SIR trades above residential land.',
    buyer: 'Confirm servicing status before paying a serviced industrial price, verify the industrial DGDCR envelope and permitted uses, and check the NA land use on the 7/12.',
    development: 'Development is industrial-led: heavy-engineering plant, tech-park floor space and the ancillary supply chain. Absorption is strongest where trunk infrastructure is energised, and industrial parcels on serviced frontage transact at a premium over unserviced land in the same village.',
    diligence: [
      'Confirm servicing status before paying a serviced industrial price — heavy-industrial parcels are frequently unserviced despite industrial asking rates.',
      'Verify the DGDCR envelope from the abutting road width, since heavy-plant build rights differ from tech-park floor plates.',
      'Check that the NA land use permits the intended industrial activity, since heavy-industry permissions carry additional environmental requirements.',
    ],
  },
  'Semiconductor Fab Corridor': {
    what: 'Semiconductor Fab Corridor is the designation around the Tata Electronics semiconductor fabrication plant — the single largest industrial anchor in the SIR. Land here is planned for the fab itself, its ancillary vendors and the supporting industrial ecosystem.',
    value: 'Value is driven by fab proximity and by vendor demand, which has produced the sharpest land-price movement in the region for adjoining villages. The premium is strongest where trunk infrastructure is live.',
    buyer: 'The premium is real but often mispriced: confirm actual distance to the fab footprint, verify whether the plot is serviced, and confirm the industrial envelope and NA land use rather than paying a fab-adjacency price for unserviced land.',
    development: 'Development is anchored by the Tata Electronics fabrication complex and its vendor ecosystem: fab construction, ancillary supply-chain plots and the industrial logistics that support them. The fab anchor is the single strongest demand driver for adjoining land in the entire SIR, and its construction phasing moves prices across the corridor.',
    diligence: [
      'Confirm actual distance to the fab footprint — the fab-adjacency premium only attaches to parcels genuinely adjoining the complex, not merely in the same village.',
      'Verify whether the plot is serviced and carries the industrial envelope, since vendors pay for live utilities and build-ready frontage.',
      'Check the NA land use and permitted industrial uses, because fab supply-chain parcels require industrial-zoned NA status rather than agricultural land.',
    ],
  },
  'Activation Industrial': {
    what: 'Activation Industrial lies inside the Activation Area — the first phase of the SIR with live trunk infrastructure. The designation covers industrial and industrial-support uses benefiting from delivered utilities.',
    value: 'Value is underpinned by delivered infrastructure: serviced industrial land in the Activation Area commands the strongest industrial asking rates in the SIR, above ordinary residential land elsewhere.',
    buyer: 'Confirm the plot is genuinely inside the serviced Activation Area and not merely in the same village, verify the industrial DGDCR envelope from the abutting road width, and check the NA land use.',
    development: 'Development sits inside the first-phase Activation Area: energised trunk utilities, serviced industrial plots and the highest industrial absorption in the SIR. Because infrastructure is already delivered, parcels here trade on completed-servicing economics rather than future promise.',
    diligence: [
      'Confirm the plot is genuinely inside the serviced Activation Area, not merely in the same village — serviced industrial land commands the strongest rates in the SIR.',
      'Verify the industrial DGDCR envelope from the abutting road width, since build rights determine what a manufacturing tenant will pay.',
      'Check the NA land use permits industrial use, because activation-area agricultural parcels cannot lawfully host industry without conversion.',
    ],
  },
  'Coastal Heavy Industry': {
    what: 'Coastal Heavy Industry is designated for heavy industrial uses that benefit from coastal proximity on the Gulf of Khambhat — typically processing, petrochemicals or port-linked manufacturing.',
    value: 'Value depends on the combination of coastal access, large parcel size and industrial servicing. Coastal-adjacent heavy parcels command a premium when all three are present.',
    buyer: 'Confirm actual coastal proximity and access rather than the zone label alone, verify the heavy industrial envelope and permitted uses, and check coastal-regulation and environmental-clearance positions.',
    development: 'Development is paced by coastal access and environmental clearance: processing and port-linked heavy industry parcels come to market as clearances and servicing align. The longest lead times in the industrial family sit here, so prices reflect development risk as much as location.',
    diligence: [
      'Confirm actual coastal proximity and access rather than the zone label alone, since the heavy-industrial premium attaches to usable coastal frontage.',
      'Check coastal regulation and environmental clearance positions, which restrict heavy-industrial construction within defined setback distances.',
      'Verify the heavy industrial envelope and permitted uses, and confirm servicing status before paying an industrial price.',
    ],
  },
  'Logistics Corridor': {
    what: 'Logistics Corridor is designated for freight, warehousing and distribution along the regional logistics spine. Parcels are planned for buildings with deep floor plates and generous yard space.',
    value: 'Value follows freight connectivity: proximity to the expressway and to the rail/freight infrastructure is what makes a logistics parcel viable, more than the village or the zone label.',
    buyer: 'Verify the plot’s road frontage and its distance to the nearest interchange or freight terminal, confirm the DGDCR envelope supports warehouse-scale development, and check servicing status.',
    development: 'Development is freight-led: warehousing, distribution centres and yard space along the logistics spine. Build-out tracks the expressway and freight infrastructure’s commissioning, with the strongest absorption on parcels that combine wide road frontage with proximity to the freight nodes.',
    diligence: [
      'Verify the plot’s road frontage and its distance to the nearest interchange or freight terminal — freight connectivity is what makes a logistics parcel viable.',
      'Confirm the DGDCR envelope supports warehouse-scale development with adequate yard space for vehicle movement.',
      'Check servicing status, since logistics users require metalled road access and cannot operate from unserviced parcels.',
    ],
  },
  'High Access Commercial Corridor': {
    what: 'High Access Commercial Corridor is a commercial designation along a wide, high-access road, permitting retail, office and mixed commercial development at an uplifted FAR.',
    value: 'Value is driven by the corridor’s road width, which sets the commercial FAR envelope and therefore the buildable floor area. Frontage on the wide road is the asset; interior parcels do not share the uplift.',
    buyer: 'Confirm the exact abutting road width, because the commercial FAR follows frontage. Verify permitted commercial uses on the plot and check the final plot reconstitution schedule.',
    development: 'Development is commercial infill along the wide corridor: retail, office and mixed commercial on the frontage that carries the FAR uplift. The corridor develops as a continuous commercial spine, while interior parcels in the same designation remain residential in character.',
    diligence: [
      'Confirm the exact abutting road width — the commercial FAR uplift follows frontage, so interior plots do not share the corridor’s build rights.',
      'Verify permitted commercial uses for the specific plot, since corridor designations mix retail, office and mixed-use in varying proportions.',
      'Check the final plot reconstitution schedule, because corridor plots are frequently renumbered during reconstitution.',
    ],
  },
  'Expressway Interchange Hub': {
    what: 'Expressway Interchange Hub is designated for the commercial, logistics and hospitality uses that cluster around a motorway interchange — fuel, retail, warehousing and transit-oriented commercial development.',
    value: 'Value is almost entirely about interchange proximity. Parcels with genuine, usable access to the interchange command a substantial premium; parcels in the same village without that access do not.',
    buyer: 'Establish the distance to the interchange and whether the plot connects to it by a usable road. Verify the permitted uses (interchange hubs mix commercial and logistics) and confirm servicing status.',
    development: 'Development clusters around the interchange: fuel and highway retail, transit-oriented commercial, warehousing and the hospitality that intercepts corridor traffic. Because value is almost entirely about interchange proximity, build-out is concentrated on the parcels with genuine usable access.',
    diligence: [
      'Establish the distance to the interchange and whether the plot connects to it by a usable road — interchange proximity without usable access is worth far less.',
      'Verify the permitted mix of uses, since interchange hubs combine fuel, retail, warehousing and hospitality with different envelopes.',
      'Check servicing status, because highway-oriented commercial uses require road frontage that unserviced parcels cannot lawfully use.',
    ],
  },
  'Residential & Green Conservation': {
    what: 'Residential & Green Conservation combines residential development with protected green and conservation areas. It is a lower-density residential designation, with conservation constraints on part of the land.',
    value: 'Value reflects the residential band adjusted for conservation constraints — developable area may be lower than the gross parcel, which must be priced accordingly.',
    buyer: 'Confirm how much of the parcel is actually developable after conservation setbacks, verify the residential FAR envelope from the abutting road width, and check the final plot schedule.',
    development: 'Development is lower-density residential with conservation constraints: a portion of the designated land is protected green, so the developable envelope per parcel must be confirmed against the conservation plan before any price is trusted.',
    diligence: [
      'Confirm how much of the parcel is actually developable after conservation setbacks — the green designation can remove a large share of the gross area from build.',
      'Verify the residential FAR envelope from the abutting road width, which sets the permissible build on the developable portion.',
      'Check the conservation plan boundaries, since protected green buffers can restrict even adjacent construction.',
    ],
  },
  'Knowledge & High Access': {
    what: 'Knowledge & High Access combines educational and research uses with a high-access road corridor, permitting institutional development plus the commercial activity that supports it.',
    value: 'Value follows the corridor frontage for the commercial component and proximity to sanctioned institutional anchors for the knowledge component.',
    buyer: 'Verify the abutting road width for the commercial FAR uplift, confirm whether the plot is institutional or commercial in its permitted use, and check the reconstitution schedule.',
    development: 'Development is institutional-led along the high-access corridor: research and educational campuses, with commercial supply on the frontage that carries the FAR uplift. Absorption follows the institutional master plan rather than general residential demand.',
    diligence: [
      'Verify the abutting road width for the commercial FAR uplift, since corridor frontage — not the zone label — sets the build rights.',
      'Confirm whether the plot’s permitted use is institutional or commercial, since the designation mixes campus and commercial development.',
      'Check the reconstitution schedule, because knowledge-corridor plots are frequently renumbered during final plot reconstitution.',
    ],
  },
  'Aerotropolis Cargo Support': {
    what: 'Aerotropolis Cargo Support is the designation serving the greenfield international airport — air cargo, MRO, logistics and the ground handling that an aerotropolis requires.',
    value: 'Value is a bet on the airport’s commissioning. Prices reflect expected future cargo demand rather than present activity, so the premium is real but forward-looking.',
    buyer: 'Understand the timing: the airport is under commissioning, so confirm servicing status and do not pay a fully-serviced price for unserviced land. Verify the DGDCR envelope supports cargo or MRO use.',
    development: 'Development is a forward-looking bet on the greenfield airport: air-cargo, MRO and ground-handling parcels will come to market as the airport commissions. Little is operational yet, so today’s prices reflect expected future cargo demand rather than present activity.',
    diligence: [
      'Understand the timing — the airport is under commissioning, so confirm servicing status and do not pay a fully-serviced price for unserviced land.',
      'Verify the DGDCR envelope supports cargo or MRO use, since aerotropolis parcels need deep floor plates and heavy-vehicle circulation.',
      'Check the airport master plan for noise and height restrictions, which can limit buildable height on adjoining parcels.',
    ],
  },
  'Aviation MRO': {
    what: 'Aviation MRO is designated for aircraft maintenance, repair and overhaul operations and the technical supply chain that supports them, tied to the greenfield international airport.',
    value: 'Value is driven by airport proximity and by the specialised industrial demand for hangar and workshop space, which is a narrower market than general logistics.',
    buyer: 'Confirm the plot’s actual distance to the airport site, verify the industrial envelope suits MRO-scale buildings, and check servicing status and the NA industrial land use.',
    development: 'Development depends on the airport’s commissioning and on the specialised demand for hangar and workshop space. Because MRO is a narrower market than general logistics, absorption here is slower but commands specialist rents once the airport is live.',
    diligence: [
      'Confirm the plot’s actual distance to the airport site and whether it has airside or landside access, since MRO demand depends on proximity to the operational terminals.',
      'Verify the industrial envelope suits hangar and workshop-scale buildings, which are larger and higher than ordinary industrial units.',
      'Check servicing status and the NA industrial land use, because MRO operations require industrial-zoned NA status and live utilities.',
    ],
  },
  'Airport Logistics': {
    what: 'Airport Logistics is designated for the freight and distribution activity generated by the greenfield international airport — warehousing, cargo handling and airport supply uses.',
    value: 'Value is tied to the airport’s commissioning timeline and to proximity to the cargo terminals. It is a forward-looking premium, strongest for parcels with real airport access.',
    buyer: 'Confirm the airport access rather than just the airport-side location, verify servicing status before paying a serviced price, and check that the DGDCR envelope supports warehouse-scale development.',
    development: 'Development is tied to the airport cargo terminals’ opening: warehousing and freight-handling parcels will absorb as cargo operations begin. Until then, prices price in the airport’s future rather than present throughput.',
    diligence: [
      'Confirm airport access rather than just airport-side location — the logistics premium requires a usable route to the cargo terminals.',
      'Verify servicing status before paying a serviced price, since airport logistics parcels are often still awaiting trunk infrastructure.',
      'Check that the DGDCR envelope supports warehouse-scale development and that the NA use permits freight handling.',
    ],
  },
};

export interface SchemeStatus {
  /** Servicing position for this TP scheme. */
  servicing: string;
  /** Pricing context for this TP scheme. */
  pricing: string;
}

/** Servicing and pricing context keyed by primary TP scheme. */
export const SCHEME_STATUS: Record<string, SchemeStatus> = {
  'TP 1': {
    servicing: 'TP 1 carries the Activation Area, where trunk infrastructure — underground power, recycled water, optical fibre and effluent networks — is live and monitored. It is the most serviced part of the SIR, which is why it commands the strongest residential asking rates.',
    pricing: 'Serviced TP 1 residential land asks roughly ₹11,000–16,000 per square yard, with parcels abutting the 55 m TP roads at the top of the band and serviced industrial parcels higher still.',
  },
  'TP 2': {
    servicing: 'TP 2 contains the semiconductor fab corridor and the industrial core. Live trunk infrastructure covers the Activation Area portion, making it the strongest industrial location in the SIR; parcels outside the serviced core are still gazetted but await utilities.',
    pricing: 'Serviced industrial land in the live-trunk TP 2 corridor asks up to roughly ₹21,000 per square yard — above typical residential land — while mixed parcels ask ₹11,000–15,000 depending on frontage.',
  },
  'TP 3': {
    servicing: 'TP 3 covers the commercial core and aerotropolis support. It is gazetted and planned, with trunk infrastructure rolling out rather than delivered, so prices here reflect future servicing.',
    pricing: 'TP 3 residential land asks roughly ₹9,000–12,000 per square yard, with a premium for parcels carrying the city-centre or high-access commercial envelope.',
  },
  'TP 4': {
    servicing: 'TP 4 covers the solar, knowledge and logistics corridors. It is gazetted and planned, with trunk infrastructure still being rolled out across the band.',
    pricing: 'TP 4 parcels generally ask within the ₹9,000–12,000 residential band, with serviced industrial logistics parcels considerably higher where trunk infrastructure is live.',
  },
  'TP 5': {
    servicing: 'TP 5 is the aerotropolis — airport support, MRO and cargo — tied to the greenfield international airport at Navagam, which is under commissioning. Trunk infrastructure is being delivered in step with the airport.',
    pricing: 'TP 5 prices are a forward-looking airport bet: high-access-corridor parcels ask the strongest rates in the band, while unserviced aerotropolis parcels ask far less.',
  },
  'TP 6': {
    servicing: 'TP 6 is the peripheral coastal and airport-logistics band. It is gazetted and planned, but trunk infrastructure is at the earliest stage of rollout, so this is the longest-hold part of the SIR.',
    pricing: 'Peripheral TP 6 land asks roughly ₹8,000–9,500 per square yard — the lowest band in the SIR — because the price reflects future potential rather than present servicing.',
  },
};

/**
 * Per-village geography and market context.
 *
 * WHY THIS EXISTS
 * ---------------
 * Nine of the 22 villages have no published per-parcel records, so their pages
 * previously fell back to a "survey records pending" notice and averaged ~820
 * words against ~2,280 for villages that do have parcels. That gap is not a
 * data problem — it is a rendering problem: the page simply stopped early.
 *
 * These fields are keyed by village slug and describe facts that hold for that
 * specific village regardless of whether its parcels are digitised yet: where
 * it sits relative to the SIR's anchor infrastructure, what is physically
 * located there, and how its market actually behaves. They are written per
 * village, not generated, because a template that varies only by name
 * substitution is exactly the problem this module already exists to fix.
 *
 * Everything here is a general market and planning statement about the village,
 * not a valuation of any individual parcel, and no specific parcel figures are
 * asserted on villages whose per-parcel records are not yet published.
 */
export interface VillageContext {
  /** Where the village sits relative to Dholera's anchor infrastructure. */
  location: string;
  /** Named projects, facilities or anchor demand physically located here. */
  anchors: string[];
  /** How this village's land market actually behaves, and why. */
  market: string;
  /** Who realistically ends up buying here. */
  demand: string;
  /** What a buyer cannot verify remotely and must check on the ground. */
  onGroundCheck: string;
}

export const VILLAGE_CONTEXT: Record<string, VillageContext> = {
  ambli: {
    location:
      'Ambli sits inside the TP 1 Activation Area, close to the ABCD Building and the operating trunk-utility network rather than at the SIR boundary. It is one of the most centrally located of the 22 revenue villages.',
    anchors: [
      'ABCD Building administration complex and its surrounding commercial frontage',
      'Live underground power, recycled water, optical fibre and effluent trunk runs',
      'TP 1 residential and mixed-use sub-sectors with sanctioned internal roads',
    ],
    market:
      'Ambli is one of the few villages where the asking rate is defensible on servicing grounds rather than on future promises, because utilities are already energised under the plots. The premium over non-Activation-Area land is genuine, and so is the resulting risk of being fully priced in.',
    demand:
      'Owner-occupier buyers building in the near term, NRI families wanting proximity to the airport and the Ahmedabad expressway, and investors who need liquidity rather than long-hold appreciation.',
    onGroundCheck:
      'Walk the abutting road and confirm the carriageway is actually built rather than only sanctioned, check whether the plot is still agricultural in the latest 7/12 extract, and verify block-level transformer and water connection status.',
  },
  bavaliyari: {
    location:
      'Bavaliyari straddles the TP 5 and TP 6 schemes along the Dholera Expressway corridor, sitting south-east of the Activation Area toward the greenfield international airport at Navagam.',
    anchors: [
      'Dholera Expressway frontage and its interchange nodes',
      'Proximity to the Navagam international airport site',
      'TP 5 aerotropolis and TP 6 peripheral band designations',
    ],
    market:
      'Expressway frontage is the dominant pricing variable here, and it is a notoriously over-claimed one. Frontage that is only notified, not built, supports a materially lower rate than frontage with a formed carriageway, and the distinction is invisible in a brochure.',
    demand:
      'Logistics and warehousing developers building for the airport and expressway catchment, plus longer-hold investors willing to accept infrastructure risk for a lower entry price.',
    onGroundCheck:
      'Stand at the plot boundary and confirm whether the road you are being charged frontage for has been formed, check whether the expressway alignment is final or still under notification, and verify how far the nearest functioning utility connection actually is.',
  },
  bhadana: {
    location:
      'Bhadana lies within the TP 1 sheet in the educational and university belt, positioned between the Activation Area and the higher-education cluster to the west.',
    anchors: [
      'TP 1 educational and university zone designation',
      'Proximity to the Dholera academic and institutional cluster',
      'Sanctioned 30m and 45m district road grid within the TP 1 sheet',
    ],
    market:
      'Institutional and educational anchoring supports rental demand that pure residential land elsewhere in the SIR does not, but the uplift is realised slowly and depends on the institutions actually being built rather than merely allotted.',
    demand:
      'Institutional developers, education-sector operators seeking staff and student accommodation, and residential buyers who want to be near the university cluster.',
    onGroundCheck:
      'Confirm which allotments in your radius have broken ground, check the village panchayat position on water and power for non-urban plots, and verify the 7/12 land use supports the built form you intend before committing.',
  },

  bhadiyad: {
    location:
      'Bhadiyad is on the TP 1 sheet in the high-access mixed band, close to the Activation Area while retaining larger, cheaper parcels than the immediate core.',
    anchors: [
      'TP 1 high-access mixed-use designation',
      'Proximity to both the Activation Area and the Ahmedabad-Dholera expressway',
      'Sanctioned sub-sector access roads off the TP road hierarchy',
    ],
    market:
      'Bhadiyad is where the Activation Area premium begins to thin out. Larger parcel sizes at lower per-square-yard rates make it the practical entry point for buyers who want TP 1 zoning without TP 1 Activation pricing, and that positioning is what the market reflects.',
    demand:
      'Mid-size residential builders, buyers assembling two or three parcels into one site, and investors targeting the gap between prime Activation land and undeveloped TP 1 land.',
    onGroundCheck:
      'Confirm which TP sub-sector the parcel falls in, since the sub-sector determines permitted FAR, and check whether the internal sub-sector road serving the plot is sanctioned and formed or still only on paper.',
  },
  bhangadh: {
    location:
      'Bhangadh falls in the TP 6 solar and clean-technology band, in the peripheral south-east of the SIR away from the Activation Area core.',
    anchors: [
      'TP 6 solar park and clean technology designation',
      'Proximity to the Bhangadh solar park and associated generation infrastructure',
      'Peripheral position relative to the expressway and airport nodes',
    ],
    market:
      'Clean-energy land is priced on the strength of the generation asset and its grid evacuation route rather than on urban servicing. The designation creates a plausible demand story, but without confirmed evacuation infrastructure the rate is an option premium, not a cash-flow premium.',
    demand:
      'Renewable energy developers and their land aggregators, industrial buyers seeking large contiguous holdings, and long-hold investors who model infrastructure-driven appreciation.',
    onGroundCheck:
      'Verify the grid evacuation route and its sanction status, confirm the parcel falls within the sanctioned solar park boundary rather than merely adjacent to it, and check whether the transmission infrastructure is built or still on paper.',
  },
  bhimnath: {
    location:
      'Bhimnath is in the TP 2 rail terminal and heavy industrial core, positioned along the corridor where the dedicated freight and rail logistics infrastructure is planned.',
    anchors: [
      'Dedicated rail freight corridor and proposed rail terminal',
      'TP 2 heavy industrial and technology park designation',
      'Proximity to the TP 2 industrial core with live trunk infrastructure at its eastern end',
    ],
    market:
      'Rail-adjacent industrial land carries a real logistics premium, but the premium is being capitalised ahead of the terminal being operational. The gap between parcels near a functioning road and parcels near a planned rail alignment is often wider here than the brochures suggest.',
    demand:
      'Manufacturing and logistics facility developers, large-format warehousing operators, and industrial land aggregators assembling hectare-scale holdings.',
    onGroundCheck:
      'Confirm the rail alignment is in the gazetted final alignment rather than a preliminary one, check the permitted industrial use against the 7/12 classification, and verify heavy-vehicle road access to the plot is actually passable year-round.',
  },
  bhimtalav: {
    location:
      'Bhimtalav sits on the TP 1 sheet in the renewable hub designation, within the Activation Area but with a land use profile oriented toward energy and utility infrastructure rather than pure residential.',
    anchors: [
      'TP 1 renewable and utility infrastructure designation',
      'Adjacency to the Activation Area trunk network',
      'Sanctioned TP 1 road grid with 18m to 30m access tiers',
    ],
    market:
      'Utility and renewable-adjacent land in TP 1 inherits Activation Area servicing but not residential pricing, because the permitted uses are narrower. That combination is genuinely under-appreciated and tends to re-rate once ancillary industrial demand arrives.',
    demand:
      'Renewable project developers, utility infrastructure providers, and industrial buyers seeking serviced land inside TP 1 at below residential rates.',
    onGroundCheck:
      'Confirm the permitted use schedule for the sub-sector actually permits your intended use, check the transmission and utility corridor setbacks that may restrict buildable area, and verify existing utility connections in writing.',
  },
  cher: {
    location:
      'Cher occupies the TP 3 waterfront band, on the reservoir and coastal edge of the SIR where the water and recreation designations apply.',
    anchors: [
      'TP 3 waterfront and coastal tourism designation',
      'Reservoir and waterfront frontage forming the SIR recreational edge',
      'TP 3 high-access commercial frontage along the principal spine',
    ],
    market:
      'Waterfront land is the most narrative-sensitive category in Dholera. Tourism and leisure demand is plausible and largely undeveloped, which means the market is thin enough that comparable transactions are scarce and broker pricing can drift well away from cleared prices.',
    demand:
      'Hospitality and leisure developers, second-home buyers, and speculative investors underwriting the long-horizon tourism thesis.',
    onGroundCheck:
      'Establish the water body status and whether the waterfront is reservoir, canal or open coast, check for any water-body buffer restriction that reduces your buildable area, and confirm flood and drainage exposure for the specific parcel before assuming leisure use is permitted.',
  },
  dholera: {
    location:
      'The village of Dholera is the eponymous historic settlement at the centre of the TP 3 city-centre commercial band, the original nucleus around which the Special Investment Region was designated.',
    anchors: [
      'TP 3 city centre commercial designation',
      'Historic Dholera bazaar and established settlement fabric',
      'Concentration of existing roads, power and civic infrastructure',
    ],
    market:
      'As the historic core, Dholera village is the only settlement in the SIR with fully existing civic services and a built population, which cuts both ways: it is genuinely live, but it is also the part of the SIR least transformed, and land conversion from existing village use is procedurally slower.',
    demand:
      'Commercial developers seeking an established address, local landholders transitioning out of agricultural use, and buyers who want an already-serviced location rather than a serviced-in-future one.',
    onGroundCheck:
      'Establish whether the plot is inside the old village ab limits or in the TP 3 reconstituted area, as the two carry entirely different conversion procedures and timelines, and check the prevailing land use in the latest 7/12.',
  },
  gogla: {
    location:
      'Gogla is on the TP 1 sheet in the residential and civic designation, close to the Activation Area and within reach of the sanctioned civic-amenity parcels.',
    anchors: [
      'TP 1 residential and civic designation',
      'Proximity to the Activation Area trunk utilities and ABCD Building',
      'Sanctioned civic and institutional parcels within the surrounding TP 1 grid',
    ],
    market:
      'Residential land near a civic cluster is priced on the amenities rather than the frontage, and Gogla benefits from being close enough to Activation to be serviced while sitting on cheaper ground than the immediate core. That narrow band is where the SIR most liquid residential resale operates.',
    demand:
      'Owner-occupier residential buyers, mid-income first-time buyers seeking proximity to employment, and investors targeting rental rather than long-hold appreciation.',
    onGroundCheck:
      'Confirm which civic amenities are sanctioned and which are only proposed, verify block-level water and power connection status rather than relying on the scheme-level claim, and check the 7/12 for any government reservation affecting the parcel.',
  },
  gorasu: {
    location:
      'Gorasu occupies the TP 2 heavy industrial and technology park band, inside the industrial core where trunk infrastructure is live in its eastern portion.',
    anchors: [
      'TP 2 heavy industrial and technology parks designation',
      'Live trunk power, water and effluent infrastructure in the serviced core',
      'Proximity to the Dholera-Sanand industrial and expressway freight corridor',
    ],
    market:
      'Gorasu is where the SIR industrial rates are genuinely defensible, because the utilities are live rather than promised. The trade-off is that serviced industrial land is also the most expensive non-residential land in the region and carries heavy environmental compliance obligations.',
    demand:
      'Manufacturing facility developers, industrial park developers, and corporate land buyers requiring large contiguous plots with confirmed power and water load.',
    onGroundCheck:
      'Verify the available power load and the sanctioned water and effluent capacity in writing, confirm the plot industrial use is permitted in the TP 2 schedule, and check the distance to the nearest effluent outfall because that governs whether heavy industry is actually licensable.',
  },
  kadipur: {
    location:
      'Kadipur is in the TP 1 Activation industrial band, immediately adjacent to the ABCD Building and the most intensively developed part of the Activation Area.',
    anchors: [
      'Direct adjacency to the ABCD Building administration complex',
      'TP 1 Activation industrial and commercial designation',
      'Fully live trunk power, water, optical fibre and effluent infrastructure',
    ],
    market:
      'Kadipur is the highest-conviction industrial location in the SIR because proximity to the ABCD Building and live utilities make it the easiest parcel to actually build on. That reliability is why it prices above every other industrial band here, and why resale liquidity is strongest in TP 1 commercial.',
    demand:
      'Corporate offices, commercial developers, institutional builders, and investors who need a site that can be built on immediately rather than serviced later.',
    onGroundCheck:
      'Confirm the abutting road width against the sanctioned TP hierarchy, since frontage rather than zone sets the value at this end of the market, and verify utility connection charges and timelines in writing with DSIRDA rather than the broker.',
  },
  'hebatpur': {
    location:
      'Hebatpur is in the TP 2 semiconductor fab corridor, adjacent to the announced Tata Electronics fabrication facility and the Activation Area.',
    anchors: [
      'Announced Tata Electronics semiconductor fabrication facility',
      'TP 2 semiconductor and electronics industry corridor',
      'Live trunk infrastructure in the adjacent Activation Area',
    ],
    market:
      'Hebatpur has the most concentrated single-anchor demand story in the SIR, and that concentration cuts both ways: it supports a real premium while the fab is being built, but exposes the land to the binary reality of whether and when the anchor actually reaches production.',
    demand:
      'Electronics component suppliers, industrial park developers, and investors underwriting the fab-anchor thesis specifically rather than Dholera growth in general.',
    onGroundCheck:
      'Verify the fab land parcel boundary and the distance from your plot to it, check whether the state government acquisition for the facility is final, and confirm the TP 2 sub-sector rules rather than assuming fab-corridor land carries fab-corridor permissions.',
  },
  khun: {
    location:
      'Khun sits in the TP 1 coastal heavy industry band on the western seaboard side of the SIR, away from the Activation Area and oriented toward port-linked industry.',
    anchors: [
      'TP 1 coastal heavy industry designation',
      'Proximity to the western coastline and its industrial access points',
      'Sanctioned 45m and 70m heavy-vehicle road tiers within the TP 1 sheet',
    ],
    market:
      'Heavy industrial coastal land is a long-hold proposition. It lacks the Activation Area live utilities and its price reflects eventual port connectivity, so it is priced on optionality rather than present servicing and is the most speculative of the TP 1 designations.',
    demand:
      'Heavy engineering and process plant developers, port-adjacent industrial users, and land aggregators assembling very large holdings.',
    onGroundCheck:
      'Check coastal regulatory restrictions and the distance from the shoreline, verify effluent discharge feasibility given the marine environment, and confirm heavy-vehicle road access is genuinely passable rather than nominally designated.',
  },
  mundi: {
    location:
      'Mundi falls in the TP 4 logistics corridor, positioned where the SIR freight and distribution land is concentrated between the expressway network and the industrial schemes.',
    anchors: [
      'TP 4 logistics corridor designation',
      'Proximity to the Dholera Expressway freight routes',
      'Sanctioned wide-format road hierarchy suitable for heavy goods vehicles',
    ],
    market:
      'Logistics corridor land sits between two price points: the expressway-adjacent parcels that trade near industrial rates, and the unconnected remainder that trades near residential rates. The gap is wider here than anywhere else in the SIR, so location within Mundi matters more than the Mundi name.',
    demand:
      'Third-party logistics operators, warehousing developers, and industrial park developers seeking contiguous land near freight routes.',
    onGroundCheck:
      'Measure the actual distance to the nearest expressway interchange rather than to the expressway line, confirm heavy goods vehicle access to the plot, and verify whether the parcel abuts a sanctioned 30m-plus logistics road or a narrower sub-sector road.',
  },
  otariya: {
    location:
      'Otariya lies in the TP 2 and TP 3 overlap, on the high-access commercial corridor that links the industrial core toward the city-centre commercial band.',
    anchors: [
      'TP 2 / TP 3 overlap designation',
      'High-access commercial corridor status between industrial and city-centre zones',
      'Sanctioned arterial road tiers connecting the two schemes',
    ],
    market:
      'Overlapping-scheme villages are where the pricing is least transparent, because the same plot can be assessed against TP 2 industrial comps or TP 3 commercial comps and the two can differ by a factor of two. The corridor premium is real; the correct benchmark is genuinely unclear.',
    demand:
      'Mixed commercial developers, showroom and hospitality operators seeking high frontage, and investors arbitraging the two schemes valuations.',
    onGroundCheck:
      'Establish which scheme prevails on your specific parcel, because the overlap is not resolved uniformly, and confirm the permitted use schedule under that scheme before relying on commercial permissions advertised under the other.',
  },
  pipli: {
    location:
      'Pipli sits in the TP 2 and TP 4 overlap at the expressway interchange hub, on the eastern side of the SIR where the expressway meets the logistics corridor.',
    anchors: [
      'TP 2 / TP 4 overlap designation',
      'Dholera Expressway interchange and its approach frontage',
      'Logistics corridor connection toward the industrial and port networks',
    ],
    market:
      'Interchange-hub land carries the SIR clearest logistics premium, but interchange land is also the most frequently misrepresented category, because interchange distance is usually measured to the alignment rather than to a usable junction. Frontage on a formed interchange approach is worth several times frontage on a notified alignment.',
    demand:
      'Logistics park developers, truck-stop and ancillary service operators, and commercial developers seeking interchange visibility.',
    onGroundCheck:
      'Confirm the interchange is commissioned and not merely notified, measure approach-road frontage rather than alignment proximity, and verify whether the plot has direct access to the interchange or only to a link road.',
  },
  rahtalav: {
    location:
      'Rahtalav lies in the TP 2 and TP 4 overlap in the residential and green conservation band, where the SIR open-space and conservation designations constrain development.',
    anchors: [
      'TP 2 / TP 4 overlap designation',
      'Residential and green conservation zoning',
      'Proximity to the SIR designated green buffer and open-space network',
    ],
    market:
      'Conservation-adjacent residential land is valued on the amenity it will never be able to build over, which produces a defensible premium in a scarcity situation and a real risk if the buffer is revised. The holding thesis and the legal risk are the same fact.',
    demand:
      'End-user residential buyers seeking open-space adjacency, and investors underwriting long-hold amenity value rather than near-term development.',
    onGroundCheck:
      'Obtain the green buffer boundary layer and confirm your plot sits outside it, check for any tree or ecology restriction on the 7/12, and verify the developable net area after deducting the buffer setback before valuing the land.',
  },
  sandhida: {
    location:
      'Sandhida is in the TP 3 and TP 4 overlap, in the knowledge and high-access band linking the city-centre commercial core toward the logistics and solar zones.',
    anchors: [
      'TP 3 / TP 4 overlap designation',
      'Knowledge-sector and institutional land designations',
      'High-access road connection between the TP 3 and TP 4 schemes',
    ],
    market:
      'Knowledge-sector land near the city centre is the most speculative of the SIR designations, because the institutions it depends on have not all been built. It trades on the expectation of a research and office cluster, which is why the rate is high relative to current built form and why the holding period is long.',
    demand:
      'Research and institutional developers, office builders seeking the city-centre address, and long-hold investors underwriting the knowledge-economy thesis.',
    onGroundCheck:
      'Establish which overlap scheme governs your parcel, verify the permitted institutional and office use under that scheme rather than the research narrative, and check whether the road network connecting to the city centre is formed or only notified.',
  },
  sangasar: {
    location:
      'Sangasar occupies the TP 3 aerotropolis cargo support band, positioned to serve the airport cargo and freight-handling functions on its eastern approach.',
    anchors: [
      'TP 3 aerotropolis cargo support designation',
      'Cargo handling and freight support functions associated with the airport',
      'Proximity to the Navagam airport site and its cargo precincts',
    ],
    market:
      'Cargo-support land is the most operationally specific designation in the SIR and correspondingly the hardest to substitute. If cargo volumes develop as projected, the land is close to irreplaceable; if the airport timetable slips, the same land has few alternative uses, which makes this the highest-variance position in the region.',
    demand:
      'Air cargo operators, logistics park developers, cold-chain and freight handling facilities, and forward-linked aviation support businesses.',
    onGroundCheck:
      'Confirm the airport construction and commissioning status at the time of purchase, check whether your plot is inside the notified aerotropolis boundary, and verify height and clear-zone restrictions imposed by airport approach rules.',
  },
  umargadh: {
    location:
      'Umargadh is in the TP 1 aviation MRO band, on the eastern side of the Activation Area where maintenance, repair and overhaul operations are zoned.',
    anchors: [
      'TP 1 aviation MRO designation',
      'Proximity to the Navagam airport and its operational catchment',
      'Sanctioned TP 1 road grid with 24m to 45m service tiers',
    ],
    market:
      'MRO land depends on airlines and lessors placing maintenance work at the airport, which is a contract-led market rather than a demand-led one. Until those contracts are executed the land is a forward bet, and the premium over general industrial land reflects the designation rather than signed demand.',
    demand:
      'Aviation MRO operators, airline technical services companies, and industrial developers building maintenance hangars and associated facilities.',
    onGroundCheck:
      'Confirm the MRO designation in the current TP schedule rather than relying on maps, check hangar height and clear-span requirements against DGDCR rules, and verify whether the operator has actual airline MRO contracts before underwriting the land.',
  },
  zankhi: {
    location:
      'Zankhi is in the TP 6 airport logistics band, on the airport side of the SIR where cargo handling, warehousing and last-mile distribution land is zoned.',
    anchors: [
      'TP 6 airport logistics designation',
      'Proximity to the Navagam airport cargo precincts',
      'Peripheral position in the SIR with earliest-stage infrastructure rollout',
    ],
    market:
      'Airport logistics land is priced as the logical successor to the Activation Area, on the logic that cargo growth eventually pushes distribution outward. That thesis is coherent, but Zankhi has the earliest-stage infrastructure of any airport-adjacent designation, so the gap between current price and current reality is the widest in the SIR.',
    demand:
      'Logistics park developers, air cargo terminal operators, and long-hold investors seeking the lowest entry price into the airport growth corridor.',
    onGroundCheck:
      'Verify the airport logistics precinct boundaries and whether your plot is inside them, check the current status of trunk utility rollout on the ground rather than on the scheme plan, and confirm road connectivity is sufficient for container and heavy truck movement.',
  },
};

export interface VillageStats {
  parcelCount: number;
  totalAreaSqM: number;
  medianAreaSqM: number;
  largestAreaSqM: number;
  largestSurveyNo: string;
  smallestAreaSqM: number;
  roadWidths: number[];
  farRange: { min: number; max: number };
  subSectors: string[];
}

/**
 * Look up a village's narrative context. Falls back to a village-name-only
 * generic record rather than rendering nothing, so a newly added village still
 * produces a coherent page rather than an empty section.
 */
export function getVillageContext(slug: string, name: string): VillageContext {
  return (
    VILLAGE_CONTEXT[slug] ?? {
      location: `${name} is one of the 22 gazetted revenue villages incorporated into the Dholera Special Investment Region, falling inside its designated Town Planning scheme area.`,
      anchors: [],
      market: `Land in ${name} is priced primarily on its Town Planning sub-sector, its abutting sanctioned road width and the distance of the parcel from live trunk infrastructure, rather than on the village name itself.`,
      demand: `Buyers active in ${name} are typically investors and developers underwriting infrastructure-led appreciation over a multi-year horizon, alongside end-users seeking a specific sub-sector location.`,
      onGroundCheck: 'Confirm the TP sub-sector and abutting road width on the cadastral atlas, verify the latest 7/12 land use, and check servicing status on the ground before committing to any payment.',
    }
  );
}

/** Real computed figures for a village from the gazetted registry. */
export function computeVillageStats(slug: string): VillageStats | null {
  const surveys = surveysForVillage(slug);
  if (surveys.length === 0) return null;

  const areas = surveys.map((s) => s.area).sort((a, b) => a - b);
  const widths = [...new Set(surveys.map((s) => s.roadWidthM))].sort((a, b) => a - b);

  // Derive the FAR range from the actual road tiers present, using the same
  // DGDCR logic the parcel pages use — so the figure is data, not decoration.
  const fars = new Set<number>();
  for (const s of surveys) {
    try {
      fars.add(getSchemeDGDCR(s.schemeId, s.roadWidthM).maxFAR);
    } catch {
      /* scheme envelope absent — skip rather than fabricate */
    }
  }
  const farArr = [...fars].sort((a, b) => a - b);

  const largest = surveys.reduce((a, b) => (b.area > a.area ? b : a), surveys[0]);
  const subSectors = [...new Set(surveys.map((s) => s.subSector).filter(Boolean))].slice(0, 4);

  return {
    parcelCount: surveys.length,
    totalAreaSqM: areas.reduce((a, b) => a + b, 0),
    medianAreaSqM: areas[Math.floor(areas.length / 2)],
    largestAreaSqM: largest.area,
    largestSurveyNo: largest.surveyNo,
    smallestAreaSqM: areas[0],
    roadWidths: widths.map((w) => Math.round(w)),
    farRange: {
      min: farArr[0] ?? 0,
      max: farArr[farArr.length - 1] ?? 0,
    },
    subSectors,
  };
}

/** Fetch the zone narrative for a village, with a safe generic fallback. */
export function getZoneNarrative(zone: string): ZoneNarrative {
  return (
    ZONE_NARRATIVES[zone] ?? {
      what: `${zone} is a gazetted functional designation within Dholera SIR, with permitted uses and building envelopes set by the TP scheme and the DGDCR regulations rather than by a general zone class.`,
      value: 'Value in any Dholera designation follows the abutting road width, which sets the permissible FAR, and whether trunk infrastructure has actually reached the plot.',
      buyer: 'Confirm the TP scheme and abutting road width on the TP map, verify the 7/12 land use is NA-converted, and check the Form 4/5 final plot schedule before paying.',
      development: 'Development pace is set by the TP scheme’s servicing phasing and by the designation’s anchor demand, so confirm what is actually built on the ground before paying a future-servicing price.',
      diligence: [
        'Confirm the TP scheme and abutting road width on the TP map, which together set the permissible building envelope.',
        'Verify the 7/12 land use is NA-converted and the Form 4/5 final plot schedule is gazetted.',
        'Check servicing status on the ground rather than trusting the asking rate.',
      ],
    }
  );
}

/** Fetch scheme servicing/pricing context for a village's primary scheme. */
export function getSchemeStatus(scheme: string): SchemeStatus {
  // Multi-scheme villages ("TP 2 / TP 4") key on the first-listed scheme.
  const primary = scheme.split('/')[0].trim();
  return (
    SCHEME_STATUS[primary] ?? {
      servicing: 'This village sits across more than one Town Planning scheme, so trunk infrastructure varies by parcel — confirm servicing for the specific plot rather than trusting the village-level position.',
      pricing: 'Asking rates vary by scheme within the village; benchmark the specific parcel against the scheme-level rate card rather than a single village figure.',
    }
  );
}
