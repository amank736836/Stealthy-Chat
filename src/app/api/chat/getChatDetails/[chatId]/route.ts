import { auth } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/backend/lib/dbConnect";
import ChatModel from "@/backend/model/chat.model";
import { Types } from "mongoose";
import { AuthError, User } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;

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

  await dbConnect();

  try {
    const params = request.nextUrl.searchParams;
    const page = Number(params.get("page")) || 1;
    const populate = params.get("populate") === "true";

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

    interface IMember {
      _id: Types.ObjectId;
      name: string;
      avatar?: {
        url: string;
      };
    }

    interface IChat {
      _id: Types.ObjectId;
      name?: string;
      members: IMember[];
      groupChat: boolean;
      updatedAt?: Date;
    }

    if (populate) {
      const chat = (await ChatModel.findById(chatId)
        .populate("members", "name avatar")
        .lean()) as unknown as IChat;

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

      return Response.json({
        success: true,
        message: "Chat details fetched successfully",
        chat: {
          _id: chat._id,
          name: chat.name,
          members: chat.members.map(({ _id, name, avatar }) => ({
            _id,
            name,
            avatar: avatar?.url,
          })),
        },
      });
    }

    const chat = await ChatModel.findById(chatId);

    if (!chat) {
      return Response.json(
        {
          success: true,
          message: "Chat not found",
        },
        {
          status: 200,
        }
      );
    }

    return Response.json({
      success: true,
      message: "Chat details fetched successfully",
      chat,
    });
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
