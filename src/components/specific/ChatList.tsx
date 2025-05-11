import { gradientBg } from "@/app/constants/color";
import { Stack } from "@mui/material";
import ChatItem from "../shared/ChatItem";

interface Chat {
  _id: string;
  avatar: string[];
  name: string;
  groupChat: boolean;
  members?: string[];
}

interface NewMessageAlert {
  chatId: string;
  count: number;
}

interface ChatListProps {
  w?: string;
  chats?: Chat[];
  chatId?: string;
  onlineUsers?: string[];
  handleDeleteChat?: (e: React.MouseEvent<HTMLElement>, id: string, isGroupChat: boolean) => void;
  newMessagesAlert?: NewMessageAlert[];
}

const ChatList = ({
  w = "100%",
  chats = [],
  chatId,
  onlineUsers = [],
  handleDeleteChat,
  newMessagesAlert = [],
}: ChatListProps) => {


  return (
    <Stack
      height={"100%"}
      width={w}
      direction={"column"}
      spacing={2}
      sx={{
        p: {
          xs: "0.5rem",
          sm: "1rem",
        },
        background: gradientBg,
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
      overflow={"auto"}
    >
      {chats.map((data, index) => {
        const { _id, avatar, name, groupChat, members = [] } = data;

        const newMessageCount = newMessagesAlert.find(
          ({ chatId }) => chatId === _id
        );

        const isOnline = groupChat
          ? members.some((member) => onlineUsers.includes(member))
          : onlineUsers.includes(_id);

        return (
          <ChatItem
            index={index}
            newMessageCount={newMessageCount?.count || 0}
            isOnline={isOnline}
            avatar={avatar}
            name={name}
            _id={_id}
            key={_id}
            groupChat={groupChat}
            sameSender={_id === chatId}
            handleDeleteChat={
              handleDeleteChat
                ? (e: React.MouseEvent<HTMLElement>, id: string, isGroupChat: boolean) => handleDeleteChat(e, id, isGroupChat)
                : () => { }
            }
          />
        );
      })}
    </Stack>
  );
};

export default ChatList;
