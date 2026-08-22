import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Search,
  Crosshair,
  Store,
  Compass,
  CheckCircle2,
  PhoneCall,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";

interface Showroom {
  id: number;
  name: string;
  badge: string;
  address: string;
  city: string;
  district: string;
  phone: string;
  directCall: string;
  hours: string;
  latitude: number;
  longitude: number;
  featured?: boolean;
  services: string[];
}

const ALL_SHOWROOMS: Showroom[] = [
  {
    id: 1,
    name: "Manju Group — Colombo Flagship Store",
    badge: "Headquarters & Experience Center",
    address: "No. 234, Galle Road, Kollupitiya, Colombo 03",
    city: "Colombo",
    district: "Western Province",
    phone: "+94 11 234 5678",
    directCall: "+94112345678",
    hours: "Mon–Sat: 8:30 AM – 7:00 PM | Sun: 9:00 AM – 4:00 PM",
    latitude: 6.9034,
    longitude: 79.8524,
    featured: true,
    services: [
      "All 4 Core Brands Showcase",
      "Electric Bike Test Rides",
      "Same-Day Pickup",
      "Instant Installment Approval",
    ],
  },
  {
    id: 2,
    name: "Manju Group — Kandy City Showroom",
    badge: "Central Province Hub",
    address: "No. 45, Peradeniya Road, Kandy",
    city: "Kandy",
    district: "Central Province",
    phone: "+94 81 234 5678",
    directCall: "+94812345678",
    hours: "Mon–Sat: 8:30 AM – 6:30 PM | Sun: 9:00 AM – 3:00 PM",
    latitude: 7.2906,
    longitude: 80.6337,
    featured: true,
    services: [
      "Dew Plus 4K TVs",
      "Dew Motors E-Bikes",
      "DEW+ AC Demo Units",
      "Water Test Lab",
    ],
  },
  {
    id: 3,
    name: "Manju Group — Galle Coastal Showroom",
    badge: "Southern Province Hub",
    address: "No. 12, Wakwella Road, Galle",
    city: "Galle",
    district: "Southern Province",
    phone: "+94 91 234 5678",
    directCall: "+94912345678",
    hours: "Mon–Sat: 8:30 AM – 6:00 PM | Sun: Closed",
    latitude: 6.0535,
    longitude: 80.221,
    featured: true,
    services: [
      "Solar & AC Inverter Solutions",
      "RO Water Purification",
      "E-Bike Service Center",
    ],
  },
  {
    id: 4,
    name: "Manju Group — Kurunegala Showroom",
    badge: "North Western Hub",
    address: "No. 88, Colombo Road, Kurunegala",
    city: "Kurunegala",
    district: "North Western Province",
    phone: "+94 37 222 4567",
    directCall: "+94372224567",
    hours: "Mon–Sat: 8:30 AM – 6:30 PM",
    latitude: 7.4863,
    longitude: 80.3623,
    services: [
      "Complete Home Appliances",
      "Water Filter Installations",
      "E-Bike Showroom",
    ],
  },
  {
    id: 5,
    name: "Manju Group — Negombo Showroom",
    badge: "Airport Corridor Hub",
    address: "No. 142, Main Street, Negombo",
    city: "Negombo",
    district: "Western Province",
    phone: "+94 31 223 8900",
    directCall: "+94312238900",
    hours: "Mon–Sat: 8:30 AM – 7:00 PM",
    latitude: 7.2088,
    longitude: 79.8358,
    services: [
      "Dew Plus 4K Smart TVs",
      "Fast Delivery Hub",
      "After-Sales Service",
    ],
  },
  {
    id: 6,
    name: "Manju Group — Matara Showroom",
    badge: "Deep South Hub",
    address: "No. 56, Anagarika Dharmapala Mawatha, Matara",
    city: "Matara",
    district: "Southern Province",
    phone: "+94 41 222 6789",
    directCall: "+94412226789",
    hours: "Mon–Sat: 8:30 AM – 6:00 PM",
    latitude: 5.9496,
    longitude: 80.5469,
    services: [
      "Commercial & Domestic RO Filters",
      "Inverter AC Units",
      "Warranty Support",
    ],
  },
  {
    id: 7,
    name: "Manju Group — Gampaha Showroom",
    badge: "Industrial & Domestic Center",
    address: "No. 19, Yakkala Road, Gampaha",
    city: "Gampaha",
    district: "Western Province",
    phone: "+94 33 222 1144",
    directCall: "+94332221144",
    hours: "Mon–Sat: 8:30 AM – 6:30 PM",
    latitude: 7.0917,
    longitude: 79.9999,
    services: [
      "Dew Motors E-Bikes",
      "Smart TV Experience Zone",
      "Spare Parts Depot",
    ],
  },
  {
    id: 8,
    name: "Manju Group — Anuradhapura Showroom",
    badge: "North Central Hub",
    address: "No. 104, Main Street, Anuradhapura",
    city: "Anuradhapura",
    district: "North Central Province",
    phone: "+94 25 222 3456",
    directCall: "+94252223456",
    hours: "Mon–Sat: 8:30 AM – 6:00 PM",
    latitude: 8.3114,
    longitude: 80.4037,
    services: [
      "High-Capacity Water Filters",
      "Air Conditioners",
      "Agricultural & Commercial RO",
    ],
  },
  {
    id: 9,
    name: "Manju Group — Jaffna Showroom",
    badge: "Northern Province Hub",
    address: "No. 78, Hospital Road, Jaffna",
    city: "Jaffna",
    district: "Northern Province",
    phone: "+94 21 222 7890",
    directCall: "+94212227890",
    hours: "Mon–Sat: 8:30 AM – 6:00 PM",
    latitude: 9.6615,
    longitude: 80.0255,
    services: [
      "Full Product Range",
      "Commercial RO Water Plants",
      "Technical Assistance",
    ],
  },
];

// Haversine formula to compute accurate distance in km between two GPS coordinates
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function Locations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("All");
  const [selectedStoreId, setSelectedStoreId] = useState<number>(1);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>("");

  // Calculate distances if user location is available
  const showroomsWithDistance = useMemo(() => {
    return ALL_SHOWROOMS.map(store => {
      let distanceKm: number | null = null;
      if (userLocation) {
        distanceKm = calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          store.latitude,
          store.longitude
        );
      }
      return { ...store, distanceKm };
    });
  }, [userLocation]);

  // Filter showrooms by search query and province
  const filteredShowrooms = useMemo(() => {
    return showroomsWithDistance
      .filter(store => {
        const matchesQuery =
          searchQuery.trim() === "" ||
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.district.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesProvince =
          selectedProvince === "All" ||
          store.district.includes(selectedProvince);

        return matchesQuery && matchesProvince;
      })
      .sort((a, b) => {
        if (a.distanceKm !== null && b.distanceKm !== null) {
          return a.distanceKm - b.distanceKm;
        }
        return a.id - b.id;
      });
  }, [showroomsWithDistance, searchQuery, selectedProvince]);

  const selectedStore = useMemo(() => {
    return (
      ALL_SHOWROOMS.find(s => s.id === selectedStoreId) || ALL_SHOWROOMS[0]
    );
  }, [selectedStoreId]);

  // GPS Live Location Detection
  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationStatus("Detecting your live location...");

    navigator.geolocation.getCurrentPosition(
      position => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });
        setIsLocating(false);

        // Find closest showroom
        let closestStore = ALL_SHOWROOMS[0];
        let minDistance = Infinity;

        ALL_SHOWROOMS.forEach(store => {
          const dist = calculateDistanceKm(
            userLat,
            userLng,
            store.latitude,
            store.longitude
          );
          if (dist < minDistance) {
            minDistance = dist;
            closestStore = store;
          }
        });

        setSelectedStoreId(closestStore.id);
        setLocationStatus(
          `Nearest Store: ${closestStore.name} (${Math.round(minDistance * 10) / 10} km away)`
        );

        const mapSection = document.getElementById("master-map-container");
        mapSection?.scrollIntoView({ behavior: "smooth" });
      },
      error => {
        setIsLocating(false);
        setLocationStatus(
          "Location access denied. You can search your city below."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Google Maps dynamic live direction URL
  const getDirectionsUrl = (store: Showroom) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}&travelmode=driving`;
  };

  // Google Maps interactive embed link
  const mapEmbedUrl = useMemo(() => {
    return `https://maps.google.com/maps?q=${selectedStore.latitude},${selectedStore.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }, [selectedStore]);

  const handleSelectStore = (storeId: number) => {
    setSelectedStoreId(storeId);
    const mapSection = document.getElementById("master-map-container");
    mapSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <MainLayout>
      {/* ── Luxury Hero Section ────────────────────────────────────────── */}
      <section className="relative w-full bg-gradient-to-b from-[#001D4A] via-[#002D62] to-[#0F2D5E] text-white pt-12 pb-14 px-4 md:px-8 overflow-hidden border-b border-blue-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest text-[#60A5FA] mb-4">
              <Compass size={14} className="text-[#60A5FA]" />
              <span>Island-Wide Experience Centers</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white mb-4">
              Find a Manju Group Showroom
            </h1>
            <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
              Visit our official experience centers to test-ride Dew Motors Electric Bikes, experience Dew Plus 4K Smart TVs, demo DEW+ Inverter ACs, and test water purification solutions.
            </p>
          </div>

          {/* ── Search & Live GPS Bar ──────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow-2xl border border-white/20 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-3 text-slate-900">
            <div className="relative flex-1 w-full">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by city (e.g. Colombo, Kandy, Galle, Kurunegala, Negombo)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0052B4] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={handleUseLiveLocation}
              disabled={isLocating}
              className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-[#0052B4] to-[#003875] hover:from-[#004899] hover:to-[#002D62] text-white rounded-xl text-xs md:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-75"
            >
              <Crosshair
                size={16}
                className={`${isLocating ? "animate-spin text-amber-300" : "text-white"}`}
              />
              <span>
                {isLocating ? "Locating Nearest..." : "Use My Live Location"}
              </span>
            </button>
          </div>

          {locationStatus && (
            <div className="mt-3 text-center">
              <span className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                <CheckCircle2 size={13} className="text-emerald-400" />
                {locationStatus}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── Interactive Master Map & Showcase Section ───────────────────── */}
      <section id="master-map-container" className="bg-slate-100 py-8 px-4 md:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Quick Showroom Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-3">
            <span className="text-xs font-bold text-slate-500 shrink-0 uppercase tracking-wider pl-1">
              Select City:
            </span>
            {ALL_SHOWROOMS.map(s => {
              const isSelected = s.id === selectedStoreId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStoreId(s.id)}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#0052B4] text-white shadow-md scale-105"
                      : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  <MapPin size={12} className={isSelected ? "text-white" : "text-[#0052B4]"} />
                  <span>{s.city}</span>
                </button>
              );
            })}
          </div>

          {/* Master Map Display Card */}
          <div className="bg-white rounded-3xl p-4 md:p-6 border border-slate-200/90 shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Info Panel for Active Showroom (4 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-1 bg-blue-50 text-[#0052B4] rounded-full border border-blue-200">
                      <Sparkles size={12} />
                      {selectedStore.badge}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      ● Open Today
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-display leading-tight mb-3">
                    {selectedStore.name}
                  </h2>

                  <div className="space-y-3 text-xs md:text-sm text-slate-700 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-start gap-2.5">
                      <MapPin size={16} className="text-[#0052B4] shrink-0 mt-0.5" />
                      <span className="font-semibold text-slate-900 leading-relaxed">
                        {selectedStore.address}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock size={16} className="text-slate-500 shrink-0" />
                      <span>{selectedStore.hours}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone size={16} className="text-[#0052B4] shrink-0" />
                      <a
                        href={`tel:${selectedStore.directCall}`}
                        className="font-extrabold text-[#0052B4] hover:underline"
                      >
                        {selectedStore.phone}
                      </a>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Available In-Store Services:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStore.services.map((srv, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-blue-50/80 text-[#0052B4] font-bold px-2.5 py-1 rounded-lg border border-blue-100"
                        >
                          ✓ {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <a
                    href={getDirectionsUrl(selectedStore)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 bg-[#0052B4] hover:bg-[#003875] text-white rounded-xl text-xs md:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <Navigation size={15} />
                    <span>Navigate on Google Maps</span>
                    <ExternalLink size={13} />
                  </a>
                  <a
                    href={`tel:${selectedStore.directCall}`}
                    className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs md:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <PhoneCall size={15} className="text-[#0052B4]" />
                    <span>Call Store</span>
                  </a>
                </div>
              </div>

              {/* Right Interactive Embedded Google Map (7 cols) */}
              <div className="lg:col-span-7 h-[380px] md:h-[440px] rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
                <iframe
                  key={selectedStore.id}
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Google Map - ${selectedStore.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Island-Wide Showrooms 3-Column Directory Section ───────────── */}
      <section className="bg-slate-50 py-12 px-4 md:px-8 min-h-screen">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header & Province Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-2 mb-1.5">
                <Store size={18} className="text-[#0052B4]" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#0052B4]">
                  National Network
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-display">
                All Showrooms & Service Centers ({filteredShowrooms.length})
              </h2>
            </div>

            {/* Province Badges */}
            <div className="flex flex-wrap gap-1.5">
              {["All", "Western", "Central", "Southern", "North Western", "Northern"].map(
                prov => (
                  <button
                    key={prov}
                    onClick={() => setSelectedProvince(prov)}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedProvince === prov
                        ? "bg-[#0052B4] text-white shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    {prov}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 3-Column Balanced Responsive Grid */}
          {filteredShowrooms.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 text-slate-600 max-w-lg mx-auto shadow-sm">
              <p className="font-bold text-base mb-2">
                No showrooms found matching "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedProvince("All");
                }}
                className="mt-2 text-xs font-extrabold text-[#0052B4] hover:underline cursor-pointer"
              >
                Clear Search & View All 9 Locations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShowrooms.map(store => {
                const isSelected = store.id === selectedStoreId;
                return (
                  <div
                    key={store.id}
                    className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-lg ${
                      isSelected
                        ? "border-[#0052B4] ring-2 ring-[#0052B4]/20 border-t-[5px] border-t-[#0052B4]"
                        : "border-slate-200/90 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[11px] font-extrabold uppercase text-[#0052B4] tracking-wider block">
                          {store.badge}
                        </span>
                        {store.distanceKm !== null ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black shrink-0 border border-emerald-200">
                            {store.distanceKm} km away
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-bold uppercase">
                            Open
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-lg text-slate-900 leading-snug mb-3">
                        {store.name}
                      </h3>

                      {/* Store Details */}
                      <div className="space-y-2 mb-4 text-xs text-slate-600 font-medium">
                        <div className="flex items-start gap-2">
                          <MapPin
                            size={15}
                            className="text-[#0052B4] shrink-0 mt-0.5"
                          />
                          <span className="text-slate-800 font-semibold">{store.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400 shrink-0" />
                          <span>{store.hours}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-slate-400 shrink-0" />
                          <a
                            href={`tel:${store.directCall}`}
                            className="text-slate-800 font-bold hover:text-[#0052B4]"
                          >
                            {store.phone}
                          </a>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="flex flex-wrap gap-1.5 mb-5 pt-3 border-t border-slate-100">
                        {store.services.map((srv, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md"
                          >
                            ✓ {srv}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleSelectStore(store.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#0052B4] text-white shadow-xs"
                            : "bg-blue-50 hover:bg-[#0052B4] text-[#0052B4] hover:text-white"
                        }`}
                      >
                        <Compass size={13} />
                        <span>{isSelected ? "Active On Map" : "View On Map"}</span>
                      </button>

                      <a
                        href={getDirectionsUrl(store)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Google Maps Navigation"
                      >
                        <Navigation size={13} className="text-[#0052B4]" />
                        <span>Directions</span>
                      </a>

                      <a
                        href={`tel:${store.directCall}`}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Call Store"
                      >
                        <PhoneCall size={13} className="text-[#0052B4]" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
