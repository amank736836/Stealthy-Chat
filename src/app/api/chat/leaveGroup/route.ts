import { auth } from "@/app/api/auth/[...nextauth]/option";
import { ALERT, REFETCH_CHATS } from "@/app/constants/events";
import dbConnect from "@/backend/lib/dbConnect";
import { emitEvent } from "@/backend/lib/socket";
import ChatModel from "@/backend/model/chat.model";
import MessageModel from "@/backend/model/message.model";
import UserModel from "@/backend/model/user.model";
import { Types } from "mongoose";
import { AuthError, User } from "next-auth";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
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
  const { chatId } = await request.json();

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
    if (!chat.members.includes(ReqUserId)) {
      return Response.json(
        {
          success: false,
          message: "You are not a member of this group",
        },
        {
          status: 403,
        }
      );
    }
    const otherMembers = chat.members.filter(
      (member) => member.toString() !== ReqUserId.toString()
    );
    chat.members = otherMembers;

    if (chat.creator.toString() === ReqUserId.toString()) {
      const randomCreator = Math.floor(Math.random() * otherMembers.length);
      chat.creator = otherMembers[randomCreator] || "";
    }
    const [user] = await Promise.all([
      UserModel.findById(ReqUserId, "name"),
      chat.save(),
    ]);

    emitEvent(ALERT, otherMembers, {
      chatId,
      message: `${user?.name || "User"}, I am leaving the group`,
    });

    MessageModel.create({
      chat: chatId,
      content: `${user?.name || "User"}, I am leaving the group`,
      sender: ReqUserId,
    });

    emitEvent(REFETCH_CHATS, [ReqUserId]);

    return Response.json(
      {
        success: true,
        message: "Left group successfully",
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
        message: Error.message || "Failed to leave group",
      },
      {
        status: 500,
      }
    );
  }
}
function deleteFilesFromCloudinary(public_Ids: string[][]): any {
  throw new Error("Function not implemented.");
}
