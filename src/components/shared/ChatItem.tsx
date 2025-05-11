import { Box, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import React, { memo } from "react";
import { StyledLink } from "../styles/StyledComponents";
import AvatarCard from "./AvatarCard";

interface ChatItemProps {
  avatar?: string[];
  name?: string;
  _id?: string;
  groupChat?: boolean;
  sameSender?: boolean;
  isOnline?: boolean;
  newMessageCount?: number;
  index?: number;
  handleDeleteChat: (e: React.MouseEvent<HTMLElement>, id: string, isGroupChat: boolean) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  avatar = [],
  name = "",
  _id = "",
  groupChat = false,
  sameSender = false,
  isOnline = false,
  newMessageCount = 0,
  index = 0,
  handleDeleteChat,
}) => {


  return (
    <StyledLink
      sx={{
        padding: "0",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        handleDeleteChat(e, _id, groupChat);
      }}
      href={`/user/chat/${_id}`}
    >
      <motion.div
        initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.001 * index, duration: 0.1, ease: "easeInOut" }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem",
          backgroundColor: sameSender ? "black" : "unset",
          color: sameSender ? "white" : "unset",
          position: "relative",
          borderRadius: "8px",
        }}
      >
        <AvatarCard avatar={avatar} />
        <Stack>
          <Typography>{name}</Typography>
          {newMessageCount > 0 && (
            <Typography>{newMessageCount} New Messages</Typography>
          )}
        </Stack>

        {isOnline && (
          <Box
            sx={{
              width: "10px",
              height: "10px",
              backgroundColor: "green",
              borderRadius: "50%",
              position: "absolute",
              right: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
        )}
      </motion.div>
    </StyledLink>

  );
};

export default memo(ChatItem);
