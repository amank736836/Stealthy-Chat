import { auth } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/backend/lib/dbConnect";
import ChatModel from "@/backend/model/chat.model";
import MessageModel from "@/backend/model/message.model";
import { Types } from "mongoose";
import { User } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
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


  if (!ReqUserId) {
    return Response.json(
      {
        success: false,
        message: "UserId is required",
      },
      {
        status: 404,
      }
    );
  }

  await dbConnect();

  try {
    const chat = await ChatModel.findById(ReqUserId);

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
        chat: ReqUserId,
      })
        .sort({ createdAt: -1 })
        .populate("sender", "name")
        .lean(),
      MessageModel.countDocuments({
        chat: ReqUserId,
      }),
    ]);

    messages.forEach((message) => {
      message.sender = {
        _id: new Types.ObjectId(user._id),
        name: "Anonymous",
      } as any;
    });

    return Response.json(
      {
        success: true,
        messages,
        totalMessagesCount,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Unable to get messages", error);
    return Response.json(
      {
        success: false,
        message: "Unable to get messages",
      },
      {
        status: 500,
      }
    );
  }
}
