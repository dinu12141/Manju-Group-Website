import { Link } from "wouter";
import { motion } from "framer-motion";
import { Zap, Tv, Snowflake, Droplets, BookOpen, Grid3x3 } from "lucide-react";

const CATS = [
  {
    label: "Electric Bikes",
    icon: Zap,
    img: "/scooter_silver.webp",
    href: "/products?brandId=1",
    accent: "#16A34A",
  },
  {
    label: "Smart TVs",
    icon: Tv,
    img: "/dew_plus_55_tv.webp",
    href: "/products?brandId=2",
    accent: "#2563EB",
  },
  {
    label: "Air Conditioners",
    icon: Snowflake,
    img: "/dew_plus_ac_1ton.webp",
    href: "/products?brandId=3",
    accent: "#0891B2",
  },
  {
    label: "Water Filters",
    icon: Droplets,
    img: "/ro_water_purifier.webp",
    href: "/products?brandId=4",
    accent: "#0D9488",
  },
];

export default function CategoryBanner() {
  return (
    <section className="bg-white py-5">
      <div className="container">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-3 justify-center sm:justify-start">
          <span className="w-5 h-px bg-[#C9A84C]" />
          <span className="text-[11px] font-bold text-[#C9A84C] uppercase tracking-[0.16em]">
            Shop by Category
          </span>
        </div>

        {/* Circular category row */}
        <div className="flex flex-wrap justify-center sm:justify-between gap-x-4 gap-y-4">
          {CATS.map(({ label, icon: Icon, img, href, accent }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
            >
              <Link href={href}>
                <motion.div
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col items-center gap-1.5 cursor-pointer w-16 sm:w-20"
                >
                  <div
                    className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-sm ring-2 ring-offset-2 transition-all duration-200"
                    style={{ ["--tw-ring-color" as string]: `${accent}55` }}
                  >
                    <img
                      src={img}
                      alt={label}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 rounded-full flex items-center justify-center text-white shadow-sm"
                      style={{ background: accent }}
                    >
                      <Icon size={9} />
                    </div>
                  </div>
                  <p className="text-center text-[11px] font-semibold text-gray-700 leading-tight">
                    {label}
                  </p>
                </motion.div>
              </Link>
            </motion.div>
          ))}

          {/* All Products tile */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              delay: CATS.length * 0.06,
              duration: 0.4,
              ease: "easeOut",
            }}
          >
            <Link href="/products">
              <motion.div
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-1.5 cursor-pointer w-16 sm:w-20"
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-sm ring-2 ring-offset-2"
                  style={{
                    background: "#0F2D5E",
                    ["--tw-ring-color" as string]: "#0F2D5E55",
                  }}
                >
                  <Grid3x3 size={19} className="text-white" />
                </div>
                <p className="text-center text-[11px] font-semibold text-gray-700 leading-tight">
                  All Products
                </p>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
