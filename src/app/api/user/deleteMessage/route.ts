import { auth } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/backend/lib/dbConnect";
import MessageModel from "@/backend/model/message.model";
import { AuthError, User } from "next-auth";

export async function DELETE(request: Request) {
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

  const { messageId } = await request.json();

  if (!messageId) {
    return Response.json(
      {
        success: false,
        message: "Message ID is required",
      },
      {
        status: 400,
      }
    );
  }

  await dbConnect();

  try {
    const updatedResult = await MessageModel.updateOne(
      { _id: messageId },
      { $set: { deleted: true } }
    );

    if (updatedResult.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found or already deleted",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    const Error = error as AuthError;
    return Response.json(
      {
        success: false,
        message: Error.message || "Failed to delete message",
      },
      {
        status: 500,
      }
    );
  }
}
