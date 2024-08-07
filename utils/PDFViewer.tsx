import { Viewer } from "@react-pdf-viewer/core";
import { Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

interface IProps {
  file: string;
}

const PDFViewer = ({ file }: IProps) => {
  return (
    <>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js"></Worker>
      <div className="w-full">
        <Viewer fileUrl={file} />
      </div>
    </>
  );
};

export default PDFViewer;
