import { uploadFilesToCloudinary } from "@/backend/lib/cloudinary";
import dbConnect from "@/backend/lib/dbConnect";
import { Types } from "mongoose";
import { User } from "next-auth";
import { auth } from "../../auth/[...nextauth]/option";
import ChatModel from "@/backend/model/chat.model";
import UserModel from "@/backend/model/user.model";
import { v4 as uuid } from "uuid";
import MessageModel from "@/backend/model/message.model";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "@/app/constants/events";
import { emitEvent } from "@/backend/lib/socket";

export const config = {
  api: { bodyParser: false },
};

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return Response.json(
      {
        success: false,
        message: "Not authorized",
      },
      {
        status: 401,
      }
    );
  }

  const user: User = session?.user as User;

  if (!user) {
    return Response.json(
      {
        success: false,
        message: "User not found",
      },
      {
        status: 404,
      }
    );
  }

  const ReqUserId = new Types.ObjectId(user._id);
  await dbConnect();

  try {
    const chatId = await request.json();
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return Response.json(
        { success: false, message: "At least one file is required" },
        { status: 400 }
      );
    }

    if (files.length > 5) {
      return Response.json(
        { success: false, message: "Maximum 5 files are allowed" },
        { status: 400 }
      );
    }

    const cloudinaryResult = await uploadFilesToCloudinary(files);
    const attachments = cloudinaryResult;

    if (!attachments) {
      return Response.json(
        { success: false, message: "Failed to upload profile picture" },
        { status: 500 }
      );
    }

    if (!chatId) {
      return Response.json(
        { success: false, message: "Chat ID is required" },
        { status: 400 }
      );
    }

    if (!ReqUserId) {
      return Response.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const [chat, user] = await Promise.all([
      ChatModel.findById(chatId),
      UserModel.findById(ReqUserId, "name"),
    ]);

    if (!chat) {
      return Response.json(
        { success: false, message: "Chat not found" },
        { status: 404 }
      );
    }

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!chat.members.includes(ReqUserId)) {
      return Response.json(
        { success: false, message: "User not a member of the chat" },
        { status: 403 }
      );
    }

    const messageForDB = {
      chat: chatId,
      content: "",
      attachments,
      sender: ReqUserId,
    };

    const messageForRealTime = {
      ...messageForDB,
      sender: {
        _id: ReqUserId,
        name: user.name,
      },
      _id: uuid(),
      createdAt: new Date().toISOString(),
    };

    const message = await MessageModel.create(messageForDB);

    emitEvent(NEW_MESSAGE, chat.members, {
      message: messageForRealTime,
      chatId,
    });

    emitEvent(NEW_MESSAGE_ALERT, chat.members, { chatId });

    return Response.json(
      {
        success: true,
        message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/sign-up", error);
    return Response.json(
      {
        success: false,
        message: "Error Registering User",
      },
      { status: 500 }
    );
  }
}
