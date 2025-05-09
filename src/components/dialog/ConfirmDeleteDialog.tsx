import { useAsyncMutation, useErrors } from "@/hooks/hook";
import { useDeleteChatMutation } from "@/lib/store/api";
import { setIsDeleteMenu } from "@/lib/store/misc.reducer";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

interface ConfirmDeleteDialogProps {
  chatId: string;
}

const confirmDeleteDialog = ({ chatId }: ConfirmDeleteDialogProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isDeleteMenu } = useSelector((state) => state.misc);

  const handleClose = () => {
    dispatch(setIsDeleteMenu(false));
  };

  const [
    deleteChatMutation,
    {
      data: deleteChatData,
      isLoading: isLoadingDeleteChat,
      isError: isErrorDeleteChat,
      error: errorDeleteChat,
    },
  ] = useAsyncMutation(useDeleteChatMutation);

  useErrors([
    {
      isError: isErrorDeleteChat,
      error: errorDeleteChat,
    },
  ]);

  const deleteHandler = () => {
    deleteChatMutation("Deleting Group...", chatId);
    router.push("/groups");
    handleClose();
  };

  return (
    <Dialog open={isDeleteMenu} onClose={handleClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this chat? This action cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="success" onClick={handleClose}>
          No
        </Button>
        <Button color="error" onClick={deleteHandler}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default confirmDeleteDialog;
