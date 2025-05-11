import NewGroupDialog from "@/components/dialog/NewGroupDialog";
import NotificationsDialog from "@/components/dialog/NotificationsDialog";
import SearchDialog from "@/components/dialog/SearchDialog";
import { useToast } from "@/hooks/use-toast";
import { resetNotificationCount } from "@/lib/store/chat.reducer";
import { setIsMobile, setIsNewGroup, setIsNotification, setIsSearch } from "@/lib/store/misc.reducer";
import { RootState } from "@/lib/store/store";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Group as GroupIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Backdrop,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";

const Header = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { isMobile, isSearch, isNotification, isNewGroup } = useSelector(
    (state: RootState) => state.misc
  );

  const { notificationCount } = useSelector((state: RootState) => state.chat);

  const openMobile = () => {
    dispatch(setIsMobile(true));
  };

  const openSearch = () => {
    dispatch(setIsSearch(true));
  };

  const openNotification = () => {
    dispatch(setIsNotification(true));
    dispatch(resetNotificationCount());
  };

  const openNewGroup = () => {
    dispatch(setIsNewGroup(true));
  };

  const logoutHandler = async () => {
    signOut();
    router.push(`/sign-in`);

    toast({
      title: "Logged out successfully!",
      description: "See you next time!",
      variant: "default",
      duration: 1000,
    })
  }

  return (
    <>
      <AppBar
        position="static"
        sx={{
          bgcolor: "#4facfe",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          paddingX: "1rem",
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              display: { xs: "none", sm: "block" },
              fontWeight: 600,
              cursor: "pointer",
              transition: "color 0.3s",
              "&:hover": { color: "#FFDA79" },
            }}
            onClick={() => router.push("/user/home")}
          >
            Chat App
          </Typography>

          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <IconButton color="inherit" onClick={openMobile}>
              {isMobile ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Icons Section */}
          <Box display="flex" gap={1}>
            <IconBtn
              title="Search"
              onClick={openSearch}
              icon={<SearchIcon />}
            />
            <IconBtn
              title="New Group"
              onClick={openNewGroup}
              icon={<AddIcon />}
            />
            <IconBtn
              title="Notifications"
              onClick={openNotification}
              icon={<NotificationsIcon />}
              value={notificationCount}
            />
            <IconBtn
              title="Manage Groups"
              onClick={() => router.push("/groups")}
              icon={<GroupIcon />}
            />
            <IconBtn
              title="Logout"
              onClick={logoutHandler}
              icon={<LogoutIcon />}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Dialogs */}
      {isSearch && (
        <Suspense fallback={<Backdrop open={true} />}>
          <SearchDialog />
        </Suspense>
      )}

      {isNewGroup && (
        <Suspense fallback={<Backdrop open={true} />}>
          <NewGroupDialog />
        </Suspense>
      )}

      {isNotification && (
        <Suspense fallback={<Backdrop open={true} />}>
          <NotificationsDialog />
        </Suspense>
      )}
    </>
  );
}

const IconBtn = ({ title, onClick, icon, value = "" }: {
  title: string;
  onClick: () => void;
  icon: React.ReactNode;
  value?: number | string;
}) => {
  return (
    <Tooltip title={title} arrow>
      <IconButton
        color="inherit"
        onClick={onClick}
        size="large"
        sx={{
          transition: "transform 0.2s, background-color 0.3s",
          "&:hover": {
            transform: "scale(1.1)",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
        }}
      >
        {value ? (
          <Badge color="error" badgeContent={value}>
            {icon}
          </Badge>
        ) : (
          icon
        )}
      </IconButton>
    </Tooltip>
  );
};

export default Header;
