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
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
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
      {/* Header */}
      <div className="bg-gradient-to-br from-navy to-[#1a4a8a] py-14 text-white">
        <div className="container">
          <div className="text-amber text-xs font-bold uppercase tracking-wider mb-2">Get in Touch</div>
          <h1 className="text-4xl font-bold font-display mb-3">Contact Us</h1>
          <p className="text-white/70 max-w-xl text-sm leading-relaxed">
            Have a question about our products? Need support? We're here to help. Reach out through any of the channels below.
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            {[
              { icon: <Phone size={20} />, title: "Phone", lines: ["+94 11 234 5678", "+94 77 123 4567"] },
              { icon: <Mail size={20} />, title: "Email", lines: ["info@manjugroup.lk", "support@manjugroup.lk"] },
              { icon: <MapPin size={20} />, title: "Head Office", lines: ["No. 123, Galle Road,", "Colombo 03, Sri Lanka"] },
              { icon: <Clock size={20} />, title: "Business Hours", lines: ["Mon–Fri: 8:30 AM – 6:00 PM", "Sat: 9:00 AM – 4:00 PM"] },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="w-10 h-10 rounded-lg bg-navy text-white flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">{item.title}</div>
                  {item.lines.map((line, j) => (
                    <div key={j} className="text-sm text-gray-500">{line}</div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green/10 border border-green/30 rounded-2xl p-10 text-center"
              >
                <CheckCircle size={48} className="text-green mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Message Sent!</h3>
                <p className="text-gray-600 text-sm mb-4">Thank you for contacting us. We'll get back to you within 24 hours.</p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>Send Another Message</Button>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-5">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                        className="border-gray-200 focus:border-navy"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1.5 block">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com"
                        className="border-gray-200 focus:border-navy"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1.5 block">Phone Number</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+94 XX XXX XXXX"
                        className="border-gray-200 focus:border-navy"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-sm font-medium text-gray-700 mb-1.5 block">Subject</Label>
                      <Input
                        id="subject"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder="How can we help?"
                        className="border-gray-200 focus:border-navy"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700 mb-1.5 block">Message *</Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us how we can help you..."
                      className="border-gray-200 focus:border-navy min-h-[120px]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full bg-navy hover:bg-navy-light text-white h-11 font-semibold flex items-center gap-2"
                  >
                    <Send size={16} />
                    {submitMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
