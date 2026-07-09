# Lucas Stolpe — Portfólio

SPA (Single Page Application) do portfólio pessoal de Lucas Henrique Stolpe, Data Engineer & BI Analyst. Construído com **Vite + React + TypeScript**, totalmente **componentizado** (uma seção = um componente) e **config-driven** (todo o conteúdo do site vem de um JSON, sem texto hardcoded nos componentes).

🔗 **Site publicado:** https://stolpe22.github.io/lucas-portfolio-wip/

## Stack

- **Vite** — build tool e dev server
- **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first config, sem `tailwind.config.js`)
- Deploy automático via **GitHub Actions** → **GitHub Pages**

Sem framework de roteamento (é uma página única com navegação por âncora) e sem backend próprio — a única chamada de rede em runtime é opcional (ver seção de GitHub abaixo).

## Como rodar localmente

```bash
npm install
npm run dev       # servidor de desenvolvimento (http://localhost:5173)
npm run build     # build de produção (tsc + vite build) em dist/
npm run preview   # serve o build de produção localmente
npm run lint      # eslint
```

## Arquitetura config-driven

Todo o conteúdo textual do site (textos, links, listas de skills, experiências, projetos, certificações etc.) vive em dois arquivos JSON, um por idioma:

```
src/config/content.json      # Português (padrão)
src/config/content.en.json   # English
src/config/content.ts        # carrega e tipa os JSONs (SupportedLanguage, localizedContent)
src/types/content.ts         # interface SiteContent — contrato de tipos dos JSONs
```

Os dois JSONs têm **paridade estrutural total** (mesmas chaves) — trocar de idioma no site só troca qual objeto é usado, sem lógica condicional espalhada pelos componentes. Pra editar qualquer texto do site (título, parágrafo, item de skill, vaga, projeto, link de contato...), basta editar os JSONs — não precisa mexer em componente nenhum.

O idioma é detectado automaticamente pelo navegador (`navigator.language`) na primeira visita e depois fica salvo em `localStorage` (chave `ls-lang`).

## Estrutura de pastas

```
src/
  main.tsx                  # entry point, importa styles/tailwind.css
  App.tsx                   # compõe todas as seções, gerencia idioma/tema/github/easter egg
  config/                   # content.json, content.en.json, content.ts
  types/                    # SiteContent, GithubRepo
  components/
    nav/                    # Nav.tsx (scroll-spy, tema, idioma, menu mobile)
    hero/                   # Hero.tsx (wordmark, foto com cabeça que segue o mouse, glow, DAG decorativo)
    dice/                   # DiceNavigator.tsx (widget de navegação aleatória)
    about/, skills/, experience/, projects/, education/, contact/, footer/
    github/                 # GithubRepos.tsx (grid de repositórios com busca/ordenação)
    shared/                 # SectionHead, Confetti, EasterEggModal, ícones
  hooks/                    # useTheme, useLanguage, useScrollSpy, useNavScrolled, useReveal,
                             # useGithubRepos, useTypedKeyword
  styles/tailwind.css       # design tokens (CSS vars), tema dark/light, keyframes de animação
public/                     # assets estáticos servidos como estão (favicon, fotos, og-image, etc.)
scripts/
  fetch-github-repos.mjs    # busca os repositórios do GitHub e gera public/github-repos.json
.github/workflows/
  deploy-pages.yml          # build + deploy pro GitHub Pages (push, manual, ou a cada hora)
```

## Seções da página

Nav → Hero → About → Experience → Skills → Projects → GitHub Repos → Education → Contact → Footer, mais o `DiceNavigator` (widget flutuante) sobreposto ao Hero.

## Recursos e detalhes de implementação

### Tema claro/escuro
`useTheme` alterna `data-theme` no `<html>` e persiste em `localStorage` (`ls-theme`). Todos os tokens de cor são CSS custom properties em `tailwind.css`, então o tema não precisa de lógica condicional nos componentes.

### Foto do Hero com cabeça que segue o mouse
A foto é dividida em três camadas PNG com fundo transparente (`public/lucas_stolpe_body.png`, `lucas_stolpe_head.png`, `lucas_stolpe_head_right.png` — a última é o espelho horizontal da cabeça). O corpo fica parado; a cabeça inclina em 3D (`rotateX`/`rotateY`) seguindo o ponteiro do mouse via `requestAnimationFrame`, e troca entre a versão original (olhando pra esquerda) e a espelhada (olhando pra direita) dependendo de qual lado da imagem o mouse está, com uma pequena zona de histerese pra não "piscar" perto do centro. Respeita `prefers-reduced-motion`.

### Widget do dado (`DiceNavigator`)
Botão flutuante que, ao ser clicado, rola um dado animado e navega até uma seção aleatória da página, com uma mensagem contextual sobre a seção sorteada.

### Easter egg
Digitar **"lucas"** em qualquer lugar da página (fora de campos de texto) abre um modal com confete e algumas curiosidades pessoais. Implementado em `useTypedKeyword` + `EasterEggModal` + `Confetti`, com todo o texto vindo de `content.json`/`content.en.json` (`ui.easterEgg`).

### Seção "Repositórios do GitHub" — como funciona

A seção `#repos` (`GithubRepos.tsx`) mostra um grid dos repositórios públicos, com busca e ordenação — mas **o navegador do visitante nunca chama a API do GitHub diretamente**. Isso existe porque a API pública do GitHub tem limite de **60 requisições/hora por IP sem autenticação**, e esse limite é fácil de estourar (uma rede compartilhada, tipo escritório/escola, já pode ter esgotado a cota de outra pessoa) — foi o que motivou esse desenho.

**De onde vêm os dados (build/deploy):**
1. `scripts/fetch-github-repos.mjs` lê `username`/`perPage` de `src/config/content.json` (config única, sem duplicar em dois lugares), busca `GET /users/{username}/repos` na API do GitHub e salva o resultado em `public/github-repos.json` (`{ fetchedAt, repos }`).
2. O workflow `.github/workflows/deploy-pages.yml` roda esse script **antes** do build, autenticado com o `GITHUB_TOKEN` que o Actions já injeta automaticamente (limite de 5000 req/hora — bem folgado, mesmo autenticado com um token que só tem permissão de leitura).
3. Esse workflow é disparado a cada push, manualmente, **e automaticamente a cada hora** (`schedule: cron "0 * * * *"`) — então o snapshot nunca fica desatualizado por mais de ~1h, mesmo sem ninguém mexer no repositório.
4. Em dev local, rode `npm run fetch:github` pra gerar/atualizar o arquivo na mão (sem token, funciona também, só com o limite não-autenticado).

**Como o site consome isso (runtime):** `useGithubRepos` busca `github-repos.json` como um arquivo estático normal (mesma origem, sem limite de taxa nenhum) e guarda uma cópia em `localStorage` (`ls-github-repos-cache`). Nas próximas visitas, os dados do cache aparecem instantaneamente (sem tela de carregamento) enquanto uma atualização em segundo plano acontece só se o cache tiver mais de 1h. Se a busca falhar (site estático fora do ar, sem internet etc.) mas já existir algo em cache — mesmo antigo — o site continua mostrando esses dados em vez de erro. A mensagem de erro (`ui.github.loadingError`, com link direto pro perfil do GitHub) só aparece se não houver cache nenhum **e** a busca falhar — ou seja, praticamente só na primeiríssima visita de alguém, num momento de indisponibilidade.

**Na interface:** busca por nome/descrição/linguagem e ordenação (mais recentes, mais estrelas, nome A-Z) são filtros 100% client-side sobre os dados já carregados (`useMemo` em `GithubRepos.tsx`, sem nenhuma chamada de rede extra). Enquanto carrega, aparecem 6 cards-esqueleto (`animate-pulse`); cada card mostra nome, descrição, linguagem principal (com uma bolinha colorida por linguagem, mapa em `LANG_COLORS`), estrelas e forks.

### SEO
- Open Graph + Twitter Card (`index.html`), com imagem dedicada (`public/og-image.png`, 1200×630) reaproveitando a wordmark do site.
- JSON-LD (`schema.org/Person`) com nome, cargo e links (GitHub, LinkedIn).
- `robots.txt` e `sitemap.xml`.

### Acessibilidade e movimento
Animações decorativas (glow do hero, DAG de fundo, tilt da foto, confete) respeitam `prefers-reduced-motion` e são desativadas quando o usuário pede menos movimento no sistema operacional.

## Deploy

O deploy é 100% automático via `.github/workflows/deploy-pages.yml`, disparado por:
- push em `main`/`master`
- manualmente (aba **Actions** → *Deploy GitHub Pages* → **Run workflow**)
- automaticamente **a cada hora**, pra manter o snapshot de repositórios atualizado

O workflow builda o site (`npm run build`) e publica a pasta `dist/` no GitHub Pages. Não precisa de nenhuma configuração de secret manual — o token usado é o `GITHUB_TOKEN` que o Actions já injeta automaticamente em toda execução.

> Workflows agendados (`schedule`) são desativados automaticamente pelo GitHub após 60 dias sem nenhum commit no repositório. Basta um novo push (ou disparo manual) pra reativar.
