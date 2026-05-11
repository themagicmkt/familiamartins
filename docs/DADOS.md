# 🗄️ Modelo de Dados — Família Martins

Referência técnica do **modelo de dados** usado pelo sistema. Útil pra quem quer entender como informação é armazenada, fazer migrações ou estender o schema.

---

## 1. Visão geral

O modelo é inspirado no padrão GEDCOM (genealogia) com 2 entidades centrais:

```
PESSOAS (members)         UNIÕES (unions)
─────────────────         ─────────────────
Cada pessoa tem:          Cada união tem:
- id único                - id único
- nome, gênero            - 2 partners (refs para pessoas)
- datas, locais           - ordem (1ª, 2ª, 3ª união)
- bio, foto               - período (opcional)
- parentUnionId           - filhos: derivado das pessoas
  (de qual união veio)      cujo parentUnionId aponta aqui
```

**Por que uniões em vez de "spouse" direto?**
Permite múltiplos casamentos com filhos de cada um, sem ambiguidade. Cada filho sabe **exatamente de qual união veio** (qual pai + qual mãe), suportando meio-irmãos.

---

## 2. Schema completo

### Raiz (`data` no Supabase)

```ts
{
  members: { [id: string]: Member },
  unions:  { [id: string]: Union },
  config?: { focoId?: string }       // foco é local, não sincronizado
}
```

### Member (pessoa)

```ts
{
  id: string,                      // único, ex: "diogo", "maria_hass"
  nome: string,                    // nome completo
  apelido?: string,                // ex: "Beto"
  genero?: 'M' | 'F' | 'O' | '',   // masculino, feminino, outro
  nascimento?: string,             // "1985", "03/1985" ou "15/03/1985"
  local_nascimento?: string,
  falecimento?: string,            // mesmo formato
  local_falecimento?: string,
  profissao?: string,
  bio?: string,                    // biografia longa
  foto?: string,                   // data:image/jpeg;base64,...
  parentUnionId?: string | null,   // id da união que originou essa pessoa
  principal?: boolean              // se é o "principal" da árvore (Diogo)
}
```

### Union (união / casamento)

```ts
{
  id: string,                      // único, ex: "u_gilberto_nilma"
  partners: [string | null, string | null],  // 2 ids; um pode ser null
  ordem: number,                   // 1ª, 2ª, 3ª... união do pai/mãe principal
  periodo?: string                 // ex: "1985–presente" (livre)
}
```

---

## 3. Conventions sobre IDs

- IDs são **gerados automaticamente** a partir do nome:
  - Lowercase
  - Remove acentos (`José` → `jose`)
  - Substitui não-alfanum por `_`
  - Se já existe, adiciona `_2`, `_3`, ...
- Função: `gerarId(nome)` em `script.js`
- IDs de uniões: `u_<p1>_<p2>` (ex: `u_gilberto_nilma`)
- Função: `gerarUniaoId(p1, p2)`

Não use **IDs com espaço, hífen ou caractere especial** — sempre snake_case ASCII.

---

## 4. Schema SQL no Supabase

```sql
CREATE TABLE family_tree (
  id text PRIMARY KEY,             -- 'martins' (singleton)
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);
```

Toda a árvore mora em **uma única linha** (`id = 'martins'`), com `data` sendo o JSON completo `{ members, unions }`.

**Por que JSON em vez de tabelas normalizadas?**
- Atomicidade: uma única atualização sincroniza tudo
- Realtime: payload completo já vem no WebSocket
- Simplicidade: sem joins, sem schema migrations
- Tamanho: tipicamente <5MB pra famílias até ~300 pessoas com fotos comprimidas

**Trade-off:** edições simultâneas usam **last-write-wins**, sem merge inteligente. OK para escala familiar.

---

## 5. Consultas de parentesco

Funções em `script.js` que computam relações a partir de `members` + `unions`:

| Função | Retorna |
|--------|---------|
| `pessoa(id)` | Member ou undefined |
| `paisDe(id)` | Member[] — pai e mãe (resolve via parentUnionId.partners) |
| `unioesDe(id)` | Union[] — todas as uniões em que id é partner, ordenadas |
| `filhosDeUniao(uid)` | Member[] — filhos de uma união específica |
| `filhosDe(id)` | Member[] — todos os filhos (de todas as uniões) |
| `irmaos(id)` | `{ plenos, meios }` — irmãos plenos + meio-irmãos |
| `avosDe(id)` | Member[] — todos os avós (paternos + maternos) |
| `bisavosDe(id)` | Member[] — todos os bisavós |
| `netosDe(id)` | Member[] — todos os netos |
| `ancestraisPorNivel(id, max=8)` | Member[][] — BFS up to N levels |
| `obterOuCriarUniao(p1, p2)` | string (id) — busca ou cria union |

### Detalhes sobre `irmaos()`

Retorna `{ plenos, meios }`:
- **plenos**: irmãos com o mesmo `parentUnionId`
- **meios**: irmãos que compartilham **apenas um pai/mãe** (via outra union do mesmo pai ou mesma mãe)

A função olha as uniões de cada pai/mãe e cruza com filhos para detectar.

### Detalhes sobre `obterOuCriarUniao(p1Id, p2Id)`

1. Procura union existente com esses 2 partners (em qualquer ordem, aceita um deles null)
2. Se existe, retorna o id
3. Se não, cria com `ordem = unioesDe(p1).length + 1`

Usado quando o usuário muda pai/mãe no form de edição — o sistema acha ou cria a union automaticamente.

---

## 6. Estado padrão (DADOS_PADRAO)

Em `script.js`, constante `DADOS_PADRAO` (~linha 35). Carregada quando:
- Primeira inicialização do banco Supabase (linha 'martins' vazia → seed)
- Usuário clica em "Restaurar dados iniciais"
- Erro fatal de carregamento

Estrutura atual (25 membros, 10 uniões, 5 gerações):

```
                    BISAVÓS PATERNOS
                    José Luiz ❤ Algemira
                            │
                ┌───────────┴───────────┐
                AVÓS PATERNOS          AVÓS MATERNOS
                José Luiz Jr ❤ Ocenia  Eugenio ❤ Adelina
                       │                      │
                       └──────────┬───────────┘
                                  │
                          ┌───────┴────────┐
                          │   3 UNIÕES     │
                          │                │
                  Gilberto ❤ Nilma  Gilberto ❤ Eliane  Gilberto ❤ Ester
                       │                 │                  │
                ┌──┬───┼───┬──┐       ┌──┴──┐           ┌───┴───┐
                Carlos Diogo* Cláudia Vitor  Gilberto Jr  Felipe   Raquel Thiago
                  │      │      │       │
                + 4 cônjuges + 5 netos
```

---

## 7. Persistência

### Browser (localStorage)

```js
const STORAGE_KEY = 'familia_martins_v3';          // cache offline
const VIEWER_KEY  = 'familia_martins_viewer';      // sua identidade
const FOCO_KEY    = 'familia_martins_foco';        // foco atual
const CONQUISTAS_KEY = 'familia_martins_conquistas';
const SESSION_KEY = 'familia_martins_logged';      // sessionStorage
```

### Supabase (banco)

```sql
SELECT * FROM family_tree WHERE id = 'martins';
```

Estrutura na linha:
```json
{
  "id": "martins",
  "data": {
    "members": { /* ... */ },
    "unions":  { /* ... */ }
  },
  "updated_at": "2026-05-11T..."
}
```

⚠️ `config.focoId` **NÃO é sincronizado** com Supabase — fica só local.

---

## 8. Real-time

Subscription:

```js
sb.channel('family_tree_changes')
  .on('postgres_changes',
      { event: '*', schema: 'public', table: 'family_tree',
        filter: 'id=eq.martins' },
      payload => { /* atualiza dados locais e renderiza */ })
  .subscribe();
```

Payload recebido em qualquer mudança:
```json
{
  "eventType": "UPDATE",
  "new": { "id": "martins", "data": {...}, "updated_at": "..." },
  "old": { "id": "martins", "data": {...}, "updated_at": "..." }
}
```

### Deduplicação

Quando você mesmo grava, o servidor te manda o evento de volta. Para não criar loop:

```js
let ultimoSalvarLocal = 0;
function salvar() {
  ultimoSalvarLocal = Date.now();
  // ... grava no Supabase
}

// no listener real-time:
if (Date.now() - ultimoSalvarLocal < 1500) return; // ignora echo
```

---

## 9. Migrações

Não há sistema formal de migrations (sem DDL versionado). Para mudar schema:

### Adicionar campo novo em Member

1. **Frontend**: adicionar campo no form (HTML), no submit (JS), na exibição (perfilFoto, etc.)
2. **Dados existentes**: ficam com o campo `undefined` — basta tratar com `m.campo || ''`
3. **Sem alteração SQL** — `data` é jsonb, aceita qualquer estrutura

### Renomear campo

1. Rodar UPDATE no Supabase:
```sql
UPDATE family_tree
SET data = jsonb_set(
  data - 'members',
  '{members}',
  (SELECT jsonb_object_agg(key,
     value || jsonb_build_object('novo_nome', value->'antigo_nome') - 'antigo_nome')
   FROM jsonb_each(data->'members'))
)
WHERE id = 'martins';
```
2. Atualizar código pra usar `novo_nome`

### Migrar de versão antiga

`carregar()` em `script.js` faz fallback automático para versões anteriores (`v2 → v3`). Para adicionar nova migração, estenda essa função.

---

## 10. Validações

### O que é validado

- **Nome** obrigatório no form (`required` HTML)
- **Datas**: regex `\d{4}` pra extrair ano, sem validação de dia/mês válido
- **IDs únicos**: garantido pelo `gerarId` que verifica `dados.members[id]`
- **Uniões duplicadas**: `obterOuCriarUniao` busca antes de criar
- **Genero**: enum string `'M' | 'F' | 'O' | ''`

### O que NÃO é validado

- Datas de nascimento posteriores a falecimento
- Idade mínima do pai/mãe (impossível um pai de 5 anos)
- Loops genealógicos (alguém é avô de si mesmo)
- Tamanho da foto (apenas redimensiona)

⚠️ Sistema confia no usuário. Para uma família, suficiente.

---

## 11. Exportação / Importação

### Formato exportado

```json
{
  "config": { "focoId": "diogo" },
  "members": { /* ... */ },
  "unions":  { /* ... */ }
}
```

Pretty-printed (`JSON.stringify(dados, null, 2)`).

### Como importar

```js
const novo = JSON.parse(arquivoJson);
if (!novo.members || !novo.unions) throw new Error('inválido');
dados = novo;
salvar();  // sincroniza com Supabase também
renderArvore();
```

⚠️ **SUBSTITUI o banco compartilhado inteiro.** Use com cuidado.

---

## 12. Performance

Para árvores **até ~500 pessoas com fotos**:
- Tamanho do JSON: ~2-5 MB
- Tempo de carga inicial: <1s
- Tempo de render: <100ms
- Real-time latency: <200ms

Acima de 500: começar a considerar:
- Lazy load das fotos (URLs em Storage em vez de base64 inline)
- Paginação ou virtualization na busca
- Separar `members` e `unions` em tabelas distintas

---

## 13. Diagrama ER (lógico)

```
┌──────────────────┐         ┌──────────────────┐
│     MEMBER       │         │      UNION       │
├──────────────────┤         ├──────────────────┤
│ id PK            │         │ id PK            │
│ nome             │         │ partners[0] → M  │◄──┐
│ genero           │         │ partners[1] → M  │◄──┤
│ nascimento       │         │ ordem            │   │
│ ...              │         │ periodo          │   │
│ parentUnionId  ──┼────────►│                  │   │
└──────────────────┘  child  └──────────────────┘   │
        ▲                                            │
        └────────────────────────────────────────────┘
                          partner
```

Relações:
- Um Member tem 0..1 parentUnionId (de qual união nasceu)
- Uma Union tem 2 partners (ambos Member ou null)
- Filhos de uma união = todos os Members com parentUnionId apontando pra ela
- Um Member pode ser partner em N unions (múltiplos casamentos)
