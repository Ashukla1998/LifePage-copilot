export interface AkaMember {
  memberid: number;
  name: string;
  role: string;
  photo: string;
  degree: string[]; // TEXT[]
  experience: string;
  is_active: boolean;
  description: string;
}

export interface AkaMemberFormData {
  name: string;
  role: string;
  photo: string;
  degree: string; // Comma-separated input string converted to string[]
  experience: string;
  description: string;
}