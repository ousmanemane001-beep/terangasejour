export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blocked_dates: {
        Row: {
          created_at: string
          date: string
          id: string
          listing_id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          listing_id: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          listing_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_requests: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          guest_id: string
          guests: number
          host_response: string | null
          id: string
          listing_id: string
          message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          guest_id: string
          guests?: number
          host_response?: string | null
          id?: string
          listing_id: string
          message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          guest_id?: string
          guests?: number
          host_response?: string | null
          id?: string
          listing_id?: string
          message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          expires_at: string | null
          guest_email: string | null
          guest_id: string
          guest_name: string | null
          guest_phone: string | null
          guests: number
          id: string
          listing_id: string
          nationality: string | null
          nights: number
          passport_number: string | null
          payment_method: string
          payment_status: string
          price_per_night: number
          service_fee: number
          status: string
          total_price: number
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          expires_at?: string | null
          guest_email?: string | null
          guest_id: string
          guest_name?: string | null
          guest_phone?: string | null
          guests?: number
          id?: string
          listing_id: string
          nationality?: string | null
          nights: number
          passport_number?: string | null
          payment_method?: string
          payment_status?: string
          price_per_night: number
          service_fee?: number
          status?: string
          total_price: number
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          expires_at?: string | null
          guest_email?: string | null
          guest_id?: string
          guest_name?: string | null
          guest_phone?: string | null
          guests?: number
          id?: string
          listing_id?: string
          nationality?: string | null
          nights?: number
          passport_number?: string | null
          payment_method?: string
          payment_status?: string
          price_per_night?: number
          service_fee?: number
          status?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          guest_id: string
          host_id: string
          id: string
          listing_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guest_id: string
          host_id: string
          id?: string
          listing_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guest_id?: string
          host_id?: string
          id?: string
          listing_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          category: Database["public"]["Enums"]["destination_category"]
          created_at: string
          description: string | null
          google_place_id: string | null
          id: string
          image1: string | null
          image2: string | null
          image3: string | null
          image4: string | null
          latitude: number | null
          longitude: number | null
          name: string
          region: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["destination_category"]
          created_at?: string
          description?: string | null
          google_place_id?: string | null
          id?: string
          image1?: string | null
          image2?: string | null
          image3?: string | null
          image4?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          region?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["destination_category"]
          created_at?: string
          description?: string | null
          google_place_id?: string | null
          id?: string
          image1?: string | null
          image2?: string | null
          image3?: string | null
          image4?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          region?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          source: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          source?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          source?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          address: string | null
          admin_remark: string | null
          availability_mode: string
          bathrooms: number
          bedrooms: number
          booking_mode: string
          capacity: number
          city: string | null
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          photos: string[] | null
          price_per_night: number
          property_type: string
          status: string
          title: string
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          address?: string | null
          admin_remark?: string | null
          availability_mode?: string
          bathrooms?: number
          bedrooms?: number
          booking_mode?: string
          capacity?: number
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          photos?: string[] | null
          price_per_night: number
          property_type?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          address?: string | null
          admin_remark?: string | null
          availability_mode?: string
          bathrooms?: number
          bedrooms?: number
          booking_mode?: string
          capacity?: number
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          photos?: string[] | null
          price_per_night?: number
          property_type?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          is_host: boolean
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          is_host?: boolean
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          is_host?: boolean
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          id: string
          listing_id: string
          owner_reply: string | null
          owner_reply_at: string | null
          rating: number
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          listing_id: string
          owner_reply?: string | null
          owner_reply_at?: string | null
          rating: number
          user_id: string
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          owner_reply?: string | null
          owner_reply_at?: string | null
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      safe_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string | null
          is_host: boolean | null
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          is_host?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          is_host?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_notification: {
        Args: {
          _data?: Json
          _message: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: string
      }
      expire_pending_bookings: { Args: never; Returns: undefined }
      get_host_bookings: {
        Args: { _host_user_id: string }
        Returns: {
          check_in: string
          check_out: string
          created_at: string
          guest_id: string
          guest_name: string
          guests: number
          id: string
          listing_id: string
          nights: number
          payment_method: string
          payment_status: string
          price_per_night: number
          service_fee: number
          status: string
          total_price: number
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      destination_category:
        | "ville"
        | "aeroport"
        | "site_historique"
        | "plage"
        | "lac"
        | "restaurant"
        | "hotel"
        | "ile"
        | "parc_naturel"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      destination_category: [
        "ville",
        "aeroport",
        "site_historique",
        "plage",
        "lac",
        "restaurant",
        "hotel",
        "ile",
        "parc_naturel",
      ],
    },
  },
} as const
