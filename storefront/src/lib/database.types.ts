export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          compare_at_price: number | null;
          image_url: string;
          cj_sku: string | null;
          category: string;
          is_trending: boolean;
          is_new: boolean;
          slug: string | null;
          emoji: string;
          tag: string;
          tag_color: string;
          tag_bg: string;
          short: string;
          story: string;
          details: Json;
          rating: number;
          reviews: number;
          gradient: string;
          chapter: string;
          pet: string;
          ages: string[];
          benefits: string[];
          safety: string;
          vet_note: string;
          subscribe_eligible: boolean;
          wash: string;
          badges: string[];
          active: boolean;
          stock?: number | null;
          price_inr?: number | null;
          supplier?: string | null;
          market?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description?: string;
          price: number;
          compare_at_price?: number | null;
          image_url?: string;
          cj_sku?: string | null;
          category?: string;
          is_trending?: boolean;
          is_new?: boolean;
          slug?: string | null;
          emoji?: string;
          tag?: string;
          tag_color?: string;
          tag_bg?: string;
          short?: string;
          story?: string;
          details?: Json;
          rating?: number;
          reviews?: number;
          gradient?: string;
          chapter?: string;
          pet?: string;
          ages?: string[];
          benefits?: string[];
          safety?: string;
          vet_note?: string;
          subscribe_eligible?: boolean;
          wash?: string;
          badges?: string[];
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          compare_at_price?: number | null;
          image_url?: string;
          cj_sku?: string | null;
          category?: string;
          is_trending?: boolean;
          is_new?: boolean;
          slug?: string | null;
          emoji?: string;
          tag?: string;
          tag_color?: string;
          tag_bg?: string;
          short?: string;
          story?: string;
          details?: Json;
          rating?: number;
          reviews?: number;
          gradient?: string;
          chapter?: string;
          pet?: string;
          ages?: string[];
          benefits?: string[];
          safety?: string;
          vet_note?: string;
          subscribe_eligible?: boolean;
          wash?: string;
          badges?: string[];
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_email: string;
          stripe_session_id: string | null;
          total_amount: number;
          status: string;
          cj_order_id: string | null;
          meesho_order_id: string | null;
          meesho_url: string | null;
          meesho_cogs_inr: number | null;
          cod_confirmed: boolean | null;
          whatsapp_confirmed_at: string | null;
          rto_risk_level: string | null;
          tracking_number: string | null;
          items: Json;
          subtotal: number;
          shipping: number;
          shipping_name: string | null;
          shipping_address: Json | null;
          tracking_url: string | null;
          fulfillment_attempts: number;
          fulfillment_error: string | null;
          fulfilled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          stripe_session_id?: string | null;
          total_amount?: number;
          status?: string;
          cj_order_id?: string | null;
          tracking_number?: string | null;
          items?: Json;
          subtotal?: number;
          shipping?: number;
          shipping_name?: string | null;
          shipping_address?: Json | null;
          tracking_url?: string | null;
          fulfillment_attempts?: number;
          fulfillment_error?: string | null;
          fulfilled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          stripe_session_id?: string | null;
          total_amount?: number;
          status?: string;
          cj_order_id?: string | null;
          tracking_number?: string | null;
          items?: Json;
          subtotal?: number;
          shipping?: number;
          shipping_name?: string | null;
          shipping_address?: Json | null;
          tracking_url?: string | null;
          fulfillment_attempts?: number;
          fulfillment_error?: string | null;
          fulfilled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}