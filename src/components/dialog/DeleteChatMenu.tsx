import { useAsyncMutation, useErrors } from "@/hooks/hook";
import { useDeleteChatMutation, useLeaveGroupMutation } from "@/lib/store/api";
import { setIsDeleteMenu } from "@/lib/store/misc.reducer";
import {
  Delete as DeleteIcon,
  ExitToApp as ExitToAppIcon,
} from "@mui/icons-material";
import { Menu, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

interface DeleteChatMenuProps {
  deleteOptionAnchor: React.RefObject<HTMLElement>;
}

const DeleteChatMenu: React.FC<DeleteChatMenuProps> = ({ deleteOptionAnchor }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isDeleteMenu, selectedDeleteChat } = useSelector(
    (state) => state.misc
  );

  const isGroupChat = selectedDeleteChat.groupChat;

  const closeHandler = () => {
    dispatch(setIsDeleteMenu(false));
  };

  const [
    deleteChatMutation,
    {
      data: deleteChatData,
      isLoading: isLoadingDeleteChat,
      isError: isErrorDeleteChat,
      error: errorDeleteChat,
    },
  ] = useAsyncMutation(useDeleteChatMutation);

  const [
    leaveGroupMutation,
    {
      data: leaveGroupData,
      isLoading: isLoadingLeaveGroup,
      isError: isErrorLeaveGroup,
      error: errorLeaveGroup,
    },
  ] = useAsyncMutation(useLeaveGroupMutation);

  useErrors([
    {
      isError: isErrorDeleteChat,
      error: errorDeleteChat,
    },
  ]);

  const leaveGroup = () => {
    leaveGroupMutation("Leaving Group...", selectedDeleteChat.chatId);
    closeHandler();
  };

  const deleteChat = () => {
    deleteChatMutation("Deleting Group...", selectedDeleteChat.chatId);
    closeHandler();
  };

  useEffect(() => {
    if (deleteChatData) {
      if (deleteChatData.success === "success") {
        router.push("/");
      }
    }

    if (leaveGroupData) {
      if (leaveGroupData.success === "success") {
        router.push("/");
      }
    }
  }, [deleteChatData, leaveGroupData]);

  return (
    <Menu
      open={isDeleteMenu}
      onClose={closeHandler}
      anchorEl={deleteOptionAnchor.current}
      anchorOrigin={{
        vertical: "center",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "left",
      }}
    >
      <Stack
        sx={{
          width: "10rem",
          padding: "0.5rem",
          cursor: "pointer",
        }}
        direction={"row"}
        alignItems={"center"}
        spacing={"0.5rem"}
        onClick={isGroupChat ? leaveGroup : deleteChat}
      >
        {isGroupChat ? (
          <>
            <ExitToAppIcon />
            <Typography>Leave Group</Typography>
          </>
        ) : (
          <>
            <DeleteIcon />
            <Typography>Delete Chat</Typography>
          </>
        )}
      </Stack>
    </Menu>
  );
};

export default DeleteChatMenu;
