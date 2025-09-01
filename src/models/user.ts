import { AccountType, Gender, UserStatus } from "@/enums";
import { UserBusiness } from "./user-business";
import { Booklet } from "./booklet";
import { Order } from "./order";
import { OrderItem } from "./order-item";
import { Review } from "./review";

export type User = {
  id: string;
  // profile data
  firstName: string;
  lastName: string;
  avatar?: string;
  gender?: Gender;
  phoneNumber?: string;
  mapsUrl?: string;
  // account data
  email: string;
  password: string;
  accountType: AccountType;
  status: UserStatus;
  token?: string;
  failedVerifyAttempts: number;
  totpSecret?: string;
  // time-based data
  createdAt: Date;
  updatedAt: Date;
  // relations
  userBusiness: UserBusiness[];
  booklet: Booklet[];
  order: Order[];
  orderItem: OrderItem[];
  review: Review[];
};

export type CreateUser = Omit<
  User,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "password"
  | "userBusiness"
  | "booklet"
  | "order"
  | "orderItem"
  | "review"
> & {
  confirmPassword: string;
  password: string;
};

export type UpdateUser = Omit<
  Partial<User>,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "password"
  | "userBusiness"
  | "booklet"
  | "order"
  | "orderItem"
  | "review"
>;
