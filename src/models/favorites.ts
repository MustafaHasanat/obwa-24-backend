import { User } from "./user";
import { Business } from "./business";
import { Product } from "./product";
import { FavoriteType } from "@/enums";

export type Favorite = {
  id: string;
  // record details
  type: FavoriteType;
  // time-based data
  createdAt: Date;
  updatedAt: Date;
  // relations
  userId: string;
  businessId: string;
  productId: string;
  user: User;
  business: Business;
  product: Product;
};

export type CreateFavorite = Omit<
  Favorite,
  "id" | "createdAt" | "updatedAt" | "user" | "business" | "product"
>;

export type UpdateFavorite = Omit<
  Partial<Favorite>,
  "id" | "createdAt" | "updatedAt" | "user" | "business" | "product"
>;
