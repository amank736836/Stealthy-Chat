import dbConnect from "@/backend/lib/dbConnect";
import ChatModel from "@/backend/model/chat.model";
import { Types } from "mongoose";
import { User } from "next-auth";
import { NextRequest } from "next/server";
import { auth } from "../../auth/[...nextauth]/option";

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

  if (!ReqUserId)
    return Response.json(
      {
        success: false,
        message: "User not found",
      },
      {
        status: 404,
      }
    );

  try {
    await dbConnect();

    interface IMember {
      _id: Types.ObjectId;
      name: string;
      avatar: {
        url: string;
      };
    }

    interface IChat {
      _id: Types.ObjectId;
      name: string;
      groupChat: boolean;
      members: IMember[];
      creator: Types.ObjectId;
      updatedAt: Date;
    }

    const chats = (await ChatModel.find({
      members: ReqUserId,
      groupChat: true,
      creator: ReqUserId,
    })
      .populate("members", "name avatar")
      .sort({ updatedAt: -1 })
      .lean()) as unknown as IChat[];

    const groups = chats.map(({ _id, name, groupChat, members }) => ({
      _id,
      name,
      groupChat,
      avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
      members: members.map(({ _id }) => _id),
    }));

    return Response.json(
      {
        success: true,
        message: "Groups fetched successfully",
        groups,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("error", error);
    console.error("Unable to search users", error);
    return Response.json(
      {
        success: false,
        message: "Unable to search users",
      },
      {
        status: 500,
      }
    );
  }
}
