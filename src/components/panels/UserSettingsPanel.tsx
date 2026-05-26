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
import {
  userCustomFunctionGroupsAtom,
  userCustomFunctionsRunOrderAtom,
  userSpikeFunctionsAtom,
} from "@/jotai";
import { useAtom } from "jotai";
import { Input } from "../ui/input";
import { Pencil, X } from "lucide-react";
import FunctionCard from "../FunctionCard";
import FunctionOrder from "../FunctionOrder";

export default function UserSettingsPanel() {
  const [addFunctionCode, setAddFunctionCode] = useState<string>("");
  const [addFunctionName, setAddFunctionName] = useState<string>("");
  const [addFunctionGroupName, setAddFunctionGroupName] = useState<string>("");
  const [userSpikeFunctions, setSpikeUserFunctions] = useAtom(
    userSpikeFunctionsAtom,
  );
  const [userCustomFunctionGroups, setUserCustomFunctionGroups] = useAtom(
    userCustomFunctionGroupsAtom,
  );
  const [userCustomFunctionsRunOrder, setUserCustomFunctionsRunOrder] = useAtom(
    userCustomFunctionsRunOrderAtom,
  );
  const [editCode, setEditCode] = useState<string>("");

  return (
    <div className="panel-content min-h-0 h-full overflow-y-auto">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Spike Detection</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                Functions
              </p>
              {userSpikeFunctions.map((func) => (
                <div
                  className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2"
                  key={func.name}
                >
                  <p className="font-medium">{func.name}</p>
                  <div className="flex gap-2">
                    {func.name !== "default" && (
                      <Dialog>
                        <DialogTrigger
                          asChild
                          onClick={() => setEditCode(func.code)}
                        >
                          <Button
                            aria-label={`Edit ${func.name}`}
                            size="icon"
                            title={`Edit ${func.name}`}
                            variant="ghost"
                          >
                            <Pencil />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto]">
                          <DialogHeader>
                            <DialogTitle>Edit {func.name}</DialogTitle>
                            <DialogDescription>
                              Change function code.
                            </DialogDescription>
                          </DialogHeader>
                          <Textarea
                            className="min-h-48 min-w-0 overflow-y-auto font-mono text-sm [field-sizing:fixed]"
                            value={editCode}
                            onChange={(e) => setEditCode(e.target.value)}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
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
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    {func.name !== "default" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            aria-label={`Remove ${func.name}`}
                            size="icon"
                            title={`Remove ${func.name}`}
                            variant="ghost"
                          >
                            <X />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remove {func.name}</DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-end gap-2">
                            <Button
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
                              <Button variant="outline">Cancel</Button>
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
                <Button className="w-fit">Add Function</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Function</DialogTitle>
                  <DialogDescription>
                    Your spike detecting function must return the indices of the
                    values of input (all the graph data) that are determined to
                    be part of a spike in an array. The rest of the processing
                    will be handled by the dashboard.
                  </DialogDescription>
                </DialogHeader>
                <Label>Function format:</Label>
                <pre className="overflow-x-auto rounded-md border bg-muted p-3 text-sm text-muted-foreground">
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
                  className="min-h-48 font-mono text-sm"
                  value={addFunctionCode}
                  onChange={(e) => setAddFunctionCode(e.target.value)}
                />
                <Button
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
      </div>
      <div className="mt-5 mb-5">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Function Group</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Function Group</DialogTitle>
              <DialogDescription>
                Add a new group for functions that can be ran on the data (e.g.
                normalising)
              </DialogDescription>
              <Label>Function group name:</Label>
              <Input
                value={addFunctionGroupName}
                onChange={(e) => setAddFunctionGroupName(e.target.value)}
              />
              <Button
                onClick={() => {
                  setUserCustomFunctionGroups((prev) => [
                    ...prev,
                    {
                      id: addFunctionGroupName,
                      content: {
                        groupName: addFunctionGroupName,
                        functions: [],
                      },
                    },
                  ]);
                  setUserCustomFunctionsRunOrder((prev) => [
                    ...prev,
                    {
                      type: addFunctionGroupName,
                      functionName: "None",
                    },
                  ]);
                  setAddFunctionGroupName("");
                }}
              >
                Add function group
              </Button>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      {userCustomFunctionGroups && <FunctionOrder />}
      {userCustomFunctionGroups &&
        userCustomFunctionGroups.map((group) => (
          <FunctionCard id={group.id} key={group.id} />
        ))}
    </div>
  );
}
