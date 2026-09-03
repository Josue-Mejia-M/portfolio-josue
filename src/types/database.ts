export type ProjectType = "personal" | "academic" | "professional";

export type DevelopmentStatus =
  | "in_progress"
  | "completed"
  | "paused";

export type PublicationStatus = "draft" | "published";

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          project_type: ProjectType;
          development_status: DevelopmentStatus;
          publication_status: PublicationStatus;
          learning: string;
          desktop_image_path: string | null;
          tablet_image_path: string | null;
          mobile_image_path: string | null;
          technologies: string[];
          repository_url: string | null;
          live_url: string | null;
          display_order: number;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description: string;
          project_type: ProjectType;
          development_status: DevelopmentStatus;
          publication_status?: PublicationStatus;
          learning: string;
          desktop_image_path?: string | null;
          tablet_image_path?: string | null;
          mobile_image_path?: string | null;
          technologies?: string[];
          repository_url?: string | null;
          live_url?: string | null;
          display_order?: number;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string;
          project_type?: ProjectType;
          development_status?: DevelopmentStatus;
          publication_status?: PublicationStatus;
          learning?: string;
          desktop_image_path?: string | null;
          tablet_image_path?: string | null;
          mobile_image_path?: string | null;
          technologies?: string[];
          repository_url?: string | null;
          live_url?: string | null;
          display_order?: number;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
