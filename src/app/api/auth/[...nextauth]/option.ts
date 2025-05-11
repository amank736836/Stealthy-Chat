import { sendVerificationEmail } from "@/backend/helpers/sendVerificationEmail";
import dbConnect from "@/backend/lib/dbConnect";
import UserModel, { User } from "@/backend/model/user.model";
import bcrypt from "bcryptjs";
import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        baseUrl: {
          label: "Base URL",
          type: "text",
          placeholder: "Base URL",
        },
        identifier: {
          label: "Username or Email",
          type: "text",
          placeholder: "Username or Email",
        },
        password: {
          label: "Password",
          type: "text",
          placeholder: "Password",
        },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials.baseUrl) {
          throw new Error("Base URL is required");
        }

        if (!credentials.identifier) {
          throw new Error("Username or Email is required");
        }

        if (!credentials.password) {
          throw new Error("Password is required");
        }

        await dbConnect();
        try {
          const user: User = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          }).select("+password");

          const baseUrl = credentials.baseUrl as string;

          if (!user) {
            throw new Error("No user found with this username or email");
          }

          if (!user.isVerified) {
            if (user.verifyCodeExpiry < new Date()) {
              const verifyCode = Math.floor(100000 + Math.random() * 900000);

              const verifyCodeExpiry = new Date();
              verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1);

              user.verifyCode = verifyCode;
              user.verifyCodeExpiry = verifyCodeExpiry;

              await user.save();

              const emailResponse = await sendVerificationEmail({
                baseUrl,
                email: user.email,
                username: user.username,
                verifyCode,
              });

              if (!emailResponse.success) {
                return Response.json(
                  {
                    success: false,
                    message: `Failed to send verification email: ${emailResponse.message}`,
                  },
                  {
                    status: 500,
                  }
                );
              }

              throw new Error(
                "User is not verified and Verification code expired. New verification code sent to your email"
              );
            } else {
              throw new Error("Please verify your account before logging in");
            }
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) {
            throw new Error("Invalid password");
          }

          return user;
        } catch (error) {
          throw new Error(`Error in authorize: ${error}`);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAcceptingMessage = user.isAcceptingMessage;
        token.isVerified = user.isVerified;
        token.isAdmin = user.isAdmin;
        token._id = user._id.toString();
        token.name = user.name;
        token.username = user.username;
        token.email = user.email;
        token.avatar = user.avatar;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.isAcceptingMessage = token.isAcceptingMessage as boolean;
        session.user.isVerified = token.isVerified as boolean;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user._id = token._id as string;
        session.user.name = token.name as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.avatar = token.avatar as {
          public_id: string;
          url: string;
        };
        session.user.createdAt = token.createdAt as string;
        session.user.updatedAt = token.updatedAt as string;
      }
      return session;
    },
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
};

export const { handlers, auth } = NextAuth(authOptions);
