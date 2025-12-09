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
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'medecin' | 'patient'
          first_name: string
          last_name: string
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: 'admin' | 'medecin' | 'patient'
          first_name: string
          last_name: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'medecin' | 'patient'
          first_name?: string
          last_name?: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      medecins: {
        Row: {
          id: string
          specialite: string
          numero_ordre: string
          adresse_cabinet: string | null
          code_postal: string | null
          ville: string | null
          verified: boolean
          created_at: string
        }
        Insert: {
          id: string
          specialite: string
          numero_ordre: string
          adresse_cabinet?: string | null
          code_postal?: string | null
          ville?: string | null
          verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          specialite?: string
          numero_ordre?: string
          adresse_cabinet?: string | null
          code_postal?: string | null
          ville?: string | null
          verified?: boolean
          created_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          date_naissance: string
          groupe_sanguin: string | null
          allergies: string[] | null
          numero_secu: string | null
          created_at: string
        }
        Insert: {
          id: string
          date_naissance: string
          groupe_sanguin?: string | null
          allergies?: string[] | null
          numero_secu?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          date_naissance?: string
          groupe_sanguin?: string | null
          allergies?: string[] | null
          numero_secu?: string | null
          created_at?: string
        }
      }
      consultations: {
        Row: {
          id: string
          dossier_id: string
          medecin_id: string
          date_consultation: string
          motif: string
          examen_clinique: string | null
          diagnostic: string | null
          notes: string | null
          constantes: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          dossier_id: string
          medecin_id: string
          date_consultation?: string
          motif: string
          examen_clinique?: string | null
          diagnostic?: string | null
          notes?: string | null
          constantes?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          dossier_id?: string
          medecin_id?: string
          date_consultation?: string
          motif?: string
          examen_clinique?: string | null
          diagnostic?: string | null
          notes?: string | null
          constantes?: Json | null
          created_at?: string
        }
      }
      rendez_vous: {
        Row: {
          id: string
          patient_id: string
          medecin_id: string
          date_heure: string
          duree: number
          motif: string | null
          statut: 'confirme' | 'annule' | 'termine' | 'en_attente'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          medecin_id: string
          date_heure: string
          duree?: number
          motif?: string | null
          statut?: 'confirme' | 'annule' | 'termine' | 'en_attente'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          medecin_id?: string
          date_heure?: string
          duree?: number
          motif?: string | null
          statut?: 'confirme' | 'annule' | 'termine' | 'en_attente'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
