import { gradientBg } from "@/app/constants/color";
import { LayoutLoader } from "@/components/layout/Loaders";
import AvatarCard from "@/components/shared/AvatarCard";
import UserItem, { User } from "@/components/shared/UserItem";
import { StyledLink } from "@/components/styles/StyledComponents";
import { useAddGroupMembersMutation, useGetChatDetailsQuery, useGetMyGroupsQuery, useRemoveMemberMutation, useRenameGroupMutation } from "@/lib/store/api";
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
import { useNavigate, useSearchParams } from "react-router-dom";

const ConfirmDeleteDialog = lazy(() =>
    import("@/components/dialog/ConfirmDeleteDialog")
);

const AddMemberDialog = lazy(() =>
    import("@/components/dialog/AddMemberDialog")
);

import type { RootState } from "@/lib/store/store";
import { useToast } from "@/hooks/use-toast";
const Groups = () => {

    const { isMobile, isDeleteMenu, isAddMember } = useSelector(
        (state: RootState) => state.misc
    );

    const { toast } = useToast();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const chatId = useSearchParams()[0].get("group");

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
    } = useGetMyGroupsQuery("");

    const {
        data: groupDetails,
        isLoading: isLoadingGroupDetails,
        isError: isErrorGroupDetails,
        error: errorGroupDetails,
    } = useGetChatDetailsQuery({ chatId, populate: true }, { skip: !chatId });

    const [
        updateGroupNameMutation,
        {
            isLoading: isLoadingUpdateGroupName,
            isError: isErrorUpdateGroupName,
            error: errorUpdateGroupName,
        },
    ] = useRenameGroupMutation();

    const [
        removeMemberMutation,
        {
            isLoading: isLoadingRemoveMember,
            isError: isErrorRemoveMember,
            error: errorRemoveMember,
        },
    ] = useRemoveMemberMutation();

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


    const navigateBack = () => navigate("/home");
    const handleMobileOpen = () => dispatch(setIsMobile(true));
    const handleMobileClose = () => dispatch(setIsMobile(false));
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

            const res = await updateGroupNameMutation({
                chatId,
                name: groupNameUpdatedValue,
            }).unwrap();
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
            } as RemoveMemberParams).unwrap();

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
            navigate("/groups");
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

    return isLoadingMyGroups ? (
        <LayoutLoader />
    ) : (
        <Grid container height="100vh">
            <Grid
                size={{ sm: 4 }}
                sx={{
                    display: { xs: "none", sm: "block" },
                    background: gradientBg,
                    boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
                    padding: "0.5rem",
                    "&::-webkit-scrollbar": {
                        display: "none",
                    },
                }}
                width={"100%"}
                height={"100%"}
                position={"relative"}
                overflow={"auto"}
            >
                <GroupsList myGroups={myGroups?.groups} chatId={chatId} />
            </Grid>

            <Grid
                size={{ xs: 12, sm: 8 }}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                    padding: "1.5rem 2rem",
                    background: gradientBg,
                    color: "white",
                }}
            >
                {IconButtons}

                {groupName && (
                    <>
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
                            {!chatId && (
                                <Typography
                                    variant="body2"
                                    color="white"
                                    fontSize={"3rem"}
                                    marginLeft={"1rem"}
                                    fontWeight={600}
                                    sx={{
                                        display: "inline-block",
                                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                                        padding: "0.5rem",
                                        borderRadius: "1rem",
                                    }}
                                >
                                    Here members can be added or removed from the group. Select a
                                    group to view its details.
                                </Typography>
                            )}
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
                    </>
                )}
            </Grid>

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

            <Drawer
                anchor="left"
                open={isMobile}
                onClose={handleMobileClose}
                sx={{
                    display: { xs: "block", sm: "none" },
                }}
                slotProps={{
                    paper: {
                        sx: { width: "75vw", background: gradientBg, padding: "0.5rem" },
                    },
                }}
            >
                <GroupsList w={"70vw"} myGroups={myGroups?.groups} chatId={chatId} />
            </Drawer>
        </Grid>
    );
};

const GroupsList = ({ w = "100%", myGroups = [], chatId }: { w?: string, myGroups?: Array<any>, chatId: string | null }) => (
    <Stack sx={{ padding: "0.25rem" }} width={w} height={"100%"}>
        {myGroups.length > 0 ? (
            myGroups.map((group) => (
                <GroupListItem group={group} key={group._id} chatId={chatId} />
            ))
        ) : (
            <Typography textAlign="center" padding="1rem" color="white">
                No Groups Found
            </Typography>
        )}
    </Stack>
);

interface GroupListItemProps {
    group: {
        name: string;
        avatar: string;
        _id: string;
    };
    chatId: string | null;
}

const GroupListItem = memo(({ group, chatId }: GroupListItemProps) => {
    const { name, avatar, _id } = group;

    const dispatch = useDispatch();
    const handleMobileClose = () => dispatch(setIsMobile(false));

    return (
        <StyledLink
            to={`?group=${_id}`}
            onClick={(e) => {
                if (chatId === _id) e.preventDefault();
                handleMobileClose();
            }}
        >
            <Stack
                direction="row"
                spacing={3}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.5rem",
                    paddingLeft: "1rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    transition: "background-color 0.3s ease, transform 0.2s ease",
                    "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.3)",
                        transform: "scale(1.05)",
                    },
                }}
            >
                <AvatarCard avatar={[avatar]} />
                <Typography fontSize="1rem" fontWeight="500" color="white">
                    {name}
                </Typography>
            </Stack>
        </StyledLink>
    );
});

export default Groups;
