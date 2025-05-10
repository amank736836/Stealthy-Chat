import { dialogBg } from "@/app/constants/color";
import useErrors from "@/hooks/hook";
import { useAddGroupMembersMutation, useGetAvailableFriendsQuery } from "@/lib/store/api";
import { setIsAddMember } from "@/lib/store/misc.reducer";
import { RootState } from "@/lib/store/store";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    List,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UserItem, { User } from "../shared/UserItem";

interface AddMemberDialogProps {
    chatId: string;
}

const AddMemberDialog = ({ chatId }: AddMemberDialogProps) => {
    const { isAddMember } = useSelector((state: RootState) => state.misc);

    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const dispatch = useDispatch();

    const {
        data: availableFriends,
        isLoading: isLoadingAvailableFriends,
        isError: isErrorAvailableFriends,
        error: errorAvailableFriends,
    } = useGetAvailableFriendsQuery(chatId);

    const [
        addMembers,
        {
            isLoading: isLoadingAddMember,
            isError: isErrorAddMember,
            error: errorAddMember,
        },
    ] = useAddGroupMembersMutation();

    useErrors([
        { isError: isErrorAddMember, error: errorAddMember },
        { isError: isErrorAvailableFriends, error: errorAvailableFriends },
    ]);

    const addMembersSubmitHandler = () => {
        try {
            if (selectedMembers.length === 0) {
                return;
            }
            addMembers({ chatId, members: selectedMembers })
                .unwrap()
                .then(() => {
                    setSelectedMembers([]);
                    dispatch(setIsAddMember(false));
                });
        } catch (error) {

        }
        closeHandler();
    };

    const closeHandler = () => {
        setSelectedMembers([]);
        dispatch(setIsAddMember(false));
    };

    interface SelectMemberHandler {
        (userId: string): void;
    }

    const selectMemberHandler: SelectMemberHandler = (userId) => {
        if (!userId) return;
        setSelectedMembers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    return (
        <Dialog open={isAddMember} onClose={closeHandler}>
            <Box
                sx={{
                    p: "1rem",
                    width: {
                        xs: "80vw",
                        sm: "70vw",
                        md: "50vw",
                        lg: "30vw",
                    },
                    height: "auto",
                    background: dialogBg,
                }}
            >
                <DialogTitle textAlign={"center"}>Add Member</DialogTitle>
                <Stack spacing={"1rem"}>
                    <List
                        key={"AddMemberList"}
                        sx={{
                            maxHeight: "400px",
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
                        {isLoadingAvailableFriends ? (
                            <Skeleton
                                key={"AddMemberSkeleton"}
                                variant="rectangular"
                                width={"100%"}
                                height={100}
                                animation="wave"
                                sx={{
                                    borderRadius: "8px",
                                    marginBottom: "0.5rem",
                                }}
                            />
                        ) : isErrorAvailableFriends ? (
                            <Typography textAlign={"center"} key={"AddMemberError"}>
                                {(errorAvailableFriends && 'data' in errorAvailableFriends && (errorAvailableFriends as any).data?.message) ||
                                    (errorAvailableFriends && 'message' in errorAvailableFriends && (errorAvailableFriends as any).message) ||
                                    "Something went wrong"}
                            </Typography>
                        ) : availableFriends?.friends?.length > 0 ? (
                            (availableFriends?.friends as User[])?.map((user: User) => (
                                <UserItem
                                    user={user}
                                    key={user._id}
                                    handler={selectMemberHandler}
                                    isAdded={Boolean(selectedMembers?.includes(user._id))}
                                />
                            ))
                        ) : (
                            <Typography textAlign={"center"}>No Known Found</Typography>
                        )}
                    </List>
                </Stack>
                <Stack
                    direction={"row"}
                    justifyContent={"space-evenly"}
                    alignItems={"center"}
                    paddingTop={2}
                    marginTop={2}
                >
                    <Button color="error" variant="contained" onClick={closeHandler}>
                        Cancel
                    </Button>
                    <Button
                        color="success"
                        variant="contained"
                        disabled={isLoadingAddMember}
                        onClick={addMembersSubmitHandler}
                    >
                        Submit Changes
                    </Button>
                </Stack>
            </Box>
        </Dialog>
    );
};

export default AddMemberDialog;
