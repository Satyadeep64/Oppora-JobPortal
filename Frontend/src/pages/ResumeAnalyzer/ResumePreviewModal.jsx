import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

import "./ResumePreviewModal.css";

pdfjs.GlobalWorkerOptions.workerSrc =
  new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

const ResumePreviewModal = ({ resume, onClose }) => {

  const [numPages, setNumPages] = useState(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);

  if (!resume) return null;

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (

    <div
      className="resume-modal-overlay"
      onClick={onClose}
    >

      <div
        className="resume-modal"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="resume-modal-header">

          <h2>{resume.fileName}</h2>
          <a
    href={`https://localhost:7054${resume.fileUrl}`}
    download
    className="download-btn"
>
    ⬇ Download
</a>

          <button onClick={onClose}>
            ✕
          </button>

        </div>

        <div className="resume-modal-body">

<iframe
  src={`https://localhost:7054${resume.fileUrl}`}
  width="100%"
  height="600px"
  style={{
    border: "none",
    borderRadius: "10px"
  }}
/>

        </div>

        <div className="preview-footer">
            <button
        onClick={() =>
            setScale(scale - 0.1)
        }
    >
        −
    </button>

    <span>
        {(scale*100).toFixed(0)}%
    </span>

    <button
        onClick={() =>
            setScale(scale + 0.1)
        }
    >
        +
    </button>

          <button
            disabled={pageNumber === 1}
            onClick={() =>
              setPageNumber(pageNumber - 1)
            }
          >
            Previous
          </button>

          <span>

            {pageNumber} / {numPages}

          </span>

          <button
            disabled={pageNumber === numPages}
            onClick={() =>
              setPageNumber(pageNumber + 1)
            }
          >
            Next
          </button>

        </div>

      </div>

    </div>

  );

};

export default ResumePreviewModal;