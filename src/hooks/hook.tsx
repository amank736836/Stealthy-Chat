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
  get: boolean;
};

const useGetOrSaveFromStorage = ({
  key,
  value = [],
  fallbackValue = [],
  get = true,
}: StorageOptions) => {
  const [item, setItem] = useState(fallbackValue);


  useEffect(() => {
    const storedItem = localStorage.getItem(key);
    if (storedItem) {
      setItem(JSON.parse(storedItem));
    }
  }, [key]);


  if (get) {
    return item;
  } else {
    localStorage.setItem(key, JSON.stringify(value));
    setItem(value);
    return item;
  }



};

export { useErrors, useGetOrSaveFromStorage };

