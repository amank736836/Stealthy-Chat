import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    isVerified: boolean;
    isAcceptingMessages: boolean;
    _id: string;
    username: string;
    email: string;
    avatar: {
      public_id: string;
      url: string;
    };
  }
  interface Session {
    user: {
      _id: string;
      isVerified: boolean;
      isAcceptingMessages: boolean;
      name: string;
      username: string;
      email: string;
      avatar: {
        public_id: string;
        url: string;
      };
      createdAt: string;
      updatedAt: string;
    } & DefaultSession["user"];
  }
  interface token {
    _id: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    username: string;
  }

  interface Request {
    sender: string;
    receiver: string;
    status: string;
  }

  interface Chat {
    _id: string;
    members: string[];
    groupChat: boolean;
    name: string;
    creator: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
    email?: string;
    avatar?: {
      public_id: string;
      url: string;
    };
  }
}
