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
      barcode_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      barcode_items: {
        Row: {
          id: string
          list_id: string
          barcode: string
          created_at: string
          order_index: number
        }
        Insert: {
          id?: string
          list_id: string
          barcode: string
          created_at?: string
          order_index?: number
        }
        Update: {
          id?: string
          list_id?: string
          barcode?: string
          created_at?: string
          order_index?: number
        }
      }
    }
  }
}
