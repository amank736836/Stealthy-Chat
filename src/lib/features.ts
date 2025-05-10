"use client";
import moment from "moment";

// Sets for quick lookup
const videoExtensions = new Set(["mp4", "webm", "mkv", "avi", "mov", "flv", "wmv"]);
const audioExtensions = new Set(["mp3", "wav", "aac", "m4a", "flac", "mpeg"]);
const imageExtensions = new Set(["jpg", "jpeg", "png", "gif", "webp"]);

const fileFormat = (url: string = ""): "video" | "audio" | "image" | "file" => {
  const extension = url.split(".").pop()?.toLowerCase() || "";

  if (videoExtensions.has(extension)) return "video";
  if (audioExtensions.has(extension)) return "audio";
  if (imageExtensions.has(extension)) return "image";

  return "file";
};

const transformImageUrl = (url: string = "", width: number = 100): string =>
  url.replace("upload", `upload/dpr_auto/w_${width}`);

const getLast7Days = (): string[] => {
  const days: string[] = [];
  const today = moment();

  for (let i = 0; i < 7; i++) {
    days.unshift(today.clone().subtract(i + 1, "days").format("dddd"));
  }

  return days;
};

type StorageOptions = {
  key: string;
  value?: unknown;
  get: boolean;
};

const getOrSaveFromStorage = ({ key, value, get }: StorageOptions): unknown => {
  if (typeof window === "undefined") return null;

  if (get) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } else if (value !== undefined) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export { fileFormat, transformImageUrl, getLast7Days, getOrSaveFromStorage };
