"use client";

import { messageSchema } from "@/backend/schemas/messageSchema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const specialChar = "||";

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar).map((msg) => msg.trim());
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const { toast } = useToast();

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
  });

  const messageContent = form.watch("content");

  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);

    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      if (response.data.success) {
        form.reset({ content: "" });
      }

      toast({
        title: "Message sent",
        description: response.data.message || "Please try again",
        variant: response.data.success ? "default" : "destructive",
        duration: 1000,

      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error sending message",
        description:
          axiosError.response?.data.message ?? `An error occurred: ${error}`,
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [messageString, setMessageString] = useState(initialMessageString);
  const [messageArray, setMessageArray] = useState<string[]>([]);
  const [isCompletionLoading, setIsCompletionLoading] = useState(false);
  const [completionError, setCompletionError] = useState<Error | null>(null);

  const fetchSuggestedMessages = useCallback(async () => {
    setIsCompletionLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/suggest-messages", {
        exclude: messageString,
      });

      console.log("Suggested messages:", response);

      if (response.data.success) {
        setMessageString(response.data.message);
      } else {
        toast({
          title: "Error fetching suggested messages",
          description: response.data.message,
          variant: "destructive",
          duration: 1000,
        });
      }
    } catch (error) {
      console.error("Failed to fetch suggested messages:", error);
      setCompletionError(error as Error);
    } finally {
      setIsCompletionLoading(false);
    }
  }, [messageString]);

  useEffect(() => {
    fetchSuggestedMessages();
  }, []);

  useEffect(() => {
    const array = async () => {
      setMessageArray(await parseStringMessages(messageString));
    };

    array();
  }, [messageString]);

  return (
    <div className="container mx-auto my-8 p-6 bg-white dark:bg-gray-900 rounded-lg max-w-4xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        Public Profile Link
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-900 dark:text-gray-300">
                  Send Anonymous Message to @{username}
                </FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    className="resize-none p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Write your anonymous message here"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isLoading || !messageContent}
              className="dark:bg-blue-500 dark:text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please Wait
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <div className="space-y-6 my-8">
        <Button
          onClick={fetchSuggestedMessages}
          className="w-full dark:bg-gray-700 dark:text-white"
          disabled={isCompletionLoading}
        >
          {isCompletionLoading ? "Loading..." : "Suggest Messages"}
        </Button>

        {completionError && (
          <p className="text-red-500 text-center">{completionError.message}</p>
        )}

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Suggested Messages
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
            {completionError ? (
              <p className="text-red-500">{completionError.message}</p>
            ) : messageString ? (
              messageArray.map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleMessageClick(message)}
                  className="w-full text-left break-words whitespace-pre-wrap p-3 my-2 border border-gray-300 dark:border-gray-600 rounded-md dark:text-white"
                >
                  {message}
                </Button>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No messages to suggest
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6 dark:bg-gray-700" />

      <div className="text-center">
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Get Your Own Message Board
        </p>
        <Link href="/sign-up">
          <Button className="dark:bg-blue-500 dark:text-white">
            Create Your Account
          </Button>
        </Link>
      </div>
    </div>
  );
}
