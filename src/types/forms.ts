export type FileType = "image" | "doc" | "pdf" | "video" | "sheet";

export type FileObject = {
  view?: string; // string value to be provided image component
  type?: FileType; // the type group of the uploaded file
  file?: File; // the uploaded file
  url?: string; // the url where the file is temporarily stored
};
