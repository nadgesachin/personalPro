import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  phone: string;
  name?: string;
  email?: string;
  gender?: "male" | "female" | "other" | "prefer-not-say";
  profileImage?: string;
  singleSignOn?: boolean;
  googleId?: string;
  profileCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    phone: { type: String, default: null },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-say"],
      required: false,
    },
    profileImage: { type: String, required: false },
    singleSignOn: {
      type: Boolean,
      default: false,
    },
    googleId: { type: String, required: false },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);
