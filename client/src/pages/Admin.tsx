import { useState, useEffect, useMemo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MapPin,
  Mail,
  Cpu,
  Bot,
  Megaphone,
  Video,
  Film,
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  RefreshCw,
  Download,
  Printer,
  Search,
  ArrowUpRight,
  ShieldCheck,
  ExternalLink,
  Phone,
  DollarSign,
  Building,
  Layers,
  Sparkles,
  Zap,
  ChevronRight,
  X,
  Save,
  RotateCcw,
  Volume2,
  Users,
  UserCircle,
  PhoneCall,
  Building2,
  MessageSquare,
  CreditCard,
  Loader2,
  Star,
  Eye,
  EyeOff,
  Check,
  Navigation,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { STATIC_PRODUCTS, STATIC_BRANDS } from "@/lib/staticData";
import { formatPrice } from "@/lib/data";
import {
  useAdSettings,
  PRESET_AD_MEDIA,
  DEFAULT_AD_CONFIG,
  type HomeAdConfig,
  type HeroSlideAd,
  type PromoBannerAd,
} from "@/lib/adSettings";
import {
  useSiteContacts,
  useSiteBankDetails,
  type SiteContacts,
  type SiteBankDetails,
  DEFAULT_CONTACTS,
  DEFAULT_BANK_DETAILS,
  getMapEmbedUrl,
  getDirectionsUrl,
  parseCoordinatesInput,
  extractEmbedUrl,
} from "@/lib/siteSettings";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { toast } from "sonner";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEO from "@/components/SEO";

type AdminTab =
  | "dashboard"
  | "products"
  | "orders"
  | "customers"
  | "users"
  | "reviews"
  | "ads"
  | "contacts_bank"
  | "showrooms"
  | "inquiries"
  | "erp"
  | "ai_audit";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

interface AdminOrderItem {
  productName: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  imageUrl: string | null;
}

interface AdminOrderShippingAddress {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  [key: string]: unknown;
}

interface AdminOrder {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string | null;
  paymentStatus: string;
  subtotal: string;
  shippingFee: string;
  discount: string | null;
  total: string;
  currency: string;
  shippingAddress: AdminOrderShippingAddress | null;
  createdAt: Date;
  updatedAt: Date;
  items: AdminOrderItem[];
  itemCount: number;
}

interface AdminProduct {
  id: number;
  slug: string;
  sku: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  brandId?: number;
  categoryId?: number;
  basePrice: string;
  salePrice: string | null;
  stockQuantity: number;
  isInStock: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew?: boolean;
  isActive: boolean;
  warrantyMonths?: number | null;
  specifications?: any;
  brandName: string | null;
  categoryName: string | null;
  category?: string | null;
  imageUrl?: string;
  createdAt: Date | string;
}

interface ProductFormState {
  id?: number;
  name: string;
  sku: string;
  brandId: number;
  categoryId: number;
  brandName?: string;
  category?: string;
  basePrice: string;
  salePrice?: string | null;
  currency?: string;
  stockQuantity: number;
  isInStock?: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isActive: boolean;
  imageUrl?: string;
  description?: string;
  shortDescription?: string;
  specifications?: any;
  warrantyMonths?: number;
}

const SHOWROOMS_DATA = [
  {
    id: 1,
    name: "Colombo Flagship Showroom",
    city: "Colombo",
    address: "No. 120, Galle Road, Colombo 03",
    phone: "011 2 60 60 50",
    manager: "Saman Jayawardena",
    hours: "8:30 AM - 7:00 PM (Daily)",
    active: true,
  },
  {
    id: 2,
    name: "Kandy Central Branch",
    city: "Kandy",
    address: "No. 45, Peradeniya Road, Kandy",
    phone: "081 2 60 60 50",
    manager: "Roshan Weerasinghe",
    hours: "9:00 AM - 6:30 PM",
    active: true,
  },
  {
    id: 3,
    name: "Kurunegala Megastore",
    city: "Kurunegala",
    address: "No. 88, Colombo Road, Kurunegala",
    phone: "037 2 60 60 50",
    manager: "Nuwan Pradeep",
    hours: "8:30 AM - 6:30 PM",
    active: true,
  },
  {
    id: 4,
    name: "Galle Coastal Showroom",
    city: "Galle",
    address: "No. 14, Main Street, Galle",
    phone: "091 2 60 60 50",
    manager: "Priyantha Silva",
    hours: "9:00 AM - 6:30 PM",
    active: true,
  },
  {
    id: 5,
    name: "Negombo Branch",
    city: "Negombo",
    address: "No. 204, Greens Road, Negombo",
    phone: "031 2 60 60 50",
    manager: "Janaka Perera",
    hours: "8:30 AM - 7:00 PM",
    active: true,
  },
];

const INQUIRIES_DATA = [
  {
    id: 101,
    name: "Mahesh Gunathilaka",
    phone: "0778899001",
    email: "mahesh@gmail.com",
    department: "Installment Schemes",
    subject: "Dew Motors E-Bike Easy Payment plan documents",
    message:
      "Can I know what documents are required for the Rs. 100,000 down payment installment plan?",
    status: "New",
    date: "2026-08-22 17:10",
  },
  {
    id: 102,
    name: "Sanduni Wickramasinghe",
    phone: "0712233445",
    email: "sanduni.w@yahoo.com",
    department: "Water Purification",
    subject: "Commercial RO Purifier for Hotel in Ella",
    message:
      "We need a 2500L commercial RO water purifier installation quotation with site visit.",
    status: "In Progress",
    date: "2026-08-22 13:40",
  },
  {
    id: 103,
    name: "Lasantha Karunaratne",
    phone: "0761122330",
    email: "lasantha@slt.lk",
    department: "Air Conditioners",
    subject: "Inverter AC 2.0 Ton Bulk Supply",
    message:
      "Need 5 units of 2.0 Ton DEW+ AC with copper piping for an office complex in Rajagiriya.",
    status: "Resolved",
    date: "2026-08-21 10:25",
  },
];

const AI_AUDIT_LOGS = [
  {
    id: 1,
    time: "2 mins ago",
    userQuery: "What is the warranty on Dew Plus 55 inch Smart TV?",
    aiResponse:
      'The Dew Plus 55" Smart TV comes with 2 Years Official Manju Group comprehensive warranty + free panel coverage and island-wide after-sales support.',
    confidence: "98%",
    category: "Product Specs",
  },
  {
    id: 2,
    time: "14 mins ago",
    userQuery: "How much is the down payment for Dew Super RO water filter?",
    aiResponse:
      "The Manju Dew Super RO Water Purifier is available with a low down payment of just Rs. 14,900 with easy monthly installments of Rs. 6,250.",
    confidence: "99%",
    category: "Pricing & Plans",
  },
  {
    id: 3,
    time: "45 mins ago",
    userQuery: "Do you deliver to Jaffna?",
    aiResponse:
      "Yes, Manju Group provides 100% Island-wide delivery across all 9 provinces including Jaffna, with Cash on Delivery and free installation for selected appliances.",
    confidence: "96%",
    category: "Logistics",
  },
];

const BRAND_COLORS: Record<string, string> = {
  "Dew Motors": "#059669",
  "Dew Plus": "#2563EB",
  "DEW+ AC": "#0284C7",
  "Manju Dew Super": "#0D9488",
};

/** Generic inline error state used across admin data tables/lists. */
function AdminQueryError({
  label,
  error,
  onRetry,
}: {
  label: string;
  error?: { message?: string } | null;
  onRetry: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <AlertTriangle size={32} className="mx-auto mb-2 text-red-400" />
      <p className="font-bold text-slate-700 text-sm">Failed to load {label}</p>
      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
        {error?.message ||
          "An unexpected error occurred while contacting the server."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg transition-all cursor-pointer"
      >
        <RefreshCw size={12} />
        Retry
      </button>
    </div>
  );
}

/** Table-row wrapped variant of AdminQueryError, for use inside <tbody>. */
function AdminQueryErrorRow({
  colSpan,
  label,
  error,
  onRetry,
}: {
  colSpan: number;
  label: string;
  error?: { message?: string } | null;
  onRetry: () => void;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <AdminQueryError label={label} error={error} onRetry={onRetry} />
      </td>
    </tr>
  );
}

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem("manju_admin_token");
    } catch {
      return false;
    }
  });
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState(false);

  const verifyPasscodeMutation = trpc.admin.verifyPasscode.useMutation();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(false);
    verifyPasscodeMutation.mutate(
      { passcode },
      {
        onSuccess: data => {
          try {
            localStorage.setItem("manju_admin_token", data.token);
          } catch {
            // localStorage unavailable
          }
          setIsAdmin(true);
          toast.success("Welcome to Manju Group Enterprise Command Center");
        },
        onError: () => {
          setAuthError(true);
          toast.error("Invalid Admin Passcode");
        },
      }
    );
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("manju_admin_token");
    } catch {
      // localStorage unavailable
    }
    setIsAdmin(false);
    toast.info("Logged out from Admin Command Center");
  };

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [orderPage, setOrderPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerPage, setCustomerPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = trpc.admin.customers.useQuery(
    { page: 1, limit: 100 },
    { enabled: isAdmin }
  );

  const utils = trpc.useUtils();

  const ordersStatusFilter =
    orderFilter === "all" ? undefined : (orderFilter as OrderStatus);

  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
    error: ordersError,
  } = trpc.admin.ordersList.useQuery(
    { page: orderPage, limit: 20, status: ordersStatusFilter },
    { enabled: isAdmin }
  );

  const ordersList: AdminOrder[] = (ordersData?.items ??
    []) as unknown as AdminOrder[];

  const updateOrderStatusMutation = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => {
      utils.admin.ordersList.invalidate();
    },
  });

  const {
    data: customersData,
    isLoading: isLoadingCustomers,
    error: customersError,
    refetch: refetchCustomers,
  } = trpc.admin.customerDirectory.useQuery(
    { page: customerPage, limit: 20, search: customerSearch || undefined },
    { enabled: isAdmin }
  );

  // Real product catalog — backed by admin.products with instant fallback
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = trpc.admin.products.useQuery(
    { page: 1, limit: 100 },
    {
      enabled: isAdmin,
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
    }
  );

  const staticAdminProducts: AdminProduct[] = useMemo(
    () =>
      STATIC_PRODUCTS.map(p => ({
        id: p.id,
        slug: p.slug,
        sku: p.sku,
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        brandId: 1,
        categoryId: p.categoryId,
        basePrice: String(p.basePrice),
        salePrice: p.salePrice ? String(p.salePrice) : null,
        stockQuantity: 15,
        isInStock: p.isInStock,
        isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller,
        isNew: p.isNew ?? false,
        isActive: true,
        warrantyMonths: p.warrantyMonths ?? 12,
        brandName: p.brandName,
        categoryName: p.category,
        category: p.category,
        imageUrl: p.imageUrl,
        createdAt: new Date(),
      })),
    []
  );

  const productsList: AdminProduct[] = useMemo(() => {
    if (productsData?.items && productsData.items.length > 0) {
      return productsData.items as unknown as AdminProduct[];
    }
    // Only fall back to the static demo catalog while the real query is
    // still loading for the first time (no cached data yet) and hasn't
    // errored. On a genuine error, show the error state instead of
    // silently masking it with fake data.
    if (!productsError && isLoadingProducts) {
      return staticAdminProducts;
    }
    return [];
  }, [productsData, productsError, isLoadingProducts, staticAdminProducts]);

  const totalGrossRevenue = useMemo(() => {
    if (ordersList && ordersList.length > 0) {
      return ordersList.reduce((sum, o) => {
        if (o.status === "cancelled" || o.status === "refunded") return sum;
        return sum + (Number(o.total) || 0);
      }, 0);
    }
    return 0;
  }, [ordersList]);

  const {
    data: brandOptions,
    error: brandOptionsError,
    refetch: refetchBrandOptions,
  } = trpc.admin.brandOptions.useQuery();
  const {
    data: categoryOptions,
    error: categoryOptionsError,
    refetch: refetchCategoryOptions,
  } = trpc.admin.categoryOptions.useQuery();

  // If token is expired or unauthorized, prompt admin to re-enter passcode
  useEffect(() => {
    const err = productsError || ordersError || usersError || customersError;
    if (err) {
      const errMsg = err.message || "";
      if (
        errMsg.includes("NOT_ADMIN") ||
        errMsg.includes("unauthorized") ||
        errMsg.includes("forbidden") ||
        err.data?.code === "FORBIDDEN" ||
        err.data?.code === "UNAUTHORIZED"
      ) {
        toast.error("Admin session expired. Please re-enter the passcode.");
        try {
          localStorage.removeItem("manju_admin_token");
        } catch {}
        setIsAdmin(false);
      }
    }
  }, [productsError, ordersError, usersError, customersError]);

  const invalidateProductQueries = () => {
    utils.admin.products.invalidate();
    utils.admin.stats.invalidate();
    utils.products.list.invalidate();
    utils.products.getFeatured.invalidate();
    refetchProducts();
  };

  const createProductMutation = trpc.admin.createProduct.useMutation({
    onSuccess: () => {
      invalidateProductQueries();
      setIsProductModalOpen(false);
      setEditingProduct(null);
    },
    onError: err => {
      toast.error(err.message || "Failed to create product");
    },
  });

  const updateProductMutation = trpc.admin.updateProduct.useMutation({
    onSuccess: () => {
      invalidateProductQueries();
      setIsProductModalOpen(false);
      setEditingProduct(null);
    },
    onError: err => {
      toast.error(err.message || "Failed to update product");
    },
  });

  const deleteProductMutation = trpc.admin.deleteProduct.useMutation({
    onSuccess: () => {
      invalidateProductQueries();
      toast.success("Product removed from catalog");
    },
    onError: err => {
      toast.error(err.message || "Failed to delete product");
    },
  });

  const toggleProductActiveMutation =
    trpc.admin.toggleProductActive.useMutation({
      onSuccess: () => {
        invalidateProductQueries();
        toast.success("Product stock/active status updated");
      },
      onError: err => {
        toast.error(err.message || "Failed to update product status");
      },
    });

  // Delete Target state for confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "user" | "customer";
    id: number | string;
    name: string;
    details?: string;
  } | null>(null);

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      utils.admin.customers.invalidate();
      utils.admin.stats.invalidate();
      setDeleteTarget(null);
      toast.success("User account deleted successfully");
    },
    onError: err => {
      toast.error(err.message || "Failed to delete user account");
    },
  });

  const deleteCustomerMutation =
    trpc.admin.deleteCustomerDirectoryEntry.useMutation({
      onSuccess: data => {
        utils.admin.customerDirectory.invalidate();
        utils.admin.ordersList.invalidate();
        utils.admin.stats.invalidate();
        setSelectedCustomer(null);
        setDeleteTarget(null);
        toast.success(
          data.message || "Customer directory entry deleted successfully"
        );
      },
      onError: err => {
        toast.error(err.message || "Failed to delete customer directory entry");
      },
    });

  // Ad Settings Hook
  const {
    config: liveAdConfig,
    updateConfig: saveAdConfig,
    resetConfig: resetAdConfig,
  } = useAdSettings();
  const [localAdConfig, setLocalAdConfig] =
    useState<HomeAdConfig>(liveAdConfig);

  useEffect(() => {
    setLocalAdConfig(liveAdConfig);
  }, [liveAdConfig]);

  // Site Contacts & Bank Details Hooks
  const {
    contacts: liveContacts,
    updateContacts: saveContacts,
    resetContacts: resetContactsSetting,
    isSaving: isSavingContacts,
  } = useSiteContacts();
  const [localContacts, setLocalContacts] =
    useState<SiteContacts>(liveContacts);

  useEffect(() => {
    setLocalContacts(liveContacts);
  }, [liveContacts]);

  const [mapQuickPaste, setMapQuickPaste] = useState("");

  const handleApplyQuickMap = (rawText: string) => {
    if (!rawText.trim()) return;
    const coords = parseCoordinatesInput(rawText);
    if (coords) {
      setLocalContacts(prev => ({
        ...prev,
        mapLatitude: coords.latitude,
        mapLongitude: coords.longitude,
        mapEmbedUrl: "",
      }));
      setMapQuickPaste("");
      toast.success(
        `Coordinates applied: ${coords.latitude}, ${coords.longitude}`
      );
      return;
    }
    const embed = extractEmbedUrl(rawText);
    if (embed) {
      setLocalContacts(prev => ({
        ...prev,
        mapEmbedUrl: embed,
      }));
      setMapQuickPaste("");
      toast.success("Google Maps Embed link detected and applied!");
      return;
    }
    toast.error(
      "Could not parse coordinates or Google Maps link. Try entering Latitude and Longitude directly."
    );
  };

  const {
    bankDetails: liveBankDetails,
    updateBankDetails: saveBankDetails,
    resetBankDetails: resetBankDetailsSetting,
    isSaving: isSavingBank,
  } = useSiteBankDetails();
  const [localBank, setLocalBank] = useState<SiteBankDetails>(liveBankDetails);

  useEffect(() => {
    setLocalBank(liveBankDetails);
  }, [liveBankDetails]);

  const handleSaveContactsAndBank = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await Promise.all([
        saveContacts(localContacts),
        saveBankDetails(localBank),
      ]);
      toast.success(
        "🏢 Hotline, Google Map & Bank Details Updated Live across website!"
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update contact/bank settings");
    }
  };

  const handleResetContactsAndBank = async () => {
    if (
      confirm("Reset contact numbers and bank transfer details to defaults?")
    ) {
      try {
        await Promise.all([resetContactsSetting(), resetBankDetailsSetting()]);
        setLocalContacts(DEFAULT_CONTACTS);
        setLocalBank(DEFAULT_BANK_DETAILS);
        toast.info("Contact numbers and bank details reset to defaults");
      } catch (err: any) {
        toast.error(err.message || "Failed to reset settings");
      }
    }
  };

  // Product Add / Edit Modal
  const [editingProduct, setEditingProduct] = useState<ProductFormState | null>(
    null
  );
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Specifications Builder State
  const [specRows, setSpecRows] = useState<{ key: string; value: string }[]>(
    []
  );

  const handleAddSpecRow = () => {
    setSpecRows(prev => [...prev, { key: "", value: "" }]);
  };

  const handleRemoveSpecRow = (idx: number) => {
    setSpecRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateSpecRow = (
    idx: number,
    field: "key" | "value",
    val: string
  ) => {
    setSpecRows(prev =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: val } : row))
    );
  };

  const handleOpenAddProduct = () => {
    setEditingProduct({
      name: "",
      sku: `MNJ-0${Math.floor(Math.random() * 4) + 1}-01-${Date.now().toString().slice(-3)}`,
      brandName: "Dew Motors",
      brandId: 1,
      category: "Electric Bikes",
      categoryId: 1,
      basePrice: "100000.00",
      salePrice: null,
      currency: "LKR",
      stockQuantity: 15,
      isInStock: true,
      isFeatured: false,
      isBestSeller: false,
      isNew: true,
      isActive: true,
      imageUrl: "/scooter_red.webp",
      description:
        "High performance Sri Lankan built equipment engineered for durability, efficiency, and reliability.",
      shortDescription: "Official Manju Group warranty, islandwide delivery.",
      warrantyMonths: 24,
    });
    setSpecRows([
      { key: "Motor / Power", value: "2000W High Efficiency Brushless" },
      { key: "Battery / Capacity", value: "72V 45Ah Lithium-ion" },
      { key: "Max Speed", value: "75 km/h" },
      { key: "Mileage / Range", value: "110 km per single charge" },
      { key: "Warranty", value: "2 Years Official Warranty" },
    ]);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: AdminProduct) => {
    let rows: { key: string; value: string }[] = [];
    if (p.specifications) {
      try {
        const parsed =
          typeof p.specifications === "string"
            ? JSON.parse(p.specifications)
            : p.specifications;
        if (parsed && typeof parsed === "object") {
          rows = Object.entries(parsed).map(([k, v]) => ({
            key: k,
            value: String(v ?? ""),
          }));
        }
      } catch (err) {
        console.error("Failed to parse specifications:", err);
      }
    }
    if (rows.length === 0) {
      rows = [
        { key: "Motor / Power", value: "" },
        { key: "Battery / Capacity", value: "" },
        {
          key: "Warranty",
          value: `${p.warrantyMonths || 12} Months Official Warranty`,
        },
      ];
    }
    setSpecRows(rows);
    setEditingProduct({
      id: p.id,
      name: p.name,
      sku: p.sku,
      brandId: p.brandId || 1,
      categoryId: p.categoryId || 1,
      brandName: p.brandName || "Dew Motors",
      category: p.categoryName || p.category || "Electric Bikes",
      basePrice: p.basePrice,
      salePrice: p.salePrice,
      stockQuantity: p.stockQuantity ?? 15,
      isInStock: p.isInStock,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isNew: p.isNew ?? false,
      isActive: p.isActive,
      imageUrl: p.imageUrl || "/scooter_red.webp",
      description: p.description || "",
      shortDescription: p.shortDescription || "",
      warrantyMonths: p.warrantyMonths ?? 12,
    });
    setIsProductModalOpen(true);
  };

  // Customer Reviews Moderation
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewPage, setReviewPage] = useState(1);
  const [editingReview, setEditingReview] = useState<{
    id: number;
    authorName: string;
    rating: number;
    title: string;
    body: string;
    isApproved: boolean;
  } | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const {
    data: adminReviewsData,
    isLoading: isLoadingReviews,
    error: reviewsError,
    refetch: refetchAdminReviews,
  } = trpc.admin.reviewsList.useQuery(
    { page: reviewPage, limit: 20, search: reviewSearch || undefined },
    { enabled: isAdmin }
  );

  // Reviews query can also surface an expired/invalid admin session.
  useEffect(() => {
    if (!reviewsError) return;
    const errMsg = reviewsError.message || "";
    if (
      errMsg.includes("NOT_ADMIN") ||
      errMsg.includes("unauthorized") ||
      errMsg.includes("forbidden") ||
      reviewsError.data?.code === "FORBIDDEN" ||
      reviewsError.data?.code === "UNAUTHORIZED"
    ) {
      toast.error("Admin session expired. Please re-enter the passcode.");
      try {
        localStorage.removeItem("manju_admin_token");
      } catch {}
      setIsAdmin(false);
    }
  }, [reviewsError]);

  const updateReviewMutation = trpc.admin.updateReview.useMutation({
    onSuccess: () => {
      utils.admin.reviewsList.invalidate();
      setIsReviewModalOpen(false);
      setEditingReview(null);
      toast.success("Customer review updated successfully");
    },
    onError: err => {
      toast.error(err.message || "Failed to update review");
    },
  });

  const deleteReviewMutation = trpc.admin.deleteReview.useMutation({
    onSuccess: () => {
      utils.admin.reviewsList.invalidate();
      toast.success("Customer review deleted successfully");
    },
    onError: err => {
      toast.error(err.message || "Failed to delete review");
    },
  });

  // Invoice / Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // ERP Sync State
  const [isSyncingERP, setIsSyncingERP] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("Just now");

  const handleTriggerERPSync = () => {
    setIsSyncingERP(true);
    setTimeout(() => {
      setIsSyncingERP(false);
      setLastSyncTime(new Date().toLocaleTimeString());
      toast.success(
        `Enterprise ERP Ledger & Inventory Synced Successfully (${productsList.length} Products, ${ordersData?.total ?? ordersList.length} Orders)`
      );
    }, 1500);
  };

  const handleExportLedgerJSON = () => {
    const totalRevenueLKR = ordersList.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0
    );
    const data = {
      exportedAt: new Date().toISOString(),
      company: "Manju Enterprises (Pvt) Ltd",
      totalRevenueLKR,
      activeProductsCount: productsList.length,
      orders: ordersList,
      showrooms: SHOWROOMS_DATA,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manju_group_erp_ledger_${Date.now()}.json`;
    a.click();
    toast.success("ERP Accounting Ledger exported as JSON");
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const specsObject: Record<string, string> = {};
    for (const row of specRows) {
      const k = row.key.trim();
      const v = row.value.trim();
      if (k) {
        specsObject[k] = v;
      }
    }

    const payload = {
      name: editingProduct.name,
      sku: editingProduct.sku,
      brandId: Number(editingProduct.brandId) || 1,
      categoryId: Number(editingProduct.categoryId) || 1,
      shortDescription: editingProduct.shortDescription || undefined,
      description: editingProduct.description || undefined,
      specifications: specsObject,
      basePrice: Number(editingProduct.basePrice),
      salePrice: editingProduct.salePrice
        ? Number(editingProduct.salePrice)
        : undefined,
      stockQuantity: Number(editingProduct.stockQuantity ?? 0),
      isFeatured: !!editingProduct.isFeatured,
      isBestSeller: !!editingProduct.isBestSeller,
      isNew: !!editingProduct.isNew,
      isActive: editingProduct.isActive ?? true,
      warrantyMonths: Number(editingProduct.warrantyMonths) || 12,
      imageUrl: editingProduct.imageUrl || undefined,
    };

    if (editingProduct.id) {
      updateProductMutation.mutate({
        productId: editingProduct.id,
        ...payload,
      });
    } else {
      createProductMutation.mutate(payload);
    }
  };

  const handleDeleteProduct = (id: number) => {
    if (
      confirm(
        "Are you sure you want to remove this product from the live catalog?"
      )
    ) {
      deleteProductMutation.mutate({ productId: id });
    }
  };

  const handleUpdateOrderStatus = (orderId: number, newStatus: OrderStatus) => {
    updateOrderStatusMutation.mutate(
      { orderId, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Order status updated to ${newStatus.toUpperCase()}`);
        },
        onError: err => {
          toast.error(err.message || "Failed to update order status");
        },
      }
    );
  };

  const handleSaveAds = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveAdConfig(localAdConfig);
    toast.success("📢 Home Page Ads & Hero Video Updated Live!");
  };

  const handleResetAds = () => {
    if (confirm("Reset all Home Page banners and Hero video ads to default?")) {
      resetAdConfig();
      setLocalAdConfig(DEFAULT_AD_CONFIG);
      toast.info("Banner and video ads reset to default configurations");
    }
  };

  // Filtered Products
  const filteredProducts = productsList.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (p.name || "").toLowerCase().includes(term) ||
      (p.sku || "").toLowerCase().includes(term) ||
      (p.brandName || "").toLowerCase().includes(term) ||
      (p.categoryName || p.category || "").toLowerCase().includes(term);
    const matchesBrand = brandFilter === "all" || p.brandName === brandFilter;
    const catName = p.categoryName || p.category || "";
    const matchesCategory =
      categoryFilter === "all" ||
      catName.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesBrand && matchesCategory;
  });

  // Server already applies status filtering for ordersList
  const filteredOrders = ordersList;

  // ── AUTH GATE: PASSCODE LOGIN ────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#001433] via-[#00224D] to-[#0A2E5C] flex items-center justify-center p-4">
        <SEO title="Admin Login | Command Center" noindex />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#0052B4] border-2 border-white/80 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(0,82,180,0.4)]">
              <img
                src="/manju-logo.webp"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-2xl font-black font-display tracking-tight text-[#001A3D]">
              MANJU GROUP
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#C9A84C] font-bold mt-1">
              Enterprise Command Center
            </p>
            <p className="text-xs text-slate-500 mt-3">
              Enter the admin passcode to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={passcode}
              onChange={e => {
                setPasscode(e.target.value);
                setAuthError(false);
              }}
              placeholder="Admin passcode"
              autoFocus
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                authError
                  ? "border-red-300 focus:ring-red-200"
                  : "border-slate-200 focus:ring-[#0052B4]/30"
              }`}
            />
            {authError && (
              <p className="text-xs text-red-600 font-semibold">
                Invalid passcode. Please try again.
              </p>
            )}
            <button
              type="submit"
              disabled={verifyPasscodeMutation.isPending}
              className="w-full py-3 rounded-xl bg-[#0052B4] hover:bg-blue-700 text-white text-sm font-bold shadow-md disabled:opacity-60 cursor-pointer"
            >
              {verifyPasscodeMutation.isPending
                ? "Verifying…"
                : "Access Dashboard"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link href="/">
              <span className="text-xs text-slate-500 hover:text-[#0052B4] transition-colors cursor-pointer inline-flex items-center gap-1">
                ← Return to Public Website
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── MAIN ENTERPRISE DASHBOARD ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 flex flex-col">
      <SEO title="Enterprise Command Center" noindex />
      {/* ── TOP EXECUTIVE APPBAR ─────────────────────────────────────────── */}
      <header className="bg-[#001A3D] text-white border-b border-blue-900/60 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0052B4] border border-white/80 flex items-center justify-center shadow-md">
              <img
                src="/manju-logo.webp"
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-lg tracking-tight">
                  MANJU GROUP
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[#C9A84C] text-[10px] font-black uppercase">
                  ERP Control Center
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80 font-medium">
                Pioneering Manufacturing & Retail Command Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Sync Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ERP & Database: Connected</span>
            </div>

            <button
              onClick={handleTriggerERPSync}
              disabled={isSyncingERP}
              className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Manual ERP Sync"
            >
              <RefreshCw
                size={13}
                className={isSyncingERP ? "animate-spin" : ""}
              />
              <span className="hidden md:inline">
                {isSyncingERP ? "Syncing..." : "Sync ERP"}
              </span>
            </button>

            <Link href="/" target="_blank">
              <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer">
                <span>View Live Site</span>
                <ExternalLink size={13} />
              </button>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold transition-all cursor-pointer"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT NAVIGATION SIDEBAR (3 COLS) ────────────────────────────── */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-1">
            {[
              {
                id: "dashboard",
                label: "Executive Dashboard",
                icon: LayoutDashboard,
              },
              {
                id: "products",
                label: "Products & Inventory",
                icon: Package,
                badge: productsData?.total ?? productsList.length,
              },
              {
                id: "orders",
                label: "Orders & Fulfillment",
                icon: ShoppingCart,
                badge: ordersData?.total ?? ordersList.length,
              },
              {
                id: "customers",
                label: "Customers",
                icon: UserCircle,
                badge: customersData?.total ?? 0,
              },
              {
                id: "users",
                label: "Users & Customers",
                icon: Users,
                badge: usersData?.total || 0,
              },
              {
                id: "reviews",
                label: "Customer Reviews",
                icon: Star,
                badge: adminReviewsData?.total ?? 0,
              },
              {
                id: "ads",
                label: "Banner & Video Ads",
                icon: Megaphone,
                badge: "Hero+Home",
              },
              {
                id: "contacts_bank",
                label: "Hotlines, Map & Bank",
                icon: PhoneCall,
                badge: "Live",
              },
              {
                id: "showrooms",
                label: "Showroom Network",
                icon: MapPin,
                badge: SHOWROOMS_DATA.length,
              },
              {
                id: "inquiries",
                label: "Inquiries & Leads CRM",
                icon: Mail,
                badge: INQUIRIES_DATA.length,
              },
              { id: "erp", label: "ERP Integration Gateway", icon: Cpu },
              { id: "ai_audit", label: "AI Assistant Audit Log", icon: Bot },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0052B4] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Business Card */}
          <div className="bg-gradient-to-br from-[#001D4A] to-[#003882] rounded-2xl p-4 text-white border border-blue-900 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-[#C9A84C]">
              <ShieldCheck size={16} />
              <span className="text-xs font-black uppercase tracking-wider">
                Enterprise Status
              </span>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed font-medium">
              4 Flagship brands synchronized across 9 island-wide showrooms with
              real-time TiDB database persistence.
            </p>
            <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-blue-200">
              <span>ERP Sync:</span>
              <span className="font-bold text-white">{lastSyncTime}</span>
            </div>
          </div>
        </aside>

        {/* ── RIGHT CONTENT CANVAS (9 COLS) ───────────────────────────────── */}
        <main className="lg:col-span-9 space-y-6">
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {(ordersError || productsError) && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      size={18}
                      className="text-red-500 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-black text-red-700">
                        Dashboard figures may be incomplete
                      </p>
                      <p className="text-xs text-red-600 mt-0.5">
                        {ordersError && productsError
                          ? "Failed to load orders and products data."
                          : ordersError
                            ? `Failed to load orders data — ${ordersError.message || "unknown error"}.`
                            : `Failed to load products data — ${productsError?.message || "unknown error"}.`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (ordersError) refetchOrders();
                      if (productsError) refetchProducts();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-lg transition-all cursor-pointer shrink-0"
                  >
                    <RefreshCw size={12} />
                    Retry
                  </button>
                </div>
              )}

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-bold uppercase">
                      Gross Revenue
                    </span>
                    <DollarSign size={16} className="text-emerald-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    {formatPrice(totalGrossRevenue)}
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold mt-1 block">
                    {totalGrossRevenue === 0
                      ? "Rs. 0.00 (No sales yet)"
                      : `${ordersList.length} lifetime orders`}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-bold uppercase">
                      Active Orders
                    </span>
                    <ShoppingCart size={16} className="text-blue-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    {ordersData?.total ?? ordersList.length} Orders
                  </div>
                  <span className="text-[11px] text-blue-600 font-bold mt-1 block">
                    {ordersList.filter(o => o.status === "pending").length}{" "}
                    Pending Dispatch
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-bold uppercase">
                      Catalog Stock
                    </span>
                    <Package size={16} className="text-purple-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    {productsData?.total ?? productsList.length} Items
                  </div>
                  <span className="text-[11px] text-purple-600 font-bold mt-1 block">
                    4 Brands Synchronized
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-bold uppercase">
                      Showrooms
                    </span>
                    <Building size={16} className="text-amber-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    9 Branches
                  </div>
                  <span className="text-[11px] text-amber-600 font-bold mt-1 block">
                    100% Island-wide
                  </span>
                </div>
              </div>

              {/* Interactive Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center justify-between">
                    <span>Revenue Velocity (Last 7 Days)</span>
                    <span className="text-xs text-blue-600 font-bold">
                      LKR (Millions)
                    </span>
                  </h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { day: "Mon", revenue: 2.1 },
                          { day: "Tue", revenue: 2.8 },
                          { day: "Wed", revenue: 1.95 },
                          { day: "Thu", revenue: 3.4 },
                          { day: "Fri", revenue: 4.1 },
                          { day: "Sat", revenue: 2.9 },
                          { day: "Sun", revenue: 1.2 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#0052B4"
                          fill="#0052B4"
                          fillOpacity={0.15}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center justify-between">
                    <span>Brand Revenue Share</span>
                    <span className="text-xs text-slate-500 font-bold">
                      4 Divisions
                    </span>
                  </h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "Dew Motors", rev: 8.4 },
                          { name: "Dew Plus", rev: 5.2 },
                          { name: "DEW+ AC", rev: 3.1 },
                          { name: "Dew Super", rev: 1.75 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip />
                        <Bar
                          dataKey="rev"
                          fill="#0052B4"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Recent Customer Orders
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live order fulfillment stream
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-bold text-[#0052B4] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Orders</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-black">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ordersList.slice(0, 4).map(o => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-blue-900">
                            {o.id}
                          </td>
                          <td className="p-3">
                            <span className="font-bold block text-slate-800">
                              {o.shippingAddress
                                ? `${o.shippingAddress.firstName || ""} ${o.shippingAddress.lastName || ""}`.trim() ||
                                  "Guest"
                                : "Guest"}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {o.shippingAddress?.city}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-600">
                            {o.items[0]?.productName}
                          </td>
                          <td className="p-3 font-black text-slate-900">
                            {formatPrice(Number(o.total))}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                o.status === "delivered"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : o.status === "processing"
                                    ? "bg-blue-100 text-blue-700"
                                    : o.status === "shipped"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] cursor-pointer"
                            >
                              Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS & INVENTORY CONTROL */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                  <div className="relative flex-1">
                    <Search
                      size={15}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search SKU or product title..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={brandFilter}
                    onChange={e => setBrandFilter(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
                  >
                    <option value="all">
                      All Brands ({productsList.length})
                    </option>
                    {(brandOptions && brandOptions.length > 0
                      ? brandOptions
                      : STATIC_BRANDS
                    ).map(b => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
                  >
                    <option value="all">All Categories</option>
                    {(categoryOptions && categoryOptions.length > 0
                      ? categoryOptions
                      : [
                          { id: 1, name: "Electric Bikes" },
                          { id: 2, name: "Smart TVs" },
                          { id: 3, name: "Air Conditioners" },
                          { id: 4, name: "Water Purifiers" },
                        ]
                    ).map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {(brandOptionsError || categoryOptionsError) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (brandOptionsError) refetchBrandOptions();
                        if (categoryOptionsError) refetchCategoryOptions();
                      }}
                      title={
                        brandOptionsError?.message ||
                        categoryOptionsError?.message ||
                        "Failed to load filter options"
                      }
                      className="flex items-center gap-1 px-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <AlertTriangle size={12} />
                      Filters failed to load — Retry
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => invalidateProductQueries()}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
                    title="Refresh Product Catalog"
                  >
                    <RefreshCw
                      size={14}
                      className={isLoadingProducts ? "animate-spin" : ""}
                    />
                  </button>
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2.5 bg-[#0052B4] hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus size={15} />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Product Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-black uppercase">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">Brand & Category</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoadingProducts && !productsData ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-12 text-center text-slate-400"
                          >
                            <Loader2
                              size={32}
                              className="mx-auto mb-2 text-[#0052B4] animate-spin"
                            />
                            <p className="font-bold text-slate-700 text-sm">
                              Loading inventory catalog…
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Connecting to live database
                            </p>
                          </td>
                        </tr>
                      ) : productsError ? (
                        <AdminQueryErrorRow
                          colSpan={6}
                          label="the product catalog"
                          error={productsError}
                          onRetry={() => refetchProducts()}
                        />
                      ) : filteredProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-8 text-center text-slate-400"
                          >
                            <Package
                              size={36}
                              className="mx-auto mb-2 text-slate-300"
                            />
                            <p className="font-bold text-slate-600">
                              No products match your filter criteria
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Try resetting the search keyword, brand, or
                              category filter.
                            </p>
                            <button
                              onClick={() => {
                                setSearchTerm("");
                                setBrandFilter("all");
                                setCategoryFilter("all");
                              }}
                              className="mt-3 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0052B4] font-bold text-xs rounded-lg transition-all cursor-pointer"
                            >
                              Clear All Filters
                            </button>
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-10 h-10 rounded-lg object-contain bg-slate-100 p-1 border border-slate-200"
                                />
                                <div>
                                  <strong className="font-bold text-slate-900 block">
                                    {p.name}
                                  </strong>
                                  <span className="text-[10px] text-slate-500">
                                    {p.warrantyMonths} Months Warranty
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                                style={{
                                  backgroundColor:
                                    (p.brandName &&
                                      BRAND_COLORS[p.brandName]) ||
                                    "#0052B4",
                                }}
                              >
                                {p.brandName || "Manju Group"}
                              </span>
                              <span className="text-[10px] text-slate-500 block mt-0.5">
                                {p.categoryName || p.category || "General"}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-600">
                              {p.sku}
                            </td>
                            <td className="p-3 font-black text-slate-900">
                              {formatPrice(p.basePrice)}
                            </td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleProductActiveMutation.mutate({
                                    productId: p.id,
                                    isActive: !(p.isActive && p.isInStock),
                                  })
                                }
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5 ${
                                  p.isActive && p.isInStock
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                }`}
                                title="Click to toggle Active / Stock status in live catalog"
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    p.isActive && p.isInStock
                                      ? "bg-emerald-600"
                                      : "bg-red-600"
                                  }`}
                                />
                                <span>
                                  {p.isActive && p.isInStock
                                    ? "In Stock / Active"
                                    : "Out of Stock / Inactive"}
                                </span>
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS & FULFILLMENT */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {["all", "pending", "processing", "shipped", "delivered"].map(
                    s => (
                      <button
                        key={s}
                        onClick={() => setOrderFilter(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                          orderFilter === s
                            ? "bg-[#0052B4] text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {s}
                      </button>
                    )
                  )}
                </div>

                <span className="text-xs text-slate-500 font-bold">
                  {ordersData?.total ?? filteredOrders.length} Orders Listed
                </span>
              </div>

              {isLoadingOrders && !ordersData ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-400">
                  <Loader2
                    size={32}
                    className="mx-auto mb-2 text-[#0052B4] animate-spin"
                  />
                  <p className="font-bold text-slate-700 text-sm">
                    Loading orders…
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Connecting to live database
                  </p>
                </div>
              ) : ordersError ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <AdminQueryError
                    label="orders"
                    error={ordersError}
                    onRetry={() => refetchOrders()}
                  />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-400">
                  <ShoppingCart
                    size={36}
                    className="mx-auto mb-2 text-slate-300"
                  />
                  <p className="font-bold text-slate-600">No orders found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredOrders.map(order => (
                    <div
                      key={order.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-[#0052B4]">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black uppercase">
                            {order.paymentMethod}
                          </span>
                        </div>

                        <div className="text-sm font-black text-slate-900">
                          {order.shippingAddress
                            ? `${order.shippingAddress.firstName || ""} ${order.shippingAddress.lastName || ""}`.trim() ||
                              "Guest"
                            : "Guest"}{" "}
                          -{" "}
                          <span className="text-slate-600 font-semibold">
                            {order.shippingAddress?.phone}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {[
                            order.shippingAddress?.addressLine1,
                            order.shippingAddress?.city,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>

                        <div className="pt-2 text-xs font-medium text-slate-700">
                          {order.items.map((it, idx) => (
                            <span key={idx} className="mr-3">
                              • {it.quantity}x {it.productName} (
                              {formatPrice(Number(it.unitPrice))})
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">
                            Total Amount
                          </span>
                          <span className="text-lg font-black text-slate-900">
                            {formatPrice(Number(order.total))}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={e =>
                              handleUpdateOrderStatus(
                                order.id,
                                e.target.value as AdminOrder["status"]
                              )
                            }
                            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1 bg-[#0052B4] hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                          >
                            <Printer size={13} />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BANNER & VIDEO ADS MANAGER */}
          {activeTab === "ads" && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Megaphone className="text-[#0052B4]" size={20} />
                    <span>Home Page Banner & Video Ads Manager</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize Hero video, promotional badges, flash sale deals,
                    and dual banners in real-time.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetAds}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAds}
                    className="px-5 py-2 rounded-xl bg-[#0052B4] hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105"
                  >
                    <Save size={14} />
                    <span>Save & Publish Live</span>
                  </button>
                </div>
              </div>

              {/* SECTION 1: HERO MAIN VIDEO AD */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Video className="text-[#0052B4]" size={18} />
                    <h4 className="font-extrabold text-sm text-slate-900">
                      1. Hero Main Video / Showcase Ad (Left Canvas)
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                    Hero 75% Width
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <MediaUploader
                      label="Upload Video / Image Media (Auto-Compressed)"
                      currentUrl={localAdConfig.heroVideo.videoUrl}
                      accept="both"
                      recommendedDimensions="16:9 (1280x720 HD recommended)"
                      onUploaded={url =>
                        setLocalAdConfig({
                          ...localAdConfig,
                          heroVideo: {
                            ...localAdConfig.heroVideo,
                            videoUrl: url,
                          },
                        })
                      }
                    />

                    <div className="pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                        Preset Media:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_AD_MEDIA.map((m, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setLocalAdConfig({
                                ...localAdConfig,
                                heroVideo: {
                                  ...localAdConfig.heroVideo,
                                  videoUrl: m.path,
                                },
                              })
                            }
                            className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 rounded-md cursor-pointer transition-colors"
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Badge Text
                        </label>
                        <input
                          type="text"
                          value={localAdConfig.heroVideo.badge}
                          onChange={e =>
                            setLocalAdConfig({
                              ...localAdConfig,
                              heroVideo: {
                                ...localAdConfig.heroVideo,
                                badge: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Action Link URL
                        </label>
                        <input
                          type="text"
                          value={localAdConfig.heroVideo.linkUrl}
                          onChange={e =>
                            setLocalAdConfig({
                              ...localAdConfig,
                              heroVideo: {
                                ...localAdConfig.heroVideo,
                                linkUrl: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Main Headline
                      </label>
                      <input
                        type="text"
                        value={localAdConfig.heroVideo.title}
                        onChange={e =>
                          setLocalAdConfig({
                            ...localAdConfig,
                            heroVideo: {
                              ...localAdConfig.heroVideo,
                              title: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Subtitle / Description
                      </label>
                      <textarea
                        rows={2}
                        value={localAdConfig.heroVideo.subtitle}
                        onChange={e =>
                          setLocalAdConfig({
                            ...localAdConfig,
                            heroVideo: {
                              ...localAdConfig.heroVideo,
                              subtitle: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                      />
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Volume2 size={16} className="text-emerald-700" />
                        <div>
                          <span className="text-xs font-bold text-emerald-900 block">
                            Video Audio / Sound Output
                          </span>
                          <span className="text-[10px] text-emerald-700">
                            Allow visitors to hear audio and interact with sound
                            controls
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={localAdConfig.heroVideo.enableSound ?? true}
                        onChange={e =>
                          setLocalAdConfig({
                            ...localAdConfig,
                            heroVideo: {
                              ...localAdConfig.heroVideo,
                              enableSound: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Preview Canvas */}
                  <div className="rounded-2xl bg-gray-950 p-4 text-white relative overflow-hidden flex flex-col justify-end min-h-[220px] border border-slate-800">
                    {localAdConfig.heroVideo.videoUrl.endsWith(".mp4") ? (
                      <video
                        src={localAdConfig.heroVideo.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                      />
                    ) : (
                      <img
                        src={localAdConfig.heroVideo.videoUrl}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                    <div className="relative z-10 space-y-1">
                      <span className="px-2 py-0.5 rounded-full bg-[#0052B4] text-[9px] font-black uppercase text-blue-100">
                        {localAdConfig.heroVideo.badge}
                      </span>
                      <h4 className="text-base font-extrabold">
                        {localAdConfig.heroVideo.title}
                      </h4>
                      <p className="text-[11px] text-slate-300 line-clamp-2">
                        {localAdConfig.heroVideo.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: HERO TOP-RIGHT FLASH SALE AD */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="text-red-500" size={18} />
                    <h4 className="font-extrabold text-sm text-slate-900">
                      2. Hero Top-Right Flash Sale Ad Banner
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-bold text-[10px]">
                    Top Right Card
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Badge Text
                        </label>
                        <input
                          type="text"
                          value={localAdConfig.heroFlashSale.badge}
                          onChange={e =>
                            setLocalAdConfig({
                              ...localAdConfig,
                              heroFlashSale: {
                                ...localAdConfig.heroFlashSale,
                                badge: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Target Link URL
                        </label>
                        <input
                          type="text"
                          value={localAdConfig.heroFlashSale.linkUrl}
                          onChange={e =>
                            setLocalAdConfig({
                              ...localAdConfig,
                              heroFlashSale: {
                                ...localAdConfig.heroFlashSale,
                                linkUrl: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Product Title
                      </label>
                      <input
                        type="text"
                        value={localAdConfig.heroFlashSale.title}
                        onChange={e =>
                          setLocalAdConfig({
                            ...localAdConfig,
                            heroFlashSale: {
                              ...localAdConfig.heroFlashSale,
                              title: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Offer Price (LKR)
                        </label>
                        <input
                          type="text"
                          value={localAdConfig.heroFlashSale.price}
                          onChange={e =>
                            setLocalAdConfig({
                              ...localAdConfig,
                              heroFlashSale: {
                                ...localAdConfig.heroFlashSale,
                                price: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-black text-red-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Original Price (LKR)
                        </label>
                        <input
                          type="text"
                          value={
                            localAdConfig.heroFlashSale.originalPrice || ""
                          }
                          onChange={e =>
                            setLocalAdConfig({
                              ...localAdConfig,
                              heroFlashSale: {
                                ...localAdConfig.heroFlashSale,
                                originalPrice: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                        />
                      </div>
                    </div>

                    <MediaUploader
                      label="Upload Flash Sale Banner Image (Auto-WebP)"
                      currentUrl={localAdConfig.heroFlashSale.imageUrl}
                      accept="image"
                      recommendedDimensions="600x400 / 4:3 card"
                      onUploaded={url =>
                        setLocalAdConfig({
                          ...localAdConfig,
                          heroFlashSale: {
                            ...localAdConfig.heroFlashSale,
                            imageUrl: url,
                          },
                        })
                      }
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {PRESET_AD_MEDIA.filter(m => m.type === "image").map(
                        (m, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setLocalAdConfig({
                                ...localAdConfig,
                                heroFlashSale: {
                                  ...localAdConfig.heroFlashSale,
                                  imageUrl: m.path,
                                },
                              })
                            }
                            className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-md cursor-pointer"
                          >
                            {m.label}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="rounded-2xl bg-white border border-red-200 p-3 flex flex-col justify-between relative overflow-hidden min-h-[190px] shadow-sm">
                    <img
                      src={localAdConfig.heroFlashSale.imageUrl}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <div className="relative z-10 flex justify-between items-start">
                      <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                        {localAdConfig.heroFlashSale.badge}
                      </span>
                    </div>
                    <div className="relative z-10 text-white">
                      <h5 className="font-bold text-xs line-clamp-1">
                        {localAdConfig.heroFlashSale.title}
                      </h5>
                      <span className="text-amber-400 font-extrabold text-sm">
                        Rs. {localAdConfig.heroFlashSale.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: HOME PAGE DUAL PROMO BANNERS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="text-[#0052B4]" size={18} />
                    <h4 className="font-extrabold text-sm text-slate-900">
                      3. Home Page Dual Category Promo Banners
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                    2 Grid Cards
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {localAdConfig.promoBanners.map((banner, bIdx) => (
                    <div
                      key={banner.id || bIdx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-800 uppercase">
                          Banner #{bIdx + 1}
                        </span>
                        <select
                          value={banner.gradientTheme}
                          onChange={e => {
                            const newBanners = [...localAdConfig.promoBanners];
                            newBanners[bIdx] = {
                              ...banner,
                              gradientTheme: e.target.value as any,
                            };
                            setLocalAdConfig({
                              ...localAdConfig,
                              promoBanners: newBanners,
                            });
                          }}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold"
                        >
                          <option value="ebike">Theme: E-Bike Dark</option>
                          <option value="smarttv">Theme: Smart TV Blue</option>
                          <option value="water">
                            Theme: Water Filter Cyan
                          </option>
                          <option value="ac">Theme: AC Navy</option>
                          <option value="gold">Theme: Gold Luxury</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Badge
                          </label>
                          <input
                            type="text"
                            value={banner.badge}
                            onChange={e => {
                              const newBanners = [
                                ...localAdConfig.promoBanners,
                              ];
                              newBanners[bIdx] = {
                                ...banner,
                                badge: e.target.value,
                              };
                              setLocalAdConfig({
                                ...localAdConfig,
                                promoBanners: newBanners,
                              });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Button Text
                          </label>
                          <input
                            type="text"
                            value={banner.buttonText}
                            onChange={e => {
                              const newBanners = [
                                ...localAdConfig.promoBanners,
                              ];
                              newBanners[bIdx] = {
                                ...banner,
                                buttonText: e.target.value,
                              };
                              setLocalAdConfig({
                                ...localAdConfig,
                                promoBanners: newBanners,
                              });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Headline
                        </label>
                        <input
                          type="text"
                          value={banner.title}
                          onChange={e => {
                            const newBanners = [...localAdConfig.promoBanners];
                            newBanners[bIdx] = {
                              ...banner,
                              title: e.target.value,
                            };
                            setLocalAdConfig({
                              ...localAdConfig,
                              promoBanners: newBanners,
                            });
                          }}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Subtitle
                        </label>
                        <input
                          type="text"
                          value={banner.subtitle}
                          onChange={e => {
                            const newBanners = [...localAdConfig.promoBanners];
                            newBanners[bIdx] = {
                              ...banner,
                              subtitle: e.target.value,
                            };
                            setLocalAdConfig({
                              ...localAdConfig,
                              promoBanners: newBanners,
                            });
                          }}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium"
                        />
                      </div>

                      <MediaUploader
                        label={`Upload Banner #${bIdx + 1} Image (Auto-WebP)`}
                        currentUrl={banner.imageUrl}
                        accept="image"
                        recommendedDimensions="800x450 (16:9 banner)"
                        onUploaded={url => {
                          const newBanners = [...localAdConfig.promoBanners];
                          newBanners[bIdx] = {
                            ...banner,
                            imageUrl: url,
                          };
                          setLocalAdConfig({
                            ...localAdConfig,
                            promoBanners: newBanners,
                          });
                        }}
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {PRESET_AD_MEDIA.filter(m => m.type === "image").map(
                          (m, mIdx) => (
                            <button
                              key={mIdx}
                              type="button"
                              onClick={() => {
                                const newBanners = [
                                  ...localAdConfig.promoBanners,
                                ];
                                newBanners[bIdx] = {
                                  ...banner,
                                  imageUrl: m.path,
                                };
                                setLocalAdConfig({
                                  ...localAdConfig,
                                  promoBanners: newBanners,
                                });
                              }}
                              className="px-1.5 py-0.5 text-[9px] font-bold bg-white hover:bg-blue-100 text-slate-700 rounded border border-slate-200 cursor-pointer"
                            >
                              {m.label}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SAVE ACTION BAR */}
              <div className="bg-gradient-to-r from-[#001D4A] to-[#003882] p-5 rounded-2xl text-white flex items-center justify-between shadow-md">
                <div>
                  <h4 className="font-extrabold text-sm">
                    Publish Ad Updates to Production
                  </h4>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Changes take effect immediately across all visitors and
                    devices.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetAds}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAds}
                    className="px-6 py-2.5 rounded-xl bg-[#F85606] hover:bg-[#ff641a] text-white text-xs font-black shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1.5"
                  >
                    <Save size={15} />
                    <span>Save & Publish Live</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONTACTS & BANK DETAILS MANAGEMENT */}
          {activeTab === "contacts_bank" && (
            <div className="space-y-6">
              {/* TOP ACTION BAR */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0052B4] flex items-center justify-center font-bold">
                      <PhoneCall size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Hotline, Support, Google Maps &amp; Bank Details Control
                      </h2>
                      <p className="text-xs text-slate-500">
                        Manage company phone numbers, Contact page Google Map
                        location, WhatsApp, email, and bank transfer credentials
                        shown site-wide.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleResetContactsAndBank}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveContactsAndBank}
                    disabled={isSavingContacts || isSavingBank}
                    className="px-5 py-2 rounded-xl bg-[#0052B4] hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105 disabled:opacity-60"
                  >
                    <Save size={14} />
                    <span>
                      {isSavingContacts || isSavingBank
                        ? "Saving…"
                        : "Save & Publish Live"}
                    </span>
                  </button>
                </div>
              </div>

              {/* CARD 1: OFFICIAL CONTACT NUMBERS & CHANNELS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Phone className="text-[#0052B4]" size={18} />
                    <h4 className="font-extrabold text-sm text-slate-900">
                      1. Official Hotlines &amp; Support Channels
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                    Site-wide Header, Mobile Bar &amp; Contact Page
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Form Fields */}
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          General Hotline Phone
                        </label>
                        <input
                          type="text"
                          value={localContacts.hotline}
                          onChange={e =>
                            setLocalContacts({
                              ...localContacts,
                              hotline: e.target.value,
                            })
                          }
                          placeholder="+94 11 234 5678"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Displays in Topbar, Mobile header &amp; Drawer
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Support Hotline (Direct)
                        </label>
                        <input
                          type="text"
                          value={localContacts.supportPhone}
                          onChange={e =>
                            setLocalContacts({
                              ...localContacts,
                              supportPhone: e.target.value,
                            })
                          }
                          placeholder="+94 77 123 4567"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Technical inquiries &amp; service support
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          WhatsApp Business Number
                        </label>
                        <input
                          type="text"
                          value={localContacts.whatsappNumber}
                          onChange={e =>
                            setLocalContacts({
                              ...localContacts,
                              whatsappNumber: e.target.value,
                            })
                          }
                          placeholder="+94 77 123 4567"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Used for live chat &amp; bank slip confirmation
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Official Email Address
                        </label>
                        <input
                          type="email"
                          value={localContacts.email}
                          onChange={e =>
                            setLocalContacts({
                              ...localContacts,
                              email: e.target.value,
                            })
                          }
                          placeholder="info@manjugroup.lk"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Operating Hours
                      </label>
                      <input
                        type="text"
                        value={localContacts.openingHours}
                        onChange={e =>
                          setLocalContacts({
                            ...localContacts,
                            openingHours: e.target.value,
                          })
                        }
                        placeholder="Mon–Fri: 8:30 AM – 6:00 PM, Sat: 9:00 AM – 4:00 PM"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Corporate Head Office Address
                      </label>
                      <input
                        type="text"
                        value={localContacts.address}
                        onChange={e =>
                          setLocalContacts({
                            ...localContacts,
                            address: e.target.value,
                          })
                        }
                        placeholder="Manju Group Corporate HQ, No. 123, Galle Road, Colombo 03, Sri Lanka"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Facebook Page URL
                      </label>
                      <input
                        type="text"
                        value={localContacts.facebookUrl}
                        onChange={e =>
                          setLocalContacts({
                            ...localContacts,
                            facebookUrl: e.target.value,
                          })
                        }
                        placeholder="https://www.facebook.com/ManjuEnterprisesLK"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Right Column: Live Visual Previews */}
                  <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <h5 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      Live Customer-Facing Previews
                    </h5>

                    {/* Preview 1: Header Topbar Hotline Badge */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Header Topbar Hotline Badge
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#0052B4] px-3 py-1.5 rounded-full border border-blue-200 text-xs font-extrabold shadow-sm">
                          <PhoneCall size={13} />
                          <span>
                            Hotline:{" "}
                            {localContacts.hotline || "+94 11 234 5678"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Preview 2: Mobile Sticky Call Button */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Mobile Header Quick Call Button
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                          <PhoneCall size={16} />
                        </div>
                        <div className="text-xs font-bold text-slate-800">
                          One-tap call directly opens:{" "}
                          <span className="text-emerald-700 font-mono">
                            {localContacts.hotline}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Preview 3: WhatsApp & Support Cards */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                        <div className="flex items-center gap-1 text-emerald-700 font-bold mb-1">
                          <MessageSquare size={14} />
                          <span>WhatsApp Live</span>
                        </div>
                        <strong className="block font-black text-sm">
                          {localContacts.whatsappNumber || "+94 77 123 4567"}
                        </strong>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          Direct WhatsApp chat link
                        </span>
                      </div>

                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950">
                        <div className="flex items-center gap-1 text-blue-700 font-bold mb-1">
                          <Mail size={14} />
                          <span>Official Email</span>
                        </div>
                        <strong className="block font-black text-xs truncate">
                          {localContacts.email || "info@manjugroup.lk"}
                        </strong>
                        <span className="text-[10px] text-blue-700 font-medium">
                          Inquiries inbox
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: CONTACT PAGE GOOGLE MAPS & HEAD OFFICE LOCATION */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-[#0052B4]" size={18} />
                    <h4 className="font-extrabold text-sm text-slate-900">
                      2. Contact Page Google Maps &amp; Head Office Location
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                    Live Contact Page Interactive Map &amp; Directions
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left 7 cols: Configuration controls */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Smart Quick Paste / Auto Detect */}
                    <div className="bg-blue-50/60 border border-blue-100 p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-[#0052B4]" />
                          <span>
                            Smart Auto-Detector (Coordinates or Google Maps
                            Link)
                          </span>
                        </label>
                        <span className="text-[10px] text-blue-600 font-bold">
                          Quick Fill
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={mapQuickPaste}
                          onChange={e => setMapQuickPaste(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleApplyQuickMap(mapQuickPaste);
                            }
                          }}
                          placeholder="Paste coordinates (e.g. 6.9034, 79.8524) or Google Maps URL / iframe"
                          className="flex-1 px-3 py-2 text-xs bg-white border border-blue-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052B4]/20"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyQuickMap(mapQuickPaste)}
                          className="px-3 py-2 bg-[#0052B4] hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
                        >
                          Auto Apply
                        </button>
                      </div>
                      <p className="text-[11px] text-blue-700/80 leading-tight">
                        💡 Tip: Right-click any location on Google Maps and
                        click the numbers to copy latitude &amp; longitude, or
                        paste an embed iframe code!
                      </p>
                    </div>

                    {/* Coordinates input grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Latitude (e.g. 6.9034)
                        </label>
                        <input
                          type="text"
                          value={localContacts.mapLatitude ?? "6.9034"}
                          onChange={e => {
                            const val = e.target.value;
                            const parsed = parseCoordinatesInput(val);
                            if (parsed) {
                              setLocalContacts({
                                ...localContacts,
                                mapLatitude: parsed.latitude,
                                mapLongitude: parsed.longitude,
                              });
                            } else {
                              setLocalContacts({
                                ...localContacts,
                                mapLatitude: val,
                              });
                            }
                          }}
                          placeholder="6.9034"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          North / South coordinate
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Longitude (e.g. 79.8524)
                        </label>
                        <input
                          type="text"
                          value={localContacts.mapLongitude ?? "79.8524"}
                          onChange={e =>
                            setLocalContacts({
                              ...localContacts,
                              mapLongitude: e.target.value,
                            })
                          }
                          placeholder="79.8524"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          East / West coordinate
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Map Zoom Level ({localContacts.mapZoom || 15})
                        </label>
                        <select
                          value={Number(localContacts.mapZoom || 15)}
                          onChange={e =>
                            setLocalContacts({
                              ...localContacts,
                              mapZoom: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="12">12 - City View</option>
                          <option value="14">14 - Area View</option>
                          <option value="15">15 - Street View (Default)</option>
                          <option value="16">16 - Close Street</option>
                          <option value="17">17 - Block Level</option>
                          <option value="18">18 - Building Level</option>
                        </select>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Embedded camera zoom
                        </span>
                      </div>
                    </div>

                    {/* Location Labels */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Office / Building Badge Label
                        </label>
                        <input
                          type="text"
                          value={
                            localContacts.locationTitle ??
                            "Corporate Headquarters"
                          }
                          onChange={e =>
                            setLocalContacts({
                              ...localContacts,
                              locationTitle: e.target.value,
                            })
                          }
                          placeholder="Corporate Headquarters"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Badge shown above office title on Contact page
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          City / District Tag
                        </label>
                        <input
                          type="text"
                          value={localContacts.locationCity ?? "Colombo 03"}
                          onChange={e =>
                            setLocalContacts({
                              ...localContacts,
                              locationCity: e.target.value,
                            })
                          }
                          placeholder="Colombo 03"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Top-right location badge (e.g. Colombo 03, Kandy)
                        </span>
                      </div>
                    </div>

                    {/* Custom Embed URL / Iframe Code (Optional Override) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Custom Google Maps Embed Code or URL (Optional
                          Override)
                        </label>
                        {localContacts.mapEmbedUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setLocalContacts({
                                ...localContacts,
                                mapEmbedUrl: "",
                              })
                            }
                            className="text-[11px] text-red-600 hover:underline font-bold cursor-pointer"
                          >
                            Clear Custom Embed
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        value={localContacts.mapEmbedUrl || ""}
                        onChange={e => {
                          const val = e.target.value;
                          const cleaned = extractEmbedUrl(val);
                          setLocalContacts({
                            ...localContacts,
                            mapEmbedUrl: cleaned || val,
                          });
                        }}
                        placeholder="Paste <iframe src='https://www.google.com/maps/embed?...'></iframe> or direct embed URL"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        If provided, this embed URL overrides coordinate
                        calculations. Leave empty to use coordinates above.
                      </span>
                    </div>

                    {/* Action buttons to test links */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={getDirectionsUrl(localContacts)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-[#0052B4] rounded-xl text-xs font-bold border border-blue-200 transition-colors"
                      >
                        <Navigation size={13} />
                        <span>Test Live Directions Link</span>
                        <ExternalLink size={12} />
                      </a>

                      <a
                        href={`https://www.google.com/maps?q=${encodeURIComponent(localContacts.mapLatitude || "6.9034")},${encodeURIComponent(localContacts.mapLongitude || "79.8524")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
                      >
                        <MapPin size={13} />
                        <span>Open Pin in Google Maps</span>
                        <ExternalLink size={12} />
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setLocalContacts({
                            ...localContacts,
                            mapLatitude: "6.9034",
                            mapLongitude: "79.8524",
                            mapZoom: 15,
                            mapEmbedUrl: "",
                            locationTitle: "Corporate Headquarters",
                            locationCity: "Colombo 03",
                          });
                          toast.info(
                            "Map coordinates reset to Colombo 03 HQ default"
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      >
                        <RotateCcw size={12} />
                        <span>Reset Coordinates</span>
                      </button>
                    </div>
                  </div>

                  {/* Right 5 cols: Live Customer-Facing Interactive Map Preview */}
                  <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Eye size={14} className="text-[#0052B4]" />
                          <span>Contact Page Live Preview</span>
                        </h5>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Live Sync
                        </span>
                      </div>

                      {/* Mini Contact Page Office Card */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-slate-900 mb-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-50 text-[#0052B4] rounded-full border border-blue-200">
                            <Building2 size={11} />
                            {localContacts.locationTitle ||
                              "Corporate Headquarters"}
                          </span>
                          <span className="text-[11px] text-slate-500 font-bold">
                            {localContacts.locationCity || "Colombo 03"}
                          </span>
                        </div>
                        <h6 className="font-black text-sm text-slate-900 mb-2">
                          Manju Group (Pvt) Ltd
                        </h6>
                        <div className="flex items-start gap-2 text-xs text-slate-600 mb-3">
                          <MapPin
                            size={14}
                            className="text-[#0052B4] shrink-0 mt-0.5"
                          />
                          <span className="line-clamp-2">
                            {localContacts.address || "No address entered"}
                          </span>
                        </div>
                        <a
                          href={getDirectionsUrl(localContacts)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-[#0052B4] hover:bg-blue-700 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Navigation size={12} />
                          <span>Get Live Directions</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>

                      {/* Live Embedded Google Map Frame */}
                      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="w-full h-[220px] rounded-xl overflow-hidden relative bg-slate-100">
                          <iframe
                            key={`${localContacts.mapLatitude}-${localContacts.mapLongitude}-${localContacts.mapZoom}-${localContacts.mapEmbedUrl}`}
                            src={getMapEmbedUrl(localContacts)}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Live Map Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200/80">
                      <strong>Coordinates active:</strong>{" "}
                      <span className="font-mono text-slate-700">
                        {localContacts.mapLatitude || "6.9034"},{" "}
                        {localContacts.mapLongitude || "79.8524"}
                      </span>
                      {localContacts.mapEmbedUrl && (
                        <span className="block text-emerald-700 font-bold mt-0.5">
                          ✓ Custom embed URL override is active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: BANK TRANSFER DETAILS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="text-[#0052B4]" size={18} />
                    <h4 className="font-extrabold text-sm text-slate-900">
                      3. Company Bank Account (Direct Bank Transfer)
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                    Checkout Payment Step &amp; Order Invoices
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Form Fields */}
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={localBank.bankName}
                          onChange={e =>
                            setLocalBank({
                              ...localBank,
                              bankName: e.target.value,
                            })
                          }
                          placeholder="Commercial Bank of Ceylon"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          value={localBank.accountName}
                          onChange={e =>
                            setLocalBank({
                              ...localBank,
                              accountName: e.target.value,
                            })
                          }
                          placeholder="Manju Group (Pvt) Ltd"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={localBank.accountNumber}
                          onChange={e =>
                            setLocalBank({
                              ...localBank,
                              accountNumber: e.target.value,
                            })
                          }
                          placeholder="1234 5678 9012"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-blue-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Branch Name
                        </label>
                        <input
                          type="text"
                          value={localBank.branch}
                          onChange={e =>
                            setLocalBank({
                              ...localBank,
                              branch: e.target.value,
                            })
                          }
                          placeholder="Colombo Main Branch"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        SWIFT / BIC Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={localBank.swiftCode || ""}
                        onChange={e =>
                          setLocalBank({
                            ...localBank,
                            swiftCode: e.target.value,
                          })
                        }
                        placeholder="CCEYLKFX"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Customer Payment Instructions &amp; Reference Note
                      </label>
                      <textarea
                        rows={3}
                        value={localBank.instructions}
                        onChange={e =>
                          setLocalBank({
                            ...localBank,
                            instructions: e.target.value,
                          })
                        }
                        placeholder="Please use your Order Number as reference..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Right Column: Checkout Simulation Card */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <h5 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      Checkout Screen Simulation
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      This is exactly what customers will see when selecting
                      &ldquo;Direct Bank Transfer&rdquo; on the checkout screen:
                    </p>

                    <div className="bg-blue-50/90 border border-blue-200 rounded-2xl p-4 text-blue-900 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-blue-200/70 pb-2">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-[#0052B4]" />
                          <span className="font-extrabold text-xs text-[#001A3D]">
                            Bank Transfer Details
                          </span>
                        </div>
                        <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          Official Account
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs pt-0.5">
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            Bank Name
                          </span>
                          <strong className="text-xs font-bold text-slate-900">
                            {localBank.bankName || "Commercial Bank of Ceylon"}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            Account Name
                          </span>
                          <strong className="text-xs font-bold text-slate-900">
                            {localBank.accountName || "Manju Group (Pvt) Ltd"}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            Account Number
                          </span>
                          <strong className="font-mono font-black text-blue-900 text-sm tracking-wide">
                            {localBank.accountNumber || "1234 5678 9012"}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            Branch
                          </span>
                          <strong className="text-xs font-bold text-slate-900">
                            {localBank.branch || "Colombo Main Branch"}
                          </strong>
                        </div>
                      </div>

                      <div className="text-[11px] text-blue-950/85 pt-2 border-t border-blue-200/60 leading-relaxed font-medium bg-blue-100/50 p-2.5 rounded-xl">
                        {localBank.instructions}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SAVE ACTION BAR */}
              <div className="bg-gradient-to-r from-[#001D4A] to-[#003882] p-5 rounded-2xl text-white flex items-center justify-between shadow-md">
                <div>
                  <h4 className="font-extrabold text-sm">
                    Publish Contact, Google Map &amp; Bank Updates to Production
                  </h4>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Updates will sync instantly to all site visitors, checkout
                    pages, and mobile apps.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetContactsAndBank}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveContactsAndBank}
                    disabled={isSavingContacts || isSavingBank}
                    className="px-6 py-2.5 rounded-xl bg-[#F85606] hover:bg-[#ff641a] text-white text-xs font-black shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <Save size={15} />
                    <span>
                      {isSavingContacts || isSavingBank
                        ? "Publishing…"
                        : "Save & Publish Live"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CUSTOMERS (real, order-derived directory — includes guest checkouts) */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <UserCircle size={20} className="text-[#0052B4]" />
                    Customer Directory
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Every customer who has placed an order, including guest
                    checkouts, with contact details and order history.
                  </p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={customerSearch}
                    onChange={e => {
                      setCustomerSearch(e.target.value);
                      setCustomerPage(1);
                    }}
                    placeholder="Search name, phone, or email..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052B4]/30"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-black text-xs border-b border-slate-200">
                      <tr>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Orders</th>
                        <th className="p-4">Total Spent</th>
                        <th className="p-4">Last Order</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {isLoadingCustomers ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="p-12 text-center text-slate-500"
                          >
                            Loading customers...
                          </td>
                        </tr>
                      ) : customersError ? (
                        <AdminQueryErrorRow
                          colSpan={7}
                          label="customers"
                          error={customersError}
                          onRetry={() => refetchCustomers()}
                        />
                      ) : customersData?.items &&
                        customersData.items.length > 0 ? (
                        customersData.items.map((customer: any) => (
                          <tr
                            key={customer.key}
                            onClick={() => setSelectedCustomer(customer)}
                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <td className="p-4">
                              <span className="text-slate-900 font-bold block">
                                {customer.name}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-slate-700 block">
                                {customer.phone || "—"}
                              </span>
                              <span className="text-xs text-slate-500">
                                {customer.email || "—"}
                              </span>
                            </td>
                            <td className="p-4 text-slate-600">
                              {[customer.address, customer.city]
                                .filter(Boolean)
                                .join(", ") || "—"}
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                {customer.totalOrders}
                              </span>
                            </td>
                            <td className="p-4 font-black text-slate-900">
                              {formatPrice(customer.totalSpent)}
                            </td>
                            <td className="p-4 text-slate-600">
                              {new Date(
                                customer.lastOrderDate
                              ).toLocaleDateString()}
                            </td>
                            <td
                              className="p-4 text-right"
                              onClick={e => e.stopPropagation()}
                            >
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setDeleteTarget({
                                    type: "customer",
                                    id: customer.key,
                                    name: customer.name,
                                    details: `${customer.totalOrders} order(s) • ${formatPrice(customer.totalSpent)}`,
                                  });
                                }}
                                className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Delete Customer & Order Records"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="p-12 text-center text-slate-500"
                          >
                            No customers found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {customersData && customersData.total > 20 && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCustomerPage(p => Math.max(1, p - 1))}
                    disabled={customerPage === 1}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500 font-bold">
                    Page {customerPage} of {Math.ceil(customersData.total / 20)}
                  </span>
                  <button
                    onClick={() => setCustomerPage(p => p + 1)}
                    disabled={
                      customerPage >= Math.ceil(customersData.total / 20)
                    }
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Users size={20} className="text-[#0052B4]" />
                    Registered Users & Customers
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Manage all registered accounts, viewing their login methods
                    and roles.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-black text-xs border-b border-slate-200">
                      <tr>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Login Method</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Joined Date</th>
                        <th className="p-4">Last Active</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {isLoadingUsers ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-12 text-center text-slate-500"
                          >
                            Loading users...
                          </td>
                        </tr>
                      ) : usersError ? (
                        <AdminQueryErrorRow
                          colSpan={6}
                          label="users"
                          error={usersError}
                          onRetry={() => refetchUsers()}
                        />
                      ) : usersData?.items && usersData.items.length > 0 ? (
                        usersData.items.map(user => (
                          <tr
                            key={user.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="text-slate-900 font-bold">
                                  {user.name || "Unknown"}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {user.email || "No email"}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  user.loginMethod === "google"
                                    ? "bg-red-50 text-red-600 border border-red-200"
                                    : "bg-blue-50 text-blue-600 border border-blue-200"
                                }`}
                              >
                                {user.loginMethod === "google"
                                  ? "Google"
                                  : "Email"}
                              </span>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  user.role === "admin"
                                    ? "bg-purple-50 text-purple-600 border border-purple-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}
                              >
                                {user.role === "admin" ? "Admin" : "User"}
                              </span>
                            </td>
                            <td className="p-4 text-slate-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-slate-600">
                              {user.lastSignedIn
                                ? new Date(
                                    user.lastSignedIn
                                  ).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "user",
                                    id: user.id,
                                    name:
                                      user.name ||
                                      user.email ||
                                      `User #${user.id}`,
                                    details: `Role: ${user.role.toUpperCase()} • Joined: ${new Date(user.createdAt).toLocaleDateString()}`,
                                  })
                                }
                                className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Delete User Account"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-12 text-center text-slate-500"
                          >
                            No users found in the database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REVIEWS MODERATION */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Header & Controls */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Star size={20} className="text-amber-500 fill-amber-500" />
                    Customer Reviews &amp; Live Comments
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Live feedback and ratings submitted by verified customers
                    and visitors. Moderate, edit, or remove reviews.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-72">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Search reviews, authors, products..."
                      value={reviewSearch}
                      onChange={e => {
                        setReviewSearch(e.target.value);
                        setReviewPage(1);
                      }}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0052B4]"
                    />
                  </div>

                  <button
                    onClick={() => refetchAdminReviews()}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    title="Refresh Reviews"
                  >
                    <RefreshCw
                      size={15}
                      className={isLoadingReviews ? "animate-spin" : ""}
                    />
                  </button>
                </div>
              </div>

              {/* Stats KPI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                    <Star size={20} className="fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">
                      Total Reviews
                    </div>
                    <div className="text-xl font-black text-slate-900">
                      {adminReviewsData?.total ?? 0}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">
                      Live / Approved
                    </div>
                    <div className="text-xl font-black text-slate-900">
                      {adminReviewsData?.items?.filter(r => r.isApproved)
                        .length ?? 0}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">
                      Current Page
                    </div>
                    <div className="text-xl font-black text-slate-900">
                      Page {reviewPage}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Product</th>
                        <th className="p-4">Rating</th>
                        <th className="p-4">Comment</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {isLoadingReviews ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="p-8 text-center text-slate-400"
                          >
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0052B4]" />
                            Loading customer reviews...
                          </td>
                        </tr>
                      ) : reviewsError ? (
                        <AdminQueryErrorRow
                          colSpan={7}
                          label="customer reviews"
                          error={reviewsError}
                          onRetry={() => refetchAdminReviews()}
                        />
                      ) : adminReviewsData?.items &&
                        adminReviewsData.items.length > 0 ? (
                        adminReviewsData.items.map(rev => (
                          <tr
                            key={rev.id}
                            className="hover:bg-slate-50/60 transition-colors"
                          >
                            <td className="p-4">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{rev.authorName || "Customer"}</span>
                                {rev.isVerified && (
                                  <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black">
                                    Verified
                                  </span>
                                )}
                              </div>
                              {rev.userEmail && (
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {rev.userEmail}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-800 line-clamp-1 max-w-[180px]">
                                {rev.productName || `Product #${rev.productId}`}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                ID: {rev.productId}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star
                                    key={star}
                                    size={13}
                                    className={
                                      star <= rev.rating
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-slate-200"
                                    }
                                  />
                                ))}
                                <span className="text-[11px] font-black text-slate-700 ml-1">
                                  {rev.rating}.0
                                </span>
                              </div>
                            </td>
                            <td className="p-4 max-w-xs">
                              {rev.title && (
                                <div className="font-bold text-slate-900 text-xs mb-0.5">
                                  {rev.title}
                                </div>
                              )}
                              <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                                {rev.body}
                              </p>
                            </td>
                            <td className="p-4">
                              {rev.isApproved ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Check size={11} /> Visible
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <EyeOff size={11} /> Hidden
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-slate-400 whitespace-nowrap text-[11px]">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingReview({
                                      id: rev.id,
                                      authorName: rev.authorName || "",
                                      rating: rev.rating,
                                      title: rev.title || "",
                                      body: rev.body || "",
                                      isApproved: rev.isApproved,
                                    });
                                    setIsReviewModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                                  title="Edit Review"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        "Are you sure you want to permanently delete this customer review?"
                                      )
                                    ) {
                                      deleteReviewMutation.mutate({
                                        reviewId: rev.id,
                                      });
                                    }
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                                  title="Delete Review"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="p-12 text-center text-slate-400 font-medium"
                          >
                            No customer reviews found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SHOWROOMS */}
          {activeTab === "showrooms" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Island-Wide Showroom Network
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live locations across Sri Lanka
                  </p>
                </div>
                <button
                  onClick={() =>
                    toast.info("New Showroom creation active in database mode")
                  }
                  className="px-3.5 py-2 bg-[#0052B4] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  <span>Add Showroom</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SHOWROOMS_DATA.map(s => (
                  <div
                    key={s.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">
                        {s.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                        Active Branch
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#0052B4]" />
                      <span>{s.address}</span>
                    </p>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                      <Phone size={13} className="text-emerald-600" />
                      <span>
                        {s.phone} • Mgr: {s.manager}
                      </span>
                    </p>
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                      <span>Hours: {s.hours}</span>
                      <button
                        onClick={() =>
                          toast.success(`Branch ${s.name} details saved`)
                        }
                        className="text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Edit Branch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: INQUIRIES & LEADS CRM */}
          {activeTab === "inquiries" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-900">
                  Customer Leads & Quote Inquiries
                </h3>
                <p className="text-xs text-slate-500">
                  Incoming inquiries from Contact page and Product detail forms
                </p>
              </div>

              <div className="space-y-3">
                {INQUIRIES_DATA.map(inq => (
                  <div
                    key={inq.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {inq.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
                          {inq.department}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{inq.date}</span>
                    </div>

                    <div className="text-xs font-bold text-slate-800">
                      {inq.subject}
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{inq.message}"
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="text-xs text-slate-500 font-medium">
                        Contact:{" "}
                        <span className="font-bold text-slate-800">
                          {inq.phone}
                        </span>{" "}
                        ({inq.email})
                      </div>
                      <a
                        href={`https://wa.me/94${inq.phone.replace(/^0/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <Phone size={12} />
                        <span>Reply on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: ERP INTEGRATION GATEWAY */}
          {activeTab === "erp" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0052B4] flex items-center justify-center">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      ERP & Accounting Integration Hub
                    </h3>
                    <p className="text-xs text-slate-500">
                      Connect with SAP, QuickBooks, Zoho, and Custom ERPs
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 mb-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold">
                      ERP Webhook Status
                    </span>
                    <strong className="text-emerald-600 font-black block text-sm mt-1">
                      ● Active / Listening
                    </strong>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold">
                      Catalog Auto-Sync
                    </span>
                    <strong className="text-blue-600 font-black block text-sm mt-1">
                      18 Items Synced
                    </strong>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold">
                      Last Sync Timestamp
                    </span>
                    <strong className="text-slate-800 font-black block text-sm mt-1">
                      {lastSyncTime}
                    </strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleTriggerERPSync}
                    disabled={isSyncingERP}
                    className="px-5 py-2.5 bg-[#0052B4] hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <RefreshCw
                      size={14}
                      className={isSyncingERP ? "animate-spin" : ""}
                    />
                    <span>
                      {isSyncingERP
                        ? "Synchronizing..."
                        : "Trigger Manual ERP Sync"}
                    </span>
                  </button>

                  <button
                    onClick={handleExportLedgerJSON}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Download size={14} />
                    <span>Export Full Ledger (JSON / CSV)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: AI ASSISTANT AUDIT LOG */}
          {activeTab === "ai_audit" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-900">
                  AI Assistant Real-Time Audit Log
                </h3>
                <p className="text-xs text-slate-500">
                  Live conversations between web visitors and autonomous
                  assistant
                </p>
              </div>

              <div className="space-y-3">
                {AI_AUDIT_LOGS.map(log => (
                  <div
                    key={log.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0052B4]">
                        {log.category}
                      </span>
                      <span className="text-slate-400">{log.time}</span>
                    </div>

                    <div className="text-xs font-bold text-slate-900">
                      User Question:{" "}
                      <span className="font-medium text-slate-700">
                        "{log.userQuery}"
                      </span>
                    </div>

                    <div className="text-xs font-medium text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                      AI Answer: {log.aiResponse}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODAL: PRODUCT ADD / EDIT ─────────────────────────────────────── */}
      <AnimatePresence>
        {isProductModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900">
                  {editingProduct.id ? "Edit Product" : "Add New Product"}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleSaveProduct}
                className="space-y-4 pt-4 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={e =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Brand Division
                    </label>
                    <select
                      value={editingProduct.brandId || 1}
                      onChange={e => {
                        const bId = Number(e.target.value);
                        const bName =
                          brandOptions?.find(b => b.id === bId)?.name ||
                          (bId === 1
                            ? "Dew Motors"
                            : bId === 2
                              ? "Dew Plus"
                              : bId === 3
                                ? "DEW+ AC"
                                : "Manju Dew Super");
                        setEditingProduct({
                          ...editingProduct,
                          brandId: bId,
                          brandName: bName,
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      {brandOptions && brandOptions.length > 0 ? (
                        brandOptions.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value={1}>Dew Motors</option>
                          <option value={2}>Dew Plus</option>
                          <option value={3}>DEW+ AC</option>
                          <option value={4}>Manju Dew Super</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Category
                    </label>
                    <select
                      value={editingProduct.categoryId || 1}
                      onChange={e => {
                        const cId = Number(e.target.value);
                        const cName =
                          categoryOptions?.find(c => c.id === cId)?.name ||
                          "General";
                        setEditingProduct({
                          ...editingProduct,
                          categoryId: cId,
                          category: cName,
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      {categoryOptions && categoryOptions.length > 0 ? (
                        categoryOptions.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value={1}>Electric Bikes</option>
                          <option value={2}>Smart TVs</option>
                          <option value={3}>Air Conditioners</option>
                          <option value={4}>Water Purifiers</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.sku}
                      onChange={e =>
                        setEditingProduct({
                          ...editingProduct,
                          sku: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Base Price (LKR)
                    </label>
                    <input
                      type="number"
                      required
                      value={editingProduct.basePrice}
                      onChange={e =>
                        setEditingProduct({
                          ...editingProduct,
                          basePrice: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Warranty (Months)
                    </label>
                    <input
                      type="number"
                      value={editingProduct.warrantyMonths || 12}
                      onChange={e =>
                        setEditingProduct({
                          ...editingProduct,
                          warrantyMonths: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Product Photo (Direct Device Upload &amp; Auto-Compression)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Upload product photo directly from your device. It will
                    automatically convert to highly-compressed WebP for
                    ultra-fast and smooth website loading.
                  </p>
                  <MediaUploader
                    label="Upload Product Photo"
                    currentUrl={editingProduct.imageUrl || ""}
                    accept="image"
                    recommendedDimensions="Square 800×800 or 1000×1000 px"
                    onUploaded={url => {
                      setEditingProduct({
                        ...editingProduct,
                        imageUrl: url,
                      });
                    }}
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Short Description / Overview Summary
                  </label>
                  <input
                    type="text"
                    value={editingProduct.shortDescription || ""}
                    onChange={e =>
                      setEditingProduct({
                        ...editingProduct,
                        shortDescription: e.target.value,
                      })
                    }
                    placeholder="e.g. Official Manju Group warranty, islandwide door-step delivery."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                {/* Full Detailed Description */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Full Detailed Description &amp; Features
                  </label>
                  <textarea
                    rows={4}
                    value={editingProduct.description || ""}
                    onChange={e =>
                      setEditingProduct({
                        ...editingProduct,
                        description: e.target.value,
                      })
                    }
                    placeholder="Provide a comprehensive product description, highlights, build quality, and key features..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium resize-y"
                  />
                </div>

                {/* Technical Specifications & Attributes Builder */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-bold text-slate-900 block text-xs">
                        Technical Specifications &amp; Attributes
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Add custom key-value pairs (e.g. Motor, Battery, Speed,
                        Range, Dimensions)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSpecRow}
                      className="px-3 py-1.5 bg-[#0052B4] hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus size={13} />
                      <span>Add Spec Row</span>
                    </button>
                  </div>

                  {specRows.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center py-2">
                      No custom specifications added yet. Click &quot;Add Spec
                      Row&quot; above.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {specRows.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Attribute (e.g. Motor / Power)"
                            value={row.key}
                            onChange={e =>
                              handleUpdateSpecRow(idx, "key", e.target.value)
                            }
                            className="w-2/5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g. 2400W Brushless DC)"
                            value={row.value}
                            onChange={e =>
                              handleUpdateSpecRow(idx, "value", e.target.value)
                            }
                            className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecRow(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-all"
                            title="Remove Specification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="stockToggle"
                    checked={editingProduct.isInStock}
                    onChange={e =>
                      setEditingProduct({
                        ...editingProduct,
                        isInStock: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300"
                  />
                  <label
                    htmlFor="stockToggle"
                    className="font-bold text-slate-800"
                  >
                    Product In Stock (Available for Instant Order)
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0052B4] hover:bg-blue-700 text-white font-black rounded-xl shadow-md cursor-pointer"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: OFFICIAL PRINTABLE INVOICE ─────────────────────────────── */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <img
                      src="/manju-logo.webp"
                      alt="Logo"
                      className="w-8 h-8 object-contain"
                    />
                    <span className="font-display font-black text-xl text-[#001D4A]">
                      MANJU GROUP
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Official Commercial Tax Invoice • Colombo 03, Sri Lanka
                  </p>
                  <p className="text-xs text-slate-500">
                    Hotline: 071 2 60 60 50 | www.manjugroup.lk
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase text-slate-400 block">
                    Invoice Number
                  </span>
                  <span className="text-base font-black text-[#0052B4]">
                    {selectedOrder.orderNumber}
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Customer & Shipping */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                    Billed To:
                  </span>
                  <strong className="font-black text-slate-900 block text-sm">
                    {selectedOrder.shippingAddress
                      ? `${selectedOrder.shippingAddress.firstName || ""} ${selectedOrder.shippingAddress.lastName || ""}`.trim() ||
                        "Guest"
                      : "Guest"}
                  </strong>
                  <span className="text-slate-600 block">
                    {selectedOrder.shippingAddress?.phone}
                  </span>
                  <span className="text-slate-600 block">
                    {selectedOrder.shippingAddress?.email}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                    Delivery Address:
                  </span>
                  <span className="text-slate-800 font-medium block">
                    {selectedOrder.shippingAddress?.addressLine1}
                  </span>
                  <span className="text-slate-800 font-bold block">
                    {selectedOrder.shippingAddress?.city}, Sri Lanka
                  </span>
                  <span className="text-emerald-700 font-bold block mt-1">
                    Payment: {selectedOrder.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full text-xs text-left mb-6">
                <thead className="bg-slate-100 text-slate-700 uppercase font-black">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5">SKU</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-slate-900">
                        {it.productName}
                      </td>
                      <td className="p-2.5 font-mono text-slate-500">
                        {it.sku}
                      </td>
                      <td className="p-2.5 text-center font-bold">
                        {it.quantity}
                      </td>
                      <td className="p-2.5 text-right font-black text-slate-900">
                        {formatPrice(Number(it.unitPrice))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Summary */}
              <div className="border-t border-slate-200 pt-4 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold">
                      {formatPrice(Number(selectedOrder.subtotal))}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Island-wide Shipping:</span>
                    <span className="font-bold">
                      {Number(selectedOrder.shippingFee) === 0
                        ? "FREE"
                        : formatPrice(Number(selectedOrder.shippingFee))}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total (LKR):</span>
                    <span className="text-[#0052B4]">
                      {formatPrice(Number(selectedOrder.total))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-[#0052B4] hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Official Invoice</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-slate-200 pb-5 mb-5">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedCustomer.phone}
                    {selectedCustomer.email
                      ? ` • ${selectedCustomer.email}`
                      : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    {[selectedCustomer.address, selectedCustomer.city]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <span className="text-xs text-slate-500 font-bold uppercase block">
                    Total Orders
                  </span>
                  <span className="text-xl font-black text-slate-900">
                    {selectedCustomer.totalOrders}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <span className="text-xs text-slate-500 font-bold uppercase block">
                    Total Spent
                  </span>
                  <span className="text-xl font-black text-[#0052B4]">
                    {formatPrice(selectedCustomer.totalSpent)}
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-black text-slate-500 uppercase mb-3">
                Order History
              </h4>
              <div className="space-y-2">
                {selectedCustomer.orderHistory?.map((o: any) => (
                  <div
                    key={o.orderNumber}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <span className="font-mono font-bold text-sm text-[#0052B4] block">
                        {o.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(o.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">
                        {formatPrice(Number(o.total))}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          o.status === "delivered"
                            ? "bg-emerald-100 text-emerald-700"
                            : o.status === "processing"
                              ? "bg-blue-100 text-blue-700"
                              : o.status === "shipped"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setDeleteTarget({
                      type: "customer",
                      id: selectedCustomer.key,
                      name: selectedCustomer.name,
                      details: `${selectedCustomer.totalOrders} order(s) • ${formatPrice(selectedCustomer.totalSpent)}`,
                    });
                  }}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Delete Customer & Orders</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Permanent Deletion */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {deleteTarget.type === "user"
                  ? "Delete User Account?"
                  : "Delete Customer Record?"}
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Are you sure you want to permanently delete{" "}
                <strong className="text-slate-900">{deleteTarget.name}</strong>?
              </p>
              {deleteTarget.details && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-mono">
                  {deleteTarget.details}
                </div>
              )}
              <p className="text-xs text-red-600 font-semibold mt-3">
                {deleteTarget.type === "user"
                  ? "⚠️ This user account will be permanently removed. Order records will be retained with detached user ownership."
                  : "⚠️ This customer and all associated order records will be permanently deleted from the database."}
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={
                    deleteUserMutation.isPending ||
                    deleteCustomerMutation.isPending
                  }
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    deleteUserMutation.isPending ||
                    deleteCustomerMutation.isPending
                  }
                  onClick={() => {
                    if (deleteTarget.type === "user") {
                      deleteUserMutation.mutate({
                        userId: Number(deleteTarget.id),
                      });
                    } else {
                      deleteCustomerMutation.mutate({
                        customerKey: String(deleteTarget.id),
                      });
                    }
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  <span>
                    {deleteUserMutation.isPending ||
                    deleteCustomerMutation.isPending
                      ? "Deleting..."
                      : "Permanently Delete"}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* EDIT REVIEW MODAL */}
        {isReviewModalOpen && editingReview && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-amber-500 fill-amber-500" />
                  <h3 className="text-base font-black text-slate-900">
                    Moderate Customer Review #{editingReview.id}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setEditingReview(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!editingReview) return;
                  updateReviewMutation.mutate({
                    reviewId: editingReview.id,
                    authorName: editingReview.authorName,
                    rating: editingReview.rating,
                    title: editingReview.title,
                    body: editingReview.body,
                    isApproved: editingReview.isApproved,
                  });
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Rating (Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() =>
                          setEditingReview({
                            ...editingReview,
                            rating: star,
                          })
                        }
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          size={24}
                          className={
                            star <= editingReview.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-200"
                          }
                        />
                      </button>
                    ))}
                    <span className="font-black text-slate-800 text-sm ml-2">
                      {editingReview.rating} of 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Author Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingReview.authorName}
                    onChange={e =>
                      setEditingReview({
                        ...editingReview,
                        authorName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Review Headline / Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingReview.title}
                    onChange={e =>
                      setEditingReview({
                        ...editingReview,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g. Excellent build quality and range"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Review Comment / Body
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editingReview.body}
                    onChange={e =>
                      setEditingReview({
                        ...editingReview,
                        body: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium resize-y"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="reviewApprovedToggle"
                    checked={editingReview.isApproved}
                    onChange={e =>
                      setEditingReview({
                        ...editingReview,
                        isApproved: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300"
                  />
                  <label
                    htmlFor="reviewApprovedToggle"
                    className="font-bold text-slate-800 cursor-pointer"
                  >
                    Approved &amp; Visible on Live Website
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReviewModalOpen(false);
                      setEditingReview(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateReviewMutation.isPending}
                    className="px-5 py-2 bg-[#0052B4] hover:bg-blue-700 text-white font-black rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {updateReviewMutation.isPending
                      ? "Saving..."
                      : "Save Review Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
