import { Upload } from "./scripts/upload";
import { onDownload } from "./scripts/helpers";
import "./theme.css";

new Upload({
  inputSelector: "#file",
  previewContainerSelector: ".card",
  multi: true,
  accept: [".png", ".jpeg", ".jpg", ".gif"],
  onDownload,
});
