import jwt, { SignOptions } from "jsonwebtoken";
import { IUser } from "../models/User";
export const createToken = (user: IUser): string => {
  const payload = {
    id: user._id,
    phone: user?.phone || null,
    profileCompleted: user.profileCompleted || false,
  };

  const options: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign(payload, process.env.JWT_SECRET as string, options);
};
