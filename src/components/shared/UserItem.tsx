import { transformImageUrl } from "@/lib/features";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { Avatar, IconButton, ListItem, Stack, Typography } from "@mui/material";
import React, { memo } from "react";

export interface User {
  _id: string;
  name: string;
  avatar: string;
}

interface UserItemProps {
  user: User;
  handler: (id: string) => void;
  handlerIsLoading?: boolean | null;
  isAdded?: boolean;
  styling?: object;
}

const UserItem: React.FC<UserItemProps> = ({
  user: { _id, name, avatar },
  handler,
  handlerIsLoading = null,
  isAdded = false,
  styling = {},
}) => {

  return (
    <ListItem>
      <Stack
        direction={"row"}
        alignItems={"center"}
        spacing={"1rem"}
        width={"100%"}
        {...styling}
      >
        <Avatar src={transformImageUrl(avatar)} />
        <Typography
          variant="body1"
          sx={{
            flexGrow: 1,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </Typography>

        <IconButton
          onClick={() => handler(_id)}
          disabled={!!handlerIsLoading}
          size="small"
          sx={{
            bgcolor: isAdded ? "error.main" : "primary.main",
            color: "white",
            "&:hover": {
              bgcolor: isAdded ? "error.dark" : "primary.dark",
            },
            "&:disabled": {
              bgcolor: "darkorchid",
              color: "white",
            },
          }}
        >
          {isAdded ? (
            <RemoveIcon fontSize="small" />
          ) : (
            <AddIcon
              fontSize="small"
              onClick={() => {
                handler(_id);
              }}
            />
          )}
        </IconButton>
      </Stack>
    </ListItem>
  );
};

export default memo(UserItem);
