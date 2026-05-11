# 🌳 Família Martins

Árvore genealógica interativa, moderna e gamificada da família Martins.

![Família Martins](https://img.shields.io/badge/familia-martins-a78bfa?style=flat-square) ![status](https://img.shields.io/badge/status-ativo-10b981?style=flat-square)

## ✨ Funcionalidades

- 🔒 **Login com senha** — acesso restrito aos familiares
- 🌳 **Árvore foco-cêntrica** — pessoa central com avós, pais, geração, cônjuges, filhos e netos
- 💍 **Múltiplos casamentos** — cada filho ligado à união correta (meio-irmãos detectados automaticamente)
- 👤 **Perfis ricos** — fotos, datas, locais, profissão, biografias e memórias
- 🔗 **Edição inteligente de relações** — selects de pai/mãe pré-preenchidos; sistema acha/cria uniões nos bastidores
- ➕ **Quick-add em qualquer lugar** — botões ❤ e 👶 nos cards, botões grandes na aba Família
- 🔍 **Busca instantânea** — encontra qualquer familiar em tempo real
- 🏆 **Conquistas e gamificação** — 8 badges desbloqueáveis, confete ao adicionar pessoas
- 📊 **Estatísticas** — pessoas, gerações, uniões, fotos, biografias
- 💾 **Persistência local** — salva no navegador (localStorage), backup/restauração em JSON

## 🚀 Como usar localmente

1. Baixe os arquivos (ou clone o repositório)
2. Abra o `index.html` no navegador
3. Senha: `Martins`

## 🌐 Como hospedar online (GitHub Pages)

1. Vá em **Settings → Pages** do repositório
2. Source: `Deploy from a branch` → `main` → `/ (root)`
3. Salve. O site fica disponível em `https://themagicmkt.github.io/familiamartins/`

> ⚠️ **Atenção:** este site é local-only. Cada pessoa que acessa vê SUA própria versão (armazenada no próprio navegador). Para edição compartilhada real entre todos os familiares, é preciso adicionar um backend (Firebase, Supabase, etc.).

## 🛠️ Tecnologias

- HTML5 / CSS3 puro (sem build step)
- JavaScript vanilla (sem frameworks)
- [canvas-confetti](https://github.com/catdad/canvas-confetti) via CDN
- Google Fonts (Manrope + Fraunces)
- LocalStorage para persistência

## 📐 Estrutura

```
familia/
├── index.html       # estrutura
├── styles.css       # visual moderno light + gradientes violeta-rosa
├── script.js        # lógica + dados padrão + gamificação
├── fotos/           # local para fotos importadas (não usado — fotos vão pra localStorage)
└── README.md
```

## 🎨 Paleta

| Cor | Hex | Uso |
|-----|-----|-----|
| Violeta | `#a78bfa` | Cor primária / foco |
| Rosa | `#ec4899` | Acentos / corações |
| Âmbar | `#f59e0b` | Avós |
| Esmeralda | `#10b981` | Filhos |
| Azul | `#3b82f6` | Netos |

---

Feito com 💜 para preservar a memória dos que vieram antes e iluminar os que virão depois.
