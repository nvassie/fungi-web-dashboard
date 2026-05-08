import { userCustomFunctionsRunOrderAtom } from "@/jotai";
import { useSortable } from "@dnd-kit/react/sortable";
import { useDroppable } from "@dnd-kit/react";
import { useAtom } from "jotai";

function Sortable({ id, index }) {
  const { ref } = useSortable({ id, index });

  return (
    <li
      ref={ref}
      className="cursor-grab rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 active:cursor-grabbing"
    >
      {id}
    </li>
  );
}

function FunctionOrder() {
  const [userCustomFunctionsRunOrder] = useAtom(
    userCustomFunctionsRunOrderAtom,
  );

  const { ref } = useDroppable({
    id: "function-order-droppable",
  });

  return (
    <div className="w-full max-w-md rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Function run order
      </h3>

      <ul ref={ref} className="flex min-h-32 flex-col gap-2">
        {userCustomFunctionsRunOrder.map((id, index) => (
          <Sortable key={id} id={id} index={index} />
        ))}
      </ul>
    </div>
  );
}

export default FunctionOrder;
