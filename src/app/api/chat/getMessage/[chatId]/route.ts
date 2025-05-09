import { auth } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/backend/lib/dbConnect";
import ChatModel from "@/backend/model/chat.model";
import MessageModel from "@/backend/model/message.model";
import { Types } from "mongoose";
import { AuthError, User } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
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

  const user: User = session.user as User;

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
  const { chatId } = await params;

  if (!chatId) {
    return Response.json(
      {
        success: false,
        message: "Chat ID is required",
      },
      {
        status: 400,
      }
    );
  }

  await dbConnect();

  try {
    const params = request.nextUrl.searchParams;
    const page = Number(params.get("page")) || 1;

    if (!chatId) {
      return Response.json(
        {
          success: false,
          message: "Chat ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const limit = 20;

    const skip = (page - 1) * limit;

    const chat = await ChatModel.findById(chatId);

    if (!chat) {
      return Response.json(
        {
          success: false,
          message: "Chat not found",
        },
        {
          status: 404,
        }
      );
    }

    if (!chat.members.some((member) => member._id.equals(ReqUserId))) {
      return Response.json(
        {
          success: false,
          message: "You are not a member of this chat",
        },
        {
          status: 403,
        }
      );
    }

    const [messages, totalMessagesCount] = await Promise.all([
      MessageModel.find({
        chat: chatId,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate("sender", "name")
        .lean(),
      MessageModel.countDocuments({
        chat: chatId,
      }),
    ]);

    if (chatId === ReqUserId.toString()) {
      messages.forEach((message) => {
        message.sender = {
          _id: new Types.ObjectId(user._id),
          name: "Anonymous",
        } as any;
      });
    }

    const totalPages = Math.ceil(totalMessagesCount / limit) || 1;

    return Response.json(
      {
        success: true,
        messages,
        totalMessagesCount,
        totalPages,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    const Error = error as AuthError;
    return Response.json(
      {
        success: false,
        message: Error.message || "Failed to delete message",
      },
      {
        status: 500,
      }
    );
  }
}
