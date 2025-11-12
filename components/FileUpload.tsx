
import React, { useRef } from 'react';

interface FileUploadProps {
  id: string;
  onFileContentSelect: (content: string) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ id, onFileContentSelect, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    // Reset file input to allow re-selecting the same file after an error
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'txt' || extension === 'md') {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onFileContentSelect(e.target.result as string);
          }
        };
        reader.readAsText(file);
      } else if (['doc', 'docx', 'pdf'].includes(extension || '')) {
        alert("Parsing Word and PDF documents is not yet supported. Please copy and paste the text or use a plain text (.txt) or Markdown (.md) file.");
      } else {
        alert("Unsupported file type. Please select a .txt, .md, .doc, .docx, or .pdf file.");
      }
    }
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  }

  return (
    <>
      <input
        id={id}
        type="file"
        accept=".txt,.md,.doc,.docx,.pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <button 
        onClick={handleClick}
        disabled={disabled}
        className="w-full bg-primary hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed">
        Upload from File
      </button>
    </>
  );
};

export default FileUpload;
