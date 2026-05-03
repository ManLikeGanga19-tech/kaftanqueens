export enum Category {
  TRADITIONAL = "traditional",
  MODERN = "modern"
}

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered"
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin"
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  narrative?: string;
  shippingCare?: string;
  category: string;
  price: number;
  discountedPrice?: number;
  currencies: { [key: string]: number };
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  isActive: boolean;
  createdAt: any;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  mpesaTransactionId?: string;
  trackingNumber?: string;
  deliveryEstimate?: string;
  address: {
    fullName: string;
    phone: string;
    city: string;
    details: string;
  };
  createdAt: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  browsingHistory: string[];
}

export interface CartItem extends OrderItem {}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder?: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: any;
  createdAt: any;
}

export interface SizeGuideRow {
  size: string;
  bust: string;
  waist: string;
  hips: string;
  length: string;
}

export interface SiteConfig {
  id: string;
  shippingPolicy: string;
  returnPolicy: string;
  sizeGuide: {
    title: string;
    intro: string;
    rows: SizeGuideRow[];
    notes: string;
  };
  updatedAt: any;
}

export interface CategoryDoc {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: any;
}
