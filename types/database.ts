/**
-- ==============================================================================
-- FINNA Supabase Database Types
-- Typed end to end for all Supabase tables, views, and relationships
-- ==============================================================================
*/

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone: string | null
          city: string | null
          state: string | null
          preferred_language: string | null
          date_of_birth: string | null
          gender: string | null
          annual_income_estimate: number | null
          dependents: number | null
          has_own_vehicle: boolean | null
          vehicle_type: string | null
          aadhaar_linked: boolean | null
          e_shram_id: string | null
          pan_last4: string | null
          onboarding_complete: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          city?: string | null
          state?: string | null
          preferred_language?: string | null
          date_of_birth?: string | null
          gender?: string | null
          annual_income_estimate?: number | null
          dependents?: number | null
          has_own_vehicle?: boolean | null
          vehicle_type?: string | null
          aadhaar_linked?: boolean | null
          e_shram_id?: string | null
          pan_last4?: string | null
          onboarding_complete?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          city?: string | null
          state?: string | null
          preferred_language?: string | null
          date_of_birth?: string | null
          gender?: string | null
          annual_income_estimate?: number | null
          dependents?: number | null
          has_own_vehicle?: boolean | null
          vehicle_type?: string | null
          aadhaar_linked?: boolean | null
          e_shram_id?: string | null
          pan_last4?: string | null
          onboarding_complete?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      user_platforms: {
        Row: {
          id: string
          user_id: string
          platform: string
          joined_on: string | null
          is_primary: boolean | null
          avg_monthly_earning: number | null
          active: boolean | null
          linked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          joined_on?: string | null
          is_primary?: boolean | null
          avg_monthly_earning?: number | null
          active?: boolean | null
          linked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          joined_on?: string | null
          is_primary?: boolean | null
          avg_monthly_earning?: number | null
          active?: boolean | null
          linked_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          bank_name: string
          account_type: string
          masked_account: string
          balance: number
          currency: string
          fip_id: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bank_name: string
          account_type?: string
          masked_account: string
          balance?: number
          currency?: string
          fip_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bank_name?: string
          account_type?: string
          masked_account?: string
          balance?: number
          currency?: string
          fip_id?: string | null
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          txn_date: string
          amount: number
          type: "CREDIT" | "DEBIT" | "credit" | "debit"
          description: string
          category: string | null
          platform: string | null
          balance_after: number | null
          raw: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          txn_date: string
          amount: number
          type: "CREDIT" | "DEBIT" | "credit" | "debit"
          description: string
          category?: string | null
          platform?: string | null
          balance_after?: number | null
          raw?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          txn_date?: string
          amount?: number
          type?: "CREDIT" | "DEBIT" | "credit" | "debit"
          description?: string
          category?: string | null
          platform?: string | null
          balance_after?: number | null
          raw?: Json | null
          created_at?: string
        }
      }
      income_entries: {
        Row: {
          id: string
          user_id: string
          platform: string
          date: string
          gross_amount: number
          incentive_amount: number | null
          tips_amount: number | null
          fuel_cost: number | null
          trips_count: number | null
          hours_worked: number | null
          source: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          date?: string
          gross_amount?: number
          incentive_amount?: number | null
          tips_amount?: number | null
          fuel_cost?: number | null
          trips_count?: number | null
          hours_worked?: number | null
          source?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          date?: string
          gross_amount?: number
          incentive_amount?: number | null
          tips_amount?: number | null
          fuel_cost?: number | null
          trips_count?: number | null
          hours_worked?: number | null
          source?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          date: string
          amount: number
          category: string
          is_recurring: boolean | null
          is_business_expense: boolean | null
          source: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          amount: number
          category: string
          is_recurring?: boolean | null
          is_business_expense?: boolean | null
          source?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          amount?: number
          category?: string
          is_recurring?: boolean | null
          is_business_expense?: boolean | null
          source?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          month: string
          category: string
          allocated_amount: number
          safe_to_spend_daily: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          category: string
          allocated_amount?: number
          safe_to_spend_daily?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          category?: string
          allocated_amount?: number
          safe_to_spend_daily?: number | null
          created_at?: string
        }
      }
      savings_buckets: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          target_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          target_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          created_at?: string
        }
      }
      savings_rules: {
        Row: {
          id: string
          user_id: string
          rule_type: string
          percentage: number
          trigger_event: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          rule_type: string
          percentage?: number
          trigger_event?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          rule_type?: string
          percentage?: number
          trigger_event?: string
          is_active?: boolean
          created_at?: string
        }
      }
      liabilities: {
        Row: {
          id: string
          user_id: string
          type: string
          lender: string
          principal: number
          outstanding: number
          emi_amount: number
          interest_rate: number | null
          start_date: string | null
          tenure_months: number | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          lender: string
          principal?: number
          outstanding?: number
          emi_amount?: number
          interest_rate?: number | null
          start_date?: string | null
          tenure_months?: number | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          lender?: string
          principal?: number
          outstanding?: number
          emi_amount?: number
          interest_rate?: number | null
          start_date?: string | null
          tenure_months?: number | null
          status?: string
          created_at?: string
        }
      }
      income_predictions: {
        Row: {
          id: string
          user_id: string
          horizon: "1d" | "7d" | "30d"
          low_estimate: number
          expected_estimate: number
          high_estimate: number
          confidence: "low" | "medium" | "high"
          generated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          horizon: "1d" | "7d" | "30d"
          low_estimate: number
          expected_estimate: number
          high_estimate: number
          confidence?: "low" | "medium" | "high"
          generated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          horizon?: "1d" | "7d" | "30d"
          low_estimate?: number
          expected_estimate?: number
          high_estimate?: number
          confidence?: "low" | "medium" | "high"
          generated_at?: string
        }
      }
      health_scores: {
        Row: {
          id: string
          user_id: string
          score: number
          verification_tier: "basic" | "verified" | "fully_verified"
          factors: Json | null
          band: string | null
          component_scores: Json | null
          recommendations: Json | null
          computed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          verification_tier?: "basic" | "verified" | "fully_verified"
          factors?: Json | null
          band?: string | null
          component_scores?: Json | null
          recommendations?: Json | null
          computed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          verification_tier?: "basic" | "verified" | "fully_verified"
          factors?: Json | null
          band?: string | null
          component_scores?: Json | null
          recommendations?: Json | null
          computed_at?: string
        }
      }
      marketplace_products: {
        Row: {
          id: string
          product_type: "insurance" | "loan"
          name: string
          provider: string
          relevant_platforms: string[]
          min_health_score: number
          description: string
        }
        Insert: {
          id?: string
          product_type: "insurance" | "loan"
          name: string
          provider: string
          relevant_platforms?: string[]
          min_health_score?: number
          description: string
        }
        Update: {
          id?: string
          product_type?: "insurance" | "loan"
          name?: string
          provider?: string
          relevant_platforms?: string[]
          min_health_score?: number
          description?: string
        }
      }
      privileges: {
        Row: {
          id: string
          scope: "common" | "platform_specific"
          platform: string | null
          title: string
          description: string
          eligibility_criteria: string | null
          apply_link: string | null
        }
        Insert: {
          id?: string
          scope: "common" | "platform_specific"
          platform?: string | null
          title: string
          description: string
          eligibility_criteria?: string | null
          apply_link?: string | null
        }
        Update: {
          id?: string
          scope?: "common" | "platform_specific"
          platform?: string | null
          title?: string
          description?: string
          eligibility_criteria?: string | null
          apply_link?: string | null
        }
      }
      side_hustle_recommendations: {
        Row: {
          id: string
          platform: string
          job_type: string
          estimated_earning_low: number
          estimated_earning_high: number
          reason: string
          city: string
          valid_from: string
          valid_to: string
        }
        Insert: {
          id?: string
          platform: string
          job_type: string
          estimated_earning_low: number
          estimated_earning_high: number
          reason: string
          city?: string
          valid_from?: string
          valid_to?: string
        }
        Update: {
          id?: string
          platform?: string
          job_type?: string
          estimated_earning_low?: number
          estimated_earning_high?: number
          reason?: string
          city?: string
          valid_from?: string
          valid_to?: string
        }
      }
    }
  }
}
