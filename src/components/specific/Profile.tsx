import { gradientBg } from "@/app/constants/color";
import { useToast } from "@/hooks/use-toast";
import { transformImageUrl } from "@/lib/features";
import { RootState } from "@/lib/store/store";
import {
  CalendarMonth as CalendarIcon,
  Email as EmailIcon,
  Face as FaceIcon,
  Link as LinkIcon,
  AlternateEmail as UsernameIcon,
} from "@mui/icons-material";
import { Avatar, Box, Stack, Switch, Typography } from "@mui/material";
import axios from "axios";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";


const Profile = () => {

  const { data: session } = useSession();

  console.log("Session:", session);

  const { toast } = useToast();

  const route = useRouter();

  if (!session?.user) {
    route.push("/login");
    return null;
  }

  const baseUrl = `${window.location.origin}`;
  const profileUrl = `${baseUrl}/u/${session.user.username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Copied to clipboard",
      description: "Profile URL copied to clipboard",
    })
  };

  const [isAcceptingMessages, setIsAcceptingMessages] = useState(
    session.user.isAcceptingMessages || false
  );

  const handleAcceptMessages = async () => {
    setIsAcceptingMessages((prev: boolean) => !prev);
    const toastId = toast({
      title: "Updating...",
      description: "Please wait...",
      variant: "default",
      duration: 1000,
    })
    try {
      const response = await axios.post(
        `/user/acceptMessages`,
        {
          isAcceptingMessages: !isAcceptingMessages,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast({
          title: "Updated successfully!",
          description: response.data.message,
          duration: 1000,
        })
        setIsAcceptingMessages(!isAcceptingMessages);
      } else {
        toast({
          title: "Failed to update",
          description: response.data.message,
          variant: "destructive",
          duration: 1000,
        })
      }
    } catch (error) {
      toast({
        title: "Failed to update",
        description: "Some error occurred. Please try again later",
        variant: "destructive",
        duration: 1000,
      })
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 4rem)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: gradientBg,
        padding: "2rem",
      }}
    >
      <Stack
        spacing={3}
        sx={{
          maxWidth: "500px",
          padding: "1rem",
          borderRadius: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0px 6px 25px rgba(0, 0, 0, 0.15)",
          textAlign: "center",
          alignItems: "center",
        }}
      >
        <Avatar
          sx={{
            width: 150,
            height: 150,
            border: "5px solid white",
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
          }}
          src={transformImageUrl(session.user.avatar.url)}
          alt="Profile Avatar"
        />
        <Stack
          spacing={1}
          direction="row"
          alignItems="center"
          sx={{
            width: "100%",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: "#f5f5f5",
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={handleAcceptMessages}
        >
          <Stack>
            <Typography variant="body1" fontWeight={600}>
              Accept Anonymous Messages
            </Typography>
            <Typography color="gray" variant="caption">
              {isAcceptingMessages}
            </Typography>
          </Stack>
          <Switch checked={isAcceptingMessages} color="primary" size="medium" />
        </Stack>
        <ProfileCard heading="Name" text={session.user.name} Icon={<FaceIcon />} />
        <ProfileCard
          heading="Username"
          text={session.user.username}
          Icon={<UsernameIcon />}
        />
        <ProfileCard heading="Email" text={session.user.email} Icon={<EmailIcon />} />
        <ProfileCard
          heading="Joining Days"
          text={moment(session.user.createdAt).fromNow(true)}
          Icon={<CalendarIcon />}
        />
        {isAcceptingMessages && (
          <ProfileCard
            heading="Profile URL"
            text={profileUrl}
            Icon={<LinkIcon />}
            handler={copyToClipboard}
          />
        )}
      </Stack>
    </Box>
  );
};

interface ProfileCardProps {
  text: string;
  Icon: React.ReactNode;
  heading: string;
  handler?: () => void;
}

const ProfileCard = ({ text, Icon, heading, handler = () => { } }: ProfileCardProps) => (
  <Stack
    spacing={1}
    direction="row"
    alignItems="center"
    sx={{
      width: "100%",
      padding: "1rem",
      borderRadius: "8px",
      backgroundColor: "#f5f5f5",
      boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
      alignItems: "center",
      justifyContent: "center",
      cursor: heading === "Profile URL" ? "pointer" : "default",
    }}
    onClick={handler}
  >
    {Icon && <Box sx={{ color: "#1976d2" }}>{Icon}</Box>}
    <Stack>
      <Typography variant="body1" fontWeight={600}>
        {text}
      </Typography>
      <Typography color="gray" variant="caption">
        {heading}
      </Typography>
    </Stack>
  </Stack>
);

export default Profile;
