import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, PhoneCall } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useSiteContacts } from "@/lib/siteSettings";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "⚡ Dew Motors E-Bikes",
  "📺 Smart TV Prices",
  "❄️ Inverter AC Specs",
  "💧 RO Water Filters",
  "💳 Installment Plans",
];

export default function AIChatWidget() {
  const { contacts } = useSiteContacts();
  const cleanHotline = contacts.hotline.replace(/[^0-9+]/g, "");
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 **Hello! Welcome to Manju Group Official AI Assistant.**\n\nI can help you with exact prices, technical specifications, installment plans, and warranties for all our genuine products:\n\n• ⚡ **Dew Motors Electric Bikes**\n• 📺 **Dew Plus 4K Smart TVs**\n• ❄️ **DEW+ Inverter ACs**\n• 💧 **Manju Dew Super Water Purifiers**\n\nHow can I help you today? (Ask in **English, සිංහල, or Singlish**!)",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.ai.chat.useMutation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (customMessage?: string) => {
    const message = (customMessage || input).trim();
    if (!message || isLoading) return;

    const userMsg: Message = { role: "user", content: message };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await chatMutation.mutateAsync({
        message,
        history: messages.slice(-6),
      });
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: result.reply },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I'm having trouble connecting to the network right now. Please call our hotline directly at **${contacts.hotline}** or email **${contacts.email}**.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Hide floating chat button on Checkout page to prevent covering order details and checkout button
  if (location === "/checkout" || location.startsWith("/checkout/")) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button (Positioned above Mobile Bottom Nav: bottom-20 on mobile, bottom-6 on desktop) */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#003875] via-[#0052B4] to-[#0070F3] text-white shadow-[0_8px_25px_rgba(0,82,180,0.5)] border-2 border-white/80 flex items-center justify-center transition-all cursor-pointer ${
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        }`}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Open AI Assistant Chat"
        title="Chat with Manju Group AI Assistant"
      >
        <MessageCircle size={24} className="text-white" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
      </motion.button>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-20 right-3 left-3 sm:left-auto sm:right-6 sm:w-[380px] h-[520px] max-h-[calc(100vh-7.5rem)] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.25)] border border-slate-200 z-50 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-r from-[#003875] via-[#0052B4] to-[#003B7B] text-white shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center ring-1 ring-white/40">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
                    <span>Manju AI Assistant</span>
                    <span className="text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.2 rounded-full uppercase">
                      Live
                    </span>
                  </div>
                  <div className="text-[10px] text-blue-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    <span>Always Online • 24/7 Support</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <X size={17} />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="shrink-0 px-2.5 py-1 text-[11px] font-bold text-[#0052B4] bg-blue-50/90 hover:bg-[#0052B4] hover:text-white border border-blue-200/80 rounded-full transition-all cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50/50 overscroll-contain touch-pan-y select-text"
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
              }}
              onWheel={e => e.stopPropagation()}
              onTouchMove={e => e.stopPropagation()}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 text-xs sm:text-[13px] ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === "assistant"
                        ? "bg-[#0052B4] text-white shadow-xs"
                        : "bg-slate-700 text-white"
                    }`}
                  >
                    {msg.role === "assistant" ? <Bot size={13} /> : <User size={13} />}
                  </div>

                  <div
                    className={`p-3 rounded-2xl max-w-[82%] leading-relaxed shadow-xs ${
                      msg.role === "user"
                        ? "bg-[#0052B4] text-white rounded-br-none"
                        : "bg-white text-slate-900 border border-slate-200/80 rounded-bl-none prose prose-sm"
                    }`}
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 items-center text-xs text-slate-500">
                  <div className="w-6 h-6 rounded-full bg-[#0052B4] text-white flex items-center justify-center shrink-0">
                    <Bot size={13} />
                  </div>
                  <div className="bg-white p-2.5 rounded-2xl border border-slate-200 flex items-center gap-2 shadow-xs">
                    <Loader2 size={13} className="animate-spin text-[#0052B4]" />
                    <span className="font-medium text-slate-600">Generating expert response...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about products, prices, warranty..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0052B4] focus:ring-1 focus:ring-[#0052B4] transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#0052B4] hover:bg-[#00479e] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </form>

              <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-400">
                <span>Supports English, සිංහල &amp; Singlish</span>
                <a
                  href={`tel:${cleanHotline}`}
                  className="text-[#0052B4] font-bold hover:underline flex items-center gap-0.5"
                >
                  <PhoneCall size={10} />
                  <span>Call: {contacts.hotline}</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
