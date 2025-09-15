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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      portfolio_photos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          professional_profile_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          professional_profile_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          professional_profile_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      professional_profiles: {
        Row: {
          accepts_new_clients: boolean | null
          accepts_weekend_work: boolean | null
          availability_schedule: Json | null
          created_at: string
          description: string | null
          emergency_available: boolean | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          minimum_project_value: number | null
          skills: string[] | null
          specialty: string
          trade_name: string
          travel_radius_km: number | null
          updated_at: string
          user_id: string
          whatsapp_phone: string | null
          work_phone: string | null
          working_days: string[] | null
          working_hours_end: string | null
          working_hours_start: string | null
          years_experience: number | null
        }
        Insert: {
          accepts_new_clients?: boolean | null
          accepts_weekend_work?: boolean | null
          availability_schedule?: Json | null
          created_at?: string
          description?: string | null
          emergency_available?: boolean | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          minimum_project_value?: number | null
          skills?: string[] | null
          specialty: string
          trade_name: string
          travel_radius_km?: number | null
          updated_at?: string
          user_id: string
          whatsapp_phone?: string | null
          work_phone?: string | null
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
          years_experience?: number | null
        }
        Update: {
          accepts_new_clients?: boolean | null
          accepts_weekend_work?: boolean | null
          availability_schedule?: Json | null
          created_at?: string
          description?: string | null
          emergency_available?: boolean | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          minimum_project_value?: number | null
          skills?: string[] | null
          specialty?: string
          trade_name?: string
          travel_radius_km?: number | null
          updated_at?: string
          user_id?: string
          whatsapp_phone?: string | null
          work_phone?: string | null
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      professional_work_zones: {
        Row: {
          created_at: string | null
          id: string
          professional_profile_id: string | null
          work_zone_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          professional_profile_id?: string | null
          work_zone_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          professional_profile_id?: string | null
          work_zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_work_zones_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_work_zones_work_zone_id_fkey"
            columns: ["work_zone_id"]
            isOneToOne: false
            referencedRelation: "work_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          location_city: string | null
          location_province: string | null
          onboarding_completed: boolean | null
          phone: string | null
          updated_at: string
          user_id: string
          user_type: string | null
          whatsapp_phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          location_city?: string | null
          location_province?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id: string
          user_type?: string | null
          whatsapp_phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          location_city?: string | null
          location_province?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      provinces: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          professional_profile_id: string
          rating: number
          reviewer_user_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          professional_profile_id: string
          rating: number
          reviewer_user_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          professional_profile_id?: string
          rating?: number
          reviewer_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_zones: {
        Row: {
          created_at: string | null
          id: string
          name: string
          province_id: string | null
          zone_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          province_id?: string | null
          zone_type?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          province_id?: string | null
          zone_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_zones_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      browse_professionals: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          has_contact_info: boolean
          hourly_rate: number
          id: string
          profile_avatar_url: string
          profile_full_name: string
          profile_location_city: string
          profile_location_province: string
          profile_skills: string[]
          trade_name: string
          user_id: string
          whatsapp_phone: string
          years_experience: number
        }[]
      }
      discover_professionals: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          has_contact_info: boolean
          id: string
          profile_avatar_url: string
          profile_full_name: string
          profile_location_city: string
          profile_location_province: string
          profile_skills: string[]
          trade_name: string
          user_id: string
          years_experience: number
        }[]
      }
      get_reviews_with_names: {
        Args: { _professional_profile_id: string }
        Returns: {
          comment: string
          created_at: string
          id: string
          professional_profile_id: string
          rating: number
          reviewer_name: string
          reviewer_user_id: string
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
    },
  },
} as const
