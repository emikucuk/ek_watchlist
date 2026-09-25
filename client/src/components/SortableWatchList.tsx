import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SimpleGrid, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { WatchItem } from "../types";
import { WatchCard } from "./WatchCard";
import { useReorderItems } from "../hooks/useWatchlistApi";

interface SortableWatchListProps {
  items: WatchItem[];
  viewMode: "grid" | "list";
  rankingMode?: boolean;
  onEdit: (item: WatchItem) => void;
}

export function SortableWatchList({
  items,
  viewMode,
  rankingMode = false,
  onEdit,
}: SortableWatchListProps) {
  const [localItems, setLocalItems] = useState(items);
  const reorder = useReorderItems();

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  useEffect(() => {
    if (!rankingMode || items.length === 0) return;
    const needsNormalize = items.some((item, index) => item.rankingOrder !== index);
    if (!needsNormalize) return;
    void reorder.mutateAsync(
      items.map((item, index) => ({ id: item.id, rankingOrder: index }))
    );
    // Normalize once when ranking data is inconsistent (e.g. legacy 999 values).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, rankingMode]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localItems.findIndex((i) => i.id === active.id);
    const newIndex = localItems.findIndex((i) => i.id === over.id);
    const next = arrayMove(localItems, oldIndex, newIndex);
    setLocalItems(next);

    const payload = next.map((item, index) =>
      rankingMode
        ? { id: item.id, rankingOrder: index }
        : { id: item.id, sortOrder: index }
    );
    await reorder.mutateAsync(payload);
  }

  const content =
    viewMode === "grid" ? (
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4, "2xl": 5 }} spacing={4} w="full">
        {localItems.map((item, index) => (
          <WatchCard
            key={item.id}
            item={item}
            viewMode="grid"
            rankingMode={rankingMode}
            rankDisplay={rankingMode ? index + 1 : undefined}
            onEdit={onEdit}
          />
        ))}
      </SimpleGrid>
    ) : (
      <Stack spacing={3} w="full">
        {localItems.map((item, index) => (
          <WatchCard
            key={item.id}
            item={item}
            viewMode="list"
            rankingMode={rankingMode}
            rankDisplay={rankingMode ? index + 1 : undefined}
            onEdit={onEdit}
          />
        ))}
      </Stack>
    );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={localItems.map((i) => i.id)}
        strategy={viewMode === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
      >
        {content}
      </SortableContext>
    </DndContext>
  );
}
