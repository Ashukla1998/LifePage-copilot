import { AkaProjectImageInput } from "./components/EditProjectModal";

export interface AkaProjects {
  projectid: number;
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
  cover: string;
  project_images: AkaProjectImageInput[];
  start_year: string;
  end_year: string;
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
  cover: File | null;
}