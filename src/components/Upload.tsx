import type { FileInfo } from "@/types";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Loader } from "lucide-react";

interface UploadProps {
  fileInfo: FileInfo;
  setFileInfo: React.Dispatch<React.SetStateAction<FileInfo | undefined>>;
  setFileContent: React.Dispatch<React.SetStateAction<string | undefined>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Upload({
  fileInfo,
  setFileInfo,
  setFileContent,
  loading,
  setLoading,
}: UploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const tempFile = e.target.files[0];
      // maybe move to regex
      const extension = tempFile.name.slice(-4);
      if (extension === ".lvm") {
        const startTime = tempFile.name.slice(-8, -4);
        const date = tempFile.name.slice(-17, -9);
        const tempFileInfo: FileInfo = {
          baseInfo: tempFile,
          extension,
          startTime,
          date,
        };
        setFileInfo(tempFileInfo);
      } else if (extension === ".csv") {
        const tempFileInfo: FileInfo = {
          baseInfo: tempFile,
          extension,
          startTime: "1600",
          date: "25-05-20",
        };
        setFileInfo(tempFileInfo);
      }
      setFile(tempFile);
    }
  };

  const handleUpload = () => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target) {
        setLoading(true);
        setFileContent(event.target.result);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="pt-20">
      <input
        type="file"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <div className="text-white pb-3">
        {fileInfo ? (
          <div className="flex flex-col">
            <p>{`Name: ${fileInfo.baseInfo.name}`}</p>
            <p>{`Size: ${fileInfo.baseInfo.size}`}</p>
            {loading && (
              <div className="flex gap-3 justify-center">
                <Loader className="animate-spin" />
                <p>Loading</p>
              </div>
            )}
          </div>
        ) : (
          <p>Select a file to upload.</p>
        )}
      </div>
      <div className="flex gap-3 justify-center">
        <Button onClick={handleClick} className="text-black">
          Select File
        </Button>
        <Button disabled={!file} onClick={handleUpload} className="text-black">
          Upload file
        </Button>
      </div>
    </div>
  );
}
