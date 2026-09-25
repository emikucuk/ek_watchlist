import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiAward, FiEdit2, FiMenu } from "react-icons/fi";
import type { WatchItem } from "../types";
import {
  MEDIA_TYPE_LABELS,
  STATUS_LABELS,
  formatRating,
  formatRuntime,
  formatSeasonEpisode,
  parseGenres,
  yearFromDate,
} from "../utils/labels";
import { DeleteConfirmButton } from "./DeleteConfirmButton";
import { RatingStars } from "./RatingStars";
import { OverflowBadges } from "./OverflowBadges";
import { useDeleteItem, useUpdateItem } from "../hooks/useWatchlistApi";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  WATCHING: { bg: "brand.50", color: "brand.700" },
  WATCHED: { bg: "canvas.100", color: "brand.800" },
  PLAN_TO_WATCH: { bg: "accent.100", color: "accent.700" },
  DROPPED: { bg: "red.50", color: "red.700" },
};

const TROPHY: Record<number, { bg: string; color: string; label: string }> = {
  1: { bg: "accent.100", color: "accent.700", label: "Altın" },
  2: { bg: "ink.50", color: "ink.600", label: "Gümüş" },
  3: { bg: "#F3E0C7", color: "#8A5A2B", label: "Bronz" },
};

interface WatchCardProps {
  item: WatchItem;
  viewMode: "grid" | "list";
  onEdit: (item: WatchItem) => void;
  rankingMode?: boolean;
  rankDisplay?: number;
}

export function WatchCard({
  item,
  viewMode,
  onEdit,
  rankingMode = false,
  rankDisplay,
}: WatchCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const toast = useToast();
  const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.PLAN_TO_WATCH;
  const trophy = rankDisplay && rankDisplay <= 3 ? TROPHY[rankDisplay] : null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  async function handleRating(value: number) {
    try {
      await updateItem.mutateAsync({ id: item.id, personalRating: value });
    } catch (error) {
      toast({
        title: "Puan güncellenemedi",
        description: error instanceof Error ? error.message : undefined,
        status: "error",
      });
    }
  }

  async function handleDelete() {
    try {
      await deleteItem.mutateAsync(item.id);
      toast({ title: "Silindi", status: "info", duration: 2000 });
    } catch (error) {
      toast({
        title: "Silinemedi",
        description: error instanceof Error ? error.message : undefined,
        status: "error",
      });
      throw error;
    }
  }

  if (viewMode === "list") {
    return (
      <Flex
        ref={setNodeRef}
        style={style}
        className="media-card"
        align="stretch"
        _hover={{ transform: "none" }}
        borderColor={trophy ? trophy.bg : undefined}
        boxShadow={trophy ? "soft" : undefined}
      >
        <IconButton
          aria-label="Sürükle"
          icon={<FiMenu />}
          variant="ghost"
          alignSelf="center"
          ml={1}
          cursor="grab"
          color="ink.500"
          _hover={{ bg: "brand.500", color: "canvas.100" }}
          _active={{ bg: "brand.600", color: "canvas.100" }}
          {...attributes}
          {...listeners}
        />
        {rankingMode && rankDisplay != null && (
          <Flex
            align="center"
            justify="center"
            w="56px"
            flexShrink={0}
            bg={trophy?.bg ?? "brand.50"}
            color={trophy?.color ?? "brand.700"}
          >
            <VStack spacing={0}>
              {trophy ? <FiAward size={16} /> : null}
              <Text fontWeight="800" fontSize="lg">
                #{rankDisplay}
              </Text>
            </VStack>
          </Flex>
        )}
        <Image
          src={item.posterPath ?? undefined}
          fallbackSrc="https://via.placeholder.com/80x120?text=N/A"
          alt={item.title}
          w="72px"
          objectFit="cover"
        />
        <Box flex={1} p={4}>
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={2} minW={0}>
              <Text fontWeight="800" noOfLines={1} className="page-title" fontSize="lg">
                {item.title}
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                <Badge bg="canvas.100" color="ink.600">
                  {MEDIA_TYPE_LABELS[item.mediaType]}
                </Badge>
                <Badge bg={statusStyle.bg} color={statusStyle.color}>
                  {STATUS_LABELS[item.status]}
                </Badge>
                <Text fontSize="sm" color="ink.400">
                  {yearFromDate(item.releaseDate)}
                </Text>
                <Text fontSize="sm" color="accent.600" fontWeight="700">
                  TMDB ★ {formatRating(item.tmdbRating)}
                </Text>
              </HStack>
              {parseGenres(item.genres).length > 0 && (
                <Box maxW="100%">
                  <OverflowBadges items={parseGenres(item.genres)} />
                </Box>
              )}
              <RatingStars value={item.personalRating} onChange={handleRating} size="sm" />
            </VStack>
            <HStack>
              <IconButton
                aria-label="Düzenle"
                icon={<FiEdit2 />}
                size="sm"
                variant="ghost"
                onClick={() => onEdit(item)}
              />
              <DeleteConfirmButton
                onConfirm={handleDelete}
                isLoading={deleteItem.isPending}
                message={`"${item.title}" silinsin mi?`}
              />
            </HStack>
          </HStack>
        </Box>
      </Flex>
    );
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      className={`media-card${trophy ? " is-podium" : ""}`}
      position="relative"
      borderWidth={trophy ? "2px" : undefined}
      borderColor={trophy ? trophy.bg : undefined}
      sx={isDragging ? { transform: `${style.transform ?? ""}`, boxShadow: "none" } : undefined}
    >
      <Box position="relative" h={{ base: "200px", md: trophy ? "250px" : "230px" }}>
        <Image
          src={item.backdropPath ?? item.posterPath ?? undefined}
          fallbackSrc="https://via.placeholder.com/600x340?text=No+Image"
          alt={item.title}
          w="full"
          h="full"
          objectFit="cover"
        />
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-t, blackAlpha.700, blackAlpha.100, transparent)"
        />
        <IconButton
          aria-label="Sürükle"
          icon={<FiMenu />}
          size="sm"
          position="absolute"
          top={3}
          left={3}
          bg="white"
          color="brand.700"
          cursor="grab"
          borderRadius="lg"
          _hover={{ bg: "brand.500", color: "canvas.100" }}
          _active={{ bg: "brand.600", color: "canvas.100" }}
          {...attributes}
          {...listeners}
        />
        <Badge
          position="absolute"
          top={3}
          right={3}
          bg={statusStyle.bg}
          color={statusStyle.color}
        >
          {STATUS_LABELS[item.status]}
        </Badge>
        {rankingMode && rankDisplay != null && (
          <HStack
            position="absolute"
            bottom={3}
            left={3}
            bg={trophy?.bg ?? "white"}
            color={trophy?.color ?? "ink.900"}
            borderRadius="xl"
            px={3}
            py={1.5}
            spacing={2}
            boxShadow="soft"
          >
            {trophy ? <FiAward size={16} /> : null}
            <Text fontWeight="800" fontSize="md" letterSpacing="var(--tracking-tight)">
              #{rankDisplay}
            </Text>
            {trophy ? (
              <Text fontSize="xs" fontWeight="700" opacity={0.85}>
                {trophy.label}
              </Text>
            ) : null}
          </HStack>
        )}
      </Box>
      <VStack align="stretch" spacing={3} p={4}>
        <Text fontWeight="800" fontSize="lg" noOfLines={2} className="page-title">
          {item.title}
        </Text>
        <HStack spacing={2} flexWrap="wrap">
          <Badge bg="canvas.100" color="ink.600">
            {MEDIA_TYPE_LABELS[item.mediaType]}
          </Badge>
          <Text fontSize="sm" color="ink.400">
            {yearFromDate(item.releaseDate)}
          </Text>
          <Text fontSize="sm" color="accent.600" fontWeight="700">
            TMDB ★ {formatRating(item.tmdbRating)}
          </Text>
        </HStack>
        {parseGenres(item.genres).length > 0 && (
          <OverflowBadges items={parseGenres(item.genres)} />
        )}
        <Text fontSize="sm" color="ink.500" noOfLines={3} lineHeight="1.55">
          {item.overview || "Özet yok."}
        </Text>
        {(() => {
          const meta =
            formatSeasonEpisode(item.currentSeason, item.currentEpisode) ??
            formatRuntime(item.runtimeMinutes);
          return meta ? (
            <Text fontSize="sm" color="brand.600" fontWeight="700">
              {meta}
            </Text>
          ) : null;
        })()}
        <RatingStars value={item.personalRating} onChange={handleRating} size="sm" />
        <HStack>
          <Button size="sm" variant="outline" flex={1} onClick={() => onEdit(item)}>
            Düzenle
          </Button>
          <DeleteConfirmButton
            onConfirm={handleDelete}
            isLoading={deleteItem.isPending}
            message={`"${item.title}" silinsin mi?`}
          />
        </HStack>
      </VStack>
    </Box>
  );
}
