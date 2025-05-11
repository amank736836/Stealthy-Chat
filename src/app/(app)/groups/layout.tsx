"use client";
import { gradientBg } from "@/app/constants/color";
import { LayoutLoader } from "@/components/layout/Loaders";
import AvatarCard from "@/components/shared/AvatarCard";
import { StyledLink } from "@/components/styles/StyledComponents";
import { useErrors } from "@/hooks/hook";
import { useGetMyGroupsQuery } from "@/hooks/query";
import { setIsMobile } from "@/lib/store/misc.reducer";
import type { RootState } from "@/lib/store/store";
import {
    KeyboardBackspace as KeyboardBackspaceIcon,
    Menu as MenuIcon
} from "@mui/icons-material";
import {
    Box,
    Drawer,
    Grid,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import { useRouter } from "next/navigation";
import { memo, ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";

const GroupLayout = ({
    children,
}: Readonly<{
    children: ReactNode;
}>) => {

    const { isMobile } = useSelector(
        (state: RootState) => state.misc
    );

    const dispatch = useDispatch();
    const router = useRouter();

    const {
        data: myGroups = [],
        isLoading: isLoadingMyGroups,
        isError: isErrorMyGroups,
        error: errorMyGroups,
    } = useGetMyGroupsQuery();

    useErrors([{
        isError: isErrorMyGroups,
        error: errorMyGroups,
    }])

    const navigateBack = () => router.back();
    const handleMobileOpen = () => dispatch(setIsMobile(true));
    const handleMobileClose = () => dispatch(setIsMobile(false));

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
                <GroupsList myGroups={myGroups?.groups} />
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

                {children}


            </Grid>

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
                <GroupsList w={"70vw"} myGroups={myGroups?.groups} />
            </Drawer>
        </Grid>
    );

};

const GroupsList = ({ w = "100%", myGroups = [] }: { w?: string, myGroups?: Array<any> }) => (
    <Stack sx={{ padding: "0.25rem" }} width={w} height={"100%"}>
        {myGroups.length > 0 ? (
            myGroups.map((group) => (
                <GroupListItem group={group} key={group._id} />
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
}

const GroupListItem = memo(({ group }: GroupListItemProps) => {
    const { name, avatar, _id } = group;

    const dispatch = useDispatch();
    const handleMobileClose = () => dispatch(setIsMobile(false));

    return (
        <StyledLink
            onClick={(e) => {
                e.preventDefault();
                handleMobileClose();
            }}
            href={`/group/${_id}`}
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


export default GroupLayout;
