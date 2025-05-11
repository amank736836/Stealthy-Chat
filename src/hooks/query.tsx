
import axios from "axios";
import { useEffect, useState } from "react";


const useGetMyChatsQuery = () => {

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetch, setRefetch] = useState(true);

  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/chat/getMyChats", {
        withCredentials: true,
      });

      if (response.status === 200) {
        setData(response.data);
        setIsError(false);
      } else {
        setError("Failed to fetch chats");
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

  useEffect(() => {
    if (refetch) {
      fetchChats();
      setRefetch(false);
    }
  }, [refetch])

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: () => {
      setRefetch(true);
    },
  };
};

const useSearchUserQuery = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetch, setRefetch] = useState(false);

  const fetchUser = async (name = "") => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/user/searchUser", {
        params: { name },
        withCredentials: true,
      });

      if (response.status === 200) {
        setData(response.data);
        setIsError(false);
        return response.data;
      } else {
        setError("Failed to search user");
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

  useEffect(() => {
    if (refetch) {
      fetchUser();
      setRefetch(false);
    }
  }, [refetch])

  return {
    searchUserQuery: fetchUser,
    data,
    isLoading,
    isError,
    error,
    refetch: () => {
      setRefetch(true);
    },
  };
}

const useGetMyNotificationsQuery = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetch, setRefetch] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/user/getMyNotifications", {
        withCredentials: true,
      });

      if (response.status === 200) {
        setData(response.data);
        setIsError(false);
      } else {
        setError("Failed to fetch notifications");
        setIsError(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
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

  useEffect(() => {
    if (refetch) {
      fetchNotifications();
      setRefetch(false);
    }
  }, [refetch])

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: () => {
      setRefetch(true);
    },
  };
}

const useGetChatDetailsQuery = ({ chatId, populate = true }: {
  chatId: string;
  populate?: boolean;
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetch, setRefetch] = useState(false);

  const fetchChatDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/chat/getChatDetails/${chatId}`, {
        params: { populate },
        withCredentials: true,
      });

      if (response.status === 200) {
        setData(response.data);
        setIsError(false);
      } else {
        setError("Failed to fetch chat details");
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

  useEffect(() => {
    if (refetch) {
      fetchChatDetails();
      setRefetch(false);
    }
  }, [refetch])

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: () => {
      setRefetch(true);
    },
  };
}

const useGetMessagesQuery = ({ chatId, page }: {
  chatId: string;
  page: number;
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetch, setRefetch] = useState(false);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/chat/getMessage/${chatId}`, {
        params: { page },
        withCredentials: true,
      });

      if (response.status === 200) {
        setData(response.data);
        setIsError(false);
      } else {
        setError("Failed to fetch messages");
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

  useEffect(() => {
    if (refetch) {
      fetchMessages();
      setRefetch(false);
    }
  }, [refetch])

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: () => {
      setRefetch(true);
    },
  };
}

const useGetMyGroupsQuery = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetch, setRefetch] = useState(false);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/chat/group", {
        withCredentials: true,
      });

      if (response.status === 200) {
        setData(response.data);
        setIsError(false);
      } else {
        setError("Failed to fetch groups");
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

  useEffect(() => {
    if (refetch) {
      fetchGroups();
      setRefetch(false);
    }
  }, [refetch])

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: () => {
      setRefetch(true);
    },
  };
}

const useGetAvailableFriendsQuery = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetch, setRefetch] = useState(false);

  const fetchAvailableFriends = async (chatId: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/user/getAvailableFriends", {
        params: { chatId },
        withCredentials: true,
      });

      if (response.status === 200) {
        setData(response.data);
        setIsError(false);
      } else {
        setError("Failed to fetch available friends");
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

  useEffect(() => {
    if (refetch) {
      fetchAvailableFriends("");
      setRefetch(false);
    }
  }, [refetch])

  return {
    data,
    isLoading,
    isError,
    error,
    fetch: (chatId: string) => {
      fetchAvailableFriends(chatId || "");
      if (!chatId) {
        setRefetch(true);
      }
    }
  };
}


export {
  useGetMyChatsQuery,
  useSearchUserQuery,
  useGetMyNotificationsQuery,
  useGetChatDetailsQuery,
  useGetMessagesQuery,
  useGetMyGroupsQuery,
  useGetAvailableFriendsQuery,
};

