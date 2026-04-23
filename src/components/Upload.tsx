import type { FileInfo } from "@/types";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Loader } from "lucide-react";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";

interface UploadProps {
  fileInfo: FileInfo;
  setFileInfo: React.Dispatch<React.SetStateAction<FileInfo | undefined>>;
  setFileContent: React.Dispatch<React.SetStateAction<string | undefined>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setHeaders: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function Upload({
  fileInfo,
  setFileInfo,
  setFileContent,
  loading,
  setLoading,
  setHeaders,
}: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState<string>();
  const [date, setDate] = useState<string>();
  const [stringHeaders, setStringHeaders] = useState<string>();
  const [extension, setExtension] = useState<string>();
  const [fileHasHeaders, setFileHasHeaders] = useState<boolean>(false);

  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const tempFile = e.target.files[0];
      // maybe move to regex
      const tempExtension = tempFile.name.slice(-4);
      setExtension(tempExtension);
      if (tempExtension === ".lvm") {
        setStartTime(tempFile.name.slice(-8, -4));
        setDate(tempFile.name.slice(-17, -9));
        // const tempFileInfo: FileInfo = {
        //   baseInfo: tempFile,
        //   extension,
        //   startTime,
        //   date,
        // };
        // setFileInfo(tempFileInfo);
      } else if (tempExtension === ".csv") {
        setStartTime("1600");
        setDate("25-05-20");
        // const tempFileInfo: FileInfo = {
        //   baseInfo: tempFile,
        //   extension,
        //   startTime: "1600",
        //   date: "25-05-20",
        // };
        // setFileInfo(tempFileInfo);
      }
      setFile(tempFile);
    }
  };

  const handleUpload = () => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (
        event.target &&
        stringHeaders &&
        file &&
        extension &&
        startTime &&
        date
      ) {
        setLoading(true);
        const tempFileInfo: FileInfo = {
          baseInfo: file,
          extension,
          startTime,
          date,
        };
        const headers = stringHeaders.split(",");
        setHeaders(headers);
        setFileInfo(tempFileInfo);
        setFileContent(event.target.result);
      }
    };

    reader.readAsText(file);
  };

  // const checkHeaders = () => {
  //   const reader = new FileReader();

  //   reader.onload = (event) => {
  //     if (event.target) {
  //       const content = event.target.result;
  //       if (content) {
  //         if (extension === ".lvm") {
  //           const lines = content.split(/\r?\n/);
  //           const headers = lines[1].trim().split(/\s+/);

  //         } else if (extension === ".csv") {
  //         }
  //       }
  //     }
  //   };

  //   reader.readAsText(file);
  // };

  return (
    <div className="pt-20">
      <input
        type="file"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <div className="text-white pb-3">
        {file ? (
          <div className="flex flex-col">
            <p>{`Name: ${file.name}`}</p>
            <p>{`Size: ${file.size}`}</p>
            <div className="flex flex-col gap-3 m-5">
              <p className="font-semibold">Parameters</p>
              <div className="flex items-center">
                <p className="flex-1">Recording start time:</p>
                <Input
                  className="flex-4 bg-white text-black"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="Set start time"
                />
              </div>
              <div className="flex items-center">
                <p className="flex-1">Recording date:</p>
                <Input
                  className="flex-4 bg-white text-black"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Set date"
                />
              </div>
              <div className="flex items-center justify-center gap-5">
                <p>
                  Enter headers for the file in the format header1,header2,...
                </p>
                <Switch
                  checked={fileHasHeaders}
                  onCheckedChange={setFileHasHeaders}
                />
              </div>
              <div className="flex items-center">
                <p className="flex-1">Headers:</p>
                <Input
                  className="flex-4 bg-white text-black"
                  disabled={fileHasHeaders}
                  type="text"
                  value={stringHeaders}
                  onChange={(e) => setStringHeaders(e.target.value)}
                  placeholder="Enter file headers."
                />
              </div>
            </div>
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
