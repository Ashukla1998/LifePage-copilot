import { AkaProjectImageInput } from "./components/EditProjectModal";

export interface AkaProjects {
  projectid: number;
  title: string;
  description: string;
  location: string;
  size  : string | number | null;
  buildup: string | number | null;
  service: string;
  status : string | number | null;
  gallerypath:string;
  category: string;
  is_active: boolean;
  show_in_slider: boolean;
  slider_order: number | null;
  cover: string;
  project_images: AkaProjectImageInput[];
  start_year: string | number | null;
  end_year: string | number | null;
}

export interface AkaProjectsFormData {
  title: string;
  description: string;
  location: string;
  size  : string;
  buildup: string;
  service: string;
  status : string;
  gallerypath:string;
  category: string;
  is_active: boolean;
  show_in_slider: boolean;
  cover: File | null;
}