import { useEffect, useState, type ReactNode } from "react";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import { LoginPage } from "../pages/LoginPage";

interface AuthUser {
  id: number;
  login: string;
}

interface MeResponse {
  authRequired: boolean;
  user: AuthUser | null;
}

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/auth/me", { credentials: "include" });
        if (res.status === 401) {
          if (!cancelled) {
            setAuthRequired(true);
            setUser(null);
          }
          return;
        }
        const body = (await res.json()) as MeResponse;
        if (!cancelled) {
          setAuthRequired(body.authRequired);
          setUser(body.user);
        }
      } catch {
        if (!cancelled) {
          setAuthRequired(true);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <VStack minH="100dvh" justify="center" spacing={3}>
        <Spinner color="brand.500" size="lg" />
        <Text color="ink.500" fontSize="sm">
          Oturum kontrol ediliyor…
        </Text>
      </VStack>
    );
  }

  if (authRequired && !user) {
    return <LoginPage />;
  }

  return <Box h="full">{children}</Box>;
}
