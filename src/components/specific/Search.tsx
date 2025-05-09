import { useInputValidation } from "6pp";
import { useAsyncMutation, useErrors } from "@/hooks/hook";
import { useLazySearchUserQuery, useSendFriendRequestMutation } from "@/lib/store/api";
import { setIsSearch } from "@/lib/store/misc.reducer";
import { Search as SearchIcon } from "@mui/icons-material";
import {
  Box,
  Dialog,
  DialogTitle,
  InputAdornment,
  List,
  Skeleton,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UserItem from "../shared/UserItem";
import { dialogBg } from "@/app/constants/color";
import { useToast } from "@/hooks/use-toast";

const Search = () => {
  const { isSearch } = useSelector((state) => state.misc);

  const dispatch = useDispatch();
  const { toast } = useToast();

  const closeSearch = () => {
    dispatch(setIsSearch(false));
  };

  type User = {
    id: string;
    _id: string;
    name: string;
    avatar: string;
  };



  const [users, setUsers] = useState<User[]>([]);

  const searchInputValue = useInputValidation("");

  const [
    searchUserQuery,
    {
      isLoading: isLoadingSearchUser,
      isError: isErrorSearchUser,
      error: errorSearchUser,
    },
  ] = useLazySearchUserQuery();

  const [
    sendFriendRequest,
    {
      isLoading: isLoadingSendFriendRequest,
      isError: sendFriendRequestError,
      error: sendFriendRequestErrorData,
    },
  ] = useAsyncMutation(useSendFriendRequestMutation);

  useErrors([
    {
      isError: sendFriendRequestError,
      error: sendFriendRequestErrorData,
    },
    {
      isError: isErrorSearchUser,
      error: errorSearchUser,
    },
  ]);

  interface SendFriendRequestHandler {
    (userId: string): Promise<void>;
  }

  const SendFriendRequestHandler: SendFriendRequestHandler = async (userId: string) => {
    if (!userId) return;
    await sendFriendRequest("Sending friend request...", userId);
    setUsers((prev) => prev.filter((user) => user.id !== userId));
    searchUserQuery(searchInputValue.value).then((res) => {
      const transformedUsers = res.data.users.map(user => ({
        ...user,
        _id: user.id || '',
        name: user.name || '',
        avatar: user.avatar || ''
      }));
      setUsers(transformedUsers);
    });
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      try {
        searchUserQuery(searchInputValue.value).then((res) => {
          setUsers(res.data.users);
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Error fetching users",
          variant: "destructive",
          duration: 1000,
        })
      }
    }, 300);

    return () => {
      clearTimeout(timeOutId);
    };
  }, [searchInputValue.value, searchUserQuery]);

  return (
    <Dialog open={isSearch} onClose={closeSearch}>
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
        }}
      >
        <DialogTitle
          textAlign="center"
          fontWeight={600}
          color="#333"
          sx={{ pb: 2 }}
        >
          Find a Friend
        </DialogTitle>
        <TextField
          value={searchInputValue.value}
          onChange={searchInputValue.changeHandler}
          variant="outlined"
          size="medium"
          placeholder="Search for friends or groups..."
          sx={{
            width: "100%",
            bgcolor: "white",
            borderRadius: "8px",
            mb: 2,
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#555" }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <List
          key={"SearchList"}
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
          {isLoadingSearchUser ? (
            <Box
              key={"loadingUsers"}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Skeleton
                variant="rectangular"
                width="100%"
                height={50}
                animation="wave"
                sx={{ borderRadius: "8px" }}
              />
            </Box>
          ) : errorSearchUser ? (
            <Box
              key={"errorFetchingUsers"}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <p style={{ color: "#f00" }}>Error fetching users</p>
            </Box>
          ) : users.length === 0 ? (
            <Box
              key={"noUsersFound"}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <p style={{ color: "#555" }}>No users found</p>
            </Box>
          ) : (
            users.map((user) => (
              <UserItem
                user={user}
                key={user.id}
                handler={SendFriendRequestHandler}
                handlerIsLoading={isLoadingSendFriendRequest}
              />
            ))
          )}
        </List>
      </Box>
    </Dialog>
  );
};

export default Search;
