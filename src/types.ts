export interface Platform {
  id: number;
  name: string;
  color: string;
  tagline: string;
  category: string;
}

export interface Product {
  id: number;
  seller_id: string;
  seller_name: string;
  platform_id: number;
  platform_name: string;
  platform_color: string;
  title: string;
  plan_type: string;
  duration_months: number;
  price: number;
  original_price: number;
  slots_available: number;
  slots_total: number;
  description: string;
  features: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  product: Product | null;
}

export interface WishlistItem {
  id: number;
  user_id: string;
  product_id: number;
  product: Product | null;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  title: string;
  price: number;
  quantity: number;
  platform_name: string;
  plan_type: string;
  duration_months: number;
}

export interface Order {
  id: number;
  user_id: string;
  total: number;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}

export interface Review {
  id: number;
  product_id: number;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Testimonial {
  id: number;
  name: string;
  city: string;
  quote: string;
  rating: number;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
}
