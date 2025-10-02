import { Business } from "./business";
import { Review } from "./review";
import { OrderItem } from "./order-item";
import { ProductType } from "@/enums";
import { Favorite } from "./favorites";
import { Booklet } from "./booklet";

export type Product = {
  id: string;
  // record details
  title: string;
  description: string;
  price: number;
  type: ProductType;
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
  favorites: Favorite[];
};

export type CreateProduct = Omit<
  Product,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "booklet"
  | "business"
  | "reviews"
  | "favorites"
  | "orderItems"
>;

export type UpdateProduct = Omit<
  Partial<Product>,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "booklet"
  | "business"
  | "favorites"
  | "reviews"
  | "orderItems"
>;
