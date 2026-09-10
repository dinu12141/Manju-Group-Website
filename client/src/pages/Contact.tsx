import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  ShieldCheck,
  Headphones,
  Building2,
  ExternalLink,
  ChevronDown,
  Navigation,
  Sparkles,
  PhoneCall,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  useSiteContacts,
  getMapEmbedUrl,
  getDirectionsUrl,
} from "@/lib/siteSettings";
import SEO from "@/components/SEO";

export default function Contact() {
  const { contacts } = useSiteContacts();
  const mapEmbedUrl = getMapEmbedUrl(contacts);
  const directionsUrl = getDirectionsUrl(contacts);
  const cleanHotline = contacts.hotline.replace(/[^0-9+]/g, "");
  const cleanSupport = contacts.supportPhone.replace(/[^0-9+]/g, "");
  const cleanWhatsApp = contacts.whatsappNumber.replace(/[^0-9]/g, "");
  const waMessage = encodeURIComponent(
    contacts.whatsappMessage ||
      "Hello Manju Group, I would like to inquire about your products."
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Product Inquiry & Pricing",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        department: "Product Inquiry & Pricing",
        subject: "",
        message: "",
      });
      toast.success("Thank you! Your message has been sent successfully.");
    },
    onError: () =>
      toast.error(
        "Failed to send message. Please try again or call our hotline."
      ),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitMutation.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: `[${form.department}] ${form.subject || "Customer Inquiry"}`,
      message: form.message,
    });
  };

  const faqs = [
    {
      q: "How fast is island-wide delivery across Sri Lanka?",
      a: "We provide insured island-wide delivery within 24 to 48 hours for all major cities and suburban areas in Sri Lanka. Free delivery is available on selected products!",
    },
    {
      q: "How do monthly installment plans work?",
      a: "You can purchase our Dew Plus Smart TVs, Dew Motors Electric Bikes, and Manju Dew Super Water Purifiers with easy monthly installment schemes. Down payment options start from as low as Rs. 10,000 with up to 12-24 months installment plans.",
    },
    {
      q: "How do I claim warranty for electronics and appliances?",
      a: "All genuine Manju Group products come with manufacturer warranties (2-Year Full Warranty for Smart TVs with 1-to-1 replacement in the 1st year, 10-Year Compressor Warranty for DEW+ ACs). Simply contact our hotline +94 11 234 5678 or visit any of our 9 showrooms.",
    },
    {
      q: "Can I schedule a test ride for Dew Motors Electric Bikes?",
      a: "Yes! Walk into our Colombo, Kandy, Galle, Kurunegala, or Negombo showrooms or call our hotline to book a free test ride for the EM005 2400W and YW06 2000W electric bikes.",
    },
  ];

  return (
    <MainLayout>
      <SEO
        title="Contact Us & 24/7 Hotline | Showrooms & Support"
        description={`Contact Manju Group Sri Lanka. Call our hotline ${contacts.hotline} or WhatsApp ${contacts.whatsappNumber}. Visit our corporate headquarters or regional showrooms.`}
        canonical="/contact"
        image="/manju-logo-transparent.webp"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Manju Group Sri Lanka",
          telephone: contacts.hotline,
          email: contacts.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: contacts.address,
            addressLocality: "Colombo",
            addressCountry: "LK",
          },
          openingHours: contacts.openingHours,
          url: "https://manjugroup.lk/contact",
        }}
      />
      {/* ── Luxury Royal Header Section ─────────────────────────────────── */}
      <section className="relative w-full bg-gradient-to-b from-[#001D4A] via-[#002D62] to-[#0F2D5E] text-white pt-14 pb-16 px-4 md:px-8 overflow-hidden border-b border-blue-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest text-[#60A5FA] mb-4">
            <Headphones size={14} className="text-[#60A5FA]" />
            <span>24/7 Dedicated Customer Support</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white mb-4">
            Get in Touch with Manju Group
          </h1>

          <p className="text-blue-100/90 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Have questions about product specifications, installment plans,
            delivery, or warranty? Our specialist advisors are ready to assist
            you.
          </p>

          {/* Quick Connect Floating Bar (3 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-10 text-slate-900">
            {/* Phone Card */}
            <a
              href={`tel:${cleanHotline}`}
              className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/40 shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0052B4] mb-3 group-hover:bg-[#0052B4] group-hover:text-white transition-colors">
                <PhoneCall size={20} />
              </div>
              <span className="text-[11px] font-extrabold uppercase text-[#0052B4] tracking-wider block">
                General Hotline
              </span>
              <strong className="text-base font-black text-slate-900 block mt-0.5">
                {contacts.hotline}
              </strong>
              <span className="text-xs text-slate-500 font-medium">
                {contacts.openingHours}
              </span>
            </a>

            {/* WhatsApp Card */}
            <a
              href={`https://wa.me/${cleanWhatsApp}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/40 shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <MessageSquare size={20} />
              </div>
              <span className="text-[11px] font-extrabold uppercase text-emerald-600 tracking-wider block">
                WhatsApp Live Chat
              </span>
              <strong className="text-base font-black text-slate-900 block mt-0.5">
                {contacts.whatsappNumber}
              </strong>
              <span className="text-xs text-slate-500 font-medium">
                Instant Chat Assistance
              </span>
            </a>

            {/* Email Card */}
            <a
              href={`mailto:${contacts.email}`}
              className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/40 shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Mail size={20} />
              </div>
              <span className="text-[11px] font-extrabold uppercase text-amber-600 tracking-wider block">
                Official Inquiries
              </span>
              <strong className="text-base font-black text-slate-900 block mt-0.5">
                {contacts.email}
              </strong>
              <span className="text-xs text-slate-500 font-medium">
                Response within 2 hours
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Main Interactive Section (Form & Office Details) ─────────────── */}
      <section className="bg-slate-50 py-14 px-4 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Left Column: Premium Contact Form (7 cols) ─────────── */}
            <div className="lg:col-span-7">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-emerald-200 rounded-3xl p-10 text-center shadow-xl flex flex-col items-center justify-center min-h-[460px]"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-5 text-emerald-600">
                    <CheckCircle size={42} />
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 mb-2">
                    Message Delivered
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 font-display mb-3">
                    Thank You for Contacting Us!
                  </h3>
                  <p className="text-slate-600 font-medium text-sm mb-8 max-w-md leading-relaxed">
                    We have received your message. One of our dedicated product
                    specialists will contact you shortly via email or phone.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    className="bg-[#0052B4] hover:bg-[#003875] text-white px-8 py-6 rounded-xl font-extrabold text-sm shadow-md"
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 md:p-10 text-slate-900">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#0052B4]" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#0052B4]">
                      Direct Support Channel
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-display mb-2">
                    Send Us a Message
                  </h2>
                  <p className="text-sm text-slate-600 font-medium mb-8">
                    Fill out the form below and we will get back to you with
                    exact product information and pricing.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="name"
                          className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={e =>
                            setForm({ ...form, name: e.target.value })
                          }
                          placeholder="e.g. Kasun Perera"
                          className="border-slate-200 focus:border-[#0052B4] focus:ring-2 focus:ring-[#0052B4]/20 h-12 rounded-xl text-sm font-semibold text-slate-900 bg-slate-50/50"
                          required
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="email"
                          className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block"
                        >
                          Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={e =>
                            setForm({ ...form, email: e.target.value })
                          }
                          placeholder="kasun@example.com"
                          className="border-slate-200 focus:border-[#0052B4] focus:ring-2 focus:ring-[#0052B4]/20 h-12 rounded-xl text-sm font-semibold text-slate-900 bg-slate-50/50"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone & Department Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="phone"
                          className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block"
                        >
                          Contact Number
                        </Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={e =>
                            setForm({ ...form, phone: e.target.value })
                          }
                          placeholder="+94 7X XXX XXXX"
                          className="border-slate-200 focus:border-[#0052B4] focus:ring-2 focus:ring-[#0052B4]/20 h-12 rounded-xl text-sm font-semibold text-slate-900 bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="department"
                          className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block"
                        >
                          Department / Inquiry Type
                        </Label>
                        <select
                          id="department"
                          value={form.department}
                          onChange={e =>
                            setForm({ ...form, department: e.target.value })
                          }
                          className="w-full border border-slate-200 focus:border-[#0052B4] focus:ring-2 focus:ring-[#0052B4]/20 h-12 rounded-xl text-sm font-semibold text-slate-900 bg-slate-50/50 px-3 outline-none"
                        >
                          <option value="Product Inquiry & Pricing">
                            Product Inquiry & Pricing
                          </option>
                          <option value="Installment Plans & Approvals">
                            Installment Plans & Approvals
                          </option>
                          <option value="Order Status & Delivery">
                            Order Status & Delivery
                          </option>
                          <option value="After-Sales & Warranty Claim">
                            After-Sales & Warranty Claim
                          </option>
                          <option value="Dealership & Bulk Orders">
                            Dealership & Bulk Orders
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <Label
                        htmlFor="subject"
                        className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block"
                      >
                        Subject / Product Model
                      </Label>
                      <Input
                        id="subject"
                        value={form.subject}
                        onChange={e =>
                          setForm({ ...form, subject: e.target.value })
                        }
                        placeholder="e.g. Inquiring about Dew Motors EM005 Electric Bike"
                        className="border-slate-200 focus:border-[#0052B4] focus:ring-2 focus:ring-[#0052B4]/20 h-12 rounded-xl text-sm font-semibold text-slate-900 bg-slate-50/50"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <Label
                        htmlFor="message"
                        className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block"
                      >
                        Your Message <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        value={form.message}
                        onChange={e =>
                          setForm({ ...form, message: e.target.value })
                        }
                        placeholder="Please provide details about your inquiry, preferred delivery location, or required quantities..."
                        className="border-slate-200 focus:border-[#0052B4] focus:ring-2 focus:ring-[#0052B4]/20 rounded-xl text-sm font-medium text-slate-900 bg-slate-50/50 min-h-[140px]"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitMutation.isPending}
                      className="w-full py-4 rounded-xl font-extrabold text-white text-base flex items-center justify-center gap-2 transition-all duration-200 bg-gradient-to-r from-[#0052B4] to-[#003875] hover:from-[#004899] hover:to-[#002D62] shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 disabled:opacity-60 cursor-pointer"
                    >
                      <Send size={18} />
                      <span>
                        {submitMutation.isPending
                          ? "Sending Message..."
                          : "Send Message Now"}
                      </span>
                    </button>

                    <div className="flex items-center justify-center gap-4 pt-3 text-xs text-slate-500 font-semibold border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        256-bit Secure
                      </span>
                      <span>•</span>
                      <span>Fast 24-Hour Response Guarantee</span>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* ── Right Column: Head Office & Interactive Map (5 cols) ─── */}
            <div className="lg:col-span-5 space-y-6">
              {/* Head Office Info Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 md:p-8 text-slate-900">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-1 bg-blue-50 text-[#0052B4] rounded-full border border-blue-200">
                    <Building2 size={13} />
                    {contacts.locationTitle || "Corporate Headquarters"}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    {contacts.locationCity || "Colombo 03"}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 font-display mb-4">
                  Manju Group (Pvt) Ltd
                </h3>

                <div className="space-y-4 text-xs md:text-sm text-slate-700 font-medium">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <MapPin
                      size={18}
                      className="text-[#0052B4] shrink-0 mt-0.5"
                    />
                    <div>
                      <strong className="text-slate-900 block font-bold">
                        Office & Experience Center:
                      </strong>
                      <span>{contacts.address}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Clock
                      size={18}
                      className="text-[#0052B4] shrink-0 mt-0.5"
                    />
                    <div>
                      <strong className="text-slate-900 block font-bold">
                        Operational Hours:
                      </strong>
                      <span>{contacts.openingHours}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Phone
                      size={18}
                      className="text-[#0052B4] shrink-0 mt-0.5"
                    />
                    <div>
                      <strong className="text-slate-900 block font-bold">
                        Direct Lines:
                      </strong>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <a
                          href={`tel:${cleanHotline}`}
                          className="text-[#0052B4] font-extrabold hover:underline"
                        >
                          {contacts.hotline} (General)
                        </a>
                        <a
                          href={`tel:${cleanSupport}`}
                          className="text-[#0052B4] font-extrabold hover:underline"
                        >
                          {contacts.supportPhone} (Support)
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-5">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 bg-[#0052B4] hover:bg-[#003875] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Navigation size={14} />
                    <span>Get Live Directions</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Head Office Google Map Embed */}
              <div className="bg-white p-2.5 rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="w-full h-[260px] rounded-2xl overflow-hidden relative">
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${contacts.locationTitle || "Corporate Headquarters"} Map`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section (Quick Assistance) ─────────────────────────────── */}
      <section className="bg-white py-14 px-4 md:px-8 border-t border-slate-200/80">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0052B4] block mb-1">
              Common Inquiries
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-display">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-white"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-slate-900 text-sm md:text-base hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-[#0052B4] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-slate-600 text-xs md:text-sm font-medium leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
