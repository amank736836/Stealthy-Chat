import { auth } from "@/app/api/auth/[...nextauth]/option";
import { REFETCH_CHATS } from "@/app/constants/events";
import dbConnect from "@/backend/lib/dbConnect";
import { emitEvent } from "@/backend/lib/socket";
import ChatModel from "@/backend/model/chat.model";
import MessageModel from "@/backend/model/message.model";
import { Types } from "mongoose";
import { AuthError, User } from "next-auth";
import { NextRequest } from "next/server";

export async function DELETE(
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

  const ReqUserId = new Types.ObjectId(user.id);
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

    if (chat.groupChat && chat.creator.toString() !== ReqUserId.toString()) {
      return Response.json(
        {
          success: false,
          message: "You are not the creator of this group",
        },
        {
          status: 403,
        }
      );
    }

    if (!chat.groupChat && !chat.members.includes(ReqUserId)) {
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

    const messageWithAttachments = await MessageModel.find({
      chat: chatId,
      attachments: { $exists: true, $ne: [] },
    });

    const public_Ids = messageWithAttachments.map((message) =>
      message.attachments.map(
        ({ public_id }: { public_id: string }) => public_id
      )
    );

    const members = chat.members;

    await Promise.all([
      deleteFilesFromCloudinary(public_Ids),
      chat.deleteOne(),
      MessageModel.deleteMany({ chat: chatId }),
    ]);

    emitEvent(REFETCH_CHATS, members);

    return Response.json(
      {
        success: true,
        message: "Chat deleted successfully",
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
function deleteFilesFromCloudinary(public_Ids: string[][]): any {
  throw new Error("Function not implemented.");
}
