import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import gpsPointerIcon from '../assets/gps pointer.png';
import '../App.css'; // Global styles might need adjustment or keep using App.css
// If App.css is in src/, then from src/components/MapPage.js it is ../App.css

// Building data from the uploaded file, rearranged by latitude (north to south)
const BUILDINGS = [
  { id: 21, name: "Gate 1", lat: 23.13532841376455, lng: 77.56212472915651, type: "entrance", color: "#10b981", icon: "🚪" },
  // ... (rest of buildings logic is same)

  { id: 22, name: "Gate 2", lat: 23.135057098030337, lng: 77.56386816501619, type: "entrance", color: "#10b981", icon: "🚪" },
  { id: 23, name: "Gate 3", lat: 23.13519522247272, lng: 77.56522536277772, type: "entrance", color: "#10b981", icon: "🚪" },
  { id: 7, name: "Football Ground", lat: 23.134677255080238, lng: 77.56299376487733, type: "sports", color: "#06b6d4", icon: "⚽" },
  { id: 1, name: "Parking", lat: 23.134771284022804, lng: 77.56406772343689, type: "parking", color: "#64748b", icon: "🅿️" },
  { id: 2, name: "Boys Hostel", lat: 23.13472658539429, lng: 77.56549358367921, type: "hostel", color: "#ef4444", icon: "🏠" },
  { id: 6, name: "Admission Cell", lat: 23.13442073715466, lng: 77.56287038326265, type: "admin", color: "#3b82f6", icon: "🏢" },
  { id: 3, name: "Admin", lat: 23.134341808463454, lng: 77.56435096263887, type: "admin", color: "#3b82f6", icon: "🏢" },
  { id: 8, name: "Engineering", lat: 23.134213549241174, lng: 77.56364822387695, type: "academic", color: "#f59e0b", icon: "🏭" },
  { id: 4, name: "AIC", lat: 23.133892900648796, lng: 77.56479620933534, type: "facility", color: "#06b6d4", icon: "🏫" },
  { id: 9, name: "Paramedical", lat: 23.13375970793121, lng: 77.5628435611725, type: "facility", color: "#14b8a6", icon: "🏥" },
  { id: 5, name: "Management", lat: 23.133517987476225, lng: 77.56428122520448, type: "admin", color: "#3b82f6", icon: "🏢" },
  { id: 10, name: "Workshops", lat: 23.13339959362504, lng: 77.56248950958253, type: "facility", color: "#8b5cf6", icon: "🛠️" },
  { id: 18, name: "Audi & Law", lat: 23.1332318688236, lng: 77.56495714187623, type: "facility", color: "#8b5cf6", icon: "⚖️" },
  { id: 19, name: "DSW", lat: 23.133049344536634, lng: 77.5637072324753, type: "facility", color: "#06b6d4", icon: "🏫" },
  { id: 11, name: "Canteen", lat: 23.133088809268383, lng: 77.56309032440187, type: "facility", color: "#14b8a6", icon: "🍽️" },
  { id: 17, name: "Library", lat: 23.132452439052877, lng: 77.56477475166322, type: "library", color: "#8b5cf6", icon: "📚" },
  { id: 20, name: "Basketball Court", lat: 23.132176184376007, lng: 77.56421148777008, type: "sports", color: "#06b6d4", icon: "🏀" },
  { id: 15, name: "Science", lat: 23.1319837923899, lng: 77.56494641304018, type: "academic", color: "#f59e0b", icon: "🔬" },
  { id: 14, name: "Agriculture", lat: 23.131717403030457, lng: 77.56455481052399, type: "academic", color: "#f59e0b", icon: "🌾" },
  { id: 16, name: "Pharmacy", lat: 23.13167793789516, lng: 77.56489276885988, type: "academic", color: "#f59e0b", icon: "💊" },
  { id: 12, name: "Main Ground", lat: 23.13171246988917, lng: 77.56310105323793, type: "sports", color: "#06b6d4", icon: "⚽" },
  { id: 13, name: "TNSD", lat: 23.131194489045473, lng: 77.56257534027101, type: "academic", color: "#f59e0b", icon: "🎓" },
  { id: 24, name: "Girls Hostel", lat: 23.134105, lng: 77.565460, type: "hostel", color: "#ec4899", icon: "🏠" },
  { id: 25, name: "Food Processing Unit", lat: 23.131629, lng: 77.564082, type: "facility", color: "#14b8a6", icon: "🏭" }
];

// Calculate campus bounds
const CAMPUS_BOUNDS = {
  minLat: Math.min(...BUILDINGS.map(b => b.lat)) - 0.001,
  maxLat: Math.max(...BUILDINGS.map(b => b.lat)) + 0.001,
  minLng: Math.min(...BUILDINGS.map(b => b.lng)) - 0.001,
  maxLng: Math.max(...BUILDINGS.map(b => b.lng)) + 0.001
};

// Campus center
const CAMPUS_CENTER = {
  lat: (CAMPUS_BOUNDS.minLat + CAMPUS_BOUNDS.maxLat) / 2,
  lng: (CAMPUS_BOUNDS.minLng + CAMPUS_BOUNDS.maxLng) / 2
};


// Custom path from Gate 1 to Gate 2
const GATE1_TO_GATE2_PATH = [
  { latitude: 23.135309180532698, longitude: 77.56210471034586 },
  { latitude: 23.13470760563547, longitude: 77.56209397815584 },
  { latitude: 23.134559676968657, longitude: 77.56378966418356 },
  { latitude: 23.134613125644844, longitude: 77.56384576272929 },
  { latitude: 23.13502749991703, longitude: 77.56383503954962 }
];

const GATE2_TO_GATE1_PATH = [...GATE1_TO_GATE2_PATH].reverse();

// Custom path from Gate 2 to Gate 3 (User provided coordinates)
const GATE2_TO_GATE3_PATH = [
  { latitude: 23.135022566897522, longitude: 77.5639101046356 },
  { latitude: 23.134637177707095, longitude: 77.56390643977315 },
  { latitude: 23.134573003221917, longitude: 77.56392253726796 },
  { latitude: 23.134548320719443, longitude: 77.56397619558399 },
  { latitude: 23.134518701710476, longitude: 77.56420156051146 },
  { latitude: 23.134474920933304, longitude: 77.56514906879076 },
  { latitude: 23.135205008829697, longitude: 77.5651544303806 }
];
const GATE3_TO_GATE2_PATH = [...GATE2_TO_GATE3_PATH].reverse();





// Custom path from Gate 3 to Hostel (L-shaped path via user waypoint)
const GATE3_TO_HOSTEL_PATH = [
  { latitude: 23.13519522247272, longitude: 77.56522536277772 }, // Gate 3
  { latitude: 23.134746, longitude: 77.565196 },                 // Intermediate Waypoint
  { latitude: 23.13472658539429, longitude: 77.56549358367921 }  // Hostel
];
const HOSTEL_TO_GATE3_PATH = [...GATE3_TO_HOSTEL_PATH].reverse();

// Custom path from Hostel to Audi & Law
const HOSTEL_TO_AUDI_LAW_PATH = [
  { latitude: 23.13473135214785, longitude: 77.5654111968271 },
  { latitude: 23.13474615643417, longitude: 77.56517530074079 },
  { latitude: 23.13445993994268, longitude: 77.56515921691673 },
  { latitude: 23.134222937321006, longitude: 77.56515089562099 },
  { latitude: 23.133911936645994, longitude: 77.56510796896818 },
  { latitude: 23.133798396537326, longitude: 77.56516162728424 },
  { latitude: 23.133729285119742, longitude: 77.56518309061065 },
  { latitude: 23.13365523713283, longitude: 77.56515626145261 },
  { latitude: 23.133586125641468, longitude: 77.56504894482048 },
  { latitude: 23.133350242089588, longitude: 77.5646640684145 },
  { latitude: 23.13326157131083, longitude: 77.56465332826753 },
  { latitude: 23.133177826632615, longitude: 77.56464795819402 },
  { latitude: 23.13311871271064, longitude: 77.56469091878198 },
  { latitude: 23.13310886038777, longitude: 77.564776839958 },
  { latitude: 23.133153195834968, longitude: 77.56484128084 },
  { latitude: 23.13323694052855, longitude: 77.56486276113401 },
  { latitude: 23.133310832861824, longitude: 77.56487887135448 }
];
const AUDI_LAW_TO_HOSTEL_PATH = [...HOSTEL_TO_AUDI_LAW_PATH].reverse();

// Custom path from AIC to Audi & Law (User provided connector + Hostel path segment)
const AIC_TO_ROAD_CONNECTOR = [
  { latitude: 23.133867849090976, longitude: 77.5648105297448 },
  { latitude: 23.13381356634435, longitude: 77.56484805866764 },
  { latitude: 23.13379876195511, longitude: 77.56493920033734 },
  { latitude: 23.133793827158318, longitude: 77.5650410645564 },
  { latitude: 23.133803696751695, longitude: 77.56510539985268 },
  { latitude: 23.133828370731962, longitude: 77.56515901259957 }
];
// Connects to the 5th point of the Hostel path
const AIC_TO_AUDI_LAW_PATH = [...AIC_TO_ROAD_CONNECTOR, ...HOSTEL_TO_AUDI_LAW_PATH.slice(5)];
const AUDI_LAW_TO_AIC_PATH = [...AIC_TO_AUDI_LAW_PATH].reverse();

// Custom path from Gate 2 to TNSD
const GATE2_TO_TNSD_PATH = [
  { latitude: 23.135042298974504, longitude: 77.56384134292604 },
  { latitude: 23.13339959362504, longitude: 77.56379306316377 },
  { latitude: 23.13333546357866, longitude: 77.56375014781953 },
  { latitude: 23.133271333501636, longitude: 77.56381988525392 },
  { latitude: 23.133320664332846, longitude: 77.56392180919649 },
  { latitude: 23.133291065836296, longitude: 77.56463527679445 },
  { latitude: 23.1331085416299, longitude: 77.56462991237642 },
  { latitude: 23.132023257435186, longitude: 77.56431877613069 },
  { latitude: 23.131939394200067, longitude: 77.56424367427827 },
  { latitude: 23.13152007723789, longitude: 77.56376624107362 },
  { latitude: 23.131470745744398, longitude: 77.56357848644258 },
  { latitude: 23.131510210940647, longitude: 77.56311178207399 },
  { latitude: 23.13154967612528, longitude: 77.56274163722993 },
  { latitude: 23.131623673315186, longitude: 77.56246268749237 },
  { latitude: 23.131426347384725, longitude: 77.56246268749237 },
  { latitude: 23.13136714954898, longitude: 77.56247341632844 }
];

// Custom path from Gate 2 to Admin
const GATE2_TO_ADMIN_PATH = [
  { latitude: 23.135027233198144, longitude: 77.56391108036043 },
  { latitude: 23.13463725044881, longitude: 77.56390035152437 },
  { latitude: 23.134553329962078, longitude: 77.56393253803255 },
  { latitude: 23.134528647455976, longitude: 77.56420075893402 },
  { latitude: 23.134395361844554, longitude: 77.56427049636842 }
];

// Custom path from Gate 2 to Admission Cell
const GATE2_TO_ADMISSION_PATH = [
  { latitude: 23.135012700857928, longitude: 77.5638520717621 },
  { latitude: 23.13461673547258, longitude: 77.56383061408998 },
  { latitude: 23.134557497478333, longitude: 77.56379306316377 },
  { latitude: 23.13461179897405, longitude: 77.56299912929536 },
  { latitude: 23.13453775130601, longitude: 77.56295008682643 }
];

// Custom path from Gate 2 to Football Ground
const GATE2_TO_FOOTBALL_PATH = [
  { latitude: 23.135012700857928, longitude: 77.5638520717621 },
  { latitude: 23.13461673547258, longitude: 77.56383061408998 },
  { latitude: 23.134557497478333, longitude: 77.56379306316377 },
  { latitude: 23.13461179897405, longitude: 77.56299912929536 }
];

// Custom path from Gate 2 to AIC
const GATE2_TO_AIC_PATH = [
  { latitude: 23.135032663633265, longitude: 77.56390673890918 },
  { latitude: 23.134613533002767, longitude: 77.56390137281417 },
  { latitude: 23.13453956863787, longitude: 77.56393893547931 },
  { latitude: 23.134480397116594, longitude: 77.564743849733 },
  { latitude: 23.134031678897127, longitude: 77.5650067883892 },
  { latitude: 23.134007024006397, longitude: 77.56491019867879 },
  { latitude: 23.133869149883225, longitude: 77.56480366062178 }
];

// Custom path from Gate 2 to Audi & Law
const GATE2_TO_AUDI_LAW_PATH = [
  { latitude: 23.13502749991703, longitude: 77.56389498710634 },
  { latitude: 23.13462792474804, longitude: 77.56390035152437 },
  { latitude: 23.134544063141657, longitude: 77.56393790245058 },
  { latitude: 23.13447006756306, longitude: 77.56390035152437 },
  { latitude: 23.13344399133148, longitude: 77.56386816501619 },
  { latitude: 23.13335026282286, longitude: 77.56391644477846 },
  { latitude: 23.133300932002538, longitude: 77.56464064121248 },
  { latitude: 23.133123340899136, longitude: 77.56464600563051 },
  { latitude: 23.133088809268383, longitude: 77.56481230258943 },
  { latitude: 23.133187471046934, longitude: 77.56485521793367 },
  { latitude: 23.133281199669316, longitude: 77.56486594676971 }
];

// Custom path from Gate 2 to Paramedical
const GATE2_TO_PARAMEDICAL_PATH = [
  { latitude: 23.135032432936377, longitude: 77.56391108036043 },
  { latitude: 23.13462792474804, longitude: 77.56390035152437 },
  { latitude: 23.134544063141657, longitude: 77.56392717361452 },
  { latitude: 23.134465134523044, longitude: 77.56390035152437 },
  { latitude: 23.133434125175757, longitude: 77.56386816501619 },
  { latitude: 23.133340396660245, longitude: 77.56392717361452 },
  { latitude: 23.133266400417508, longitude: 77.56384134292604 },
  { latitude: 23.133345329741648, longitude: 77.5637072324753 },
  { latitude: 23.133414392862154, longitude: 77.56280064582826 },
  { latitude: 23.13375970793121, longitude: 77.56283283233644 }
];

// Custom path from Gate 2 to Canteen
const GATE2_TO_CANTEEN_PATH = [
  { latitude: 23.135042298974504, longitude: 77.56390035152437 },
  { latitude: 23.13462792474804, longitude: 77.56390035152437 },
  { latitude: 23.134558862252476, longitude: 77.56393253803255 },
  { latitude: 23.134489799721354, longitude: 77.56390035152437 },
  { latitude: 23.133414392862154, longitude: 77.56386280059816 },
  { latitude: 23.13333546357866, longitude: 77.56392180919649 },
  { latitude: 23.133246668079224, longitude: 77.56381988525392 },
  { latitude: 23.133340396660245, longitude: 77.56371259689332 },
  { latitude: 23.133374928226214, longitude: 77.56304740905763 },
  { latitude: 23.13307802686562, longitude: 77.56309087569655 }
];

// Custom path from Parking to Admin (Explicitly defined with User Curve)
// FULL CURVE: For South/West destinations (TNSD, Workshop, etc.) where we continue South
const PARKING_EXIT_CURVE_FULL = [
  { latitude: 23.134588460469217, longitude: 77.56404397751854 },
  { latitude: 23.13453913010436, longitude: 77.56400644638966 },
  { latitude: 23.134544063141657, longitude: 77.56394210731155 },
  { latitude: 23.134495293954394, longitude: 77.56389129105192 },
  { latitude: 23.134431254500175, longitude: 77.56390203119892 },
  { latitude: 23.134362288899904, longitude: 77.56389666112541 }
];

// ACADEMIC CURVE: Subset for North/East destinations (Admin, Hostel) to avoid U-turn
// We stop at point 4 to connect smoothly to the Admin Junction
const PARKING_EXIT_CURVE_NORTH = PARKING_EXIT_CURVE_FULL.slice(0, 4);

// Connection from Curve End (North Variant) to Admin Junction
const CURVE_NORTH_TO_ADMIN_JUNCTION = [
  // Point 4 is { lat: 23.134495, lng: 77.563891 }
  // Next point in junction path is { lat: 23.134480, lng: 77.563896 }
  // This is a small smooth update, avoiding the deep dip to 23.134362
  { latitude: 23.13448035762777, longitude: 77.56389600839616 },
  { latitude: 23.134553329962078, longitude: 77.56393253803255 }
];

const PARKING_TO_ADMIN_PATH = [
  { latitude: 23.134771284022804, longitude: 77.56406772343689 }, // Parking
  ...PARKING_EXIT_CURVE_NORTH, // Use partial curve
  ...CURVE_NORTH_TO_ADMIN_JUNCTION,
  { latitude: 23.134528647455976, longitude: 77.56420075893402 },
  { latitude: 23.134395361844554, longitude: 77.56427049636842 }  // Admin
];
const ADMIN_TO_PARKING_PATH = [...PARKING_TO_ADMIN_PATH].reverse();

const PARKING_TO_HOSTEL_PATH = [
  { latitude: 23.134771284022804, longitude: 77.56406772343689 }, // Parking
  ...PARKING_EXIT_CURVE_NORTH, // Use partial curve
  ...CURVE_NORTH_TO_ADMIN_JUNCTION,
  { latitude: 23.134460633781536, longitude: 77.56514094244179 },
  { latitude: 23.13474169831655, longitude: 77.56517313901196 },
  { latitude: 23.13472658539429, longitude: 77.56549358367921 }   // Hostel
];
const HOSTEL_TO_PARKING_PATH = [...PARKING_TO_HOSTEL_PATH].reverse();

// --- Explicit Parking Paths to Academic Block (Via Admin Junction) ---
// We reuse the segment: Parking -> Curve (North) -> Admin Junction -> X

const PARKING_TO_MANAGEMENT_PATH = [
  ...PARKING_TO_ADMIN_PATH.slice(0, -2), // Upto Junction
  // Segment from Admin Junction to Management (Manually extracted from GATE2_TO_MANAGEMENT)
  { latitude: 23.13448035762777, longitude: 77.56389600839616 },
  { latitude: 23.133430058780046, longitude: 77.56386917792102 },
  { latitude: 23.133346231757006, longitude: 77.56394966934639 },
  { latitude: 23.1333511627598, longitude: 77.56409455391206 },
  { latitude: 23.13345964477567, longitude: 77.56414284876726 },
  { latitude: 23.133504023756874, longitude: 77.56423407238269 }
];
const MANAGEMENT_TO_PARKING_PATH = [...PARKING_TO_MANAGEMENT_PATH].reverse();

const PARKING_TO_ENGINEERING_PATH = [
  ...PARKING_TO_ADMIN_PATH.slice(0, -2), // Upto Junction
  // Segment to Engineering
  { latitude: 23.134489155436775, longitude: 77.56387352943422 },
  { latitude: 23.134415107869415, longitude: 77.56383061408998 },
  { latitude: 23.134237393540957, longitude: 77.56382524967194 },
  { latitude: 23.134237393540957, longitude: 77.56372332572938 }
];
const ENGINEERING_TO_PARKING_PATH = [...PARKING_TO_ENGINEERING_PATH].reverse();

const PARKING_TO_DSW_PATH = [
  ...PARKING_TO_ADMIN_PATH.slice(0, -2), // Upto Junction
  // Segment to DSW
  { latitude: 23.134465691523268, longitude: 77.56390137449117 },
  { latitude: 23.133440047560182, longitude: 77.56386381182598 },
  { latitude: 23.13333649653182, longitude: 77.56392283887126 },
  { latitude: 23.133252669450282, longitude: 77.56382088306579 },
  { latitude: 23.1331072876868, longitude: 77.56363782299057 }
];
const DSW_TO_PARKING_PATH = [...PARKING_TO_DSW_PATH].reverse();

const PARKING_TO_AUDI_LAW_PATH = [
  ...PARKING_TO_ADMIN_PATH.slice(0, -2), // Upto Junction
  // Segment to Audi
  { latitude: 23.13447006756306, longitude: 77.56390035152437 },
  { latitude: 23.13344399133148, longitude: 77.56386816501619 },
  { latitude: 23.13335026282286, longitude: 77.56391644477846 },
  { latitude: 23.133300932002538, longitude: 77.56464064121248 },
  { latitude: 23.133123340899136, longitude: 77.56464600563051 },
  { latitude: 23.133088809268383, longitude: 77.56481230258943 },
  { latitude: 23.133187471046934, longitude: 77.56485521793367 },
  { latitude: 23.133281199669316, longitude: 77.56486594676971 }
];
const AUDI_LAW_TO_PARKING_PATH = [...PARKING_TO_AUDI_LAW_PATH].reverse();

const PARKING_TO_LIBRARY_PATH = [
  ...PARKING_TO_ADMIN_PATH.slice(0, -2), // Upto Junction
  // Segment to Library
  { latitude: 23.13447045829456, longitude: 77.56390137449117 },
  { latitude: 23.13344974536711, longitude: 77.56385844573096 },
  { latitude: 23.13334126334324, longitude: 77.56393893715634 },
  { latitude: 23.133291953303363, longitude: 77.5646526277946 },
  { latitude: 23.13265037244114, longitude: 77.56449701103888 },
  { latitude: 23.132546820803054, longitude: 77.56466872607967 },
  { latitude: 23.13248764840252, longitude: 77.56468482436473 }
];
const LIBRARY_TO_PARKING_PATH = [...PARKING_TO_LIBRARY_PATH].reverse();

// --- Explicit Parking Paths to South/West (Direct from Curve) ---

const PARKING_TO_TNSD_PATH = [
  { latitude: 23.134771284022804, longitude: 77.56406772343689 },
  ...PARKING_EXIT_CURVE_FULL, // Full curve needed for South travel
  // Correct path to TNSD (Derived from GATE2_TO_TNSD_PATH)
  { latitude: 23.13339959362504, longitude: 77.56379306316377 },
  { latitude: 23.13333546357866, longitude: 77.56375014781953 },
  { latitude: 23.133271333501636, longitude: 77.56381988525392 },
  { latitude: 23.133320664332846, longitude: 77.56392180919649 },
  { latitude: 23.133291065836296, longitude: 77.56463527679445 },
  { latitude: 23.1331085416299, longitude: 77.56462991237642 },
  { latitude: 23.132023257435186, longitude: 77.56431877613069 },
  { latitude: 23.131939394200067, longitude: 77.56424367427827 },
  { latitude: 23.13152007723789, longitude: 77.56376624107362 },
  { latitude: 23.131470745744398, longitude: 77.56357848644258 },
  { latitude: 23.131510210940647, longitude: 77.56311178207399 },
  { latitude: 23.13154967612528, longitude: 77.56274163722993 },
  { latitude: 23.131623673315186, longitude: 77.56246268749237 },
  { latitude: 23.131426347384725, longitude: 77.56246268749237 },
  { latitude: 23.13136714954898, longitude: 77.56247341632844 }
];
const TNSD_TO_PARKING_PATH = [...PARKING_TO_TNSD_PATH].reverse();

const PARKING_TO_PARAMEDICAL_PATH = [
  { latitude: 23.134771284022804, longitude: 77.56406772343689 },
  ...PARKING_EXIT_CURVE_FULL,
  { latitude: 23.133434125175757, longitude: 77.56386816501619 },
  { latitude: 23.133340396660245, longitude: 77.56392717361452 },
  { latitude: 23.133266400417508, longitude: 77.56384134292604 },
  { latitude: 23.133345329741648, longitude: 77.5637072324753 },
  { latitude: 23.133414392862154, longitude: 77.56280064582826 },
  { latitude: 23.13375970793121, longitude: 77.56283283233644 }
];
const PARAMEDICAL_TO_PARKING_PATH = [...PARKING_TO_PARAMEDICAL_PATH].reverse();

const PARKING_TO_WORKSHOP_PATH = [
  { latitude: 23.134771284022804, longitude: 77.56406772343689 },
  ...PARKING_EXIT_CURVE_FULL,
  { latitude: 23.13343512903091, longitude: 77.56386381182598 },
  { latitude: 23.133351302011025, longitude: 77.56391747277621 },
  { latitude: 23.133267474938748, longitude: 77.5638262491608 },
  { latitude: 23.133346371008216, longitude: 77.56370282897525 },
  { latitude: 23.13341464921206, longitude: 77.56256089275867 }
];
const WORKSHOP_TO_PARKING_PATH = [...PARKING_TO_WORKSHOP_PATH].reverse();

const PARKING_TO_CANTEEN_PATH = [
  { latitude: 23.134771284022804, longitude: 77.56406772343689 },
  ...PARKING_EXIT_CURVE_FULL,
  { latitude: 23.133414392862154, longitude: 77.56386280059816 },
  { latitude: 23.13333546357866, longitude: 77.56392180919649 },
  { latitude: 23.133246668079224, longitude: 77.56381988525392 },
  { latitude: 23.133340396660245, longitude: 77.56371259689332 },
  { latitude: 23.133374928226214, longitude: 77.56304740905763 },
  { latitude: 23.13307802686562, longitude: 77.56309087569655 }
];
const CANTEEN_TO_PARKING_PATH = [...PARKING_TO_CANTEEN_PATH].reverse();

const PARKING_TO_BASKETBALL_PATH = [
  { latitude: 23.134771284022804, longitude: 77.56406772343689 },
  ...PARKING_EXIT_CURVE_FULL,
  { latitude: 23.133444909973175, longitude: 77.56386381182598 },
  { latitude: 23.133351220954346, longitude: 77.56393357106128 },
  { latitude: 23.133291811973724, longitude: 77.5646526277946 },
  { latitude: 23.132250, longitude: 77.564399 }, // User Turn Point
];
const BASKETBALL_TO_PARKING_PATH = [...PARKING_TO_BASKETBALL_PATH].reverse();

const PARKING_TO_MAIN_GROUND_PATH = [
  { latitude: 23.134771284022804, longitude: 77.56406772343689 },
  ...PARKING_EXIT_CURVE_FULL,
  { latitude: 23.13345952838668, longitude: 77.56386381182598 },
  { latitude: 23.133341184364927, longitude: 77.56393357106128 },
  { latitude: 23.133306667338925, longitude: 77.56463116341448 },
  { latitude: 23.133089702971933, longitude: 77.56463116341448 },
  { latitude: 23.13200451215267, longitude: 77.56431456380803 },
  { latitude: 23.131536061372955, longitude: 77.5637618560205 },
  { latitude: 23.131688924438798, longitude: 77.563649168025 },
  { latitude: 23.131743166129972, longitude: 77.56317695166284 }
];
const MAIN_GROUND_TO_PARKING_PATH = [...PARKING_TO_MAIN_GROUND_PATH].reverse();

const PARKING_TO_SCIENCE_PATH = [
  { latitude: 23.134771284022804, longitude: 77.56406772343689 },
  ...PARKING_EXIT_CURVE_FULL,
  { latitude: 23.133444909973175, longitude: 77.56386381182598 },
  { latitude: 23.133351220954346, longitude: 77.56393357106128 },
  { latitude: 23.133291811973724, longitude: 77.5646526277946 },
  { latitude: 23.132250, longitude: 77.564399 }, // User Turn Point,
  { latitude: 23.132038950534735, longitude: 77.56461506512943 },
  { latitude: 23.13199457106874, longitude: 77.5648350750254 }
];
const SCIENCE_TO_PARKING_PATH = [...PARKING_TO_SCIENCE_PATH].reverse();

const PARKING_TO_AGRICULTURE_PATH = [
  { latitude: 23.134771284022804, longitude: 77.56406772343689 },
  ...PARKING_EXIT_CURVE_FULL,
  { latitude: 23.133444909973175, longitude: 77.56386381182598 },
  { latitude: 23.133351220954346, longitude: 77.56393357106128 },
  { latitude: 23.133291811973724, longitude: 77.5646526277946 },
  { latitude: 23.132250, longitude: 77.564399 }, // User Turn Point,
  { latitude: 23.132038950534735, longitude: 77.56461506512943 },
  { latitude: 23.13178253563964, longitude: 77.56463116341448 }
];
const AGRICULTURE_TO_PARKING_PATH = [...PARKING_TO_AGRICULTURE_PATH].reverse();

const PARKING_TO_PHARMACY_PATH = [
  { latitude: 23.134771284022804, longitude: 77.56406772343689 },
  ...PARKING_EXIT_CURVE_FULL,
  { latitude: 23.133444909973175, longitude: 77.56386381182598 },
  { latitude: 23.133351220954346, longitude: 77.56393357106128 },
  { latitude: 23.133291811973724, longitude: 77.5646526277946 },
  { latitude: 23.132250, longitude: 77.564399 }, // User Turn Point,
  { latitude: 23.132038950534735, longitude: 77.56461506512943 },
  { latitude: 23.13199457106874, longitude: 77.5648350750254 },
  { latitude: 23.131762811396616, longitude: 77.56481897674034 }
];
const PHARMACY_TO_PARKING_PATH = [...PARKING_TO_PHARMACY_PATH].reverse();

const PARKING_TO_GIRLS_HOSTEL_PATH = [
  // Start from Parking
  { latitude: 23.134771284022804, longitude: 77.56406772343689 }, // Parking
  ...PARKING_EXIT_CURVE_NORTH, // Use partial curve
  ...CURVE_NORTH_TO_ADMIN_JUNCTION,
  // Go to the junction point before splitting to Hostel/Girls Hostel
  { latitude: 23.134460633781536, longitude: 77.56514094244179 },
  // User-provided extension for Girls Hostel (don't go to main Hostel)
  { latitude: 23.134460755748584, longitude: 77.56517350284969 },
  { latitude: 23.134352381241786, longitude: 77.5651681327762 },
  { latitude: 23.134209523803555, longitude: 77.5651573926292 },
  { latitude: 23.13420459768231, longitude: 77.5653883057897 } // Girls Hostel
];
const GIRLS_HOSTEL_TO_PARKING_PATH = [...PARKING_TO_GIRLS_HOSTEL_PATH].reverse();

const PARKING_TO_FOOD_PROCESSING_PATH = [
  // Start with standard Southbound path (Full Curve)
  { latitude: 23.134771284022804, longitude: 77.56406772343689 },
  ...PARKING_EXIT_CURVE_FULL,
  // Use Main Ground Path segment (High quality road curve)
  { latitude: 23.13345952838668, longitude: 77.56386381182598 },
  { latitude: 23.133341184364927, longitude: 77.56393357106128 },
  { latitude: 23.133306667338925, longitude: 77.56463116341448 },
  { latitude: 23.133089702971933, longitude: 77.56463116341448 },
  { latitude: 23.13200451215267, longitude: 77.56431456380803 },


  // User-provided extension for Food Processing Unit (Precision Curve)
  { latitude: 23.13176180129377, longitude: 77.56407631109248 },
  { latitude: 23.131707536747715, longitude: 77.56399588724486 },
  { latitude: 23.131653272179715, longitude: 77.56403341837374 }
];
const FOOD_PROCESSING_TO_PARKING_PATH = [...PARKING_TO_FOOD_PROCESSING_PATH].reverse();

// --- Hub Paths for New Buildings (Gate 2 Connections) ---

const GATE2_TO_GIRLS_HOSTEL_PATH = [
  // Reuse Gate 2 -> Hostel path logic (up to the split point)
  { latitude: 23.135027693203615, longitude: 77.56390137449117 },
  { latitude: 23.134638148293238, longitude: 77.56391210668122 },
  { latitude: 23.13454446010801, longitude: 77.56393357106128 },
  { latitude: 23.134460633781536, longitude: 77.56514094244179 },


  // User-provided extension for Girls Hostel
  { latitude: 23.134460755748584, longitude: 77.56517350284969 }, // Connects near ...140 above
  { latitude: 23.134352381241786, longitude: 77.5651681327762 },
  { latitude: 23.134209523803555, longitude: 77.5651573926292 },
  { latitude: 23.13420459768231, longitude: 77.5653883057897 }
];
const GIRLS_HOSTEL_TO_GATE2_PATH = [...GATE2_TO_GIRLS_HOSTEL_PATH].reverse();

// Direct path from Girls Hostel to Gate 3 (via Hostel)
const GIRLS_HOSTEL_TO_GATE3_PATH = [
  { latitude: 23.13420459768231, longitude: 77.5653883057897 }, // Girls Hostel
  { latitude: 23.134209523803555, longitude: 77.5651573926292 },
  { latitude: 23.134352381241786, longitude: 77.5651681327762 },
  { latitude: 23.134460755748584, longitude: 77.56517350284969 },
  // Connect to regular Hostel position
  { latitude: 23.13474169831655, longitude: 77.56517313901196 },
  // Use Hostel to Gate 3 path
  ...HOSTEL_TO_GATE3_PATH.slice(1)
];
const GATE3_TO_GIRLS_HOSTEL_PATH = [...GIRLS_HOSTEL_TO_GATE3_PATH].reverse();

const GATE2_TO_FOOD_PROCESSING_PATH = [
  // Reuse Gate 2 -> Main Ground path logic
  { latitude: 23.13501783132112, longitude: 77.56390137449117 },
  { latitude: 23.13460844616961, longitude: 77.56390137449117 },
  { latitude: 23.13455420563729, longitude: 77.56392283887126 },
  { latitude: 23.134485172200787, longitude: 77.5638852762061 },
  { latitude: 23.13345952838668, longitude: 77.56386381182598 },
  { latitude: 23.133341184364927, longitude: 77.56393357106128 },
  { latitude: 23.133306667338925, longitude: 77.56463116341448 },
  { latitude: 23.133089702971933, longitude: 77.56463116341448 },
  { latitude: 23.13200451215267, longitude: 77.56431456380803 },


  // User-provided extension for Food Processing Unit
  { latitude: 23.13176180129377, longitude: 77.56407631109248 },
  { latitude: 23.131707536747715, longitude: 77.56399588724486 },
  { latitude: 23.131653272179715, longitude: 77.56403341837374 }
];
const FOOD_PROCESSING_TO_GATE2_PATH = [...GATE2_TO_FOOD_PROCESSING_PATH].reverse();

// --- Direct Inter-Building Paths (Fixes Loop via Gate 2) ---

const FOOD_PROCESSING_TO_TNSD_PATH = [
  // Start at Food Processing (Reverse of User Extension)
  { latitude: 23.131653272179715, longitude: 77.56403341837374 },
  { latitude: 23.131707536747715, longitude: 77.56399588724486 },
  { latitude: 23.13176180129377, longitude: 77.56407631109248 },

  // Join Main Ground/South Road (Connection Point)
  { latitude: 23.131536061372955, longitude: 77.5637618560205 },

  // Continue to TNSD (Derived from GATE2_TO_TNSD_PATH tail)
  { latitude: 23.131470745744398, longitude: 77.56357848644258 },
  { latitude: 23.131510210940647, longitude: 77.56311178207399 },
  { latitude: 23.13154967612528, longitude: 77.56274163722993 },
  { latitude: 23.131623673315186, longitude: 77.56246268749237 },
  { latitude: 23.131426347384725, longitude: 77.56246268749237 },
  { latitude: 23.13136714954898, longitude: 77.56247341632844 }
];
const TNSD_TO_FOOD_PROCESSING_PATH = [...FOOD_PROCESSING_TO_TNSD_PATH].reverse();

const FOOD_PROCESSING_TO_MAIN_GROUND_PATH = [
  // Start at Food Processing
  { latitude: 23.131653272179715, longitude: 77.56403341837374 },
  { latitude: 23.131707536747715, longitude: 77.56399588724486 },
  { latitude: 23.13176180129377, longitude: 77.56407631109248 },
  // Short connector to Main Ground center
  { latitude: 23.131536061372955, longitude: 77.5637618560205 }, // Junction
  { latitude: 23.131688924438798, longitude: 77.563649168025 },
  { latitude: 23.13171246988917, longitude: 77.56310105323793 }
];
const MAIN_GROUND_TO_FOOD_PROCESSING_PATH = [...FOOD_PROCESSING_TO_MAIN_GROUND_PATH].reverse();

const FOOD_PROCESSING_TO_AGRICULTURE_PATH = [
  // Start at Food Processing
  { latitude: 23.131653272179715, longitude: 77.56403341837374 },
  { latitude: 23.131707536747715, longitude: 77.56399588724486 },
  { latitude: 23.13176180129377, longitude: 77.56407631109248 },
  // Join South Road Eastbound
  { latitude: 23.13200451215267, longitude: 77.56431456380803 },
  { latitude: 23.13178253563964, longitude: 77.56463116341448 } // Agriculture
];
const AGRICULTURE_TO_FOOD_PROCESSING_PATH = [...FOOD_PROCESSING_TO_AGRICULTURE_PATH].reverse();

const FOOD_PROCESSING_TO_SCIENCE_PATH = [
  // Link to Agriculture path, extend to Science
  ...FOOD_PROCESSING_TO_AGRICULTURE_PATH,
  { latitude: 23.132038950534735, longitude: 77.56461506512943 },
  { latitude: 23.13199457106874, longitude: 77.5648350750254 } // Science
];
const SCIENCE_TO_FOOD_PROCESSING_PATH = [...FOOD_PROCESSING_TO_SCIENCE_PATH].reverse();

const FOOD_PROCESSING_TO_PHARMACY_PATH = [
  // Link to Agriculture path, extend to Pharmacy
  ...FOOD_PROCESSING_TO_AGRICULTURE_PATH,
  { latitude: 23.132038950534735, longitude: 77.56461506512943 },
  { latitude: 23.13199457106874, longitude: 77.5648350750254 },
  { latitude: 23.131762811396616, longitude: 77.56481897674034 } // Pharmacy
];
const PHARMACY_TO_FOOD_PROCESSING_PATH = [...FOOD_PROCESSING_TO_PHARMACY_PATH].reverse();

const FOOD_PROCESSING_TO_PARAMEDICAL_PATH = [
  // Start at Food Processing
  { latitude: 23.131653272179715, longitude: 77.56403341837374 },
  { latitude: 23.131707536747715, longitude: 77.56399588724486 },
  { latitude: 23.13176180129377, longitude: 77.56407631109248 },
  // Go North
  { latitude: 23.13200451215267, longitude: 77.56431456380803 },
  { latitude: 23.133089702971933, longitude: 77.56463116341448 },
  { latitude: 23.133306667338925, longitude: 77.56463116341448 },
  { latitude: 23.133341184364927, longitude: 77.56393357106128 },
  { latitude: 23.13345952838668, longitude: 77.56386381182598 }, // Near Paramedical
  { latitude: 23.13375970793121, longitude: 77.56283283233644 }
];
const PARAMEDICAL_TO_FOOD_PROCESSING_PATH = [...FOOD_PROCESSING_TO_PARAMEDICAL_PATH].reverse();

// Direct Admin Link (Bypasses Gate 2)
const FOOD_PROCESSING_TO_ADMIN_PATH = [
  // Start at Food Processing -> North Road segment
  { latitude: 23.131653272179715, longitude: 77.56403341837374 },
  { latitude: 23.131707536747715, longitude: 77.56399588724486 },
  { latitude: 23.13176180129377, longitude: 77.56407631109248 },
  { latitude: 23.13200451215267, longitude: 77.56431456380803 },
  { latitude: 23.133089702971933, longitude: 77.56463116341448 },
  { latitude: 23.133306667338925, longitude: 77.56463116341448 },
  { latitude: 23.133341184364927, longitude: 77.56393357106128 },
  { latitude: 23.13345952838668, longitude: 77.56386381182598 },
  // Continue North to Admin Junction
  { latitude: 23.134485172200787, longitude: 77.5638852762061 },
  { latitude: 23.13455420563729, longitude: 77.56392283887126 },
  { latitude: 23.134528647455976, longitude: 77.56420075893402 },
  { latitude: 23.134395361844554, longitude: 77.56427049636842 } // Admin
];
const ADMIN_TO_FOOD_PROCESSING_PATH = [...FOOD_PROCESSING_TO_ADMIN_PATH].reverse();

// Explicit paths from Admin to Academic Buildings (Fixes Parking -> Admin -> X routing)
// Junction point for Admin/Main Road: { latitude: 23.134553329962078, longitude: 77.56393253803255 }

const ADMIN_TO_MANAGEMENT_PATH = [
  { latitude: 23.134395361844554, longitude: 77.56427049636842 }, // Admin
  { latitude: 23.134528647455976, longitude: 77.56420075893402 },
  { latitude: 23.134553329962078, longitude: 77.56393253803255 }, // Junction
  // ..continue to Management (Derived from GATE2_TO_MANAGEMENT)
  { latitude: 23.13448035762777, longitude: 77.56389600839616 },
  { latitude: 23.133430058780046, longitude: 77.56386917792102 },
  { latitude: 23.133346231757006, longitude: 77.56394966934639 },
  { latitude: 23.1333511627598, longitude: 77.56409455391206 },
  { latitude: 23.13345964477567, longitude: 77.56414284876726 },
  { latitude: 23.133504023756874, longitude: 77.56423407238269 }  // Management
];
const MANAGEMENT_TO_ADMIN_PATH = [...ADMIN_TO_MANAGEMENT_PATH].reverse();

const ADMIN_TO_ENGINEERING_PATH = [
  { latitude: 23.134395361844554, longitude: 77.56427049636842 }, // Admin
  { latitude: 23.134528647455976, longitude: 77.56420075893402 },
  { latitude: 23.134553329962078, longitude: 77.56393253803255 }, // Junction
  // ..continue to Engineering (Derived from GATE2_TO_ENGINEERING)
  { latitude: 23.134489155436775, longitude: 77.56387352943422 },
  { latitude: 23.134415107869415, longitude: 77.56383061408998 },
  { latitude: 23.134237393540957, longitude: 77.56382524967194 },
  { latitude: 23.134237393540957, longitude: 77.56372332572938 }  // Engineering
];
const ENGINEERING_TO_ADMIN_PATH = [...ADMIN_TO_ENGINEERING_PATH].reverse();

const ADMIN_TO_DSW_PATH = [
  { latitude: 23.134395361844554, longitude: 77.56427049636842 }, // Admin
  { latitude: 23.134528647455976, longitude: 77.56420075893402 },
  { latitude: 23.134553329962078, longitude: 77.56393253803255 }, // Junction
  // ..continue to DSW (Derived from GATE2_TO_DSW)
  { latitude: 23.134465691523268, longitude: 77.56390137449117 },
  { latitude: 23.133440047560182, longitude: 77.56386381182598 },
  { latitude: 23.13333649653182, longitude: 77.56392283887126 },
  { latitude: 23.133252669450282, longitude: 77.56382088306579 },
  { latitude: 23.1331072876868, longitude: 77.56363782299057 }   // DSW
];
const DSW_TO_ADMIN_PATH = [...ADMIN_TO_DSW_PATH].reverse();

// Custom path from TNSD to Gate 2 (reverse of Gate 2 to TNSD)
const TNSD_TO_GATE2_PATH = GATE2_TO_TNSD_PATH.slice().reverse();

// Custom path from Admin to Gate 2 (reverse of Gate 2 to Admin)
const ADMIN_TO_GATE2_PATH = GATE2_TO_ADMIN_PATH.slice().reverse();

// Custom path from Admission Cell to Gate 2 (reverse of Gate 2 to Admission Cell)
const ADMISSION_TO_GATE2_PATH = GATE2_TO_ADMISSION_PATH.slice().reverse();

// Custom path from Football Ground to Gate 2 (reverse of Gate 2 to Football Ground)
const FOOTBALL_TO_GATE2_PATH = GATE2_TO_FOOTBALL_PATH.slice().reverse();

// Custom path from AIC to Gate 2 (reverse of Gate 2 to AIC)
const AIC_TO_GATE2_PATH = GATE2_TO_AIC_PATH.slice().reverse();

// Custom path from Audi & Law to Gate 2 (reverse of Gate 2 to Audi & Law)
const AUDI_LAW_TO_GATE2_PATH = GATE2_TO_AUDI_LAW_PATH.slice().reverse();

// Custom path from Paramedical to Gate 2 (reverse of Gate 2 to Paramedical)
const PARAMEDICAL_TO_GATE2_PATH = GATE2_TO_PARAMEDICAL_PATH.slice().reverse();

// Custom path from Canteen to Gate 2 (reverse of Gate 2 to Canteen)
const CANTEEN_TO_GATE2_PATH = GATE2_TO_CANTEEN_PATH.slice().reverse();

// Custom path from Gate 2 to Workshop
const GATE2_TO_WORKSHOP_PATH = [
  { latitude: 23.135027832453094, longitude: 77.56392283887126 },
  { latitude: 23.134618563720103, longitude: 77.56390137449117 },
  { latitude: 23.134549530316715, longitude: 77.56393357106128 },
  { latitude: 23.134465703993435, longitude: 77.56390137449117 },
  { latitude: 23.13343512903091, longitude: 77.56386381182598 },
  { latitude: 23.133351302011025, longitude: 77.56391747277621 },
  { latitude: 23.133267474938748, longitude: 77.5638262491608 },
  { latitude: 23.133346371008216, longitude: 77.56370282897525 },
  { latitude: 23.13341464921206, longitude: 77.56256089275867 }
];

// Custom path from Gate 2 to DSW
const GATE2_TO_DSW_PATH = [
  { latitude: 23.135042612805382, longitude: 77.56389600839616 },
  { latitude: 23.134638275072962, longitude: 77.56389600839616 },
  { latitude: 23.134539655928904, longitude: 77.56393357106128 },
  { latitude: 23.134465691523268, longitude: 77.56390137449117 },
  { latitude: 23.133440047560182, longitude: 77.56386381182598 },
  { latitude: 23.13333649653182, longitude: 77.56392283887126 },
  { latitude: 23.133252669450282, longitude: 77.56382088306579 },
  { latitude: 23.1331072876868, longitude: 77.56363782299057 }
];

// Custom path from Gate 2 to Engineering
const GATE2_TO_ENGINEERING_PATH = [
  { latitude: 23.135007487263422, longitude: 77.56390035152437 },
  { latitude: 23.13461750445667, longitude: 77.5639057159424 },
  { latitude: 23.134553329962078, longitude: 77.56392180919649 },
  { latitude: 23.134489155436775, longitude: 77.56387352943422 },
  { latitude: 23.134415107869415, longitude: 77.56383061408998 },
  { latitude: 23.134237393540957, longitude: 77.56382524967194 },
  { latitude: 23.134237393540957, longitude: 77.56372332572938 }
];

// Custom path from Gate 2 to Management
const GATE2_TO_MANAGEMENT_PATH = [
  { latitude: 23.135037555085407, longitude: 77.56390137449117 },
  { latitude: 23.1346184244702, longitude: 77.56390137449117 },
  { latitude: 23.134554322025313, longitude: 77.56394430325135 },
  { latitude: 23.13448035762777, longitude: 77.56389600839616 },
  { latitude: 23.133430058780046, longitude: 77.56386917792102 },
  { latitude: 23.133346231757006, longitude: 77.56394966934639 },
  { latitude: 23.1333511627598, longitude: 77.56409455391206 },
  { latitude: 23.13345964477567, longitude: 77.56414284876726 },
  { latitude: 23.133504023756874, longitude: 77.56423407238269 }
];

// Custom path from Gate 2 to Parking
const GATE2_TO_PARKING_PATH = [
  { latitude: 23.135027693203615, longitude: 77.56389600839616 },
  { latitude: 23.134633217337743, longitude: 77.56390137449117 },
  { latitude: 23.134549391066763, longitude: 77.56392820496627 },
  { latitude: 23.13455925298371, longitude: 77.56406235734188 },
  { latitude: 23.134771284022804, longitude: 77.56406772343689 }
];

// Custom path from Gate 2 to Hostel
const GATE2_TO_HOSTEL_PATH = [
  { latitude: 23.135027693203615, longitude: 77.56390137449117 },
  { latitude: 23.134638148293238, longitude: 77.56391210668122 },
  { latitude: 23.13454446010801, longitude: 77.56393357106128 },
  { latitude: 23.134460633781536, longitude: 77.56514094244179 },
  { latitude: 23.13474169831655, longitude: 77.56517313901196 },
  { latitude: 23.13474169831655, longitude: 77.56541997938307 }
];

// Custom path from Gate 2 to Main Ground
const GATE2_TO_MAIN_GROUND_PATH = [
  { latitude: 23.13501783132112, longitude: 77.56390137449117 },
  { latitude: 23.13460844616961, longitude: 77.56390137449117 },
  { latitude: 23.13455420563729, longitude: 77.56392283887126 },
  { latitude: 23.134485172200787, longitude: 77.5638852762061 },
  { latitude: 23.13345952838668, longitude: 77.56386381182598 },
  { latitude: 23.133341184364927, longitude: 77.56393357106128 },
  { latitude: 23.133306667338925, longitude: 77.56463116341448 },
  { latitude: 23.133089702971933, longitude: 77.56463116341448 },
  { latitude: 23.13200451215267, longitude: 77.56431456380803 },
  { latitude: 23.131536061372955, longitude: 77.5637618560205 },
  { latitude: 23.131688924438798, longitude: 77.563649168025 },
  { latitude: 23.131743166129972, longitude: 77.56317695166284 }
];

// Custom path from Gate 2 to Library
const GATE2_TO_LIBRARY_PATH = [
  { latitude: 23.1350177939108, longitude: 77.56391210668122 },
  { latitude: 23.134628248971662, longitude: 77.56390674058616 },
  { latitude: 23.134549353656315, longitude: 77.56392820496627 },
  { latitude: 23.13447045829456, longitude: 77.56390137449117 },
  { latitude: 23.13344974536711, longitude: 77.56385844573096 },
  { latitude: 23.13334126334324, longitude: 77.56393893715634 },
  { latitude: 23.133291953303363, longitude: 77.5646526277946 },
  { latitude: 23.13265037244114, longitude: 77.56449701103888 },
  { latitude: 23.132546820803054, longitude: 77.56466872607967 },
  { latitude: 23.13248764840252, longitude: 77.56468482436473 }
];

// Custom path from Gate 2 to Science
const GATE2_TO_SCIENCE_PATH = [
  { latitude: 23.135017889514927, longitude: 77.56390137449117 },
  { latitude: 23.134618482664187, longitude: 77.56391210668122 },
  { latitude: 23.13455931117772, longitude: 77.56393357106128 },
  { latitude: 23.134475484860534, longitude: 77.5638852762061 },
  { latitude: 23.133444909973175, longitude: 77.56386381182598 },
  { latitude: 23.133351220954346, longitude: 77.56393357106128 },
  { latitude: 23.133291811973724, longitude: 77.5646526277946 },
  { latitude: 23.132250, longitude: 77.564399 }, // User Turn Point,
  { latitude: 23.132038950534735, longitude: 77.56461506512943 },
  { latitude: 23.13199457106874, longitude: 77.5648350750254 }
];

// Custom path from Gate 2 to Pharmacy
const GATE2_TO_PHARMACY_PATH = [
  { latitude: 23.135017889514927, longitude: 77.56390137449117 },
  { latitude: 23.134618482664187, longitude: 77.56391210668122 },
  { latitude: 23.13455931117772, longitude: 77.56393357106128 },
  { latitude: 23.134475484860534, longitude: 77.5638852762061 },
  { latitude: 23.133444909973175, longitude: 77.56386381182598 },
  { latitude: 23.133351220954346, longitude: 77.56393357106128 },
  { latitude: 23.133291811973724, longitude: 77.5646526277946 },
  { latitude: 23.132250, longitude: 77.564399 }, // User Turn Point,
  { latitude: 23.132038950534735, longitude: 77.56461506512943 },
  { latitude: 23.13199457106874, longitude: 77.5648350750254 },
  { latitude: 23.131762811396616, longitude: 77.56481897674034 }
];

// Custom path from Gate 2 to Agriculture
const GATE2_TO_AGRICULTURE_PATH = [
  { latitude: 23.135017889514927, longitude: 77.56390137449117 },
  { latitude: 23.134618482664187, longitude: 77.56391210668122 },
  { latitude: 23.13455931117772, longitude: 77.56393357106128 },
  { latitude: 23.134475484860534, longitude: 77.5638852762061 },
  { latitude: 23.133444909973175, longitude: 77.56386381182598 },
  { latitude: 23.133351220954346, longitude: 77.56393357106128 },
  { latitude: 23.133291811973724, longitude: 77.5646526277946 },
  { latitude: 23.132250, longitude: 77.564399 }, // User Turn Point,
  { latitude: 23.132038950534735, longitude: 77.56461506512943 },
  { latitude: 23.13178253563964, longitude: 77.56463116341448 }
];

// Custom path from Gate 2 to Basketball Court
const GATE2_TO_BASKETBALL_PATH = [
  { latitude: 23.135017889514927, longitude: 77.56390137449117 },
  { latitude: 23.134618482664187, longitude: 77.56391210668122 },
  { latitude: 23.13455931117772, longitude: 77.56393357106128 },
  { latitude: 23.134475484860534, longitude: 77.5638852762061 },
  { latitude: 23.133444909973175, longitude: 77.56386381182598 },
  { latitude: 23.133351220954346, longitude: 77.56393357106128 },
  { latitude: 23.133291811973724, longitude: 77.5646526277946 },
  { latitude: 23.133291811973724, longitude: 77.5646526277946 },
  { latitude: 23.132250, longitude: 77.564399 }, // User Turn Point
];



// Reverse paths from buildings to Gate 2
const WORKSHOP_TO_GATE2_PATH = GATE2_TO_WORKSHOP_PATH.slice().reverse();
const DSW_TO_GATE2_PATH = GATE2_TO_DSW_PATH.slice().reverse();
const ENGINEERING_TO_GATE2_PATH = GATE2_TO_ENGINEERING_PATH.slice().reverse();
const MANAGEMENT_TO_GATE2_PATH = GATE2_TO_MANAGEMENT_PATH.slice().reverse();
const PARKING_TO_GATE2_PATH = GATE2_TO_PARKING_PATH.slice().reverse();
const HOSTEL_TO_GATE2_PATH = GATE2_TO_HOSTEL_PATH.slice().reverse();
const MAIN_GROUND_TO_GATE2_PATH = GATE2_TO_MAIN_GROUND_PATH.slice().reverse();
const LIBRARY_TO_GATE2_PATH = GATE2_TO_LIBRARY_PATH.slice().reverse();
const SCIENCE_TO_GATE2_PATH = GATE2_TO_SCIENCE_PATH.slice().reverse();
const PHARMACY_TO_GATE2_PATH = GATE2_TO_PHARMACY_PATH.slice().reverse();
const AGRICULTURE_TO_GATE2_PATH = GATE2_TO_AGRICULTURE_PATH.slice().reverse();
const BASKETBALL_TO_GATE2_PATH = GATE2_TO_BASKETBALL_PATH.slice().reverse();


// Generate campus pathways connecting buildings
const generatePathways = () => {
  const pathways = [];

  // Define main pathways (manually curated for realistic campus layout)
  const connections = [
    // Main entrance pathway
    [21, 6, 7, 22, 3, 1, 2, 23], // Gate 1 → Admission → Football → Gate 2 → Admin → Parking → Hostel → Gate 3
    // Academic corridor
    [8, 3, 5, 19, 17, 18, 4], // Engineering → Admin → Management → DSW → Library → Audi → AIC
    // Southern pathway
    [6, 9, 10, 11, 13], // Admission → Paramedical → Workshops → Canteen → TNSD
    // Science cluster
    [14, 16, 15, 17], // Agriculture → Pharmacy → Science → Library
    // Sports facilities
    [7, 20, 12], // Football → Basketball → Main Ground
    // Cross connections
    [8, 19], [5, 11], [17, 14], [4, 15], [3, 8], [19, 20], [20, 14]
  ];

  connections.forEach((path, pathIndex) => {
    for (let i = 0; i < path.length - 1; i++) {
      const from = BUILDINGS.find(b => b.id === path[i]);
      const to = BUILDINGS.find(b => b.id === path[i + 1]);
      if (from && to) {
        pathways.push({
          id: `path-${from.id}-${to.id}`,
          from: from.id,
          to: to.id,
          coordinates: [[from.lng, from.lat], [to.lng, to.lat]],
          distance: Math.sqrt(Math.pow(to.lat - from.lat, 2) + Math.pow(to.lng - from.lng, 2))
        });
      }
    }
  });

  return pathways;
};

const PATHWAYS = generatePathways();

// A* Pathfinding Algorithm
class PathFinder {
  constructor(buildings, pathways) {
    this.buildings = buildings;
    this.pathways = pathways;
    this.graph = this.buildGraph();
  }

  buildGraph() {
    const graph = {};
    this.buildings.forEach(b => graph[b.id] = []);

    this.pathways.forEach(path => {
      graph[path.from].push({ node: path.to, cost: path.distance });
      graph[path.to].push({ node: path.from, cost: path.distance });
    });

    return graph;
  }

  heuristic(a, b) {
    const buildingA = this.buildings.find(x => x.id === a);
    const buildingB = this.buildings.find(x => x.id === b);
    return Math.sqrt(
      Math.pow(buildingB.lat - buildingA.lat, 2) +
      Math.pow(buildingB.lng - buildingA.lng, 2)
    );
  }

  findPath(startId, endId) {
    const openSet = [{ id: startId, f: 0, g: 0 }];
    const closedSet = new Set();
    const cameFrom = {};
    const gScore = { [startId]: 0 };
    const fScore = { [startId]: this.heuristic(startId, endId) };

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift();

      if (current.id === endId) {
        return this.reconstructPath(cameFrom, current.id);
      }

      closedSet.add(current.id);

      const neighbors = this.graph[current.id] || [];
      for (const neighbor of neighbors) {
        if (closedSet.has(neighbor.node)) continue;

        const tentativeG = gScore[current.id] + neighbor.cost;

        if (!gScore[neighbor.node] || tentativeG < gScore[neighbor.node]) {
          cameFrom[neighbor.node] = current.id;
          gScore[neighbor.node] = tentativeG;
          fScore[neighbor.node] = tentativeG + this.heuristic(neighbor.node, endId);

          if (!openSet.find(n => n.id === neighbor.node)) {
            openSet.push({
              id: neighbor.node,
              g: gScore[neighbor.node],
              f: fScore[neighbor.node]
            });
          }
        }
      }
    }

    return null; // No path found
  }

  reconstructPath(cameFrom, current) {
    const path = [current];
    while (cameFrom[current]) {
      current = cameFrom[current];
      path.unshift(current);
    }
    return path;
  }
}

const pathFinder = new PathFinder(BUILDINGS, PATHWAYS);

// Create custom marker icons
const createCustomIcon = (building) => {
  return L.divIcon({
    html: `<div style="
      background-color: ${building.color};
      border: 2px solid white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${building.icon}</div>`,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};



// Custom path logic
const CUSTOM_PATHS = {
  "21-22": GATE1_TO_GATE2_PATH,
  "22-21": GATE2_TO_GATE1_PATH,
  "22-23": GATE2_TO_GATE3_PATH,
  "23-22": GATE3_TO_GATE2_PATH,
  "23-2": GATE3_TO_HOSTEL_PATH,
  "2-23": HOSTEL_TO_GATE3_PATH,
  "2-18": HOSTEL_TO_AUDI_LAW_PATH,
  "18-2": AUDI_LAW_TO_HOSTEL_PATH,
  "4-18": AIC_TO_AUDI_LAW_PATH,
  "18-4": AUDI_LAW_TO_AIC_PATH,

  // Explicit Parking Paths (User Curve)
  "1-5": PARKING_TO_MANAGEMENT_PATH,
  "5-1": MANAGEMENT_TO_PARKING_PATH,
  "1-8": PARKING_TO_ENGINEERING_PATH,
  "8-1": ENGINEERING_TO_PARKING_PATH,
  "1-19": PARKING_TO_DSW_PATH,
  "19-1": DSW_TO_PARKING_PATH,
  "1-18": PARKING_TO_AUDI_LAW_PATH,
  "18-1": AUDI_LAW_TO_PARKING_PATH,
  "1-17": PARKING_TO_LIBRARY_PATH,
  "17-1": LIBRARY_TO_PARKING_PATH,
  "1-13": PARKING_TO_TNSD_PATH,
  "13-1": TNSD_TO_PARKING_PATH,
  "1-9": PARKING_TO_PARAMEDICAL_PATH,
  "9-1": PARAMEDICAL_TO_PARKING_PATH,
  "1-10": PARKING_TO_WORKSHOP_PATH,
  "10-1": WORKSHOP_TO_PARKING_PATH,
  "1-11": PARKING_TO_CANTEEN_PATH,
  "11-1": CANTEEN_TO_PARKING_PATH,
  "1-20": PARKING_TO_BASKETBALL_PATH,
  "20-1": BASKETBALL_TO_PARKING_PATH,
  "1-15": PARKING_TO_SCIENCE_PATH,
  "15-1": SCIENCE_TO_PARKING_PATH,
  "1-14": PARKING_TO_AGRICULTURE_PATH,
  "14-1": AGRICULTURE_TO_PARKING_PATH,
  "1-16": PARKING_TO_PHARMACY_PATH,
  "16-1": PHARMACY_TO_PARKING_PATH,
  "1-12": PARKING_TO_MAIN_GROUND_PATH,
  "12-1": MAIN_GROUND_TO_PARKING_PATH,
  "1-24": PARKING_TO_GIRLS_HOSTEL_PATH,
  "24-1": GIRLS_HOSTEL_TO_PARKING_PATH,
  "1-25": PARKING_TO_FOOD_PROCESSING_PATH,
  "25-1": FOOD_PROCESSING_TO_PARKING_PATH,

  "22-13": GATE2_TO_TNSD_PATH,
  "22-24": GATE2_TO_GIRLS_HOSTEL_PATH,
  "24-22": GIRLS_HOSTEL_TO_GATE2_PATH,
  "23-24": GATE3_TO_GIRLS_HOSTEL_PATH,
  "24-23": GIRLS_HOSTEL_TO_GATE3_PATH,
  "22-25": GATE2_TO_FOOD_PROCESSING_PATH,
  "25-22": FOOD_PROCESSING_TO_GATE2_PATH,

  // Direct Inter-Building Connections
  "25-13": FOOD_PROCESSING_TO_TNSD_PATH,
  "13-25": TNSD_TO_FOOD_PROCESSING_PATH,

  "25-12": FOOD_PROCESSING_TO_MAIN_GROUND_PATH,
  "12-25": MAIN_GROUND_TO_FOOD_PROCESSING_PATH,
  "25-14": FOOD_PROCESSING_TO_AGRICULTURE_PATH,
  "14-25": AGRICULTURE_TO_FOOD_PROCESSING_PATH,
  "25-15": FOOD_PROCESSING_TO_SCIENCE_PATH,
  "15-25": SCIENCE_TO_FOOD_PROCESSING_PATH,
  "25-16": FOOD_PROCESSING_TO_PHARMACY_PATH,
  "16-25": PHARMACY_TO_FOOD_PROCESSING_PATH,
  "25-9": FOOD_PROCESSING_TO_PARAMEDICAL_PATH,
  "9-25": PARAMEDICAL_TO_FOOD_PROCESSING_PATH,
  "25-3": FOOD_PROCESSING_TO_ADMIN_PATH,
  "3-25": ADMIN_TO_FOOD_PROCESSING_PATH,

  "22-3": GATE2_TO_ADMIN_PATH,
  "22-6": GATE2_TO_ADMISSION_PATH,
  "22-7": GATE2_TO_FOOTBALL_PATH,
  "22-4": GATE2_TO_AIC_PATH,
  "22-18": GATE2_TO_AUDI_LAW_PATH,
  "22-9": GATE2_TO_PARAMEDICAL_PATH,
  "22-11": GATE2_TO_CANTEEN_PATH,
  "22-10": GATE2_TO_WORKSHOP_PATH,
  "22-19": GATE2_TO_DSW_PATH,
  "22-8": GATE2_TO_ENGINEERING_PATH,
  "22-5": GATE2_TO_MANAGEMENT_PATH,
  "22-1": GATE2_TO_PARKING_PATH,
  "22-2": GATE2_TO_HOSTEL_PATH,
  "22-17": GATE2_TO_LIBRARY_PATH,
  "22-20": GATE2_TO_BASKETBALL_PATH,
  "22-14": GATE2_TO_AGRICULTURE_PATH,
  "22-16": GATE2_TO_PHARMACY_PATH,
  "22-15": GATE2_TO_SCIENCE_PATH,
  "22-12": GATE2_TO_MAIN_GROUND_PATH,
  "1-3": PARKING_TO_ADMIN_PATH,
  "3-1": ADMIN_TO_PARKING_PATH,
  "1-2": PARKING_TO_HOSTEL_PATH,
  "2-1": HOSTEL_TO_PARKING_PATH,
  "3-5": ADMIN_TO_MANAGEMENT_PATH,
  "5-3": MANAGEMENT_TO_ADMIN_PATH,
  "3-19": ADMIN_TO_DSW_PATH,
  "19-3": DSW_TO_ADMIN_PATH,
  "8-3": ENGINEERING_TO_ADMIN_PATH,

  // Reverse paths
  "13-22": TNSD_TO_GATE2_PATH,
  "3-22": ADMIN_TO_GATE2_PATH,
  "6-22": ADMISSION_TO_GATE2_PATH,
  "7-22": FOOTBALL_TO_GATE2_PATH,
  "4-22": AIC_TO_GATE2_PATH,
  "18-22": AUDI_LAW_TO_GATE2_PATH,
  "9-22": PARAMEDICAL_TO_GATE2_PATH,
  "11-22": CANTEEN_TO_GATE2_PATH,
  "10-22": WORKSHOP_TO_GATE2_PATH,
  "19-22": DSW_TO_GATE2_PATH,
  "8-22": ENGINEERING_TO_GATE2_PATH,
  "5-22": MANAGEMENT_TO_GATE2_PATH,
  "1-22": PARKING_TO_GATE2_PATH,
  "2-22": HOSTEL_TO_GATE2_PATH,
  "17-22": LIBRARY_TO_GATE2_PATH,
  "20-22": BASKETBALL_TO_GATE2_PATH,
  "14-22": AGRICULTURE_TO_GATE2_PATH,
  "16-22": PHARMACY_TO_GATE2_PATH,
  "15-22": SCIENCE_TO_GATE2_PATH,
  "12-22": MAIN_GROUND_TO_GATE2_PATH,
  "3-8": ADMIN_TO_ENGINEERING_PATH,
};

const getCustomPath = (startId, endId) => {
  if (!startId || !endId) return null;

  // 1. Check for direct custom path
  const directPath = CUSTOM_PATHS[`${startId}-${endId}`];
  if (directPath) return directPath;

  // 2. Try to connect via Gate 2 (ID 22) as a central hub
  // We look for paths: Hub->Start and Hub->End (to analyze common prefixes)
  // Note: We use the '22-ID' keys because those are the base definitions.
  const gate2ToStart = CUSTOM_PATHS[`22-${startId}`];
  const gate2ToEnd = CUSTOM_PATHS[`22-${endId}`];

  if (gate2ToStart && gate2ToEnd) {
    // Both connect to Gate 2, so we can connect them dynamically

    // Find common prefix to avoid backtracking
    // (e.g. if both paths start with Gate2 -> A -> B..., we should start diverging at B)
    let matchIndex = -1;
    const len = Math.min(gate2ToStart.length, gate2ToEnd.length);

    for (let i = 0; i < len; i++) {
      const p1 = gate2ToStart[i];
      const p2 = gate2ToEnd[i];
      // Check if points are effectively same location (increased tolerance for manual points)
      // 0.0002 degrees is approx 20 meters, sufficient to catch "Gate 2" variations
      if (Math.abs(p1.latitude - p2.latitude) < 0.0002 &&
        Math.abs(p1.longitude - p2.longitude) < 0.0002) {
        matchIndex = i;
      } else {
        break;
      }
    }

    // Construct the new path
    // Path = reverse(Hub->Start from divergence) + (Hub->End from divergence)

    // Part 1: Start -> ... -> Divergence Point
    // We take Hub->Start segment from divergence to end, then reverse it to get Start->Divergence
    const part1 = gate2ToStart.slice(matchIndex > -1 ? matchIndex : 0).reverse();

    // Part 2: Divergence Point -> ... -> End
    // We take Hub->End segment from divergence+1 to end (avoiding duplicate divergence point)
    const part2 = gate2ToEnd.slice(matchIndex > -1 ? matchIndex + 1 : 0);

    return [...part1, ...part2];
  }

  return null;
};

const calculateBearing = (startLat, startLng, endLat, endLng) => {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const endLatRad = (endLat * Math.PI) / 180;
  const endLngRad = (endLng * Math.PI) / 180;

  const y = Math.sin(endLngRad - startLngRad) * Math.cos(endLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(endLatRad) -
    Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(endLngRad - startLngRad);

  const bearingRad = Math.atan2(y, x);
  const bearingDeg = (bearingRad * 180) / Math.PI;

  return (bearingDeg + 360) % 360;
};

// Helper to calculate total distance of a path
const getPathLength = (path) => {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    totalDistance += Math.sqrt(
      Math.pow(p2.latitude - p1.latitude, 2) +
      Math.pow(p2.longitude - p1.longitude, 2)
    );
  }
  return totalDistance;
};

// Helper to get a point at a specific fraction (0 to 1) along the path
const getPointAtFraction = (path, fraction) => {
  if (!path || path.length < 2) return null;

  const totalLength = getPathLength(path);
  const targetDistance = totalLength * fraction;

  let currentDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const segmentDistance = Math.sqrt(
      Math.pow(p2.latitude - p1.latitude, 2) +
      Math.pow(p2.longitude - p1.longitude, 2)
    );

    if (currentDistance + segmentDistance >= targetDistance) {
      // Interpolate in this segment
      const remainingDistance = targetDistance - currentDistance;
      const segmentFraction = remainingDistance / segmentDistance;

      return {
        latitude: p1.latitude + (p2.latitude - p1.latitude) * segmentFraction,
        longitude: p1.longitude + (p2.longitude - p1.longitude) * segmentFraction,
        bearing: calculateBearing(p1.latitude, p1.longitude, p2.latitude, p2.longitude)
      };
    }
    currentDistance += segmentDistance;
  }

  return { ...path[path.length - 1], bearing: 0 };
};

// Component to handle map events and disable follow mode on user interaction
function MapEventsHandler({ setFollowMode }) {
  useMapEvents({
    dragstart: () => {
      setFollowMode(false);
    },
    zoomstart: () => {
      setFollowMode(false);
    },
  });
  return null;
}

// Satellite Map Component
function MapPage() {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  // ... rest of state

  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [route, setRoute] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [arrowOffset, setArrowOffset] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar toggle state
  const [showSuggestions, setShowSuggestions] = useState(false); // Search suggestions toggle
  const mapRef = React.useRef(null);

  // Animation loop
  useEffect(() => {
    let animationFrame;
    const animate = () => {
      setArrowOffset(prev => (prev + 0.002) % 1); // Adjust speed here
      animationFrame = requestAnimationFrame(animate);
    };

    if (navigationStarted) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [navigationStarted]);

  const watchId = React.useRef(null);
  const firstFix = React.useRef(true);
  const [followMode, setFollowMode] = useState(true); // Continuous follow toggle - ON by default
  const [locationAccuracy, setLocationAccuracy] = useState(null); // GPS accuracy in meters
  const [userHeading, setUserHeading] = useState(0); // Device heading in degrees

  // Position smoothing configuration
  const previousPositions = React.useRef([]);
  const SMOOTHING_FACTOR = 5; // Increased for better stability
  const MIN_MOVEMENT_THRESHOLD = 0.00002; // ~2 meters (prevents micro-jitter)

  // Clean up watcher on unmount
  useEffect(() => {
    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  // Helper to find nearest building
  const findNearestBuilding = (lat, lng) => {
    let nearest = null;
    let minDistance = Infinity;

    BUILDINGS.forEach(building => {
      const d = Math.sqrt(
        Math.pow(building.lat - lat, 2) +
        Math.pow(building.lng - lng, 2)
      );
      if (d < minDistance) {
        minDistance = d;
        nearest = building;
      }
    });
    return nearest;
  };

  // Geolocation Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    // Reset first fix flag to allow re-centering on new session
    firstFix.current = true;

    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
    }

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, heading } = position.coords;

        // Capture device heading
        if (heading !== null && heading !== undefined && !isNaN(heading)) {
          setUserHeading(heading);
        }

        // --- STABILIZATION LOGIC ---

        // 1. Add to history
        previousPositions.current.push({ lat: latitude, lng: longitude });
        if (previousPositions.current.length > SMOOTHING_FACTOR) {
          previousPositions.current.shift();
        }

        // 2. Calculate average (Smoothing)
        const avgLat = previousPositions.current.reduce((sum, p) => sum + p.lat, 0) / previousPositions.current.length;
        const avgLng = previousPositions.current.reduce((sum, p) => sum + p.lng, 0) / previousPositions.current.length;

        // 3. Anti-Jitter Threshold
        // Update only if:
        // - First fix
        // - No previous location
        // - Moved significantly (> ~2 meters)
        // - OR accuracy is very high (< 10m) which implies we should trust it
        const shouldUpdate =
          firstFix.current ||
          !userLocation ||
          Math.abs(avgLat - userLocation.lat) > MIN_MOVEMENT_THRESHOLD ||
          Math.abs(avgLng - userLocation.lng) > MIN_MOVEMENT_THRESHOLD ||
          accuracy < 10;

        if (shouldUpdate) {
          const newLocation = { lat: avgLat, lng: avgLng };
          setUserLocation(newLocation);
          setLocationAccuracy(accuracy);

          // 4. Stable Map Movement
          // Only move map if Follow Mode is active
          if (mapRef.current) {
            if (firstFix.current) {
              // Immediate jump on first fix
              mapRef.current.setView([avgLat, avgLng], 18);
              firstFix.current = false;
            } else if (followMode) {
              // Smooth pan if following, but use panTo for stability
              mapRef.current.panTo([avgLat, avgLng], {
                animate: true,
                duration: 0.8 // Smoother, slower pan prevents shaking
              });
            }
          }
        }
      },
      (error) => {
        console.error("GPS Error:", error);
        // Don't show alert loop on error, just log
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );
  };

  // Effect to update startPoint if 'Your Location' is active
  useEffect(() => {
    if (startPoint?.id === 'user-location' && userLocation) {
      setStartPoint(prev => ({
        ...prev,
        lat: userLocation.lat,
        lng: userLocation.lng
      }));
    }
  }, [userLocation, startPoint?.id]);

  // Marker Refs for programmatic popup opening
  const markerRefs = React.useRef({});
  const userMarkerRef = React.useRef(null);

  // Auto-open popup when building is selected
  useEffect(() => {
    if (selectedBuilding && markerRefs.current[selectedBuilding.id]) {
      markerRefs.current[selectedBuilding.id].openPopup();
    }
  }, [selectedBuilding]);

  // Auto-open user popup when location is found
  useEffect(() => {
    if (userLocation && userMarkerRef.current) {
      // Optional: Open only on first fix or always?
      // User request: "hover automatically". popup is closest.
      // We'll open it briefly or just availability.
      // Actually, let's open it when userLocation changes significantly or just ensure it's available.
      // But better: In handleLocateMe, we can open it.
    }
  }, [userLocation]);
  useEffect(() => {
    if (startPoint && endPoint) {
      let actualStartId = startPoint.id;

      // If starting from user location, find the nearest node to route from
      if (startPoint.id === 'user-location') {
        const nearest = findNearestBuilding(startPoint.lat, startPoint.lng);
        if (nearest) {
          actualStartId = nearest.id;
        }
      }

      // Check for custom path first
      const customPath = getCustomPath(actualStartId, endPoint.id);

      if (customPath) {
        // Use custom path (store just IDs for display logic, or full path if needed)
        // We Use actualStartId so the custom path is found correctly
        setRoute([actualStartId, endPoint.id]);
      } else {
        const path = pathFinder.findPath(actualStartId, endPoint.id);
        setRoute(path);
      }
    } else {
      setRoute(null);
    }
  }, [startPoint, endPoint]);

  const handleBuildingClick = (building) => {
    if (!startPoint) {
      setStartPoint(building);
    } else if (!endPoint) {
      setEndPoint(building);
    } else {
      setStartPoint(building);
      setEndPoint(null);
    }
    setSelectedBuilding(building);
  };

  // Dedicated function for search results (Highlight only, no route modification)
  const highlightBuilding = (building) => {
    setSelectedBuilding(building);
    if (mapRef.current) {
      mapRef.current.flyTo([building.lat, building.lng], 18, {
        animate: true,
        duration: 1.5
      });
    }
  };

  const clearRoute = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRoute(null);
    setNavigationStarted(false);
    setSelectedBuilding(null);
    setSearchTerm('');
  };

  // eslint-disable-next-line
  const filteredBuildings = BUILDINGS.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRouteCoordinates = () => {
    if (!route || route.length === 0) return [];

    const coordinates = [];

    // Iterate through each segment of the route
    console.log("Rendering route:", route);
    for (let i = 0; i < route.length - 1; i++) {
      const startId = route[i];
      const endId = route[i + 1];

      // Check if there is a custom path between these two nodes
      const customPath = getCustomPath(startId, endId);
      console.log(`Segment ${startId}->${endId}:`, customPath ? "Custom Path Found" : "FALLBACK TO STRAIGHT LINE");

      if (customPath) {
        // If custom path exists, add all its points
        // This ensures smooth curves for known roads
        customPath.forEach(point => {
          coordinates.push([point.latitude, point.longitude]);
        });
      } else {
        // Fallback: Add the start node's position (creates a straight line to next node)
        const building = BUILDINGS.find(b => b.id === startId);
        if (building) {
          coordinates.push([building.lat, building.lng]);
        }
      }
    }

    // Always add the final destination point to complete the path
    const lastId = route[route.length - 1];
    const lastBuilding = BUILDINGS.find(b => b.id === lastId);
    if (lastBuilding) {
      coordinates.push([lastBuilding.lat, lastBuilding.lng]);
    }

    return coordinates;
  };

  return (
    <div className="campus-navigation">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');
        
        body {
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%);
          color: #fff;
          overflow: hidden;
        }
        
        .campus-navigation {
          width: 100vw;
          height: 100vh;
          display: flex;
          position: relative;
          background: radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%);
        }

        /* Tablet and below */
        @media (max-width: 1024px) {
          .sidebar {
            width: 320px !important;
          }
          
          .header h1 {
            font-size: 24px;
          }
        }

        /* Mobile devices */
        @media (max-width: 768px) {
          .campus-navigation {
            flex-direction: column-reverse;
          }
          
          .sidebar {
            width: 100% !important;
            height: 45% !important;
            border-right: none;
            border-top: 1px solid rgba(148, 163, 184, 0.1);
            box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
            z-index: 1000;
            max-height: 45vh !important;
            overflow-y: auto !important;
          }

          .route-info {
            max-height: none !important;
            overflow-y: visible !important;
            padding-bottom: 80px !important;
          }

          .buildings-list {
            max-height: 200px !important;
            overflow-y: auto !important;
          }
          
          .map-container {
            width: 100% !important;
            height: 55% !important;
          }
          
          .header {
            padding: 16px 20px;
          }
          
          .header h1 {
            font-size: 20px;
          }

          .header p {
            font-size: 13px;
          }
          
          .search-container {
            padding: 12px 16px;
          }

          .search-bar {
            font-size: 14px;
          }
          
          .controls {
            padding: 12px 16px;
            overflow-x: auto;
            flex-wrap: nowrap;
          }

          .control-btn {
            font-size: 12px;
            padding: 8px 14px;
            white-space: nowrap;
          }
          
          .buildings-list {
            padding-bottom: 20px;
          }

          .map-controls {
            bottom: 50px !important;
          }

          /* Route display improvements */
          .route-step {
            gap: 8px !important;

            padding: 6px !important;
            margin-bottom: 6px !important;
          }

          .route-step-icon {
            font-size: 16px !important;
          }

          .route-step-text {
            font-size: 13px !important;
          }

          .btn-primary {
            font-size: 14px !important;
            padding: 12px 16px !important;
          }

          /* Route metrics mobile */
          .route-metrics {
            gap: 6px;
          }

          .route-metric-card {
            padding: 8px;
          }

          .metric-icon {
            font-size: 16px;
            margin-bottom: 2px;
          }

          .metric-value {
            font-size: 13px;
          }

          .metric-label {
            font-size: 10px;
          }
        }

        /* Small phones */
        @media (max-width: 480px) {
          .header {
            padding: 12px 16px;
          }

          .header h1 {
            font-size: 18px;
            margin-bottom: 4px;
          }

          .header p {
            font-size: 12px;
          }

          .search-container {
            padding: 10px 12px;
          }

          .search-bar {
            font-size: 13px;
            padding: 10px 12px 10px 36px;
          }

          .controls {
            padding: 10px 12px;
            gap: 6px;
          }

          .control-btn {
            font-size: 11px;
            padding: 6px 10px;
          }

          .map-controls button {
            width: 36px !important;
            height: 36px !important;
            font-size: 16px !important;
          }

          .map-controls {
            right: 8px !important;
            bottom: 60px !important;
            gap: 6px !important;
          }

          /* Route display for small phones */
          .route-step {
            gap: 6px !important;
            padding: 5px !important;
            margin-bottom: 5px !important;
          }

          .route-step-icon {
            font-size: 14px !important;
          }

          .route-step-text {
            font-size: 12px !important;
          }

          .route-step-text strong {
            font-size: 12px !important;
          }

          .btn-primary {
            font-size: 13px !important;
            padding: 10px 14px !important;
          }

          /* Route metrics small phones */
          .route-metrics {
            gap: 5px;
            margin-top: 8px;
          }

          .route-metric-card {
            padding: 6px;
          }

          .metric-icon {
            font-size: 14px;
            margin-bottom: 2px;
          }

          .metric-value {
            font-size: 12px;
          }

          .metric-label {
            font-size: 9px;
          }
        }

        /* Very small devices */
        @media (max-width: 360px) {
          .header h1 {
            font-size: 16px;
          }

          .control-btn {
            font-size: 10px;
            padding: 5px 8px;
          }

          .map-controls button {
            width: 32px !important;
            height: 32px !important;
            font-size: 14px !important;
          }
        }
        
        /* Menu Button */
        .menu-btn {
          position: fixed;
          top: 100px;
          left: 20px;
          z-index: 2000;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .tooltip-text {
          visibility: hidden;
          width: 100px;
          background-color: rgba(15, 23, 42, 0.95);
          color: #fff;
          text-align: center;
          border-radius: 6px;
          padding: 6px 8px;
          position: absolute;
          z-index: 10;
          left: 55px; /* Right of the button */
          top: 50%;
          transform: translateY(-50%);
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 11px;
          font-weight: 500;
          border: 1px solid rgba(148, 163, 184, 0.2);
          pointer-events: none;
          white-space: nowrap;
        }

        .menu-btn:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }

        .hamburger {
          width: 24px;
          height: 18px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hamburger span {
          display: block;
          height: 2px;
          width: 100%;
          background: #fff;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .hamburger.open span:nth-child(1) {
          transform: translateY(8px) rotate(45deg);
        }
        
        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }
        
        .hamburger.open span:nth-child(3) {
          transform: translateY(-8px) rotate(-45deg);
        }

        /* Sidebar Drawer */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh !important; /* Force full height */
          width: 320px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 20px 0 40px rgba(0, 0, 0, 0.3);
          padding-top: 80px; /* Space for hamburger menu */
          overflow: hidden;
          box-shadow: 20px 0 40px rgba(0, 0, 0, 0.3);
          max-height: 100vh !important;
          z-index: 1500;
          transform: translateX(-105%); /* Hidden by default */
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar.open {
          transform: translateX(0);
        }
        
        /* Mobile adjustment overrides */
        @media (max-width: 768px) {
          .menu-btn {
            top: 110px;
            left: 16px;
          }
          
          .sidebar {
            width: 85vw !important; /* Response width */
            border-right: none;
            /* Override previous bottom-sheet styles if any remain */
            bottom: auto !important; 
            max-height: 100vh !important;
          }
        }

        .sidebar > * {
          flex-shrink: 0;
        }

        .search-container,
        .controls,
        .route-info {
          flex-shrink: 0;
        }
        
        .header {
          padding: 32px 28px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.5;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }

        .pulse {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          animation: pulse 2s infinite;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .user-location-marker {
          background: transparent !important;
          border: none !important;
        }

        .gps-pointer-marker {
          background: transparent !important;
          border: none !important;
        }

        .gps-pointer-marker img {
          transition: transform 0.3s ease;
        }

        /* Compact popup styling */
        .leaflet-popup-content-wrapper {
          padding: 4px 8px !important;
          border-radius: 8px !important;
        }
        
        .leaflet-popup-content {
          margin: 6px 8px !important;
          min-width: 100px !important;
        }

        /* Hide Leaflet attribution logo */
        .leaflet-control-attribution {
          display: none !important;
        }

        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          position: relative;
          z-index: 1;
          letter-spacing: -0.5px;
        }
        
        .header p {
          font-size: 14px;
          opacity: 0.9;
          position: relative;
          z-index: 1;
          font-weight: 500;
        }
        
        .search-container {
          padding: 24px 28px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          margin-top: 60px; /* Push down to avoid overlap with Menu Button */
        }
        
        .search-box {
          position: relative;
        }
        
        .search-box input {
          width: 100%;
          padding: 14px 44px 14px 16px;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          transition: all 0.3s ease;
          font-family: 'DM Sans', sans-serif;
        }

        .clear-search-btn {
          position: absolute;
          right: 44px; /* Move left to make room for search button */
          top: 50%;
          transform: translateY(-50%);
          background: rgba(148, 163, 184, 0.2);
          border: none;
          color: #fff;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .execute-search-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: #3b82f6;
          border: none;
          color: #fff;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
          transition: all 0.2s;
        }

        .execute-search-btn:hover {
          background: #2563eb;
          transform: translateY(-50%) scale(1.05);
        }

        .clear-search-btn:hover {
          background: rgba(148, 163, 184, 0.4);
        }
        
        .clear-search-btn:hover {
          background: rgba(148, 163, 184, 0.4);
        }

        .map-controls {
            position: absolute;
            top: 180px; /* Increased further to absolutely ensure clearance */
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 1000;
        }

        .map-btn {
            width: 44px;
            height: 44px;
            background: rgba(30, 41, 59, 0.9);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            cursor: pointer;
            color: #fff;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: all 0.2s;
            margin-top: 70px;
        }

        .map-btn:hover {
            background: rgba(59, 130, 246, 0.2);
            transform: translateY(-2px);
        }

        .map-btn.active {
            background: #3b82f6;
            border-color: #3b82f6;
        }
        
        .map-btn1 {
            width: 44px;
            height: 44px;
            background: rgba(30, 41, 59, 0.9);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            cursor: pointer;
            color: #fff;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: all 0.2s;
            margin-top: 10px;
        }

        .map-btn1:hover {
            background: rgba(59, 130, 246, 0.2);
            transform: translateY(-2px);
        }

        .map-btn1.active {
            background: #3b82f6;
            border-color: #3b82f6;
        }

        
        
        /* Search Suggestions Dropdown */
        .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 8px;
          background: rgba(30, 41, 59, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          max-height: 250px;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          z-index: 100;
        }

        .suggestion-item {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: background 0.2s;
          color: #fff;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-item:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .suggestion-icon {
          font-size: 18px;
        }

        .suggestion-name {
          font-size: 14px;
          font-weight: 500;
        }
        
        .search-box input:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(30, 41, 59, 1);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .search-box input::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }
        
        .search-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(148, 163, 184, 0.5);
          font-size: 18px;
        }
        
        .controls {
          padding: 20px 28px;
          display: flex;
          gap: 12px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }
        
        .btn {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        
        .btn-secondary {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .btn-secondary:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
        }
        
        .btn:active {
          transform: translateY(0);
        }
        
        .route-info {
          padding: 24px 28px;
          background: rgba(34, 197, 94, 0.1);
          border-bottom: 1px solid rgba(34, 197, 94, 0.2);
          animation: slideDown 0.4s ease;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .route-info h3 {
          font-size: 14px;
          font-weight: 600;
          color: #22c55e;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .route-step {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          padding: 8px;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 8px;
        }
        
        .route-step-icon {
          font-size: 20px;
        }
        
        .route-step-text {
          flex: 1;
          font-size: 14px;
        }

        .route-metrics {
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .route-metric-card {
          padding: 10px;
          border-radius: 8px;
          text-align: center;
        }

        .distance-card {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .time-card {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .metric-icon {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .metric-value {
          font-size: 14px;
          font-weight: 700;
        }

        .metric-label {
          font-size: 11px;
          opacity: 0.7;
        }
        
        .buildings-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px 28px;
        }
        
        .buildings-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .buildings-list::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.3);
        }
        
        .buildings-list::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        
        .buildings-list::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
        
        .building-category {
          margin-bottom: 28px;
        }
        
        .category-title {
          font-size: 12px;
          font-weight: 700;
          color: rgba(148, 163, 184, 0.7);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-family: 'Space Mono', monospace;
        }
        
        .building-card {
          padding: 16px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 12px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        
        .building-card:hover {
          background: rgba(30, 41, 59, 0.9);
          border-color: rgba(148, 163, 184, 0.3);
          transform: translateX(4px);
        }
        
        .building-card.selected {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .building-icon {
          font-size: 32px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
        }
        
        .building-info {
          flex: 1;
        }
        
        .building-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .building-type {
          font-size: 12px;
          color: rgba(148, 163, 184, 0.8);
          text-transform: capitalize;
        }
        
        .map-container {
          flex: 1;
          position: relative;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          overflow: hidden;
        }
        
        .map-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }
        
        .map-svg {
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 1;
        }
        
        .campus-boundary {
          fill: rgba(15, 23, 42, 0.3);
          stroke: rgba(59, 130, 246, 0.3);
          stroke-width: 0.0002;
          stroke-dasharray: 0.001 0.0005;
        }
        
        .pathway {
          stroke: rgba(148, 163, 184, 0.2);
          stroke-width: 0.00015;
          fill: none;
          transition: all 0.3s ease;
        }
        
        .pathway:hover {
          stroke: rgba(59, 130, 246, 0.4);
          stroke-width: 0.0002;
        }
        
        .route-path {
          stroke: #22c55e;
          stroke-width: 0.0003;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0 0 0.0005 rgba(34, 197, 94, 0.8));
          animation: dash 2s linear infinite;
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: -0.01;
          }
        }
        
        .building-marker {
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .building-marker:hover .building-circle {
          r: 0.00045;
          filter: drop-shadow(0 0 0.0008 currentColor);
        }
        
        .building-circle {
          transition: all 0.3s ease;
        }
        
        .building-label {
          font-size: 0.0002px;
          font-weight: 60;
          font-family: 'DM Sans', sans-serif;
          pointer-events: none;
          text-shadow: 0 0 0.0003 rgba(0, 0, 0, 0.8);
        }
        
        .building-3d {
          filter: drop-shadow(0 0.0002 0.0004 rgba(0, 0, 0, 0.3));
        }
        
        .map-controls {
          position: absolute;
          top: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 1000;
        }
        
        .map-btn {
          width: 48px;
          height: 48px;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #fff;
          font-size: 20px;
        }
        
        .map-btn:hover {
          background: rgba(59, 130, 246, 0.9);
          border-color: #3b82f6;
          transform: scale(1.1);
        }
        
        .map-btn.active {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-color: transparent;
        }
        
        .legend {
          position: absolute;
          bottom: 24px;
          left: 24px;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          padding: 20px;
          z-index: 1000;
          max-width: 280px;
        }
        
        .legend-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #fff;
          letter-spacing: 0.5px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          font-size: 13px;
        }
        
        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .floor-selector {
          position: absolute;
          top: 24px;
          left: 24px;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          padding: 16px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .floor-btn {
          width: 48px;
          height: 48px;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #fff;
          font-weight: 600;
          font-family: 'Space Mono', monospace;
        }
        
        .floor-btn:hover {
          background: rgba(59, 130, 246, 0.3);
          border-color: #3b82f6;
        }
        
        .floor-btn.active {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-color: transparent;
        }
      `}</style>

      <button
        className="menu-btn"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle Menu"
      >
        <div className={`hamburger ${isSidebarOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="tooltip-text">Navigate here</span>
      </button>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* Campus Navigator header removed */}
        {/* <div className="header">
          <h1>🎓 Campus Navigator</h1>
          <p>Navigate your campus with ease</p>
        </div> */}

        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search buildings..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              // Delay hide to allow click event to fire
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="search-input"
            />
            {searchTerm ? (
              <>
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
                <button
                  className="execute-search-btn"
                  onClick={() => {
                    const match = BUILDINGS.find(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
                    if (match) {
                      highlightBuilding(match);
                      setSearchTerm(match.name);
                      setShowSuggestions(false);
                    }
                  }}
                  aria-label="Go"
                >
                  🔍
                </button>
              </>
            ) : (
              <span className="search-icon">🔍</span>
            )}

            {/* Custom Search Suggestions Dropdown */}
            {showSuggestions && searchTerm && (
              <div className="search-suggestions">
                {BUILDINGS
                  .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(b => (
                    <div
                      key={b.id}
                      className="suggestion-item"
                      onClick={() => {
                        setSearchTerm(b.name);
                        highlightBuilding(b);
                        setShowSuggestions(false);
                      }}
                    >
                      <span className="suggestion-icon">{b.icon}</span>
                      <span className="suggestion-name">{b.name}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="controls">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(148, 163, 184, 0.8)' }}>
                Start Point
              </label>
              <select
                value={startPoint?.id || ''}
                onChange={(e) => {
                  if (e.target.value === 'user-location') {
                    setStartPoint({
                      id: 'user-location',
                      name: 'Your Location',
                      lat: userLocation?.lat || 0,
                      lng: userLocation?.lng || 0,
                      icon: '📍'
                    });
                    if (!userLocation) handleLocateMe();
                  } else {
                    const building = BUILDINGS.find(b => b.id === parseInt(e.target.value));
                    setStartPoint(building);
                    setSelectedBuilding(building);
                  }
                }}
                style={{
                  padding: '10px 12px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  minWidth: '150px'
                }}
              >
                <option value="">Select start point</option>
                <option value="user-location">📍 Your Location</option>
                {BUILDINGS.map(building => (
                  <option key={building.id} value={building.id}>
                    {building.icon} {building.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(148, 163, 184, 0.8)' }}>
                End Point
              </label>
              <select
                value={endPoint?.id || ''}
                onChange={(e) => {
                  const building = BUILDINGS.find(b => b.id === parseInt(e.target.value));
                  setEndPoint(building);
                  setSelectedBuilding(building);
                }}
                style={{
                  padding: '10px 12px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  minWidth: '150px'
                }}
              >
                <option value="">Select end point</option>
                {BUILDINGS.map(building => (
                  <option key={building.id} value={building.id}>
                    {building.icon} {building.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-secondary"
              onClick={clearRoute}
              style={{ alignSelf: 'flex-end' }}
            >
              Clear Route
            </button>
          </div>
        </div>

        {route && (
          <div className="route-info">
            <h3>📍 Your Route</h3>
            {(() => {
              const customPath = getCustomPath(startPoint?.id, endPoint?.id);
              return customPath ? (
                // Custom detailed path display
                <div>
                  <div className="route-step">
                    <span className="route-step-icon">🟢</span>
                    <div className="route-step-text">
                      <strong>
                        {startPoint?.name || 'Start'}
                      </strong> → Detailed Walking Path → <strong>
                        {endPoint?.name || 'Destination'}
                      </strong>
                    </div>
                  </div>
                  {/* Distance and Time Metrics */}
                  {(() => {
                    // Calculate distance in meters (approximate)
                    const R = 6371e3; // Earth radius in meters
                    let totalDistance = 0;
                    for (let i = 0; i < customPath.length - 1; i++) {
                      const p1 = customPath[i];
                      const p2 = customPath[i + 1];
                      const dLat = (p2.latitude - p1.latitude) * Math.PI / 180;
                      const dLon = (p2.longitude - p1.longitude) * Math.PI / 180;
                      const lat1 = p1.latitude * Math.PI / 180;
                      const lat2 = p2.latitude * Math.PI / 180;
                      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
                      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                      totalDistance += R * c;
                    }

                    const walkTimeMin = Math.ceil(totalDistance / 80); // ~80 meters/min walking speed

                    return (
                      <div className="route-metrics">
                        <div className="route-metric-card distance-card">
                          <div className="metric-icon">📏</div>
                          <div className="metric-value">{Math.round(totalDistance)} m</div>
                          <div className="metric-label">Distance</div>
                        </div>

                        <div className="route-metric-card time-card">
                          <div className="metric-icon">⏱️</div>
                          <div className="metric-value">{walkTimeMin} min</div>
                          <div className="metric-label">Walking Time</div>
                        </div>
                      </div>
                    );
                  })()}

                  <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    background: 'rgba(148, 163, 184, 0.1)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#cbd5e1',
                    textAlign: 'center'
                  }}>
                    Path includes {customPath.length} waypoints for precise navigation
                  </div>
                </div>
              ) : (
                // Default route display
                route && route.length > 0 ? route.map((buildingId, index) => (
                  <div key={buildingId} className="route-step">
                    <span className="route-step-icon">
                      {index === 0 ? '🟢' : index === route.length - 1 ? '🔴' : '⚪'}
                    </span>
                    <div className="route-step-text">
                      <strong>{BUILDINGS.find(b => b.id === buildingId)?.name || 'Unknown'}</strong>
                      {index < route.length - 1 && ' →'}
                    </div>
                  </div>
                )) : null
              );
            })()}
            {!navigationStarted && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setNavigationStarted(true);
                  setIsSidebarOpen(false); // Auto-collapse sidebar
                }}
                style={{ marginTop: '16px', width: '100%' }}
              >
                🚀 Start Navigation
              </button>
            )}
            {navigationStarted && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#22c55e',
                fontWeight: '600'
              }}>
                🧭 Navigation Active - Follow the bold green path!
              </div>
            )}
          </div>
        )}

        {/* BUILDINGS LIST - COMMENTED OUT
        <div className="buildings-list">
          {Object.entries(
            filteredBuildings.reduce((acc, building) => {
              if (!acc[building.type]) acc[building.type] = [];
              acc[building.type].push(building);
              return acc;
            }, {})
          ).map(([type, buildings]) => (
            <div key={type} className="building-category">
              <div className="category-title">{type}</div>
              {buildings.map(building => (
                <div
                  key={building.id}
                  className={`building-card ${selectedBuilding?.id === building.id ? 'selected' : ''
                    }`}
                  onClick={() => handleBuildingClick(building)}
                >
                  <div className="building-icon">{building.icon}</div>
                  <div className="building-info">
                    <div className="building-name">{building.name}</div>
                    <div className="building-type">{building.type}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        */}
      </div>

      <div className="map-container">
        <MapContainer
          ref={mapRef}
          center={[CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]}
          zoom={17}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          maxBounds={[
            [CAMPUS_BOUNDS.minLat, CAMPUS_BOUNDS.minLng],
            [CAMPUS_BOUNDS.maxLat, CAMPUS_BOUNDS.maxLng]
          ]}
          maxBoundsViscosity={1.0}
          minZoom={17}
          maxZoom={18}
        >
          <MapEventsHandler setFollowMode={setFollowMode} />
          {/* Satellite Tile Layer */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          // attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          />

          {/* User Location Marker */}
          {userLocation && (
            <Marker
              ref={userMarkerRef}
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                className: 'gps-pointer-marker',
                html: `<img src="${gpsPointerIcon}" style="transform: rotate(${userHeading}deg); width: 20px; height: 20px;" />`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
              zIndexOffset={1000}
              eventHandlers={{
                click: () => {
                  if (userMarkerRef.current) userMarkerRef.current.openPopup();
                }
              }}
            >
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* Building Markers */}
          {BUILDINGS.map(building => (
            <Marker
              key={building.id}
              ref={(ref) => (markerRefs.current[building.id] = ref)}
              position={[building.lat, building.lng]}
              icon={createCustomIcon(building)}
              eventHandlers={{
                click: () => handleBuildingClick(building),
              }}
            >
              <Popup>
                <div style={{ textAlign: 'center', padding: '2px' }}>
                  <h3 style={{ margin: '0', fontSize: '14px', color: building.color }}>
                    {building.icon} {building.name}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', textTransform: 'capitalize' }}>
                    {building.type}
                  </p>
                  {/* COORDINATES HIDDEN
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                    Lat: {building.lat.toFixed(6)}<br />
                    Lng: {building.lng.toFixed(6)}
                  </p>
                  */}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Route Path */}
          {route && (
            <>
              {/* Dotted Connection Line from User to Path */}
              {startPoint?.id === 'user-location' && userLocation && route && route.length > 0 && (() => {
                // Get coordinate of first point in route
                let firstPoint = null;
                const resolvedStartId = route[0];
                // Try custom path first
                const customPath = getCustomPath(resolvedStartId, endPoint?.id);
                if (customPath && customPath.length > 0) {
                  firstPoint = [customPath[0].latitude, customPath[0].longitude];
                } else {
                  // Fallback to building location (from route IDs)
                  const b = BUILDINGS.find(b => b.id === resolvedStartId);
                  if (b) firstPoint = [b.lat, b.lng];
                }

                if (firstPoint) {
                  return (
                    <Polyline
                      positions={[[userLocation.lat, userLocation.lng], firstPoint]}
                      pathOptions={{
                        color: 'white',
                        weight: 4,
                        opacity: 0.8,
                        dashArray: '10, 10'
                      }}
                    />
                  );
                }
                return null;
              })()}

              <Polyline
                positions={
                  (() => {
                    const resolvedStartId = startPoint?.id === 'user-location' && route ? route[0] : startPoint?.id;
                    const customPath = getCustomPath(resolvedStartId, endPoint?.id);

                    if (customPath) {
                      return customPath.map(point => [point.latitude, point.longitude]);
                    }
                    return getRouteCoordinates();
                  })()
                }
                pathOptions={{
                  color: navigationStarted ? '#22c55e' : '#22c55e',
                  weight: navigationStarted ? 8 : 4,
                  opacity: navigationStarted ? 1 : 0.8,
                  dashArray: navigationStarted ? null : '10, 10'
                }}
              />

              {/* Animated Direction Arrows inside the path */}
              {route && navigationStarted && (() => {
                const resolvedStartId = startPoint?.id === 'user-location' && route ? route[0] : startPoint?.id;
                let customPath = getCustomPath(resolvedStartId, endPoint?.id);

                // If using default route (non-custom), construct a basic path from coords
                if (!customPath && route.length > 0) {
                  const coords = getRouteCoordinates();
                  customPath = coords.map(c => ({ latitude: c[0], longitude: c[1] }));
                }

                if (!customPath || customPath.length < 2) return null;

                // Clone to avoid mutating original constant
                const fullPath = [...customPath];

                // Create multiple arrows spaced evenly (e.g., every 20%)
                // Add offset to make them move
                const spacing = 0.2;
                const arrowCount = Math.floor(1 / spacing);
                const arrows = [];

                for (let i = 0; i < arrowCount; i++) {
                  const fraction = (i * spacing + arrowOffset) % 1;
                  const point = getPointAtFraction(fullPath, fraction);

                  if (point) {
                    arrows.push(
                      <Marker
                        key={`anim-arrow-${i}`}
                        position={[point.latitude, point.longitude]}
                        icon={L.divIcon({
                          html: `<div style="
                            transform: rotate(${point.bearing - 90}deg); 
                            font-size: 14px; 
                            color: white; 
                            filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));
                          ">➤</div>`,
                          className: 'direction-arrow',
                          iconSize: [20, 20],
                          iconAnchor: [10, 10]
                        })}
                        zIndexOffset={100}
                      />
                    );
                  }
                }
                return arrows;
              })()}
            </>
          )}
        </MapContainer>

        <div className="map-controls">
          <div
            className="map-btn"
            title="Find My Location"
            onClick={handleLocateMe}
            style={{ marginBottom: '8px' }}
          >
            📍
          </div>

          {userLocation && (
            <div
              className={`map-btn1 ${followMode ? 'active' : ''}`}
              title={followMode ? "Follow Mode ON" : "Follow Mode OFF"}
              onClick={() => setFollowMode(!followMode)}
              style={{
                marginBottom: '8px',
                background: followMode ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : undefined,
                boxShadow: followMode ? '0 4px 12px rgba(16, 185, 129, 0.4)' : undefined
              }}
            >
              {followMode ? '🎯' : '⭕'}
            </div>
          )}

          {locationAccuracy && userLocation && (
            <div
              className="accuracy-indicator"
              style={{
                fontSize: '10px',
                background: 'rgba(15, 23, 42, 0.9)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '6px',
                marginTop: '0.5px',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                textAlign: 'center'
              }}
              title={`GPS Accuracy: ±${Math.round(locationAccuracy)}m`}
            >
              ±{Math.round(locationAccuracy)}m
            </div>
          )}

        </div>
      </div>
    </div >
  );
}

export default MapPage;
