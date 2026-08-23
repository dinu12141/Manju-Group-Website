import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  MapPin,
  CreditCard,
  ClipboardCheck,
  Check,
  CheckCircle2,
  ShoppingCart,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Truck,
  Building2,
  ShieldCheck,
  RotateCcw,
  Lock,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import MainLayout from "@/components/MainLayout";
import { CheckoutStepper } from "@/components/CheckoutStepper";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/data";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Schema ────────────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(9, "Valid phone number required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  district: z.string().min(2, "District is required"),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["cod", "bank_transfer", "card"]),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// ─── Constants ─────────────────────────────────────────────────────────────

const SL_DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

const STEP_FIELDS: Record<number, (keyof CheckoutFormValues)[]> = {
  0: ["firstName", "lastName", "email", "phone"],
  1: ["addressLine1", "city", "district"],
  2: ["paymentMethod"],
  3: [],
};

const STEPS = [
  {
    id: "contact",
    label: "Contact",
    description: "Your details",
    icon: <User size={16} />,
  },
  {
    id: "delivery",
    label: "Delivery",
    description: "Shipping address",
    icon: <MapPin size={16} />,
  },
  {
    id: "payment",
    label: "Payment",
    description: "How to pay",
    icon: <CreditCard size={16} />,
  },
  {
    id: "review",
    label: "Review",
    description: "Confirm order",
    icon: <ClipboardCheck size={16} />,
  },
];

// ─── Shared field styles ────────────────────────────────────────────────────

function fieldClass(hasError: boolean) {
  return `w-full h-11 px-4 rounded-xl border text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors ${
    hasError
      ? "border-red-400 bg-red-50 focus:border-red-500"
      : "border-gray-200 bg-white focus:border-[#0F2D5E]"
  }`;
}

// ─── Order summary component (reused in sidebar + review step) ─────────────

function OrderSummaryBox({ compact = false }: { compact?: boolean }) {
  const { items, total, itemCount } = useCart();
  const shippingFee = total > 10000 ? 0 : 500;
  const grandTotal = total + shippingFee;

  return (
    <div
      className={
        compact
          ? ""
          : "bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
      }
    >
      {!compact && (
        <h2 className="font-bold text-gray-900 text-lg mb-4 font-display">
          Order Summary
        </h2>
      )}

      <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1 divide-y divide-slate-100">
        {items.map(item => (
          <div
            key={item.id}
            className="flex items-center gap-3.5 py-2.5"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-white p-1 shadow-xs">
              <img
                src={
                  item.imageUrl ||
                  "/manju-logo.webp"
                }
                alt={item.productName || ""}
                className="w-full h-full object-contain"
                onError={e => {
                  (e.target as HTMLImageElement).src = "/manju-logo.webp";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-[15px] font-extrabold text-slate-900 line-clamp-2 leading-snug">
                {item.productName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                  Qty: {item.quantity}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  @ {formatPrice(Number(item.unitPrice))}
                </span>
              </div>
            </div>
            <p className="text-sm sm:text-base font-black text-[#F85606] flex-shrink-0">
              {formatPrice(Number(item.unitPrice) * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-2.5 text-sm text-slate-900">
        <div className="flex justify-between text-slate-700 font-medium">
          <span>
            Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
          </span>
          <span className="font-bold text-slate-900">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-slate-700 font-medium">
          <span>Shipping</span>
          <span
            className={
              shippingFee === 0
                ? "text-emerald-700 font-bold"
                : "font-bold text-slate-900"
            }
          >
            {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
          </span>
        </div>
        {shippingFee > 0 && (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 font-semibold">
            Add {formatPrice(10000 - total)} more for free shipping
          </div>
        )}
        <Separator className="bg-slate-200" />
        <div className="flex justify-between items-baseline pt-1">
          <span className="font-extrabold text-slate-900 text-base">Total</span>
          <span className="text-[#F85606] font-black text-2xl">
            {formatPrice(grandTotal)}
          </span>
        </div>
      </div>

      {!compact && (
        <div className="mt-5 pt-5 border-t border-slate-200 space-y-2.5 text-slate-700">
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
            <Truck size={14} className="text-[#0F2D5E]" />
            <span>Island-wide delivery — all 25 districts</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
            <ShieldCheck size={14} className="text-[#0F2D5E]" />
            <span>Genuine warranty on all products</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
            <RotateCcw size={14} className="text-[#0F2D5E]" />
            <span>7-day hassle-free returns</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function Checkout() {
  const [, navigate] = useLocation();
  const { items, total, itemCount, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingFee = total > 10000 ? 0 : 500;
  const grandTotal = total + shippingFee;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      district: "",
      postalCode: "",
      paymentMethod: "cod",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
    },
    mode: "onTouched",
  });

  const {
    register,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = form;
  const paymentMethod = watch("paymentMethod");

  // Update page title as step changes
  useEffect(() => {
    const stepNames = ["Contact", "Delivery", "Payment", "Review"];
    document.title = `Checkout — Step ${currentStep + 1} of 4: ${stepNames[currentStep]} | Manju Group`;
    return () => {
      document.title = "Manju Group";
    };
  }, [currentStep]);

  async function handleNext() {
    const fields = STEP_FIELDS[currentStep];
    const valid = await trigger(fields);
    if (!valid) return;

    setCompletedSteps(prev =>
      prev.includes(currentStep) ? prev : [...prev, currentStep]
    );
    setCurrentStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setCurrentStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleStepClick(index: number) {
    if (completedSteps.includes(index)) {
      setCurrentStep(index);
    }
  }

  const createOrderMutation = trpc.orders.create.useMutation();

  async function handlePlaceOrder() {
    setIsSubmitting(true);
    try {
      const formValues = getValues();
      const shippingAddress = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        phone: formValues.phone,
        addressLine1: formValues.addressLine1,
        addressLine2: formValues.addressLine2 || "",
        city: formValues.city,
        district: formValues.district,
        postalCode: formValues.postalCode || "",
      };

      const res = await createOrderMutation.mutateAsync({
        items: items.map(i => ({
          productId: i.productId,
          variantId: i.variantId ? Number(i.variantId) : undefined,
          productName: i.productName || "Product",
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          imageUrl: i.imageUrl || undefined,
        })),
        subtotal: total,
        shippingFee: shippingFee,
        discount: 0,
        total: grandTotal,
        paymentMethod: formValues.paymentMethod || "cod",
        shippingAddress,
        notes: `Customer Order via Website (${formValues.paymentMethod?.toUpperCase() || "COD"})`,
      });

      const num = res.orderNumber;
      setOrderNumber(num);
      await clearCart();
      setOrderPlaced(true);
      toast.success(`Order #${num} placed successfully!`);
    } catch (err: any) {
      console.error("Order placement error:", err);
      toast.error(err?.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (items.length === 0 && !orderPlaced) {
    return (
      <MainLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-[70vh] flex flex-col items-center justify-center py-24 bg-white"
        >
          <ShoppingCart
            size={48}
            className="text-gray-200 mb-4"
            strokeWidth={1.5}
          />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Add some products before checking out.
          </p>
          <Link href="/products">
            <Button className="bg-[#0F2D5E] hover:bg-[#0a2347] text-white rounded-xl h-11 px-8">
              Browse Products
            </Button>
          </Link>
        </motion.div>
      </MainLayout>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (orderPlaced) {
    const email = getValues("email");
    return (
      <MainLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-[70vh] flex flex-col items-center justify-center py-24 bg-white"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-6"
          >
            <CheckCircle2 size={48} className="text-emerald-500" />
          </motion.div>
          <h2 className="text-3xl font-black text-gray-900 font-display mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-500 text-sm mb-2 text-center max-w-sm">
            Thank you for your order.
          </p>
          {email && (
            <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">
              We'll contact you at{" "}
              <span className="font-semibold text-gray-700">{email}</span> with
              updates.
            </p>
          )}
          <div className="bg-[#0F2D5E]/5 rounded-2xl px-8 py-4 mb-8 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
              Order Number
            </p>
            <p className="text-2xl font-black text-[#0F2D5E] font-mono">
              {orderNumber}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/products">
              <Button
                variant="outline"
                className="border-[#0F2D5E] text-[#0F2D5E] hover:bg-[#0F2D5E] hover:text-white rounded-xl h-11 px-6"
              >
                Continue Shopping
              </Button>
            </Link>
            <Link href="/account">
              <Button className="bg-[#F85606] hover:bg-[#e04d00] text-white rounded-xl h-11 px-6">
                Track Order
              </Button>
            </Link>
          </div>
        </motion.div>
      </MainLayout>
    );
  }

  // ── Main checkout layout ──────────────────────────────────────────────────
  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="container">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500">
            <Link href="/" className="hover:text-[#0F2D5E] transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link
              href="/cart"
              className="hover:text-[#0F2D5E] transition-colors"
            >
              Cart
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#0F2D5E] font-medium">Checkout</span>
          </nav>
        </div>
      </div>

      {/* Page header */}
      <div className="bg-gradient-to-r from-[#0F2D5E] to-[#1a4a8a] py-8">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-black text-white font-display">
              Checkout
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              {itemCount} item{itemCount !== 1 ? "s" : ""} ·{" "}
              <Lock size={11} className="inline mb-0.5" /> Secure checkout
            </p>
          </motion.div>
        </div>
      </div>

      <div className="bg-gray-50 py-10">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — form area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stepper */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <CheckoutStepper
                  steps={STEPS}
                  currentStep={currentStep}
                  completedSteps={completedSteps}
                  onStepClick={handleStepClick}
                />
              </div>

              {/* Step panels */}
              <AnimatePresence mode="wait">
                {/* Step 0 — Contact Info */}
                {currentStep === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                  >
                    <h2 className="font-bold text-gray-900 text-base mb-5 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0F2D5E] text-white text-xs flex items-center justify-center font-black">
                        1
                      </span>
                      Contact Information
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            First Name *
                          </label>
                          <input
                            {...register("firstName")}
                            placeholder="Kasun"
                            className={fieldClass(!!errors.firstName)}
                          />
                          {errors.firstName && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors.firstName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Last Name *
                          </label>
                          <input
                            {...register("lastName")}
                            placeholder="Perera"
                            className={fieldClass(!!errors.lastName)}
                          />
                          {errors.lastName && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          {...register("email")}
                          type="email"
                          placeholder="kasun@example.com"
                          className={fieldClass(!!errors.email)}
                        />
                        {errors.email && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Phone Number *
                        </label>
                        <div className="flex gap-2">
                          <select
                            defaultValue="+94"
                            className="h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 outline-none focus:border-[#0F2D5E] flex-shrink-0"
                          >
                            <option value="+94">+94</option>
                          </select>
                          <input
                            {...register("phone")}
                            type="tel"
                            placeholder="071 234 5678"
                            className={fieldClass(!!errors.phone) + " flex-1"}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 1 — Delivery Address */}
                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                  >
                    <h2 className="font-bold text-gray-900 text-base mb-5 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0F2D5E] text-white text-xs flex items-center justify-center font-black">
                        2
                      </span>
                      Delivery Address
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Address Line 1 *
                        </label>
                        <input
                          {...register("addressLine1")}
                          placeholder="No. 42, Main Street"
                          className={fieldClass(!!errors.addressLine1)}
                        />
                        {errors.addressLine1 && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.addressLine1.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Address Line 2{" "}
                          <span className="font-normal text-gray-600 font-medium">
                            (optional)
                          </span>
                        </label>
                        <input
                          {...register("addressLine2")}
                          placeholder="Apartment, floor, etc."
                          className={fieldClass(false)}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            City *
                          </label>
                          <input
                            {...register("city")}
                            placeholder="Colombo"
                            className={fieldClass(!!errors.city)}
                          />
                          {errors.city && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors.city.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            District *
                          </label>
                          <select
                            {...register("district")}
                            className={`appearance-none ${fieldClass(!!errors.district)}`}
                          >
                            <option value="">Select district</option>
                            {SL_DISTRICTS.map(d => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                          {errors.district && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors.district.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Postal Code{" "}
                          <span className="font-normal text-gray-600 font-medium">
                            (optional)
                          </span>
                        </label>
                        <input
                          {...register("postalCode")}
                          placeholder="00100"
                          className={fieldClass(false)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2 — Payment */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                  >
                    <h2 className="font-bold text-gray-900 text-base mb-5 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0F2D5E] text-white text-xs flex items-center justify-center font-black">
                        3
                      </span>
                      Payment Method
                    </h2>
                    <div className="space-y-3">
                      {/* COD */}
                      <label
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === "cod"
                            ? "border-[#0F2D5E] bg-[#0F2D5E]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          {...register("paymentMethod")}
                          type="radio"
                          value="cod"
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === "cod"
                              ? "bg-[#0F2D5E] text-white"
                              : "bg-gray-100 text-gray-600 font-medium"
                          }`}
                        >
                          <Truck size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm font-semibold ${paymentMethod === "cod" ? "text-[#0F2D5E]" : "text-gray-700"}`}
                            >
                              Cash on Delivery
                            </p>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                              Most Popular
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 font-medium mt-0.5">
                            Pay when your order arrives
                          </p>
                        </div>
                        {paymentMethod === "cod" && (
                          <div className="w-5 h-5 rounded-full bg-[#0F2D5E] flex items-center justify-center flex-shrink-0">
                            <Check
                              size={12}
                              className="text-white"
                              strokeWidth={3}
                            />
                          </div>
                        )}
                      </label>

                      {/* Bank Transfer */}
                      <label
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === "bank_transfer"
                            ? "border-[#0F2D5E] bg-[#0F2D5E]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          {...register("paymentMethod")}
                          type="radio"
                          value="bank_transfer"
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === "bank_transfer"
                              ? "bg-[#0F2D5E] text-white"
                              : "bg-gray-100 text-gray-600 font-medium"
                          }`}
                        >
                          <Building2 size={20} />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm font-semibold ${paymentMethod === "bank_transfer" ? "text-[#0F2D5E]" : "text-gray-700"}`}
                          >
                            Direct Bank Transfer
                          </p>
                          <p className="text-xs text-gray-600 font-medium mt-0.5">
                            Transfer to our bank account
                          </p>
                        </div>
                        {paymentMethod === "bank_transfer" && (
                          <div className="w-5 h-5 rounded-full bg-[#0F2D5E] flex items-center justify-center flex-shrink-0">
                            <Check
                              size={12}
                              className="text-white"
                              strokeWidth={3}
                            />
                          </div>
                        )}
                      </label>

                      {/* Card (disabled) */}
                      <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 opacity-50 cursor-not-allowed">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 font-medium flex items-center justify-center flex-shrink-0">
                          <CreditCard size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-500">
                              Credit / Debit Card
                            </p>
                            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wide">
                              Coming Soon
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 font-medium mt-0.5">
                            Visa, Mastercard, Amex
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment info boxes */}
                    <AnimatePresence>
                      {paymentMethod === "cod" && (
                        <motion.div
                          key="cod-info"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="bg-emerald-50 rounded-xl p-4 text-xs text-emerald-800">
                            <p className="font-bold mb-1">
                              Cash on Delivery selected
                            </p>
                            <p>
                              Pay the exact amount when our delivery agent
                              arrives at your address. Please keep exact change
                              ready.
                            </p>
                          </div>
                        </motion.div>
                      )}
                      {paymentMethod === "bank_transfer" && (
                        <motion.div
                          key="bank-info"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-800 space-y-1">
                            <p className="font-bold">Bank Transfer Details</p>
                            <p>Bank: Commercial Bank of Ceylon</p>
                            <p>Account Name: Manju Group (Pvt) Ltd</p>
                            <p>Account No: 1234 5678 9012</p>
                            <p>
                              Reference: Your order number (provided after
                              placing)
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Step 3 — Review & Place Order */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Order items review */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <h2 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#0F2D5E] text-white text-xs flex items-center justify-center font-black">
                          4
                        </span>
                        Review Your Order
                      </h2>
                      <OrderSummaryBox compact />
                    </div>

                    {/* Delivery details read-only */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-3.5">
                        <h3 className="font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                          <MapPin size={17} className="text-[#0F2D5E]" />
                          Delivery Address
                        </h3>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-xs sm:text-sm text-[#F85606] hover:underline font-extrabold px-2 py-1"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-sm text-slate-800 space-y-1.5 shadow-2xs">
                        <p className="font-black text-base text-slate-900">
                          {getValues("firstName")} {getValues("lastName")}
                        </p>
                        <p className="font-medium text-slate-700">{getValues("addressLine1")}</p>
                        {getValues("addressLine2") && (
                          <p className="font-medium text-slate-700">{getValues("addressLine2")}</p>
                        )}
                        <p className="font-bold text-slate-900">
                          {getValues("city")}, {getValues("district")}{" "}
                          {getValues("postalCode")}
                        </p>
                        <div className="pt-2 border-t border-slate-200/70 text-xs sm:text-sm text-slate-700 space-y-1">
                          <p className="font-bold flex items-center gap-2 text-slate-900">
                            <span>📞 Mobile:</span>
                            <span className="font-extrabold text-slate-950">{getValues("phone")}</span>
                          </p>
                          <p className="font-semibold text-slate-600 flex items-center gap-2">
                            <span>✉️ Email:</span>
                            <span>{getValues("email")}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment method summary */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-3.5">
                        <h3 className="font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                          <CreditCard size={17} className="text-[#0F2D5E]" />
                          Payment Method
                        </h3>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-xs sm:text-sm text-[#F85606] hover:underline font-extrabold px-2 py-1"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-sm text-slate-800 flex items-center gap-3.5 shadow-2xs">
                        {paymentMethod === "cod" ? (
                          <>
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                              <Truck size={20} />
                            </div>
                            <div>
                              <p className="font-black text-sm sm:text-base text-slate-900">
                                Cash on Delivery (COD)
                              </p>
                              <p className="text-xs text-slate-500 font-medium">
                                Pay upon receiving your package at your doorstep
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                              <Building2 size={20} />
                            </div>
                            <div>
                              <p className="font-black text-sm sm:text-base text-slate-900">
                                Direct Bank Transfer
                              </p>
                              <p className="text-xs text-slate-500 font-medium">
                                Commercial Bank of Ceylon
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Place order button */}
                    <Button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="w-full bg-[#F85606] hover:bg-[#e04d00] text-white h-14 text-base font-bold flex items-center justify-center gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Placing Your Order...
                        </>
                      ) : (
                        <>
                          Place Order · {formatPrice(grandTotal)}
                          <ArrowRight size={18} />
                        </>
                      )}
                    </Button>
                    <p className="text-center text-xs text-gray-600 font-medium">
                      🔒 Secure checkout · Free returns within 7 days
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-sm text-[#0F2D5E] font-medium hover:gap-2.5 transition-all"
                  >
                    <ArrowLeft size={15} />
                    Back
                  </button>
                ) : (
                  <Link
                    href="/cart"
                    className="flex items-center gap-1.5 text-sm text-[#0F2D5E] font-medium hover:gap-2.5 transition-all"
                  >
                    <ArrowLeft size={15} />
                    Back to Cart
                  </Link>
                )}

                {currentStep < 3 && (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-[#0F2D5E] hover:bg-[#0a2347] text-white h-11 px-7 font-semibold flex items-center gap-2 rounded-xl shadow-md transition-all"
                  >
                    {currentStep === 0
                      ? "Continue to Delivery"
                      : currentStep === 1
                        ? "Continue to Payment"
                        : "Review Order"}
                    <ChevronRight size={16} />
                  </Button>
                )}
              </div>
            </div>

            {/* Right — sticky order summary */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:sticky lg:top-24 h-fit"
            >
              <OrderSummaryBox />
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
