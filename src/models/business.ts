import { Booklet } from "./booklet";
import { Order } from "./order";
import { OrderItem } from "./order-item";
import { Product } from "./product";
import { Review } from "./review";
import { UserBusiness } from "./user-business";

export type Business = {
  id: string;
  // record details
  name: string;
  mapsUrl: string;
  // time-based data
  createdAt: Date;
  updatedAt: Date;
  // relations
  userBusinesses: UserBusiness[];
  booklets: Booklet[];
  products: Product[];
  orders: Order[];
  orderItems: OrderItem[];
  reviews: Review[];
};

export type CreateBusiness = Omit<Business, "id" | "createdAt" | "updatedAt">;

export type UpdateBusiness = Omit<
  Partial<Business>,
  "id" | "createdAt" | "updatedAt"
>;
