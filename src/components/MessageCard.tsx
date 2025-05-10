"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Message } from "@/backend/model/message.model";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { X } from "lucide-react";
import { Button } from "./ui/button";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const { toast } = useToast();

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/user/deleteMessage`, {
        data: {
          messageId: message._id.toString(),
        },
      }
      );



      if (response.data.success) {
        onMessageDelete(message._id.toString());
        toast({
          title: "Message deleted successfully",
          description: "Your message has been deleted successfully",
          variant: "default",
          duration: 1000,
        });
      } else {
        toast({
          title: "Error deleting message",
          description: response.data.message,
          variant: "destructive",
          duration: 1000,
        });
      }
    } catch (error) {

      console.error("Error deleting message:", error);

      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error deleting message",
        description:
          axiosError.response?.data.message ??
          `An error occurred while deleting the message, ${error}`,
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  return (
    <Card className="card-bordered">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{message.content}</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <X className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your message.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="text-sm">
          {new Date(message.createdAt).toLocaleString()}
        </div>

        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}

export default MessageCard;
