import type { ReactNode } from "react";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink, useRouterState } from "@tanstack/react-router";
import {
  FiBarChart2,
  FiBookmark,
  FiHome,
  FiMic,
  FiSettings,
  FiStar,
} from "react-icons/fi";

const NAV_ITEMS = [
  { to: "/", label: "Ana sayfa", short: "Ana", icon: FiHome, hint: "Özet ve arama" },
  { to: "/collection", label: "Koleksiyon", short: "Liste", icon: FiBookmark, hint: "Ara ve yönet" },
  { to: "/rankings", label: "Sıralama", short: "Sıra", icon: FiStar, hint: "Favori listen" },
  { to: "/stats", label: "İstatistik", short: "İstat", icon: FiBarChart2, hint: "Özet görünüm" },
  { to: "/voice", label: "Sesli komut", short: "Ses", icon: FiMic, hint: "Mikrofon" },
  { to: "/settings", label: "Ayarlar", short: "Ayar", icon: FiSettings, hint: "API & yedek" },
] as const;

function SidebarNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Flex direction="column" h="full" py={6} px={4}>
      <HStack spacing={3} px={2} mb={8}>
        <Box className="brand-mark">EK</Box>
        <Box>
          <Text className="page-title" fontSize="lg" color="ink.900">
            Watchlist
          </Text>
          <Text fontSize="xs" color="ink.400" fontWeight="600">
            kişisel sinema arşivi
          </Text>
        </Box>
      </HStack>

      <VStack align="stretch" spacing={1.5} flex={1}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          return (
            <Box
              key={item.to}
              as={RouterLink}
              to={item.to}
              className={`sidebar-nav-item${active ? " is-active" : ""}`}
            >
              <span className="nav-icon">
                <item.icon size={16} />
              </span>
              <Box>
                <Text lineHeight="1.2">{item.label}</Text>
                <Text
                  fontSize="xs"
                  fontWeight="500"
                  opacity={0.7}
                  display={{ base: "none", xl: "block" }}
                >
                  {item.hint}
                </Text>
              </Box>
            </Box>
          );
        })}
      </VStack>

      <Box
        mt={4}
        p={4}
        borderRadius="2xl"
        bg="brand.50"
        border="1px solid"
        borderColor="brand.100"
      >
        <Text fontSize="sm" fontWeight="700" color="brand.700" mb={1}>
          GitHub oturumu
        </Text>
        <Text fontSize="xs" color="ink.500" lineHeight="1.5" mb={3}>
          Uygulama GitHub OAuth ile korunuyor. Sadece izinli hesap girebilir.
        </Text>
        <Box
          as="button"
          type="button"
          fontSize="xs"
          fontWeight="700"
          color="brand.700"
          textAlign="left"
          onClick={() => {
            void fetch("/auth/logout", { method: "POST", credentials: "include" }).then(() => {
              window.location.href = "/";
            });
          }}
        >
          Çıkış yap
        </Box>
      </Box>
    </Flex>
  );
}

function BottomBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Box
      as="nav"
      className="bottom-bar"
      display={{ base: "block", lg: "none" }}
      position="fixed"
      left={0}
      right={0}
      bottom={0}
      zIndex={40}
      px={2}
      pb="calc(8px + env(safe-area-inset-bottom))"
      pt={2}
    >
      <HStack
        className="bottom-bar-inner"
        spacing={0}
        justify="space-between"
        px={1}
        py={1}
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          return (
            <Box
              key={item.to}
              as={RouterLink}
              to={item.to}
              className={`bottom-bar-item${active ? " is-active" : ""}`}
              flex="1"
            >
              <item.icon size={18} />
              <Text as="span" fontSize="10px" fontWeight="700" lineHeight="1.1">
                {item.short}
              </Text>
            </Box>
          );
        })}
      </HStack>
    </Box>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Box className="app-canvas" minH="100vh">
      <Flex minH="100vh">
        <Box
          as="aside"
          display={{ base: "none", lg: "block" }}
          w="var(--sidebar-width)"
          flexShrink={0}
          position="sticky"
          top={0}
          h="100vh"
          borderRight="1px solid"
          borderColor="blackAlpha.100"
          bg="rgba(255,255,255,0.78)"
          backdropFilter="blur(18px)"
          zIndex={20}
        >
          <SidebarNav />
        </Box>

        <Box flex="1" minW={0} pb={{ base: "88px", lg: 0 }}>
          <Box as="main" px={{ base: 3, md: 6, xl: 8 }} py={{ base: 4, md: 8 }} w="full">
            {children}
          </Box>
        </Box>
      </Flex>

      <BottomBar />
    </Box>
  );
}
