// * override the Session type in next-auth to extend its attributes
import { DefaultSession } from "next-auth";

import { User } from "../models/users";
import { LoginReturnProps } from "./auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    expires: string;
    user: User &
      LoginReturnProps & {
        name?: string;
        image?: string;
        email?: string;
        picture?: string;
        exp?: number;
        iat?: number;
        jti?: string;
      };
  }
}
