export type Role = "customer" | "designer" | "admin";
export type Plan = "free" | "premium" | "priority";
export type StudioStatus = "pending" | "verified" | "rejected";
export type BookingStatus = "requested" | "confirmed" | "declined" | "completed" | "cancelled";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: Role;
  created_at?: string;
}

export interface Service {
  id: string;
  studio_id?: string;
  name: string;
  description: string | null;
  price: number;
  duration_mins: number;
  sort?: number;
}

export interface Review {
  id: string;
  author_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Studio {
  id: string;
  owner_id?: string | null;
  slug: string;
  name: string;
  kind: string;
  tagline: string | null;
  bio: string | null;
  area: string | null;
  city: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  categories: string[];
  starting_price: number;
  home_visits: boolean;
  studio_visits: boolean;
  cover_url: string | null;
  photos: string[];
  rating: number;
  review_count: number;
  status: StudioStatus;
  plan: Plan;
  plan_renews_at?: string | null;
  dodo_customer_id?: string | null;
  dodo_subscription_id?: string | null;
  snip_code: string | null;
  created_at?: string;
}

export interface StudioWithDetails extends Studio {
  services: Service[];
  reviews: Review[];
}

export interface Booking {
  id: string;
  studio_id: string;
  customer_id: string | null;
  service_id: string | null;
  service_name: string;
  mode: "home" | "studio";
  scheduled_at: string;
  address: string | null;
  notes: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  status: BookingStatus;
  client_id: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  studio_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  measurements: Record<string, string>;
  created_at: string;
}

export interface Order {
  id: string;
  studio_id: string;
  client_id: string | null;
  title: string;
  garment: string | null;
  stage: string;
  due_date: string | null;
  price: number;
  paid: number;
  fabric_photos: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}
