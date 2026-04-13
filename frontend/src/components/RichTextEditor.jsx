import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const RichTextEditor = ({
  value,
  onChange,
  disabled = false,
  placeholder = "",
}) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Quill
    quillRef.current = new Quill(containerRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          ["bold", "italic", "underline"],
          [{ header: 1 }, { header: 2 }],
          ["blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
      },
      placeholder,
      readOnly: disabled,
    });

    // Set initial content
    if (value) {
      quillRef.current.root.innerHTML = value;
    }

    // Handle changes
    const handler = () => {
      const html = quillRef.current.root.innerHTML;
      const text = quillRef.current.getText();
      onChange({ html, text });
    };

    quillRef.current.on("text-change", handler);

    return () => {
      if (quillRef.current) {
        quillRef.current.off("text-change", handler);
      }
    };
  }, []);

  return (
    <div className="rich-text-editor">
      <style>{`
        .ql-container {
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 0.75rem;
          font-size: 16px;
          color: white;
        }
        .ql-editor {
          min-height: 300px;
          padding: 12px;
        }
        .ql-toolbar {
          background-color: rgba(255, 255, 255, 0.05);
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 0.75rem 0.75rem 0 0;
        }
        .ql-toolbar.ql-snow .ql-stroke {
          stroke: rgba(255, 255, 255, 0.5);
        }
        .ql-toolbar.ql-snow .ql-fill,
        .ql-toolbar.ql-snow .ql-stroke.ql-fill {
          fill: rgba(255, 255, 255, 0.5);
        }
        .ql-toolbar.ql-snow button:hover .ql-stroke,
        .ql-toolbar.ql-snow button:hover .ql-fill {
          stroke: white;
          fill: white;
        }
        .ql-toolbar.ql-snow button.ql-active .ql-stroke,
        .ql-toolbar.ql-snow button.ql-active .ql-fill {
          stroke: #60a5fa;
          fill: #60a5fa;
        }
        .ql-editor.ql-blank::before {
          color: rgba(255, 255, 255, 0.4);
        }
        .ql-editor {
          color: white;
        }
      `}</style>
      <div ref={containerRef} />
    </div>
  );
};

export default RichTextEditor;
