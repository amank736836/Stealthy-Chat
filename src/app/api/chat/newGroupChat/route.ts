import { ALERT, REFETCH_CHATS } from "@/app/constants/events";
import dbConnect from "@/backend/lib/dbConnect";
import { emitEvent } from "@/backend/lib/socket";
import ChatModel from "@/backend/model/chat.model";
import MessageModel from "@/backend/model/message.model";
import { Types } from "mongoose";
import { User } from "next-auth";
import { auth } from "../../auth/[...nextauth]/option";

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
  const { name, otherMembers } = await request.json();

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

  if (!otherMembers || otherMembers.length === 0) {
    return Response.json(
      {
        success: false,
        message: "At least one other member is required",
      },
      {
        status: 400,
      }
    );
  }

  await dbConnect();

  try {
    const members = [...otherMembers, ReqUserId];

    const chat = await ChatModel.create({
      name,
      members,
      groupChat: true,
      creator: ReqUserId,
    });

    emitEvent(ALERT, members, {
      chatId: chat._id,
      message: `Welcome to ${name} group chat`,
    });

    emitEvent(REFETCH_CHATS, otherMembers);

    MessageModel.create({
      chat: chat._id,
      content: `Welcome to ${name} group chat`,
      sender: ReqUserId,
    });

    return Response.json(
      {
        success: true,
        message: "Group chat created successfully",
        chat,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: `Error in forgot password: ${error}`,
      },
      {
        status: 500,
      }
    );
  }
}
