import dbConnect from "@/backend/lib/dbConnect";
import ChatModel, { Chat } from "@/backend/model/chat.model";
import { Types } from "mongoose";
import { User } from "next-auth";
import { NextRequest } from "next/server";
import { auth } from "../../auth/[...nextauth]/option";

export async function GET(
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

  try {
    await dbConnect();

    const ReqUserId = new Types.ObjectId(user._id);

    const chatId = await params;

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

    const chats = (await ChatModel.find({
      members: ReqUserId,
      groupChat: false,
    }).populate("members", "name avatar")) as unknown as IChat[];

    const friendsExceptMe = chats.map((chat: IChat) => {
      let otherMember = null;
      if (chat._id.toString() !== ReqUserId.toString()) {
        otherMember = chat.members.find(
          (member) => member._id.toString() !== ReqUserId.toString()
        );
      } else {
        otherMember = chat.members[0];
      }
      return {
        _id: otherMember?._id,
        name: otherMember?.name,
        avatar: otherMember?.avatar?.url,
      };
    });

    const uniqueFriends = friendsExceptMe
      .filter(
        (friend, index, self) =>
          index ===
          self.findIndex((f) => f?._id?.toString() === friend?._id?.toString())
      )
      .filter((user) => user?._id?.toString() !== ReqUserId.toString());

    if (chatId) {
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

      const availableFriends = uniqueFriends.filter(
        (friend) =>
          friend._id &&
          !chat.members.some(
            (member) => member.toString() === friend._id?.toString()
          )
      );

      return Response.json(
        {
          success: true,
          messages: "Available friends to add to chat",
          users: availableFriends,
        },
        {
          status: 200,
        }
      );
    }

    return Response.json(
      {
        success: true,
        messages: "Your friends list",
        friends: uniqueFriends,
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
