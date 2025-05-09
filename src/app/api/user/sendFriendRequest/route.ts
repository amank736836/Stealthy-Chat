import { NEW_REQUEST } from "@/app/constants/events";
import dbConnect from "@/backend/lib/dbConnect";
import { emitEvent } from "@/backend/lib/socket";
import RequestModel from "@/backend/model/request.model";
import { Types } from "mongoose";
import { User } from "next-auth";
import { auth } from "../../auth/[...nextauth]/option";

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
  
  try {
    await dbConnect();

    const { userId } = await req.json();

    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "User ID is required",
        },
        {
          status: 400,
        }
      );
    }

    if (userId === ReqUserId.toString()) {
      return Response.json(
        {
          success: false,
          message: "You cannot send a friend request to yourself",
        },
        {
          status: 400,
        }
      );
    }

    const [requestSent, requestReceived] = await Promise.all([
      RequestModel.findOne({
        sender: ReqUserId,
        receiver: userId,
      }),
      RequestModel.findOne({
        sender: userId,
        receiver: ReqUserId,
      }),
    ]);

    if (requestSent) {
      return Response.json(
        {
          success: false,
          message: "Request already sent",
        },
        {
          status: 400,
        }
      );
    }

    if (requestReceived) {
      return Response.json(
        {
          success: false,
          message: "Request already received",
        },
        {
          status: 400,
        }
      );
    }

    await RequestModel.create({
      sender: ReqUserId,
      receiver: userId,
    });

    emitEvent(NEW_REQUEST, [userId], "New friend request received");

    return Response.json(
      {
        success: true,
        message: "Friend request sent successfully",
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
