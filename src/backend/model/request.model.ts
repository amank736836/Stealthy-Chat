import mongoose, { Document, Schema, Types } from "mongoose";
import { User } from "next-auth";

export interface Request extends Document {
  sender: User;
  receiver: User;
  status: "pending" | "accepted" | "rejected";
}

const RequestSchema: Schema<Request> = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver ID is required"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const RequestModel =
  (mongoose.models.Request as mongoose.Model<Request>) ||
  mongoose.model<Request>("Request", RequestSchema);

export default RequestModel;
