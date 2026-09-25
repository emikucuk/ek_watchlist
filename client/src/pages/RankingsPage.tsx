import {
  Box,
  Button,
  HStack,
  IconButton,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { FiAward, FiGrid, FiList } from "react-icons/fi";
import { EditItemDrawer } from "../components/EditItemDrawer";
import { SortableWatchList } from "../components/SortableWatchList";
import { useWatchlist } from "../hooks/useWatchlistApi";
import { useUiStore } from "../store/uiStore";
import type { WatchItem } from "../types";

export function RankingsPage() {
  const { viewMode, setViewMode } = useUiStore();
  const { data, isLoading, isError, error } = useWatchlist({ rankedOnly: true });
  const [editingItem, setEditingItem] = useState<WatchItem | null>(null);
  const editDrawer = useDisclosure();
  const items = data?.items ?? [];

  return (
    <VStack align="stretch" spacing={7} w="full">
      <Box
        className="panel"
        p={{ base: 5, md: 7 }}
        bg="linear-gradient(135deg, rgba(255,244,204,0.65) 0%, #ffffff 55%, rgba(234,243,238,0.7) 100%)"
        borderColor="brand.100"
      >
        <HStack justify="space-between" align="start" flexWrap="wrap" gap={4}>
          <VStack align="start" spacing={3} maxW="720px">
            <HStack spacing={3}>
              <Box
                w="48px"
                h="48px"
                borderRadius="2xl"
                bg="accent.100"
                color="accent.700"
                display="grid"
                placeItems="center"
              >
                <FiAward size={22} />
              </Box>
              <Box>
                <Text className="page-title" fontSize={{ base: "3xl", md: "4xl" }} color="ink.900">
                  Favori sıralamam
                </Text>
                <Text color="ink.400" fontSize="sm" fontWeight="600">
                  Kupa sırası · sürükle ve düzenle
                </Text>
              </Box>
            </HStack>
            <Text color="ink.500" lineHeight="1.65">
              En sevdiklerini buraya ekle. İlk üç sırada altın, gümüş ve bronz kupa belirir.
              Düzenlerken &quot;Favori sıralamamda göster&quot; seçeneğini açman yeterli.
            </Text>
            {items.length > 0 && (
              <HStack spacing={2} flexWrap="wrap">
                <RankChip tone="gold" label={`#1 Altın`} />
                <RankChip tone="silver" label={`#2 Gümüş`} />
                <RankChip tone="bronze" label={`#3 Bronz`} />
                <Text fontSize="sm" color="ink.400" fontWeight="600">
                  {items.length} favori
                </Text>
              </HStack>
            )}
          </VStack>

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
        </HStack>
      </Box>

      {isLoading && <Spinner alignSelf="center" color="brand.500" />}
      {isError && <Text color="red.500">{(error as Error).message}</Text>}
      {!isLoading && items.length === 0 && (
        <VStack py={16} spacing={3} className="panel" color="ink.400">
          <FiAward size={36} />
          <Text className="page-title" fontSize="2xl" color="ink.800">
            Henüz favori sıralaman yok
          </Text>
          <Text>Koleksiyondan bir kayıt düzenleyip favorilere ekle.</Text>
          <Button as={Link} to="/collection" variant="outline">
            Koleksiyona git
          </Button>
        </VStack>
      )}

      {items.length > 0 && (
        <SortableWatchList
          items={items}
          viewMode={viewMode}
          rankingMode
          onEdit={(item) => {
            setEditingItem(item);
            editDrawer.onOpen();
          }}
        />
      )}

      {items.length >= 3 && viewMode === "grid" && (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} w="full">
          <LegendCard title="Altın kupa" desc="Listenin zirvesi — bir numaran." tone="gold" />
          <LegendCard title="Gümüş kupa" desc="Çok yakın ikinci — güçlü favorin." tone="silver" />
          <LegendCard title="Bronz kupa" desc="Podyumun üçüncüsü — haklı yer." tone="bronze" />
        </SimpleGrid>
      )}

      <EditItemDrawer
        item={editingItem}
        isOpen={editDrawer.isOpen}
        onClose={editDrawer.onClose}
      />
    </VStack>
  );
}

function RankChip({
  tone,
  label,
}: {
  tone: "gold" | "silver" | "bronze";
  label: string;
}) {
  const styles = {
    gold: { bg: "accent.100", color: "accent.700" },
    silver: { bg: "ink.50", color: "ink.600" },
    bronze: { bg: "#F3E0C7", color: "#8A5A2B" },
  }[tone];

  return (
    <HStack
      bg={styles.bg}
      color={styles.color}
      px={3}
      py={1.5}
      borderRadius="full"
      spacing={2}
      fontSize="sm"
      fontWeight="700"
    >
      <FiAward size={14} />
      <Text>{label}</Text>
    </HStack>
  );
}

function LegendCard({
  title,
  desc,
  tone,
}: {
  title: string;
  desc: string;
  tone: "gold" | "silver" | "bronze";
}) {
  const styles = {
    gold: { bg: "accent.50", border: "accent.200", color: "accent.700" },
    silver: { bg: "ink.50", border: "ink.100", color: "ink.600" },
    bronze: { bg: "#FBF4EA", border: "#E8C9A0", color: "#8A5A2B" },
  }[tone];

  return (
    <Box
      className="panel"
      p={4}
      bg={styles.bg}
      borderColor={styles.border}
    >
      <HStack mb={2} color={styles.color} spacing={2}>
        <FiAward />
        <Text fontWeight="800">{title}</Text>
      </HStack>
      <Text fontSize="sm" color="ink.500" lineHeight="1.5">
        {desc}
      </Text>
    </Box>
  );
}
