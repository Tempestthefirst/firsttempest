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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          device_info: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          metadata: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          metadata?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hourglass_plans: {
        Row: {
          created_at: string
          current_saved: number
          deduction_amount: number
          end_date: string
          id: string
          last_deduction_date: string | null
          name: string
          next_deduction_date: string
          recurrence: Database["public"]["Enums"]["hourglass_recurrence"]
          status: Database["public"]["Enums"]["hourglass_status"]
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_saved?: number
          deduction_amount: number
          end_date: string
          id?: string
          last_deduction_date?: string | null
          name?: string
          next_deduction_date: string
          recurrence: Database["public"]["Enums"]["hourglass_recurrence"]
          status?: Database["public"]["Enums"]["hourglass_status"]
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_saved?: number
          deduction_amount?: number
          end_date?: string
          id?: string
          last_deduction_date?: string | null
          name?: string
          next_deduction_date?: string
          recurrence?: Database["public"]["Enums"]["hourglass_recurrence"]
          status?: Database["public"]["Enums"]["hourglass_status"]
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      money_rooms: {
        Row: {
          created_at: string
          creator_id: string
          current_amount: number
          description: string | null
          id: string
          invite_code: string
          name: string
          status: Database["public"]["Enums"]["room_status"]
          target_amount: number
          unlock_date: string | null
          unlock_type: Database["public"]["Enums"]["room_unlock_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          current_amount?: number
          description?: string | null
          id?: string
          invite_code: string
          name: string
          status?: Database["public"]["Enums"]["room_status"]
          target_amount: number
          unlock_date?: string | null
          unlock_type: Database["public"]["Enums"]["room_unlock_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          current_amount?: number
          description?: string | null
          id?: string
          invite_code?: string
          name?: string
          status?: Database["public"]["Enums"]["room_status"]
          target_amount?: number
          unlock_date?: string | null
          unlock_type?: Database["public"]["Enums"]["room_unlock_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"] | null
          created_at: string
          daily_transfer_reset_at: string | null
          daily_transfer_total: number | null
          failed_pin_attempts: number | null
          full_name: string
          id: string
          identity_photo_url: string | null
          is_verified: boolean | null
          last_login_at: string | null
          phone_number: string
          pin_hash: string | null
          pin_locked_until: string | null
          pin_salt: string | null
          profile_completeness: number | null
          updated_at: string
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"] | null
          created_at?: string
          daily_transfer_reset_at?: string | null
          daily_transfer_total?: number | null
          failed_pin_attempts?: number | null
          full_name: string
          id: string
          identity_photo_url?: string | null
          is_verified?: boolean | null
          last_login_at?: string | null
          phone_number: string
          pin_hash?: string | null
          pin_locked_until?: string | null
          pin_salt?: string | null
          profile_completeness?: number | null
          updated_at?: string
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"] | null
          created_at?: string
          daily_transfer_reset_at?: string | null
          daily_transfer_total?: number | null
          failed_pin_attempts?: number | null
          full_name?: string
          id?: string
          identity_photo_url?: string | null
          is_verified?: boolean | null
          last_login_at?: string | null
          phone_number?: string
          pin_hash?: string | null
          pin_locked_until?: string | null
          pin_salt?: string | null
          profile_completeness?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      room_contributions: {
        Row: {
          amount: number
          created_at: string
          id: string
          room_id: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          room_id: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          room_id?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_contributions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "money_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_contributions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      room_members: {
        Row: {
          id: string
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "money_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_limits: {
        Row: {
          created_at: string | null
          daily_limit: number
          description: string | null
          id: string
          min_transaction: number
          name: string
          per_transaction_limit: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_limit?: number
          description?: string | null
          id?: string
          min_transaction?: number
          name: string
          per_transaction_limit?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_limit?: number
          description?: string | null
          id?: string
          min_transaction?: number
          name?: string
          per_transaction_limit?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          description: string | null
          device_info: string | null
          failed_at: string | null
          failure_reason: string | null
          from_user_id: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          reference: string | null
          room_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          to_user_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          description?: string | null
          device_info?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          from_user_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          reference?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          to_user_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          description?: string | null
          device_info?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          from_user_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          reference?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          to_user_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          pending_balance: number | null
          updated_at: string
          user_id: string
          virtual_account_bank: string | null
          virtual_account_number: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          pending_balance?: number | null
          updated_at?: string
          user_id: string
          virtual_account_bank?: string | null
          virtual_account_number?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          pending_balance?: number | null
          updated_at?: string
          user_id?: string
          virtual_account_bank?: string | null
          virtual_account_number?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_profile_completeness: {
        Args: { p_user_id: string }
        Returns: number
      }
      contribute_to_room: {
        Args: { p_amount: number; p_room_id: string }
        Returns: Json
      }
      generate_invite_code: { Args: never; Returns: string }
      generate_transaction_reference: { Args: never; Returns: string }
      get_my_wallet: {
        Args: never
        Returns: {
          balance: number
          currency: string
          id: string
          virtual_account_bank: string
          virtual_account_number: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_feature_enabled: { Args: { p_feature_name: string }; Returns: boolean }
      join_room_by_code: { Args: { p_invite_code: string }; Returns: Json }
      log_activity: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type?: string
        }
        Returns: string
      }
      reset_pin_secure: {
        Args: {
          p_new_pin_hash: string
          p_new_pin_salt: string
          p_old_pin_hash: string
          p_phone: string
        }
        Returns: Json
      }
      topup_wallet: {
        Args: { p_amount: number; p_reference?: string }
        Returns: Json
      }
      transfer_money: {
        Args: { p_amount: number; p_description?: string; p_to_user_id: string }
        Returns: Json
      }
      transfer_money_v2: {
        Args: {
          p_amount: number
          p_description?: string
          p_pin_hash?: string
          p_to_user_id: string
        }
        Returns: Json
      }
      update_last_login: { Args: never; Returns: Json }
      verify_pin_for_password_reset: {
        Args: { p_phone: string; p_pin: string }
        Returns: Json
      }
      verify_pin_with_limit: { Args: { p_pin_hash: string }; Returns: Json }
    }
    Enums: {
      account_status: "active" | "suspended" | "pending_verification" | "locked"
      app_role: "admin" | "moderator" | "user"
      hourglass_recurrence: "daily" | "weekly" | "monthly"
      hourglass_status: "active" | "paused" | "completed" | "cancelled"
      room_status: "active" | "locked" | "unlocked" | "cancelled"
      room_unlock_type: "target_reached" | "date_reached" | "manual"
      transaction_status: "pending" | "completed" | "failed"
      transaction_type:
        | "topup"
        | "transfer"
        | "send"
        | "receive"
        | "room_contribution"
        | "room_unlock"
        | "room_refund"
        | "hourglass_deduction"
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
      account_status: ["active", "suspended", "pending_verification", "locked"],
      app_role: ["admin", "moderator", "user"],
      hourglass_recurrence: ["daily", "weekly", "monthly"],
      hourglass_status: ["active", "paused", "completed", "cancelled"],
      room_status: ["active", "locked", "unlocked", "cancelled"],
      room_unlock_type: ["target_reached", "date_reached", "manual"],
      transaction_status: ["pending", "completed", "failed"],
      transaction_type: [
        "topup",
        "transfer",
        "send",
        "receive",
        "room_contribution",
        "room_unlock",
        "room_refund",
        "hourglass_deduction",
      ],
    },
  },
} as const
