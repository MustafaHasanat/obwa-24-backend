import { Business } from "./business";
import { Product } from "./product";
import { User } from "./user";

export type Review = {
  id: string;
  // record details
  rating: number;
  comment?: string;
  // time-based data
  createdAt: Date;
  updatedAt: Date;
  // relations
  product: Product;
  productId: string;
  user: User;
  userId: string;
  business: Business;
  businessId: string;
};

export type CreateReview = Omit<Review, "id" | "createdAt" | "updatedAt">;

export type UpdateReview = Omit<
  Partial<Review>,
  "id" | "createdAt" | "updatedAt"
>;
