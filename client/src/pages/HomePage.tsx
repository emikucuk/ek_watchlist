import {
  Box,
  Button,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  FiArrowRight,
  FiBarChart2,
  FiBookmark,
  FiStar,
} from "react-icons/fi";
import { AddItemDrawer } from "../components/AddItemDrawer";
import { SearchBar } from "../components/SearchBar";
import { useStats, useWatchlist } from "../hooks/useWatchlistApi";
import { useUiStore } from "../store/uiStore";
import type { SearchResult } from "../types";
import {
  MEDIA_TYPE_LABELS,
  STATUS_LABELS,
  formatRating,
  parseGenres,
} from "../utils/labels";

export function HomePage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: watchlist } = useWatchlist({});
  const setGenreFilters = useUiStore((s) => s.setGenreFilters);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const addDrawer = useDisclosure();

  const items = watchlist?.items ?? [];

  const topRated = useMemo(
    () =>
      [...items]
        .filter((item) => item.personalRating != null)
        .sort((a, b) => (b.personalRating ?? 0) - (a.personalRating ?? 0))
        .slice(0, 5),
    [items]
  );

  const topGenres = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const genre of parseGenres(item.genres)) {
        counts.set(genre, (counts.get(genre) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [items]);

  const watchingCount = stats?.byStatus.WATCHING ?? 0;
  const plannedCount = stats?.byStatus.PLAN_TO_WATCH ?? 0;

  return (
    <VStack align="stretch" spacing={8}>
      <VStack align="stretch" spacing={4}>
        <VStack align="start" spacing={2}>
          <Text className="page-title" fontSize={{ base: "3xl", md: "5xl" }} color="ink.900">
            EK Watchlist
          </Text>
          <Text color="ink.400" maxW="620px" fontSize="md" lineHeight="1.65">
            Ara, ekle, sürükle-bırak ile sırala. Poster, özet, puan ve kendi notların tek yerde.
          </Text>
        </VStack>
        <SearchBar
          onSelect={(result) => {
            setSelectedResult(result);
            addDrawer.onOpen();
          }}
        />
      </VStack>

      {statsLoading && <Spinner alignSelf="center" color="brand.500" />}

      {stats && (
        <SimpleGrid columns={{ base: 2, md: 4, xl: 4, "2xl": 6 }} spacing={4} w="full">
          <DashStat label="Toplam kayıt" value={String(stats.total)} hint="Koleksiyon" />
          <DashStat
            label="Ortalama puan"
            value={formatRating(stats.averagePersonalRating)}
            hint={`${stats.ratedCount} puanlı`}
          />
          <DashStat label="Bu ay" value={String(stats.addedThisMonth)} hint="Yeni eklenen" />
          <DashStat label="İzliyorum" value={String(watchingCount)} hint={`${plannedCount} sırada`} />
        </SimpleGrid>
      )}

      <SimpleGrid columns={{ base: 1, md: 3, xl: 3 }} spacing={4} w="full">
        <QuickLink
          to="/collection"
          icon={<FiBookmark size={18} />}
          title="Koleksiyon"
          desc="Tüm kayıtlarını filtrele ve düzenle"
        />
        <QuickLink
          to="/rankings"
          icon={<FiStar size={18} />}
          title="Favori sıralama"
          desc="En sevdiklerini sırala"
        />
        <QuickLink
          to="/stats"
          icon={<FiBarChart2 size={18} />}
          title="İstatistikler"
          desc="Durum ve tür dağılımı"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2, "2xl": 3 }} spacing={4} w="full">
        <Box className="panel" p={6}>
          <HStack justify="space-between" mb={4}>
            <Heading size="sm" color="ink.800">
              Son eklenenler
            </Heading>
            <Button as={Link} to="/collection" size="sm" variant="ghost" rightIcon={<FiArrowRight />}>
              Tümü
            </Button>
          </HStack>
          <VStack align="stretch" spacing={0}>
            {(stats?.recent ?? []).length === 0 && (
              <Text color="ink.400" py={6}>
                Henüz kayıt yok. Yukarıdan arayıp ekleyebilirsin.
              </Text>
            )}
            {(stats?.recent ?? []).map((item) => (
              <HStack
                key={item.id}
                py={3}
                borderBottomWidth="1px"
                borderColor="ink.50"
                spacing={3}
              >
                <Image
                  src={item.posterPath ?? undefined}
                  fallbackSrc="https://via.placeholder.com/40x60?text=—"
                  alt=""
                  w="36px"
                  h="54px"
                  objectFit="cover"
                  borderRadius="md"
                />
                <Box flex={1} minW={0}>
                  <Text fontWeight="700" noOfLines={1} color="ink.800">
                    {item.title}
                  </Text>
                  <Text fontSize="sm" color="ink.400">
                    {MEDIA_TYPE_LABELS[item.mediaType]} · {STATUS_LABELS[item.status]}
                  </Text>
                </Box>
              </HStack>
            ))}
          </VStack>
        </Box>

        <VStack align="stretch" spacing={4}>
          <Box className="panel" p={6}>
            <Heading size="sm" color="ink.800" mb={4}>
              En yüksek puanladıkların
            </Heading>
            {topRated.length === 0 ? (
              <Text color="ink.400">Henüz kişisel puan yok.</Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {topRated.map((item, index) => (
                  <HStack key={item.id} justify="space-between">
                    <HStack spacing={3} minW={0}>
                      <Text fontWeight="800" color="brand.500" w="20px">
                        {index + 1}
                      </Text>
                      <Text fontWeight="600" noOfLines={1} color="ink.800">
                        {item.title}
                      </Text>
                    </HStack>
                    <Text fontWeight="800" color="accent.600">
                      {item.personalRating}/10
                    </Text>
                  </HStack>
                ))}
              </VStack>
            )}
          </Box>

          <Box className="panel" p={6}>
            <Heading size="sm" color="ink.800" mb={4}>
              Popüler türlerin
            </Heading>
            {topGenres.length === 0 ? (
              <Text color="ink.400">
                Tür bilgisi kayıtlarla birlikte gelecek. Yeni eklediğin içeriklerde
                aksiyon, bilim kurgu gibi türler otomatik kaydolur.
              </Text>
            ) : (
              <HStack spacing={2} flexWrap="wrap">
                {topGenres.map(([genre, count]) => (
                  <Box
                    key={genre}
                    as={Link}
                    to="/collection"
                    className="filter-chip"
                    onClick={() => setGenreFilters([genre])}
                  >
                    {genre} · {count}
                  </Box>
                ))}
              </HStack>
            )}
          </Box>
        </VStack>
      </SimpleGrid>

      {stats && Object.keys(stats.byStatus).length > 0 && (
        <Box className="panel" p={6}>
          <Heading size="sm" color="ink.800" mb={4}>
            Durum özeti
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            {Object.entries(stats.byStatus).map(([key, count]) => (
              <Box
                key={key}
                bg="brand.50"
                borderRadius="2xl"
                px={4}
                py={4}
                border="1px solid"
                borderColor="brand.100"
              >
                <Text fontSize="sm" color="ink.500" fontWeight="600" mb={1}>
                  {STATUS_LABELS[key] ?? key}
                </Text>
                <Text className="page-title" fontSize="2xl" color="brand.700">
                  {count}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}

      <AddItemDrawer
        result={selectedResult}
        isOpen={addDrawer.isOpen}
        onClose={addDrawer.onClose}
      />
    </VStack>
  );
}

function DashStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Box className="panel" p={5}>
      <Text fontSize="sm" color="ink.400" fontWeight="600" mb={2}>
        {label}
      </Text>
      <Text className="page-title" fontSize="3xl" color="ink.900" mb={1}>
        {value}
      </Text>
      <Text fontSize="xs" color="ink.400">
        {hint}
      </Text>
    </Box>
  );
}

function QuickLink({
  to,
  icon,
  title,
  desc,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Box
      as={Link}
      to={to}
      className="panel"
      p={5}
      transition="transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease"
      _hover={{ transform: "translateY(-3px)", boxShadow: "lift", textDecoration: "none" }}
    >
      <HStack spacing={3} mb={3}>
        <Box
          w="40px"
          h="40px"
          borderRadius="xl"
          bg="canvas.100"
          color="brand.700"
          display="grid"
          placeItems="center"
        >
          {icon}
        </Box>
        <Text fontWeight="800" color="ink.900">
          {title}
        </Text>
      </HStack>
      <Text fontSize="sm" color="ink.400" lineHeight="1.5">
        {desc}
      </Text>
    </Box>
  );
}
