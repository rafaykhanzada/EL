import React from "react";
import FileViewer from "react-file-viewer";

interface DocumentViewerProps {
  blob: Blob;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ blob }) => {
  const url = URL.createObjectURL(blob);

  const onError = (e: any) => {
    console.error(e);
  };

  return <FileViewer fileType={'docx'} filePath={url} onError={onError} />;
};

export default DocumentViewer;
