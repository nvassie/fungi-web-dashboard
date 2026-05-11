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
  runCustomFunctions?: boolean;
  setRunCustomFunctions?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Upload({
  setFileInfo,
  setFileContent,
  loading,
  setLoading,
  setHeaders,
  runCustomFunctions,
  setRunCustomFunctions,
}: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState<string>();
  const [date, setDate] = useState<string>();
  const [stringHeaders, setStringHeaders] = useState<string>();
  const [extension, setExtension] = useState<string>();
  const [fileHasHeaders, setFileHasHeaders] = useState<boolean>(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const tempFile = e.target.files[0];
      const tempExtension = tempFile.name.slice(-4);
      setExtension(tempExtension);
      if (tempExtension === ".lvm") {
        const nameWithoutExtension = tempFile.name.replace(".lvm", "");
        const parts = nameWithoutExtension.split("_");
        const tempStartTime = parts[parts.length - 1];
        const tempDate = parts[parts.length - 2];
        const hour = tempStartTime.slice(0, 2);
        const min = tempStartTime.slice(2, 4);
        setStartTime(`${hour}:${min}`);
        setDate(`20${tempDate}`);
      }
      setFile(tempFile);
      setUploadErrors([]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      return;
    }

    const missingFields: string[] = [];
    const trimmedHeaders = stringHeaders?.trim();
    const parsedHeaders =
      trimmedHeaders?.split(",").map((header) => header.trim()) ?? [];

    if (!startTime) {
      missingFields.push("Recording start time is required.");
    }

    if (!date) {
      missingFields.push("Recording date is required.");
    }

    if (!trimmedHeaders) {
      missingFields.push(
        fileHasHeaders
          ? "Headers could not be read from the file."
          : "Headers are required.",
      );
    } else if (parsedHeaders.some((header) => !header)) {
      missingFields.push("Headers must not contain empty values.");
    }

    if (missingFields.length > 0) {
      setUploadErrors(missingFields);
      return;
    }

    setUploadErrors([]);
    const reader = new FileReader();

    reader.onload = (event) => {
      if (
        event.target &&
        trimmedHeaders &&
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
        setHeaders(parsedHeaders);
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
                  value={startTime ?? ""}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="Set start time"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-[12rem_1fr] sm:items-center">
                <p className="text-sm text-muted-foreground">Recording date</p>
                <Input
                  type="date"
                  value={date ?? ""}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Set date"
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/50 px-3 py-2">
                <p className="text-sm text-muted-foreground">
                  Use headers from file
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
                  value={stringHeaders ?? ""}
                  onChange={(e) => setStringHeaders(e.target.value)}
                  placeholder="Enter file headers."
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/50 px-3 py-2">
                <p className="text-sm text-muted-foreground">
                  Run custom functions on upload
                </p>
                <Switch
                  checked={runCustomFunctions ?? false}
                  onCheckedChange={setRunCustomFunctions}
                />
              </div>
            </div>
            {loading && (
              <div className="flex gap-3 justify-center">
                <Loader className="animate-spin" />
                <p>Loading</p>
              </div>
            )}
            {uploadErrors.length > 0 && (
              <div
                className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                <p className="font-medium">Upload blocked</p>
                <ul className="mt-1 list-disc pl-5">
                  {uploadErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <p className="text-muted-foreground">Select a file to upload.</p>
          </div>
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
