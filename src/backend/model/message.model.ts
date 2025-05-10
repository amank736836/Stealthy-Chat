import mongoose, { Document, Schema, Types } from "mongoose";

export interface Message extends Document {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  chat: Types.ObjectId;
  content: string;
  attachments: {
    public_id: string;
    url: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema<Message> = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: [true, "Chat ID is required"],
    },
    content: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        public_id: {
          type: String,
          required: [true, "Public ID is required"],
        },
        url: {
          type: String,
          required: [true, "URL is required"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const MessageModel =
  (mongoose.models.Message as mongoose.Model<Message>) ||
  mongoose.model<Message>("Message", MessageSchema);

export default MessageModel;
