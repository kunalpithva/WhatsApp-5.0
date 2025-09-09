import { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";

export default function RichTextEditorComponent({ value, onChange }) {
    const editorRef = useRef(null);
    const quillRef = useRef(null); // To store the Quill instance

    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            const editor = new Quill(editorRef.current, {
                theme: "snow",
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        [{ 'indent': '-1' }, { 'indent': '+1' }],
                        ['link', 'image'],
                        ['clean']
                    ]
                }
            });
            quillRef.current = editor; // Store the Quill instance

            // Add a class to the editor container
            editor.container.classList.add("custom-editor");

            // Set initial content
            if (value) {
                editor.clipboard.dangerouslyPasteHTML(value);
            }

            // Handle text changes
            editor.on("text-change", () => {
                if (onChange) {
                    onChange(editor.root.innerHTML);
                }
            });
        }
    }, [onChange, value]);

    // Update Quill content if the value prop changes externally
    useEffect(() => {
        if (quillRef.current && value !== quillRef.current.root.innerHTML) {
            quillRef.current.clipboard.dangerouslyPasteHTML(value);
        }
    }, [value]);

    return <div ref={editorRef} style={{ height: '100%' }} />;
}
