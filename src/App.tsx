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
import { useEffect, useState } from "react";
import Upload from "./components/Upload";
import SpikePanel from "./components/panels/SpikePanel";

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
  upload: () => {
    return <Upload />;
  },
  spike: () => {
    return <SpikePanel />;
  },
};

const LeftComponent = (props: IDockviewHeaderActionsProps) => {
  return (
    <div>
      <AddPanels props={props} />
    </div>
  );
};

export default function App() {
  const onReady = (event: DockviewReadyEvent) => {
    event.api.addPanel({
      id: "Home",
      component: "home",
    });

    event.api.addPanel({
      id: "Graph",
      component: "Graph",
    });
  };

  return (
    <div className="App overflow-y-hidden">
      <TopBar />
      <DockviewReact
        className="dockview-theme-dark"
        onReady={onReady}
        components={components}
        leftHeaderActionsComponent={LeftComponent}
      />
    </div>
  );
}
