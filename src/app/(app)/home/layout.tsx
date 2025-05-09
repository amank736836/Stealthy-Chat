import { useToast } from "@/hooks/use-toast";
import { getOrSaveFromStorage } from "@/lib/features";
import { incrementNotificationCount, setNewMessagesAlert } from "@/lib/store/chat.reducer";
import { setIsDeleteMenu, setIsMobile, setSelectedDeleteChat } from "@/lib/store/misc.reducer";
import { Drawer, Grid, Skeleton, Stack } from "@mui/material";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { lazy, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { gradientBg } from "../../constants/color";
import {
    NEW_MESSAGE_ALERT,
    NEW_REQUEST,
    ONLINE_USERS,
    REFETCH_CHATS,
} from "../../constants/events";
import DeleteChatMenu from "@/components/dialog/DeleteChatMenu";
import Header from "@/components/layout/Header";
import { getSockets } from "@/backend/lib/socket";
import { useGetMyChatsQuery } from "@/lib/store/api";
import { useErrors } from "@/hooks/hook";


const ChatList = lazy(() => import("../../specific/ChatList"));
const Profile = lazy(() => import("../../specific/Profile"));

const AppLayout = () => (WrappedComponent) => {

    const { toast } = useToast();

    return (props) => {
        const { newMessagesAlert } = useSelector((state) => state.chat);
        const { isMobile } = useSelector((state) => state.misc);

        const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

        const { data: session } = useSession();
        const router = useRouter();
        const dispatch = useDispatch();

        const handleMobileClose = () => {
            dispatch(setIsMobile(false));
        };

        const params = useParams();
        const chatId = params.chatId || null;
        const deleteOptionAnchor = useRef<HTMLElement | null>(null);

        const socket = getSockets();

        const {
            data: chatsData,
            isLoading: isLoadingChats,
            isError: isErrorChats,
            error: errorChats,
            refetch: refetchChats,
        } = useGetMyChatsQuery("");

        useErrors([
            {
                isError: isErrorChats,
                error: errorChats,
            },
        ]);

        interface DeleteChatParams {
            chatId: string;
            groupChat: boolean;
        }

        const handleDeleteChat = (
            e: React.MouseEvent<HTMLElement, MouseEvent>,
            chatId: string,
            groupChat: boolean
        ): void => {
            e.preventDefault();
            deleteOptionAnchor.current = e.currentTarget;
            dispatch(setIsDeleteMenu(true));
            dispatch(setSelectedDeleteChat({ chatId, groupChat }));
        };

        interface NewMessageAlertData {
            chatId: string | null;
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

        interface RefetchChatsListenerData {

        }



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
                router.push("/home");
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

        useEffect(() => {
            getOrSaveFromStorage({
                key: NEW_MESSAGE_ALERT,
                value: newMessagesAlert,
                get: false,
            });
        }, [newMessagesAlert]);

        return (
            <>
                <title>MERN Chat App</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="description" content="MERN Chat App" />
                <meta name="keywords" content="MERN, Chat, App" />
                <meta name="author" content="Aman Kumar" />
                <Header />
                <DeleteChatMenu
                    deleteOptionAnchor={deleteOptionAnchor}
                    handleDeleteChat={handleDeleteChat}
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
                        <WrappedComponent {...props} chatId={chatId} />
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
};

export default AppLayout;
