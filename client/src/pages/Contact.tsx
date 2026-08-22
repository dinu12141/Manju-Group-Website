import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    },
    onError: () => toast.error("Failed to send message. Please try again."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitMutation.mutate(form);
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
                Get In Touch
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl font-bold font-display mb-4"
              style={{ color: "#0F2D5E" }}
            >
              Contact Manju Group
            </h1>
            <p className="text-gray-700 font-medium max-w-xl text-sm leading-relaxed">
              Have a question about our products? Need support? We're here to
              help. Reach out through any of the channels below.
            </p>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 5/12 — Contact info + map */}
            <div className="lg:col-span-5 space-y-3">
              {/* MapPin */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 }}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-[#0F2D5E]/20 hover:shadow-sm transition-all"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
                  style={{ backgroundColor: "#0F2D5E" }}
                >
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-0.5">
                    Head Office
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    No. 234, Galle Road, Colombo 03, Sri Lanka
                  </div>
                </div>
              </motion.div>

              {/* Phone */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-[#0F2D5E]/20 hover:shadow-sm transition-all"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
                  style={{ backgroundColor: "#0F2D5E" }}
                >
                  <Phone size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-0.5">
                    Phone
                  </div>
                  <a
                    href="tel:+94112345678"
                    className="text-sm text-gray-700 font-medium hover:text-[#0F2D5E] transition-colors"
                  >
                    +94 11 234 5678
                  </a>
                </div>
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-[#0F2D5E]/20 hover:shadow-sm transition-all"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
                  style={{ backgroundColor: "#0F2D5E" }}
                >
                  <Mail size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-0.5">
                    Email
                  </div>
                  <a
                    href="mailto:info@manjugroup.lk"
                    className="text-sm text-gray-700 font-medium hover:text-[#0F2D5E] transition-colors"
                  >
                    info@manjugroup.lk
                  </a>
                </div>
              </motion.div>

              {/* Hours */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-[#0F2D5E]/20 hover:shadow-sm transition-all"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
                  style={{ backgroundColor: "#0F2D5E" }}
                >
                  <Clock size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-0.5">
                    Business Hours
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    Mon–Fri 8:30AM–6PM | Sat 9AM–4PM | Sun Closed
                  </div>
                </div>
              </motion.div>

              {/* Google Maps */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                style={{ height: "280px" }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.80388506698!2d79.82118965!3d6.9270786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Manju Group Head Office Location"
                />
              </motion.div>
            </div>

            {/* Right 7/12 — Form card */}
            <div className="lg:col-span-7">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                    <CheckCircle size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-700 font-medium text-sm mb-6 max-w-sm">
                    We'll reply within 24 hours during business hours.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Send a Message
                  </h2>
                  <p className="text-sm text-gray-700 font-medium mb-6">
                    We'll get back to you within 24 hours.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium text-gray-700 mb-1.5 block"
                        >
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={e =>
                            setForm({ ...form, name: e.target.value })
                          }
                          placeholder="Your full name"
                          className="border-gray-200 focus:border-[#0F2D5E] h-11 rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-gray-700 mb-1.5 block"
                        >
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={e =>
                            setForm({ ...form, email: e.target.value })
                          }
                          placeholder="your@email.com"
                          className="border-gray-200 focus:border-[#0F2D5E] h-11 rounded-xl"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="phone"
                          className="text-sm font-medium text-gray-700 mb-1.5 block"
                        >
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={e =>
                            setForm({ ...form, phone: e.target.value })
                          }
                          placeholder="+94 XX XXX XXXX"
                          className="border-gray-200 focus:border-[#0F2D5E] h-11 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="subject"
                          className="text-sm font-medium text-gray-700 mb-1.5 block"
                        >
                          Subject
                        </Label>
                        <Input
                          id="subject"
                          value={form.subject}
                          onChange={e =>
                            setForm({ ...form, subject: e.target.value })
                          }
                          placeholder="How can we help?"
                          className="border-gray-200 focus:border-[#0F2D5E] h-11 rounded-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="message"
                        className="text-sm font-medium text-gray-700 mb-1.5 block"
                      >
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        value={form.message}
                        onChange={e =>
                          setForm({ ...form, message: e.target.value })
                        }
                        placeholder="Tell us how we can help you..."
                        className="border-gray-200 focus:border-[#0F2D5E] rounded-xl"
                        style={{ minHeight: "128px" }}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitMutation.isPending}
                      className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                      style={{ backgroundColor: "#0F2D5E" }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.backgroundColor = "#1a4a8a")
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.backgroundColor = "#0F2D5E")
                      }
                    >
                      <Send size={16} />
                      {submitMutation.isPending
                        ? "Sending..."
                        : "Send Message →"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
