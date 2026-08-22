import { Truck, ShieldCheck, HeadphonesIcon, CreditCard } from "lucide-react";

const SERVICES = [
  {
    icon: <Truck size={32} className="text-[#0052B4]" />,
    title: "Fast Delivery",
    desc: "Island-wide delivery available for all products.",
  },
  {
    icon: <ShieldCheck size={32} className="text-[#0052B4]" />,
    title: "Warranty Guarantee",
    desc: "100% genuine products with manufacturer warranty.",
  },
  {
    icon: <HeadphonesIcon size={32} className="text-[#0052B4]" />,
    title: "24/7 Support",
    desc: "Dedicated customer service team to help you.",
  },
  {
    icon: <CreditCard size={32} className="text-[#0052B4]" />,
    title: "Secure Payments",
    desc: "Safe and secure online payment gateways.",
  },
];

export default function ServicesSection() {
  return (
    <section className="w-full bg-[#f8f9fa] py-12 border-t border-gray-200 mt-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map((service, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                {service.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-[16px]">
                  {service.title}
                </h4>
                <p className="text-gray-500 text-[13px] leading-tight mt-1">
                  {service.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
