import { Box, HStack, Text } from "@chakra-ui/react";
import { FiStar } from "react-icons/fi";

interface RatingStarsProps {
  value: number | null;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
  readOnly?: boolean;
  showValue?: boolean;
}

export function RatingStars({
  value,
  onChange,
  size = "sm",
  readOnly = false,
  showValue = true,
}: RatingStarsProps) {
  const current = value ?? 0;
  const starSize = size === "sm" ? 12 : 14;
  const gap = size === "sm" ? "1px" : "2px";

  return (
    <HStack spacing={2} align="center">
      <HStack spacing={gap}>
        {Array.from({ length: 10 }, (_, index) => {
          const score = index + 1;
          const filled = current >= score;
          return (
            <Box
              key={score}
              as="button"
              type="button"
              aria-label={`${score} puan`}
              disabled={readOnly}
              onClick={() => onChange?.(score)}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              color={filled ? "accent.500" : "ink.200"}
              cursor={readOnly ? "default" : "pointer"}
              lineHeight={0}
              p={0}
              m={0}
              bg="transparent"
              border="none"
              transition="color 120ms ease, transform 120ms ease"
              _hover={
                readOnly
                  ? undefined
                  : { color: "accent.500", transform: "scale(1.15)" }
              }
              _disabled={{ opacity: 1, cursor: "default" }}
            >
              <FiStar
                size={starSize}
                strokeWidth={2}
                fill={filled ? "currentColor" : "none"}
              />
            </Box>
          );
        })}
      </HStack>
      {showValue && (
        <Text
          fontSize="xs"
          color="ink.400"
          fontWeight="700"
          minW="18px"
          letterSpacing="var(--tracking-tight)"
        >
          {value != null ? value.toFixed(0) : "—"}
        </Text>
      )}
    </HStack>
  );
}
