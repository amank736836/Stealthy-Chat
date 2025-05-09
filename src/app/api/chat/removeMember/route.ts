import { ALERT, NEW_REQUEST, REFETCH_CHATS } from "@/app/constants/events";
import dbConnect from "@/backend/lib/dbConnect";
import { emitEvent } from "@/backend/lib/socket";
import RequestModel from "@/backend/model/request.model";
import { Types } from "mongoose";
import { User } from "next-auth";
import { auth } from "../../auth/[...nextauth]/option";
import ChatModel from "@/backend/model/chat.model";
import UserModel from "@/backend/model/user.model";
import MessageModel from "@/backend/model/message.model";

export async function PUT(req: Request) {
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
  const { chatId, memberId } = await req.json();
  try {
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

    if (!memberId) {
      return Response.json(
        {
          success: false,
          message: "Member ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const [chat, userThatWillBeRemoved] = await Promise.all([
      ChatModel.findById(chatId),
      UserModel.findById(memberId, "name"),
    ]);

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

    if (!userThatWillBeRemoved) {
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

    if (!chat.groupChat) {
      return Response.json(
        {
          success: false,
          message: "This is not a group chat",
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
          message: "You are not the creator of this group",
        },
        {
          status: 400,
        }
      );
    }

    if (!chat.members.includes(memberId)) {
      return Response.json(
        {
          success: false,
          message: "User is not a member of this group",
        },
        {
          status: 400,
        }
      );
    }

    if (chat.members.length < 2) {
      return Response.json(
        {
          success: false,
          message: "You cannot remove the last member of the group",
        },
        {
          status: 400,
        }
      );
    }

    chat.members = chat.members.filter(
      (member) => member.toString() !== memberId.toString()
    );

    await chat.save();

    emitEvent(ALERT, chat.members, {
      chatId,
      message: `User ${userThatWillBeRemoved.name} has been removed from the group`,
    });

    emitEvent(REFETCH_CHATS, [memberId]);

    MessageModel.create({
      chat: chatId,
      content: `User ${userThatWillBeRemoved.name} has been removed from the group`,
      sender: ReqUserId,
    });

    return Response.json(
      {
        success: true,
        message: "Member removed successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Unable to send friend request", error);
    return Response.json(
      {
        success: false,
        message: "Unable to send friend request",
      },
      {
        status: 500,
      }
    );
  }
}
