import { auth } from "@/app/api/auth/[...nextauth]/option";
import { REFETCH_CHATS } from "@/app/constants/events";
import dbConnect from "@/backend/lib/dbConnect";
import { emitEvent } from "@/backend/lib/socket";
import ChatModel from "@/backend/model/chat.model";
import MessageModel from "@/backend/model/message.model";
import { Types } from "mongoose";
import { AuthError, User } from "next-auth";
import { NextRequest } from "next/server";

export async function PUT(
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

  const ReqUserId = new Types.ObjectId(user.id);

  await dbConnect();

  try {
    const { name } = await request.json();

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

    if (!name) {
      return Response.json(
        {
          success: false,
          message: "Group name is required",
        },
        {
          status: 400,
        }
      );
    }

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

    if (!chat.groupChat) {
      return Response.json(
        {
          success: false,
          message: "Not a group chat",
        },
        {
          status: 400,
        }
      );
    }

    if (chat.creator.toString() !== ReqUserId.toString()) {
      return Response.json(
        {
          success: false,
          message: "Not authorized",
        },
        {
          status: 403,
        }
      );
    }

    chat.name = name;

    await chat.save();

    MessageModel.create({
      chat: chatId,
      content: `Group name changed from ${chat.name} to ${name}`,
      sender: ReqUserId,
    });

    emitEvent(
      REFETCH_CHATS,
      chat.members.map((member) => member._id.toString())
    );

    return Response.json(
      {
        success: true,
        message: "Group name updated successfully",
        chat,
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
