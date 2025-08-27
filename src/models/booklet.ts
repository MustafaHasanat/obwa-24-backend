import { Business } from "./business";
import { Product } from "./product";
import { User } from "./user";

export type Booklet = {
  id: string;
  // record details
  vouchers: number;
  // time-based data
  createdAt: Date;
  updatedAt: Date;
  // relations
  user: User;
  userId: string;
  business: Business;
  businessId: string;
  product?: Product;
};

export type CreateBooklet = Omit<Booklet, "id" | "createdAt" | "updatedAt">;

export type UpdateBooklet = Omit<
  Partial<Booklet>,
  "id" | "createdAt" | "updatedAt"
>;
