import { Button } from "./ui/button";

interface TopBarProps {
  saveLayout: () => void;
}

export default function TopBar({ saveLayout }: TopBarProps) {
  return (
    <div className="flex items-center h-14 pt-2 bg-[#000c18] px-4">
      <div className="flex-1" />
      <p className="flex-1 text-center text-white">Fungi Dashboard</p>
      <div className="flex flex-1 justify-end">
        <Button className="text-black" onClick={saveLayout}>
          Save Layout
        </Button>
      </div>
    </div>
  );
}
