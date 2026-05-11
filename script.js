// ============================================================
// FAMILIA MARTINS - Arvore Genealogica (versão moderna)
// ============================================================

const SENHA = 'Martins';
const STORAGE_KEY = 'familia_martins_v3';      // fallback offline
const SESSION_KEY = 'familia_martins_logged';
const CONQUISTAS_KEY = 'familia_martins_conquistas';
const VIEWER_KEY = 'familia_martins_viewer';    // Quem é você (por navegador)
const FOCO_KEY = 'familia_martins_foco';        // Foco atual (por navegador)

// === Supabase config (chaves públicas — seguras no frontend) ===
const SUPABASE_URL = 'https://enokbsywczmoijwqqytv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EOtbDtXXnPVoD0tQDcyBAA_vt2Q_DgU';
const SB_TABLE = 'family_tree';
const SB_ROW_ID = 'martins';
const sb = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

let modoOffline = !sb; // se SDK não carregou, usa só localStorage
let ultimoSalvarLocal = 0; // para ignorar echoes do real-time

// ============================================================
// DADOS PADRAO
// ============================================================
const DADOS_PADRAO = {
  config: { focoId: 'diogo' },
  members: {
    // === Bisavós paternos ===
    jose_luiz:    { id: 'jose_luiz', nome: 'José Luiz Martins', genero: 'M',
                    bio: 'Bisavô paterno. Raiz mais antiga conhecida da nossa linhagem Martins.',
                    parentUnionId: null },
    algemira:     { id: 'algemira', nome: 'Algemira Shatzmam Martins', genero: 'F',
                    bio: 'Bisavó paterna. Esposa de José Luiz Martins.',
                    parentUnionId: null },

    // === Avós paternos ===
    jose_luiz_jr: { id: 'jose_luiz_jr', nome: 'José Luiz Martins Junior', genero: 'M',
                    bio: 'Avô paterno. Filho de José Luiz e Algemira, pai de Gilberto.',
                    parentUnionId: 'u_jose_algemira' },
    ocenia:       { id: 'ocenia', nome: 'Ocenia Martins', genero: 'F',
                    bio: 'Avó paterna. Esposa de José Luiz Junior, mãe de Gilberto.',
                    parentUnionId: null },

    gilberto: { id: 'gilberto', nome: 'Gilberto Carlos Martins', genero: 'M',
                bio: 'Patriarca da nossa linhagem Martins. Casou três vezes e teve oito filhos.',
                parentUnionId: 'u_jose_jr' },
    nilma:    { id: 'nilma', nome: 'Nilma Costa Martins', genero: 'F',
                bio: 'Primeira esposa de Gilberto.', parentUnionId: null },
    eliane:   { id: 'eliane', nome: 'Eliane Solange Leal', genero: 'F',
                bio: 'Segunda esposa de Gilberto.', parentUnionId: null },
    ester:    { id: 'ester', nome: 'Ester Martins', genero: 'F',
                bio: 'Terceira esposa de Gilberto.', parentUnionId: null },

    carlos:   { id: 'carlos', nome: 'Carlos Rodrigo Martins', genero: 'M',
                bio: 'Irmão mais velho.', parentUnionId: 'u_gilberto_nilma' },
    diogo:    { id: 'diogo', nome: 'Diogo Álvares Martins', genero: 'M',
                bio: 'O elo central desta árvore.',
                principal: true, parentUnionId: 'u_gilberto_nilma' },
    claudia:  { id: 'claudia', nome: 'Cláudia Caroline Martins', genero: 'F',
                parentUnionId: 'u_gilberto_nilma' },
    vitor:    { id: 'vitor', nome: 'Vitor Hugo Martins', genero: 'M',
                parentUnionId: 'u_gilberto_nilma' },

    gilberto_jr: { id: 'gilberto_jr', nome: 'Gilberto Carlos Martins Júnior', apelido: 'Gilberto Jr',
                   genero: 'M', parentUnionId: 'u_gilberto_eliane' },
    felipe:      { id: 'felipe', nome: 'Felipe Martins', genero: 'M',
                   parentUnionId: 'u_gilberto_eliane' },

    raquel:   { id: 'raquel', nome: 'Raquel Martins', genero: 'F',
                parentUnionId: 'u_gilberto_ester' },
    thiago:   { id: 'thiago', nome: 'Thiago Martins', genero: 'M',
                parentUnionId: 'u_gilberto_ester' },

    maria_hass:    { id: 'maria_hass', nome: 'Maria Flores Hass', genero: 'F',
                     bio: 'Esposa de Diogo, mãe de João.', parentUnionId: null },
    vanessa:       { id: 'vanessa', nome: 'Vanessa Martins', genero: 'F', parentUnionId: null },
    carlos_pierre: { id: 'carlos_pierre', nome: 'Carlos Alberto Pierre', genero: 'M', parentUnionId: null },
    francine:      { id: 'francine', nome: 'Francine Martins', genero: 'F', parentUnionId: null },

    pedro_henrique: { id: 'pedro_henrique', nome: 'Pedro Henrique Martins', genero: 'M',
                      parentUnionId: 'u_carlos_vanessa' },
    isaac:          { id: 'isaac', nome: 'Isaac Martins', genero: 'M',
                      parentUnionId: 'u_carlos_vanessa' },
    joao:           { id: 'joao', nome: 'João Flores Hass Martins', genero: 'M',
                      bio: 'A nova geração.', parentUnionId: 'u_diogo_maria' },
    carlos_eduardo: { id: 'carlos_eduardo', nome: 'Carlos Eduardo Pierre Martins', genero: 'M',
                      parentUnionId: 'u_claudia_carlospierre' },
    camila:         { id: 'camila', nome: 'Camila Martins', genero: 'F',
                      parentUnionId: 'u_vitor_francine' }
  },
  unions: {
    // Ancestrais
    u_jose_algemira: { id: 'u_jose_algemira', partners: ['jose_luiz', 'algemira'], ordem: 1, periodo: '' },
    u_jose_jr:       { id: 'u_jose_jr',       partners: ['jose_luiz_jr', 'ocenia'], ordem: 1, periodo: '' },

    u_gilberto_nilma:  { id: 'u_gilberto_nilma',  partners: ['gilberto', 'nilma'],  ordem: 1, periodo: '' },
    u_gilberto_eliane: { id: 'u_gilberto_eliane', partners: ['gilberto', 'eliane'], ordem: 2, periodo: '' },
    u_gilberto_ester:  { id: 'u_gilberto_ester',  partners: ['gilberto', 'ester'],  ordem: 3, periodo: '' },
    u_carlos_vanessa:        { id: 'u_carlos_vanessa',        partners: ['carlos', 'vanessa'],        ordem: 1, periodo: '' },
    u_diogo_maria:           { id: 'u_diogo_maria',           partners: ['diogo', 'maria_hass'],      ordem: 1, periodo: '' },
    u_claudia_carlospierre:  { id: 'u_claudia_carlospierre',  partners: ['claudia', 'carlos_pierre'], ordem: 1, periodo: '' },
    u_vitor_francine:        { id: 'u_vitor_francine',        partners: ['vitor', 'francine'],        ordem: 1, periodo: '' }
  }
};

// ============================================================
// CONQUISTAS
// ============================================================
const CONQUISTAS = [
  { id: 'inicio', emoji: '🌱', titulo: 'Plantando a semente', desc: 'Começou a árvore familiar',
    test: () => Object.keys(dados.members).length >= 1 },
  { id: 'familia_5', emoji: '👨‍👩‍👧', titulo: 'Família crescendo', desc: '5 ou mais pessoas adicionadas',
    test: () => Object.keys(dados.members).length >= 5 },
  { id: 'familia_15', emoji: '🌳', titulo: 'Árvore frondosa', desc: '15 ou mais membros',
    test: () => Object.keys(dados.members).length >= 15 },
  { id: 'familia_30', emoji: '🏛️', titulo: 'Historiador', desc: '30 ou mais membros',
    test: () => Object.keys(dados.members).length >= 30 },
  { id: 'primeira_foto', emoji: '📸', titulo: 'Primeira foto', desc: 'Adicionou uma foto a alguém',
    test: () => Object.values(dados.members).some(m => m.foto) },
  { id: 'tres_geracoes', emoji: '👴👨👶', titulo: 'Três gerações', desc: 'Avós, filhos e netos na árvore',
    test: () => contarGeracoes() >= 3 },
  { id: 'cinco_uniões', emoji: '💍', titulo: 'Romântico', desc: '5 casamentos registrados',
    test: () => Object.keys(dados.unions).length >= 5 },
  { id: 'memorias_5', emoji: '📖', titulo: 'Contador de histórias', desc: '5 biografias preenchidas',
    test: () => Object.values(dados.members).filter(m => m.bio && m.bio.length > 20).length >= 5 }
];

function contarGeracoes() {
  if (!dados.config.focoId) return 0;
  const niveis = new Set([0]);
  function up(id, n) {
    paisDe(id).forEach(p => { niveis.add(n - 1); up(p.id, n - 1); });
  }
  function down(id, n) {
    filhosDe(id).forEach(f => { niveis.add(n + 1); down(f.id, n + 1); });
  }
  up(dados.config.focoId, 0);
  down(dados.config.focoId, 0);
  return niveis.size;
}

let dados;
let conquistasGanhas = new Set();
let pessoaAtual = null;
let acaoContexto = null;
let viewerId = null; // id da pessoa "que sou eu" neste navegador

// ============================================================
// VIEWER (quem é você, por navegador)
// ============================================================
function getViewerId() {
  return localStorage.getItem(VIEWER_KEY);
}
function setViewerId(id) {
  viewerId = id;
  if (id) localStorage.setItem(VIEWER_KEY, id);
  else localStorage.removeItem(VIEWER_KEY);
  atualizarViewerChip();
}
function atualizarViewerChip() {
  const chip = document.getElementById('viewerChip');
  if (!chip) return;
  if (!viewerId) { chip.hidden = true; return; }
  const m = pessoa(viewerId);
  if (!m) { chip.hidden = true; return; }
  chip.hidden = false;
  const av = document.getElementById('viewerAvatar');
  if (m.foto) { av.style.backgroundImage = "url('" + m.foto + "')"; av.textContent = ''; }
  else { av.style.backgroundImage = ''; av.textContent = gerarIniciais(m.nome); }
  document.getElementById('viewerName').textContent = m.apelido || m.nome.split(' ')[0];

  // Indicador de status online/offline
  const brand = document.querySelector('.brand-text span');
  if (brand) brand.textContent = modoOffline ? '⚠️ offline' : '🟢 online · sincronizado';
}
function voltarPraMim() {
  if (!viewerId) { abrirQuemSouEu(); return; }
  dados.config.focoId = viewerId;
  salvar();
  renderArvore();
  document.querySelector('.tree-section').scrollIntoView({ behavior: 'smooth' });
}

function abrirQuemSouEu() {
  renderQuemGrid('');
  abrir('modalQuemSouEu');
  setTimeout(() => document.getElementById('quemBusca').focus(), 100);
}

function renderQuemGrid(filtro) {
  const grid = document.getElementById('quemGrid');
  grid.innerHTML = '';
  const q = removerAcentos((filtro || '').toLowerCase().trim());
  const lista = Object.values(dados.members)
    .filter(m => !q || removerAcentos(m.nome.toLowerCase()).includes(q) || (m.apelido && removerAcentos(m.apelido.toLowerCase()).includes(q)))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  if (lista.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:30px;font-style:italic;">Ninguém encontrado</p>';
    return;
  }
  lista.forEach(m => {
    const c = document.createElement('div');
    c.className = 'quem-card';
    const foto = document.createElement('div');
    foto.className = 'quem-card-foto';
    if (m.foto) foto.style.backgroundImage = "url('" + m.foto + "')";
    else foto.textContent = gerarIniciais(m.nome);
    const nome = document.createElement('div');
    nome.className = 'quem-card-nome';
    nome.textContent = m.apelido || m.nome;
    c.appendChild(foto); c.appendChild(nome);
    if (m.nascimento) {
      const meta = document.createElement('div');
      meta.className = 'quem-card-meta';
      const ano = (m.nascimento.match(/\d{4}/) || [''])[0];
      meta.textContent = ano;
      c.appendChild(meta);
    }
    c.addEventListener('click', () => escolherSouEu(m.id));
    grid.appendChild(c);
  });
}

function escolherSouEu(id) {
  setViewerId(id);
  dados.config.focoId = id;
  salvar();
  renderArvore();
  fechar('modalQuemSouEu');
  const m = pessoa(id);
  toast('🏠 Bem-vindo, ' + (m.apelido || m.nome.split(' ')[0]) + '!');
  celebrar();
  // Se a pessoa não tem família própria registrada (sem pais, sem filhos, sem cônjuges),
  // oferece o guia "Comece sua linhagem"
  setTimeout(() => oferecerBemVindo(id), 700);
}

function oferecerBemVindo(id) {
  const m = pessoa(id); if (!m) return;
  const semPais = paisDe(id).length === 0;
  const semConj = unioesDe(id).length === 0;
  const semFilhos = filhosDe(id).length === 0;
  // Mostra apenas se faltam dois dos três (pessoa "incompleta")
  const faltando = [semPais, semConj, semFilhos].filter(Boolean).length;
  if (faltando >= 2) mostrarBemVindo(id);
}

function mostrarBemVindo(id) {
  const m = pessoa(id); if (!m) return;
  const primeiro = m.apelido || m.nome.split(' ')[0];
  document.getElementById('bemVindoTitulo').textContent = 'Bem-vindo, ' + primeiro + '!';
  document.getElementById('bemVindoSub').textContent =
    'Você agora faz parte da árvore Martins. Que tal começar a SUA própria linhagem? Adicione sua família abaixo:';
  abrir('modalBemVindo');
}

// ============================================================
// PERSISTENCIA + MIGRAÇÃO
// ============================================================
function clonePadrao() { return JSON.parse(JSON.stringify(DADOS_PADRAO)); }

// Foco é per-browser (não compartilhado entre familiares)
function lerFocoLocal() { return localStorage.getItem(FOCO_KEY); }
function gravarFocoLocal(id) {
  if (id) localStorage.setItem(FOCO_KEY, id);
}

// Carrega dados do Supabase. Fallback: localStorage; última opção: padrão.
async function carregar() {
  // Tenta Supabase primeiro
  if (sb) {
    try {
      const { data, error } = await sb
        .from(SB_TABLE)
        .select('data')
        .eq('id', SB_ROW_ID)
        .single();

      if (!error && data && data.data && data.data.members) {
        const remoto = {
          members: data.data.members,
          unions: data.data.unions || {},
          config: { focoId: lerFocoLocal() || 'diogo' }
        };
        // Cache local também
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(remoto)); } catch (e) {}
        return remoto;
      }

      // Linha existe mas vazia → semeia com padrão
      const padrao = clonePadrao();
      padrao.config.focoId = lerFocoLocal() || 'diogo';
      await sb.from(SB_TABLE).upsert({
        id: SB_ROW_ID,
        data: { members: padrao.members, unions: padrao.unions },
        updated_at: new Date().toISOString()
      });
      return padrao;
    } catch (e) {
      console.warn('Supabase falhou, usando cache local:', e);
      modoOffline = true;
      toast('⚠️ Sem conexão — modo offline');
    }
  }

  // Fallback: cache local
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.members && p.unions) {
        p.config = p.config || { focoId: lerFocoLocal() || 'diogo' };
        return p;
      }
    }
  } catch (e) { console.warn(e); }

  // Última opção: padrão
  const padrao = clonePadrao();
  padrao.config.focoId = lerFocoLocal() || 'diogo';
  return padrao;
}

// Salva no Supabase (fire-and-forget) + cache local. Foco fica só local.
function salvar() {
  ultimoSalvarLocal = Date.now();

  // Cache local sempre
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dados)); } catch (e) {}
  if (dados.config && dados.config.focoId) gravarFocoLocal(dados.config.focoId);

  // Salva remoto se online
  if (!sb || modoOffline) return;
  sb.from(SB_TABLE)
    .update({
      data: { members: dados.members, unions: dados.unions },
      updated_at: new Date().toISOString()
    })
    .eq('id', SB_ROW_ID)
    .then(({ error }) => {
      if (error) {
        console.error('Erro ao salvar no Supabase:', error);
        toast('⚠️ Erro ao salvar online — mudanças locais ok');
      }
    });
}

// Real-time: escuta mudanças de outros familiares
function iniciarRealtime() {
  if (!sb || modoOffline) return;
  sb.channel('family_tree_changes')
    .on('postgres_changes',
        { event: '*', schema: 'public', table: SB_TABLE, filter: 'id=eq.' + SB_ROW_ID },
        payload => {
          // Ignora echoes do nosso próprio salvar (últimos 1.5s)
          if (Date.now() - ultimoSalvarLocal < 1500) return;

          const novo = payload.new && payload.new.data;
          if (!novo || !novo.members) return;

          const mudouMembros = JSON.stringify(novo.members) !== JSON.stringify(dados.members);
          const mudouUnioes = JSON.stringify(novo.unions || {}) !== JSON.stringify(dados.unions);
          if (!mudouMembros && !mudouUnioes) return;

          dados.members = novo.members;
          dados.unions = novo.unions || {};
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dados)); } catch (e) {}
          renderArvore();
          atualizarViewerChip();
          toast('🔄 Atualizado por outro familiar');
        })
    .subscribe();
}

function carregarConquistas() {
  try {
    const raw = localStorage.getItem(CONQUISTAS_KEY);
    if (raw) conquistasGanhas = new Set(JSON.parse(raw));
  } catch (e) {}
}

function salvarConquistas() {
  localStorage.setItem(CONQUISTAS_KEY, JSON.stringify([...conquistasGanhas]));
}

function checarConquistas(silencioso) {
  CONQUISTAS.forEach(c => {
    if (!conquistasGanhas.has(c.id) && c.test()) {
      conquistasGanhas.add(c.id);
      salvarConquistas();
      if (!silencioso) mostrarConquista(c);
    }
  });
}

function mostrarConquista(c) {
  document.getElementById('conquistaEmoji').textContent = c.emoji;
  document.getElementById('conquistaTitulo').textContent = c.titulo;
  document.getElementById('conquistaDesc').textContent = c.desc;
  const popup = document.getElementById('conquistaPopup');
  popup.hidden = false;
  if (window.confetti) {
    window.confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.3 },
      colors: ['#a78bfa', '#ec4899', '#fbbf24', '#10b981']
    });
  }
  setTimeout(() => popup.hidden = true, 4500);
}

function resetar() {
  if (!confirm('Voltar à árvore inicial padrão? ATENÇÃO: isso afeta TODOS os familiares (banco compartilhado).')) return;
  const padrao = clonePadrao();
  dados.members = padrao.members;
  dados.unions = padrao.unions;
  salvar();
  renderArvore();
  fechar('modalConfig');
  toast('🔄 Árvore restaurada!');
}

function apagarTudo() {
  if (!confirm('Apagar TUDO no banco compartilhado? ATENÇÃO: vai apagar para TODA a família!')) return;
  if (!confirm('Última chance — apagar mesmo?')) return;
  dados.members = {};
  dados.unions = {};
  conquistasGanhas.clear();
  salvarConquistas();
  salvar();
  renderArvore();
  fechar('modalConfig');
  toast('Tudo limpo');
}

// ============================================================
// UTIL
// ============================================================
function pessoa(id) { return dados.members[id]; }

function gerarIniciais(nome) {
  if (!nome) return '?';
  return nome.trim().split(/\s+/).map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function removerAcentos(s) {
  try { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  catch (e) { return s; }
}

function gerarId(nome) {
  const base = removerAcentos(String(nome).toLowerCase())
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  let id = base || ('p_' + Date.now());
  let i = 1;
  while (dados.members[id]) id = base + '_' + (++i);
  return id;
}

function gerarUniaoId(p1, p2) {
  const base = 'u_' + (p1 || 'x') + '_' + (p2 || 'x');
  let id = base; let i = 1;
  while (dados.unions[id]) id = base + '_' + (++i);
  return id;
}

// Acha ou cria a união entre dois pais. Aceita um deles vazio.
function obterOuCriarUniao(p1Id, p2Id) {
  if (!p1Id && !p2Id) return null;

  // Procura união existente com esses dois (ou com um + null)
  for (const u of Object.values(dados.unions)) {
    const ps = u.partners;
    if (p1Id && p2Id) {
      if (ps.includes(p1Id) && ps.includes(p2Id)) return u.id;
    } else {
      const soloId = p1Id || p2Id;
      if (ps.includes(soloId) && ps.includes(null)) return u.id;
    }
  }

  // Não achou — cria nova
  const partners = p1Id && p2Id ? [p1Id, p2Id] : [(p1Id || p2Id), null];
  const ordem = (p1Id ? unioesDe(p1Id).length : 0) + 1;
  const uId = gerarUniaoId(p1Id || 'x', p2Id || 'x');
  dados.unions[uId] = { id: uId, partners, ordem, periodo: '' };
  return uId;
}

// Aplica uma relação direta entre uma pessoa EXISTENTE e o alvo do contexto
// (usado quando o usuário escolhe "usar pessoa existente" no banner)
function aplicarContextoComExistente(existenteId) {
  if (!acaoContexto) return false;
  const existente = pessoa(existenteId); if (!existente) return false;
  const alvo = pessoa(acaoContexto.alvoId); if (!alvo) return false;

  if (existenteId === alvo.id) { toast('Não pode ser ele mesmo'); return false; }

  switch (acaoContexto.tipo) {
    case 'pai_mae': {
      // existente vira pai/mãe de alvo
      const outroPai = paisDe(alvo.id).find(p => p.genero !== existente.genero);
      const uId = obterOuCriarUniao(existenteId, outroPai ? outroPai.id : null);
      alvo.parentUnionId = uId;
      break;
    }
    case 'irmao': {
      // existente vira irmão de alvo: aplica o mesmo parentUnionId
      if (alvo.parentUnionId) {
        if (existente.parentUnionId && existente.parentUnionId !== alvo.parentUnionId) {
          if (!confirm(existente.nome + ' já tem outros pais cadastrados. Substituir?')) return false;
        }
        existente.parentUnionId = alvo.parentUnionId;
      } else {
        toast('Adicione primeiro um pai/mãe para ' + alvo.nome);
        return false;
      }
      break;
    }
    case 'conjuge': {
      // Cria união entre alvo e existente
      const ordem = unioesDe(alvo.id).length + 1;
      const uId = gerarUniaoId(alvo.id, existenteId);
      dados.unions[uId] = { id: uId, partners: [alvo.id, existenteId], ordem, periodo: '' };
      break;
    }
    case 'filho': {
      // existente vira filho de alvo na união especificada (ou cria/usa a primeira)
      let uId = acaoContexto.uniaoId;
      if (!uId) {
        const us = unioesDe(alvo.id);
        if (us.length === 0) {
          uId = gerarUniaoId(alvo.id, 'x');
          dados.unions[uId] = { id: uId, partners: [alvo.id, null], ordem: 1, periodo: '' };
        } else uId = us[0].id;
      }
      if (existente.parentUnionId && existente.parentUnionId !== uId) {
        if (!confirm(existente.nome + ' já tem outros pais. Trocar?')) return false;
      }
      existente.parentUnionId = uId;
      break;
    }
  }
  acaoContexto = null;
  return true;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// === Datas: parse e format ===
// Aceita "15/03/1985", "03/1985", "1985", "1985-03-15", etc.
function parseData(str) {
  if (!str) return { dia: '', mes: '', ano: '' };
  str = String(str).trim();
  // ISO: 1985-03-15 ou 1985-03 ou 1985
  let m = str.match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/);
  if (m) return { dia: m[3] || '', mes: m[2] || '', ano: m[1] };
  // BR: 15/03/1985 ou 03/1985 ou 15-03-1985
  m = str.match(/^(?:(\d{1,2})[\/\-])?(?:(\d{1,2})[\/\-])(\d{4})$/);
  if (m) return { dia: m[1] || '', mes: m[2], ano: m[3] };
  // Só ano: 1985
  m = str.match(/^(\d{4})$/);
  if (m) return { dia: '', mes: '', ano: m[1] };
  // Fallback: pega qualquer 4 dígitos
  const ano = str.match(/(\d{4})/);
  return { dia: '', mes: '', ano: ano ? ano[1] : '' };
}

// Formata para armazenamento: "15/03/1985", "03/1985", "1985" ou ""
function formatarData(dia, mes, ano) {
  if (!ano) return '';
  const a = String(ano).padStart(4, '0');
  if (!mes) return a;
  const m = String(mes).padStart(2, '0');
  if (!dia) return m + '/' + a;
  const d = String(dia).padStart(2, '0');
  return d + '/' + m + '/' + a;
}

// Formato para exibição amigável: "15 de março de 1985" ou "março de 1985" ou "1985"
const MESES_NOMES = ['', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                     'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
function formatarDataExibicao(str) {
  if (!str) return '';
  const { dia, mes, ano } = parseData(str);
  if (!ano) return str;
  if (!mes) return ano;
  const nomeMes = MESES_NOMES[parseInt(mes, 10)] || mes;
  if (!dia) return nomeMes + ' de ' + ano;
  return parseInt(dia, 10) + ' de ' + nomeMes + ' de ' + ano;
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.hidden = true, 2400);
}

function fechar(id) { const el = document.getElementById(id); if (el) el.hidden = true; }
function abrir(id) { const el = document.getElementById(id); if (el) el.hidden = false; }

function celebrar() {
  if (!window.confetti) return;
  window.confetti({
    particleCount: 60,
    spread: 60,
    origin: { y: 0.6 },
    colors: ['#a78bfa', '#ec4899', '#fbbf24', '#10b981', '#3b82f6']
  });
}

// ============================================================
// PARENTESCO
// ============================================================
function unioesDe(pid) {
  return Object.values(dados.unions).filter(u => u.partners.includes(pid))
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
}
function filhosDeUniao(uid) {
  return Object.values(dados.members).filter(m => m.parentUnionId === uid);
}
function paisDe(pid) {
  const m = pessoa(pid); if (!m || !m.parentUnionId) return [];
  const u = dados.unions[m.parentUnionId]; if (!u) return [];
  return u.partners.filter(Boolean).map(pessoa).filter(Boolean);
}
function irmaos(pid) {
  const m = pessoa(pid);
  if (!m || !m.parentUnionId) return { plenos: [], meios: [] };
  const u = dados.unions[m.parentUnionId];
  const paisIds = u ? u.partners.filter(Boolean) : [];
  const plenos = filhosDeUniao(m.parentUnionId).filter(x => x.id !== pid);
  const meiosSet = new Set();
  paisIds.forEach(pId => {
    unioesDe(pId).forEach(u2 => {
      if (u2.id === m.parentUnionId) return;
      filhosDeUniao(u2.id).forEach(f => { if (f.id !== pid) meiosSet.add(f.id); });
    });
  });
  return { plenos, meios: [...meiosSet].map(pessoa).filter(Boolean) };
}
function filhosDe(pid) {
  const ids = new Set();
  unioesDe(pid).forEach(u => filhosDeUniao(u.id).forEach(f => ids.add(f.id)));
  return [...ids].map(pessoa).filter(Boolean);
}
function netosDe(pid) {
  const out = [];
  filhosDe(pid).forEach(f => filhosDe(f.id).forEach(n => out.push(n)));
  return out;
}
function avosDe(pid) {
  const out = [];
  paisDe(pid).forEach(p => paisDe(p.id).forEach(a => out.push(a)));
  return out;
}

// Retorna ancestrais por nível: [pais, avós, bisavós, trisavós, ...]
// Usa BFS, deduplicando.
function ancestraisPorNivel(pid, maxNiveis = 8) {
  const niveis = [];
  let current = paisDe(pid);
  for (let i = 0; i < maxNiveis; i++) {
    if (current.length === 0) break;
    niveis.push(current);
    const proximoSet = new Map();
    current.forEach(p => paisDe(p.id).forEach(av => proximoSet.set(av.id, av)));
    current = [...proximoSet.values()];
  }
  return niveis;
}

function bisavosDe(pid) {
  const out = [];
  avosDe(pid).forEach(a => paisDe(a.id).forEach(b => out.push(b)));
  return out;
}

// ============================================================
// QUICK-ADD HELPERS
// ============================================================
function adicionarPaiOuMae(pid) {
  const m = pessoa(pid); if (!m) return;
  acaoContexto = { tipo: 'pai_mae', alvoId: pid };
  abrirFormPessoa('novo', { contextoTitulo: '+ Pai ou mãe de ' + m.nome });
}
function adicionarIrmao(pid) {
  const m = pessoa(pid); if (!m) return;
  acaoContexto = { tipo: 'irmao', alvoId: pid };
  abrirFormPessoa('novo', { contextoTitulo: '+ Irmão(ã) de ' + m.nome });
}
function adicionarConjuge(pid) {
  const m = pessoa(pid); if (!m) return;
  acaoContexto = { tipo: 'conjuge', alvoId: pid };
  abrirFormPessoa('novo', { contextoTitulo: '+ Cônjuge de ' + m.nome });
}
function adicionarFilho(pid, uniaoId) {
  const m = pessoa(pid); if (!m) return;
  acaoContexto = { tipo: 'filho', alvoId: pid, uniaoId: uniaoId || null };
  abrirFormPessoa('novo', { contextoTitulo: '+ Filho(a) de ' + m.nome });
}

function aplicarContexto(novoId) {
  if (!acaoContexto) return;
  const novo = dados.members[novoId]; if (!novo) return;

  switch (acaoContexto.tipo) {
    case 'pai_mae': {
      const alvo = pessoa(acaoContexto.alvoId); if (!alvo) break;
      if (!alvo.parentUnionId) {
        const uId = gerarUniaoId(novoId, 'x');
        dados.unions[uId] = { id: uId, partners: [novoId, null], ordem: 1, periodo: '' };
        alvo.parentUnionId = uId;
      } else {
        const u = dados.unions[alvo.parentUnionId];
        const slot = u.partners.findIndex(p => !p);
        if (slot >= 0) u.partners[slot] = novoId;
        else toast('Já tem pai e mãe registrados');
      }
      break;
    }
    case 'irmao': {
      const alvo = pessoa(acaoContexto.alvoId);
      if (alvo && alvo.parentUnionId) novo.parentUnionId = alvo.parentUnionId;
      break;
    }
    case 'conjuge': {
      const alvo = pessoa(acaoContexto.alvoId); if (!alvo) break;
      const ordem = unioesDe(alvo.id).length + 1;
      const uId = gerarUniaoId(alvo.id, novoId);
      dados.unions[uId] = { id: uId, partners: [alvo.id, novoId], ordem, periodo: '' };
      break;
    }
    case 'filho': {
      let uId = acaoContexto.uniaoId;
      if (!uId) {
        const unioes = unioesDe(acaoContexto.alvoId);
        if (unioes.length === 0) {
          uId = gerarUniaoId(acaoContexto.alvoId, 'x');
          dados.unions[uId] = { id: uId, partners: [acaoContexto.alvoId, null], ordem: 1, periodo: '' };
        } else {
          uId = unioes[0].id;
        }
      }
      novo.parentUnionId = uId;
      break;
    }
  }
  acaoContexto = null;
}

// ============================================================
// CARDS
// ============================================================
function generationClass(id, focoId) {
  if (id === focoId) return 'layer-eu';
  if (paisDe(focoId).some(p => p.id === id)) return 'layer-pais';
  if (avosDe(focoId).some(p => p.id === id)) return 'layer-avos';
  if (bisavosDe(focoId).some(p => p.id === id)) return 'layer-bisavos';
  if (filhosDe(focoId).some(p => p.id === id)) return 'layer-filhos';
  if (netosDe(focoId).some(p => p.id === id)) return 'layer-netos';
  return 'layer-eu';
}

function criarPessoaCard(m, opts = {}) {
  if (!m) {
    const d = document.createElement('div');
    d.className = 'person';
    d.innerHTML = '<div class="person-photo"><span class="photo-fallback">?</span></div><div class="person-name">Desconhecido</div>';
    return d;
  }

  const art = document.createElement('article');
  art.className = 'person';
  if (opts.foco) art.classList.add('person-foco');
  if (opts.mini) art.classList.add('person-mini');
  art.classList.add(opts.layer || generationClass(m.id, dados.config.focoId));
  art.dataset.id = m.id;

  // Star
  if (opts.foco) {
    const star = document.createElement('span');
    star.className = 'person-star';
    star.textContent = '⭐ Foco';
    art.appendChild(star);
  }

  // Photo
  const photo = document.createElement('div');
  photo.className = 'person-photo' + (m.foto ? ' has-photo' : '');
  if (m.foto) photo.style.backgroundImage = "url('" + m.foto + "')";
  const fallback = document.createElement('span');
  fallback.className = 'photo-fallback';
  fallback.textContent = gerarIniciais(m.nome);
  photo.appendChild(fallback);
  art.appendChild(photo);

  // Nome
  const name = document.createElement('div');
  name.className = 'person-name';
  name.textContent = m.apelido || m.nome;
  art.appendChild(name);

  // Meta (anos)
  const meta = document.createElement('div');
  meta.className = 'person-meta';
  let m_text = '';
  const nasc = (m.nascimento || '').match(/\d{4}/);
  const fale = (m.falecimento || '').match(/\d{4}/);
  if (nasc) m_text += nasc[0];
  if (fale) m_text += ' – ' + fale[0];
  if (!nasc && !fale && m.profissao) m_text = m.profissao;
  meta.textContent = m_text;
  art.appendChild(meta);

  // Tag (meio-irmão)
  if (opts.meio) {
    const tag = document.createElement('span');
    tag.className = 'person-tag meio';
    tag.textContent = 'meio-' + (m.genero === 'F' ? 'irmã' : 'irmão');
    art.appendChild(tag);
  }

  // Quick add buttons (não em minis)
  if (!opts.mini) {
    const actions = document.createElement('div');
    actions.className = 'person-actions';

    const bC = document.createElement('button');
    bC.className = 'pa-btn'; bC.title = 'Adicionar cônjuge'; bC.textContent = '❤';
    bC.addEventListener('click', (e) => { e.stopPropagation(); adicionarConjuge(m.id); });
    actions.appendChild(bC);

    const bF = document.createElement('button');
    bF.className = 'pa-btn'; bF.title = 'Adicionar filho(a)'; bF.textContent = '👶';
    bF.addEventListener('click', (e) => { e.stopPropagation(); adicionarFilho(m.id); });
    actions.appendChild(bF);

    art.appendChild(actions);
  }

  art.addEventListener('click', (e) => {
    e.stopPropagation();
    abrirPerfil(m.id);
  });

  return art;
}

function criarCasal(p1, p2, uniao, opts = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'couple';
  wrap.appendChild(criarPessoaCard(p1, opts));

  const heart = document.createElement('div');
  heart.className = 'couple-heart';
  heart.textContent = '❤';
  if (uniao && uniao.ordem > 1) {
    const ord = document.createElement('span');
    ord.className = 'couple-order';
    ord.textContent = ordemTexto(uniao.ordem) + ' união';
    heart.appendChild(ord);
  }
  wrap.appendChild(heart);

  wrap.appendChild(criarPessoaCard(p2, opts));
  return wrap;
}

function ordemTexto(n) {
  return ({1:'1ª', 2:'2ª', 3:'3ª', 4:'4ª', 5:'5ª'}[n]) || (n + 'ª');
}

// Ordena lista de pessoas: mais antigo (menor ano de nascimento) primeiro.
// Quando ambos não têm data, mantém a ordem original (sort estável).
function ordenarPorIdade(lista) {
  return [...lista].sort((a, b) => {
    const ay = (a.nascimento || '').match(/\d{4}/);
    const by = (b.nascimento || '').match(/\d{4}/);
    if (ay && by) return parseInt(ay[0], 10) - parseInt(by[0], 10);
    if (ay && !by) return -1; // quem tem data conhecida vem primeiro
    if (!ay && by) return 1;
    return 0;
  });
}

// ============================================================
// RENDER ARVORE
// ============================================================
const arvoreEl = () => document.getElementById('arvore');

function renderArvore() {
  const el = arvoreEl();
  if (!el) return;
  el.innerHTML = '';

  const focoId = dados.config.focoId;
  const foco = pessoa(focoId);
  if (!foco) {
    el.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">Nenhuma pessoa no centro. Clique em "Adicionar familiar".</p>';
    document.getElementById('focusBar').innerHTML = '';
    return;
  }

  // Focus bar
  const fb = document.getElementById('focusBar');
  fb.innerHTML = '⊙ Centro da árvore: <strong>' + escapeHtml(foco.nome) + '</strong>';

  // Welcome message
  const welc = document.getElementById('welcomeNome');
  if (welc) {
    const primeiroNome = foco.nome.split(' ')[0];
    welc.textContent = 'Olá, ' + primeiroNome + '! 👋';
  }

  // === Ancestrais (avós, bisavós, trisavós, …) ===
  // ancNiveis[0] = pais, [1] = avós, [2] = bisavós, [3] = trisavós, etc.
  const ancNiveis = ancestraisPorNivel(focoId, 6);
  const LABELS_ANC = [null, 'Avós', 'Bisavós', 'Trisavós', 'Tetravós', 'Pentavós', '6ª geração'];
  const LAYERS_ANC = [null, 'layer-avos', 'layer-bisavos', 'layer-trisavos', 'layer-trisavos', 'layer-trisavos', 'layer-trisavos'];

  // Renderiza dos mais antigos (último índice) até os avós (índice 1)
  for (let i = ancNiveis.length - 1; i >= 1; i--) {
    const nivel = ordenarPorIdade(ancNiveis[i]);
    if (nivel.length === 0) continue;
    el.appendChild(criarCamada(LABELS_ANC[i] || ((i + 1) + 'ª geração'),
      nivel.map(a => criarPessoaCard(a, { mini: true, layer: LAYERS_ANC[i] || 'layer-trisavos' }))));
    el.appendChild(criarConector());
  }

  // === Pais ===
  const m_foco = pessoa(focoId);
  const uniaoNasc = m_foco.parentUnionId ? dados.unions[m_foco.parentUnionId] : null;
  if (uniaoNasc && uniaoNasc.partners.some(Boolean)) {
    const [p1id, p2id] = uniaoNasc.partners;
    const casal = criarCasal(pessoa(p1id), pessoa(p2id), uniaoNasc, { layer: 'layer-pais' });
    el.appendChild(criarCamada('Pais', [casal]));
    el.appendChild(criarConector());
  }

  // === Geração (irmãos + foco) ===
  const { plenos, meios } = irmaos(focoId);
  const gerCards = [];
  ordenarPorIdade(meios).forEach(m => gerCards.push(criarPessoaCard(m, { meio: true })));
  if (foco.parentUnionId) {
    ordenarPorIdade(filhosDeUniao(foco.parentUnionId)).forEach(p => {
      gerCards.push(criarPessoaCard(p, { foco: p.id === focoId }));
    });
  } else {
    gerCards.push(criarPessoaCard(foco, { foco: true }));
  }
  el.appendChild(criarCamada('Geração', gerCards));

  // === Uniões + filhos ===
  const unioesFoco = unioesDe(focoId);
  const unionsBlock = document.createElement('div');
  unionsBlock.className = 'unions-block';

  if (unioesFoco.length === 0) {
    const btnConj = document.createElement('button');
    btnConj.className = 'btn-add-circle';
    btnConj.title = 'Adicionar cônjuge';
    btnConj.textContent = '+';
    btnConj.addEventListener('click', () => adicionarConjuge(focoId));
    unionsBlock.appendChild(btnConj);
  } else {
    unioesFoco.forEach(u => {
      const conjId = u.partners.find(p => p && p !== focoId);
      const conj = conjId ? pessoa(conjId) : null;

      const card = document.createElement('div');
      card.className = 'union-card';

      if (unioesFoco.length > 1 || u.ordem > 1) {
        const t = document.createElement('div');
        t.className = 'union-title';
        t.textContent = ordemTexto(u.ordem || 1) + ' união';
        card.appendChild(t);
      }

      const row = document.createElement('div');
      row.className = 'union-spouse-row';
      if (conj) row.appendChild(criarPessoaCard(conj, { layer: 'layer-pais' }));
      else {
        const ph = document.createElement('button');
        ph.className = 'btn-add-circle'; ph.textContent = '+'; ph.title = 'Adicionar cônjuge';
        ph.addEventListener('click', () => {
          adicionarConjuge(focoId);
        });
        row.appendChild(ph);
      }
      card.appendChild(row);

      const filhos = ordenarPorIdade(filhosDeUniao(u.id));
      const filhosWrap = document.createElement('div');
      filhosWrap.className = 'union-children';
      if (filhos.length === 0) {
        const v = document.createElement('div');
        v.className = 'union-empty';
        v.textContent = 'Sem filhos ainda';
        filhosWrap.appendChild(v);
      } else {
        filhos.forEach(f => filhosWrap.appendChild(criarPessoaCard(f, { layer: 'layer-filhos' })));
      }
      const btnAddFilho = document.createElement('button');
      btnAddFilho.className = 'btn-add-circle';
      btnAddFilho.title = '+ Filho';
      btnAddFilho.textContent = '+';
      btnAddFilho.style.width = '40px'; btnAddFilho.style.height = '40px'; btnAddFilho.style.fontSize = '1.2rem';
      btnAddFilho.addEventListener('click', () => adicionarFilho(focoId, u.id));
      filhosWrap.appendChild(btnAddFilho);

      card.appendChild(filhosWrap);
      unionsBlock.appendChild(card);
    });

    const novaUniao = document.createElement('button');
    novaUniao.className = 'btn-add-small';
    novaUniao.textContent = '+ Outra união';
    novaUniao.addEventListener('click', () => adicionarConjuge(focoId));
    unionsBlock.appendChild(novaUniao);
  }

  el.appendChild(criarCamada('Cônjuges e filhos', [unionsBlock]));

  // === Netos ===
  const netos = ordenarPorIdade(netosDe(focoId));
  if (netos.length > 0) {
    el.appendChild(criarConector());
    el.appendChild(criarCamada('Netos', netos.map(n => criarPessoaCard(n, { mini: true, layer: 'layer-netos' }))));
  }

  // Stats strip
  renderStatsStrip();
}

function criarCamada(label, cards) {
  const layer = document.createElement('div');
  layer.className = 'layer';
  const lbl = document.createElement('div');
  lbl.className = 'layer-label';
  lbl.textContent = label;
  layer.appendChild(lbl);
  const row = document.createElement('div');
  row.className = 'layer-row';
  cards.forEach(c => row.appendChild(c));
  layer.appendChild(row);
  return layer;
}

function criarConector() {
  const c = document.createElement('div');
  c.className = 'layer-connector';
  return c;
}

function renderStatsStrip() {
  const total = Object.keys(dados.members).length;
  const ger = contarGeracoes();
  const uns = Object.keys(dados.unions).length;
  const conqs = conquistasGanhas.size;

  const strip = document.getElementById('statsStrip');
  strip.innerHTML = '';
  [
    ['👥', total, 'Pessoas'],
    ['🌳', ger, 'Gerações'],
    ['💍', uns, 'Uniões'],
    ['🏆', conqs + '/' + CONQUISTAS.length, 'Conquistas']
  ].forEach(([emoji, num, lbl]) => {
    const item = document.createElement('div');
    item.className = 'stat-mini';
    item.innerHTML = '<span style="font-size:1.4rem">' + emoji + '</span><span class="stat-mini-num">' + num + '</span><span class="stat-mini-lbl">' + lbl + '</span>';
    strip.appendChild(item);
  });
}

// ============================================================
// PERFIL
// ============================================================
function abrirPerfil(id) {
  const m = pessoa(id); if (!m) return;
  pessoaAtual = id;

  document.getElementById('perfilNome').textContent = m.nome + (m.apelido ? ' (' + m.apelido + ')' : '');

  let vida = '';
  if (m.nascimento) vida += '🌱 ' + formatarDataExibicao(m.nascimento);
  if (m.local_nascimento) vida += ' · ' + m.local_nascimento;
  if (m.falecimento) vida += '   ✝ ' + formatarDataExibicao(m.falecimento);
  document.getElementById('perfilVida').textContent = vida;

  const foto = document.getElementById('perfilFoto');
  foto.setAttribute('data-iniciais', gerarIniciais(m.nome));
  if (m.foto) {
    foto.style.backgroundImage = "url('" + m.foto + "')";
    foto.classList.add('has-photo');
  } else {
    foto.style.backgroundImage = '';
    foto.classList.remove('has-photo');
  }

  // Info
  const grid = document.getElementById('infoGrid');
  grid.innerHTML = '';
  [
    ['Nome', m.nome],
    ['Apelido', m.apelido],
    ['Gênero', m.genero === 'M' ? 'Masculino' : (m.genero === 'F' ? 'Feminino' : (m.genero === 'O' ? 'Outro' : ''))],
    ['Nascimento', formatarDataExibicao(m.nascimento)],
    ['Local de nascimento', m.local_nascimento],
    ['Falecimento', formatarDataExibicao(m.falecimento)],
    ['Local de falecimento', m.local_falecimento],
    ['Profissão', m.profissao]
  ].forEach(([lbl, val]) => {
    if (!val) return;
    const d = document.createElement('div');
    d.className = 'info-item';
    d.innerHTML = '<span class="label">' + lbl + '</span><span class="valor">' + escapeHtml(val) + '</span>';
    grid.appendChild(d);
  });
  if (!grid.children.length) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;font-style:italic;">Sem dados ainda. Clique em "Editar" pra preencher.</p>';
  }

  // Família
  renderFamiliaPainel(id);

  // Memórias
  document.getElementById('memoriaBio').textContent = m.bio || '';

  // Reset tabs
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === 'info'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === 'info'));

  abrir('modalPerfil');
}

function renderFamiliaPainel(id) {
  const painel = document.getElementById('painelFamilia');
  painel.innerHTML = '';
  const pais = ordenarPorIdade(paisDe(id));
  const { plenos, meios } = irmaos(id);
  const plenosOrdenados = ordenarPorIdade(plenos);
  const meiosOrdenados = ordenarPorIdade(meios);
  const unioes = unioesDe(id);
  const filhos = ordenarPorIdade(filhosDe(id));

  if (pais.length > 0) painel.appendChild(grupoFamilia('Pais', pais));
  if (plenosOrdenados.length > 0) painel.appendChild(grupoFamilia('Irmãos', plenosOrdenados));
  if (meiosOrdenados.length > 0) painel.appendChild(grupoFamilia('Meios-irmãos', meiosOrdenados));

  if (unioes.length > 0) {
    const conjs = [];
    unioes.forEach(u => {
      const cId = u.partners.find(p => p && p !== id);
      if (cId) {
        const c = pessoa(cId);
        if (c) conjs.push(c);
      }
    });
    if (conjs.length > 0) painel.appendChild(grupoFamilia('Cônjuges', conjs));
  }
  if (filhos.length > 0) painel.appendChild(grupoFamilia('Filhos', filhos));

  if (!painel.children.length) {
    painel.innerHTML = '<p style="color:var(--text-muted);text-align:center;font-style:italic;padding:20px;">Nenhuma ligação ainda. Use os botões abaixo!</p>';
  }
}

function grupoFamilia(titulo, lista) {
  const g = document.createElement('div');
  g.className = 'grupo';
  const h = document.createElement('div');
  h.className = 'grupo-titulo';
  h.textContent = titulo;
  g.appendChild(h);
  const itens = document.createElement('div');
  itens.className = 'grupo-itens';
  lista.forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'familia-chip';
    const foto = document.createElement('div');
    foto.className = 'familia-chip-foto';
    if (p.foto) foto.style.backgroundImage = "url('" + p.foto + "')";
    else foto.textContent = gerarIniciais(p.nome);
    chip.appendChild(foto);
    const span = document.createElement('span');
    span.textContent = p.apelido || p.nome;
    chip.appendChild(span);
    chip.addEventListener('click', () => abrirPerfil(p.id));
    itens.appendChild(chip);
  });
  g.appendChild(itens);
  return g;
}

// ============================================================
// FORM PESSOA
// ============================================================
let modoForm = 'novo';
let editandoId = null;
let fotoBase64Atual = '';

function abrirFormPessoa(modo, opts = {}) {
  modoForm = modo;
  editandoId = opts.id || null;
  fotoBase64Atual = '';

  const f = document.getElementById('formPessoa');
  f.reset();
  document.getElementById('fotoPreview').style.backgroundImage = '';
  document.getElementById('fotoPreview').textContent = '📷';

  preencherSelectsRelacao();

  // Banner contextual (add com contexto)
  const qaBanner = document.getElementById('qaBanner');
  const qaExistente = document.getElementById('qaBannerExistente');

  // Painel editar relações (modo editar)
  const relEdit = document.getElementById('relEdit');

  if (modo === 'editar' && editandoId) {
    const m = pessoa(editandoId); if (!m) return;
    document.getElementById('formTitulo').textContent = '✏️ Editar ' + m.nome;
    f.nome.value = m.nome || '';
    f.apelido.value = m.apelido || '';
    f.genero.value = m.genero || '';
    const nasc = parseData(m.nascimento);
    f.nasc_dia.value = nasc.dia;
    f.nasc_mes.value = nasc.mes;
    f.nasc_ano.value = nasc.ano;
    const fale = parseData(m.falecimento);
    f.fale_dia.value = fale.dia;
    f.fale_mes.value = fale.mes;
    f.fale_ano.value = fale.ano;
    f.local_nascimento.value = m.local_nascimento || '';
    f.local_falecimento.value = m.local_falecimento || '';
    f.profissao.value = m.profissao || '';
    f.bio.value = m.bio || '';
    if (m.foto) {
      fotoBase64Atual = m.foto;
      const fp = document.getElementById('fotoPreview');
      fp.style.backgroundImage = "url('" + m.foto + "')";
      fp.textContent = '';
    }
    document.getElementById('formRelacao').style.display = 'none';
    qaBanner.hidden = true;
    acaoContexto = null;

    // Preencher selects de pai/mãe com a relação atual
    preencherSelectsPaiMae(editandoId);
    relEdit.hidden = false;
  } else {
    document.getElementById('formTitulo').textContent = opts.contextoTitulo || '+ Novo familiar';
    relEdit.hidden = true;

    if (acaoContexto) {
      // Banner contextual + select de pessoa existente
      const alvo = pessoa(acaoContexto.alvoId);
      const tipoTexto = {
        'pai_mae': 'Esta pessoa será 👤 pai ou mãe de',
        'irmao':   'Esta pessoa será 👥 irmão(ã) de',
        'conjuge': 'Esta pessoa será ❤️ cônjuge de',
        'filho':   'Esta pessoa será 👶 filho(a) de'
      }[acaoContexto.tipo] || 'Adicionando familiar de';
      document.getElementById('qaBannerTitulo').textContent = tipoTexto + ' ' + (alvo ? alvo.nome : '?');

      // Preenche dropdown com todos os membros existentes (exceto o alvo)
      qaExistente.innerHTML = '<option value="">— Criar pessoa nova (preencher formulário) —</option>';
      Object.values(dados.members)
        .filter(p => p.id !== acaoContexto.alvoId)
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = p.nome + (p.apelido ? ' (' + p.apelido + ')' : '');
          qaExistente.appendChild(opt);
        });
      qaExistente.value = '';
      qaBanner.hidden = false;

      document.getElementById('formRelacao').style.display = 'none';
    } else {
      qaBanner.hidden = true;
      document.getElementById('formRelacao').style.display = 'block';
    }
  }

  fechar('modalPerfil');
  abrir('modalForm');
  setTimeout(() => f.nome.focus(), 100);
}

function preencherSelectsPaiMae(pid) {
  const m = pessoa(pid); if (!m) return;
  const pais = paisDe(pid);
  // Tenta identificar pai (M) e mãe (F) entre os parents
  let paiAtual = pais.find(p => p.genero === 'M');
  let maeAtual = pais.find(p => p.genero === 'F');
  // Fallback: se não identificou por gênero, usar ordem
  if (!paiAtual && !maeAtual && pais.length > 0) {
    paiAtual = pais[0];
    if (pais.length > 1) maeAtual = pais[1];
  } else if (pais.length === 1 && !paiAtual && !maeAtual) {
    paiAtual = pais[0];
  }

  const selPai = document.getElementById('editPai');
  const selMae = document.getElementById('editMae');
  selPai.innerHTML = '<option value="">— sem pai cadastrado —</option>';
  selMae.innerHTML = '<option value="">— sem mãe cadastrada —</option>';

  Object.values(dados.members)
    .filter(p => p.id !== pid)
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .forEach(p => {
      // Pai: mostrar todos os homens + os sem gênero
      if (p.genero === 'M' || !p.genero) {
        const op = document.createElement('option');
        op.value = p.id; op.textContent = p.nome;
        selPai.appendChild(op);
      }
      // Mãe: mostrar todas as mulheres + as sem gênero
      if (p.genero === 'F' || !p.genero) {
        const op = document.createElement('option');
        op.value = p.id; op.textContent = p.nome;
        selMae.appendChild(op);
      }
    });

  selPai.value = paiAtual ? paiAtual.id : '';
  selMae.value = maeAtual ? maeAtual.id : '';
}

function preencherSelectsRelacao() {
  const su = document.getElementById('relUniaoSelect');
  const sc = document.getElementById('relConjugeSelect');
  su.innerHTML = '<option value="">— escolha —</option>';
  sc.innerHTML = '<option value="">— escolha —</option>';
  Object.values(dados.unions).forEach(u => {
    const [p1, p2] = u.partners.map(pid => pid ? pessoa(pid) : null);
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.textContent = (p1 ? p1.nome : '?') + ' + ' + (p2 ? p2.nome : '?');
    su.appendChild(opt);
  });
  Object.values(dados.members).forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.nome;
    sc.appendChild(opt);
  });
}

document.getElementById('inputFoto').addEventListener('change', (e) => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const max = 600;
      let w = img.width, h = img.height;
      if (w > h) { if (w > max) { h *= max / w; w = max; } }
      else { if (h > max) { w *= max / h; h = max; } }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      fotoBase64Atual = c.toDataURL('image/jpeg', 0.85);
      const fp = document.getElementById('fotoPreview');
      fp.style.backgroundImage = "url('" + fotoBase64Atual + "')";
      fp.textContent = '';
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// Quando seleciona pessoa existente no banner, aplica direto e fecha
document.getElementById('qaBannerExistente').addEventListener('change', (e) => {
  const existenteId = e.target.value;
  if (!existenteId) return;
  if (!acaoContexto) return;
  const nomeAlvo = pessoa(acaoContexto.alvoId)?.nome || '?';
  const nomeExist = pessoa(existenteId)?.nome || '?';
  if (!confirm('Conectar ' + nomeExist + ' como ' + acaoContexto.tipo + ' de ' + nomeAlvo + '?')) {
    e.target.value = '';
    return;
  }
  if (aplicarContextoComExistente(existenteId)) {
    salvar();
    renderArvore();
    fechar('modalForm');
    toast('🔗 Conectado!');
    celebrar();
  } else {
    e.target.value = '';
  }
});

document.getElementById('formPessoa').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  const nome = f.nome.value.trim();
  if (!nome) { toast('Nome é obrigatório'); return; }

  const nascimento = formatarData(f.nasc_dia.value, f.nasc_mes.value, f.nasc_ano.value);
  const falecimento = formatarData(f.fale_dia.value, f.fale_mes.value, f.fale_ano.value);

  const dadosBase = {
    nome,
    apelido: f.apelido.value.trim(),
    genero: f.genero.value,
    nascimento,
    local_nascimento: f.local_nascimento.value.trim(),
    falecimento,
    local_falecimento: f.local_falecimento.value.trim(),
    profissao: f.profissao.value.trim(),
    bio: f.bio.value.trim(),
    foto: fotoBase64Atual
  };

  if (modoForm === 'editar' && editandoId) {
    Object.assign(pessoa(editandoId), dadosBase);

    // Processa mudanças de pai/mãe via selects
    const paiId = document.getElementById('editPai').value || null;
    const maeId = document.getElementById('editMae').value || null;
    if (paiId || maeId) {
      const uId = obterOuCriarUniao(paiId, maeId);
      pessoa(editandoId).parentUnionId = uId;
    } else {
      pessoa(editandoId).parentUnionId = null;
    }

    toast('✅ Atualizado!');
  } else {
    const id = gerarId(nome);
    const novo = { id, parentUnionId: null, ...dadosBase };
    dados.members[id] = novo;

    if (acaoContexto) {
      aplicarContexto(id);
    } else {
      const tipo = f.rel_tipo.value;
      if (tipo === 'filho') {
        const uId = f.rel_uniao.value;
        if (uId && dados.unions[uId]) novo.parentUnionId = uId;
      } else if (tipo === 'conjuge') {
        const cId = f.rel_conjuge.value;
        const ordem = parseInt(f.rel_ordem.value, 10) || 1;
        if (cId && pessoa(cId)) {
          const uId = gerarUniaoId(cId, id);
          dados.unions[uId] = { id: uId, partners: [cId, id], ordem, periodo: '' };
        }
      }
    }
    // Se está criando perfil próprio (vindo do "Não estou aqui"), define como viewer
    if (window._proximoVirarViewer) {
      window._proximoVirarViewer = false;
      setViewerId(id);
      dados.config.focoId = id;
      toast('🏠 Bem-vindo, ' + nome.split(' ')[0] + '!');
      // Após criar perfil próprio, oferece guia pra adicionar família
      setTimeout(() => mostrarBemVindo(id), 800);
    } else {
      toast('🎉 ' + nome.split(' ')[0] + ' adicionado!');
    }
    celebrar();
  }

  salvar();
  checarConquistas();
  renderArvore();
  fechar('modalForm');
});

// ============================================================
// AÇÕES PERFIL
// ============================================================
document.getElementById('btnEditar').addEventListener('click', () => {
  if (pessoaAtual) abrirFormPessoa('editar', { id: pessoaAtual });
});

document.getElementById('btnExcluir').addEventListener('click', () => {
  if (!pessoaAtual) return;
  const m = pessoa(pessoaAtual);
  if (!confirm('Remover ' + m.nome + ' da árvore?')) return;
  Object.values(dados.unions).forEach(u => {
    u.partners = u.partners.map(p => p === pessoaAtual ? null : p);
  });
  Object.entries(dados.unions).forEach(([uid, u]) => {
    if (u.partners.every(p => !p) && filhosDeUniao(uid).length === 0) delete dados.unions[uid];
  });
  delete dados.members[pessoaAtual];
  if (dados.config.focoId === pessoaAtual) {
    dados.config.focoId = Object.keys(dados.members)[0] || null;
  }
  salvar();
  fechar('modalPerfil');
  renderArvore();
  toast('Removido');
});

document.getElementById('btnFocarPerfil').addEventListener('click', () => {
  if (!pessoaAtual) return;
  dados.config.focoId = pessoaAtual;
  salvar();
  fechar('modalPerfil');
  renderArvore();
  document.querySelector('.tree-section').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('btnSouEu').addEventListener('click', () => {
  if (!pessoaAtual) return;
  const m = pessoa(pessoaAtual);
  if (!confirm('Definir ' + m.nome + ' como "você" neste navegador? A árvore vai abrir centrada nesta pessoa daqui pra frente.')) return;
  const idEscolhido = pessoaAtual;
  setViewerId(idEscolhido);
  dados.config.focoId = idEscolhido;
  salvar();
  fechar('modalPerfil');
  renderArvore();
  toast('🏠 Pronto! Você é ' + (m.apelido || m.nome.split(' ')[0]));
  celebrar();
  setTimeout(() => oferecerBemVindo(idEscolhido), 700);
});

// Quick-add buttons na aba Família
document.querySelectorAll('.qa-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!pessoaAtual) return;
    const a = btn.dataset.acao;
    if (a === 'pai_mae') adicionarPaiOuMae(pessoaAtual);
    else if (a === 'irmao') adicionarIrmao(pessoaAtual);
    else if (a === 'conjuge') adicionarConjuge(pessoaAtual);
    else if (a === 'filho') adicionarFilho(pessoaAtual);
  });
});

// Botões do modal Bem-vindo (onboarding) — usa o viewer como alvo
document.querySelectorAll('.bv-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!viewerId) return;
    fechar('modalBemVindo');
    const a = btn.dataset.acao;
    if (a === 'pai_mae') adicionarPaiOuMae(viewerId);
    else if (a === 'irmao') adicionarIrmao(viewerId);
    else if (a === 'conjuge') adicionarConjuge(viewerId);
    else if (a === 'filho') adicionarFilho(viewerId);
  });
});

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const t = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === t));
  });
});

// ============================================================
// BUSCA
// ============================================================
const buscaInput = document.getElementById('buscaInput');
const buscaResultados = document.getElementById('buscaResultados');

buscaInput.addEventListener('input', () => {
  const q = removerAcentos(buscaInput.value.toLowerCase().trim());
  if (!q) { buscaResultados.hidden = true; return; }
  const r = Object.values(dados.members).filter(m =>
    removerAcentos(m.nome.toLowerCase()).includes(q) ||
    (m.apelido && removerAcentos(m.apelido.toLowerCase()).includes(q))
  ).slice(0, 8);

  buscaResultados.innerHTML = '';
  if (r.length === 0) {
    buscaResultados.innerHTML = '<div class="search-item"><span style="color:var(--text-muted);font-style:italic">Nada encontrado</span></div>';
  } else {
    r.forEach(m => {
      const item = document.createElement('div');
      item.className = 'search-item';
      const ava = document.createElement('div');
      ava.className = 'search-avatar';
      if (m.foto) ava.style.backgroundImage = "url('" + m.foto + "')";
      else ava.textContent = gerarIniciais(m.nome);
      const info = document.createElement('div');
      info.className = 'search-info';
      info.innerHTML = '<strong>' + escapeHtml(m.nome) + '</strong><small>' + escapeHtml(m.apelido || m.profissao || '') + '</small>';
      item.appendChild(ava); item.appendChild(info);
      item.addEventListener('click', () => {
        abrirPerfil(m.id);
        buscaInput.value = '';
        buscaResultados.hidden = true;
      });
      buscaResultados.appendChild(item);
    });
  }
  buscaResultados.hidden = false;
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrap')) buscaResultados.hidden = true;
});

// ============================================================
// STATS
// ============================================================
document.getElementById('btnEstatisticas').addEventListener('click', () => {
  const total = Object.keys(dados.members).length;
  const homens = Object.values(dados.members).filter(m => m.genero === 'M').length;
  const mulheres = Object.values(dados.members).filter(m => m.genero === 'F').length;
  const falecidos = Object.values(dados.members).filter(m => m.falecimento).length;
  const tu = Object.keys(dados.unions).length;
  const cf = Object.values(dados.members).filter(m => m.foto).length;
  const cb = Object.values(dados.members).filter(m => m.bio && m.bio.length > 10).length;
  const ger = contarGeracoes();

  const stats = [
    ['👥', total, 'Pessoas'], ['🌳', ger, 'Gerações'], ['💍', tu, 'Uniões'],
    ['👨', homens, 'Homens'], ['👩', mulheres, 'Mulheres'],
    ['🕊️', falecidos, 'In memoriam'], ['📸', cf, 'Com foto'], ['📖', cb, 'Com bio']
  ];
  const grid = document.getElementById('statsGrid');
  grid.innerHTML = '';
  stats.forEach(([emoji, num, lbl]) => {
    const c = document.createElement('div');
    c.className = 'stat-card';
    c.innerHTML = '<span style="font-size:1.6rem">' + emoji + '</span><span class="stat-num">' + num + '</span><span class="stat-lbl">' + lbl + '</span>';
    grid.appendChild(c);
  });
  abrir('modalStats');
});

// ============================================================
// CONQUISTAS
// ============================================================
document.getElementById('btnConquistas').addEventListener('click', () => {
  const grid = document.getElementById('conquistasGrid');
  grid.innerHTML = '';
  CONQUISTAS.forEach(c => {
    const earned = conquistasGanhas.has(c.id);
    const card = document.createElement('div');
    card.className = 'conquista-card' + (earned ? ' earned' : '');
    card.innerHTML = '<span class="conquista-emoji">' + c.emoji + '</span><div class="conquista-titulo">' + c.titulo + '</div><div class="conquista-desc">' + c.desc + '</div>';
    grid.appendChild(card);
  });
  abrir('modalConquistas');
});

// ============================================================
// CONFIG
// ============================================================
document.getElementById('btnConfig').addEventListener('click', () => abrir('modalConfig'));
document.getElementById('btnResetar').addEventListener('click', resetar);
document.getElementById('btnApagarTudo').addEventListener('click', apagarTudo);
document.getElementById('btnTrocarFoco').addEventListener('click', () => {
  const nomes = Object.values(dados.members).map(m => m.nome).join('\n');
  const e = prompt('Quem fica no centro?\n\nDigite parte do nome:\n\n' + nomes);
  if (!e) return;
  const q = removerAcentos(e.toLowerCase());
  const m = Object.values(dados.members).find(p => removerAcentos(p.nome.toLowerCase()).includes(q));
  if (!m) { toast('Não encontrado'); return; }
  dados.config.focoId = m.id;
  salvar(); renderArvore(); fechar('modalConfig');
  toast('Centro: ' + m.nome);
});

document.getElementById('btnHome').addEventListener('click', () => {
  voltarPraMim();
});

// Trocar perspectiva pelo chip
document.getElementById('viewerTrocar').addEventListener('click', () => {
  abrirQuemSouEu();
});

// Busca no modal "Quem é você?"
document.getElementById('quemBusca').addEventListener('input', (e) => {
  renderQuemGrid(e.target.value);
});

// "Não estou aqui" → abre form pra criar pessoa nova; após criada, define como viewer
document.getElementById('quemNaoEstou').addEventListener('click', () => {
  fechar('modalQuemSouEu');
  acaoContexto = null;
  abrirFormPessoa('novo', { contextoTitulo: '👤 Quem é você? Crie seu perfil' });
  // Marca para definir como viewer no submit
  window._proximoVirarViewer = true;
});

// "Pular" (visitante)
document.getElementById('quemPular').addEventListener('click', () => {
  fechar('modalQuemSouEu');
  toast('OK, você está visitando');
});

// ============================================================
// EXPORT / IMPORT
// ============================================================
document.getElementById('btnExportar').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'familia_martins_' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('💾 Backup salvo!');
});

document.getElementById('btnImportar').addEventListener('click', () => {
  document.getElementById('inputImportar').click();
});

document.getElementById('inputImportar').addEventListener('change', (e) => {
  const file = e.target.files[0]; if (!file) return;
  if (!confirm('Substituir dados atuais pelo backup?')) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const novo = JSON.parse(ev.target.result);
      if (!novo.members || !novo.unions) throw new Error('Formato inválido');
      dados = novo;
      salvar();
      renderArvore();
      toast('📂 Importado!');
    } catch (err) { toast('Arquivo inválido'); }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// ============================================================
// ADD BUTTON GERAL
// ============================================================
document.getElementById('btnAddNovo').addEventListener('click', () => {
  acaoContexto = null;
  abrirFormPessoa('novo');
});

// ============================================================
// FECHAR MODAIS
// ============================================================
document.querySelectorAll('[data-close]').forEach(b => {
  b.addEventListener('click', () => fechar(b.dataset.close));
});
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', (e) => { if (e.target === m) m.hidden = true; });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('.modal:not([hidden])').forEach(m => m.hidden = true);
});

// ============================================================
// LOGIN
// ============================================================
const loginOverlay = document.getElementById('loginOverlay');
const loginForm = document.getElementById('loginForm');
const senhaInput = document.getElementById('senhaInput');
const loginErro = document.getElementById('loginErro');
const app = document.getElementById('app');

function fazerLogin() {
  loginOverlay.hidden = true;
  app.hidden = false;
  sessionStorage.setItem(SESSION_KEY, '1');
  try {
    // Carrega viewer existente
    viewerId = getViewerId();
    if (viewerId && pessoa(viewerId)) {
      // Já tem viewer e a pessoa existe — usa como foco
      dados.config.focoId = viewerId;
    } else if (viewerId) {
      // Tinha viewer mas a pessoa não existe mais — limpa
      viewerId = null;
      localStorage.removeItem(VIEWER_KEY);
    }
    atualizarViewerChip();
    renderArvore();
    checarConquistas(true);

    // Primeira vez neste navegador → pergunta "Quem é você?"
    if (!viewerId) {
      setTimeout(() => abrirQuemSouEu(), 400);
    }
  } catch (e) {
    console.error(e);
    toast('Erro ao carregar');
  }
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (senhaInput.value === SENHA) {
    loginErro.textContent = '';
    fazerLogin();
  } else {
    loginErro.textContent = 'Senha incorreta 🚫';
    senhaInput.value = '';
  }
});

document.getElementById('btnSair').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
});

// ============================================================
// INICIO
// ============================================================
document.getElementById('ano').textContent = new Date().getFullYear();
carregarConquistas();

(async function init() {
  try {
    dados = await carregar();
  } catch (e) {
    console.error('Erro fatal ao carregar:', e);
    dados = clonePadrao();
  }
  iniciarRealtime();
  if (sessionStorage.getItem(SESSION_KEY) === '1') fazerLogin();
})();
