export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          riding_level: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          riding_level?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          riding_level?: string | null;
          is_admin?: boolean;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          show_in_nav: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          show_in_nav?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          show_in_nav?: boolean;
          sort_order?: number;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          tagline: string | null;
          description: string | null;
          price: number;
          category_id: string | null;
          specs: Json;
          is_published: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          tagline?: string | null;
          description?: string | null;
          price: number;
          category_id?: string | null;
          specs?: Json;
          is_published?: boolean;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          tagline?: string | null;
          description?: string | null;
          price?: number;
          category_id?: string | null;
          specs?: Json;
          is_published?: boolean;
          is_featured?: boolean;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string;
          stock_qty: number;
          price_delta: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          size: string;
          stock_qty?: number;
          price_delta?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          size?: string;
          stock_qty?: number;
          price_delta?: number;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          is_primary?: boolean;
          sort_order?: number;
        };
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          status: OrderStatus;
          shipping_name: string;
          shipping_email: string;
          shipping_address: string;
          shipping_city: string;
          shipping_postal_code: string;
          shipping_country: string;
          subtotal: number;
          shipping_cost: number;
          total: number;
          notes: string | null;
          payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          status?: OrderStatus;
          shipping_name: string;
          shipping_email: string;
          shipping_address: string;
          shipping_city: string;
          shipping_postal_code: string;
          shipping_country: string;
          subtotal: number;
          shipping_cost?: number;
          total: number;
          notes?: string | null;
          payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          status?: OrderStatus;
          shipping_name?: string;
          shipping_email?: string;
          shipping_address?: string;
          shipping_city?: string;
          shipping_postal_code?: string;
          shipping_country?: string;
          subtotal?: number;
          shipping_cost?: number;
          total?: number;
          notes?: string | null;
          payment_intent_id?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_slug: string;
          variant_id: string | null;
          size: string | null;
          unit_price: number;
          quantity: number;
          subtotal: number;
          image_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          product_slug: string;
          variant_id?: string | null;
          size?: string | null;
          unit_price: number;
          quantity: number;
          subtotal: number;
          image_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          product_slug?: string;
          variant_id?: string | null;
          size?: string | null;
          unit_price?: number;
          quantity?: number;
          subtotal?: number;
          image_path?: string | null;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          cover_image_path: string | null;
          is_published: boolean;
          tags: string[];
          author_id: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content: string;
          cover_image_path?: string | null;
          is_published?: boolean;
          tags?: string[];
          author_id?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string;
          cover_image_path?: string | null;
          is_published?: boolean;
          tags?: string[];
          author_id?: string | null;
          published_at?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      order_status: OrderStatus;
    };
  };
}
