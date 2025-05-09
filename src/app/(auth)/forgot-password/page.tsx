"use client";

import { forgotPasswordSchema } from "@/backend/schemas/forgotPasswordSchema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

function ForgotPassword({
  searchParams,
}: {
  searchParams: Promise<{
    identifier: string;
  }>;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (session && session.user) {
      router.push("/dashboard");
      return;
    }
  }, [session, router]);

  const [loading, setLoading] = useState<boolean>(false);

  const { identifier } = use(searchParams);

  useEffect(() => {
    if (identifier) {
      form.setValue("identifier", identifier);
    }
  }, [identifier]);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: identifier || "",
    },
  });

  const watchFields = form.watch(["identifier"]);
  const isButtonDisabled = watchFields.some((field) => !field) || loading;

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/forgot-password", {
        identifier: data.identifier,
      });

      toast({
        title: "Success",
        description:
          response.data.message || "Forgot password Code sent successfully",
        variant: "default",
        duration: 1000,
      });

      router.replace(`/verify-forgot-password?identifier=${data.identifier}`);
    } catch (error) {
      console.error("Error in resetting password", error);

      const axiosError = error as AxiosError<ApiResponse>;

      const errorMessage =
        axiosError.response?.data.message ||
        "Some error occurred. Please try again later";

      toast({
        title: "Forgot Password Code Not Sent",
        description: errorMessage,
        variant: "destructive",
        duration: 1000,
      });

      if (
        errorMessage ===
        "Error in forgot password: Error: No user found with this username or email"
      ) {
        router.replace(`/sign-up?identifier=${data.identifier}`);
      }
    } finally {
      setLoading(false);
      form.reset();
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-125px)] bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-gray-900 dark:text-white">
            Forgot Your Password
          </h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900 dark:text-gray-300">
                    Username or Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your username or email"
                      {...field}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              disabled={isButtonDisabled || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default ForgotPassword;
