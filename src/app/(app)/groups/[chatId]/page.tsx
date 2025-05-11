"use client";

import { gradientBg } from "@/app/constants/color";
import { LayoutLoader } from "@/components/layout/Loaders";
import AvatarCard from "@/components/shared/AvatarCard";
import UserItem from "@/components/shared/UserItem";
import { StyledLink } from "@/components/styles/StyledComponents";
import { setIsAddMember, setIsDeleteMenu, setIsMobile } from "@/lib/store/misc.reducer";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Done as DoneIcon,
    Edit as EditIcon,
    KeyboardBackspace as KeyboardBackspaceIcon,
    Menu as MenuIcon,
} from "@mui/icons-material";
import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    Drawer,
    Grid,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { lazy, memo, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ConfirmDeleteDialog = lazy(() =>
    import("@/components/dialog/ConfirmDeleteDialog")
);

const AddMemberDialog = lazy(() =>
    import("@/components/dialog/AddMemberDialog")
);

import { useRemoveMemberMutation, useRenameGroupMutation } from "@/hooks/mutation";
import { useGetChatDetailsQuery, useGetMyGroupsQuery } from "@/hooks/query";
import { useToast } from "@/hooks/use-toast";
import type { RootState } from "@/lib/store/store";
import { useParams, useRouter } from "next/navigation";
const Groups = () => {
    const params = useParams<{ chatId: string }>();
    const { chatId } = params

    const { isMobile, isDeleteMenu, isAddMember } = useSelector(
        (state: RootState) => state.misc
    );

    const { toast } = useToast();
    const dispatch = useDispatch();
    const router = useRouter();

    const [groupName, setGroupName] = useState("Group Details Page");
    const [groupNameUpdatedValue, setGroupNameUpdatedValue] = useState<string>("");
    const [isEdit, setIsEdit] = useState(false);

    interface Member {
        _id: string;
        name: string;
        avatar: string;
        isAdded?: boolean;
        [key: string]: any;
    }

    const [members, setMembers] = useState<Member[]>([]);

    const {
        data: myGroups = [],
        isLoading: isLoadingMyGroups,
        isError: isErrorMyGroups,
        error: errorMyGroups,
    } = useGetMyGroupsQuery();

    const {
        data: groupDetails,
        isLoading: isLoadingGroupDetails,
        isError: isErrorGroupDetails,
        error: errorGroupDetails,
    } = useGetChatDetailsQuery({ chatId, populate: true });

    const {
        renameGroupMutation,
        isLoading: isLoadingUpdateGroupName,
        isError: isErrorUpdateGroupName,
        error: errorUpdateGroupName,
    } = useRenameGroupMutation();

    const
        {
            removeMemberMutation,
            isLoading: isLoadingRemoveMember,
            isError: isErrorRemoveMember,
            error: errorRemoveMember,
        } = useRemoveMemberMutation();

    const handleErrors = (isError: boolean, error: any, message: string) => {
        if (isError) {
            toast({
                title: "Error",
                description:
                    (error && typeof error === "object" && error !== null && !Array.isArray(error) && "data" in error && (error as any).data?.message) ||
                    (error && typeof error === "object" && error !== null && !Array.isArray(error) && "message" in error && (error as any).message) ||
                    message,
                variant: "destructive",
                duration: 2000,
            });
        }
    };

    useEffect(() => {
        handleErrors(isErrorMyGroups, errorMyGroups, "Failed to fetch groups");
        handleErrors(
            isErrorGroupDetails,
            errorGroupDetails,
            "Failed to fetch group details"
        );
        handleErrors(
            isErrorUpdateGroupName,
            errorUpdateGroupName,
            "Failed to update group name"
        );
        handleErrors(
            isErrorRemoveMember,
            errorRemoveMember,
            "Failed to remove member"
        );
    }, [
        isErrorMyGroups,
        errorMyGroups,
        isErrorGroupDetails,
        errorGroupDetails,
        isErrorUpdateGroupName,
        errorUpdateGroupName,
        isErrorRemoveMember,
        errorRemoveMember,
    ]);


    const navigateBack = () => router.back();
    const handleMobileOpen = () => dispatch(setIsMobile(true));
    const openAddMemberHandler = () => dispatch(setIsAddMember(true));
    const openConfirmDeleteHandler = () => dispatch(setIsDeleteMenu(true));

    const updateGroupName = async () => {
        setIsEdit(false);
        if (groupName === groupNameUpdatedValue) return;
        setGroupName(groupNameUpdatedValue);
        const toastId = toast({
            title: "Updating group name...",
            description: "Please wait",
            variant: "default",
            duration: 0,
        });
        try {

            const res = await renameGroupMutation({
                chatId,
                name: groupNameUpdatedValue,
            })
            if (res) {
                toastId.update({
                    title: "Group name updated",
                    description: "Group name updated successfully",
                    variant: "default",
                    duration: 2000,
                    id: toastId.id,
                });
            } else {
                toastId.update({
                    title: "Error",
                    description: "Failed to update group name",
                    variant: "destructive",
                    duration: 2000,
                    id: toastId.id,
                });
            }
        } catch (error) {
            toastId.update({
                title: "Error",
                description:
                    (error && typeof error === "object" && error !== null && !Array.isArray(error) && "data" in error && (error.data as any)?.message) ||
                    (error && typeof error === "object" && error !== null && !Array.isArray(error) && "message" in error && (error as any).message) ||
                    "Failed to update group name",
                variant: "destructive",
                duration: 2000,
                id: toastId.id,
            });

        }
    };

    interface RemoveMemberParams {
        chatId: string;
        memberId: string;
    }

    const removeMemberHandler = async (memberId: string): Promise<void> => {
        if (memberId === groupDetails?.chat?.creator) return;
        const toastId = toast({
            title: "Removing member...",
            description: "Please wait",
            variant: "default",
            duration: 0,
        });
        try {
            const res = await removeMemberMutation({
                chatId,
                memberId,
            } as RemoveMemberParams)

            if (res) {
                setMembers((prevMembers) =>
                    prevMembers.filter((member) => member._id !== memberId)
                );
                toastId.update({
                    title: "Member removed",
                    description: "Member removed successfully",
                    variant: "default",
                    duration: 2000,
                    id: toastId.id,
                });
            } else {
                toastId.update({
                    title: "Error",
                    description: "Failed to remove member",
                    variant: "destructive",
                    duration: 2000,
                    id: toastId.id,
                });
            }

        } catch (error) {

            toastId.update({
                title: "Error",
                description:
                    (error && typeof error === "object" && error !== null && !Array.isArray(error) && "data" in error && (error.data as any)?.message) ||
                    (error && typeof error === "object" && error !== null && !Array.isArray(error) && "message" in error && (error as any).message) ||
                    "Failed to remove member",
                variant: "destructive",
                duration: 2000,
                id: toastId.id,
            });

        }
    };

    useEffect(() => {
        return () => {
            setGroupName("");
            setGroupNameUpdatedValue("");
            setMembers([]);
            setIsEdit(false);
        };
    }, [chatId]);

    useEffect(() => {
        if (groupDetails) {
            setGroupName(groupDetails.chat.name);
            setGroupNameUpdatedValue(groupDetails.chat.name);
            setMembers(
                groupDetails.chat.members.map((member: Member) => ({
                    ...member,
                    isAdded: true,
                }))
            );
            setIsEdit(false);
        }
        if (isErrorGroupDetails) {
            router.refresh();
        }
    }, [groupDetails]);

    const IconButtons = (
        <>
            <Box
                sx={{
                    display: { xs: "block", sm: "none" },
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                }}
            >
                <Tooltip title="Menu">
                    <IconButton onClick={handleMobileOpen}>
                        <MenuIcon sx={{ color: "white" }} />
                    </IconButton>
                </Tooltip>
            </Box>

            <Tooltip title="Back">
                <IconButton
                    sx={{
                        position: "absolute",
                        top: "1.5rem",
                        left: "1.5rem",
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                        color: "white",
                        transition: "all 0.3s ease-in-out",
                        "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                            transform: "scale(1.1)",
                        },
                    }}
                    onClick={navigateBack}
                >
                    <KeyboardBackspaceIcon />
                </IconButton>
            </Tooltip>
        </>
    );

    const GroupName = (
        <Stack
            width={"100%"}
            direction={"row"}
            alignItems={"center"}
            justifyContent={"center"}
            spacing={"1rem"}
            padding={"3rem"}
        >
            {isEdit ? (
                <>
                    <TextField
                        variant="outlined"
                        sx={{ width: "80vw" }}
                        value={groupNameUpdatedValue}
                        onChange={(e) => setGroupNameUpdatedValue(e.target.value)}
                    />
                    <IconButton
                        onClick={updateGroupName}
                        disabled={isLoadingUpdateGroupName}
                    >
                        <DoneIcon />
                    </IconButton>
                </>
            ) : (
                <>
                    <Typography variant="h4">{groupName}</Typography>
                    {chatId && (
                        <IconButton
                            onClick={() => setIsEdit(true)}
                            disabled={isLoadingUpdateGroupName}
                        >
                            <EditIcon />
                        </IconButton>
                    )}
                </>
            )}
        </Stack>
    );

    const ButtonGroup = (
        <Stack
            direction={{
                xs: "column-reverse",
                sm: "row",
            }}
            spacing={"1rem"}
            p={{
                xs: "0",
                sm: "1rem",
                md: "1rem 4rem",
            }}
        >
            <Button
                size="large"
                color="error"
                variant="contained"
                startIcon={<DeleteIcon />}
                onClick={openConfirmDeleteHandler}
            >
                Delete Group
            </Button>
            <Button
                size="large"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAddMemberHandler}
            >
                Add Member
            </Button>
        </Stack>
    );

    return (<>



        {GroupName}

        <Typography
            margin={"2rem"}
            alignSelf={"flex-start"}
            variant="body1"
        >
            Members
        </Typography>
        <Stack
            maxWidth={"45rem"}
            width={"100%"}
            boxSizing={"border-box"}
            padding={{
                xs: "0",
                sm: "1rem",
                md: "1rem 4rem",
            }}
            spacing={"2rem"}
            bgcolor={gradientBg}
            height={"50vh"}
            overflow={"auto"}
            sx={{
                "&::-webkit-scrollbar": {
                    display: "none",
                },
            }}
        >

            {groupDetails && members.length === 0 ? (
                <Typography textAlign="center" color="white">
                    No members found in this group.
                </Typography>
            ) : (
                <Stack
                    spacing={0.5}
                    sx={{
                        "&::-webkit-scrollbar": {
                            display: "none",
                        },
                    }}
                >
                    <>
                        {isLoadingRemoveMember ? (
                            <>
                                <CircularProgress
                                    size={20}
                                    sx={{
                                        color: "white",
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                    }}
                                />
                            </>
                        ) : (
                            members.map((user) => (
                                <UserItem
                                    key={user._id}
                                    user={user}
                                    isAdded={user.isAdded}
                                    handler={removeMemberHandler}
                                    styling={{
                                        boxShadow: "0 0 0.5rem rgba(0, 0, 0, 0.2)",
                                        padding: "1rem 2rem",
                                        borderRadius: "1rem",
                                        bgcolor: "rgba(25, 25, 25, 0.5)",
                                    }}
                                />
                            ))
                        )}
                    </>
                </Stack>
            )}
        </Stack>

        {chatId && ButtonGroup}


        {isAddMember && chatId && (
            <Suspense fallback={<Backdrop open={true} />}>
                <AddMemberDialog chatId={chatId} />
            </Suspense>
        )}

        {isDeleteMenu && chatId && (
            <Suspense fallback={<Backdrop open={true} />}>
                <ConfirmDeleteDialog chatId={chatId} />
            </Suspense>
        )}

    </>
    )

};


export default Groups;
