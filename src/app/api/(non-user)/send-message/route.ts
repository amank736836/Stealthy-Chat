import dbConnect from "@/backend/lib/dbConnect";
import ChatModel from "@/backend/model/chat.model";
import MessageModel from "@/backend/model/message.model";
import UserModel, { User } from "@/backend/model/user.model";

export async function POST(request: Request) {
  const { username, content } = await request.json();

  if (!username) {
    return Response.json(
      {
        success: false,
        message: "Username is required",
      },
      {
        status: 400,
      }
    );
  }

  if (!content) {
    return Response.json(
      {
        success: false,
        message: "Content is required",
      },
      {
        status: 400,
      }
    );
  }

  await dbConnect();

  try {
    const user: User | null = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        { status: 400 }
      );
    }

    const newMessage = { content, createdAt: new Date() };

    const chat = await ChatModel.findOne({
      _id: user._id,
    });

    if (!chat) {
      return Response.json(
        {
          success: false,
          message: "Chat not found",
        },
        { status: 404 }
      );
    }

    const message = await MessageModel.create({
      sender: user._id,
      chat: chat._id,
      content,
    });

    await message.save();

    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unable to send message", error);
    return Response.json(
      {
        success: false,
        message: "Unable to send message",
      },
      { status: 500 }
    );
  }
}
