import { NEW_REQUEST, REFETCH_CHATS } from "@/app/constants/events";
import dbConnect from "@/backend/lib/dbConnect";
import { emitEvent } from "@/backend/lib/socket";
import RequestModel from "@/backend/model/request.model";
import { Types } from "mongoose";
import { User } from "next-auth";
import { auth } from "../../auth/[...nextauth]/option";
import ChatModel from "@/backend/model/chat.model";

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

  try {
    await dbConnect();

    const ReqUserId = new Types.ObjectId(user._id);

    const { requestId, accept } = await req.json();

    if (!requestId) {
      return Response.json(
        {
          success: false,
          message: "Request ID is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!accept) {
      return Response.json(
        {
          success: false,
          message: "Accept or reject is required",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof accept !== "boolean") {
      return Response.json(
        {
          success: false,
          message: "Accept or reject should be a boolean",
        },
        {
          status: 400,
        }
      );
    }

    const request = await RequestModel.findById(requestId)
      .populate("sender", "name")
      .populate("receiver", "name");

    if (!request) {
      return Response.json(
        {
          success: false,
          message: "Request not found",
        },
        {
          status: 404,
        }
      );
    }

    if (request.receiver._id.toString() !== ReqUserId.toString()) {
      return Response.json(
        {
          success: false,
          message: "You are not authorized to accept this request",
        },
        {
          status: 403,
        }
      );
    }

    if (!accept) {
      await request.deleteOne();
      return Response.json(
        {
          success: true,
          message: "Friend request rejected successfully",
        },
        {
          status: 200,
        }
      );
    }

    const members = [request.sender._id, request.receiver._id];

    await ChatModel.create({
      members,
      name: `${request.sender.name} - ${request.receiver.name}`,
      groupChat: false,
      creator: ReqUserId,
    });

    await request.deleteOne();

    emitEvent(
      REFETCH_CHATS,
      [request.sender._id.toString()],
      "Friend request accepted"
    );

    return Response.json(
      {
        success: true,
        message: "Friend request accepted successfully",
        senderId: request.sender._id,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Unable to accept request", error);
    return Response.json(
      {
        success: false,
        message: "Unable to accept request",
      },
      {
        status: 500,
      }
    );
  }
}
