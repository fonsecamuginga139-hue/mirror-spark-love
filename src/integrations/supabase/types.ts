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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string
          hotmart_monthly_url: string | null
          hotmart_yearly_url: string | null
          id: boolean
          kambafy_monthly_url: string | null
          kambafy_yearly_url: string | null
          price_monthly: number
          price_yearly: number
          trial_days: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          hotmart_monthly_url?: string | null
          hotmart_yearly_url?: string | null
          id?: boolean
          kambafy_monthly_url?: string | null
          kambafy_yearly_url?: string | null
          price_monthly?: number
          price_yearly?: number
          trial_days?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          hotmart_monthly_url?: string | null
          hotmart_yearly_url?: string | null
          id?: boolean
          kambafy_monthly_url?: string | null
          kambafy_yearly_url?: string | null
          price_monthly?: number
          price_yearly?: number
          trial_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      budget_goals: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          monthly_limit: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          monthly_limit?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          monthly_limit?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_goals_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          name: string
          number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name: string
          number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
          number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          is_default: boolean
          is_user_default: boolean
          name: string
          type: Database["public"]["Enums"]["tx_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_default?: boolean
          is_user_default?: boolean
          name: string
          type?: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_default?: boolean
          is_user_default?: boolean
          name?: string
          type?: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emergency_funds: {
        Row: {
          created_at: string
          current_amount: number
          id: string
          monthly_cost: number
          target_months: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          id?: string
          monthly_cost?: number
          target_months?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          id?: string
          monthly_cost?: number
          target_months?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      future_transactions: {
        Row: {
          amount: number
          card_id: string | null
          category_id: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          paid: boolean
          type: Database["public"]["Enums"]["tx_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          paid?: boolean
          type?: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          paid?: boolean
          type?: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "future_transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "future_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          card_id: string | null
          color: string
          completed: boolean
          created_at: string
          current_amount: number
          deadline: string | null
          icon: string | null
          id: string
          name: string
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          card_id?: string | null
          color?: string
          completed?: boolean
          created_at?: string
          current_amount?: number
          deadline?: string | null
          icon?: string | null
          id?: string
          name: string
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          card_id?: string | null
          color?: string
          completed?: boolean
          created_at?: string
          current_amount?: number
          deadline?: string | null
          icon?: string | null
          id?: string
          name?: string
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      installments: {
        Row: {
          category_id: string | null
          created_at: string
          direction: Database["public"]["Enums"]["installment_direction"]
          first_due_date: string
          icon: string | null
          id: string
          installment_amount: number
          installments_count: number
          name: string
          paid_count: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          direction?: Database["public"]["Enums"]["installment_direction"]
          first_due_date?: string
          icon?: string | null
          id?: string
          installment_amount: number
          installments_count: number
          name: string
          paid_count?: number
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          direction?: Database["public"]["Enums"]["installment_direction"]
          first_due_date?: string
          icon?: string | null
          id?: string
          installment_amount?: number
          installments_count?: number
          name?: string
          paid_count?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "installments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          created_at: string
          email: string | null
          event_type: string | null
          external_id: string
          id: string
          payload: Json
          provider: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_type?: string | null
          external_id: string
          id?: string
          payload?: Json
          provider: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          event_type?: string | null
          external_id?: string
          id?: string
          payload?: Json
          provider?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          created_at: string
          hotmart_monthly_url: string | null
          hotmart_yearly_url: string | null
          id: string
          kambafy_monthly_url: string | null
          kambafy_yearly_url: string | null
          monthly_checkout_url: string | null
          processor: string
          trial_checkout_url: string | null
          trial_length_days: number
          updated_at: string
          yearly_checkout_url: string | null
        }
        Insert: {
          created_at?: string
          hotmart_monthly_url?: string | null
          hotmart_yearly_url?: string | null
          id?: string
          kambafy_monthly_url?: string | null
          kambafy_yearly_url?: string | null
          monthly_checkout_url?: string | null
          processor?: string
          trial_checkout_url?: string | null
          trial_length_days?: number
          updated_at?: string
          yearly_checkout_url?: string | null
        }
        Update: {
          created_at?: string
          hotmart_monthly_url?: string | null
          hotmart_yearly_url?: string | null
          id?: string
          kambafy_monthly_url?: string | null
          kambafy_yearly_url?: string | null
          monthly_checkout_url?: string | null
          processor?: string
          trial_checkout_url?: string | null
          trial_length_days?: number
          updated_at?: string
          yearly_checkout_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          currency: string
          currency_code: string
          currency_symbol: string
          current_period_end: string | null
          email: string | null
          full_name: string | null
          id: string
          language: string
          locale: string
          locale_setup_completed: boolean
          monthly_income: number | null
          name: string | null
          onboarding_answers: Json
          onboarding_completed: boolean
          plan_status: Database["public"]["Enums"]["plan_status"]
          plan_type: string | null
          plano: string
          pre_onboarding_completed: boolean
          provider: string | null
          quiz_answers: Json
          selected_categories: string[]
          status_assinatura: string
          trial_end: string | null
          trial_ends_at: string | null
          trial_start: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          currency?: string
          currency_code?: string
          currency_symbol?: string
          current_period_end?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          language?: string
          locale?: string
          locale_setup_completed?: boolean
          monthly_income?: number | null
          name?: string | null
          onboarding_answers?: Json
          onboarding_completed?: boolean
          plan_status?: Database["public"]["Enums"]["plan_status"]
          plan_type?: string | null
          plano?: string
          pre_onboarding_completed?: boolean
          provider?: string | null
          quiz_answers?: Json
          selected_categories?: string[]
          status_assinatura?: string
          trial_end?: string | null
          trial_ends_at?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          currency?: string
          currency_code?: string
          currency_symbol?: string
          current_period_end?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string
          locale?: string
          locale_setup_completed?: boolean
          monthly_income?: number | null
          name?: string | null
          onboarding_answers?: Json
          onboarding_completed?: boolean
          plan_status?: Database["public"]["Enums"]["plan_status"]
          plan_type?: string | null
          plano?: string
          pre_onboarding_completed?: boolean
          provider?: string | null
          quiz_answers?: Json
          selected_categories?: string[]
          status_assinatura?: string
          trial_end?: string | null
          trial_ends_at?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      receipts: {
        Row: {
          created_at: string
          currency: string | null
          id: string
          image_path: string | null
          merchant: string | null
          parsed: Json
          purchased_on: string | null
          status: string
          total: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: string
          image_path?: string | null
          merchant?: string | null
          parsed?: Json
          purchased_on?: string | null
          status?: string
          total?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
          image_path?: string | null
          merchant?: string | null
          parsed?: Json
          purchased_on?: string | null
          status?: string
          total?: number | null
          user_id?: string
        }
        Relationships: []
      }
      recurring_expenses: {
        Row: {
          active: boolean
          amount: number
          category_id: string | null
          created_at: string
          day_of_month: number
          icon: string | null
          id: string
          last_generated_on: string | null
          name: string
          type: Database["public"]["Enums"]["tx_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          amount: number
          category_id?: string | null
          created_at?: string
          day_of_month?: number
          icon?: string | null
          id?: string
          last_generated_on?: string | null
          name: string
          type?: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          amount?: number
          category_id?: string | null
          created_at?: string
          day_of_month?: number
          icon?: string | null
          id?: string
          last_generated_on?: string | null
          name?: string
          type?: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_transactions: {
        Row: {
          amount: number
          auto_process: boolean
          card_id: string | null
          category_id: string | null
          created_at: string
          day_of_month: number
          description: string | null
          frequency: string
          icon: string | null
          id: string
          is_active: boolean
          last_processed_month: string | null
          type: Database["public"]["Enums"]["tx_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          auto_process?: boolean
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          day_of_month?: number
          description?: string | null
          frequency?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          last_processed_month?: string | null
          type?: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          auto_process?: boolean
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          day_of_month?: number
          description?: string | null
          frequency?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          last_processed_month?: string | null
          type?: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      scanned_documents: {
        Row: {
          created_at: string
          detected_amount: number | null
          detected_category: string | null
          error_message: string | null
          extracted_data: Json
          file_name: string
          file_type: string | null
          file_url: string | null
          id: string
          scan_status: string
          transaction_type: Database["public"]["Enums"]["tx_type"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detected_amount?: number | null
          detected_category?: string | null
          error_message?: string | null
          extracted_data?: Json
          file_name: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          scan_status?: string
          transaction_type?: Database["public"]["Enums"]["tx_type"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          detected_amount?: number | null
          detected_category?: string | null
          error_message?: string | null
          extracted_data?: Json
          file_name?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          scan_status?: string
          transaction_type?: Database["public"]["Enums"]["tx_type"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_items: {
        Row: {
          category: string | null
          checked: boolean
          created_at: string
          icon: string | null
          id: string
          is_checked: boolean
          list_id: string
          name: string
          position: number
          price: number | null
          quantity: number
          unit: string | null
          unit_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          checked?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          is_checked?: boolean
          list_id: string
          name: string
          position?: number
          price?: number | null
          quantity?: number
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          checked?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          is_checked?: boolean
          list_id?: string
          name?: string
          position?: number
          price?: number | null
          quantity?: number
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          archived: boolean
          created_at: string
          icon: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          created_at: string
          email: string
          id: string
          message: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          card_id: string | null
          category_id: string | null
          created_at: string
          date: string | null
          description: string | null
          icon: string | null
          id: string
          is_auto_generated: boolean
          occurred_on: string
          payment_method: string | null
          payment_tag: string | null
          receipt_id: string | null
          recurring_transaction_id: string | null
          source: Database["public"]["Enums"]["tx_source"]
          tags: string[]
          type: Database["public"]["Enums"]["tx_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_auto_generated?: boolean
          occurred_on?: string
          payment_method?: string | null
          payment_tag?: string | null
          receipt_id?: string | null
          recurring_transaction_id?: string | null
          source?: Database["public"]["Enums"]["tx_source"]
          tags?: string[]
          type: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_auto_generated?: boolean
          occurred_on?: string
          payment_method?: string | null
          payment_tag?: string | null
          receipt_id?: string | null
          recurring_transaction_id?: string | null
          source?: Database["public"]["Enums"]["tx_source"]
          tags?: string[]
          type?: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
      webhook_logs: {
        Row: {
          created_at: string
          email: string | null
          error: string | null
          error_message: string | null
          event_id: string | null
          evento: string | null
          id: string
          payload: Json
          plano_aplicado: string | null
          provider: string
          source: string
          success: boolean
        }
        Insert: {
          created_at?: string
          email?: string | null
          error?: string | null
          error_message?: string | null
          event_id?: string | null
          evento?: string | null
          id?: string
          payload?: Json
          plano_aplicado?: string | null
          provider?: string
          source?: string
          success?: boolean
        }
        Update: {
          created_at?: string
          email?: string | null
          error?: string | null
          error_message?: string | null
          event_id?: string | null
          evento?: string | null
          id?: string
          payload?: Json
          plano_aplicado?: string | null
          provider?: string
          source?: string
          success?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      installment_direction: "pay" | "receive"
      plan_status:
        | "none"
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "expired"
        | "trial_active"
        | "awaiting_payment"
      tx_source: "manual" | "scan" | "voice"
      tx_type: "income" | "expense"
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
      app_role: ["admin", "user"],
      installment_direction: ["pay", "receive"],
      plan_status: [
        "none",
        "trialing",
        "active",
        "past_due",
        "canceled",
        "expired",
        "trial_active",
        "awaiting_payment",
      ],
      tx_source: ["manual", "scan", "voice"],
      tx_type: ["income", "expense"],
    },
  },
} as const
