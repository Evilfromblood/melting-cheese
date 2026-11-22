export type DietaryType = 'veg' | 'non-veg';

export type CategoryType = 
  | 'Pizza'
  | 'Burgers'
  | 'Snacks'
  | 'Chicken Wings & Strips'
  | 'Mocktails';

export type FoodBadge = 'bestseller' | 'chef-special' | 'spicy';

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryType | string;
  dietary: DietaryType;
  base_price: number;
  customizable: boolean;
  description: string;
  is_available: boolean;
  image?: string;
  badge?: FoodBadge;
}

export interface PizzaCustomization {
  crust: 'Standard' | 'Cheese Burst';
  extraCheese: boolean;
}

export interface CartItem {
  cartId: string;
  item: MenuItem;
  quantity: number;
  customization?: PizzaCustomization;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderItemSummary {
  name: string;
  category: string;
  dietary: DietaryType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: {
    crust?: string;
    extraCheese?: boolean;
  };
}

export type PaymentMethod = 'UPI' | 'COD';
export type PaymentStatus = 'PENDING' | 'PAID';
export type OrderStatus = 'NEW' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  order_number: number;
  user_id?: string | null;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  gps_link?: string | null;
  items: OrderItemSummary[];
  subtotal: number;
  discount: number;
  free_item?: string | null;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;
}

export interface CustomerProfile {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  default_address?: string | null;
  gps_link?: string | null;
  updated_at?: string;
}
