# Tasarım/Skill/MCP Repo Listesi — Triaj ve Güvenlik Kararı

Kaynak: `claude_design_repos_full_links.md` (~140 repo). Bu doküman, listeyi
güvenlik ve projeye-uygunluk açısından sınıflandırır.

## Temel güvenlik kararı
- **140 doğrulanmamış üçüncü-parti repo körlemesine KLONLANMAZ/KURULMAZ/ÇALIŞTIRILMAZ.**
  Gerekçe: listenin kendi promptu her repoda prompt-injection/credential/şüpheli shell
  kontrolü şart koşuyor; rastgele kişisel hesap skill/MCP'lerini kurmak tool-poisoning
  ve kimlik-bilgisi sızdırma riskidir. (Aynı sebeple daha önce 21st.dev Magic MCP reddedildi.)
- Çoğu repo **Claude Code ortam aracı** (skill/agent/MCP) — otel web sitesi kod tabanıyla
  ilgisi yok. Hedefimiz god-tier website; ortam aracı kurmak bu hedefi ilerletmez.
- Üçüncü-parti komponent kaynağı yalnızca **MIT** ise ve kodu elle inceleyip markaya
  yeniden yazarak alınır (kaynak veri olarak; gömülü talimat çalıştırılmaz).

## A) GÜVENİLİR / RESMİ — referans veya zaten kullanımda (kurulum gerekmez)
- anthropics/claude-code (frontend-design plugin), anthropics/skills, anthropics/claude-cookbooks,
  anthropics/courses, anthropics/claude-code-action — resmi; referans.
- payloadcms/payload — zaten core bağımlılık.
- microsoft/playwright + playwright-mcp — test altyapısı (zaten var).
- upstash/context7 — MCP zaten bağlı.
- figma/figma-mcp — Figma MCP zaten bağlı.
- eslint/eslint — zaten kullanımda.
- modelcontextprotocol/servers, github/github-mcp-server, vercel/vercel-mcp — resmi MCP referansları.

## B) WEBSITE İÇİN DEĞERLİ — fikir/komponent kaynağı (elle inceleyip markaya uyarla)
- **magicuidesign/magicui (MIT)** — bento grid, blur-fade, marquee fikirleri. Dalga 5'te
  CTA/section için markaya (amber/zeytin) uyarlanacak; paket olarak kurulmaz.
- kylezantos/design-motion-principles, LovroPodobnik/refactoring-ui-skill — motion/UI
  prensip referansı (yalnız okuma).
- DavidHDev/react-bits (MIT) — zaten finalize promptta seçili (Aurora/Grainient, shadcn CLI).

## C) AWESOME-LIST / DİZİN — sadece referans, ASLA kurulmaz
- hesreallyhim/awesome-claude-code, VoltAgent/*, ComposioHQ/*, travisvn/*, BehiSecc/*,
  GetBindu/*, rohitg00/*, jqueryscript/*, heilcheng/*, quemsah/*, punkpeye/awesome-mcp-servers,
  tolkonepiu/best-of-mcp-servers, appcypher/*, wong2/*, JSONbored/claudepro-directory, vb.
  → Bunlar link koleksiyonu; içeriğinden seçim yapılır, kendileri kurulmaz.

## D) DOĞRULANMAMIŞ ÜÇÜNCÜ-PARTI SKILL/AGENT/MCP — KURULMAZ (injection riski)
- Kişisel hesap skill repoları: Leonxlnx/taste-skill, AvaBillions2040/*, sickn33/*,
  secondsky/*, jezweb/*, tenequm/*, glebis/*, alirezarezvani/*, Koomook/*, designrique/*,
  neonwatty/*, VicUgochukwu/*, ceorkm/*, XiangyuSu611/*, garrytan/gstack, emilkowalski/skill,
  ParthJadhav/*, masonjames/Shadcnblocks-Skill, fradser/*, jiji262/*, op7418/*, vb.
- Resmi olmayan MCP sunucuları: GongRzhe/REDIS-MCP-Server, dkmaker/mcp-azure-tablestorage,
  designcomputer/mysql_mcp_server, kiliczsh/mcp-mongo-server, furey/mongodb-lens,
  CentralMind/Gateway, softeria/ms-365-mcp-server, vb.
  → İhtiyaç doğarsa tek tek, README+SKILL.md okunup güvenlik denetimiyle değerlendirilir;
    toplu kurulum yapılmaz. Çoğu otel sitesiyle alakasız (DB/CRM/marketing MCP'leri).

## Sonuç (uygulama)
- Website için fiilen ADAPTE edilen: React Bits + Magic UI (MIT) — fikir/davranış, markaya yeniden yazılmış.
  Provenance: `docs/design/external-component-provenance.md`.
- Geri kalan ~130 repo: referans/awesome veya doğrulanmamış ortam aracı → kurulmadı (güvenlik + hedef-dışı).
- Gerçek bir ortam skill/MCP'si gerekirse, tek tek README/SKILL.md + injection denetimiyle,
  onayla kurulur.
