import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  HStack,
  Switch,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useCategories, useUpdateItem, useWatchlist } from "../hooks/useWatchlistApi";
import type { MediaType, WatchItem, WatchStatus } from "../types";
import {
  MEDIA_TYPE_LABELS,
  MEDIA_TYPES,
  STATUS_LABELS,
  WATCH_STATUSES,
  isSeriesType,
} from "../utils/labels";
import { RatingStars } from "./RatingStars";
import { Field } from "./ui/Field";
import { FieldSelect } from "./ui/FieldSelect";
import { FieldStepper } from "./ui/FieldStepper";
import { FieldTextarea } from "./ui/FieldTextarea";

interface EditItemDrawerProps {
  item: WatchItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditItemDrawer({ item, isOpen, onClose }: EditItemDrawerProps) {
  const [status, setStatus] = useState<WatchStatus>("PLAN_TO_WATCH");
  const [mediaType, setMediaType] = useState<MediaType>("MOVIE");
  const [notes, setNotes] = useState("");
  const [personalRating, setPersonalRating] = useState<number | null>(null);
  const [seasonCount, setSeasonCount] = useState<number | null>(null);
  const [episodeCount, setEpisodeCount] = useState<number | null>(null);
  const [inRankings, setInRankings] = useState(false);
  const [customCategoryId, setCustomCategoryId] = useState("");
  const updateItem = useUpdateItem();
  const { data: categoriesData } = useCategories();
  const { data: rankedData } = useWatchlist({ rankedOnly: true });
  const toast = useToast();

  const series = isSeriesType(mediaType);

  useEffect(() => {
    if (!item) return;
    setStatus(item.status);
    setMediaType(item.mediaType);
    setNotes(item.notes ?? "");
    setPersonalRating(item.personalRating);
    setSeasonCount(item.currentSeason);
    setEpisodeCount(item.currentEpisode);
    setInRankings(item.rankingOrder !== null);
    setCustomCategoryId(item.customCategoryId ?? "");
  }, [item]);

  async function handleSave() {
    if (!item) return;
    const rankedItems = rankedData?.items ?? [];
    const alreadyRanked =
      item.rankingOrder != null && item.rankingOrder >= 0 && item.rankingOrder < 500;
    const nextRank = alreadyRanked
      ? item.rankingOrder!
      : rankedItems.filter((entry) => entry.id !== item.id).length;

    try {
      await updateItem.mutateAsync({
        id: item.id,
        status,
        mediaType,
        notes: notes || null,
        personalRating,
        currentSeason: series ? seasonCount : null,
        currentEpisode: series ? episodeCount : null,
        rankingOrder: inRankings ? nextRank : null,
        customCategoryId: customCategoryId || null,
      });
      toast({ title: "Güncellendi", status: "success", duration: 2000 });
      onClose();
    } catch (error) {
      toast({
        title: "Güncellenemedi",
        description: error instanceof Error ? error.message : undefined,
        status: "error",
      });
    }
  }

  const categoryOptions = [
    { value: "", label: "Yok" },
    ...(categoriesData?.categories ?? []).map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay bg="blackAlpha.400" backdropFilter="blur(8px)" />
      <DrawerContent>
        <DrawerCloseButton borderRadius="lg" top={4} right={4} />
        <DrawerHeader pr={12}>
          <Text className="page-title" fontSize="xl">
            {item?.title}
          </Text>
        </DrawerHeader>
        <DrawerBody>
          <VStack spacing={5} align="stretch" pt={2}>
            <Field label="Durum">
              <FieldSelect
                value={status}
                onChange={setStatus}
                options={WATCH_STATUSES.map((s) => ({
                  value: s,
                  label: STATUS_LABELS[s],
                }))}
              />
            </Field>

            <Field label="Kategori">
              <FieldSelect
                value={mediaType}
                onChange={setMediaType}
                options={MEDIA_TYPES.map((t) => ({
                  value: t,
                  label: MEDIA_TYPE_LABELS[t],
                }))}
              />
            </Field>

            <Field label="Özel kategori">
              <FieldSelect
                value={customCategoryId}
                onChange={setCustomCategoryId}
                options={categoryOptions}
              />
            </Field>

            <Field label="Kişisel puan">
              <Box className="field-shell" px={4} py={3} minH="auto">
                <RatingStars
                  value={personalRating}
                  onChange={setPersonalRating}
                  size="md"
                />
              </Box>
            </Field>

            {series && (
              <HStack align="start" spacing={3}>
                <Field label="Sezon sayısı" helper="Dizinin toplam sezonu">
                  <FieldStepper
                    value={seasonCount}
                    onChange={setSeasonCount}
                    min={0}
                    placeholder="—"
                  />
                </Field>
                <Field label="Bölüm sayısı" helper="Dizinin toplam bölümü">
                  <FieldStepper
                    value={episodeCount}
                    onChange={setEpisodeCount}
                    min={0}
                    placeholder="—"
                  />
                </Field>
              </HStack>
            )}

            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <FormLabel mb={0} textTransform="none" letterSpacing="0" fontSize="sm">
                Favori sıralamamda göster
              </FormLabel>
              <Switch
                isChecked={inRankings}
                onChange={(e) => setInRankings(e.target.checked)}
                colorScheme="brand"
              />
            </FormControl>

            <Field label="Not">
              <FieldTextarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Kısa notun..."
              />
            </Field>
          </VStack>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Vazgeç
          </Button>
          <Button onClick={handleSave} isLoading={updateItem.isPending}>
            Kaydet
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
