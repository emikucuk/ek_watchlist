# EK Watchlist — CMS alanları (TR + EN)

Slug: `ek-watchlist`  
Formlar: Proje Listesi (temel bilgiler) + Proje Detayları

---

# 1) Temel bilgiler

## Türkçe

| Alan | Değer |
|------|--------|
| **BAŞLIK** | EK Watchlist |
| **URL SLUG** | `ek-watchlist` |
| **ÖZET** | Film ve dizileri tek panelde ara, sırala ve puanla. TMDB entegrasyonu, Tailscale / Siri ile ekleme ve GitHub otomatik yedek. |
| **ROL** | Solo geliştirici |
| **DÖNEM** | 2025 — devam |
| **MÜŞTERİ** | *(boş — kişisel proje)* |
| **CANLI SİTE URL** | *(boş — lokal uygulama; istersen GitHub README)* |
| **DEPO URL** | *(varsa GitHub repo URL’ni yaz)* |
| **Öne çıkan** | İstersen işaretle |
| **Taslak** | Yayınlayınca kaldır |

### Hizmetler (tek tek + Ekle)
- Full-stack geliştirme
- Ürün tasarımı
- DevOps / lokal araçlar

### Teknolojiler (tek tek + Ekle)
- TypeScript
- React
- Vite
- Chakra UI
- TanStack Query
- TanStack Router
- Zustand
- Express
- Prisma
- SQLite
- Zod
- TMDB API
- Electron
- Tailscale

### Ortak çalışanlar
*(boş bırak)*

---

## English

| Field | Value |
|-------|--------|
| **TITLE** | EK Watchlist |
| **URL SLUG** | `ek-watchlist` *(aynı kalır)* |
| **SUMMARY** | A personal watchlist to search, sort, and rate movies and TV shows. TMDB search, Tailscale / Siri add flow, and automatic GitHub backups. |
| **ROLE** | Solo developer |
| **PERIOD** | 2025 — ongoing |
| **CLIENT** | *(leave empty — personal project)* |
| **LIVE SITE URL** | *(leave empty — local app)* |
| **REPO URL** | *(your GitHub URL if public)* |
| **Featured** | optional |
| **Draft** | uncheck when publishing |

### Services
- Full-stack development
- Product design
- Local tooling / DevOps

### Technologies
- TypeScript
- React
- Vite
- Chakra UI
- TanStack Query
- TanStack Router
- Zustand
- Express
- Prisma
- SQLite
- Zod
- TMDB API
- Electron
- Tailscale

### Collaborators
*(leave empty)*

---

# 2) Proje Detayları

## Türkçe

### Kapak ALT METİN
```
EK Watchlist koleksiyon ekranı — film ve dizi kartları grid görünümü
```

### SEO BAŞLIK
```
EK Watchlist — Kişisel film ve dizi listesi uygulaması
```

### SEO AÇIKLAMA
```
TMDB aramalı kişisel watchlist. Sıralama, puan, Tailscale ve Siri ile ekleme, GitHub otomatik yedek. React, Express, Prisma.
```

### İçerik (TR)
Editörde başlıkları **H2**, maddeleri liste yap.

```
Bağlam ve hedef

Dağınık “izlenecekler” notlarını tek panelde toplamak istedim. Film ve dizileri arayıp ekleyebileceğim, durum ve kişisel puanla takip edebileceğim, favorilerimi sıralayabileceğim bir araç. Veri lokal kalsın, telefonda da kullanabileyim, yedek kendiliğinden alınsın.

Sorumluluğum

• Ürün kapsamı, arayüz ve Jungle / Cream tasarım dili
• React paneli (Vite, Chakra, TanStack Query / Router)
• Express API, Prisma + SQLite, Zod doğrulama
• TMDB entegrasyonu, GitHub JSON yedek, Siri / Tailscale voice endpoint
• Electron Dev Panel ile start / stop / log yönetimi

Kısıtlar ve kararlar

• Lokal-first: zorunlu cloud yok, SQLite yeterli
• iOS’ta Web Speech çalışmadığı için Siri Kestirmeleri + REST voice API
• Yedekleme: zamanlanmış aralık + servis kapanırken; her değişiklikte değil
• Monorepo: client, server ve dev-manager ayrımı

Süreç

Önce liste ve TMDB ile ekleme. Sonra durum, puan, drag & drop sıralama ve istatistikler. Ardından Tailscale ile mobil erişim, sesli ekleme ve otomatik GitHub yedek. Son aşamada Dev Panel ve günlük kullanım detayları.

Sonuç

Günlük kullandığım bir watchlist: arama, kartlar, favori sıralama, mobil navigasyon, Siri ile “listeye ekle” ve otomatik yedek. Aynı mimari sonraki kişisel araçlara taşındı.
```

### Galeri sırası
1. grid.png  
2. search.png  
3. rankings.png  
4. settings.png  
5. dev-panel.png  
6. mobile.png  
7. hero.png *(kapakta kullanmadıysan)*

Kapak önerisi: `grid.png` veya `hero.png`

---

## English

### Cover ALT TEXT
```
EK Watchlist collection screen — movie and TV cards in a grid layout
```

### SEO TITLE
```
EK Watchlist — Personal movie & TV watchlist app
```

### SEO DESCRIPTION
```
A personal watchlist with TMDB search, rankings, ratings, Tailscale/Siri add flow, and automatic GitHub backups. Built with React, Express, and Prisma.
```

### Content (EN)
Use **H2** for headings, bullets for lists.

```
Context and goal

I wanted one panel for scattered “to watch” notes. Search and add movies and TV shows, track status and personal ratings, and rank favorites. Keep the data local, use it on my phone, and back it up automatically.

My responsibility

• Product scope, UI, and the Jungle / Cream design system
• React app (Vite, Chakra, TanStack Query / Router)
• Express API, Prisma + SQLite, Zod validation
• TMDB integration, GitHub JSON backups, Siri / Tailscale voice endpoint
• Electron Dev Panel for start / stop / logs

Constraints and decisions

• Local-first: no required cloud; SQLite is enough
• Web Speech fails on iOS → Siri Shortcuts + REST voice API
• Backups on a schedule and on shutdown, not on every edit
• Monorepo: client, server, and dev-manager

Process

Started with the list and TMDB add flow. Then status, ratings, drag-and-drop ordering, and stats. Next came Tailscale mobile access, voice add, and automatic GitHub backups. Finished with the Dev Panel and everyday UX details.

Outcome

A daily-driver watchlist: search, cards, rankings, mobile navigation, Siri “add to list”, and automatic backups. The same architecture carried into later personal tools.
```

---

# 3) Hızlı kopyala — Özet alanları

**Özet TR**
```
Film ve dizileri tek panelde ara, sırala ve puanla. TMDB entegrasyonu, Tailscale / Siri ile ekleme ve GitHub otomatik yedek.
```

**Summary EN**
```
A personal watchlist to search, sort, and rate movies and TV shows. TMDB search, Tailscale / Siri add flow, and automatic GitHub backups.
```

**Rol TR:** `Solo geliştirici`  
**Role EN:** `Solo developer`  

**Dönem TR:** `2025 — devam`  
**Period EN:** `2025 — ongoing`
