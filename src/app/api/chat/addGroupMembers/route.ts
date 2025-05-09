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
  const { chatId, members } = await req.json();
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

    if (!members) {
      return Response.json(
        {
          success: false,
          message: "Members are required",
        },
        {
          status: 400,
        }
      );
    }

    if (members.length < 1) {
      return Response.json(
        {
          success: false,
          message: "Please select members to add",
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
          status: 403,
        }
      );
    }

    interface UserDocument {
      _id: Types.ObjectId;
      name: string;
    }

    const allNewMembersPromise: Promise<UserDocument>[] = members.map(
      (memberId: string | Types.ObjectId) =>
        UserModel.findById(memberId, "name")
    );

    const allNewMembers = await Promise.all(allNewMembersPromise);

    const uniqueMembers = allNewMembers.map(({ _id }) => _id);

    if (uniqueMembers.length < 1) {
      return Response.json(
        {
          success: false,
          message: "Please select members to add",
        },
        {
          status: 400,
        }
      );
    }

    chat.members.push(...uniqueMembers);

    if (chat.members.length > 100) {
      return Response.json(
        {
          success: false,
          message: "Group members limit exceeded",
        },
        {
          status: 400,
        }
      );
    }

    await chat.save();

    const allUsersName = allNewMembers.map(({ name }) => name).join(",");

    emitEvent(ALERT, chat.members, {
      chatId,
      message: `${allUsersName} has been added in the group`,
    });

    MessageModel.create({
      chat: chatId,
      content: `${allUsersName} has been added in the group`,
      sender: ReqUserId,
    });

    emitEvent(REFETCH_CHATS, uniqueMembers);

    return Response.json(
      {
        success: true,
        message: "Members added successfully",
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
