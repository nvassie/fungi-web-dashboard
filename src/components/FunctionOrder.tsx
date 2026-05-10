import {
  userCustomFunctionGroupsAtom,
  userCustomFunctionsRunOrderAtom,
} from "@/jotai";
import { useSortable } from "@dnd-kit/react/sortable";
import { useDroppable } from "@dnd-kit/react";
import { useAtomValue, useSetAtom } from "jotai";
import { GripVertical } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortableProps {
  id: string;
  index: number;
}

function Sortable({ id, index }: SortableProps) {
  const { ref } = useSortable({ id, index });
  const userCustomFunctionGroups = useAtomValue(userCustomFunctionGroupsAtom);
  const setUserCustomFunctionsRunOrder = useSetAtom(
    userCustomFunctionsRunOrderAtom,
  );
  const userCustomFunctionsRunOrder = useAtomValue(
    userCustomFunctionsRunOrderAtom,
  );

  const groupFunctions = useMemo(() => {
    if (userCustomFunctionGroups) {
      const filteredFunctions = userCustomFunctionGroups.find(
        (functions) => functions.id === id,
      )?.content.functions;
      return filteredFunctions;
    }
    return null;
  }, [id, userCustomFunctionGroups]);

  return (
    <li
      ref={ref}
      className="flex cursor-grab items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted active:cursor-grabbing"
    >
      <div className="flex items-center gap-3">
        <GripVertical
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        <span className="min-w-0 truncate">{id}</span>
      </div>
      {groupFunctions && groupFunctions.length > 0 && (
        <Select
          value={
            userCustomFunctionsRunOrder.find((item) => item.type === id)
              ?.functionName ?? "None"
          }
          onValueChange={(value) =>
            setUserCustomFunctionsRunOrder((prev) =>
              prev.map((item) =>
                item.type === id ? { ...item, functionName: value } : item,
              ),
            )
          }
        >
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select function" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{id} Functions</SelectLabel>
              <SelectItem value="None">None</SelectItem>
              {groupFunctions.map((func) => (
                <SelectItem value={func.name}>{func.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </li>
  );
}

function FunctionOrder() {
  const userCustomFunctionsRunOrder = useAtomValue(
    userCustomFunctionsRunOrderAtom,
  );

  const { ref } = useDroppable({
    id: "function-order-droppable",
  });

  return (
    <Card className="mb-5">
      <CardHeader>
        <CardTitle>Function Run Order</CardTitle>
        <CardDescription>
          Drag and drop the function groups to change the order of when selected
          function for each group is run.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul ref={ref} className="flex min-h-32 flex-col gap-2">
          {userCustomFunctionsRunOrder.length > 0 ? (
            userCustomFunctionsRunOrder.map((id, index) => (
              <Sortable key={id.type} id={id.type} index={index} />
            ))
          ) : (
            <li className="grid min-h-32 place-items-center rounded-md border border-dashed text-sm text-muted-foreground">
              Add a function group.
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

export default FunctionOrder;
