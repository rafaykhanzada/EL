import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  blob: Blob;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ blob }) => {
  const [numPages, setNumPages] = useState<number | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (err: any) => {
    console.log(err);
  }
  return (
    <div>
      <Document file={blob} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError}>
        {Array.from(new Array(numPages), (el, index) => (
          <Page width={900} key={`page_${index + 1}`} pageNumber={index + 1} renderAnnotationLayer={false}
            renderTextLayer={false} />
        ))}
      </Document>
    </div>
  );
};

export default PDFViewer;