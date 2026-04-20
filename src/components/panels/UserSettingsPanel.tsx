import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Button } from "../ui/button";
import { userSpikeFunctionsAtom } from "@/jotai";
import { useAtom } from "jotai";
import { Input } from "../ui/input";
import { X } from "lucide-react";

export default function UserSettingsPanel() {
  const [addFunctionCode, setAddFunctionCode] = useState<string>("");
  const [addFunctionName, setAddFunctionName] = useState<string>("");
  const [userSpikeFunctions, setSpikeUserFunctions] = useAtom(
    userSpikeFunctionsAtom,
  );

  return (
    <div className="flex flex-col">
      <Card className="m-5 bg-gray-300">
        <CardHeader>
          <CardTitle>Spike Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p>Functions</p>
            {userSpikeFunctions.map((func) => (
              <div className="flex items-center justify-between">
                <p>{func.name}</p>
                {func.name !== "default" && (
                  <Dialog>
                    <DialogTrigger>
                      <X className="h-4 w-4" />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove {func.name}</DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-end">
                        <Button
                          className="text-black"
                          onClick={() =>
                            setSpikeUserFunctions((prev) =>
                              prev.filter(
                                (prevFns) => prevFns.name !== func.name,
                              ),
                            )
                          }
                        >
                          Confirm
                        </Button>
                        <DialogClose>Cancel</DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ))}
          </div>
          <Dialog>
            <DialogTrigger>Add Function</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Function</DialogTitle>
              </DialogHeader>
              <pre>
                {`function detectSpikes(data) {
                  YOUR CODE
                }`}
              </pre>
              <Label>Function name:</Label>
              <Input
                value={addFunctionName}
                onChange={(e) => setAddFunctionName(e.target.value)}
              />
              <Label>Function code:</Label>
              <Textarea
                value={addFunctionCode}
                onChange={(e) => setAddFunctionCode(e.target.value)}
              />
              <Button
                className="text-black"
                onClick={() => {
                  setSpikeUserFunctions((prev) => [
                    ...prev,
                    { name: addFunctionName, code: addFunctionCode },
                  ]);
                  setAddFunctionCode("");
                  setAddFunctionName("");
                }}
              >
                Save Code
              </Button>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      <Card className="m-5 bg-gray-300">
        <CardHeader>
          <CardTitle>Other</CardTitle>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
      <Card className="m-5 bg-gray-300">
        <CardHeader>
          <CardTitle>User</CardTitle>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </div>
  );
}
