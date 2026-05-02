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

export interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  price: number;
  currencies: { [key: string]: number };
  sizes: string[];
  colors: string[];
  stock: number;
  rating: number;
  reviewsCount: number;
  images: string[];
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
