import { sendVerificationEmail } from "@/backend/helpers/sendVerificationEmail";
import { uploadFilesToCloudinary } from "@/backend/lib/cloudinary";
import dbConnect from "@/backend/lib/dbConnect";
import ChatModel from "@/backend/model/chat.model";
import UserModel from "@/backend/model/user.model";
import bcrypt from "bcryptjs";

export const config = {
  api: { bodyParser: false },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const username = formData.get("username")?.toString().trim();
    const password = formData.get("password")?.toString();
    const file = formData.get("avatar");

    if (!name) {
      return Response.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    if (!email) {
      return Response.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    if (!username) {
      return Response.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      );
    }

    if (!password) {
      return Response.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    if (!file || !(file instanceof File)) {
      return Response.json(
        { success: false, message: "A valid file is required" },
        { status: 400 }
      );
    }

    const cloudinaryResult = await uploadFilesToCloudinary([file]);
    const profileImage = cloudinaryResult[0];

    if (!profileImage) {
      return Response.json(
        { success: false, message: "Failed to upload profile picture" },
        { status: 500 }
      );
    }

    await dbConnect();

    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        { success: false, message: "Username already exists" },
        { status: 400 }
      );
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000);
    const verifyCodeExpiry = new Date();
    verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1);

    let user = await UserModel.findOne({ email });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      if (user.isVerified) {
        return Response.json(
          { success: false, message: "User already exists with this email" },
          { status: 400 }
        );
      } else {
        user.name = name;
        user.username = username;
        user.password = hashedPassword;
        user.verifyCode = verifyCode;
        user.verifyCodeExpiry = verifyCodeExpiry;
        user.avatar = profileImage;

        await user.save();
      }
    } else {
      user = await UserModel.create({
        name,
        email,
        username,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry,
        isVerified: false,
        avatar: profileImage,
      });
    }

    await ChatModel.create({
      _id: user._id,
      members: [user._id],
      groupChat: true,
      name: user.name,
      creator: user._id,
    });

    const baseUrl = request.headers.get("origin") || "http://localhost:3000";

    const emailResponse = await sendVerificationEmail({
      baseUrl,
      email,
      username,
      verifyCode,
    });

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: `Failed to send verification email: ${emailResponse.message}`,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/sign-up", error);
    return Response.json(
      {
        success: false,
        message: "Error Registering User",
      },
      { status: 500 }
    );
  }
}
