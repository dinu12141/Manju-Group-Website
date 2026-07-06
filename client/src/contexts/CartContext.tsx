import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getSessionId } from "@/lib/data";
import { toast } from "sonner";

interface CartItem {
  id: number;
  cartId: number;
  productId: number;
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
  addItem: (
    productId: number,
    unitPrice: number,
    productName: string,
    variantId?: number,
    quantity?: number
  ) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sessionId] = useState(() => {
    try {
      return getSessionId();
    } catch {
      return "";
    }
  });

  const { data, isLoading, refetch } = trpc.cart.get.useQuery(
    { sessionId: user ? undefined : sessionId },
    { refetchOnWindowFocus: false }
  );

  const addItemMutation = trpc.cart.addItem.useMutation({
    onSuccess: () => refetch(),
  });
  const updateItemMutation = trpc.cart.updateItem.useMutation({
    onSuccess: () => refetch(),
  });
  const removeItemMutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => refetch(),
  });
  const clearMutation = trpc.cart.clear.useMutation({
    onSuccess: () => refetch(),
  });

  const addItem = useCallback(
    async (
      productId: number,
      unitPrice: number,
      productName: string,
      variantId?: number,
      quantity: number = 1
    ) => {
      try {
        await addItemMutation.mutateAsync({
          productId,
          variantId,
          quantity,
          unitPrice,
          sessionId: user ? undefined : sessionId,
        });
        toast.success(`${productName} added to cart`);
      } catch {
        toast.error("Failed to add item to cart");
      }
    },
    [addItemMutation, user, sessionId]
  );

  const updateItem = useCallback(
    async (itemId: number, quantity: number) => {
      await updateItemMutation.mutateAsync({
        itemId,
        quantity,
        sessionId: user ? undefined : sessionId,
      });
    },
    [updateItemMutation, user, sessionId]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      await removeItemMutation.mutateAsync({ itemId });
    },
    [removeItemMutation]
  );

  const clearCart = useCallback(async () => {
    await clearMutation.mutateAsync({
      sessionId: user ? undefined : sessionId,
    });
  }, [clearMutation, user, sessionId]);

  return (
    <CartContext.Provider
      value={{
        items: (data?.items as CartItem[]) ?? [],
        total: data?.total ?? 0,
        itemCount: data?.itemCount ?? 0,
        isLoading,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refetch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
