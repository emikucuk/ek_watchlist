import { Box, HStack, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";

export interface CompactSelectOption {
  value: string;
  label: string;
}

interface CompactSelectProps {
  label: string;
  value: string;
  options: CompactSelectOption[];
  onChange: (value: string) => void;
  minW?: string;
}

export function CompactSelect({
  label,
  value,
  options,
  onChange,
  minW = "140px",
}: CompactSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <Box ref={rootRef} position="relative" minW={minW} flex="1">
      <HStack
        as="button"
        type="button"
        w="full"
        px={3}
        py={2}
        spacing={2}
        justify="space-between"
        bg="white"
        border="1px solid"
        borderColor={open ? "brand.300" : "ink.100"}
        borderRadius="xl"
        boxShadow={open ? "0 0 0 3px rgba(255, 244, 204, 0.85)" : "none"}
        transition="all 180ms cubic-bezier(0.22, 1, 0.36, 1)"
        cursor="pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Box textAlign="left" minW={0}>
          <Text className="text-label">{label}</Text>
          <Text fontSize="sm" fontWeight="700" color="ink.800" noOfLines={1} letterSpacing="var(--tracking-snug)">
            {selected?.label ?? "Seç"}
          </Text>
        </Box>
        <Box
          color="ink.400"
          transform={open ? "rotate(180deg)" : "none"}
          transition="transform 180ms ease"
          flexShrink={0}
        >
          <FiChevronDown size={14} />
        </Box>
      </HStack>

      {open && (
        <Box className="field-select-menu" role="listbox" maxH="280px">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                className={`field-select-option${active ? " is-active" : ""}`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <HStack w="full" justify="space-between">
                  <span>{option.label}</span>
                  {active ? <FiCheck size={14} /> : null}
                </HStack>
              </button>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
