import { Business } from "./business";
import { User } from "./user";

export type UserBusiness = {
  // time-based data
  createdAt: Date;
  updatedAt: Date;
  // relations
  userId: string;
  businessId: string;
  user: User;
  business: Business;
};

export type CreateUserBusiness = Omit<
  UserBusiness,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateUserBusiness = Omit<
  Partial<UserBusiness>,
  "id" | "createdAt" | "updatedAt"
>;
