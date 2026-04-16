import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { IDockviewHeaderActionsProps } from "dockview";
import {
  Plus,
  ChartSpline,
  FlaskConical,
  Settings,
  FileChartLine,
  ChartLine,
} from "lucide-react";
import { useState } from "react";

export default function AddPanels({ props }: IDockviewHeaderActionsProps) {
  const [modalStatus, setModalStatus] = useState<boolean>(false);

  const onClick = (panel: string) => {
    props.containerApi.addPanel({
      id: Math.random().toString(),
      title: `${panel.charAt(0).toLocaleUpperCase() + panel.slice(1)}`,
      component: panel,
      position: { referenceGroup: props.group },
    });
    setModalStatus(false);
  };

  return (
    <Dialog open={modalStatus} onOpenChange={setModalStatus}>
      <DialogTrigger asChild>
        <Plus
          onClick={() => setModalStatus(true)}
          className="text-white w-9 mt-[5px] h-6"
        />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a panel</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col">
          <Button onClick={() => onClick("Graph")}>
            <ChartSpline className="text-black" />
            <p className="text-black">Graph</p>
          </Button>
          <Button onClick={() => onClick("graphsetting")}>
            <FileChartLine className="text-black" />
            <p className="text-black">Graph Settings</p>
          </Button>
          <Button onClick={() => onClick("usersetting")}>
            <Settings className="text-black" />
            <p className="text-black">User Settings</p>
          </Button>
          <Button onClick={() => onClick("home")}>
            <FlaskConical className="text-black" />
            <p className="text-black">Home Panel</p>
          </Button>
          <Button onClick={() => onClick("spike")}>
            <ChartLine className="text-black" />
            <p className="text-black">Spike Panel</p>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
