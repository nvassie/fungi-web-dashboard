import { Button } from "./ui/button";

interface TopBarProps {
  saveLayout: () => void;
}

export default function TopBar({ saveLayout }: TopBarProps) {
  return (
    <header className="flex h-14 items-center border-b bg-sidebar px-4">
      <div className="flex-1" aria-hidden="true" />
      <p className="flex-1 text-center text-sm font-semibold tracking-normal text-sidebar-foreground">
        Fungi Dashboard
      </p>
      <div className="flex flex-1 justify-end">
        <Button onClick={saveLayout} size="sm">
          Save Layout
        </Button>
      </div>
    </header>
  );
}
