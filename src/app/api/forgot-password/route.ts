import { sendForgotPasswordEmail } from "@/backend/helpers/sendForgotPasswordEmail";
import dbConnect from "@/backend/lib/dbConnect";
import UserModel from "@/backend/model/User";

export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return Response.json(
        {
          success: false,
          message: "Identifier is required",
        },
        {
          status: 400,
        }
      );
    }

    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      throw new Error("No user found with this username or email");
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const verifyCodeExpiry = new Date();
    verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1);

    if (user) {
      user.verifyCode = verifyCode;
      user.verifyCodeExpiry = verifyCodeExpiry;
      await user.save();
    }

    const baseUrl = `${request.headers.get("origin")}`;

    const emailResponse = await sendForgotPasswordEmail({
      baseUrl,
      username: user.username,
      email: user.email,
      verifyCode,
    });

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message:
          "Forgot password code sent successfully. Please set a new password",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: `Error in forgot password: ${error}`,
      },
      {
        status: 500,
      }
    );
  }
}
