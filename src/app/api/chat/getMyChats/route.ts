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

  try {
    await dbConnect();

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

    const chats = (await ChatModel.find({ members: ReqUserId })
      .populate("members", "name avatar")
      .sort({ updatedAt: -1 })) as unknown as IChat[];

    const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
      let otherMember = null;
      if (_id.toString() !== ReqUserId.toString()) {
        otherMember = members.find(
          (member) => member._id.toString() !== ReqUserId.toString()
        );
      } else {
        otherMember = members[0];
      }

      return {
        _id,
        name: groupChat ? name : otherMember?.name,
        groupChat,
        avatar: groupChat
          ? members
              .slice(0, 3)
              .map(({ avatar }) => avatar?.url)
              .filter(Boolean)
          : otherMember?.avatar?.url
            ? [otherMember.avatar.url]
            : [],
        members: members.reduce<Types.ObjectId[]>((acc, member) => {
          if (member._id.toString() !== ReqUserId.toString()) {
            acc.push(member._id);
          }
          return acc;
        }, []),
      };
    });

    return Response.json(
      {
        success: true,
        chats: transformedChats,
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
