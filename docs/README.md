# 📚 Documentação — Família Martins

Site de árvore genealógica interativa, gamificada e compartilhada em tempo real, da família Martins.

🔗 **Site:** https://themagicmkt.github.io/familiamartins/ (quando GitHub Pages estiver ativo)
🔗 **Repo:** https://github.com/themagicmkt/familiamartins

---

## 📖 Como usar esta documentação

| Documento | Para quem | O que tem |
|-----------|-----------|-----------|
| [**👨‍👩‍👧 Guia do Usuário**](USUARIO.md) | Família e parentes | Como entrar, navegar, editar e adicionar pessoas |
| [**🛠️ Guia Técnico**](TECNICO.md) | Admin / desenvolvedor | Arquitetura, deploy, Supabase, customização |
| [**🗄️ Modelo de Dados**](DADOS.md) | Quem quer entender ou estender | Estrutura `members`, `unions`, SQL, parentesco |

Se você é um **familiar querendo só usar**, comece pelo [Guia do Usuário](USUARIO.md).
Se você é **dev/admin**, comece pelo [Guia Técnico](TECNICO.md).

---

## ⚡ Quick start

**Para usar (familiares):**

1. Abra https://themagicmkt.github.io/familiamartins/
2. Digite a senha: `Martins`
3. Na primeira visita, escolha quem você é na lista
4. Clique em qualquer pessoa para editar ou adicionar parentes

**Para rodar local (desenvolvedor):**

```bash
git clone https://github.com/themagicmkt/familiamartins.git
cd familiamartins
# Abra index.html diretamente no navegador, ou:
python -m http.server 8000  # depois: localhost:8000
```

Não há build step — é HTML/CSS/JS puro com bibliotecas via CDN.

---

## 🏗️ Visão geral da arquitetura

```
┌──────────────────────────────────────────────────────┐
│  Navegador (frontend)                                │
│  • index.html  → estrutura + meta tags + CDNs        │
│  • styles.css  → visual moderno violeta/rosa         │
│  • script.js   → lógica + render + Supabase client   │
└──────────────┬───────────────────────────────────────┘
               │ (Real-time WebSocket + REST)
               ▼
┌──────────────────────────────────────────────────────┐
│  Supabase (backend)                                  │
│  • Tabela: family_tree (id, data jsonb, updated_at)  │
│  • RLS: leitura/escrita pública (proteção via senha) │
│  • Realtime: propaga mudanças entre navegadores      │
└──────────────────────────────────────────────────────┘
```

Sem build, sem framework, sem servidor próprio. **Stack:** HTML + CSS + JS puro + Supabase via CDN.

---

## ✨ Funcionalidades principais

- 🔐 **Login compartilhado** (senha `Martins`)
- 🌳 **Árvore foco-cêntrica** — bisavós, avós, pais, geração, uniões+filhos, netos
- 👤 **Quem é você?** — cada visitante escolhe sua identidade e vê tudo do ponto de vista dele
- 💍 **Múltiplos casamentos** — meio-irmãos detectados automaticamente
- 🔗 **Pais separados por linhagem** — paterno x materno em blocos distintos
- 📋 **Perfil rico** com 3 abas: Informações · Família · Memórias
- 🔍 **Busca em tempo real** no topbar
- 🏆 **8 conquistas desbloqueáveis** com confete
- ☁️ **Banco compartilhado em tempo real** via Supabase
- 💾 **Modo offline** com cache em localStorage
- 📷 **Upload de fotos** com redimensionamento automático
- 🎉 **Onboarding guiado** pra novos familiares começarem sua linhagem

---

## 📜 Histórico de versões

Veja os [commits no GitHub](https://github.com/themagicmkt/familiamartins/commits/main) — cada commit tem descrição detalhada do que mudou.

Marcos importantes:
- **v1** (localStorage) — primeira versão, dados só no navegador
- **v2** (uniões) — modelo de dados refeito para suportar múltiplos casamentos
- **v3** (Supabase) — banco compartilhado em tempo real, real-time sync
- **v3.1** (linhagem separada) — avós paternos/maternos em blocos distintos
