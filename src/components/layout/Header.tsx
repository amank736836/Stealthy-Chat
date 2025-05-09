import { useToast } from "@/hooks/use-toast";
import { userNotExists } from "@/lib/store/auth.reducer";
import { resetNotificationCount } from "@/lib/store/chat.reducer";
import { setIsMobile, setIsNewGroup, setIsNotification, setIsSearch } from "@/lib/store/misc.reducer";
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
import axios, { AxiosError } from "axios";
import { Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { isMobile, isSearch, isNotification, isNewGroup } = useSelector(
    (state) => state.misc
  );

  const { notificationCount } = useSelector((state) => state.chat);

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
    let toastId = toast({
      title: "Logging out...",
      description: "Please wait...",
      variant: "default",
      duration: 1000,
    })

    try {
      const { data } = await axios.get(`/user/logout`, {
        withCredentials: true,
      });

      dispatch(userNotExists());

      toast({
        title: "Logged out successfully!",
        description: data.message,
        variant: "default",
        duration: 1000,
      })
    } catch (error) {
      console.error(error);

      const axiosError = error as AxiosError<{ message: string }>;

      toast({
        title: "Error",
        description: axiosError?.response?.data?.message || "Something went wrong!",
        variant: "destructive",
        duration: 2000,
      })
    }
  };

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
            onClick={() => navigate("/")}
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
              onClick={() => navigate("/groups")}
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
};

const IconBtn = ({ title, onClick, icon, value }) => {
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
