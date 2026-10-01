# Fotografii Brigitta

Încarcă aici fotografii reale aprobate, apoi completează `siteContent.photos` în `src/lib/site.ts`.

| Slot activ | Fișier | Rezoluție recomandată | Format |
| --- | --- | --- | --- |
| Hero | hero.webp | 1600 × 2000 px (4:5) | WebP / AVIF |
| Experiență live | live.webp | 1600 × 2000 px (4:5) | WebP / AVIF |
| Portret | portrait.webp | 1200 × 1600 px (3:4) | WebP / AVIF |
| Social / Open Graph | social.jpg | 1200 × 630 px | JPEG |

Țintește 120–400 KB per fotografie și sub 250 KB pentru social. Cadrele responsive decupează marginile; păstrează chipul în zona centrală, cu spațiu deasupra capului. Ajustează `position` pentru punctul focal și verifică mobilul. Nu mări artificial imagini mici.

Exemplu de cale: `/images/brigitta/hero.webp` (fără `public`). Câmpurile `alt` descriu fotografia în română. Sloturile goale afișează grafica abstractă, fără fotografie inventată.

Sloturile landscape/stage/atmosphere/editorial sunt rezervate și nu apar în homepage-ul actual. Pentru extinderi cu imagini late: 1800 × 1200 px.

Pașii pentru contact, texte, prețuri, încărcarea fotografiilor și deployment: [ghidul de actualizare](../../../docs/actualizare-site.md).
