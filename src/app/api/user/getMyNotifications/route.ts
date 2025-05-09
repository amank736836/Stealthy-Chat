import dbConnect from "@/backend/lib/dbConnect";
import RequestModel from "@/backend/model/request.model";
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

  try {
    await dbConnect();

    const ReqUserId = new Types.ObjectId(user._id);

    const requests = await RequestModel.find({
      receiver: ReqUserId,
      status: "pending",
    }).populate("sender", "name avatar");

    const allRequests = requests.map(({ _id, sender }) => ({
      _id,
      sender: {
        id: sender._id,
        name: sender.name,
        avatar: sender.avatar.url,
      },
    }));

    return Response.json(
      {
        success: true,
        message: "Notifications fetched successfully",
        allRequests,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Unable to fetch notifications", error);
    return Response.json(
      {
        success: false,
        message: "Unable to fetch notifications",
      },
      {
        status: 500,
      }
    );
  }
}
