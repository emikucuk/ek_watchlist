import { Badge, Box, HStack } from "@chakra-ui/react";
import { useLayoutEffect, useRef, useState } from "react";

interface OverflowBadgesProps {
  items: string[];
  maxItems?: number;
}

export function OverflowBadges({ items, maxItems }: OverflowBadgesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  useLayoutEffect(() => {
    function measure() {
      const container = containerRef.current;
      const measureRow = measureRef.current;
      if (!container || !measureRow || items.length === 0) {
        setVisibleCount(0);
        return;
      }

      const available = container.clientWidth;
      const children = Array.from(measureRow.children) as HTMLElement[];
      const gap = 6;
      let used = 0;
      let count = 0;
      const limit = maxItems ?? items.length;

      for (let i = 0; i < Math.min(children.length, limit); i += 1) {
        const width = children[i].offsetWidth;
        const remaining = items.length - (i + 1);
        const plusWidth =
          remaining > 0 ? (measureRow.querySelector("[data-plus]") as HTMLElement)?.offsetWidth ?? 36 : 0;
        const nextUsed = used + width + (i > 0 ? gap : 0);
        const needsPlus = remaining > 0;
        const totalIfTake = nextUsed + (needsPlus ? gap + plusWidth : 0);

        if (totalIfTake <= available) {
          used = nextUsed;
          count = i + 1;
        } else {
          break;
        }
      }

      setVisibleCount(Math.max(count, items.length > 0 ? 1 : 0));
    }

    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [items, maxItems]);

  if (items.length === 0) return null;

  const visible = items.slice(0, visibleCount);
  const hidden = Math.max(0, items.length - visibleCount);

  return (
    <Box position="relative" w="full">
      <HStack
        ref={containerRef}
        spacing={1.5}
        w="full"
        overflow="hidden"
        flexWrap="nowrap"
        align="center"
      >
        {visible.map((item) => (
          <Badge
            key={item}
            bg="brand.50"
            color="brand.700"
            fontSize="xs"
            flexShrink={0}
            whiteSpace="nowrap"
          >
            {item}
          </Badge>
        ))}
        {hidden > 0 && (
          <Badge bg="ink.50" color="ink.500" fontSize="xs" flexShrink={0}>
            +{hidden}
          </Badge>
        )}
      </HStack>

      {/* Hidden measurement row */}
      <HStack
        ref={measureRef}
        spacing={1.5}
        position="absolute"
        visibility="hidden"
        pointerEvents="none"
        h={0}
        overflow="hidden"
        aria-hidden
      >
        {items.map((item) => (
          <Badge key={item} bg="brand.50" color="brand.700" fontSize="xs" whiteSpace="nowrap">
            {item}
          </Badge>
        ))}
        <Badge data-plus bg="ink.50" color="ink.500" fontSize="xs">
          +99
        </Badge>
      </HStack>
    </Box>
  );
}
