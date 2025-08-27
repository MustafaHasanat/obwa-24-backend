import { Booklet } from "@prisma/client";
import { Business } from "./business";
import { Review } from "./review";
import { OrderItem } from "./order-item";

export type Product = {
  id: string;
  // record details
  title: string;
  description: string;
  price: number;
  image?: string;
  refillPrice?: number;
  count?: number;
  volume?: number;
  deliveryFee?: number;
  // time-based data
  createdAt: Date;
  updatedAt: Date;
  // relations
  booklet: Booklet;
  bookletId: string;
  business: Business;
  businessId: string;
  reviews: Review[];
  orderItems: OrderItem[];
};

export type CreateProduct = Omit<
  Product,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "booklet"
  | "business"
  | "reviews"
  | "orderItems"
>;

export type UpdateProduct = Omit<
  Partial<Product>,
  "id" | "createdAt" | "updatedAt"
>;
