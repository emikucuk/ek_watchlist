import { Box, HStack, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";

export interface CompactSelectOption {
  value: string;
  label: string;
}

interface CompactMultiSelectProps {
  label: string;
  values: string[];
  options: CompactSelectOption[];
  onChange: (values: string[]) => void;
  emptyLabel?: string;
  minW?: string;
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span className={`ms-checkbox${checked ? " is-checked" : ""}`} aria-hidden>
      {checked ? <FiCheck size={12} strokeWidth={3} /> : null}
    </span>
  );
}

export function CompactMultiSelect({
  label,
  values,
  options,
  onChange,
  emptyLabel = "Tümü",
  minW = "140px",
}: CompactMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function toggle(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }
    onChange([...values, value]);
  }

  const summary =
    values.length === 0
      ? emptyLabel
      : values.length === 1
        ? options.find((option) => option.value === values[0])?.label ?? "1 seçili"
        : `${values.length} seçili`;

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
        borderColor={open || values.length > 0 ? "brand.300" : "ink.100"}
        borderRadius="xl"
        boxShadow={open ? "0 0 0 3px rgba(255, 244, 204, 0.85)" : "none"}
        transition="all 180ms cubic-bezier(0.22, 1, 0.36, 1)"
        cursor="pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Box textAlign="left" minW={0}>
          <Text className="text-label">{label}</Text>
          <Text fontSize="sm" fontWeight="700" color="ink.800" noOfLines={1} letterSpacing="var(--tracking-snug)">
            {summary}
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
          <button
            type="button"
            className={`field-select-option is-check${values.length === 0 ? " is-checked-row" : ""}`}
            onClick={() => onChange([])}
          >
            <HStack w="full" spacing={3} align="center">
              <CheckBox checked={values.length === 0} />
              <Text as="span" fontSize="sm" fontWeight="600" color="ink.800">
                {emptyLabel}
              </Text>
            </HStack>
          </button>
          {options.map((option) => {
            const active = values.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                className={`field-select-option is-check${active ? " is-checked-row" : ""}`}
                onClick={() => toggle(option.value)}
              >
                <HStack w="full" spacing={3} align="center">
                  <CheckBox checked={active} />
                  <Text as="span" fontSize="sm" fontWeight="600" color="ink.800">
                    {option.label}
                  </Text>
                </HStack>
              </button>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
