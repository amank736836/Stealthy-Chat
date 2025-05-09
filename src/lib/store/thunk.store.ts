import { useToast } from "@/hooks/use-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const adminLogin = createAsyncThunk("admin/login", async (secretKey) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  };
  const { toast } = useToast();
  try {
    const { data } = await axios.post(`/admin/verify`, { secretKey }, config);
    if (data.success) {
      toast({
        title: "Success",
        description: data.message,
        variant: "default",
        duration: 1000,
      });
    } else {
      toast({
        title: "Error",
        description: data.message,
        variant: "destructive",
        duration: 1000,
      });
    }
    return data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response &&
      error.response.data &&
      error.response.data.message
    ) {
      toast({
        title: "Error",
        description: error.response.data.message,
        variant: "destructive",
        duration: 1000,
      });
    } else if (error instanceof Error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 1000,
      });
    } else {
      toast({
        title: "Error",
        description: "An unknown error occurred",
        variant: "destructive",
        duration: 1000,
      });
    }
  }
});

const getAdmin = createAsyncThunk("admin/getAdmin", async () => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  };
  const { toast } = useToast();
  try {
    const { data } = await axios.get(`/admin`, config);
    if (data.success) {
      toast({
        title: "Success",
        description: data.message,
        variant: "default",
        duration: 1000,
      });
    } else {
      toast({
        title: "Error",
        description: data.message,
        variant: "destructive",
        duration: 1000,
      });
    }
    return data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response &&
      error.response.data &&
      error.response.data.message
    ) {
      toast({
        title: "Error",
        description: error.response.data.message,
        variant: "destructive",
        duration: 1000,
      });
    } else if (error instanceof Error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 1000,
      });
    } else {
      toast({
        title: "Error",
        description: "An unknown error occurred",
        variant: "destructive",
        duration: 1000,
      });
    }
  }
});

const adminLogout = createAsyncThunk("admin/logout", async () => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  };
  const { toast } = useToast();
  try {
    const { data } = await axios.get(`/admin/logout`, config);
    if (data.success) {
      toast({
        title: "Success",
        description: data.message,
        variant: "default",
        duration: 1000,
      });
    } else {
      toast({
        title: "Error",
        description: data.message,
        variant: "destructive",
        duration: 1000,
      });
    }
    return data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response &&
      error.response.data &&
      error.response.data.message
    ) {
      toast({
        title: "Error",
        description: error.response.data.message,
        variant: "destructive",
        duration: 1000,
      });
    } else if (error instanceof Error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 1000,
      });
    } else {
      toast({
        title: "Error",
        description: "An unknown error occurred",
        variant: "destructive",
        duration: 1000,
      });
    }
  }
});

export { adminLogin, getAdmin, adminLogout };
