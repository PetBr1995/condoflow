# Design System do CondoFlow

Estilo SaaS minimalista, compacto e sóbrio (referências: Linear, Vercel, Stripe).
Vale para **todas** as telas do sistema, inclusive login e telas avulsas. Toda tela
ou componente novo segue este documento; se algo não estiver coberto aqui, siga o
padrão mais próximo e acrescente a regra neste arquivo.

> As regras gerais e rígidas de UI ficam em [UI_DESIGN_GUIDELINES.md](UI_DESIGN_GUIDELINES.md);
> este documento as detalha e aplica a todos os módulos do CondoFlow.

---

## Princípios

1. **Discreto.** Fundo neutro suave (`#F8FAFC`), superfícies brancas com borda fina de 1 px (`#E2E8F0`), cinza slate técnico e contraste equilibrado. Nada de gradiente carnavalesco, sombra pesada, brilho de neon ou emojis decorativos.
2. **Compacto e Denso.** Texto base de 13–14 px, botões padrão de 34–36 px (`h-9`), campos de 36 px, densidade de dados alta sem sufocar.
3. **Cor com função.** 
   - Ação principal (CTA): `#0F172A` (Dark Slate) com texto branco.
   - Ativo, foco e links: `#2563EB` ou `#0F172A`.
   - Cores semânticas (verde, âmbar, vermelho) são reservadas estritamente a estados de dados e tags sutis com fundo suave (`10%` de opacidade); **nunca** como fundo de cards inteiros ou bolinhas coloridas gritantes em menus e filtros.
4. **Navegação limpa.** Sidebar estruturada com borda fina, topbar segmentada com busca rápida `Ctrl + K`, perfil do usuário e ações contextuais.
5. **Escrita simples.** Português do Brasil, sentença com só a primeira letra maiúscula ("Novo chamado", "Salvar alterações"), sem rótulos em CAIXA ALTA.

---

## Tokens de Design

Definidos em `src/styles.css` (`:root` para tema claro, suporte a dark mode).
Use as variáveis CSS e classes utilitárias ligadas aos tokens:

### Cores (Tema Claro)

| Token | Valor | Uso |
|---|---|---|
| `--bg-page` / `--bg-canvas` | `#F8FAFC` (slate-50) | Fundo atrás de todos os cards |
| `--bg-card`, `--bg-surface` | `#FFFFFF` | Cards, modais, drawer, sidebar, topbar |
| `--text-primary`, `--text-main` | `#0F172A` (slate-900) | Títulos e textos de alto contraste |
| `--text-secondary`, `--text-muted` | `#64748B` (slate-500) | Texto de apoio, subtítulos, metadados |
| `--border-color`, `--border-subtle` | `#E2E8F0` (slate-200) | Todas as bordas finas (1 px) |
| `--border-divisoria` | `#F1F5F9` (slate-100) | Linhas divisórias entre itens de lista |
| `--bg-muted`, `--bg-accent` | `#F1F5F9` (slate-100) | Hover sutil, fundo de segmented controls |
| `--color-brand-primary` (CTA) | `#0F172A` (slate-900) | Botão primário, ação de destaque |
| `--color-primary` | `#2563EB` | Links, foco (`ring-1`), indicadores analíticos |
| `--color-success` | `#059669` (fundo `#ECFDF5`, borda `#A7F3D0`) | Concluído, liberado, ativo |
| `--color-warning` | `#D97706` (fundo `#FFFBEB`, borda `#FDE68A`) | Pendente, atenção, em andamento |
| `--color-danger` | `#DC2626` (fundo `#FEF2F2`, borda `#FECACA`) | Erro, urgente, cancelar, excluir |

---

## Tipografia

- **Família:** `Inter`, `Plus Jakarta Sans`, `-apple-system`, `sans-serif`.
- **Títulos:** `tracking-tight` (`-0.02em` a `-0.025em`).

| Uso | Tamanho | Peso |
|---|---|---|
| Título da página (`h1` / `.page-title`) | 20 px (`text-xl`) | 600 (`font-semibold`) |
| Número de KPI / Métrica | 26 px (`text-[26px]`) | 600 (`font-semibold`), `tabular-nums` |
| Título de card / seção (`h2`) | 15–16 px (`text-[15px]`) | 500 (`font-medium`) |
| Título de modal / drawer | 16 px (`text-base`) | 600 (`font-semibold`) |
| Texto padrão, botões, menus, tabelas | 13 px (`text-[13px]`) | 400 (`normal`) a 500 (`medium`) |
| Campos de formulário (inputs/selects) | 13–14 px | 400 (`font-normal`) |
| Apoio, subtítulos, cabeçalhos de tabela | 12 px (`text-xs`) | 400–500 |

> **Regra estrita:** Números e horários sempre usam `tabular-nums`. **Nunca use `font-bold` (700) nem `font-extrabold` (800). O peso máximo é 600.**

---

## Raios de Borda (Border Radius)

| Classe | Valor | Uso |
|---|---|---|
| `rounded-md` | 6 px | Abas internas, chips de segmented control, inputs secundários |
| `rounded-lg` | 8 px | Botões, inputs, selects, cards de lista compactos |
| `rounded-xl` | 10–12 px | Cards principais de dashboard, modais, painéis |
| `rounded-full` | 9999 px | **Apenas** avatares circulares e pequenos badges de status |

> **Regra estrita:** **NUNCA use `rounded-full` (pílula) em botões de ação ou inputs de formulários.**

---

## Bordas, Sombras e Hover

- **Cards e painéis:** Borda de `1px solid #E2E8F0`, sem sombra ou no máximo micro-elevação `shadow-2xs` (`0 1px 2px rgba(15, 23, 42, 0.04)`).
- **Proibição de sombras pesadas:** Nada de `shadow-md`, `shadow-lg`, `shadow-xl`.
- **Hover em cards e itens clicáveis:** A borda apenas escurece suavemente (`hover:border-slate-300` / `#CBD5E1`), **sem subir (`transform: translateY(0)`) e sem ganhar sombras flutuantes**.

---

## Componentes Padronizados

### 1. Botões
- **Primário (CTA):** Altura `34–36px`, fundo `#0F172A`, texto branco `13px`, `font-medium`, padding horizontal `14px`, raio `6–8px`.
- **Secundário (Outline):** Altura `34–36px`, fundo `#FFFFFF`, borda `1px solid #E2E8F0`, texto `#0F172A` ou `#475569`.
- **Leve afundar no clique:** `active:scale-[0.98]`.

### 2. Filtros e Segmented Controls
- Container cinza claro com fundo `#F1F5F9`, borda `1px solid #E2E8F0`, raio `6px`, padding de `2px`.
- Cada botão de filtro tem altura `28px`, texto `12px`, padding `0 10px`.
- Aba ativa: fundo branco `#FFFFFF`, texto `#0F172A` `font-semibold`, micro-sombra `0 1px 2px rgba(15, 23, 42, 0.05)`.
- **Sem bolinhas coloridas infantis nos filtros** (use no máximo contadores discretos ou texto claro).

### 3. Cards de Lista (Chamados, Reservas, Encomendas, Avisos)
- Formato de linha compacta e densa: `min-height: 52px`, padding `10px 14px`, raio `8px`, borda `1px solid #E2E8F0`.
- Ícone em squircle sóbrio (`32x32px`, raio `6px`, fundo `#F8FAFC`, borda `#E2E8F0`, ícone de `16px`).
- Hierarquia textual clara: Título em `#0F172A` (`13px`, `font-medium`) e metadados na linha abaixo em `#64748B` (`12px`, com separadores `·`).

### 4. Cards de Métrica (KPIs)
- Fundo branco com borda de 1 px.
- Rótulo superior de `12–13px` em `#64748B` e ícone sutil de `16px`.
- Número em destaque de `26px`, `font-semibold`, `tabular-nums`.
- Indicador de variação ou status em `12px` abaixo.

### 5. Formulários, Inputs e Modais
- Inputs e selects com altura de `36px`, raio `6–8px`, borda `1px solid #E2E8F0`, foco com `ring-1` discreto.
- Labels de campo em `12px`, `font-medium`, `#0F172A`.
- Drawer e modais com cabeçalho limpo (título `16px`), corpo com rolagem suave e rodapé fixo de ações (Cancelar + Confirmar).

---

## O Que NÃO Fazer (Checklist Negativo)

- ❌ **Não use gradientes chamativos, brilhos de neon ou cards coloridos inteiros.**
- ❌ **Não use `rounded-full` em botões de ação ou filtros.**
- ❌ **Não use fontes em negrito pesado (`font-bold` 700 ou 800) — o limite máximo é 600.**
- ❌ **Não use animação de "pulo" (`translateY(-2px)` / `-4px`) com sombras difusas no hover.**
- ❌ **Não adicione bolinhas coloridas gritantes (status-dots vermelhos, verdes) nos filtros de abas.**
- ❌ **Não crie botões gigantes de segundo nível que quebram a linha do layout.**
- ❌ **Não use textos em CAIXA ALTA exagerada em rótulos ou botões.**

---

## Checklist para Telas e Componentes Novos

- [ ] Título de página em 20 px (`font-semibold`, `tracking-tight`).
- [ ] Ação principal alinhada à direita com altura de 34–36 px.
- [ ] Fundo de tela `#F8FAFC` e superfícies `#FFFFFF` com borda de 1 px `#E2E8F0`.
- [ ] Cards de lista com visual compacto (52 px de altura mínima) e hover apenas escurecendo a borda.
- [ ] Filtros em segmented control cinza suave (`#F1F5F9`) sem bolinhas de cores gritantes.
- [ ] Ícones com traço fino de 16 px a 18 px.
- [ ] Textos e números respeitando a escala estrita (peso máximo 600, números `tabular-nums`).
