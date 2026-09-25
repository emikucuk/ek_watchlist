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
  HStack,
  Image,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useCreateItem, useMediaDetails } from "../hooks/useWatchlistApi";
import type { SearchResult, WatchStatus } from "../types";
import {
  MEDIA_TYPE_LABELS,
  STATUS_LABELS,
  WATCH_STATUSES,
  isSeriesType,
} from "../utils/labels";
import { RatingStars } from "./RatingStars";
import { Field } from "./ui/Field";
import { FieldSelect } from "./ui/FieldSelect";
import { FieldStepper } from "./ui/FieldStepper";
import { FieldTextarea } from "./ui/FieldTextarea";

interface AddItemDrawerProps {
  result: SearchResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AddItemDrawer({ result, isOpen, onClose }: AddItemDrawerProps) {
  const [status, setStatus] = useState<WatchStatus>("PLAN_TO_WATCH");
  const [notes, setNotes] = useState("");
  const [personalRating, setPersonalRating] = useState<number | null>(null);
  const [seasonCount, setSeasonCount] = useState<number | null>(null);
  const [episodeCount, setEpisodeCount] = useState<number | null>(null);
  const [seasonsLocked, setSeasonsLocked] = useState(false);
  const [episodesLocked, setEpisodesLocked] = useState(false);

  const createItem = useCreateItem();
  const toast = useToast();
  const series = result ? isSeriesType(result.mediaType) : false;

  const { data: details, isFetching } = useMediaDetails(
    result?.tmdbMediaType,
    result?.tmdbId,
    isOpen && Boolean(result)
  );

  useEffect(() => {
    if (!isOpen) return;
    setStatus("PLAN_TO_WATCH");
    setNotes("");
    setPersonalRating(null);
    setSeasonCount(null);
    setEpisodeCount(null);
    setSeasonsLocked(false);
    setEpisodesLocked(false);
  }, [isOpen, result?.tmdbId]);

  useEffect(() => {
    if (!details) return;
    if (details.numberOfSeasons != null) {
      setSeasonCount(details.numberOfSeasons);
      setSeasonsLocked(true);
    }
    if (details.numberOfEpisodes != null) {
      setEpisodeCount(details.numberOfEpisodes);
      setEpisodesLocked(true);
    }
  }, [details]);

  async function handleAdd() {
    if (!result) return;
    try {
      await createItem.mutateAsync({
        tmdbId: result.tmdbId,
        title: result.title,
        originalTitle: result.originalTitle,
        overview: details?.overview ?? result.overview,
        posterPath: details?.posterPath ?? result.posterPath,
        backdropPath: details?.backdropPath ?? result.backdropPath,
        releaseDate: result.releaseDate,
        mediaType: details?.mediaType ?? result.mediaType,
        tmdbRating: details?.tmdbRating ?? result.tmdbRating,
        status,
        notes: notes || null,
        personalRating,
        currentSeason: series ? seasonCount : null,
        currentEpisode: series ? episodeCount : null,
        runtimeMinutes: series ? null : (details?.runtimeMinutes ?? null),
        genres: details?.genres ?? result.genres,
      });
      toast({
        title: "Listeye eklendi",
        description: result.title,
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Eklenemedi",
        description: error instanceof Error ? error.message : "Bilinmeyen hata",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  }

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay bg="blackAlpha.400" backdropFilter="blur(8px)" />
      <DrawerContent>
        <DrawerCloseButton borderRadius="lg" top={4} right={4} />
        <DrawerHeader pr={12}>
          <HStack align="start" spacing={4}>
            {result?.posterPath && (
              <Image
                src={result.posterPath}
                alt=""
                w="64px"
                h="96px"
                objectFit="cover"
                borderRadius="xl"
                flexShrink={0}
              />
            )}
            <Box>
              <Text className="page-title" fontSize="xl" lineHeight="1.2">
                {result?.title}
              </Text>
              {result && (
                <Text mt={1} fontSize="sm" color="ink.400" fontWeight="500">
                  {MEDIA_TYPE_LABELS[result.mediaType]}
                </Text>
              )}
            </Box>
          </HStack>
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
                <Field
                  label="Sezon sayısı"
                  helper={seasonsLocked ? "TMDB’den geldi" : "Manuel sayaç"}
                >
                  {isFetching && !seasonsLocked ? (
                    <HStack className="field-shell" justify="center">
                      <Spinner size="sm" color="brand.500" />
                    </HStack>
                  ) : (
                    <FieldStepper
                      value={seasonCount}
                      onChange={setSeasonCount}
                      min={0}
                      isDisabled={seasonsLocked}
                      placeholder="—"
                    />
                  )}
                </Field>
                <Field
                  label="Bölüm sayısı"
                  helper={episodesLocked ? "TMDB’den geldi" : "Manuel sayaç"}
                >
                  {isFetching && !episodesLocked ? (
                    <HStack className="field-shell" justify="center">
                      <Spinner size="sm" color="brand.500" />
                    </HStack>
                  ) : (
                    <FieldStepper
                      value={episodeCount}
                      onChange={setEpisodeCount}
                      min={0}
                      isDisabled={episodesLocked}
                      placeholder="—"
                    />
                  )}
                </Field>
              </HStack>
            )}

            <Field label="Not / mini review">
              <FieldTextarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Kısa notun..."
                rows={4}
              />
            </Field>
          </VStack>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Vazgeç
          </Button>
          <Button onClick={handleAdd} isLoading={createItem.isPending}>
            Listeye Ekle
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
