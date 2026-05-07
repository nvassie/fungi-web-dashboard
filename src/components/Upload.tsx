import type { FileInfo } from "@/types";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Loader } from "lucide-react";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";

interface UploadProps {
  fileInfo?: FileInfo;
  setFileInfo: React.Dispatch<React.SetStateAction<FileInfo | undefined>>;
  setFileContent: React.Dispatch<React.SetStateAction<string | undefined>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setHeaders: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function Upload({
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

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const tempFile = e.target.files[0];
      // maybe move to regex
      const tempExtension = tempFile.name.slice(-4);
      setExtension(tempExtension);
      const tempStartTime = tempFile.name.slice(-8, -4);
      const tempDate = tempFile.name.slice(-17, -9);
      const hour = tempStartTime.slice(0, 2);
      const min = tempStartTime.slice(2, 4);
      setStartTime(`${hour}:${min}`);
      setDate(`20${tempDate}`);
      setFile(tempFile);
    }
  };

  const handleUpload = () => {
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      if (
        event.target &&
        (stringHeaders || fileHasHeaders) &&
        file &&
        extension &&
        startTime &&
        date
      ) {
        const content =
          typeof event.target.result === "string" ? event.target.result : "";

        if (!content) {
          return;
        }

        setLoading(true);
        const tempFileInfo: FileInfo = {
          baseInfo: file,
          extension,
          startTime,
          date,
        };
        if (stringHeaders) {
          const headers = stringHeaders.split(",");
          setHeaders(headers);
        }
        setFileInfo(tempFileInfo);
        setFileContent(content);
      }
    };

    reader.readAsText(file);
  };

  useEffect(() => {
    if (file && extension) {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target) {
          const content = event.target.result;
          if (typeof content === "string") {
            if (extension === ".lvm") {
              const lines = content.split(/\r?\n/);
              const headers = lines[0].trim().split(/\s+/);
              let placeholderHeaders = "";
              if (fileHasHeaders) {
                headers.forEach((header, index) => {
                  placeholderHeaders +=
                    index === 0 ? `${header}` : `,${header}`;
                });
              } else {
                headers.forEach((_header, index) => {
                  placeholderHeaders +=
                    index === 0 ? `Time` : `,header ${index}`;
                });
              }
              setStringHeaders(placeholderHeaders);
            } else if (extension === ".csv") {
              const lines = content.split(/\r?\n/);
              const headers = lines[0].trim().split(",");
              let placeholderHeaders = "";
              if (fileHasHeaders) {
                headers.forEach((header, index) => {
                  placeholderHeaders +=
                    index === 0 ? `${header}` : `,${header}`;
                });
              } else {
                headers.forEach((_header, index) => {
                  placeholderHeaders +=
                    index === 0 ? `Time` : `,header ${index}`;
                });
              }
              setStringHeaders(placeholderHeaders);
            }
          }
        }
      };

      const blob = file.slice(0, 2048);
      reader.readAsText(blob);
    }
  }, [extension, file, fileHasHeaders]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <input
        type="file"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <div className="pb-4">
        {file ? (
          <div className="grid gap-4 rounded-lg border bg-card p-4 text-card-foreground">
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{`${file.size.toLocaleString()} bytes`}</p>
            </div>
            <div className="grid gap-3">
              <p className="text-sm font-semibold">Parameters</p>
              <div className="grid gap-2 sm:grid-cols-[12rem_1fr] sm:items-center">
                <p className="text-sm text-muted-foreground">
                  Recording start time
                </p>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="Set start time"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-[12rem_1fr] sm:items-center">
                <p className="text-sm text-muted-foreground">Recording date</p>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Set date"
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/50 px-3 py-2">
                <p className="text-sm text-muted-foreground">
                  Enter headers for the file in the format header1,header2,...
                </p>
                <Switch
                  checked={fileHasHeaders}
                  onCheckedChange={setFileHasHeaders}
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-[12rem_1fr] sm:items-center">
                <p className="text-sm text-muted-foreground">Headers</p>
                <Input
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
          <p className="text-muted-foreground">Select a file to upload.</p>
        )}
      </div>
      <div className="flex gap-3 justify-center">
        <Button onClick={handleClick}>Select File</Button>
        <Button disabled={!file} onClick={handleUpload}>
          Upload file
        </Button>
      </div>
    </div>
  );
}
