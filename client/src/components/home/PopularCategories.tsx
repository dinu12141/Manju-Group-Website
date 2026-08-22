import { Link } from "wouter";

const CATEGORIES = [
  {
    title: "Water Purifiers",
    subtitle: "Pure Health Daily !",
    bg: "bg-[#f3f4f6]", // gray
    span: "col-span-1",
    image: "/ro_water_purifier.png",
    brandId: 4,
  },
  {
    title: "Smart TVs",
    subtitle: "Crystal Clear Vision !",
    bg: "bg-[#fdf4ed]", // peach
    span: "col-span-1 md:col-span-2",
    image: "/dew_plus_55_tv.png",
    brandId: 2,
  },
  {
    title: "Electric Bikes",
    subtitle: "Eco-friendly Rides !",
    bg: "bg-[#eef8ed]", // light green
    span: "col-span-1",
    image: "/scooter_red.png",
    brandId: 1,
  },
  {
    title: "Air Conditioners",
    subtitle: "Cooling Perfection !",
    bg: "bg-[#fef8d8]", // light yellow
    span: "col-span-1 md:col-span-2",
    image: "/dew_plus_ac_1ton.png",
    brandId: 3,
  },
  {
    title: "Water Dispensers",
    subtitle: "Hot & Cold Instant !",
    bg: "bg-[#e5e7eb]", // darker gray
    span: "col-span-1",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80",
    brandId: 4,
  },
  {
    title: "Stationery & Books",
    subtitle: "Quality Education !",
    bg: "bg-[#e5f4fb]", // light blue
    span: "col-span-1",
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
    brandId: 5,
  },
];

export default function PopularCategories() {
  return (
    <section className="w-full bg-white py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-[5px] h-[32px] bg-[#0052B4] rounded-full"></div>
          <h2 className="text-[28px] font-black text-[#002D62] tracking-tight font-display">
            Popular Categories
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              href={`/products?brandId=${cat.brandId}`}
              className={`block relative rounded-xl overflow-hidden p-6 cursor-pointer hover:shadow-lg transition-shadow duration-300 h-[180px] sm:h-[220px] ${cat.bg} ${cat.span} group w-full`}
            >
              <div className="relative z-10 flex flex-col h-full">
                <span
                  className={`text-[12px] sm:text-[14px] mb-1 font-medium ${idx === 1 || idx === 3 ? "text-orange-500" : idx === 2 ? "text-green-600" : "text-gray-500"}`}
                >
                  {cat.subtitle}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-700">
                  {cat.title}
                </h3>
              </div>

              {/* Image positioned at bottom right */}
              <div className="absolute right-0 bottom-0 w-1/2 h-full p-2 flex items-end justify-end transition-transform duration-500 group-hover:scale-110">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="max-h-[80%] max-w-full object-contain rounded-md mix-blend-multiply drop-shadow-md"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
