# Portfolio gövde HTML

Site talimatlarına göre (`project-body-html.md` + `design-system.md`) hazırlandı.

| Dosya | Kullanım |
|-------|----------|
| `index.html` | **TR** gövde — TinyMCE İçerik (TR) → Kaynak görünümüne yapıştır |
| `body-en.html` | **EN** gövde — İçerik (EN) |
| `images/` | Yerel kopyalar; sunucuya `/img/projects/ek-watchlist/` altına yükle |
| `CMS-ALANLARI.md` | Başlık, SEO, hizmetler vb. form alanları |

## Görsel yolları (sunucu)

```
/img/projects/ek-watchlist/grid.png
/img/projects/ek-watchlist/search.png
/img/projects/ek-watchlist/rankings.png
/img/projects/ek-watchlist/settings.png
/img/projects/ek-watchlist/dev-panel.png
/img/projects/ek-watchlist/mobile.png
/img/projects/ek-watchlist/hero.png
```

Lightbox grubu: `data-fslightbox="ek-watchlist"` (slug ile aynı).

## Yapma

- `h1`, özel CSS, Swiper/fslightbox script’i ekleme — sitede zaten var
- Class adlarını değiştirme (`case-gallery`, `case-swiper`, …)

## Yapıştırma

1. Görselleri Dosya Yönetimi’ne yükle  
2. `index.html` içeriğini (yorum satırları hariç veya dahil — zararsız) TR içeriğe yapıştır  
3. `body-en.html` → EN  
4. Kaydet; detay sayfasında Swiper + lightbox otomatik bağlanır
