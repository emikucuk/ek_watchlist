import {
  Badge,
  Box,
  Button,
  Code,
  HStack,
  ListItem,
  Text,
  UnorderedList,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FiMic, FiMicOff } from "react-icons/fi";

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

function isAppleMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function VoicePage() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastAction, setLastAction] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const navigate = useNavigate();
  const toast = useToast();
  const appleMobile = isAppleMobile();

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognition()));
  }, []);

  function handleCommand(text: string) {
    const normalized = text.toLowerCase().trim();
    setTranscript(text);

    if (normalized.includes("sıralama") || normalized.includes("favori")) {
      setLastAction("Sıralama sayfasına gidildi");
      void navigate({ to: "/rankings" });
      return;
    }
    if (normalized.includes("istatistik") || normalized.includes("stats")) {
      setLastAction("İstatistik sayfasına gidildi");
      void navigate({ to: "/stats" });
      return;
    }
    if (normalized.includes("ayar")) {
      setLastAction("Ayarlar sayfasına gidildi");
      void navigate({ to: "/settings" });
      return;
    }
    if (
      normalized.includes("liste") ||
      normalized.includes("ana sayfa") ||
      normalized.includes("home")
    ) {
      setLastAction("Ana listeye gidildi");
      void navigate({ to: "/" });
      return;
    }
    if (normalized.includes("ara ")) {
      const query = normalized.replace(/^.*?ara\s+/, "").trim();
      setLastAction(`Arama önerisi: ${query}`);
      void navigate({ to: "/" });
      toast({
        title: "Sesli arama",
        description: `Ana sayfada "${query}" diye ara`,
        status: "info",
      });
      return;
    }

    setLastAction("Komut anlaşılamadı");
    toast({
      title: "Anlaşılamadı",
      description: "Örnek: listeye git, sıralama, istatistik, ayarlar, ara inception",
      status: "warning",
    });
  }

  function toggleListening() {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "tr-TR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript ?? "";
      handleCommand(text);
    };
    recognition.onerror = (event) => {
      setListening(false);
      toast({ title: "Ses tanıma hatası", description: event.error, status: "error" });
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  return (
    <VStack align="stretch" spacing={7} w="full">
      <VStack align="start" spacing={2}>
        <Text className="page-title" fontSize={{ base: "3xl", md: "4xl" }} color="ink.900">
          Sesli komutlar
        </Text>
        <Text color="ink.400" lineHeight="1.6">
          iPhone&apos;da Kestirmeler + Siri ile listeye ekle; masaüstünde mikrofon ile gezin.
        </Text>
      </VStack>

      <Box className="panel" p={6}>
        <Text fontWeight="700" mb={2} color="ink.800">
          iPhone 15 / iOS 26 — Kestirmeler (önerilen)
        </Text>
        <Text color="ink.500" mb={4} lineHeight="1.7">
          iOS Safari&apos;de tarayıcı ses tanıma çalışmaz. Bunun yerine{" "}
          sistem uygulaması <strong>Kestirmeler</strong> ile PC&apos;ndeki API&apos;ye istek
          atarsın. Web sayfası açık olması gerekmez.
        </Text>
        <UnorderedList spacing={2} color="ink.500" mb={4}>
          <ListItem>
            PC&apos;deki <Code fontSize="sm">.env</Code> dosyasına{" "}
            <Code fontSize="sm">VOICE_API_KEY</Code> ekle (rastgele uzun bir şifre)
          </ListItem>
          <ListItem>
            <strong>Kısayollar</strong> → + → &quot;Siri&apos;ye Sor&quot; → &quot;Ne eklemek
            istiyorsun?&quot;
          </ListItem>
          <ListItem>
            <strong>Metin Birleştir</strong> → <strong>URL</strong> →{" "}
            <strong>URL İçeriğini Al</strong> (Daha Fazla Göster → GET)
          </ListItem>
          <ListItem>
            <strong>Sözlük Değerini Al</strong> → <Code fontSize="sm">message</Code> →{" "}
            <strong>Bildirimi Göster</strong>
          </ListItem>
          <ListItem>Kısayola Siri ifadesi ver: &quot;Watchlist&apos;e ekle&quot;</ListItem>
        </UnorderedList>
        <Text fontSize="sm" color="ink.400" mb={2}>
          URL şablonu (Tailscale MagicDNS veya IP ile değiştir):
        </Text>
        <Code
          display="block"
          whiteSpace="pre-wrap"
          p={3}
          borderRadius="md"
          fontSize="xs"
          bg="cream.100"
        >
          {`http://100.114.66.11:3100/api/voice/add?q=[Giriş]&key=API_ANAHTARIN`}
        </Code>
        <Text fontSize="sm" color="ink.400" mt={3}>
          Kestirmede <Code fontSize="sm">[Giriş]</Code> yerine Sihirli Değişken,
          <Code fontSize="sm">API_ANAHTARIN</Code> yerine .env&apos;deki anahtarı yaz.
        </Text>
      </Box>

      <Box className="panel" p={6}>
        <Text fontWeight="700" mb={2} color="ink.800">
          Tarayıcı mikrofonu (masaüstü)
        </Text>
        <HStack mb={4}>
          <Badge colorScheme={supported ? "green" : appleMobile ? "orange" : "red"}>
            {supported
              ? "Tarayıcı destekliyor"
              : appleMobile
                ? "iOS — Kestirme kullan"
                : "Destek yok"}
          </Badge>
          {listening && <Badge colorScheme="red">Dinleniyor...</Badge>}
        </HStack>

        {appleMobile && !supported && (
          <Text color="ink.500" mb={4} fontSize="sm">
            iPhone&apos;da &quot;Destek yok&quot; normal — Apple Safari web ses tanımayı
            desteklemiyor. Yukarıdaki Kestirmeler + Siri yolu bunun yerine geçer.
          </Text>
        )}

        <Button
          leftIcon={listening ? <FiMicOff /> : <FiMic />}
          onClick={toggleListening}
          isDisabled={!supported}
          size="lg"
          colorScheme={listening ? "red" : "brand"}
        >
          {listening ? "Durdur" : "Dinlemeye başla"}
        </Button>
      </Box>

      {supported && (
        <>
          <Box className="panel" p={6}>
            <Text fontWeight="700" mb={2} color="ink.800">
              Son transcript
            </Text>
            <Text color="ink.600">{transcript || "—"}</Text>
            <Text mt={3} fontSize="sm" color="brand.600" fontWeight="700">
              {lastAction || "Henüz komut yok"}
            </Text>
          </Box>

          <Box className="panel" p={6}>
            <Text fontWeight="700" mb={2} color="ink.800">
              Örnek komutlar
            </Text>
            <UnorderedList spacing={2} color="ink.500">
              <ListItem>&quot;Listeye git&quot;</ListItem>
              <ListItem>&quot;Sıralama&quot; / &quot;Favoriler&quot;</ListItem>
              <ListItem>&quot;İstatistik&quot;</ListItem>
              <ListItem>&quot;Ayarlar&quot;</ListItem>
              <ListItem>&quot;Ara inception&quot;</ListItem>
            </UnorderedList>
          </Box>
        </>
      )}
    </VStack>
  );
}
