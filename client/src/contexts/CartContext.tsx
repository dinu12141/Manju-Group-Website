import React, { createContext, useContext, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getSessionId } from "@/lib/data";
import { toast } from "sonner";
import CartSidebar from "@/components/CartSidebar";

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
      try {
        await addItemMutation.mutateAsync({
          productId,
          variantId,
          quantity,
          unitPrice,
          sessionId: user ? undefined : sessionId,
        });
        await refetch();
        toast.success(`${productName} added to cart`);
        if (openDrawerOnAdd) {
          setIsDrawerOpen(true);
        }
      } catch (err) {
        console.error("Failed to add item to cart:", err);
        toast.error("Failed to add item to cart");
      }
    },
    [addItemMutation, user, sessionId, refetch]
  );

  const updateItem = useCallback(
    async (itemId: number, quantity: number) => {
      try {
        await updateItemMutation.mutateAsync({
          itemId,
          quantity,
          sessionId: user ? undefined : sessionId,
        });
        await refetch();
      } catch (err) {
        console.error("Failed to update cart item:", err);
      }
    },
    [updateItemMutation, user, sessionId, refetch]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      try {
        await removeItemMutation.mutateAsync({ itemId });
        await refetch();
        toast.info("Item removed from cart");
      } catch (err) {
        console.error("Failed to remove item:", err);
      }
    },
    [removeItemMutation, refetch]
  );

  const clearCart = useCallback(async () => {
    try {
      await clearMutation.mutateAsync({
        sessionId: user ? undefined : sessionId,
      });
      await refetch();
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  }, [clearMutation, user, sessionId, refetch]);

  return (
    <CartContext.Provider
      value={{
        items: (data?.items as CartItem[]) ?? [],
        total: data?.total ?? 0,
        itemCount: data?.itemCount ?? 0,
        isLoading,
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
