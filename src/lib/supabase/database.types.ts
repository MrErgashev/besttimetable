/**
 * Supabase database TypeScript turlari.
 * Haqiqiy loyihada `npx supabase gen types typescript` bilan generatsiya qilinadi.
 * Bu yerda qo'lda yozilgan.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      app_users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: "super_admin" | "admin" | "teacher" | "student";
          department_id: string | null;
          telegram_chat_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          role?: "super_admin" | "admin" | "teacher" | "student";
          department_id?: string | null;
          telegram_chat_id?: string | null;
        };
        Update: {
          email?: string;
          full_name?: string;
          role?: "super_admin" | "admin" | "teacher" | "student";
          department_id?: string | null;
          telegram_chat_id?: string | null;
        };
      };
      departments: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      academic_periods: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          start_date: string;
          end_date: string;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
        };
      };
      teachers: {
        Row: {
          id: string;
          user_id: string | null;
          first_name: string;
          last_name: string;
          short_name: string;
          email: string | null;
          phone: string | null;
          max_weekly_hours: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          first_name: string;
          last_name: string;
          short_name: string;
          user_id?: string | null;
          email?: string | null;
          phone?: string | null;
          max_weekly_hours?: number;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          short_name?: string;
          email?: string | null;
          phone?: string | null;
          max_weekly_hours?: number;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          color: string;
          requires_lab: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          short_name: string;
          color?: string;
          requires_lab?: boolean;
        };
        Update: {
          name?: string;
          short_name?: string;
          color?: string;
          requires_lab?: boolean;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          course: number;
          department_id: string | null;
          track: "kunduzgi" | "sirtqi" | "kechki";
          student_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          course?: number;
          department_id?: string | null;
          track?: "kunduzgi" | "sirtqi" | "kechki";
          student_count?: number;
        };
        Update: {
          name?: string;
          course?: number;
          department_id?: string | null;
          track?: "kunduzgi" | "sirtqi" | "kechki";
          student_count?: number;
        };
      };
      rooms: {
        Row: {
          id: string;
          name: string;
          building: string | null;
          capacity: number;
          type: "oddiy" | "laboratoriya" | "kompyuter_xona" | "majlis_xonasi";
          floor: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          building?: string | null;
          capacity?: number;
          type?: "oddiy" | "laboratoriya" | "kompyuter_xona" | "majlis_xonasi";
          floor?: number | null;
        };
        Update: {
          name?: string;
          building?: string | null;
          capacity?: number;
          type?: "oddiy" | "laboratoriya" | "kompyuter_xona" | "majlis_xonasi";
          floor?: number | null;
        };
      };
      schedule_entries: {
        Row: {
          id: string;
          period_id: string;
          day: "dushanba" | "seshanba" | "chorshanba" | "payshanba" | "juma";
          slot_id: string;
          group_ids: string[];
          subject_id: string;
          teacher_id: string;
          room_id: string;
          is_manual: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          period_id: string;
          day: "dushanba" | "seshanba" | "chorshanba" | "payshanba" | "juma";
          slot_id: string;
          group_ids?: string[];
          subject_id: string;
          teacher_id: string;
          room_id: string;
          is_manual?: boolean;
          created_by?: string | null;
        };
        Update: {
          day?: "dushanba" | "seshanba" | "chorshanba" | "payshanba" | "juma";
          slot_id?: string;
          group_ids?: string[];
          subject_id?: string;
          teacher_id?: string;
          room_id?: string;
          is_manual?: boolean;
        };
      };
      schedule_changelog: {
        Row: {
          id: string;
          entry_id: string | null;
          action: "create" | "update" | "delete";
          old_data: Json | null;
          new_data: Json | null;
          changed_by: string | null;
          changed_at: string;
        };
        Insert: {
          entry_id?: string | null;
          action: "create" | "update" | "delete";
          old_data?: Json | null;
          new_data?: Json | null;
          changed_by?: string | null;
        };
        Update: never;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "schedule_change" | "conflict" | "substitution" | "system";
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type?: "schedule_change" | "conflict" | "substitution" | "system";
          message: string;
          is_read?: boolean;
        };
        Update: {
          is_read?: boolean;
        };
      };
      substitutions: {
        Row: {
          id: string;
          date: string;
          original_entry_id: string | null;
          substitute_teacher_id: string;
          reason: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          date: string;
          original_entry_id?: string | null;
          substitute_teacher_id: string;
          reason?: string;
          note?: string | null;
        };
        Update: {
          substitute_teacher_id?: string;
          reason?: string;
          note?: string | null;
        };
      };
    };
  };
}
