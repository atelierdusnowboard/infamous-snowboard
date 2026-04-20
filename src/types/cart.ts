export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  price: number;
  size: number | null;
  image: string | null;
  quantity: number;
}

export interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}
