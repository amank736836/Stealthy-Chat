"use client";

import { gradientBg } from "@/app/constants/color";
import { Stack, Typography } from "@mui/material";

const Groups = () =>
(
    <>
        <Stack
            width={"100%"}
            direction={"row"}
            alignItems={"center"}
            justifyContent={"center"}
            spacing={"1rem"}
            padding={"3rem"}
        >
            <>
                <Typography variant="h4">
                    Group Details Page
                </Typography>

            </>
        </Stack>
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

        </Stack>

    </>

)

export default Groups;
