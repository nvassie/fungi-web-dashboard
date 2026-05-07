import {
  DockviewReact,
  type DockviewReadyEvent,
  type IDockviewHeaderActionsProps,
  type IDockviewPanelProps,
} from "dockview";
import "./styles.css";
import "dockview/dist/styles/dockview.css";
import GraphPanel from "./components/panels/GraphPanel";
import TopBar from "./components/TopBar";
import AddPanels from "./components/AddPanels";
import TestPanel from "./components/panels/TestPanel";
import UserSettingsPanel from "./components/panels/UserSettingsPanel";
import GraphSettingsPanel from "./components/panels/GraphSettingsPanel";
import { useEffect, useRef, useState } from "react";
import SpikePanel from "./components/panels/SpikePanel";
import { DevTools } from "jotai-devtools";
import "jotai-devtools/styles.css";

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
  graphsetting: () => {
    return <GraphSettingsPanel />;
  },
  usersetting: () => {
    return <UserSettingsPanel />;
  },
  home: () => {
    return <TestPanel />;
  },
  spike: () => {
    return <SpikePanel />;
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
  const dockviewRef = useRef<any>(null);

  const onReady = (event: DockviewReadyEvent) => {
    dockviewRef.current = event.api;

    const saved = localStorage.getItem("layout");

    if (saved) {
      dockviewRef.current.fromJSON(JSON.parse(saved));
    } else {
      event.api.addPanel({
        id: "Home",
        component: "home",
      });

      event.api.addPanel({
        id: "Graph",
        component: "Graph",
      });
    }
  };

  const saveLayout = () => {
    const currentLayout = dockviewRef.current.toJSON();
    localStorage.setItem("layout", JSON.stringify(currentLayout));
  };

  return (
    <>
      <DevTools />
      <div className="App overflow-y-hidden">
        <TopBar saveLayout={saveLayout} />
        <DockviewReact
          className="dockview-theme-dark"
          onReady={onReady}
          components={components}
          leftHeaderActionsComponent={LeftComponent}
        />
      </div>
    </>
  );
}
