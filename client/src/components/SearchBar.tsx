import {
  Badge,
  Box,
  HStack,
  Image,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useSearch } from "../hooks/useWatchlistApi";
import { MEDIA_TYPE_LABELS, formatRating, yearFromDate } from "../utils/labels";
import type { SearchResult } from "../types";

interface SearchBarProps {
  onSelect: (result: SearchResult) => void;
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isFetching, isError, error } = useSearch(debounced);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const results = data?.results ?? [];

  return (
    <Box ref={containerRef} position="relative" w="full">
      <Box className="search-shell" position="relative">
        <Box
          position="absolute"
          left={4}
          top="50%"
          transform="translateY(-50%)"
          color="ink.400"
          zIndex={1}
        >
          <FiSearch size={18} />
        </Box>
        <input
          className="search-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Film, dizi, anime ara..."
        />
        {isFetching && (
          <Spinner
            size="sm"
            position="absolute"
            right={4}
            top="50%"
            transform="translateY(-50%)"
            color="brand.500"
          />
        )}
      </Box>

      {isOpen && debounced.trim().length >= 2 && (
        <Box
          position="absolute"
          top="100%"
          mt={2}
          w="full"
          maxH="420px"
          overflowY="auto"
          className="panel"
          zIndex={40}
        >
          {isError && (
            <Text p={4} color="red.500">
              {(error as Error).message}
            </Text>
          )}
          {!isError && !isFetching && results.length === 0 && (
            <Text p={4} color="ink.400">
              Sonuç bulunamadı
            </Text>
          )}
          <Stack spacing={0} divider={<Box borderBottomWidth="1px" borderColor="ink.50" />}>
            {results.map((result) => (
              <HStack
                key={`${result.mediaType}-${result.tmdbId}`}
                p={3}
                spacing={3}
                cursor="pointer"
                transition="background 150ms ease"
                _hover={{ bg: "canvas.100" }}
                onClick={() => {
                  onSelect(result);
                  setQuery("");
                  setDebounced("");
                  setIsOpen(false);
                }}
              >
                <Image
                  src={result.posterPath ?? undefined}
                  fallbackSrc="https://via.placeholder.com/60x90?text=N/A"
                  alt={result.title}
                  w="48px"
                  h="72px"
                  objectFit="cover"
                  borderRadius="lg"
                />
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontWeight="700" noOfLines={1} color="ink.900">
                    {result.title}
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    <Badge bg="brand.50" color="brand.700">
                      {MEDIA_TYPE_LABELS[result.mediaType] ?? result.mediaType}
                    </Badge>
                    {yearFromDate(result.releaseDate) && (
                      <Text fontSize="sm" color="ink.400">
                        {yearFromDate(result.releaseDate)}
                      </Text>
                    )}
                    <Text fontSize="sm" color="accent.600" fontWeight="700">
                      ★ {formatRating(result.tmdbRating)}
                    </Text>
                  </HStack>
                  {result.genres && (
                    <Text fontSize="xs" color="ink.400" noOfLines={1}>
                      {result.genres}
                    </Text>
                  )}
                </VStack>
              </HStack>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
