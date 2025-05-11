import { useErrors } from "@/hooks/hook";
import { useSendAttachmentsMutation } from "@/hooks/mutation";
import { useToast } from "@/hooks/use-toast";
import { setIsFileMenu, setUploadingLoader } from "@/lib/store/misc.reducer";
import { RootState } from "@/lib/store/store";
import {
  AudioFile as AudioFileIcon,
  Image as ImageIcon,
  UploadFile as UploadFileIcon,
  VideoFile as VideoFileIcon,
} from "@mui/icons-material";
import { ListItemText, Menu, MenuItem, MenuList, Tooltip } from "@mui/material";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

interface FileMenuProps {
  anchorE1: HTMLElement | null;
  chatId: string;
}

const FileMenu = ({ anchorE1, chatId }: FileMenuProps) => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { isFileMenu } = useSelector((state: RootState) => state.misc);

  const closeFileMenu = () => {
    dispatch(setIsFileMenu(false));
  };

  const imageRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const
    {
      sendAttachmentsMutation,
      isLoading: isLoadingSendAttachments,
      isError: isErrorSendAttachments,
      error: errorSendAttachments,
    } = useSendAttachmentsMutation();

  useErrors([
    {
      isError: isErrorSendAttachments,
      error: errorSendAttachments,
    },
  ]);

  const selectImage = () => {
    imageRef.current?.click();
  };

  const selectAudio = () => {
    audioRef.current?.click();
  };

  const selectVideo = () => {
    videoRef.current?.click();
  };

  const selectFile = () => {
    fileRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const files = Array.from(e.target.files as FileList) as File[];

    if (files.length <= 0) return;

    if (files.length > 5) {
      toast({
        title: "Error",
        description: `You can only upload a maximum of 5 ${key}`,
        variant: "destructive",
        duration: 1000,
      })
      return;
    }

    dispatch(setUploadingLoader(true));

    const toastId = toast({
      title: `Uploading ${key}...`,
      description: `Uploading ${key}...`,
      variant: "default",
      duration: 1000,
    })

    closeFileMenu();

    try {
      const myForm = new FormData();

      myForm.append("chatId", chatId);

      files.forEach((file) => {
        myForm.append("files", file);
      });

      const res = await sendAttachmentsMutation(myForm);

      if (res.data) {
        toast({
          title: "Success",
          description: res.data.message || `Uploaded ${key} successfully`,
          variant: "default",
          duration: 1000,
        })
      } else if (res.error) {
        console.error(res.error);
        toast({
          title: "Error",
          description: 'data' in res.error && res.error.data && typeof res.error.data === 'object' && 'message' in res.error.data
            ? (res.error.data as any).message
            : `Error uploading ${key}`,
          variant: "destructive",
          duration: 1000,
        })
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: `Error uploading ${key}`,
        variant: "destructive",
        duration: 1000,
      })
    } finally {
      dispatch(setUploadingLoader(false));
    }
  };

  return (
    <Menu
      anchorEl={anchorE1}
      open={isFileMenu}
      onClose={closeFileMenu}
      sx={{
        backdropFilter: "blur(1px)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
      }}
    >
      <div style={{ width: "10rem", borderRadius: "0.5rem" }}>
        <MenuList>
          <MenuItem onClick={selectImage}>
            <Tooltip title="Image">
              <ImageIcon />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>Image</ListItemText>
            <input
              title="Image"
              ref={imageRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
              multiple
              style={{
                display: "none",
              }}
              onChange={(e) => handleFileUpload(e, "Images")}
            />
          </MenuItem>
          <MenuItem onClick={selectAudio}>
            <Tooltip title="Audio">
              <AudioFileIcon />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>Audio</ListItemText>
            <input
              title="Audio"
              ref={audioRef}
              type="file"
              accept="audio/mpeg, audio/wav, audio/mp3, audio/aac, audio/m4a, audio/flac"
              multiple
              style={{
                display: "none",
              }}
              onChange={(e) => handleFileUpload(e, "Audios")}
            />
          </MenuItem>
          <MenuItem onClick={selectVideo}>
            <Tooltip title="Video">
              <VideoFileIcon />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>Video</ListItemText>
            <input
              title="Video"
              ref={videoRef}
              type="file"
              accept="video/mp4, video/webm, video/mkv, video/avi, video/mov, video/flv, video/wmv"
              multiple
              style={{
                display: "none",
              }}
              onChange={(e) => handleFileUpload(e, "Videos")}
            />
          </MenuItem>
          <MenuItem onClick={selectFile}>
            <Tooltip title="File">
              <UploadFileIcon />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>File</ListItemText>
            <input
              title="File"
              ref={fileRef}
              type="file"
              accept="*"
              multiple
              style={{
                display: "none",
              }}
              onChange={(e) => handleFileUpload(e, "Files")}
            />
          </MenuItem>
        </MenuList>
      </div>
    </Menu>
  );
};

export default FileMenu;
