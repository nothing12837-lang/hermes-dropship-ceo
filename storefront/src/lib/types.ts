import type { Database } from './database.types';
import type { Product as CatalogProduct, PetType, AgeGroup, ProductCategory } from './data/products';

export type { CatalogProduct, PetType, AgeGroup, ProductCategory };
export type Product = CatalogProduct;
export type ProductRow = Database['public']['Tables']['products']['Row'];
export type OrderRow = Database['public']['Tables']['orders']['Row'];

export interface CartItem {
  id: string;
  qty: number;
}

export interface WishlistItem {
  id: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'fulfilled'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem extends CartItem {
  price?: number;
  title?: string;
}

export interface Order {
  id: string;
  user_email: string;
  stripe_session_id?: string | null;
  total_amount: number;
  status: OrderStatus | string;
  cj_order_id?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  created_at: string;
  updated_at?: string;
}

export interface CheckoutRequestItem {
  id: string;
  qty: number;
}

export interface CheckoutRequest {
  items: CheckoutRequestItem[];
  email: string;
  name?: string;
  address?: {
    line1?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
}

export interface CJProductMedia {
  images: string[];
  htmlDescription: string;
  video: string | null;
}

export interface CJListItem {
  productSku: string;
  productNameEn: string;
  sellPrice: string;
  productImage: string;
  productType?: string;
}

export interface CJOrderAddress {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
}

export interface ChatProduct {
  id: string;
  title: string;
  price: number;
  emoji: string;
}

export interface ChatResponse {
  reply: string;
  products?: ChatProduct[];
  needEmail?: boolean;
}

export interface BlogPost {
  slug: string;
  emoji: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  wash: string;
  body: string[];
}

export interface FAQ {
  q: string;
  a: string;
}

export interface VetTip {
  emoji: string;
  name: string;
  tip: string;
}

export interface Review {
  product: string;
  name: string;
  pet: string;
  stars: number;
  text: string;
}
