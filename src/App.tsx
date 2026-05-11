import {
  DockviewReact,
  type DockviewApi,
  type DockviewReadyEvent,
  type IDockviewHeaderActionsProps,
  type IDockviewPanelProps,
} from "dockview";
import "./styles.css";
import "dockview/dist/styles/dockview.css";
import GraphPanel from "./components/panels/GraphPanel";
import TopBar from "./components/TopBar";
import AddPanels from "./components/AddPanels";
import UserSettingsPanel from "./components/panels/UserSettingsPanel";
import { useEffect, useRef, useState } from "react";
import SpikePanel from "./components/panels/SpikePanel";
import { DevTools } from "jotai-devtools";
import "jotai-devtools/styles.css";
import { v4 as uuidv4 } from "uuid";

const components = {
  default: (props: IDockviewPanelProps) => {
    return <div>{props.api.title}</div>;
  },
  Graph: (props: IDockviewPanelProps) => {
    const [panelWidth, setPanelWidth] = useState(props.api.width);
    const [panelHeight, setPanelHeight] = useState(props.api.height);

    useEffect(() => {
      const disposable = props.api.onDidDimensionsChange((event) => {
        setPanelWidth(event.width);
        setPanelHeight(event.height);
      });
      return () => {
        disposable.dispose();
      };
    }, [props.api]);

    return <GraphPanel props={props} width={panelWidth} height={panelHeight} />;
  },
  usersetting: () => {
    return <UserSettingsPanel />;
  },
  spike: (props: IDockviewPanelProps) => {
    return <SpikePanel props={props} />;
  },
};

const LeftComponent = (props: IDockviewHeaderActionsProps) => {
  return (
    <div>
      <AddPanels {...props} />
    </div>
  );
};

export default function App() {
  const dockviewRef = useRef<DockviewApi | null>(null);

  const onReady = (event: DockviewReadyEvent) => {
    dockviewRef.current = event.api;

    const saved = localStorage.getItem("layout");

    if (saved) {
      dockviewRef.current.fromJSON(JSON.parse(saved));
    } else {
      const graphId = uuidv4();

      event.api.addPanel({
        id: graphId,
        title: `Graph ${graphId.slice(0, 5)}`,
        component: "Graph",
      });
    }
  };

  const saveLayout = () => {
    if (!dockviewRef.current) {
      return;
    }

    const currentLayout = dockviewRef.current.toJSON();
    localStorage.setItem("layout", JSON.stringify(currentLayout));
  };

  return (
    <>
      <DevTools />
      <div className="App h-screen flex flex-col overflow-hidden">
        <TopBar saveLayout={saveLayout} />

        <div className="flex-1 min-h-0 overflow-hidden">
          <DockviewReact
            className="dockview-theme-dark h-full"
            onReady={onReady}
            components={components}
            leftHeaderActionsComponent={LeftComponent}
          />
        </div>
      </div>
    </>
  );
}
