"use client";

import { useEffect, useState } from "react";
import { useToast } from "./use-toast";

type ErrorItem = {
    isError: boolean;
    error?: any;
    fallback?: () => void;
};

export const useErrors = (errors: ErrorItem[] = []) => {

    const { toast } = useToast();

    useEffect(() => {
        errors.forEach(({ isError, error, fallback }) => {
            if (isError) {
                if (fallback) {
                    fallback();
                }

                if (error?.data?.message) {
                    toast({
                        title: error.data.message,
                        description: "Please try again later",
                        variant: "destructive",
                        duration: 1000,
                    });
                } else if (error?.message) {
                    toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive",
                        duration: 1000,
                    });
                } else {
                    toast({
                        title: "Error",
                        description: "Something went wrong",
                        variant: "destructive",
                        duration: 1000,
                    });
                }
            }
        });
    }, [errors]);
};


interface UseAsyncMutationResult<TData = any, TError = any> {
    data: TData | null;
    isLoading: boolean;
    isError: boolean;
    error: TError;
}

type MutationHook<TArgs extends any[] = any[], TData = any, TError = any> = () => [
    (...args: TArgs) => Promise<{ data?: TData; error?: TError }>,
    {
        isLoading: boolean;
        isError: boolean;
        error: TError;
    }
];

type ExecuteMutation<TArgs extends any[] = any[], TData = any, TError = any> = (
    toastMessage: string,
    ...args: TArgs
) => Promise<{ data?: TData; error?: TError }>;

export const useAsyncMutation = <
    TArgs extends any[] = any[],
    TData = any,
    TError = any
>(
    mutationHook: MutationHook<TArgs, TData, TError>
): [
        ExecuteMutation<TArgs, TData, TError>,
        UseAsyncMutationResult<TData, TError>
    ] => {
    const [data, setData] = useState<TData | null>(null);
    const [mutate, { isLoading, isError, error }] = mutationHook();
    const { toast } = useToast();

    const executeMutation: ExecuteMutation<TArgs, TData, TError> = async (toastMessage, ...args) => {
        const toastId = toast({
            title: toastMessage || "Updating data...",
            description: "Please wait...",
            variant: "default",
            duration: 1000,
        });

        try {
            const res = await mutate(...args);

            if (res.data) {
                setData(res.data);
                toast({
                    title: "Success",
                    description: (res.data as any).message || "Updated successfully",
                    variant: "default",
                    duration: 1000
                });
            } else if (res.error) {
                toast({
                    title: "Error",
                    description: (res.error as any)?.data?.message || "Operation failed",
                    variant: "destructive",
                    duration: 1000
                });
            }

            return res;
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Error updating data",
                variant: "destructive",
                duration: 1000
            });
            throw error;
        }
    };

    return [
        executeMutation,
        {
            data,
            isLoading,
            isError,
            error,
        },
    ];
};

interface SocketEventHandlers {
    [event: string]: (...args: any[]) => void;
}

export const useSocketEvents = (
    socket: { on: (event: string, handler: (...args: any[]) => void) => void; off: (event: string) => void } | null,
    handlers: SocketEventHandlers
): void => {
    useEffect(() => {
        if (!socket) return;

        Object.entries(handlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        return () => {
            if (!socket) return;
            Object.keys(handlers).forEach((event) => {
                socket.off(event);
            });
        };
    }, [handlers, socket]);
};


interface UserAuth {
    user: {
        _id: string;
    };
}

interface SocketInitializerOptions {
    withCredentials: boolean;
    auth: UserAuth;
}

type SocketType = ReturnType<typeof import('socket.io-client').default> | null;

export const useSocketInitializer = (userId: string): SocketType => {
    const [socket, setSocket] = useState<SocketType>(null);

    useEffect(() => {
        if (!userId) return;

        import('socket.io-client').then(({ io }) => {
            const socketInstance = io(
                process.env.NEXT_PUBLIC_SOCKET_URL || '',
                {
                    withCredentials: true,
                    auth: { user: { _id: userId } }
                } as SocketInitializerOptions
            );

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        });
    }, [userId]);

    return socket;
};

