import { useInputValidation } from "6pp";
import { useErrors } from "@/hooks/hook";
import { useNewGroupMutation } from "@/hooks/mutation";
import { useGetAvailableFriendsQuery } from "@/hooks/query";
import { useToast } from "@/hooks/use-toast";
import { setIsNewGroup } from "@/lib/store/misc.reducer";
import { RootState } from "@/lib/store/store";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UserItem from "../shared/UserItem";

const NewGroup = () => {
  const { isNewGroup } = useSelector((state: RootState) => state.misc);
  const { toast } = useToast();

  const groupName = useInputValidation("");

  const [members, setMembers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const dispatch = useDispatch();

  const {
    data: availableFriends,
    isLoading: loadingAvailableFriends,
    isError: errorAvailableFriends,
    error: errorAvailableFriendsMessage,
  } = useGetAvailableFriendsQuery();

  const
    {
      newGroupMutation,
      isLoading: loadingNewGroup,
      isError: errorNewGroup,
      error: errorNewGroupMessage,
    } = useNewGroupMutation();

  useErrors([
    {
      isError: errorAvailableFriends,
      error: errorAvailableFriendsMessage,
    },
    {
      isError: errorNewGroup,
      error: errorNewGroupMessage,
    },
  ]);

  const closeGroupHandler = () => {
    setSelectedMembers([]);
    dispatch(setIsNewGroup(false));
  };

  const submitHandler = () => {
    if (!groupName.value) return toast({
      variant: "destructive",
      title: "Group name is required",
      description: "Please enter a group name.",
    })
    if (selectedMembers.length < 1) {
      return toast({
        title: "No members selected",
        description: "Please select at least one member to create a group.",
        variant: "destructive",
        duration: 1000,
      })
    }

    try {
      newGroupMutation({
        name: groupName.value,
        members: selectedMembers,
      })
        .then((res) => {
          if (res?.status === 200) {
            toast({
              title: "Success",
              description: "Group created successfully",
              variant: "default",
              duration: 1000,
            });
          } else {
            toast({
              title: "Error",
              description: res?.data?.message || "Something went wrong",
              variant: "destructive",
              duration: 1000,
            });
          }
          setSelectedMembers([]);
          groupName.value = "";
        });
    } catch (error) {
      console.error("Error creating group:", error);

    }

    closeGroupHandler();
  };

  interface User {
    _id: string;
    isAdded: boolean;
    [key: string]: any; // For other user properties
  }

  const selectMemberHandler = (userId: string): void => {
    if (!userId) return;
    setSelectedMembers((prev: string[]) =>
      prev.includes(userId)
        ? prev.filter((id: string) => id !== userId)
        : [...prev, userId]
    );
    setMembers((prev: User[]) =>
      prev.map((user: User) =>
        user._id === userId ? { ...user, isAdded: !user.isAdded } : user
      )
    );
  };

  useEffect(() => {
    if (availableFriends?.friends?.length > 0) {
      setMembers(
        availableFriends.friends?.map((user: { _id: string;[key: string]: any }): User => ({ ...user, isAdded: false }))
      );
    }
  }, [availableFriends]);

  useEffect(() => {
    setMembers((prev) => prev.map((user) => ({ ...user, isAdded: false })));
    setSelectedMembers([]);
  }, []);

  return (
    <Dialog open={isNewGroup} onClose={closeGroupHandler}>
      <Box
        sx={{
          p: { xs: "1.5rem", sm: "3rem" },
          width: {
            xs: "80vw",
            sm: "70vw",
            md: "50vw",
            lg: "30vw",
          },
          borderRadius: "12px",
        }}
      >
        <DialogTitle textAlign="center" variant="h4" fontWeight={600}>
          Create a New Group
        </DialogTitle>

        <TextField
          value={groupName.value}
          onChange={groupName.changeHandler}
          label="Group Name"
          variant="outlined"
          size="medium"
          sx={{
            width: "100%",
            bgcolor: "white",
            borderRadius: "8px",
          }}
        />

        <Typography variant="body1" fontWeight={500} mt={2}>
          Select members to add to the group:
        </Typography>

        <Stack
          sx={{
            maxHeight: "200px",
            overflowY: "auto",
            borderRadius: "8px",
            backgroundColor: "white",
            p: "0.5rem",
            mt: "1rem",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {loadingAvailableFriends ? (
            <Skeleton variant="rounded" height={40} />
          ) : errorAvailableFriends ? (
            <Typography variant="body2" color="error" textAlign="center">
              {errorAvailableFriendsMessage}
            </Typography>
          ) : availableFriends?.friends?.length === 0 ? (
            <Typography variant="body2" textAlign="center">
              No available friends to add.
            </Typography>
          ) : (
            members.map((user) => (
              <UserItem
                user={user}
                key={user._id}
                handler={selectMemberHandler}
                isAdded={Boolean(user.isAdded)}
              />
            ))
          )}
        </Stack>

        <Stack direction="row" justifyContent="space-between" mt={3}>
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={closeGroupHandler}
            sx={{ borderRadius: "8px", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{
              bgcolor: "#28a745",
              "&:hover": { bgcolor: "#218838" },
              "&:disabled": { bgcolor: "#d3d3d3", color: "#777" },
              borderRadius: "8px",
              fontWeight: 600,
            }}
            onClick={submitHandler}
            disabled={groupName.value.length < 1 || selectedMembers.length < 1}
          >
            Create Group
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};

export default NewGroup;
