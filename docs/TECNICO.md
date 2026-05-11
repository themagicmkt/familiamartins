# 🛠️ Guia Técnico — Família Martins

Documentação para **admins** e **desenvolvedores** que querem manter, customizar ou estender o sistema.

---

## 1. Stack tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5 + CSS3 + JavaScript ES2015+ vanilla |
| Tipografia | Google Fonts: **Manrope** (sans) + **Fraunces** (serif) |
| Animação | CSS transitions/transforms + [canvas-confetti](https://github.com/catdad/canvas-confetti) via CDN |
| Backend | [Supabase](https://supabase.com) — PostgreSQL + Realtime |
| Hospedagem | GitHub Pages (estática) |
| Build | **Nenhum** — sem webpack, vite, npm install nada |

Toda a aplicação cabe em 3 arquivos: `index.html`, `styles.css`, `script.js`.

---

## 2. Estrutura de arquivos

```
familia/
├── index.html              # Estrutura HTML, meta tags, modais, formulário
├── styles.css              # Estilo completo, ~1300 linhas
├── script.js               # Lógica completa, ~1500 linhas
├── favicon.svg             # Ícone (árvore com gradiente violeta-rosa)
├── og-image.png            # Open Graph 1200x630 (gerada via PowerShell)
├── README.md               # README do GitHub
├── .gitignore              # Ignora backups JSON e arquivos de sistema
├── fotos/
│   └── LEIA-ME.txt         # Pasta legada — fotos atuais vão no Supabase
└── docs/                   # Esta documentação
    ├── README.md
    ├── USUARIO.md
    ├── TECNICO.md (este)
    └── DADOS.md
```

---

## 3. Como rodar localmente

Não precisa de build. Duas opções:

**a) Abrir direto** (mais simples)
```
Duplo clique em index.html → abre no navegador
```
⚠️ Algumas funções podem dar problema no protocolo `file://` (por exemplo, `fetch` para Supabase pode ser bloqueado por CORS dependendo do navegador).

**b) Servidor local** (recomendado)
```bash
# Python 3
python -m http.server 8000

# Node (com http-server global instalado)
npx http-server -p 8000

# PHP
php -S localhost:8000
```
Depois abra `http://localhost:8000`.

---

## 4. Como hospedar online

### GitHub Pages (atual, recomendado)

1. Vá em **Settings → Pages** do repositório no GitHub
2. **Source**: `Deploy from a branch`
3. **Branch**: `main` · **Folder**: `/ (root)`
4. **Save**
5. Aguarde 1-2 min. Site fica em `https://USUARIO.github.io/REPO/`

Custo: **R$0**. Suporta domínio custom.

### Alternativas
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop ou conexão com GitHub
- **Qualquer host estático** — basta servir os arquivos HTML/CSS/JS

---

## 5. Configuração do Supabase

### 5.1. Criar projeto

1. Login em https://supabase.com/dashboard
2. **New project** → escolha nome, senha do banco, região
3. Aguarde provisionamento (~2 min)

### 5.2. Criar tabela `family_tree`

Vá em **SQL Editor → New query** e cole:

```sql
CREATE TABLE IF NOT EXISTS family_tree (
  id text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO family_tree (id, data) VALUES ('martins', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE family_tree ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read"   ON family_tree FOR SELECT USING (true);
CREATE POLICY "public_write"  ON family_tree FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_insert" ON family_tree FOR INSERT WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE family_tree;
```

Clique **Run**. Vai retornar `Success. No rows returned`.

### 5.3. Pegar chaves públicas

Em **Settings → API**:
- **Project URL** — algo como `https://xxx.supabase.co`
- **Publishable key** (`sb_publishable_...`) ou **anon key** (JWT `eyJ...`)

### 5.4. Configurar no código

Em `script.js` (linhas iniciais):

```js
const SUPABASE_URL = 'https://enokbsywczmoijwqqytv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EOtbDtXXnPVoD0tQDcyBAA_vt2Q_DgU';
const SB_TABLE = 'family_tree';
const SB_ROW_ID = 'martins';
```

Substitua `SUPABASE_URL` e `SUPABASE_KEY` pelos valores do seu projeto.

⚠️ **Importante:** essas chaves são **públicas e seguras** (anon/publishable). NÃO commit a chave `sb_secret_*` (service role).

---

## 6. Segurança e permissões

### Modelo atual: confiança total na senha

- Tabela `family_tree` com **RLS aberto** (qualquer um com a chave anon pode ler/escrever)
- Frontend protegido só por senha (`Martins`) hardcoded em `script.js`
- Qualquer pessoa pode inspecionar o código e descobrir a senha

**OK para uma família**, mas **não use em contextos com dados sensíveis ou hostis**.

### Como endurecer (opcional)

1. **Adicionar auth real do Supabase**: emails + magic link
2. **Restringir RLS**: só usuários autenticados podem escrever
3. **Mover senha pra hash**: usar bcrypt ou similar
4. **Auditar mudanças**: tabela `audit_log` com triggers

---

## 7. Customização

### 7.1. Trocar a paleta de cores

Edite `styles.css` linhas 6-37 (variáveis CSS `:root`):

```css
:root {
  --primary-1: #a78bfa;    /* violeta */
  --primary-2: #ec4899;    /* rosa */
  --primary-grad: linear-gradient(135deg, #a78bfa 0%, #ec4899 100%);
  --gen-avos:    #f59e0b;  /* âmbar */
  --gen-pais:    #ec4899;  /* rosa */
  --gen-eu:      #a78bfa;  /* violeta */
  --gen-filhos:  #10b981;  /* esmeralda */
  --gen-netos:   #3b82f6;  /* azul */
  /* ... */
}
```

### 7.2. Trocar a senha de login

Em `script.js`, primeira linha de config:

```js
const SENHA = 'Martins';  // mude aqui
```

### 7.3. Trocar nome da família / branding

- `index.html`: `<title>`, `.brand-text strong`, meta tags OG
- `styles.css`: nada (genérico)
- `script.js`: comentários e mensagens em strings
- `favicon.svg`: SVG editável manualmente
- `og-image.png`: regenere via PowerShell (veja seção 8)

### 7.4. Mudar dados padrão (sementes iniciais)

Em `script.js`, constante `DADOS_PADRAO` (linhas ~35-130). Estrutura:

```js
const DADOS_PADRAO = {
  config: { focoId: 'diogo' },
  members: {
    [id]: { id, nome, genero, bio, parentUnionId, ... }
  },
  unions: {
    [id]: { id, partners: [p1id, p2id], ordem, periodo }
  }
};
```

Detalhes completos em [DADOS.md](DADOS.md).

### 7.5. Adicionar novas conquistas

`script.js`, constante `CONQUISTAS` (~linha 145):

```js
const CONQUISTAS = [
  { id: 'cinco_uniões', emoji: '💍', titulo: 'Romântico',
    desc: '5 casamentos registrados',
    test: () => Object.keys(dados.unions).length >= 5 },
  // adicione mais aqui
];
```

A função `test()` deve retornar `true` quando a conquista for atingida. É verificada após cada salvar.

---

## 8. Regenerar a OG image

A OG image (`og-image.png`, 1200×630) é gerada via PowerShell + System.Drawing. Para regerar:

```powershell
Add-Type -AssemblyName System.Drawing
# ... script de geração (veja git log do commit "Adiciona favicon SVG e OG image")
```

Alternativa: substitua manualmente por qualquer PNG 1200×630 com o mesmo nome.

---

## 9. Modo offline e sincronização

### Como funciona

- Toda mudança chama `salvar()` que:
  1. Atualiza `localStorage` (cache instantâneo)
  2. Dispara `sb.from('family_tree').update(...)` em background (fire-and-forget)
- Toda página carrega via `carregar()` que:
  1. Tenta `select` no Supabase
  2. Se falhar, usa cache `localStorage`
  3. Se ambos falharem, usa `DADOS_PADRAO`
- Real-time via `sb.channel('family_tree_changes').on('postgres_changes', ...)`:
  - Recebe mudanças de outros navegadores
  - Ignora "echoes" do próprio salvar (janela de 1.5s)
  - Atualiza `dados.members` e `dados.unions`, renderiza, mostra toast

### Indicador visual

O subtítulo do logo no topbar mostra:
- 🟢 `online · sincronizado`
- ⚠️ `offline`

Variável: `modoOffline` em `script.js`.

---

## 10. Operações administrativas

### Editar dados diretamente no Supabase

Use o **Table Editor** do Supabase ou o SQL editor:

```sql
-- Ver o JSON completo
SELECT data FROM family_tree WHERE id = 'martins';

-- Adicionar uma pessoa manualmente
UPDATE family_tree
SET data = jsonb_set(
  data,
  '{members,nova_pessoa}',
  '{"id":"nova_pessoa","nome":"Fulano","genero":"M","parentUnionId":null}'::jsonb
)
WHERE id = 'martins';

-- Resetar tudo (CUIDADO!)
UPDATE family_tree SET data = '{}'::jsonb WHERE id = 'martins';
-- Depois recarregue o site → ele vai seedar com DADOS_PADRAO
```

### Backup manual

```bash
curl -s -H "apikey: SUA_CHAVE" \
  "https://SEU_PROJETO.supabase.co/rest/v1/family_tree?select=data&id=eq.martins" \
  | jq '.[0].data' > backup-$(date +%Y%m%d).json
```

### Conectar via psql

```bash
psql "postgresql://postgres:SENHA_DO_BANCO@db.SEU_PROJETO.supabase.co:5432/postgres"
```

Senha do banco: o usuário configurou ao criar o projeto.

---

## 11. Como deployar uma mudança

1. Edite arquivos localmente
2. Teste abrindo o `index.html` direto
3. Commit:
   ```bash
   git add .
   git commit -m "Descrição breve"
   git push
   ```
4. GitHub Pages **republica em 30-60 segundos** automaticamente
5. Os familiares com a página aberta **continuam vendo a versão antiga até refresh** — o real-time atualiza dados, não código

---

## 12. Debug e troubleshooting

### Site abre com erro

Abra **DevTools (F12) → Console**. Erros vermelhos indicam:
- `TypeError: Cannot read properties of undefined` → algum elemento DOM faltando ou `dados` não carregado
- `404 family_tree` → tabela não criada no Supabase
- `401 unauthorized` → chave anon errada
- `Failed to fetch` → offline ou URL errada

### Real-time não funciona

- Em **Database → Replication** do Supabase, certifique-se de que `family_tree` está marcada como replicada
- Verifique no DevTools → Network → WS — deve ter conexão WebSocket aberta para `wss://...supabase.co/realtime/v1/websocket`

### Foto não carrega

- Fotos são armazenadas como **base64** dentro do JSON `data`
- Limite prático: ~30 fotos de 600px (~1.5 MB total no jsonb)
- Se ultrapassar, migrar para Supabase Storage (não implementado ainda)

---

## 13. Limites conhecidos

| Limite | Valor | Notas |
|--------|-------|-------|
| Tamanho de uma linha jsonb | ~256 MB (Postgres) | Limite prático: ~5MB |
| Fotos | 600px max width (auto) | base64 dentro do JSON |
| Membros simultâneos | ~500 | Performance OK até aí |
| Conflitos de edição | Last write wins | 2 pessoas editando → última grava |
| Histórico | Sem versionamento | Mudanças são permanentes |

---

## 14. Roadmap (sugestões futuras)

- 📷 **Fotos em Supabase Storage** (bucket separado, URLs persistidas)
- 🔐 **Auth com email + magic link** (já que o frontend é estático)
- 📜 **Histórico de mudanças** (audit log)
- 🌐 **Internacionalização** (en, es)
- 🗺️ **Mapa** mostrando locais de nascimento
- 📊 **Timeline** com eventos da família
- 🔗 **Compartilhar link de pessoa** (`/?id=diogo` abre o perfil direto)
- 📱 **PWA** (manifest.json + service worker pra "instalar" no celular)
- 👥 **Permissões por usuário** (admin / editor / leitor)

---

## 15. Glossário

- **Foco** — pessoa central da árvore, varia por navegador
- **Viewer** — quem é "você", salvo localmente
- **União** — relação entre 2 pessoas (casamento, parceria) que pode ter filhos
- **parentUnionId** — qual união originou esta pessoa
- **Partners** — array de 2 ids dentro de uma união (pode ter `null`)
- **Camada / layer** — fileira horizontal da árvore (Avós, Pais, etc.)
- **acaoContexto** — estado interno que diz "estamos adicionando filho de X"
