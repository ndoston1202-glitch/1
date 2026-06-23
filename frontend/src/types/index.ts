export type Role = 'admin' | 'manager' | 'waiter' | 'cashier' | 'chef' | 'delivery';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: Role;
  phone: string;
  avatar: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  image: string | null;
  is_active: boolean;
  order: number;
  items_count: number;
}

export interface MenuItem {
  id: number;
  category: number;
  category_name: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  is_available: boolean;
  preparation_time: number;
  calories: number | null;
  is_vegetarian: boolean;
  is_spicy: boolean;
}

export type TableStatus = 'free' | 'occupied' | 'reserved' | 'cleaning';

export interface Table {
  id: number;
  number: number;
  capacity: number;
  status: TableStatus;
  location: string;
  is_active: boolean;
}

export interface Reservation {
  id: number;
  table: number;
  table_number: number;
  customer_name: string;
  customer_phone: string;
  guest_count: number;
  reserved_at: string;
  duration: number;
  status: string;
  notes: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export interface OrderItem {
  id: number;
  menu_item: number;
  menu_item_name: string;
  menu_item_price: string;
  quantity: number;
  price: string;
  subtotal: number;
  status: string;
  notes: string;
}

export interface Order {
  id: number;
  order_number: string;
  table: number | null;
  table_number: number | null;
  waiter: number | null;
  waiter_name: string;
  status: OrderStatus;
  order_type: OrderType;
  customer_name: string;
  customer_phone: string;
  notes: string;
  discount: string;
  total_amount: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type PaymentMethod = 'cash' | 'card' | 'payme' | 'click' | 'transfer';

export interface Payment {
  id: number;
  order: number;
  order_number: string;
  cashier: number | null;
  cashier_name: string;
  method: PaymentMethod;
  status: string;
  amount: string;
  paid_amount: string;
  change_amount: string;
  transaction_id: string;
  notes: string;
  paid_at: string | null;
  created_at: string;
}

export interface DeliveryZone {
  id: number;
  name: string;
  min_order: string;
  delivery_fee: string;
  estimated_time: number;
  is_active: boolean;
}

export interface Delivery {
  id: number;
  order: number;
  order_number: string;
  courier: number | null;
  courier_name: string;
  zone: number | null;
  zone_name: string;
  address: string;
  status: string;
  delivery_fee: string;
  estimated_time: number | null;
  notes: string;
  created_at: string;
  delivered_at: string | null;
}

export interface DashboardStats {
  today: {
    orders: number;
    revenue: number;
    completed_orders: number;
    cancelled_orders: number;
  };
  active_orders: number;
  weekly_revenue: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
