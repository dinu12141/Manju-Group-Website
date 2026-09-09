import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getSessionId } from "@/lib/data";
import { toast } from "sonner";
import CartSidebar from "@/components/CartSidebar";
import { STATIC_PRODUCTS } from "@/lib/staticData";

export interface CartItem {
  id: number;
  cartId: number;
  productId: number | string;
  variantId?: number | null;
  quantity: number;
  unitPrice: string | number;
  productName?: string | null;
  productSlug?: string | null;
  brandName?: string | null;
  isInStock?: boolean | null;
  imageUrl?: string | null;
}

interface CartContextValue {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (
    productId: number | string,
    unitPrice: number,
    productName: string,
    variantId?: number,
    quantity?: number,
    openDrawerOnAdd?: boolean
  ) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "manju_local_cart_v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sessionId] = useState(() => {
    try {
      return getSessionId();
    } catch {
      return `session_${Date.now()}`;
    }
  });

  // Local storage state for instant 0ms latency & offline resilience
  const [localItems, setLocalItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to local storage on changes
  const saveLocalItems = useCallback((items: CartItem[]) => {
    setLocalItems(items);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn("Could not save to localStorage", e);
      }
    }
  }, []);

  const {
    data: serverData,
    isLoading,
    refetch,
  } = trpc.cart.get.useQuery(
    { sessionId: user ? undefined : sessionId },
    {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  // Sync server items if available and local is empty
  useEffect(() => {
    if (
      serverData?.items &&
      Array.isArray(serverData.items) &&
      serverData.items.length > 0
    ) {
      if (localItems.length === 0) {
        saveLocalItems(serverData.items as CartItem[]);
      }
    }
  }, [serverData, localItems.length, saveLocalItems]);

  const addItemMutation = trpc.cart.addItem.useMutation();
  const updateItemMutation = trpc.cart.updateItem.useMutation();
  const removeItemMutation = trpc.cart.removeItem.useMutation();
  const clearMutation = trpc.cart.clear.useMutation();

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const addItem = useCallback(
    async (
      productId: number | string,
      unitPrice: number,
      productName: string,
      variantId?: number,
      quantity: number = 1,
      openDrawerOnAdd: boolean = true
    ) => {
      // 1. Instant Local State Update
      const prodIdStr = String(productId);
      const staticMatch = STATIC_PRODUCTS.find(p => String(p.id) === prodIdStr);

      const existingIndex = localItems.findIndex(
        i => String(i.productId) === prodIdStr
      );

      let updatedList: CartItem[];
      if (existingIndex > -1) {
        updatedList = [...localItems];
        updatedList[existingIndex] = {
          ...updatedList[existingIndex],
          quantity: updatedList[existingIndex].quantity + quantity,
        };
      } else {
        const newItem: CartItem = {
          id: Date.now(),
          cartId: 1,
          productId: prodIdStr,
          variantId: variantId ?? null,
          quantity,
          unitPrice,
          productName:
            productName || staticMatch?.name || `Product #${productId}`,
          productSlug: staticMatch?.slug ?? "products",
          brandName: staticMatch?.brandName ?? "Manju Group",
          isInStock: true,
          imageUrl: staticMatch?.imageUrl ?? null,
        };
        updatedList = [...localItems, newItem];
      }

      saveLocalItems(updatedList);

      if (openDrawerOnAdd) {
        setIsDrawerOpen(true);
      }

      // 2. Background Server Sync (Safe, Non-Blocking)
      try {
        await addItemMutation.mutateAsync({
          productId,
          variantId,
          quantity,
          unitPrice,
          sessionId: user ? undefined : sessionId,
        });
      } catch (err) {
        console.warn("Background server cart sync deferred:", err);
      }
    },
    [localItems, saveLocalItems, addItemMutation, user, sessionId]
  );

  const updateItem = useCallback(
    async (itemId: number, quantity: number) => {
      let updated: CartItem[];
      if (quantity <= 0) {
        updated = localItems.filter(i => i.id !== itemId);
      } else {
        updated = localItems.map(i =>
          i.id === itemId ? { ...i, quantity } : i
        );
      }
      saveLocalItems(updated);

      try {
        await updateItemMutation.mutateAsync({
          itemId,
          quantity,
          sessionId: user ? undefined : sessionId,
        });
      } catch (err) {
        console.warn("Background server update deferred:", err);
      }
    },
    [localItems, saveLocalItems, updateItemMutation, user, sessionId]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      const updated = localItems.filter(i => i.id !== itemId);
      saveLocalItems(updated);

      try {
        await removeItemMutation.mutateAsync({
          itemId,
          sessionId: user ? undefined : sessionId,
        });
      } catch (err) {
        console.warn("Background server remove deferred:", err);
      }
    },
    [localItems, saveLocalItems, removeItemMutation, user, sessionId]
  );

  const clearCart = useCallback(async () => {
    saveLocalItems([]);

    try {
      await clearMutation.mutateAsync({
        sessionId: user ? undefined : sessionId,
      });
    } catch (err) {
      console.warn("Background server clear deferred:", err);
    }
  }, [saveLocalItems, clearMutation, user, sessionId]);

  // Derived totals from active localItems
  const { total, itemCount } = useMemo(() => {
    const tot = localItems.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0
    );
    const count = localItems.reduce((sum, item) => sum + item.quantity, 0);
    return { total: tot, itemCount: count };
  }, [localItems]);

  return (
    <CartContext.Provider
      value={{
        items: localItems,
        total,
        itemCount,
        isLoading: false,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refetch,
      }}
    >
      {children}
      <CartSidebar open={isDrawerOpen} onClose={closeDrawer} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
