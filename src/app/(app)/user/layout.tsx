"use client";
import { useSocketEvents } from "6pp";
import DeleteChatMenu from "@/components/Menus/DeleteChatMenu";
import Header from "@/components/layout/Header";
import { useErrors, useGetOrSaveFromStorage } from "@/hooks/hook";
import { useGetMyChatsQuery } from "@/hooks/query";
import { useToast } from "@/hooks/use-toast";
import { socket } from "@/lib/features";
import { incrementNotificationCount, setNewMessagesAlert } from "@/lib/store/chat.reducer";
import { setIsDeleteMenu, setIsMobile, setSelectedDeleteChat } from "@/lib/store/misc.reducer";
import { RootState } from "@/lib/store/store";
import { Drawer, Grid, Skeleton, Stack } from "@mui/material";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { lazy, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { gradientBg } from "../../constants/color";
import {
    NEW_MESSAGE_ALERT,
    NEW_REQUEST,
    ONLINE_USERS,
    REFETCH_CHATS,
} from "../../constants/events";


const ChatList = lazy(() => import("@/components/specific/ChatList"));
const Profile = lazy(() => import("@/components/specific/Profile"));

const AppLayout = ({
    children,
}: Readonly<{
    children: ReactNode;
}>) => {
    const { toast } = useToast();
    const { newMessagesAlert } = useSelector((state: RootState) => state.chat);
    const { isMobile } = useSelector((state: RootState) => state.misc);

    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    const { data: session } = useSession();
    const router = useRouter();
    const dispatch = useDispatch();

    const handleMobileClose = () => {
        dispatch(setIsMobile(false));
    };

    const params = useParams();

    const chatId: string = Array.isArray(params.chatId)
        ? params.chatId[0] || ""
        : params.chatId || "";
    const deleteOptionAnchor = useRef<HTMLElement | null>(null);


    const {
        data: chatsData,
        isLoading: isLoadingChats,
        isError: isErrorChats,
        error: errorChats,
        refetch: refetchChats,
    } = useGetMyChatsQuery();


    useErrors([{
        isError: isErrorChats,
        error: errorChats,
    }]);

    const handleDeleteChat = (
        e: React.MouseEvent<HTMLElement>,
        chatId: string,
        groupChat: boolean
    ): void => {
        e.preventDefault();
        deleteOptionAnchor.current = e.currentTarget as HTMLElement;
        dispatch(setIsDeleteMenu(true));
        dispatch(setSelectedDeleteChat({ chatId, groupChat }));
    };

    interface NewMessageAlertData {
        chatId: string;
    }

    const newMessagesAlertListener = useCallback(
        (data: NewMessageAlertData) => {
            if (data.chatId === chatId) return;
            dispatch(setNewMessagesAlert(data));
        },
        [chatId]
    );

    const newRequestListener = useCallback(() => {
        dispatch(incrementNotificationCount());
    }, [dispatch]);

    interface RefetchChatsListenerData { }

    const refetchChatsListener = useCallback(
        (data: RefetchChatsListenerData) => {
            if (data) {
                toast({
                    title: "Chats Refetched",
                    description: "Chats have been refetched successfully",
                    variant: "default",
                    duration: 1000,
                });
            }
            refetchChats();
            router.push("/user/home");
        },
        [refetchChats, router]
    );

    interface OnlineUsersData {
        onlineUsers: string[];
    }

    const onlineUsersListener = useCallback(
        (data: OnlineUsersData) => {
            setOnlineUsers(data.onlineUsers);
        },
        []
    );

    const eventHandlers = {
        [NEW_MESSAGE_ALERT]: newMessagesAlertListener,
        [NEW_REQUEST]: newRequestListener,
        [REFETCH_CHATS]: refetchChatsListener,
        [ONLINE_USERS]: onlineUsersListener,
    };

    useSocketEvents(socket, eventHandlers);

    const {
        item: newMessagesAlertStorage,
        setItem: setNewMessagesAlertStorage,
    } = useGetOrSaveFromStorage({
        key: NEW_MESSAGE_ALERT,
        value: newMessagesAlert,
    });

    useEffect(() => {
        if (newMessagesAlertStorage) {
            setNewMessagesAlertStorage(newMessagesAlert);
        }
    }, [newMessagesAlert]);

    useEffect(() => {
        if (session?.user) {
            socket.emit("USER_", session.user.id);
        }
    }, [session]);

    return (
        <>
            <title>MERN Chat App</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="description" content="MERN Chat App" />
            <meta name="keywords" content="MERN, Chat, App" />
            <meta name="author" content="Aman Kumar" />
            <Header />
            <DeleteChatMenu
                deleteOptionAnchor={deleteOptionAnchor as React.RefObject<HTMLElement>}
            />
            {isLoadingChats ? (
                <Skeleton />
            ) : (
                <Drawer
                    open={isMobile}
                    onClose={handleMobileClose}
                    anchor="right"
                    sx={{
                        "& .MuiDrawer-paper": {
                            width: "80vw",
                            background: gradientBg,
                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                        },
                    }}
                    onClick={handleMobileClose}
                >
                    <ChatList
                        w="80vw"
                        chats={chatsData?.chats}
                        chatId={chatId}
                        newMessagesAlert={newMessagesAlert}
                        onlineUsers={onlineUsers}
                        handleDeleteChat={handleDeleteChat}
                    />
                </Drawer>
            )}
            <Grid container height={"calc(100vh - 4rem)"}>
                <Grid
                    size={{ sm: 4, md: 5, lg: 3 }}
                    sx={{
                        display: {
                            xs: "none",
                            sm: "block",
                        },
                        background: gradientBg,
                    }}
                    height={"100%"}
                >
                    {isLoadingChats ? (
                        <Stack spacing={"1rem"}>
                            {Array.from({ length: 8 }, (_, index) => (
                                <Skeleton key={index} variant="rounded" height={95} sx={{}} />
                            ))}
                        </Stack>
                    ) : (
                        <ChatList
                            chats={chatsData?.chats}
                            chatId={chatId}
                            newMessagesAlert={newMessagesAlert}
                            onlineUsers={onlineUsers}
                            handleDeleteChat={handleDeleteChat}
                        />
                    )}
                </Grid>
                <Grid size={{ sm: 8, md: 7, lg: 6, xs: 12 }} height={"100%"}>
                    {children}
                </Grid>
                <Grid
                    size={{ lg: 3 }}
                    sx={{
                        display: { xs: "none", lg: "block" },
                        // padding: "2rem",
                        // bgcolor: "rgba(0, 0, 0, 0.85)",
                    }}
                    height={"100%"}
                >
                    <Profile />
                </Grid>
            </Grid>
        </>
    );
};
export default AppLayout;
