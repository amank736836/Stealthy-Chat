import { transformImageUrl } from "@/lib/features";
import { FileOpen as FileOpenIcon } from "@mui/icons-material";
import React from "react";

interface RenderAttachmentProps {
  fileType: string;
  url: string;
}

const RenderAttachment = (fileType: RenderAttachmentProps['fileType'], url: RenderAttachmentProps['url']): React.ReactElement => {
  switch (fileType) {
    case "video":
      return (
        <video src={url} controls style={{ width: "100%" }} preload="auto" />
      );
    case "image":
      return (
        <img
          src={transformImageUrl(url, 200)}
          alt="attachment"
          width={"200px"}
          height={"150px"}
          style={{ objectFit: "contain" }}
        />
      );
    case "audio":
      return <audio src={url} controls preload="auto" />;
    default:
      return <FileOpenIcon />;
  }
};

export default RenderAttachment;
