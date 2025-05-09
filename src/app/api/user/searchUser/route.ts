import { auth } from "@/app/api/auth/[...nextauth]/option";
import RequestModel, { Request } from "@/backend/model/request.model";
import UserModel from "@/backend/model/user.model";
import { Types } from "mongoose";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export interface SearchResult {
  id: string;
  name: string;
  avatar: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name") || "";

    const ReqUserId = new Types.ObjectId(session.user._id);

    console.log("ReqUserId", ReqUserId);
    console.log("name", name);
    // const ReqUserId = new Types.ObjectId(session.user._id);

    const allUsersRequest = (await RequestModel.find({
      $or: [{ sender: ReqUserId }, { receiver: ReqUserId }],
    }).lean()) as Request[];

    const allUsersFromMyChats: Types.ObjectId[] = [];

    const ReqUserIdsToExclude = [
      ...allUsersFromMyChats.map((member) => member._id),
      ReqUserId,
    ];

    const allUsersExceptMeAndFriends = (await UserModel.find({
      _id: { $nin: ReqUserIdsToExclude },
      name: { $regex: name, $options: "i" },
    })
      .limit(20)
      .lean()) as unknown as User[]; // Adding a limit for performance

    const filteredUsers = allUsersExceptMeAndFriends.filter(
      (user) =>
        !allUsersRequest.some(
          (request) =>
            (request.sender.toString() === user._id.toString() &&
              request.receiver.toString() === ReqUserId.toString()) ||
            (request.receiver.toString() === user._id.toString() &&
              request.sender.toString() === ReqUserId.toString())
        )
    );

    const users: SearchResult[] = filteredUsers.map((user) => ({
      id: user._id.toString(),
      name: user.name || "",
      avatar: user.avatar?.url || "",
    }));

    return NextResponse.json(
      {
        success: true,
        message: `Found ${users.length} results for "${name}"`,
        users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unable to search users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to search users",
      },
      { status: 500 }
    );
  }
}
