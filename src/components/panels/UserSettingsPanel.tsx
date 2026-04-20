import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "../ui/label";
import {
  Dialog,
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

export default function UserSettingsPanel() {
  const [addFunctionCode, setAddFunctionCode] = useState<string>("");
  const [userSpikeFunctions, setSpikeUserFunctions] = useAtom(
    userSpikeFunctionsAtom,
  );

  return (
    <div className="flex-col space-y-2">
      <Card className="m-5 bg-gray-300">
        <CardHeader>
          <CardTitle>Spike Detection</CardTitle>
        </CardHeader>
        <CardContent className="flex-col">
          <Label>Functions</Label>
          {userSpikeFunctions.map((func) => (
            <pre>{`function detectSpikes(data) {\n  ${func}\n}`}</pre>
          ))}
          <Dialog>
            <DialogTrigger>Add Function</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Function</DialogTitle>
              </DialogHeader>
              <p>
                {`function detectSpikes(data) {
                  YOUR CODE
                  return spikes
                }`}
              </p>
              <Textarea
                value={addFunctionCode}
                onChange={(e) => setAddFunctionCode(e.target.value)}
              />
              <Button
                className="text-black"
                onClick={() => {
                  setSpikeUserFunctions((prev) => [...prev, addFunctionCode]);
                  setAddFunctionCode("");
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
