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

export default function AddPanels(props: IDockviewHeaderActionsProps) {
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
        <Button
          aria-label="Add panel"
          size="icon"
          title="Add panel"
          onClick={() => setModalStatus(true)}
          variant="ghost"
        >
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a panel</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Button className="justify-start" onClick={() => onClick("Graph")}>
            <ChartSpline />
            Graph
          </Button>
          <Button
            className="justify-start"
            onClick={() => onClick("graphsetting")}
          >
            <FileChartLine />
            Graph Settings
          </Button>
          <Button
            className="justify-start"
            onClick={() => onClick("usersetting")}
          >
            <Settings />
            User Settings
          </Button>
          <Button className="justify-start" onClick={() => onClick("home")}>
            <FlaskConical />
            Home Panel
          </Button>
          <Button className="justify-start" onClick={() => onClick("spike")}>
            <ChartLine />
            Spike Panel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
