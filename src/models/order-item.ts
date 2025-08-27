import { Business } from "./business";
import { Order } from "./order";
import { Product } from "./product";
import { User } from "./user";

export type OrderItem = {
  id: string;
  // record details
  quantity: number;
  type: string;
  // time-based data
  createdAt: Date;
  updatedAt: Date;
  // relations
  product: Product;
  productId: string;
  order: Order;
  orderId: string;
  user: User;
  userId: string;
  business: Business;
  businessId: string;
};

export type CreateOrderItem = Omit<OrderItem, "id" | "createdAt" | "updatedAt">;

export type UpdateOrderItem = Omit<
  Partial<OrderItem>,
  "id" | "createdAt" | "updatedAt"
>;
