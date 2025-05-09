import mongoose, { Document, Schema } from "mongoose";

export interface User extends Document {
  avatar: {
    public_id: string;
    url: string;
  };
  name: string;
  username: string;
  email: string;
  password: string;
  isAcceptingMessage: boolean;
  verifyCode: number;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAdmin: boolean;
}

const UserSchema: Schema<User> = new Schema(
  {
    avatar: {
      public_id: {
        type: String,
        required: [true, "Public ID is required"],
      },
      url: {
        type: String,
        required: [true, "Avatar URL is required"],
      },
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      lowercase: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [30, "Name cannot exceed 30 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      validate: {
        validator: (value: string) => /^[a-zA-Z0-9_]*$/.test(value),
        message: (props: { value: string }) =>
          `${props.value} is not a valid username! Only letters, numbers, and underscores are allowed.`,
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) =>
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
        message: (props: { value: string }) =>
          `${props.value} is not a valid email! Please enter a valid email address.`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      select: false,
    },
    verifyCode: {
      type: Number,
      required: [true, "Verify code is required"],
      max: 999999,
      min: 100000,
    },
    verifyCodeExpiry: {
      type: Date,
      required: [true, "Verify code expiry is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAcceptingMessage: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
