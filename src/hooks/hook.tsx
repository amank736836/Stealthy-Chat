import { useEffect } from "react";
import { useToast } from "./use-toast";

const useErrors = (
  errors: {
    isError: boolean;
    error: any;
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

export default useErrors;
