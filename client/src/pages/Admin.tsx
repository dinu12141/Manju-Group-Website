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
  Server,
  Database,
  HardDrive,
  Terminal,
  Globe,
  Activity,
  ChevronDown,
  ChevronUp,
  Lock,
  KeyRound,
  Wrench,
  Grid,
  CheckCircle,
  ChevronLeft,
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
import { formatPrice, getProductImage } from "@/lib/data";
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
  | "tools"
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

  const [activeTab, setActiveTab] = useState<AdminTab>("tools");
  const [cpanelSearch, setCpanelSearch] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };
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
    utils.products.invalidate();
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

  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  const deleteProductMutation = trpc.admin.deleteProduct.useMutation({
    onMutate: async ({ productId }) => {
      setDeletingProductId(productId);
      await utils.admin.products.cancel({ page: 1, limit: 100 });
      const prevProducts = utils.admin.products.getData({ page: 1, limit: 100 });
      utils.admin.products.setData(
        { page: 1, limit: 100 },
        (old: any) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.filter((p: any) => p.id !== productId),
            total: Math.max(0, (old.total ?? old.items.length) - 1),
          };
        }
      );
      return { prevProducts };
    },
    onSuccess: () => {
      invalidateProductQueries();
      toast.success("Product permanently deleted from catalog");
    },
    onError: (err, _variables, context) => {
      if (context?.prevProducts) {
        utils.admin.products.setData({ page: 1, limit: 100 }, context.prevProducts);
      }
      toast.error(err.message || "Failed to delete product");
    },
    onSettled: () => {
      setDeletingProductId(null);
      refetchProducts();
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
    {
      enabled: isAdmin,
      staleTime: 0,
      refetchInterval: 3000,
      refetchOnWindowFocus: true,
    }
  );

  // Inquiries Hooks
  const [inquiryPage, setInquiryPage] = useState(1);
  const {
    data: inquiriesData,
    isLoading: isInquiriesLoading,
    refetch: refetchInquiries,
  } = trpc.admin.inquiriesList.useQuery(
    { page: inquiryPage, limit: 20 },
    { enabled: isAdmin }
  );
  const inquiriesList = inquiriesData?.items || [];
  const inquiriesTotal = inquiriesData?.total || 0;
  const unreadInquiriesCount = inquiriesList.filter(i => !i.isRead).length;

  const markInquiryReadMutation = trpc.admin.markInquiryRead.useMutation({
    onSuccess: () => refetchInquiries(),
  });
  const deleteInquiryMutation = trpc.admin.deleteInquiry.useMutation({
    onSuccess: () => {
      toast.success("Inquiry deleted successfully");
      refetchInquiries();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete inquiry");
    }
  });

  // Showrooms / Locations cPanel Hooks
  const [showroomSearch, setShowroomSearch] = useState("");
  const [showroomProvinceFilter, setShowroomProvinceFilter] = useState("All");
  const [showroomStatusFilter, setShowroomStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showroomsViewMode, setShowroomsViewMode] = useState<"table" | "grid">("table");

  // Showroom modal / editing state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any | null>(null);
  const [locationServicesChips, setLocationServicesChips] = useState<string[]>([]);
  const [newServiceChipInput, setNewServiceChipInput] = useState("");
  const [quickCoordInput, setQuickCoordInput] = useState("");

  // Map preview modal state
  const [previewMapLocation, setPreviewMapLocation] = useState<any | null>(null);

  // Showroom delete confirmation modal
  const [deletingLocation, setDeletingLocation] = useState<any | null>(null);

  const {
    data: adminShowrooms = [],
    isLoading: isAdminShowroomsLoading,
    refetch: refetchAdminShowrooms,
  } = trpc.admin.locationsList.useQuery(
    {
      search: showroomSearch || undefined,
      province: showroomProvinceFilter !== "All" ? showroomProvinceFilter : undefined,
      isActive: showroomStatusFilter === "all" ? undefined : showroomStatusFilter === "active",
    },
    { enabled: isAdmin, staleTime: 0, refetchOnMount: "always" }
  );

  const createLocationMutation = trpc.admin.createLocation.useMutation({
    onSuccess: () => {
      utils.admin.locationsList.invalidate();
      utils.locations.list.invalidate();
      setIsLocationModalOpen(false);
      setEditingLocation(null);
      toast.success("Showroom branch added successfully!");
    },
    onError: err => {
      toast.error(err.message || "Failed to add showroom");
    },
  });

  const updateLocationMutation = trpc.admin.updateLocation.useMutation({
    onSuccess: () => {
      utils.admin.locationsList.invalidate();
      utils.locations.list.invalidate();
      setIsLocationModalOpen(false);
      setEditingLocation(null);
      toast.success("Showroom details updated successfully!");
    },
    onError: err => {
      toast.error(err.message || "Failed to update showroom");
    },
  });

  const toggleLocationActiveMutation = trpc.admin.toggleLocationActive.useMutation({
    onSuccess: (_, vars) => {
      utils.admin.locationsList.invalidate();
      utils.locations.list.invalidate();
      toast.success(vars.isActive ? "Showroom activated and visible online" : "Showroom hidden from website");
    },
    onError: err => {
      toast.error(err.message || "Failed to update showroom status");
    },
  });

  const deleteLocationMutation = trpc.admin.deleteLocation.useMutation({
    onSuccess: () => {
      utils.admin.locationsList.invalidate();
      utils.locations.list.invalidate();
      setDeletingLocation(null);
      toast.success("Showroom deleted successfully");
    },
    onError: err => {
      toast.error(err.message || "Failed to delete showroom");
    },
  });

  const seedLocationsMutation = trpc.admin.seedDefaultLocations.useMutation({
    onSuccess: data => {
      utils.admin.locationsList.invalidate();
      utils.locations.list.invalidate();
      toast.success(`Successfully restored all ${data.count} official Manju Group branches!`);
    },
    onError: err => {
      toast.error(err.message || "Failed to seed showrooms");
    },
  });

  const handleOpenCreateLocation = () => {
    setEditingLocation({
      name: "",
      badge: "Authorized Experience Center",
      type: "showroom",
      address: "",
      city: "",
      province: "Western Province",
      phone: "+94 11 ",
      directCall: "+9411",
      email: "",
      manager: "",
      latitude: "6.9034",
      longitude: "79.8524",
      hours: "Mon–Sat: 8:30 AM – 6:30 PM",
      imageUrl: "",
      featured: false,
      isActive: true,
      sortOrder: (adminShowrooms?.length || 0) + 1,
    });
    setLocationServicesChips([
      "All 4 Core Brands Showcase",
      "Water Test Lab & Installations",
      "After-Sales & Warranty Support",
    ]);
    setQuickCoordInput("");
    setIsLocationModalOpen(true);
  };

  const handleOpenEditLocation = (loc: any) => {
    setEditingLocation({
      id: loc.id,
      name: loc.name,
      badge: loc.badge || "",
      type: loc.type || "showroom",
      address: loc.address,
      city: loc.city,
      province: loc.province || "Western Province",
      phone: loc.phone || "",
      directCall: loc.directCall || "",
      email: loc.email || "",
      manager: loc.manager || "",
      latitude: String(loc.latitude || "6.9034"),
      longitude: String(loc.longitude || "79.8524"),
      hours: loc.hours || "Mon–Sat: 8:30 AM – 6:30 PM",
      imageUrl: loc.imageUrl || "",
      featured: !!loc.featured,
      isActive: loc.isActive !== false,
      sortOrder: loc.sortOrder ?? 0,
    });
    setLocationServicesChips(Array.isArray(loc.services) ? [...loc.services] : []);
    setQuickCoordInput("");
    setIsLocationModalOpen(true);
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    if (!editingLocation.name.trim()) {
      toast.error("Showroom name is required");
      return;
    }
    if (!editingLocation.city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!editingLocation.address.trim()) {
      toast.error("Physical address is required");
      return;
    }

    const payload = {
      name: editingLocation.name.trim(),
      badge: editingLocation.badge?.trim() || null,
      type: editingLocation.type || "showroom",
      address: editingLocation.address.trim(),
      city: editingLocation.city.trim(),
      province: editingLocation.province || "Western Province",
      phone: editingLocation.phone?.trim() || null,
      directCall: editingLocation.directCall?.trim() || (editingLocation.phone ? editingLocation.phone.replace(/[^0-9+]/g, "") : null),
      email: editingLocation.email?.trim() || null,
      manager: editingLocation.manager?.trim() || null,
      latitude: editingLocation.latitude || "6.9034",
      longitude: editingLocation.longitude || "79.8524",
      openingHours: editingLocation.hours || "Mon–Sat: 8:30 AM – 6:30 PM",
      services: locationServicesChips,
      imageUrl: editingLocation.imageUrl?.trim() ? editingLocation.imageUrl.trim() : null,
      featured: !!editingLocation.featured,
      isActive: editingLocation.isActive,
      sortOrder: Number(editingLocation.sortOrder) || 0,
    };

    if (editingLocation.id) {
      updateLocationMutation.mutate({
        id: editingLocation.id,
        ...payload,
      });
    } else {
      createLocationMutation.mutate(payload);
    }
  };

  const handleAutoParseCoordinates = () => {
    if (!quickCoordInput.trim()) return;
    const parsed = parseCoordinatesInput(quickCoordInput);
    if (parsed) {
      setEditingLocation((prev: any) => ({
        ...prev,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
      }));
      toast.success(`Coordinates extracted: ${parsed.latitude}, ${parsed.longitude}`);
      setQuickCoordInput("");
      return;
    }
    toast.error("Could not parse coordinates. Please enter latitude & longitude directly or paste a Google Maps link");
  };

  const handleAddServiceChip = () => {
    const trimmed = newServiceChipInput.trim();
    if (!trimmed) return;
    if (locationServicesChips.includes(trimmed)) {
      toast.info("Service tag already added");
      return;
    }
    setLocationServicesChips(prev => [...prev, trimmed]);
    setNewServiceChipInput("");
  };

  const handleRemoveServiceChip = (chipToRemove: string) => {
    setLocationServicesChips(prev => prev.filter(c => c !== chipToRemove));
  };

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

  const handleDeleteProduct = (id: number, name?: string) => {
    if (
      confirm(
        `Are you sure you want to permanently delete "${name || "this product"}" from the live catalog? This action cannot be undone.`
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

  // ── AUTH GATE: CPANEL PASSCODE LOGIN ─────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A101D] text-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <SEO title="cPanel Login | Manju Group Enterprise" noindex />

        {/* Ambient Server Rack Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF6C2C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md bg-[#131E31] border border-slate-700/80 rounded-2xl shadow-2xl relative overflow-hidden z-10"
        >
          {/* Top cPanel Brand Strip */}
          <div className="h-1.5 bg-gradient-to-r from-[#FF6C2C] via-[#FF854D] to-[#0052B4]" />

          <div className="p-8">
            <div className="text-center mb-6">
              {/* cPanel Iconic Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FF6C2C]/15 border border-[#FF6C2C]/40 text-[#FF6C2C] text-xs font-black tracking-wider uppercase mb-3">
                <span className="w-5 h-5 rounded bg-[#FF6C2C] text-white flex items-center justify-center text-[11px] font-black">
                  cP
                </span>
                <span>cPanel® Suite v118.0</span>
              </div>

              <div className="flex items-center justify-center gap-2 mb-1">
                <img
                  src="/manju-logo.webp"
                  alt="Manju Group"
                  className="w-8 h-8 object-contain"
                />
                <h1 className="text-2xl font-black font-display tracking-tight text-white">
                  MANJU GROUP
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Enterprise Web & Branch Control Panel
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Administrator Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type="password"
                    value={passcode}
                    onChange={e => {
                      setPasscode(e.target.value);
                      setAuthError(false);
                    }}
                    placeholder="Enter admin passcode (e.g. manju2026)"
                    autoFocus
                    className={`w-full pl-10 pr-4 py-3 bg-[#0C1424] text-white rounded-xl border text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                      authError
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-slate-700 focus:border-[#FF6C2C] focus:ring-[#FF6C2C]/20"
                    }`}
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>Invalid administrator passcode. Access denied.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={verifyPasscodeMutation.isPending}
                className="w-full py-3.5 rounded-xl bg-[#FF6C2C] hover:bg-[#E55A1B] active:scale-[0.99] text-white text-sm font-black tracking-wider uppercase shadow-lg shadow-[#FF6C2C]/25 disabled:opacity-60 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {verifyPasscodeMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Log In to cPanel</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-3">
              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Server size={12} className="text-emerald-400" />
                  srv1.manjugroup.lk
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-blue-400" />
                  Port 2083 (SSL)
                </span>
              </div>

              <div>
                <Link href="/">
                  <span className="text-xs text-slate-400 hover:text-[#FF6C2C] transition-colors cursor-pointer inline-flex items-center gap-1 font-medium">
                    ← Return to Public Website
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── CPANEL TOOLS DATA & CATEGORIES ──────────────────────────────────────
  const tabTitles: Record<AdminTab, { category: string; title: string }> = {
    tools: { category: "cPanel Suite", title: "Tools & Applications" },
    dashboard: { category: "Marketing & Analytics", title: "Executive Dashboard" },
    products: { category: "Product & Inventory Engine", title: "Products & Inventory" },
    orders: { category: "Sales & Commerce Engine", title: "Orders & Fulfillment" },
    customers: { category: "Sales & Commerce Engine", title: "Customers Directory" },
    users: { category: "Sales & Commerce Engine", title: "User Accounts & Roles" },
    reviews: { category: "Product & Inventory Engine", title: "Customer Reviews & Moderation" },
    ads: { category: "Marketing & Media Studio", title: "Banner & Video Ads Manager" },
    contacts_bank: { category: "Gateways & Preferences", title: "Hotlines, Map & Bank Accounts" },
    showrooms: { category: "Branches & Showroom Control", title: "Showroom Network cPanel" },
    inquiries: { category: "Gateways & Preferences", title: "Inquiries & Leads CRM" },
    erp: { category: "System & Integration Gateways", title: "ERP Integration Gateway" },
    ai_audit: { category: "System & Integration Gateways", title: "AI Assistant Audit Log" },
  };

  const cpanelCategories = useMemo(() => [
    {
      id: "showrooms",
      title: "Branches & Showroom Control Panel",
      icon: MapPin,
      badge: `${adminShowrooms?.length ?? 9} Showrooms`,
      description: "Island-wide retail showroom branches, GPS coordinates, store managers and real-time website sync",
      tools: [
        {
          id: "showrooms" as AdminTab,
          title: "Showroom Network cPanel",
          description: "Full control: add new branches, edit details, toggle online/hidden status, inspect table or grid views",
          badge: `${adminShowrooms?.length ?? 9} Online`,
          badgeColor: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
          icon: Building2,
          iconBg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          keywords: "showrooms branches locations islandwide maps stores outlets negombo colombo kandy galle",
        },
        {
          id: "showrooms" as AdminTab,
          title: "Google Maps & GPS Auto-Parser",
          description: "Auto-extract coordinates from Google Maps URLs, live inline map preview, and customer directions",
          badge: "GPS Sync",
          badgeColor: "bg-blue-500/15 text-blue-700 border-blue-500/30",
          icon: Navigation,
          iconBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          keywords: "gps latitude longitude map google pins directions location",
        },
        {
          id: "showrooms" as AdminTab,
          title: "Branch Managers & Direct Call",
          description: "Configure store managers, 1-click customer phone calling links, opening hours, and WhatsApp",
          badge: "Direct Contact",
          badgeColor: "bg-amber-500/15 text-amber-700 border-amber-500/30",
          icon: PhoneCall,
          iconBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          keywords: "manager phone telephone hotline direct hours schedule contact",
        },
        {
          id: "public_locations" as const,
          title: "Public Showroom Page (/locations)",
          description: "View the live public showroom directory with GPS distance finder, map directions, and service chips",
          badge: "Public Site ↗",
          badgeColor: "bg-slate-500/15 text-slate-700 border-slate-500/30",
          icon: ExternalLink,
          iconBg: "bg-slate-500/10 text-slate-600 border-slate-500/20",
          isExternal: true,
          externalUrl: "/locations",
          keywords: "public customer website preview directory islandwide",
        },
      ],
    },
    {
      id: "products",
      title: "Product & Inventory Engine",
      icon: Package,
      badge: `${productsData?.total ?? productsList.length} SKUs`,
      description: "Manage product lines for Dew Motors, Dew Plus, DEW+ AC, Manju Dew Super, stock and customer reviews",
      tools: [
        {
          id: "products" as AdminTab,
          title: "Products & Catalog Manager",
          description: "Create and edit items across 4 flagship brands, manage specifications, variants and image galleries",
          badge: `${productsData?.total ?? productsList.length} SKUs`,
          badgeColor: "bg-indigo-500/15 text-indigo-700 border-indigo-500/30",
          icon: Package,
          iconBg: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
          keywords: "products catalog bikes air conditioners super solar inventory sku",
        },
        {
          id: "products" as AdminTab,
          title: "Stock & Pricing Inventory",
          description: "Real-time stock quantities, sale pricing discounts, warranty terms, and instant out-of-stock toggles",
          badge: "Realtime",
          badgeColor: "bg-cyan-500/15 text-cyan-700 border-cyan-500/30",
          icon: Layers,
          iconBg: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
          keywords: "stock quantity inventory price sale discount in stock out of stock",
        },
        {
          id: "reviews" as AdminTab,
          title: "Customer Reviews & Moderation",
          description: "Moderate customer testimonials, approve 5-star ratings, verify buyer badges, and filter spam",
          badge: `${adminReviewsData?.total ?? 0} Reviews`,
          badgeColor: "bg-amber-500/15 text-amber-700 border-amber-500/30",
          icon: Star,
          iconBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          keywords: "reviews ratings feedback stars testimonials comments moderation",
        },
      ],
    },
    {
      id: "orders",
      title: "Sales & Commerce Engine",
      icon: ShoppingCart,
      badge: `${ordersData?.total ?? ordersList.length} Orders`,
      description: "Order dispatch workflow, payment verifications, shipping statuses and customer directory",
      tools: [
        {
          id: "orders" as AdminTab,
          title: "Orders & Fulfillment Manager",
          description: "Track orders across pending, confirmed, processing, shipped, and delivered states with slips",
          badge: `${ordersData?.total ?? ordersList.length} Orders`,
          badgeColor: "bg-blue-500/15 text-blue-700 border-blue-500/30",
          icon: ShoppingCart,
          iconBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          keywords: "orders sales cart fulfillment shipping delivery status invoice",
        },
        {
          id: "customers" as AdminTab,
          title: "Customer Directory & CRM",
          description: "View customer profiles, lifetime purchase value, contact numbers, and delivery addresses",
          badge: `${customersData?.total ?? 0} Customers`,
          badgeColor: "bg-violet-500/15 text-violet-700 border-violet-500/30",
          icon: UserCircle,
          iconBg: "bg-violet-500/10 text-violet-600 border-violet-500/20",
          keywords: "customers clients directory users contacts spend history",
        },
        {
          id: "users" as AdminTab,
          title: "User Accounts & Authentication",
          description: "Manage registered user accounts, Supabase authentication providers and administrative roles",
          badge: `${usersData?.total || 0} Accounts`,
          badgeColor: "bg-purple-500/15 text-purple-700 border-purple-500/30",
          icon: Users,
          iconBg: "bg-purple-500/10 text-purple-600 border-purple-500/20",
          keywords: "users auth login google supabase roles admin permissions",
        },
      ],
    },
    {
      id: "marketing",
      title: "Marketing & Media Studio",
      icon: Megaphone,
      badge: "Media Studio",
      description: "Hero slider banners, video showcase ads, promotional ribbon banners and executive analytics",
      tools: [
        {
          id: "ads" as AdminTab,
          title: "Banner & Video Ads Manager",
          description: "Configure homepage hero slides, video reels showcase, promotional banners and button links",
          badge: "Hero + Home",
          badgeColor: "bg-rose-500/15 text-rose-700 border-rose-500/30",
          icon: Megaphone,
          iconBg: "bg-rose-500/10 text-rose-600 border-rose-500/20",
          keywords: "ads banner hero video slides promo marketing campaign media",
        },
        {
          id: "dashboard" as AdminTab,
          title: "Executive Metrics & Analytics",
          description: "Gross revenue charts, brand breakdown, order volume analytics and business intelligence",
          badge: "BI Dashboard",
          badgeColor: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
          icon: LayoutDashboard,
          iconBg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          keywords: "dashboard analytics revenue charts kpi metrics stats executive bi",
        },
      ],
    },
    {
      id: "gateways",
      title: "Gateways, Preferences & Hotlines",
      icon: PhoneCall,
      badge: "Gateways",
      description: "Corporate hotline numbers, corporate bank accounts for manual slips and customer leads CRM",
      tools: [
        {
          id: "contacts_bank" as AdminTab,
          title: "Hotlines, Map & Bank Accounts",
          description: "Manage 24/7 hotline numbers, WhatsApp link, corporate bank details (BOC, Commercial, Sampath)",
          badge: "Live Sync",
          badgeColor: "bg-teal-500/15 text-teal-700 border-teal-500/30",
          icon: PhoneCall,
          iconBg: "bg-teal-500/10 text-teal-600 border-teal-500/20",
          keywords: "hotline phone whatsapp bank account boc commercial sampath slip",
        },
        {
          id: "inquiries" as AdminTab,
          title: "Inquiries & Leads CRM",
          description: "Manage customer contact messages, quote requests, and showroom test ride inquiries",
          badge: unreadInquiriesCount ? `${unreadInquiriesCount} New` : "Inbox",
          badgeColor: unreadInquiriesCount ? "bg-red-500/15 text-red-700 border-red-500/30" : "bg-slate-500/15 text-slate-700 border-slate-500/30",
          icon: Mail,
          iconBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          keywords: "inquiries messages leads contact test drive quotes questions",
        },
      ],
    },
    {
      id: "system",
      title: "System & Integration Gateways",
      icon: Cpu,
      badge: "Enterprise",
      description: "ERP gateway synchronizer, AI assistant conversation audit logs and database health tools",
      tools: [
        {
          id: "erp" as AdminTab,
          title: "ERP Integration Gateway",
          description: "Monitor ERP sync status, automated webhook synchronization and enterprise ledger feeds",
          badge: "Connected",
          badgeColor: "bg-blue-500/15 text-blue-700 border-blue-500/30",
          icon: Cpu,
          iconBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          keywords: "erp sync gateway enterprise sap ledger integration webhook",
        },
        {
          id: "ai_audit" as AdminTab,
          title: "AI Assistant Audit Log",
          description: "Audit automated AI assistant customer conversations, query sentiment and knowledge responses",
          badge: "AI Active",
          badgeColor: "bg-purple-500/15 text-purple-700 border-purple-500/30",
          icon: Bot,
          iconBg: "bg-purple-500/10 text-purple-600 border-purple-500/20",
          keywords: "ai bot assistant audit chat customer conversation log",
        },
      ],
    },
  ], [adminShowrooms?.length, productsData?.total, productsList.length, adminReviewsData?.total, ordersData?.total, ordersList.length, customersData?.total, usersData?.total, unreadInquiriesCount]);

  const filteredCpanelCategories = useMemo(() => {
    if (!cpanelSearch.trim()) return cpanelCategories;
    const q = cpanelSearch.toLowerCase().trim();
    return cpanelCategories
      .map(cat => ({
        ...cat,
        tools: cat.tools.filter(
          tool =>
            tool.title.toLowerCase().includes(q) ||
            tool.description.toLowerCase().includes(q) ||
            tool.keywords.toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.tools.length > 0);
  }, [cpanelCategories, cpanelSearch]);

  // ── MAIN CPANEL DASHBOARD ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 flex flex-col font-sans">
      <SEO title="cPanel Control Center | Manju Group" noindex />

      {/* ── TOP CPANEL APPBAR ────────────────────────────────────────────── */}
      <header className="bg-[#0F172A] text-white border-b border-slate-800 border-t-2 border-t-[#FF6C2C] sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: cPanel Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab("tools")}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
              title="Return to cPanel Home"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6C2C] to-[#E55A1B] text-white flex items-center justify-center font-black text-base shadow-lg shadow-[#FF6C2C]/25 group-hover:scale-105 transition-transform">
                cP
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight text-white flex items-center gap-1">
                    cPanel<span className="text-[#FF6C2C] text-xs font-bold">®</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FF6C2C]/20 border border-[#FF6C2C]/40 text-[#FF6C2C] text-[10px] font-black uppercase tracking-wider">
                    Jupiter Pro
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  Manju Group Web & Branch Control Panel
                </p>
              </div>
            </button>
          </div>

          {/* Center: Live Tool Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </div>
              <input
                type="text"
                value={cpanelSearch}
                onChange={e => {
                  setCpanelSearch(e.target.value);
                  if (activeTab !== "tools" && e.target.value) {
                    setActiveTab("tools");
                  }
                }}
                placeholder="Jump to a feature (e.g. showrooms, products, orders, maps)..."
                className="w-full pl-9 pr-8 py-2 bg-[#1E293B] text-white rounded-xl border border-slate-700 text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#FF6C2C] focus:ring-1 focus:ring-[#FF6C2C] transition-all"
              />
              {cpanelSearch && (
                <button
                  onClick={() => setCpanelSearch("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions & Server Health */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Live Server Health Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Status: Online & Active</span>
            </div>

            <button
              onClick={handleTriggerERPSync}
              disabled={isSyncingERP}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Manual ERP Sync"
            >
              <RefreshCw
                size={13}
                className={isSyncingERP ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">
                {isSyncingERP ? "Syncing..." : "Sync ERP"}
              </span>
            </button>

            <Link href="/" target="_blank">
              <button className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
                <span>View Site</span>
                <ExternalLink size={13} />
              </button>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 text-xs font-bold transition-all cursor-pointer"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* ── CPANEL SUB-NAVIGATION RIBBON ─────────────────────────────────── */}
      <div className="bg-[#131E31] border-b border-slate-800 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Breadcrumb Trail */}
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <button
              onClick={() => setActiveTab("tools")}
              className={`flex items-center gap-1 font-bold cursor-pointer transition-colors ${
                activeTab === "tools"
                  ? "text-[#FF6C2C]"
                  : "text-slate-300 hover:text-[#FF6C2C]"
              }`}
            >
              <Grid size={13} />
              <span>cPanel Home</span>
            </button>
            {activeTab !== "tools" && (
              <>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400 hidden sm:inline">
                  {tabTitles[activeTab]?.category || "Module"}
                </span>
                <span className="text-slate-600 hidden sm:inline">/</span>
                <span className="text-white font-black">
                  {tabTitles[activeTab]?.title || activeTab}
                </span>
              </>
            )}
          </div>

          {/* Quick-Jump Tool Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {[
              { id: "tools", label: "All Tools", icon: Grid },
              { id: "showrooms", label: "Showrooms", icon: MapPin, badge: adminShowrooms?.length ?? 9 },
              { id: "products", label: "Products", icon: Package, badge: productsData?.total ?? productsList.length },
              { id: "orders", label: "Orders", icon: ShoppingCart, badge: ordersData?.total ?? ordersList.length },
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "contacts_bank", label: "Contacts & Bank", icon: PhoneCall },
            ].map(pill => {
              const Icon = pill.icon;
              const isSelected = activeTab === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setActiveTab(pill.id as AdminTab)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-[#FF6C2C] text-white shadow-sm"
                      : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60"
                  }`}
                >
                  <Icon size={12} />
                  <span>{pill.label}</span>
                  {pill.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isSelected
                          ? "bg-black/25 text-white"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {pill.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT NAVIGATION SIDEBAR (3 COLS) ────────────────────────────── */}
        <aside className="lg:col-span-3 space-y-4">
          {/* cPanel Navigation Menu */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-1">
            <div className="px-3 py-1.5 mb-1 text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>cPanel Modules</span>
              <span className="text-[10px] text-[#FF6C2C]">v118.0</span>
            </div>

            {[
              { id: "tools", label: "cPanel Tools (Home)", icon: Grid, badge: "Home" },
              { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
              {
                id: "showrooms",
                label: "Showroom Network cPanel",
                icon: MapPin,
                badge: adminShowrooms?.length ?? SHOWROOMS_DATA.length,
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
                label: "Users & Accounts",
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
                id: "inquiries",
                label: "Inquiries & Leads CRM",
                icon: Mail,
                badge: unreadInquiriesCount || undefined,
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0F172A] text-white border-l-4 border-l-[#FF6C2C] shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={isActive ? "text-[#FF6C2C]" : "text-slate-500"} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive
                          ? "bg-[#FF6C2C] text-white"
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

          {/* cPanel General Information Panel (Signature cPanel Feature) */}
          <div className="bg-[#0F172A] text-white rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-300">
              <div className="flex items-center gap-2">
                <Server size={14} className="text-[#FF6C2C]" />
                <span className="text-xs font-black uppercase tracking-wider">
                  General Information
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>Current User:</span>
                <span className="font-mono font-bold text-white">admin (root)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Primary Domain:</span>
                <span className="font-mono text-blue-300">manjugroup.lk</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Shared IP:</span>
                <span className="font-mono text-slate-200">104.21.58.102</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>SSL / TLS Certificate:</span>
                <span className="text-emerald-400 font-bold">Active (TLS 1.3)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Server Time:</span>
                <span className="text-slate-300">Asia/Colombo (UTC+5:30)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800">
                <span>ERP Live Sync:</span>
                <span className="font-bold text-emerald-300">{lastSyncTime}</span>
              </div>
            </div>
          </div>

          {/* cPanel Statistics & Usage Panel */}
          <div className="bg-[#131E31] text-white rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-300">
              <Activity size={14} className="text-cyan-400" />
              <span className="text-xs font-black uppercase tracking-wider">
                Statistics & Quotas
              </span>
            </div>

            <div className="space-y-3 text-[11px]">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span>Showroom Nodes</span>
                  <span className="font-bold text-emerald-400">9 / 9 Online (100%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400">
                <span>Active Products:</span>
                <span className="font-bold text-white">{productsData?.total ?? productsList.length} SKUs</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Orders Handled:</span>
                <span className="font-bold text-white">{ordersList.length} Processed</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── RIGHT CONTENT CANVAS (9 COLS) ───────────────────────────────── */}
        <main className="lg:col-span-9 space-y-6">
          {/* CPANEL TOOLS & APPLICATIONS (ICONIC CPANEL GRID VIEW) */}
          {activeTab === "tools" && (
            <div className="space-y-6">
              {/* Top Welcome Banner */}
              <div className="bg-gradient-to-br from-[#0F172A] via-[#131E31] to-[#1E293B] border border-slate-700/80 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6C2C]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-6 h-6 rounded bg-[#FF6C2C] text-white flex items-center justify-center text-xs font-black shadow-md">
                        cP
                      </span>
                      <h1 className="text-xl font-black font-display tracking-tight text-white">
                        Tools & Module Center
                      </h1>
                      <span className="px-2 py-0.5 rounded-full bg-[#FF6C2C]/20 border border-[#FF6C2C]/40 text-[#FF6C2C] text-[10px] font-black uppercase tracking-wider">
                        Enterprise Jupiter Theme
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                      Centralized cPanel control for island-wide showrooms, product catalogs, customer orders, multimedia ad campaigns, and enterprise backend gateways.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setActiveTab("showrooms")}
                      className="px-3.5 py-2 rounded-xl bg-[#FF6C2C] hover:bg-[#E55A1B] text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-[#FF6C2C]/20 transition-all cursor-pointer"
                    >
                      <MapPin size={13} />
                      <span>Showroom Network</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("products")}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Package size={13} />
                      <span>Products</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ShoppingCart size={13} />
                      <span>Orders</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Search Active Banner */}
              {cpanelSearch && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs text-amber-800">
                  <div className="flex items-center gap-2">
                    <Search size={14} className="text-amber-600" />
                    <span>Showing matching tools for: <strong>"{cpanelSearch}"</strong></span>
                  </div>
                  <button
                    onClick={() => setCpanelSearch("")}
                    className="text-amber-700 hover:underline font-bold cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Categorized cPanel Accordions */}
              <div className="space-y-5">
                {filteredCpanelCategories.map(cat => {
                  const CatIcon = cat.icon;
                  const isCollapsed = !!collapsedCategories[cat.id];

                  return (
                    <div
                      key={cat.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      {/* Section Header */}
                      <div
                        onClick={() => toggleCategory(cat.id)}
                        className="px-5 py-3.5 bg-slate-50 hover:bg-slate-100/80 border-b border-slate-200/80 flex items-center justify-between cursor-pointer transition-colors select-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-[#0F172A] text-[#FF6C2C] flex items-center justify-center shadow-xs">
                            <CatIcon size={15} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                {cat.title}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                                {cat.tools.length} Tools
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 hidden sm:block">
                              {cat.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400">
                          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </div>
                      </div>

                      {/* Tool Grid */}
                      {!isCollapsed && (
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {cat.tools.map((tool, idx) => {
                            const ToolIcon = tool.icon;
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  if (tool.isExternal && tool.externalUrl) {
                                    window.open(tool.externalUrl, "_blank");
                                  } else {
                                    setActiveTab(tool.id as AdminTab);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }
                                }}
                                className="group p-4 rounded-xl border border-slate-200 hover:border-[#FF6C2C] hover:shadow-md bg-white hover:bg-slate-50/50 transition-all cursor-pointer flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-2.5">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${tool.iconBg} group-hover:scale-105 transition-transform`}>
                                      <ToolIcon size={18} />
                                    </div>
                                    {tool.badge && (
                                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${tool.badgeColor}`}>
                                        {tool.badge}
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="text-xs font-black text-slate-900 group-hover:text-[#FF6C2C] transition-colors leading-snug mb-1">
                                    {tool.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                                    {tool.description}
                                  </p>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-[#FF6C2C] transition-colors">
                                  <span>{tool.isExternal ? "Open Website" : "Launch Module"}</span>
                                  <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredCpanelCategories.length === 0 && (
                  <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                    <Search size={32} className="mx-auto mb-2 text-slate-400" />
                    <p className="font-bold text-slate-700 text-sm">No cPanel tools matched "{cpanelSearch}"</p>
                    <p className="text-xs text-slate-500 mt-1">Try searching for keywords like showroom, products, orders, maps, or bank.</p>
                    <button
                      onClick={() => setCpanelSearch("")}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BREADCRUMB STRIP FOR INDIVIDUAL MODULE WORKSPACES */}
          {activeTab !== "tools" && (
            <div className="bg-white rounded-xl px-4 py-2.5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <button
                  onClick={() => setActiveTab("tools")}
                  className="flex items-center gap-1 text-[#FF6C2C] hover:underline font-bold cursor-pointer"
                >
                  <Grid size={13} />
                  <span>cPanel Home</span>
                </button>
                <span>/</span>
                <span className="text-slate-400 hidden sm:inline">
                  {tabTitles[activeTab]?.category || "Module"}
                </span>
                <span className="text-slate-400 hidden sm:inline">/</span>
                <span className="text-slate-900 font-black">
                  {tabTitles[activeTab]?.title || activeTab}
                </span>
              </div>

              <button
                onClick={() => setActiveTab("tools")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                <ChevronLeft size={13} />
                <span>Return to All Tools</span>
              </button>
            </div>
          )}

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
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  disabled={deletingProductId === p.id}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                  title="Delete Product"
                                >
                                  {deletingProductId === p.id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={14} />
                                  )}
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

              {/* SECTION 2.5: HERO SLIDER ADS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="text-[#0052B4]" size={18} />
                    <h4 className="font-extrabold text-sm text-slate-900">
                      2.5 Hero Slider Ads (Bottom Right Carousel)
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                      {localAdConfig.heroSlides?.length || 0} Slides
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setLocalAdConfig({
                          ...localAdConfig,
                          heroSlides: [
                            ...(localAdConfig.heroSlides || []),
                            {
                              id: `slide-${Date.now()}`,
                              badge: "NEW",
                              title: "New Product",
                              category: "Category",
                              price: "Rs. 0",
                              imageUrl: "",
                              linkUrl: "/products",
                            },
                          ],
                        });
                      }}
                      className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
                    >
                      + Add Slide
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {localAdConfig.heroSlides?.map((slide, sIdx) => (
                    <div
                      key={slide.id || sIdx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 relative"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const newSlides = [...localAdConfig.heroSlides];
                          newSlides.splice(sIdx, 1);
                          setLocalAdConfig({
                            ...localAdConfig,
                            heroSlides: newSlides,
                          });
                        }}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-md"
                        title="Remove Slide"
                      >
                        <Trash2 size={14} />
                      </button>

                      <span className="font-black text-xs text-slate-800 uppercase block">
                        Slide #{sIdx + 1}
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">
                                Badge
                              </label>
                              <input
                                type="text"
                                value={slide.badge}
                                onChange={e => {
                                  const newSlides = [...localAdConfig.heroSlides];
                                  newSlides[sIdx] = { ...slide, badge: e.target.value };
                                  setLocalAdConfig({ ...localAdConfig, heroSlides: newSlides });
                                }}
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">
                                Category Text
                              </label>
                              <input
                                type="text"
                                value={slide.category}
                                onChange={e => {
                                  const newSlides = [...localAdConfig.heroSlides];
                                  newSlides[sIdx] = { ...slide, category: e.target.value };
                                  setLocalAdConfig({ ...localAdConfig, heroSlides: newSlides });
                                }}
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-blue-600"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              Product Title
                            </label>
                            <input
                              type="text"
                              value={slide.title}
                              onChange={e => {
                                const newSlides = [...localAdConfig.heroSlides];
                                newSlides[sIdx] = { ...slide, title: e.target.value };
                                setLocalAdConfig({ ...localAdConfig, heroSlides: newSlides });
                              }}
                              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">
                                Price Text
                              </label>
                              <input
                                type="text"
                                value={slide.price}
                                onChange={e => {
                                  const newSlides = [...localAdConfig.heroSlides];
                                  newSlides[sIdx] = { ...slide, price: e.target.value };
                                  setLocalAdConfig({ ...localAdConfig, heroSlides: newSlides });
                                }}
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-black text-amber-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">
                                Target Link URL
                              </label>
                              <input
                                type="text"
                                value={slide.linkUrl}
                                onChange={e => {
                                  const newSlides = [...localAdConfig.heroSlides];
                                  newSlides[sIdx] = { ...slide, linkUrl: e.target.value };
                                  setLocalAdConfig({ ...localAdConfig, heroSlides: newSlides });
                                }}
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono"
                              />
                            </div>
                          </div>

                          <MediaUploader
                            label="Upload Slide Image (Auto-WebP)"
                            currentUrl={slide.imageUrl}
                            accept="image"
                            recommendedDimensions="800x450"
                            onUploaded={url => {
                              const newSlides = [...localAdConfig.heroSlides];
                              newSlides[sIdx] = { ...slide, imageUrl: url };
                              setLocalAdConfig({ ...localAdConfig, heroSlides: newSlides });
                            }}
                          />
                        </div>

                        {/* Preview */}
                        <div className="rounded-2xl bg-slate-900 border border-slate-700 p-4 flex flex-col justify-end relative overflow-hidden min-h-[190px] shadow-sm">
                          {slide.imageUrl && (
                            <img
                              src={slide.imageUrl}
                              alt="Preview"
                              className="absolute inset-0 w-full h-full object-cover opacity-60"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                          <div className="relative z-10 flex flex-col gap-1">
                            <span className="text-blue-400 font-bold text-[10px] uppercase tracking-wider">
                              {slide.category}
                            </span>
                            <h5 className="font-extrabold text-white text-lg leading-tight line-clamp-2">
                              {slide.title}
                            </h5>
                            <span className="text-amber-400 font-black text-sm mt-1">
                              {slide.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                        <th className="p-4 min-w-[260px]">Product</th>
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
                            <td className="p-4 min-w-[260px]">
                              {(() => {
                                const staticMatch = !rev.productSlug
                                  ? STATIC_PRODUCTS.find(
                                      p =>
                                        String(p.id) === String(rev.productId) ||
                                        p.slug === String(rev.productId)
                                    )
                                  : null;

                                const prodName =
                                  rev.productName ||
                                  staticMatch?.name ||
                                  `Product #${rev.productId}`;
                                const prodSlug =
                                  rev.productSlug ||
                                  staticMatch?.slug ||
                                  rev.productId;
                                const prodSku =
                                  rev.productSku || staticMatch?.sku || null;
                                const brandLabel =
                                  rev.brandName ||
                                  staticMatch?.brandName ||
                                  null;
                                const categoryLabel =
                                  rev.categoryName ||
                                  (staticMatch as any)?.category ||
                                  null;
                                const rawImage =
                                  rev.productImageUrl ||
                                  staticMatch?.imageUrl ||
                                  null;
                                const imgUrl = getProductImage(
                                  rawImage,
                                  prodName
                                );
                                const targetUrl = `/products/${prodSlug}#reviews`;

                                return (
                                  <Link
                                    href={targetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 p-1.5 -m-1.5 rounded-xl hover:bg-blue-50/80 transition-all cursor-pointer min-w-[240px]"
                                    title={`Click to view "${prodName}" in live showroom (opens in new tab)`}
                                  >
                                    {/* Product Thumbnail */}
                                    <div className="relative w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center group-hover:border-blue-300 group-hover:shadow-md transition-all">
                                      {imgUrl ? (
                                        <img
                                          src={imgUrl}
                                          alt={prodName}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          onError={e => {
                                            (e.currentTarget as HTMLElement).style.display = "none";
                                          }}
                                        />
                                      ) : (
                                        <Package
                                          size={20}
                                          className="text-slate-400"
                                        />
                                      )}
                                    </div>

                                    {/* Product Meta */}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                                          {prodName}
                                        </span>
                                        <ExternalLink
                                          size={12}
                                          className="text-slate-400 group-hover:text-blue-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                      </div>

                                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                        {brandLabel && (
                                          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100/70 text-[#0052B4]">
                                            {brandLabel}
                                          </span>
                                        )}
                                        {categoryLabel && (
                                          <span className="text-[10px] text-slate-500 font-medium">
                                            {categoryLabel}
                                          </span>
                                        )}
                                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                                          {prodSku
                                            ? `SKU: ${prodSku}`
                                            : `ID: ${rev.productId}`}
                                        </span>
                                      </div>
                                    </div>
                                  </Link>
                                );
                              })()}
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

          {/* TAB 4: SHOWROOMS & BRANCH NETWORK (cPanel) */}
          {activeTab === "showrooms" && (
            <div className="space-y-6">
              {/* cPanel Header & Metric Summary Cards */}
              <div className="bg-gradient-to-r from-slate-900 via-[#001D4A] to-[#002D62] p-6 rounded-3xl text-white shadow-xl border border-blue-900/40 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider text-blue-300 mb-2">
                      <MapPin size={13} className="text-blue-300" />
                      <span>Manju Group • Showroom Control Panel (cPanel)</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-black font-display tracking-tight text-white">
                      National Showroom & Experience Center Network
                    </h2>
                    <p className="text-blue-100/80 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
                      Control live branches, physical addresses, GPS pinpoints, direct hotline lines, branch managers, and customer services across Sri Lanka.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href="/locations"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all border border-white/20 backdrop-blur-sm cursor-pointer"
                      title="View public showroom page in a new tab"
                    >
                      <ExternalLink size={14} />
                      <span>View Public Page</span>
                    </a>

                    <button
                      onClick={() => {
                        if (confirm("Restore the complete 9 official Manju Group branches with full contact details and GPS coordinates?")) {
                          seedLocationsMutation.mutate();
                        }
                      }}
                      disabled={seedLocationsMutation.isPending}
                      className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-blue-200 text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all border border-blue-500/30 cursor-pointer disabled:opacity-50"
                      title="Reset / sync official 9 showroom branches"
                    >
                      <RefreshCw size={14} className={seedLocationsMutation.isPending ? "animate-spin" : ""} />
                      <span>{seedLocationsMutation.isPending ? "Syncing..." : "Sync 9 Official Branches"}</span>
                    </button>

                    <button
                      onClick={handleOpenCreateLocation}
                      className="px-4 py-2.5 bg-[#0052B4] hover:bg-blue-600 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                    >
                      <Plus size={16} />
                      <span>Add New Showroom</span>
                    </button>
                  </div>
                </div>

                {/* 4 Metric Counter Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
                  <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                    <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">
                      Total Locations
                    </span>
                    <span className="text-2xl font-black text-white mt-1 block">
                      {adminShowrooms.length}
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                    <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                      Active Online
                    </span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 block">
                      {adminShowrooms.filter(s => s.isActive).length}
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                    <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">
                      Provinces Covered
                    </span>
                    <span className="text-2xl font-black text-white mt-1 block">
                      {new Set(adminShowrooms.map(s => s.province).filter(Boolean)).size || 5} / 9
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                      Flagship Centers
                    </span>
                    <span className="text-2xl font-black text-amber-300 mt-1 block">
                      {adminShowrooms.filter(s => s.featured).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* cPanel Filter & Control Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Search showroom by name, city, address, or manager..."
                      value={showroomSearch}
                      onChange={e => setShowroomSearch(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#0052B4] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                    />
                    {showroomSearch && (
                      <button
                        onClick={() => setShowroomSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Province Filter */}
                  <div className="w-full sm:w-48">
                    <select
                      value={showroomProvinceFilter}
                      onChange={e => setShowroomProvinceFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-[#0052B4] cursor-pointer"
                    >
                      <option value="All">All Provinces</option>
                      <option value="Western Province">Western Province</option>
                      <option value="Central Province">Central Province</option>
                      <option value="Southern Province">Southern Province</option>
                      <option value="North Western Province">North Western Province</option>
                      <option value="Northern Province">Northern Province</option>
                      <option value="North Central Province">North Central Province</option>
                      <option value="Sabaragamuwa Province">Sabaragamuwa</option>
                      <option value="Uva Province">Uva Province</option>
                      <option value="Eastern Province">Eastern Province</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setShowroomStatusFilter("all")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        showroomStatusFilter === "all"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      All ({adminShowrooms.length})
                    </button>
                    <button
                      onClick={() => setShowroomStatusFilter("active")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        showroomStatusFilter === "active"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setShowroomStatusFilter("inactive")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        showroomStatusFilter === "inactive"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Hidden
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {/* View Mode Toggle */}
                  <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setShowroomsViewMode("table")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        showroomsViewMode === "table"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="High-density cPanel data table"
                    >
                      <Layers size={13} />
                      <span>Table</span>
                    </button>
                    <button
                      onClick={() => setShowroomsViewMode("grid")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        showroomsViewMode === "grid"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="Visual card grid view"
                    >
                      <Building2 size={13} />
                      <span>Cards</span>
                    </button>
                  </div>

                  <button
                    onClick={() => refetchAdminShowrooms()}
                    disabled={isAdminShowroomsLoading}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                    title="Refresh data"
                  >
                    <RefreshCw size={14} className={isAdminShowroomsLoading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isAdminShowroomsLoading && adminShowrooms.length === 0 && (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0052B4] mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-600">Loading showroom network records...</p>
                </div>
              )}

              {/* Empty State */}
              {!isAdminShowroomsLoading && adminShowrooms.length === 0 && (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <MapPin size={36} className="text-slate-300 mx-auto" />
                  <h4 className="text-base font-black text-slate-800">No showrooms match your filter</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try clearing the search or reset the official 9 showrooms catalog.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowroomSearch("");
                        setShowroomProvinceFilter("All");
                        setShowroomStatusFilter("all");
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={() => seedLocationsMutation.mutate()}
                      disabled={seedLocationsMutation.isPending}
                      className="px-4 py-2 bg-[#0052B4] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw size={13} className={seedLocationsMutation.isPending ? "animate-spin" : ""} />
                      <span>Sync 9 Official Branches</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TABLE VIEW (cPanel Style High-Density Table) */}
              {showroomsViewMode === "table" && adminShowrooms.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                          <th className="py-3 px-4">Branch / Showroom</th>
                          <th className="py-3 px-4">Type & Province</th>
                          <th className="py-3 px-4">Manager & Contact</th>
                          <th className="py-3 px-4">GPS & Address</th>
                          <th className="py-3 px-4">In-Store Services</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {adminShowrooms.map(loc => (
                          <tr
                            key={loc.id}
                            className={`hover:bg-blue-50/40 transition-colors ${
                              !loc.isActive ? "bg-slate-50/60 opacity-75" : ""
                            }`}
                          >
                            {/* Branch details */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                {loc.imageUrl ? (
                                  <img
                                    src={loc.imageUrl}
                                    alt={loc.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-[#0052B4] flex items-center justify-center font-black text-sm shrink-0 border border-blue-200">
                                    <MapPin size={18} />
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-slate-900 text-xs">
                                      {loc.name}
                                    </span>
                                    {loc.featured && (
                                      <span
                                        className="text-amber-500"
                                        title="Featured Flagship Experience Center"
                                      >
                                        <Star size={13} className="fill-amber-400" />
                                      </span>
                                    )}
                                  </div>
                                  {loc.badge && (
                                    <span className="inline-block mt-0.5 text-[10px] font-bold text-[#0052B4] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                      {loc.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Type & Province */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5">
                                <span className="inline-block font-extrabold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {loc.type || "showroom"}
                                </span>
                                <div className="font-bold text-slate-900">
                                  📍 {loc.city}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {loc.province || "Western"}
                                </div>
                              </div>
                            </td>

                            {/* Manager & Contact */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                {loc.manager && (
                                  <div className="font-bold text-slate-800 flex items-center gap-1">
                                    <UserCircle size={13} className="text-blue-500 shrink-0" />
                                    <span>{loc.manager}</span>
                                  </div>
                                )}
                                {loc.phone && (
                                  <div className="text-slate-600 flex items-center gap-1">
                                    <Phone size={12} className="text-slate-400 shrink-0" />
                                    <a
                                      href={`tel:${loc.directCall || loc.phone}`}
                                      className="hover:text-blue-600 font-semibold"
                                    >
                                      {loc.phone}
                                    </a>
                                  </div>
                                )}
                                {loc.email && (
                                  <div className="text-[11px] text-slate-400">
                                    {loc.email}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* GPS & Address */}
                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="space-y-1">
                                <p className="text-[11px] text-slate-700 line-clamp-2 font-medium">
                                  {loc.address}
                                </p>
                                <button
                                  onClick={() => setPreviewMapLocation(loc)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                >
                                  <Navigation size={11} />
                                  <span>{loc.latitude}, {loc.longitude}</span>
                                </button>
                              </div>
                            </td>

                            {/* Services */}
                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(loc.services) && loc.services.length > 0 ? (
                                  loc.services.slice(0, 2).map((srv: string, i: number) => (
                                    <span
                                      key={i}
                                      className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                                    >
                                      ✓ {srv}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">None specified</span>
                                )}
                                {Array.isArray(loc.services) && loc.services.length > 2 && (
                                  <span className="text-[10px] font-extrabold text-blue-600 px-1 py-0.5">
                                    +{loc.services.length - 2} more
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Active Toggle Switch */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() =>
                                  toggleLocationActiveMutation.mutate({
                                    id: loc.id,
                                    isActive: !loc.isActive,
                                  })
                                }
                                disabled={toggleLocationActiveMutation.isPending}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition-all inline-flex items-center gap-1 shadow-xs ${
                                  loc.isActive
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                }`}
                                title="Click to toggle showroom visibility"
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    loc.isActive ? "bg-emerald-600" : "bg-slate-400"
                                  }`}
                                />
                                <span>{loc.isActive ? "Online" : "Hidden"}</span>
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => setPreviewMapLocation(loc)}
                                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="Inspect Google Map"
                                >
                                  <Navigation size={14} />
                                </button>
                                <button
                                  onClick={() => handleOpenEditLocation(loc)}
                                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Showroom"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => setDeletingLocation(loc)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Showroom"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* GRID VIEW (Visual Cards) */}
              {showroomsViewMode === "grid" && adminShowrooms.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {adminShowrooms.map(loc => (
                    <div
                      key={loc.id}
                      className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md ${
                        loc.isActive
                          ? "border-slate-200 hover:border-blue-400"
                          : "border-slate-200 bg-slate-50/70 opacity-75"
                      }`}
                    >
                      <div>
                        {loc.imageUrl && (
                          <div className="w-full h-36 rounded-xl overflow-hidden mb-3.5 bg-slate-100 border border-slate-200 relative">
                            <img
                              src={loc.imageUrl}
                              alt={loc.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                              {loc.city}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-extrabold uppercase text-[#0052B4] tracking-wider truncate">
                            {loc.badge || loc.type || "Showroom"}
                          </span>
                          <button
                            onClick={() =>
                              toggleLocationActiveMutation.mutate({
                                id: loc.id,
                                isActive: !loc.isActive,
                              })
                            }
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black cursor-pointer ${
                              loc.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {loc.isActive ? "● Online" : "○ Hidden"}
                          </button>
                        </div>

                        <h4 className="font-black text-base text-slate-900 leading-snug mb-2 flex items-center gap-1.5">
                          <span>{loc.name}</span>
                          {loc.featured && (
                            <Star size={14} className="fill-amber-400 text-amber-400 shrink-0" />
                          )}
                        </h4>

                        <div className="space-y-1.5 text-xs text-slate-600 font-medium mb-3">
                          <p className="flex items-start gap-1.5">
                            <MapPin size={13} className="text-[#0052B4] shrink-0 mt-0.5" />
                            <span>{loc.address}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Phone size={13} className="text-emerald-600 shrink-0" />
                            <span>{loc.phone || "No phone"} • Mgr: {loc.manager || "N/A"}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Clock size={12} className="shrink-0" />
                            <span>{loc.hours}</span>
                          </p>
                        </div>

                        {Array.isArray(loc.services) && loc.services.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4 pt-2 border-t border-slate-100">
                            {loc.services.slice(0, 3).map((srv: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded"
                              >
                                ✓ {srv}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setPreviewMapLocation(loc)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Navigation size={12} className="text-[#0052B4]" />
                          <span>Map</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditLocation(loc)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0052B4] rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setDeletingLocation(loc)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                            title="Delete showroom"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: INQUIRIES & LEADS CRM */}
          {activeTab === "inquiries" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    Customer Leads & Quote Inquiries
                    {isInquiriesLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Incoming inquiries from Contact page and Product detail forms
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => refetchInquiries()} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Refresh</button>
                </div>
              </div>

              <div className="space-y-3">
                {inquiriesList.length === 0 && !isInquiriesLoading && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                    <p className="text-sm font-bold text-slate-400">No inquiries found.</p>
                  </div>
                )}
                {inquiriesList.map(inq => {
                  const subjectText = inq.subject || "";
                  const match = subjectText.match(/^\[(.*?)\] (.*)$/);
                  const department = match ? match[1] : "General Inquiry";
                  const cleanSubject = match ? match[2] : subjectText;
                  
                  return (
                  <div
                    key={inq.id}
                    className={`bg-white p-5 rounded-2xl border shadow-sm space-y-2 transition-all ${!inq.isRead ? "border-blue-300 bg-blue-50/30" : "border-slate-200 opacity-80"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {inq.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
                          {department}
                        </span>
                        {!inq.isRead && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black animate-pulse">
                            New
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(inq.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-800">
                      {cleanSubject}
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                      {inq.message}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="text-xs text-slate-500 font-medium">
                        Contact:{" "}
                        <span className="font-bold text-slate-800">
                          {inq.phone || "N/A"}
                        </span>{" "}
                        ({inq.email})
                      </div>
                      <div className="flex items-center gap-2">
                        {!inq.isRead && (
                          <button
                            onClick={() => markInquiryReadMutation.mutate({ id: inq.id })}
                            disabled={markInquiryReadMutation.isPending}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
                          >
                            <Check size={12} />
                            <span>Mark as Read</span>
                          </button>
                        )}
                        {inq.phone && (
                          <a
                            href={`https://wa.me/94${inq.phone.replace(/^0/, "").replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1 transition-colors"
                          >
                            <Phone size={12} />
                            <span>Reply on WhatsApp</span>
                          </a>
                        )}
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to permanently delete this inquiry?")) {
                              deleteInquiryMutation.mutate({ id: inq.id });
                            }
                          }}
                          disabled={deleteInquiryMutation.isPending}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
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
        {/* MODAL: ADD / EDIT SHOWROOM (cPanel Form) */}
        {isLocationModalOpen && editingLocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl border border-slate-200 text-xs my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0052B4] font-black text-[10px] uppercase mb-1">
                    <MapPin size={11} />
                    <span>Showroom Control Panel</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingLocation.id ? `Edit Showroom: ${editingLocation.name}` : "Add New Showroom Branch"}
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Configure branch details, Google Maps GPS coordinates, hotline numbers, and customer services.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLocationModalOpen(false);
                    setEditingLocation(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveLocation} className="space-y-6">
                {/* Section 1: Basic Identity */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                    1. Branch Identity &amp; Type
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">
                        Showroom Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingLocation.name}
                        onChange={e => setEditingLocation({ ...editingLocation, name: e.target.value })}
                        placeholder="e.g. Manju Group — Colombo Flagship Store"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Badge / Subtitle
                      </label>
                      <input
                        type="text"
                        value={editingLocation.badge}
                        onChange={e => setEditingLocation({ ...editingLocation, badge: e.target.value })}
                        placeholder="e.g. Headquarters &amp; Experience Center"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Branch Type
                      </label>
                      <select
                        value={editingLocation.type}
                        onChange={e => setEditingLocation({ ...editingLocation, type: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none cursor-pointer"
                      >
                        <option value="showroom">Showroom</option>
                        <option value="experience_center">Experience Center</option>
                        <option value="service_center">Service Center</option>
                        <option value="flagship">Flagship Store</option>
                        <option value="megastore">Megastore</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Branch Manager Name
                      </label>
                      <input
                        type="text"
                        value={editingLocation.manager}
                        onChange={e => setEditingLocation({ ...editingLocation, manager: e.target.value })}
                        placeholder="e.g. Saman Jayawardena"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Sort Order (Display Sequence)
                      </label>
                      <input
                        type="number"
                        value={editingLocation.sortOrder}
                        onChange={e => setEditingLocation({ ...editingLocation, sortOrder: Number(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Address & Province */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                    2. Physical Location &amp; Address
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingLocation.city}
                        onChange={e => setEditingLocation({ ...editingLocation, city: e.target.value })}
                        placeholder="e.g. Colombo, Kandy, Galle"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Province
                      </label>
                      <select
                        value={editingLocation.province}
                        onChange={e => setEditingLocation({ ...editingLocation, province: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none cursor-pointer"
                      >
                        <option value="Western Province">Western Province</option>
                        <option value="Central Province">Central Province</option>
                        <option value="Southern Province">Southern Province</option>
                        <option value="North Western Province">North Western Province</option>
                        <option value="Northern Province">Northern Province</option>
                        <option value="North Central Province">North Central Province</option>
                        <option value="Sabaragamuwa Province">Sabaragamuwa Province</option>
                        <option value="Uva Province">Uva Province</option>
                        <option value="Eastern Province">Eastern Province</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">
                        Full Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingLocation.address}
                        onChange={e => setEditingLocation({ ...editingLocation, address: e.target.value })}
                        placeholder="e.g. No. 234, Galle Road, Kollupitiya, Colombo 03"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: GPS Coordinates & Google Map */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                      3. GPS Coordinates &amp; Map Pinpoint
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold">
                      Interactive Live Google Map
                    </span>
                  </div>

                  {/* Auto-Parse Helper Box */}
                  <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 space-y-2">
                    <label className="font-extrabold text-[#0052B4] text-[11px] flex items-center gap-1.5">
                      <Navigation size={13} />
                      <span>Quick-Paste Google Maps Link or Coordinates:</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste maps link (e.g. https://maps.google.com/?q=6.9034,79.8524 or 6.9034, 79.8524)"
                        value={quickCoordInput}
                        onChange={e => setQuickCoordInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#0052B4]"
                      />
                      <button
                        type="button"
                        onClick={handleAutoParseCoordinates}
                        className="px-3 py-1.5 bg-[#0052B4] hover:bg-blue-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                      >
                        Auto-Parse GPS
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Latitude
                      </label>
                      <input
                        type="text"
                        value={editingLocation.latitude}
                        onChange={e => setEditingLocation({ ...editingLocation, latitude: e.target.value })}
                        placeholder="e.g. 6.9034"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Longitude
                      </label>
                      <input
                        type="text"
                        value={editingLocation.longitude}
                        onChange={e => setEditingLocation({ ...editingLocation, longitude: e.target.value })}
                        placeholder="e.g. 79.8524"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                    </div>
                  </div>

                  {/* Inline Live Google Maps Preview */}
                  {editingLocation.latitude && editingLocation.longitude && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                        Live Map Pin Preview:
                      </span>
                      <div className="h-40 rounded-xl overflow-hidden border border-slate-300 relative shadow-inner">
                        <iframe
                          key={`${editingLocation.latitude}-${editingLocation.longitude}`}
                          src={`https://maps.google.com/maps?q=${editingLocation.latitude},${editingLocation.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          title="GPS Preview"
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Contact & Hours */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                    4. Contact Numbers &amp; Operating Hours
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Public Phone (Display)
                      </label>
                      <input
                        type="text"
                        value={editingLocation.phone}
                        onChange={e => setEditingLocation({ ...editingLocation, phone: e.target.value })}
                        placeholder="+94 11 234 5678"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Direct Call / WhatsApp (tel:)
                      </label>
                      <input
                        type="text"
                        value={editingLocation.directCall}
                        onChange={e => setEditingLocation({ ...editingLocation, directCall: e.target.value })}
                        placeholder="+94112345678"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Branch Email
                      </label>
                      <input
                        type="email"
                        value={editingLocation.email}
                        onChange={e => setEditingLocation({ ...editingLocation, email: e.target.value })}
                        placeholder="colombo@manjugroup.lk"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="font-bold text-slate-700 block mb-1">
                        Opening &amp; Closing Hours
                      </label>
                      <input
                        type="text"
                        value={editingLocation.hours}
                        onChange={e => setEditingLocation({ ...editingLocation, hours: e.target.value })}
                        placeholder="Mon–Sat: 8:30 AM – 7:00 PM | Sun: 9:00 AM – 4:00 PM"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Services Offered (Tag Manager) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                      5. In-Store Services &amp; Highlights (Tags)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {locationServicesChips.length} active tags
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add service tag (e.g. Electric Bike Test Rides, Water Test Lab, Same-Day Pickup)..."
                      value={newServiceChipInput}
                      onChange={e => setNewServiceChipInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddServiceChip();
                        }
                      }}
                      className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#0052B4]"
                    />
                    <button
                      type="button"
                      onClick={handleAddServiceChip}
                      className="px-4 py-2 bg-[#0052B4] hover:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                    >
                      + Add Tag
                    </button>
                  </div>

                  {/* Quick Preset Suggestions */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 mr-1">Suggestions:</span>
                    {[
                      "All 4 Core Brands Showcase",
                      "Electric Bike Test Rides",
                      "Dew Plus 4K TVs Demo",
                      "DEW+ AC Demo Units",
                      "Water Test Lab",
                      "RO Water Filter Installations",
                      "Same-Day Pickup",
                      "Instant Installment Approval",
                      "Spare Parts Depot",
                      "After-Sales Service Center",
                    ].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (!locationServicesChips.includes(tag)) {
                            setLocationServicesChips(prev => [...prev, tag]);
                          }
                        }}
                        className="text-[10px] font-semibold bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>

                  {/* Active Chips List */}
                  {locationServicesChips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60">
                      {locationServicesChips.map((chip, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-100 text-[#0052B4] px-3 py-1 rounded-lg border border-blue-200 shadow-2xs"
                        >
                          <span>✓ {chip}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveServiceChip(chip)}
                            className="hover:text-red-600 cursor-pointer font-black"
                            title="Remove tag"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 6: Media & Visibility */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                      6. Photo &amp; Online Status
                    </span>
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/70 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      Direct Photo Upload
                    </span>
                  </div>

                  <div>
                    <MediaUploader
                      label="Upload Showroom Photo (Exterior / Interior)"
                      currentUrl={editingLocation.imageUrl || ""}
                      accept="image"
                      recommendedDimensions="Landscape 1200×800 or 16:9 HD"
                      onUploaded={url => {
                        setEditingLocation({
                          ...editingLocation,
                          imageUrl: url,
                        });
                      }}
                    />
                  </div>

                  {/* Fallback URL input for external links if needed */}
                  <div className="pt-2 border-t border-slate-200/70">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Or Paste Image URL (Optional Fallback):
                    </label>
                    <input
                      type="text"
                      value={editingLocation.imageUrl || ""}
                      onChange={e => setEditingLocation({ ...editingLocation, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... or uploaded photo link"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:ring-2 focus:ring-[#0052B4] outline-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featuredShowroomToggle"
                        checked={editingLocation.featured}
                        onChange={e => setEditingLocation({ ...editingLocation, featured: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-[#0052B4] focus:ring-[#0052B4] cursor-pointer"
                      />
                      <label
                        htmlFor="featuredShowroomToggle"
                        className="font-bold text-slate-800 cursor-pointer text-xs"
                      >
                        ⭐ Featured Flagship Experience Center
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="activeShowroomToggle"
                        checked={editingLocation.isActive}
                        onChange={e => setEditingLocation({ ...editingLocation, isActive: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label
                        htmlFor="activeShowroomToggle"
                        className="font-bold text-slate-800 cursor-pointer text-xs"
                      >
                        🟢 Published &amp; Active on Live Website
                      </label>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLocationModalOpen(false);
                      setEditingLocation(null);
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLocationMutation.isPending || updateLocationMutation.isPending}
                    className="px-6 py-2.5 bg-[#0052B4] hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-900/20 cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {(createLocationMutation.isPending || updateLocationMutation.isPending) && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    <span>
                      {editingLocation.id
                        ? updateLocationMutation.isPending
                          ? "Saving Changes..."
                          : "Save Showroom Changes"
                        : createLocationMutation.isPending
                        ? "Creating Showroom..."
                        : "Create Showroom"}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL: INTERACTIVE MAP PREVIEW */}
        {previewMapLocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 text-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    Google Maps Pinpoint: {previewMapLocation.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {previewMapLocation.address} ({previewMapLocation.latitude}, {previewMapLocation.longitude})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewMapLocation(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                <iframe
                  src={`https://maps.google.com/maps?q=${previewMapLocation.latitude},${previewMapLocation.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title={previewMapLocation.name}
                  className="w-full h-full"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${previewMapLocation.latitude},${previewMapLocation.longitude}&travelmode=driving`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#0052B4] hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Navigation size={13} />
                  <span>Open in Google Maps App</span>
                  <ExternalLink size={12} />
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewMapLocation(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL: DELETE CONFIRMATION */}
        {deletingLocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-xs space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 size={22} />
              </div>

              <div className="text-center space-y-1">
                <h4 className="text-base font-black text-slate-900">
                  Delete Showroom Branch?
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Are you sure you want to permanently remove <strong className="text-slate-900">{deletingLocation.name}</strong> from the website directory?
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingLocation(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteLocationMutation.isPending}
                  onClick={() => deleteLocationMutation.mutate({ id: deletingLocation.id })}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-md cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {deleteLocationMutation.isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : null}
                  <span>{deleteLocationMutation.isPending ? "Deleting..." : "Yes, Delete"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
