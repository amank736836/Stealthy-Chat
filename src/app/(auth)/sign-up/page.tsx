"use client";

import { signUpSchema } from "@/backend/schemas/signUpSchema";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts";
import * as z from "zod";

function SignUp({
  searchParams,
}: {
  searchParams: Promise<{
    identifier: string;
  }>;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setDebouncedUsername = useDebounceCallback(setUsername, 500);
  const [error, setError] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { identifier } = use(searchParams);

  useEffect(() => {
    if (identifier?.includes("@")) {
      form.setValue("email", identifier);
    } else {
      form.setValue("username", identifier || "");
    }
  }, [identifier]);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: identifier?.includes("@") ? identifier : "",
      username: identifier || "",
    },
  });

  const watchFields = form.watch([
    "name",
    "password",
    "confirmPassword",
    "username",
    "email",
    "avatar"
  ]);

  const isButtonDisabled =
    !watchFields[0] || !watchFields[1] || !watchFields[2] ||
    !watchFields[3] || !watchFields[4] || !watchFields[5] ||
    watchFields[1] !== watchFields[2];

  useEffect(() => {
    if (watchFields.some((field) => !field)) {
      setError("Please fill all the fields");
    } else if (watchFields[1] !== watchFields[2]) {
      setError("Passwords do not match");
    } else {
      setError("");
    }
  }, [watchFields]);

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (!username || username.length < 2) return;
      setIsCheckingUsername(true);
      setUsernameMessage("");
      try {
        const response = await axios.get(
          `/api/check-username-unique?username=${username}`
        );
        setUsernameMessage(response.data.message);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        setUsernameMessage(
          axiosError.response?.data.message || "Error checking username"
        );
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);

      if (data.avatar instanceof File) {
        formData.append("avatar", data.avatar);
      }

      const response = await axios.post<ApiResponse>("/api/sign-up", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
          variant: "default",
          duration: 1000,
        });
      }

      router.replace(`/verify?identifier=${data.username}`);
    } catch (error) {
      console.error("Error in signup of user ", error);

      const axiosError = error as AxiosError<ApiResponse>;

      const errorMessage =
        axiosError.response?.data.message ||
        "Some error occurred. Please try again later";

      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex justify-center items-center  h-[calc(100vh-125px)]  bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-gray-900 dark:text-white">
            Join Stealthy Chat 🥷📝
          </h1>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Sign up to start stealing chats with your friends
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="avatar"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  {avatarPreview && (
                    <div className="mt-3 flex flex-col items-center">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {value instanceof File ? value.name : "Selected image"}
                      </p>
                    </div>
                  )}
                  <FormLabel className="text-gray-900 dark:text-gray-300">
                    Profile Picture
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);

                          const reader = new FileReader();
                          reader.onload = () => {
                            setAvatarPreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      {...fieldProps}
                    />
                  </FormControl>



                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900 dark:text-gray-300">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Name"
                      type="text"
                      {...field}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900 dark:text-gray-300">
                    Username
                  </FormLabel>
                  <div className="flex items-center gap-3">
                    <div className="flex-grow">
                      <FormControl>
                        <Input
                          placeholder="Username"
                          {...field}
                          type="text"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          onChange={(e) => {
                            field.onChange(e);
                            setDebouncedUsername(e.target.value);
                          }}
                        />
                      </FormControl>
                    </div>

                    {isCheckingUsername ? (
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    ) : usernameMessage ? (
                      <p className={`text-sm flex items-center flex-shrink-0 ${usernameMessage === "Username is unique" ? "text-green-500" : "text-red-500"}`}>
                        {usernameMessage === "Username is unique"
                          ? <span title="Username is available">✅</span>
                          : <span title={usernameMessage}>❌</span>}
                      </p>
                    ) : null}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900 dark:text-gray-300">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      {...field}
                      type="email"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900 dark:text-gray-300">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Password"
                      type="password"
                      {...field}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900 dark:text-gray-300">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Confirm Password"
                      type="password"
                      {...field}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-red-500 dark:text-red-400 flex justify-center w-full">
              {error}
            </p>

            <div className="flex justify-center w-full">
              <Button
                type="submit"
                disabled={isButtonDisabled || isSubmitting}
                className="dark:bg-gray-700 dark:text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                    wait
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </div>
          </form>
        </Form>

        <div className="text-center mt-2">
          <p className="text-gray-700 dark:text-gray-300">
            Already have an account?{" "}
            <Link
              href={{
                pathname: "/sign-in",
                query: {
                  identifier: form.getValues("email")
                    ? form.getValues("email")
                    : form.getValues("username")
                      ? form.getValues("username")
                      : identifier,
                },
              }}
              className="text-blue-500 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
