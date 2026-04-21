import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { Pencil, X } from "lucide-react";

export default function UserSettingsPanel() {
  const [addFunctionCode, setAddFunctionCode] = useState<string>("");
  const [addFunctionName, setAddFunctionName] = useState<string>("");
  const [userSpikeFunctions, setSpikeUserFunctions] = useAtom(
    userSpikeFunctionsAtom,
  );
  const [editCode, setEditCode] = useState<string>("");

  return (
    <div className="flex flex-col">
      <Card className="m-5 bg-gray-100">
        <CardHeader>
          <CardTitle>Spike Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p>Functions</p>
            {userSpikeFunctions.map((func) => (
              <div className="flex items-center justify-between">
                <p>{func.name}</p>
                <div className="flex gap-2">
                  {func.name !== "default" && (
                    <Dialog>
                      <DialogTrigger
                        asChild
                        onClick={() => setEditCode(func.code)}
                      >
                        <Pencil className="h-5 w-5" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit {func.name}</DialogTitle>
                          <DialogDescription>
                            Change function code.
                          </DialogDescription>
                        </DialogHeader>
                        <Textarea
                          value={editCode}
                          onChange={(e) => setEditCode(e.target.value)}
                        />
                        <div className="flex justify-end">
                          <Button
                            className="text-black"
                            onClick={() => {
                              setSpikeUserFunctions((prev) => [
                                ...prev.filter(
                                  (prevFuncs) => prevFuncs.name !== func.name,
                                ),
                                { name: func.name, code: editCode },
                              ]);
                              setEditCode("");
                            }}
                          >
                            Confirm
                          </Button>
                          <DialogClose asChild>
                            <Button className="text-black">Cancel</Button>
                          </DialogClose>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  {func.name !== "default" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <X className="h-5 w-5" />
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
                          <DialogClose asChild>
                            <Button className="text-black">Cancel</Button>
                          </DialogClose>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="text-black">Add Function</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Function</DialogTitle>
                <DialogDescription>
                  Your spike detecting function must return the indices of the
                  values of input (all the graph data) that are determined to be
                  part of a spike in an array. The rest of the processing will
                  be handled by the dashboard.
                </DialogDescription>
              </DialogHeader>
              <Label>Function format:</Label>
              <pre>
                {`function FUNCTION NAME(input) {
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
      {/* <Card className="m-5 bg-gray-300">
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
      </Card> */}
    </div>
  );
}
