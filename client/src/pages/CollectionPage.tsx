import {
  Button,
  HStack,
  IconButton,
  Spinner,
  Text,
  VStack,
  useDisclosure,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { FiGrid, FiList } from "react-icons/fi";
import { AddItemDrawer } from "../components/AddItemDrawer";
import { CompactMultiSelect } from "../components/CompactMultiSelect";
import { EditItemDrawer } from "../components/EditItemDrawer";
import { SearchBar } from "../components/SearchBar";
import { SortableWatchList } from "../components/SortableWatchList";
import { useWatchlist } from "../hooks/useWatchlistApi";
import { useUiStore } from "../store/uiStore";
import type { SearchResult, WatchItem } from "../types";
import {
  MEDIA_TYPE_LABELS,
  MEDIA_TYPES,
  STATUS_LABELS,
  WATCH_STATUSES,
  parseGenres,
} from "../utils/labels";

export function CollectionPage() {
  const {
    viewMode,
    setViewMode,
    mediaFilters,
    setMediaFilters,
    statusFilters,
    setStatusFilters,
    genreFilters,
    setGenreFilters,
    clearFilters,
  } = useUiStore();
  const { data, isLoading, isError, error } = useWatchlist({});
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [editingItem, setEditingItem] = useState<WatchItem | null>(null);
  const addDrawer = useDisclosure();
  const editDrawer = useDisclosure();

  const items = data?.items ?? [];

  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      for (const genre of parseGenres(item.genres)) {
        set.add(genre);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, "tr"));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (mediaFilters.length > 0 && !mediaFilters.includes(item.mediaType)) {
        return false;
      }
      if (statusFilters.length > 0 && !statusFilters.includes(item.status)) {
        return false;
      }
      if (genreFilters.length > 0) {
        const genres = parseGenres(item.genres);
        if (!genreFilters.some((genre) => genres.includes(genre))) {
          return false;
        }
      }
      return true;
    });
  }, [items, mediaFilters, statusFilters, genreFilters]);

  const mediaOptions = MEDIA_TYPES.map((type) => ({
    value: type,
    label: MEDIA_TYPE_LABELS[type],
  }));

  const statusOptions = WATCH_STATUSES.map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  }));

  const genreOptions = availableGenres.map((genre) => ({
    value: genre,
    label: genre,
  }));

  const hasActiveFilters =
    mediaFilters.length > 0 || statusFilters.length > 0 || genreFilters.length > 0;

  return (
    <VStack align="stretch" spacing={{ base: 5, md: 7 }} w="full">
      <VStack align="stretch" spacing={4}>
        <VStack align="start" spacing={2}>
          <Text className="page-title" fontSize={{ base: "2xl", md: "4xl" }} color="ink.900">
            Koleksiyonum
          </Text>
          <Text color="ink.400" maxW="560px" fontSize="md" lineHeight="1.6">
            Ara, ekle, sürükle-bırak ile sırala. Poster, özet, puan, tür ve kendi notların tek yerde.
          </Text>
        </VStack>
        <SearchBar
          onSelect={(result) => {
            setSelectedResult(result);
            addDrawer.onOpen();
          }}
        />
      </VStack>

      <Wrap spacing={2} align="center" justify="space-between">
        <WrapItem flex="1" minW={{ base: "100%", md: "auto" }}>
          <HStack
            spacing={2}
            w="full"
            flexWrap="wrap"
            align="stretch"
          >
            <CompactMultiSelect
              label="Tür"
              values={mediaFilters}
              options={mediaOptions}
              onChange={setMediaFilters}
              emptyLabel="Tüm türler"
              minW="140px"
            />
            <CompactMultiSelect
              label="Durum"
              values={statusFilters}
              options={statusOptions}
              onChange={setStatusFilters}
              emptyLabel="Her durum"
              minW="140px"
            />
            {availableGenres.length > 0 && (
              <CompactMultiSelect
                label="Kategori"
                values={genreFilters}
                options={genreOptions}
                onChange={setGenreFilters}
                emptyLabel="Tüm kategoriler"
                minW="160px"
              />
            )}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" alignSelf="center" onClick={clearFilters}>
                Sıfırla
              </Button>
            )}
          </HStack>
        </WrapItem>

        <WrapItem>
          <HStack className="view-toggle" spacing={1} p={1}>
            <IconButton
              aria-label="Grid"
              icon={<FiGrid />}
              size="sm"
              variant={viewMode === "grid" ? "solid" : "ghost"}
              onClick={() => setViewMode("grid")}
              borderRadius="lg"
            />
            <IconButton
              aria-label="Liste"
              icon={<FiList />}
              size="sm"
              variant={viewMode === "list" ? "solid" : "ghost"}
              onClick={() => setViewMode("list")}
              borderRadius="lg"
            />
          </HStack>
        </WrapItem>
      </Wrap>

      {isLoading && <Spinner alignSelf="center" color="brand.500" />}
      {isError && <Text color="red.500">{(error as Error).message}</Text>}
      {!isLoading && !isError && filteredItems.length === 0 && (
        <VStack py={20} spacing={3} className="panel" color="ink.400">
          <Text className="page-title" fontSize="2xl" color="ink.800">
            {items.length === 0 ? "Listen henüz boş" : "Bu filtreye uygun kayıt yok"}
          </Text>
          <Text>
            {items.length === 0
              ? "Yukarıdan bir şey ara ve ekle."
              : "Filtreleri temizleyip tekrar dene."}
          </Text>
          {items.length === 0 ? (
            <Button
              mt={2}
              onClick={() => document.querySelector<HTMLInputElement>(".search-input")?.focus()}
            >
              Aramaya başla
            </Button>
          ) : (
            <Button mt={2} variant="outline" onClick={clearFilters}>
              Filtreleri sıfırla
            </Button>
          )}
        </VStack>
      )}
      {!isLoading && filteredItems.length > 0 && (
        <SortableWatchList
          items={filteredItems}
          viewMode={viewMode}
          onEdit={(item) => {
            setEditingItem(item);
            editDrawer.onOpen();
          }}
        />
      )}

      <AddItemDrawer
        result={selectedResult}
        isOpen={addDrawer.isOpen}
        onClose={addDrawer.onClose}
      />
      <EditItemDrawer
        item={editingItem}
        isOpen={editDrawer.isOpen}
        onClose={editDrawer.onClose}
      />
    </VStack>
  );
}
