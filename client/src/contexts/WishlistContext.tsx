import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getSessionId } from "@/lib/data";
import { toast } from "sonner";

export interface WishlistItem {
  id: number;
  productId: string | number;
  productName: string;
  productSlug: string;
  basePrice: number;
  salePrice?: number | null;
  currency: string;
  isInStock: boolean;
  brandName: string;
  imageUrl?: string | null;
}

interface WishlistContextValue {
  items: WishlistItem[];
  itemCount: number;
  isLoading: boolean;
  isWishlisted: (productId: string | number) => boolean;
  toggleWishlist: (
    productId: string | number,
    productName?: string
  ) => Promise<boolean>;
  refetch: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sessionId] = useState(() => {
    try {
      return getSessionId();
    } catch {
      return "";
    }
  });

  const { data, isLoading, refetch } = trpc.wishlist.list.useQuery(
    { sessionId: user ? undefined : sessionId },
    { refetchOnWindowFocus: false }
  );

  const toggleMutation = trpc.wishlist.toggle.useMutation({
    onSuccess: () => refetch(),
  });

  const items = (data as WishlistItem[]) ?? [];

  const wishlistSet = useMemo(() => {
    return new Set(items.map(i => String(i.productId)));
  }, [items]);

  const isWishlisted = useCallback(
    (productId: string | number) => {
      return wishlistSet.has(String(productId));
    },
    [wishlistSet]
  );

  const toggleWishlist = useCallback(
    async (productId: string | number, productName?: string) => {
      try {
        const prodIdStr = String(productId);
        const willAdd = !wishlistSet.has(prodIdStr);

        const res = await toggleMutation.mutateAsync({
          productId: prodIdStr,
          sessionId: user ? undefined : sessionId,
        });

        await refetch();
        return res.added;
      } catch (err: any) {
        console.error("Failed to toggle wishlist:", err);
        toast.error("Failed to update wishlist");
        return false;
      }
    },
    [toggleMutation, user, sessionId, wishlistSet, refetch]
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount: items.length,
        isLoading,
        isWishlisted,
        toggleWishlist,
        refetch,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return ctx;
}
