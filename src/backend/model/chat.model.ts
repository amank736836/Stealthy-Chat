import mongoose, { Document, Schema, Types } from "mongoose";

export interface Chat extends Document {
  _id: Types.ObjectId;
  name: string;
  groupChat: boolean;
  creator: Types.ObjectId;
  members: Types.ObjectId[];
}

const ChatSchema: Schema<Chat> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Chat name is required"],
      trim: true,
      lowercase: true,
      minlength: [3, "Chat name must be at least 3 characters"],
      maxlength: [30, "Chat name cannot exceed 30 characters"],
    },
    groupChat: {
      type: Boolean,
      default: false,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator ID is required"],
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Member ID is required"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ChatModel =
  (mongoose.models.Chat as mongoose.Model<Chat>) ||
  mongoose.model<Chat>("Chat", ChatSchema);

export default ChatModel;
