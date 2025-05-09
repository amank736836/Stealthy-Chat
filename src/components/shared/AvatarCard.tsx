import { transformImageUrl } from "@/lib/features";
import { Avatar, AvatarGroup, Box, Stack } from "@mui/material";
import React from "react";

interface AvatarCardProps {
  avatar: string[];
  max?: number;
}

const AvatarCard = ({ avatar, max = 3 }: AvatarCardProps) => {
  return (
    <Stack direction={"row"} spacing={0.5} alignItems={"center"}>
      <AvatarGroup
        max={max}
        sx={{
          gap: "0.3rem",
          position: "relative",
        }}
      >
        <Box width={"5rem"} height={"3rem"} display="flex" alignItems="center">
          {avatar.map((src, index) => {
            if (index >= max) return null;
            return (
              <Avatar
                key={index}
                src={transformImageUrl(src)}
                alt={`Avatar ${index}`}
                sx={{
                  width: "3rem",
                  height: "3rem",
                  position: "absolute",
                  left: {
                    xs: `${index}rem`,
                    sm: `${index - 0.5}rem`,
                  },
                  border: "2px solid white",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                  transition: "transform 0.3s ease-in-out",
                  transform: "translateX(15%)",
                  "&:hover": {
                    zIndex: 1,
                    transform: "scale(1.1)",
                  },
                }}
              />
            );
          })}
        </Box>
      </AvatarGroup>
    </Stack>
  );
};

export default AvatarCard;
