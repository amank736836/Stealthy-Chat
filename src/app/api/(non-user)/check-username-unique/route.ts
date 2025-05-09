import dbConnect from "@/backend/lib/dbConnect";
import UserModel from "@/backend/model/user.model";
import { usernameValidation } from "@/backend/schemas/signUpSchema";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryParam = {
    username: searchParams.get("username"),
  };

  const result = UsernameQuerySchema.safeParse(queryParam);

  if (!result.success) {
    const usernameErrors = result.error.format().username?._errors || [];

    return Response.json(
      {
        success: false,
        message:
          usernameErrors?.length > 0
            ? usernameErrors.join(", ")
            : usernameErrors,
      },
      {
        status: 400,
      }
    );
  }

  const { username } = result.data;

  if (!username) {
    return Response.json(
      {
        success: false,
        message: "Username is required",
      },
      {
        status: 400,
      }
    );
  }

  await dbConnect();

  try {
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to check username unique", error);
    return Response.json(
      {
        success: false,
        message: "Failed to check username unique",
      },
      {
        status: 500,
      }
    );
  }
}
