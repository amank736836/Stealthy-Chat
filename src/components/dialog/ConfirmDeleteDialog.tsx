import useErrors from "@/hooks/hook";
import { useToast } from "@/hooks/use-toast";
import { useDeleteChatMutation } from "@/lib/store/api";
import { setIsDeleteMenu } from "@/lib/store/misc.reducer";
import { RootState } from "@/lib/store/store";
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
  const router = useRouter()
  const { toast } = useToast();
  const { isDeleteMenu } = useSelector((state: RootState) => state.misc);

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
  ] = useDeleteChatMutation();

  useErrors([
    {
      isError: isErrorDeleteChat,
      error: errorDeleteChat,
    },
  ]);

  const deleteHandler = () => {
    try {
      deleteChatMutation(chatId)
        .unwrap()
        .then(() => {
          toast({
            title: "Success",
            description: "Chat deleted successfully",
            variant: "default",
            duration: 1000,
          });
        });
    } catch (error) {

    }
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
