import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    isVerified: boolean;
    isAcceptingMessage: boolean;
    isAdmin: boolean;
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar: {
      public_id: string;
      url: string;
    };
    createdAt: string;
    updatedAt: string;
  }
  interface Session {
    user: {
      isVerified: boolean;
      isAcceptingMessage: boolean;
      isAdmin: boolean;
      _id: string;
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
    isVerified: boolean;
    isAcceptingMessage: boolean;
    isAdmin: boolean;
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar: {
      public_id: string;
      url: string;
    };
    createdAt: string;
    updatedAt: string;
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
    isAcceptingMessage?: boolean;
    username?: string;
    email?: string;
    avatar?: {
      public_id: string;
      url: string;
    };
  }
}
