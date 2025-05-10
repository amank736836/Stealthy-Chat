import { NewMessageAlert } from "@/lib/store/chat.reducer";
import { useEffect, useState } from "react";
import { useToast } from "./use-toast";

const useErrors = (
  errors: {
    isError: boolean;
    error: string | null;
  }[]
) => {
  const { toast } = useToast();
  return useEffect(() => {
    errors.forEach(({ isError, error }) => {
      if (isError) {
        toast({
          title: "Error",
          description:
            (error &&
              typeof error === "object" &&
              error !== null &&
              !Array.isArray(error) &&
              "data" in error &&
              (error as any).data?.message) ||
            (error &&
              typeof error === "object" &&
              error !== null &&
              !Array.isArray(error) &&
              "message" in error &&
              (error as any).message) ||
            "An unknown error occurred",
          variant: "destructive",
          duration: 2000,
        });
      }
    });
  }, [errors, toast]);
};


type StorageOptions = {
  key: string;
  value?: NewMessageAlert[];
  fallbackValue?: NewMessageAlert[];
};

const useGetOrSaveFromStorage = ({
  key,
  value,
  fallbackValue = [],
}: StorageOptions) => {
  const [item, setItem] = useState(fallbackValue);
  useEffect(() => {
    const stored = localStorage.getItem(key);
    setItem(stored ? JSON.parse(stored) : fallbackValue);
  }, [fallbackValue, key]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [item, value]);

  return {
    item,
    setItem,
  }
};

export { useErrors, useGetOrSaveFromStorage };

