import {
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  useBackupStatus,
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useRunBackup,
  useSettings,
  useUpdateSettings,
} from "../hooks/useWatchlistApi";
import { exportWatchlistUrl } from "../api/watchlist";
import { Field } from "../components/ui/Field";
import { FieldInput } from "../components/ui/FieldInput";
import { DeleteConfirmButton } from "../components/DeleteConfirmButton";

export function SettingsPage() {
  const { data: settings } = useSettings();
  const { data: backup } = useBackupStatus();
  const { data: categoriesData } = useCategories();
  const updateSettings = useUpdateSettings();
  const runBackup = useRunBackup();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const toast = useToast();

  const [tmdbApiKey, setTmdbApiKey] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  const [githubPat, setGithubPat] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#1A4731");

  useEffect(() => {
    if (!settings) return;
    setGithubRepoUrl(settings.githubRepoUrl || "");
    setGithubBranch(settings.githubBranch || "main");
  }, [settings]);

  async function handleSave() {
    try {
      await updateSettings.mutateAsync({
        ...(tmdbApiKey ? { tmdbApiKey } : {}),
        githubRepoUrl,
        ...(githubPat ? { githubPat } : {}),
        githubBranch,
      });
      setTmdbApiKey("");
      setGithubPat("");
      toast({ title: "Ayarlar kaydedildi", status: "success" });
    } catch (error) {
      toast({
        title: "Kaydedilemedi",
        description: error instanceof Error ? error.message : undefined,
        status: "error",
      });
    }
  }

  async function handleBackup() {
    try {
      const result = await runBackup.mutateAsync();
      toast({
        title: result.ok ? "Yedekleme tamam" : "Yedekleme başarısız",
        description: result.message,
        status: result.ok ? "success" : "error",
      });
    } catch (error) {
      toast({
        title: "Yedekleme hatası",
        description: error instanceof Error ? error.message : undefined,
        status: "error",
      });
    }
  }

  async function handleAddCategory() {
    if (!categoryName.trim()) return;
    try {
      await createCategory.mutateAsync({
        name: categoryName.trim(),
        color: categoryColor,
      });
      setCategoryName("");
      toast({ title: "Kategori eklendi", status: "success" });
    } catch (error) {
      toast({
        title: "Kategori eklenemedi",
        description: error instanceof Error ? error.message : undefined,
        status: "error",
      });
    }
  }

  return (
    <VStack align="stretch" spacing={7} w="full">
      <VStack align="start" spacing={2}>
        <Text className="page-title" fontSize={{ base: "3xl", md: "4xl" }} color="ink.900">
          Ayarlar
        </Text>
        <Text color="ink.400">API, kategoriler ve yedekleme.</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} w="full">
        <VStack align="stretch" spacing={4} className="panel" p={6}>
          <Heading size="sm" color="ink.800">TMDB API</Heading>
          <HStack>
            <Badge colorScheme={settings?.hasTmdbApiKey ? "green" : "orange"}>
              {settings?.hasTmdbApiKey ? "Yapılandırıldı" : "Eksik"}
            </Badge>
            <Link
              href="https://www.themoviedb.org/settings/api"
              isExternal
              color="brand.600"
              fontSize="sm"
              fontWeight="600"
            >
              API key al
            </Link>
          </HStack>
          <Field label="TMDB API Key" helper="Key backend'de saklanır, tarayıcıya expose edilmez.">
            <FieldInput
              type="password"
              value={tmdbApiKey}
              onChange={(e) => setTmdbApiKey(e.target.value)}
              placeholder={settings?.hasTmdbApiKey ? "•••••••• (değiştirmek için yaz)" : "API key"}
            />
          </Field>
        </VStack>

        <VStack align="stretch" spacing={4} className="panel" p={6}>
          <Heading size="sm" color="ink.800">Özel kategoriler</Heading>
          <HStack align="end">
            <Box flex={1}>
              <Field label="Kategori adı">
                <FieldInput
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Kategori adı"
                />
              </Field>
            </Box>
            <FieldInput
              type="color"
              value={categoryColor}
              onChange={(e) => setCategoryColor(e.target.value)}
              style={{ width: 56, padding: 6, minHeight: 48 }}
            />
            <Button onClick={handleAddCategory} isLoading={createCategory.isPending} mb="2px">
              Ekle
            </Button>
          </HStack>
          <VStack align="stretch" spacing={2}>
            {(categoriesData?.categories ?? []).map((category) => (
              <HStack key={category.id} justify="space-between">
                <HStack>
                  <Badge bg={category.color} color="white">
                    {category.name}
                  </Badge>
                  <Text fontSize="sm" color="ink.400">
                    {category._count?.items ?? 0} kayıt
                  </Text>
                </HStack>
                <DeleteConfirmButton
                  onConfirm={async () => {
                    try {
                      await deleteCategory.mutateAsync(category.id);
                      toast({ title: "Kategori silindi", status: "info", duration: 2000 });
                    } catch (error) {
                      toast({
                        title: "Silinemedi",
                        description: error instanceof Error ? error.message : undefined,
                        status: "error",
                      });
                      throw error;
                    }
                  }}
                  isLoading={deleteCategory.isPending}
                  message={`"${category.name}" silinsin mi?`}
                />
              </HStack>
            ))}
          </VStack>
        </VStack>
      </SimpleGrid>

      <VStack align="stretch" spacing={4} className="panel" p={6} w="full">
        <Heading size="sm" color="ink.800">GitHub otomatik yedek</Heading>
        <HStack>
          <Badge colorScheme={backup?.configured ? "green" : "orange"}>
            {backup?.configured ? "Hazır" : "Yapılandırılmadı"}
          </Badge>
          {backup?.schedulerActive && (
            <Badge colorScheme="blue">
              Otomatik: her {backup.intervalHours} saatte bir
            </Badge>
          )}
        </HStack>
        {backup?.lastBackup && (
          <Text fontSize="sm" color="ink.400">
            Son yedek: {new Date(backup.lastBackup.createdAt).toLocaleString("tr-TR")} —{" "}
            {backup.lastBackup.status}
            {backup.lastBackup.message ? ` (${backup.lastBackup.message})` : ""}
          </Text>
        )}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} w="full">
          <Field label="Repo URL">
            <FieldInput
              value={githubRepoUrl}
              onChange={(e) => setGithubRepoUrl(e.target.value)}
              placeholder="https://github.com/username/ek-watchlist-backup"
            />
          </Field>
          <Field label="Personal Access Token">
            <FieldInput
              type="password"
              value={githubPat}
              onChange={(e) => setGithubPat(e.target.value)}
              placeholder={settings?.hasGithubPat ? "••••••••" : "ghp_..."}
            />
          </Field>
          <Field label="Branch">
            <FieldInput
              value={githubBranch}
              onChange={(e) => setGithubBranch(e.target.value)}
            />
          </Field>
        </SimpleGrid>
        <Text fontSize="sm" color="ink.400">
          Varsayılan olarak günde 2 kez (12 saatte bir) otomatik yedeklenir. Servis
          kapatılırken de son bir yedek alınır. Sıklığı `.env` içindeki{" "}
          <code>BACKUP_INTERVAL_HOURS</code> ile değiştirebilirsin (24 = günde 1 kez).
        </Text>
        <HStack>
          <Button onClick={handleBackup} isLoading={runBackup.isPending} variant="outline">
            Şimdi yedekle
          </Button>
          <Button as="a" href={exportWatchlistUrl()} download variant="ghost">
            JSON dışa aktar
          </Button>
        </HStack>
      </VStack>

      <Divider />
      <Button onClick={handleSave} isLoading={updateSettings.isPending} alignSelf="start">
        Kaydet
      </Button>
    </VStack>
  );
}
