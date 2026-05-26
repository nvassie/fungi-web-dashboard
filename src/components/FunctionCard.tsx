import { userCustomFunctionGroupsAtom } from "@/jotai";
import { useAtom } from "jotai";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FunctionCardProps {
  id: string;
}

function FunctionCard({ id }: FunctionCardProps) {
  const [userCustomFunctionGroups, setUserCustomFunctionGroups] = useAtom(
    userCustomFunctionGroupsAtom,
  );
  const [editCode, setEditCode] = useState<string>("");
  const [addFunctionCode, setAddFunctionCode] = useState<string>("");
  const [addFunctionName, setAddFunctionName] = useState<string>("");

  const cardContent = useMemo(() => {
    if (id && userCustomFunctionGroups) {
      const content = userCustomFunctionGroups.find(
        (group) => group.id === id,
      )?.content;
      return content;
    }
    return null;
  }, [id, userCustomFunctionGroups]);

  return (
    cardContent && (
      <div className="mb-5">
        <Card>
          <CardHeader>
            <CardTitle>{cardContent.groupName}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                Functions
              </p>
              {cardContent.functions.map((func) => (
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
                                setUserCustomFunctionGroups((prev) =>
                                  prev.map((group) =>
                                    group.id === id
                                      ? {
                                          ...group,
                                          content: {
                                            ...group.content,
                                            functions:
                                              group.content.functions.map(
                                                (prevFunc) =>
                                                  prevFunc.name === func.name
                                                    ? {
                                                        ...prevFunc,
                                                        code: editCode,
                                                      }
                                                    : prevFunc,
                                              ),
                                          },
                                        }
                                      : group,
                                  ),
                                );
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
                              setUserCustomFunctionGroups((prev) =>
                                prev.map((group) =>
                                  group.id === id
                                    ? {
                                        ...group,
                                        content: {
                                          ...group.content,
                                          functions:
                                            group.content.functions.filter(
                                              (prevFunc) =>
                                                prevFunc.name !== func.name,
                                            ),
                                        },
                                      }
                                    : group,
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
                    Your custom function must return the array of transformed
                    data that is the same length of the values of the provided
                    input (all the graph data).
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
                    setUserCustomFunctionGroups((prev) =>
                      prev.map((group) =>
                        group.id === id
                          ? {
                              ...group,
                              content: {
                                ...group.content,
                                functions: [
                                  ...group.content.functions,
                                  {
                                    name: addFunctionName,
                                    code: addFunctionCode,
                                  },
                                ],
                              },
                            }
                          : group,
                      ),
                    );
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
    )
  );
}

export default FunctionCard;
