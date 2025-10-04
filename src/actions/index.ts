import { adminUsers } from "./adminUsers";
import { authActions as auth } from "./auth";
import { categories } from "./categories";
import { contact } from "./contact";
import { orders } from "./orders";
import { otp } from "./otp";
import { products } from "./products";

export const server = {
  auth,
  adminUsers,
  categories,
  products,
  orders,
  otp,
  contact,
};
