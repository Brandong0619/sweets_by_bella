export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
          Cookies: {
            Row: {
              id: string;
              name: string;
              description: string | null;
              price: number;
              image: string | null;
              category: string;
              stock: number;
              created_at: string | null;
            };
            Insert: {
              id?: string;
              name: string;
              description?: string | null;
              price: number;
              image?: string | null;
              category?: string;
              stock?: number;
              created_at?: string | null;
            };
            Update: {
              id?: string;
              name?: string;
              description?: string | null;
              price?: number;
              image?: string | null;
              category?: string;
              stock?: number;
              created_at?: string | null;
            };
            Relationships: [];
          };
      orders: {
        Row: {
          id: string;
          stripe_session_id: string;
          customer_email: string | null;
          customer_name: string | null;
          total_amount: number;
          order_type: string;
          status: string;
          delivery_address: Json | null;
          delivery_phone: string | null;
          delivery_instructions: string | null;
          payment_method: string | null;
          payment_status: string | null;
          order_reference: string | null;
          expires_at: string | null;
          customer_phone: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          stripe_session_id: string;
          customer_email?: string | null;
          customer_name?: string | null;
          total_amount: number;
          order_type: string;
          status?: string;
          delivery_address?: Json | null;
          delivery_phone?: string | null;
          delivery_instructions?: string | null;
          payment_method?: string | null;
          payment_status?: string | null;
          order_reference?: string | null;
          expires_at?: string | null;
          customer_phone?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          stripe_session_id?: string;
          customer_email?: string | null;
          customer_name?: string | null;
          total_amount?: number;
          order_type?: string;
          status?: string;
          delivery_address?: Json | null;
          delivery_phone?: string | null;
          delivery_instructions?: string | null;
          payment_method?: string | null;
          payment_status?: string | null;
          order_reference?: string | null;
          expires_at?: string | null;
          customer_phone?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_name: string;
          product_price: number;
          quantity: number;
          product_image: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_name: string;
          product_price: number;
          quantity: number;
          product_image?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_name?: string;
          product_price?: number;
          quantity?: number;
          product_image?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};


