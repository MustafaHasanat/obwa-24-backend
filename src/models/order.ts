import { OrderStatus } from "@/enums";
import { User } from "./user";
import { Business } from "./business";
import { OrderItem } from "./order-item";

export type Order = {
  id: string;
  // record details
  status: OrderStatus;
  // time-based data
  createdAt: Date;
  updatedAt: Date;
  // relations
  user: User;
  userId: string;
  business: Business;
  businessId: string;
  orderItems: OrderItem[];
};

export type CreateOrder = Omit<Order, "id" | "createdAt" | "updatedAt">;

export type UpdateOrder = Omit<
  Partial<Order>,
  "id" | "createdAt" | "updatedAt"
>;
