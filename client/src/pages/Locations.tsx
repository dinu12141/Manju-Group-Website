import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";

const SAMPLE_LOCATIONS = [
  {
    id: 1,
    name: "Manju Group — Colombo",
    address: "No. 234, Galle Road, Colombo 03",
    city: "Colombo",
    phone: "+94 11 234 5678",
    hours: "Mon–Fri 8:30AM–6PM, Sat 9AM–4PM",
    latitude: 6.9271,
    longitude: 79.8612,
  },
  {
    id: 2,
    name: "Manju Group — Kandy",
    address: "45, Peradeniya Road, Kandy",
    city: "Kandy",
    phone: "+94 81 234 5678",
    hours: "Mon–Fri 8:30AM–6PM, Sat 9AM–4PM",
    latitude: 7.2906,
    longitude: 80.6337,
  },
  {
    id: 3,
    name: "Manju Group — Galle",
    address: "12, Wakwella Road, Galle",
    city: "Galle",
    phone: "+94 91 234 5678",
    hours: "Mon–Fri 8:30AM–6PM, Sat 9AM–4PM",
    latitude: 6.0535,
    longitude: 80.221,
  },
];

export default function Locations() {
  const { data: locations, isLoading } = trpc.locations.list.useQuery();

  const displayLocations =
    locations && locations.length > 0 ? locations : SAMPLE_LOCATIONS;

  const getDirectionsUrl = (loc: (typeof displayLocations)[number]) => {
    if ("latitude" in loc && loc.latitude && loc.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`;
    }
    if ("address" in loc) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address + ", " + loc.city + ", Sri Lanka")}`;
    }
    return "#";
  };

  return (
    <MainLayout>
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 py-20">
        <div className="container">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span
                className="w-5 h-px"
                style={{ backgroundColor: "#C9A84C" }}
              />
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                Find Us
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl font-bold font-display mb-4"
              style={{ color: "#0F2D5E" }}
            >
              Find a Store Near You
            </h1>
            <p className="text-gray-700 font-medium max-w-xl text-sm leading-relaxed">
              Visit any of our showrooms island-wide to experience our products
              firsthand. Our trained staff are ready to assist you.
            </p>
          </div>
        </div>
      </div>

      {/* Full-width Map */}
      <section className="py-8 bg-white">
        <div className="container">
          <div
            className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 w-full"
            style={{ height: "400px" }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.80388506698!2d79.82118965!3d6.9270786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Manju Group Locations Sri Lanka"
            />
          </div>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-gold" />
              <span className="text-gold text-xs font-bold uppercase tracking-widest">
                Island-Wide
              </span>
              <span className="w-6 h-px bg-gold" />
            </div>
            <h2
              className="text-3xl font-bold font-display mb-2"
              style={{ color: "#0F2D5E" }}
            >
              Our Showrooms
            </h2>
            <p className="text-gray-700 font-medium text-sm max-w-md mx-auto">
              Across Sri Lanka, our showrooms bring premium products closer to
              you.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayLocations.map((loc, i) => (
                <motion.div
                  key={loc.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      {loc.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-full flex-shrink-0">
                      Open
                    </span>
                  </div>

                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-start gap-2.5">
                      <MapPin
                        size={14}
                        className="text-gray-600 font-medium mt-0.5 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        {loc.address}
                      </span>
                    </div>
                    {loc.phone && (
                      <div className="flex items-center gap-2.5">
                        <Phone
                          size={14}
                          className="text-gray-600 font-medium flex-shrink-0"
                        />
                        <span className="text-sm text-gray-700 font-medium">
                          {loc.phone}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <Clock
                        size={14}
                        className="text-gray-600 font-medium flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        {"hours" in loc
                          ? loc.hours
                          : "Mon–Fri 8:30AM–6PM, Sat 9AM–4PM"}
                      </span>
                    </div>
                  </div>

                  <a
                    href={getDirectionsUrl(loc)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold hover:gap-2.5 transition-all"
                    style={{ color: "#0F2D5E" }}
                  >
                    <Navigation size={14} />
                    Get Directions →
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
