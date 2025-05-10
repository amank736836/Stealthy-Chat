import { dialogBg } from "@/app/constants/color";
import useErrors from "@/hooks/hook";
import { useToast } from "@/hooks/use-toast";
import { transformImageUrl } from "@/lib/features";
import { useAcceptFriendRequestMutation, useGetMyNotificationsQuery } from "@/lib/store/api";
import { setIsNotification } from "@/lib/store/misc.reducer";
import { RootState } from "@/lib/store/store";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import React, { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Notifications = () => {
  const { toast } = useToast();
  const { isNotification } = useSelector((state: RootState) => state.misc);

  interface NotificationType {
    _id: string;
    sender: {
      id: string;
      name: string;
      avatar: string;
    };
  }

  const [notification, setNotification] = useState<NotificationType[]>([]);

  const dispatch = useDispatch();

  const [
    acceptFriendRequest,
    {
      data: acceptFriendRequestData,
      isLoading: isLoadingAcceptFriendRequest,
      isError: isErrorAcceptFriendRequest,
      error: errorAcceptFriendRequest,
    },
  ] = useAcceptFriendRequestMutation();

  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    isError: isErrorNotifications,
    error: errorNotifications,
  } = useGetMyNotificationsQuery("");

  useErrors([
    {
      isError: isErrorNotifications,
      error: errorNotifications,
    },
    {
      isError: isErrorAcceptFriendRequest,
      error: errorAcceptFriendRequest,
    },
  ]);

  const closeNotification = () => {
    dispatch(setIsNotification(false));
  };

  const friendRequestHandler = async ({ _id, accept }: { _id: string; accept: boolean }) => {
    try {
      await acceptFriendRequest(_id).unwrap().then(() => {
        toast({
          title: accept ? "Success" : "Rejected",
          description: accept
            ? "Friend request accepted successfully"
            : "Friend request rejected successfully",
          variant: "default",
          duration: 1000,
        });
      }
      );

    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
        duration: 1000,
      });

    }
  };

  useEffect(() => {
    if (acceptFriendRequestData?.success) {
      toast({
        title: acceptFriendRequestData.message,
        description: "Friend request accepted successfully",
        variant: "default",
        duration: 1000,
      })
      setNotification((prev) =>
        prev.filter(
          (notification) =>
            notification.sender.id !== acceptFriendRequestData.senderId
        )
      );
    }
  }, [acceptFriendRequestData]);

  useEffect(() => {
    if (notificationsData) {
      setNotification(notificationsData.allRequests);
    }
  }, [notificationsData]);

  return (
    <Dialog open={isNotification} onClose={closeNotification}>
      <Box
        sx={{
          p: "1rem",
          width: {
            xs: "80vw",
            sm: "70vw",
            md: "50vw",
            lg: "30vw",
          },
          background: dialogBg,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          overflow: "auto",
        }}
      >
        <DialogTitle
          textAlign="center"
          fontWeight={600}
          color="#333"
          sx={{ pb: 2 }}
        >
          Friendship Requests
        </DialogTitle>

        <List
          sx={{
            maxHeight: "300px",
            overflowY: "auto",
            borderRadius: "8px",
            backgroundColor: "white",
            p: "0.5rem",
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {isLoadingNotifications ? (
            <Skeleton
              variant="rectangular"
              width={"100%"}
              height={100}
              sx={{
                borderRadius: "8px",
                mb: "0.5rem",
                background:
                  "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                animation: "loading 1.5s infinite",
              }}
            />
          ) : notification.length > 0 ? (
            notificationsData.allRequests.map((notification: NotificationType) => (
              <NotificationItem
                sender={notification.sender}
                _id={notification._id}
                handler={friendRequestHandler}
                key={notification._id}
              />
            ))
          ) : (
            <Typography textAlign="center" color="gray">
              {notification.length === 0
                ? "No Notifications yet"
                : "Error fetching notifications"}
            </Typography>
          )}
        </List>
      </Box>
    </Dialog>
  );
};

interface NotificationItemProps {
  sender: {
    name: string;
    avatar: string;
    id?: string;
  };
  _id: string;
  handler: (params: { _id: string; accept: boolean }) => void;
}

const NotificationItem = memo(({ sender, _id, handler }: NotificationItemProps) => {
  const { name, avatar } = sender;

  return (
    <>
      <ListItem
        sx={{
          display: "flex",
          alignItems: "center",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          p: "1rem",
          mb: "0.5rem",
        }}
      >
        <Avatar
          src={transformImageUrl(avatar)}
          sx={{ width: 50, height: 50 }}
        />
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          alignItems={"center"}
          width={"100%"}
        >
          <Typography
            variant="body1"
            sx={{
              flexGrow: 1,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "auto",
              textOverflow: "ellipsis",
              ml: "1rem",
            }}
          >
            {name}
          </Typography>
          <Stack spacing={1} direction={"row"} justifyContent="center">
            <Button
              onClick={() => handler({ _id, accept: true })}
              variant="contained"
              color="success"
              size="small"
            >
              Accept
            </Button>
            <Button
              onClick={() =>
                handler({
                  _id,
                  accept: false,
                })
              }
              variant="contained"
              color="error"
              size="small"
            >
              Reject
            </Button>
          </Stack>
        </Stack>
      </ListItem>
    </>
  );
});

export default Notifications;
