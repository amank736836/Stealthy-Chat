import { useInfiniteScrollTop, useSocketEvents } from "6pp";
import { grayColor, orange } from "@/app/constants/color";
import { ALERT, CHAT_JOINED, CHAT_LEAVED, NEW_MESSAGE, START_TYPING, STOP_TYPING } from "@/app/constants/events";
import { User } from "@/backend/model/user.model";
import FileMenu from "@/components/dialog/FileMenu";
import { TypingLoader } from "@/components/layout/Loaders";
import MessageComponent from "@/components/shared/MessageComponent";
import { InputBox } from "@/components/styles/StyledComponents";
import { useErrors } from "@/hooks/hook";
import { useGetChatDetailsQuery, useGetMessagesQuery } from "@/hooks/query";
import { removeNewMessagesAlert } from "@/lib/store/chat.reducer";
import { setIsFileMenu } from "@/lib/store/misc.reducer";
import { RootState } from "@/lib/store/store";
import { useSocket } from "@/providers/SocketProvider";
import {
    AttachFile as AttachFileIcon,
    Send as SendIcon,
} from "@mui/icons-material";
import { IconButton, Stack } from "@mui/material";
import {
    Fragment,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
interface ChatProps {
    chatId: string;
}

const Chat = ({ chatId }: ChatProps) => {
    const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };
    const { uploadingLoader } = useSelector((state: RootState) => state.misc);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<MessageForAlert[]>([]);
    const [page, setPage] = useState(1);
    const [fileMenuAnchor, setFileMenuAnchor] = useState<HTMLButtonElement | null>(null);
    const [MeTyping, setMeTyping] = useState(false);
    const [userNameTyping, setUserNameTyping] = useState(null);

    const typingTimeout = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    interface HandleFileOpenEvent extends React.MouseEvent<HTMLButtonElement> { }

    const handleFileOpen = (e: HandleFileOpenEvent) => {
        dispatch(setIsFileMenu(true));
        setFileMenuAnchor(e.currentTarget);
    };
    const socket = useSocket();

    const {
        data: chatDetails,
        isLoading: isLoadingChatDetails,
        isError: isErrorChatDetails,
        error: errorChatDetails,
    } = useGetChatDetailsQuery({ chatId, populate: true });

    const {
        data: oldMessagesChunks,
        isLoading: isLoadingMessages,
        isError: isErrorOldMessages,
        error: errorOldMessages,
    } = useGetMessagesQuery({
        chatId,
        page,
    });

    useErrors([
        {
            isError: isErrorOldMessages,
            error: errorOldMessages,
        },
        {
            isError: isErrorChatDetails,
            error: errorChatDetails,
        },
    ]);



    const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
        containerRef,
        oldMessagesChunks?.totalPages,
        page,
        setPage,
        oldMessagesChunks?.messages
    );

    const allMessages = [...oldMessages, ...messages];

    const chatMembers = chatDetails?.chat.members || [];

    interface IMember {
        _id: string;
        name: string;
    }

    interface IChat {
        members: IMember[];
    }

    interface IChatDetails {
        chat: IChat;
    }

    const members: string[] = chatDetails?.chat.members.map((member: IMember) => member._id) || [];

    interface MessageChangeEvent extends React.ChangeEvent<HTMLInputElement> { }

    interface StartTypingPayload {
        members: string[];
        chatId: string;
        senderId: string;
    }

    interface StopTypingPayload {
        members: string[];
        chatId: string;
        senderId: string;
    }

    const messageChangeHandler = (e: MessageChangeEvent) => {
        setMessage(e.target.value);

        if (!MeTyping) {
            const startTypingPayload: StartTypingPayload = {
                members,
                chatId,
                senderId: user ? String(user._id) : "",
            };
            socket?.emit(START_TYPING, startTypingPayload);
            setMeTyping(true);
        }

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        typingTimeout.current = setTimeout(() => {
            setMeTyping(false);
            const stopTypingPayload: StopTypingPayload = {
                members,
                chatId,
                senderId: user ? String(user._id) : "",
            };
            socket?.emit(STOP_TYPING, stopTypingPayload);
        }, 2000);
    };

    interface SubmitHandlerEvent extends React.FormEvent<HTMLFormElement> { }

    interface NewMessagePayload {
        message: string;
        chatId: string;
        members: string[];
    }

    interface StopTypingPayload {
        members: string[];
        chatId: string;
        senderId: string;
    }

    const submitHandler = (e: SubmitHandlerEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        if (socket) {
            const newMessagePayload: NewMessagePayload = {
                message,
                chatId,
                members,
            };
            socket.emit(NEW_MESSAGE, newMessagePayload);

            if (!user) return;
            const stopTypingPayload: StopTypingPayload = {
                members,
                chatId,
                senderId: String(user._id),
            };
            socket.emit(STOP_TYPING, stopTypingPayload);
        }
        setMessage("");
    };

    interface AlertData {
        chatId: string;
        message: string;
    }

    interface MessageForAlert {
        content: string;
        sender: {
            _id: number;
            name: string;
        };
        chat: string;
        createdAt: string;
    }

    const alertHandler = useCallback(
        (data: AlertData) => {
            if (data.chatId !== chatId) return;
            const messageForAlert: MessageForAlert = {
                content: data.message,
                sender: {
                    _id: Date.now(),
                    name: "System",
                },
                chat: chatId,
                createdAt: new Date().toISOString(),
            };

            setMessages((prevMessages: MessageForAlert[]) => [...prevMessages, messageForAlert]);
        },
        [chatId]
    );

    const newMessagesListener = useCallback(
        (data: { chatId: string; message: MessageForAlert }) => {
            if (data.chatId !== chatId) return;
            setMessages((prevMessages) => [...prevMessages, data.message]);
        },
        [chatId]
    );

    interface StartTypingData {
        chatId: string;
        senderId: string;
    }

    const startTypingListener = useCallback(
        (data: StartTypingData) => {
            if (data.chatId !== chatId) return;
            const { senderId } = data;
            const member = chatMembers?.find((member: IMember) => member._id === senderId);
            if (member) {
                setUserNameTyping(member.name);
            }
        },
        [chatId, chatMembers]
    );

    interface StopTypingListenerData {
        chatId: string;
        senderId: string;
    }

    const stopTypingListener = useCallback(
        (data: StopTypingListenerData) => {
            if (data.chatId !== chatId) return;
            const { senderId } = data;
            const member = chatMembers?.find((member: IMember) => member._id === senderId);
            if (member) {
                setUserNameTyping(null);
            }
        },
        [chatId, chatMembers]
    );

    const eventHandler = {
        [ALERT]: alertHandler,
        [NEW_MESSAGE]: newMessagesListener,
        [START_TYPING]: startTypingListener,
        [STOP_TYPING]: stopTypingListener,
    };

    if (socket) {
        useSocketEvents(socket, eventHandler);
    }

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [allMessages]);

    useEffect(() => {
        if (!user) return;

        socket?.emit(CHAT_JOINED, {
            chatId,
            userId: user._id,
            members,
        });
        dispatch(removeNewMessagesAlert(chatId));

        return () => {
            setMessages([]);
            setPage(1);
            setOldMessages([]);
            setMessage("");
            socket?.emit(CHAT_LEAVED, {
                chatId,
                userId: user._id,
                members,
            });
        };
    }, [chatId, user]);

    useEffect(() => {
        if (isErrorOldMessages || isErrorChatDetails) {
            navigate("/");
        }
    }, [isErrorOldMessages, isErrorChatDetails]);

    return isLoadingChatDetails ? (
        <Stack
            sx={{
                width: "100%",
                height: "100%",
                backgroundColor: grayColor,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            Loading...
        </Stack>
    ) : (
        <Fragment>
            <Stack
                ref={containerRef}
                boxSizing="border-box"
                padding={"1rem"}
                spacing={"1rem"}
                bgcolor={grayColor}
                height={"90%"}
                sx={{
                    overflowX: "hidden",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {
                        display: "none",
                    },
                }}
            >
                {allMessages.length === 0 ? (
                    <Stack
                        sx={{
                            width: "100%",
                            height: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                        spacing={"1rem"}
                    >
                        <h1
                            style={{
                                fontSize: "2rem",
                                color: "black",
                            }}
                        >
                            No Messages Yet
                        </h1>
                        <h2
                            style={{
                                fontSize: "1.5rem",
                                color: "black",
                            }}
                        >
                            Start the conversation
                        </h2>
                    </Stack>
                ) : (
                    <>
                        {allMessages.map((message, idx) => (
                            <MessageComponent
                                message={message}
                                key={
                                    "createdAt" in message
                                        ? (message as MessageForAlert).createdAt
                                        : "_id" in message
                                            ? (message as { _id: string | number })._id
                                            : idx
                                }
                                user={user}
                            />
                        ))}
                    </>
                )}
                {userNameTyping && <TypingLoader username={userNameTyping} />}
                <div ref={bottomRef} />
            </Stack>
            <form
                style={{
                    height: "10%",
                    background: "#00f2fe",
                }}
                onSubmit={submitHandler}
            >
                <Stack
                    direction={"row"}
                    height={"100%"}
                    padding={"1rem"}
                    alignItems={"center"}
                >
                    <IconButton
                        onClick={handleFileOpen}
                        disabled={uploadingLoader}
                        sx={{
                            rotate: "30deg",
                            backgroundColor: orange,
                            marginRight: "1rem",
                            color: "white",
                        }}
                    >
                        <AttachFileIcon />
                    </IconButton>

                    <InputBox
                        placeholder="Type a message..."
                        value={message}
                        onChange={messageChangeHandler}
                        sx={{
                            padding: "1rem",
                            borderRadius: "250px",
                            backgroundColor: "white",
                            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
                        }}
                    />

                    <IconButton
                        type="submit"
                        sx={{
                            rotate: "-30deg",
                            backgroundColor: orange,
                            color: "white",
                            marginLeft: "1rem",
                            padding: "0.4rem",
                            "&:hover": {
                                bgcolor: "error.dark",
                            },
                        }}
                    >
                        <SendIcon />
                    </IconButton>
                </Stack>
            </form>

            <FileMenu anchorE1={fileMenuAnchor} chatId={chatId} />
        </Fragment>
    );
};

export default Chat;
