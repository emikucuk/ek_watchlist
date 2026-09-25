import {
  Box,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useStats } from "../hooks/useWatchlistApi";
import { MEDIA_TYPE_LABELS, STATUS_LABELS, formatRating } from "../utils/labels";

export function StatsPage() {
  const { data, isLoading, isError, error } = useStats();

  if (isLoading) {
    return <Spinner color="brand.500" />;
  }

  if (isError || !data) {
    return <Text color="red.500">{(error as Error)?.message ?? "İstatistikler yüklenemedi"}</Text>;
  }

  return (
    <VStack align="stretch" spacing={7} w="full">
      <VStack align="start" spacing={2}>
        <Text className="page-title" fontSize={{ base: "3xl", md: "4xl" }} color="ink.900">
          İstatistikler
        </Text>
        <Text color="ink.400">Koleksiyonunun kısa özeti.</Text>
      </VStack>

      <SimpleGrid columns={{ base: 2, md: 4, xl: 4 }} spacing={4} w="full">
        <StatCard label="Toplam kayıt" value={String(data.total)} help="Koleksiyon boyutu" />
        <StatCard
          label="Ortalama puanım"
          value={formatRating(data.averagePersonalRating)}
          help={`${data.ratedCount} puanlanmış kayıt`}
        />
        <StatCard label="Bu ay eklenen" value={String(data.addedThisMonth)} help="Takvim ayı" />
        <StatCard label="Bu yıl eklenen" value={String(data.addedThisYear)} help="Takvim yılı" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4} w="full">
        <Box className="panel" p={6}>
          <Heading size="sm" mb={4} color="ink.800">
            Duruma göre
          </Heading>
          <VStack align="stretch" spacing={3}>
            {Object.entries(data.byStatus).map(([key, count]) => (
              <StatRow key={key} label={STATUS_LABELS[key] ?? key} value={count} />
            ))}
          </VStack>
        </Box>
        <Box className="panel" p={6}>
          <Heading size="sm" mb={4} color="ink.800">
            Türe göre
          </Heading>
          <VStack align="stretch" spacing={3}>
            {Object.entries(data.byType).map(([key, count]) => (
              <StatRow key={key} label={MEDIA_TYPE_LABELS[key] ?? key} value={count} />
            ))}
          </VStack>
        </Box>
        <Box className="panel" p={6}>
          <Heading size="sm" mb={4} color="ink.800">
            Son eklenenler
          </Heading>
          <VStack align="stretch" spacing={0}>
            {data.recent.map((item) => (
              <Box
                key={item.id}
                display="flex"
                justifyContent="space-between"
                gap={3}
                py={3}
                borderBottomWidth="1px"
                borderColor="ink.50"
              >
                <Text noOfLines={1} fontWeight="600" color="ink.800">
                  {item.title}
                </Text>
                <Text color="ink.400" fontSize="sm" whiteSpace="nowrap">
                  {MEDIA_TYPE_LABELS[item.mediaType]} · {STATUS_LABELS[item.status]}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  );
}

function StatCard({
  label,
  value,
  help,
}: {
  label: string;
  value: string;
  help: string;
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
        {help}
      </Text>
    </Box>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Text color="ink.600">{label}</Text>
      <Box
        minW="36px"
        textAlign="center"
        bg="brand.50"
        color="brand.700"
        fontWeight="800"
        borderRadius="lg"
        px={2}
        py={1}
        fontSize="sm"
      >
        {value}
      </Box>
    </Box>
  );
}
