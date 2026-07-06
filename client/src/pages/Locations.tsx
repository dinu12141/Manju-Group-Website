import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Navigation, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function Locations() {
  const { data: locations, isLoading } = trpc.locations.list.useQuery();
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);

  const selected = locations?.find((l) => l.id === selectedLocation) ?? locations?.[0];

  const getDirectionsUrl = (loc: typeof selected) => {
    if (!loc) return "#";
    if (loc.latitude && loc.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address + ", " + loc.city + ", Sri Lanka")}`;
  };

  const getMapEmbedUrl = (loc: typeof selected) => {
    if (!loc) return "";
    if (loc.latitude && loc.longitude) {
      return `https://maps.google.com/maps?q=${loc.latitude},${loc.longitude}&z=15&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(loc.address + ", " + loc.city + ", Sri Lanka")}&z=15&output=embed`;
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-gradient-to-br from-navy to-[#1a4a8a] py-14 text-white">
        <div className="container">
          <div className="text-amber text-xs font-bold uppercase tracking-wider mb-2">Find Us</div>
          <h1 className="text-4xl font-bold font-display mb-3">Store Locations</h1>
          <p className="text-white/70 max-w-xl text-sm leading-relaxed">
            Visit any of our showrooms island-wide to experience our products firsthand. Our trained staff are ready to assist you.
          </p>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Locations List */}
          <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            ) : (
              locations?.map((loc, i) => (
                <motion.button
                  key={loc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setSelectedLocation(loc.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    (selectedLocation === loc.id || (!selectedLocation && i === 0))
                      ? "border-navy bg-navy/5 shadow-sm"
                      : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      (selectedLocation === loc.id || (!selectedLocation && i === 0)) ? "bg-navy text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      <MapPin size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-800 text-sm">{loc.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{loc.city}</div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-1">{loc.address}</div>
                      {loc.type === 'showroom' && (
                        <span className="inline-block mt-1.5 text-[10px] font-bold bg-amber/20 text-amber-700 px-2 py-0.5 rounded-full uppercase">
                          Showroom
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>

          {/* Map & Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-72 bg-gray-100">
              {selected ? (
                <iframe
                  src={getMapEmbedUrl(selected)}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map of ${selected.name}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <MapPin size={40} />
                </div>
              )}
            </div>

            {/* Location Details */}
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 font-display">{selected.name}</h2>
                    <p className="text-sm text-gray-500">{selected.city}, Sri Lanka</p>
                  </div>
                  <a
                    href={getDirectionsUrl(selected)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-light transition-colors flex-shrink-0"
                  >
                    <Navigation size={14} /> Get Directions
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex gap-3">
                    <MapPin size={16} className="text-navy mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Address</div>
                      <div className="text-sm text-gray-700">{selected.address}</div>
                      <div className="text-sm text-gray-700">{selected.city}</div>
                    </div>
                  </div>
                  {selected.phone && (
                    <div className="flex gap-3">
                      <Phone size={16} className="text-navy mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Phone</div>
                        <a href={`tel:${selected.phone}`} className="text-sm text-navy hover:underline">{selected.phone}</a>
                      </div>
                    </div>
                  )}
                  {selected.openingHours != null && (
                    <div className="flex gap-3">
                      <Clock size={16} className="text-navy mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Hours</div>
                        {typeof selected.openingHours === 'object' ? (
                          <div className="text-sm text-gray-700 space-y-0.5">
                            {Object.entries(selected.openingHours as Record<string, string>).map(([day, hours]) => (
                              <div key={day} className="flex gap-2">
                                <span className="capitalize font-medium text-gray-600 w-20">{day}:</span>
                                <span>{hours}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-700 whitespace-pre-line">{String(selected.openingHours)}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
