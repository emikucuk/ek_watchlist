import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { FiGithub } from "react-icons/fi";

export function LoginPage() {
  return (
    <Box className="login-screen" minH="100dvh" display="grid" placeItems="center" px={6}>
      <VStack
        spacing={6}
        maxW="420px"
        w="full"
        p={{ base: 8, md: 10 }}
        borderRadius="3xl"
        bg="cream.50"
        border="1px solid"
        borderColor="brand.100"
        boxShadow="lg"
        textAlign="center"
      >
        <Box className="brand-mark" mx="auto">
          EK
        </Box>
        <Box>
          <Text className="page-title" fontSize="2xl" color="ink.900">
            Watchlist
          </Text>
          <Text mt={2} color="ink.500" fontSize="sm" lineHeight="1.6">
            Bu arşiv kişisel. Devam etmek için GitHub hesabınla giriş yap.
          </Text>
        </Box>
        <Button
          as="a"
          href="/auth/github"
          leftIcon={<FiGithub />}
          size="lg"
          w="full"
          colorScheme="brand"
          borderRadius="2xl"
        >
          GitHub ile giriş
        </Button>
      </VStack>
    </Box>
  );
}
