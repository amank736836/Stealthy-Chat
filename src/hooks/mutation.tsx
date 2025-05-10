import axios from "axios";
import { useState } from "react";

const useSendFriendRequestMutation = () => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendFriendRequestMutation = async (userId: string) => {
        setIsLoading(true);
        try {
            const response = await axios.put("/api/user/sendFriendRequest", { userId }, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setData(response.data);
                setIsError(false);
                return response;
            } else {
                setError("Failed to send friend request");
                setIsError(true);
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error?.message);
            } else if (typeof error === 'string') {
                setError(error);
            } else {
                setError("An unknown error occurred");
            }
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }


    return {
        data,
        isLoading,
        isError,
        error,
        sendFriendRequestMutation,
    };
}

const useAcceptFriendRequestMutation = () => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const acceptFriendRequestMutation = async (userId: string) => {
        setIsLoading(true);
        try {
            const response = await axios.put("/api/user/acceptFriendRequest", { userId }, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setData(response.data);
                setIsError(false);
                return response;
            } else {
                setError("Failed to accept friend request");
                setIsError(true);
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error?.message)
            } else if (typeof error === 'string') {
                setError(error);
            } else {
                setError("An unknown error occurred");
            }
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        data,
        isLoading,
        isError,
        error,
        acceptFriendRequestMutation,
    };

}

const useSendAttachmentsMutation = () => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendAttachmentsMutation = async (body: any) => {
        setIsLoading(true);
        try {
            const response = await axios.post("/api/chat/sendAttachments", body, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setIsError(false);
                setData(response.data);
                return response.data;
            } else {
                setError("Failed to send attachments");
                setIsError(true);
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error?.message);
            } else if (typeof error === 'string') {
                setError(error);
            } else {
                setError("An unknown error occurred");
            }
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        data,
        isLoading,
        isError,
        error,
        sendAttachmentsMutation,
    };
}

const useNewGroupMutation = () => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const newGroupMutation = async (body: any) => {
        setIsLoading(true);
        try {
            const response = await axios.post("/api/chat/newGroupChat", body, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setData(response.data);
                setIsError(false);
                return response;
            } else {
                setError("Failed to create new group");
                setIsError(true);
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error?.message);
            } else if (typeof error === 'string') {
                setError(error);
            } else {
                setError("An unknown error occurred");
            }
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        data,
        isLoading,
        isError,
        error,
        newGroupMutation,
    };
}

const useRenameGroupMutation = () => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const renameGroupMutation = async ({ chatId, name }: {
        chatId: string;
        name: string;
    }) => {
        setIsLoading(true);
        try {
            const response = await axios.put(`/api/chat/${chatId}`, { name }, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setData(response.data);
                setIsError(false);
                return response.data;
            } else {
                setError("Failed to rename group");
                setIsError(true);
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error?.message);
            } else if (typeof error === 'string') {
                setError(error);
            } else {
                setError("An unknown error occurred");
            }
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        data,
        isLoading,
        isError,
        error,
        renameGroupMutation,
    };
}

const useRemoveMemberMutation = () => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const removeMemberMutation = async ({ chatId, memberId }: {
        chatId: string;
        memberId: string;
    }) => {
        setIsLoading(true);
        try {
            const response = await axios.put("/api/chat/removeMember", { chatId, memberId }, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setData(response.data);
                setIsError(false);
                return response.data;
            } else {
                setError("Failed to remove member");
                setIsError(true);
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error?.message);
            } else if (typeof error === 'string') {
                setError(error);
            } else {
                setError("An unknown error occurred");
            }
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        data,
        isLoading,
        isError,
        error,
        removeMemberMutation,
    };
}

const useAddGroupMembersMutation = () => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addGroupMembersMutation = async ({ chatId, members }: {
        chatId: string;
        members: string[];
    }) => {
        setIsLoading(true);
        try {
            const response = await axios.put("/api/chat/addGroupMembers", { chatId, members }, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setData(response.data);
                setIsError(false);
            } else {
                setError("Failed to add group members");
                setIsError(true);
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error?.message);
            } else if (typeof error === 'string') {
                setError(error);
            } else {
                setError("An unknown error occurred");
            }
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        data,
        isLoading,
        isError,
        error,
        addGroupMembersMutation,
    };
}

const useDeleteChatMutation = () => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteChatMutation = async (chatId: string) => {
        setIsLoading(true);
        try {
            const response = await axios.delete(`/api/chat/deleteChat/${chatId}`, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setData(response.data);
                setIsError(false);
                return response;
            } else {
                setError("Failed to delete chat");
                setIsError(true);
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error?.message);
            } else if (typeof error === 'string') {
                setError(error);
            } else {
                setError("An unknown error occurred");
            }
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        data,
        isLoading,
        isError,
        error,
        deleteChatMutation,
    };
}

const useLeaveGroupMutation = () => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const leaveGroupMutation = async (chatId: string) => {
        setIsLoading(true);
        try {
            const response = await axios.delete(`/api/chat/leaveGroup/${chatId}`, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setData(response.data);
                setIsError(false);
            } else {
                setError("Failed to leave group");
                setIsError(true);
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error?.message);
            } else if (typeof error === 'string') {
                setError(error);
            } else {
                setError("An unknown error occurred");
            }
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        data,
        isLoading,
        isError,
        error,
        leaveGroupMutation
    };
}


export {
    useAcceptFriendRequestMutation, useAddGroupMembersMutation,
    useDeleteChatMutation,
    useLeaveGroupMutation, useNewGroupMutation, useRemoveMemberMutation, useRenameGroupMutation, useSendAttachmentsMutation, useSendFriendRequestMutation
};


