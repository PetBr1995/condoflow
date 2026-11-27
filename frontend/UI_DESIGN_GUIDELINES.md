# UI & Design System Guidelines (Strict Rules)

Você deve seguir rigorosamente este padrão visual em todas as telas, componentes e páginas criadas no CondoFlow. É estritamente proibido gerar interfaces com aparência inflada, infantil, excesso de arredondamento, sombras difusas ou excesso de saturação.

---

## 1. Estética e Referência
- **Estilo:** SaaS minimalista, denso, técnico e refinado (referências: Linear, Vercel, Stripe, Raycast).
- **Densidade:** Compacta e funcional. Evite espaços vazios exagerados e componentes gigantes.
- **Sobriedade:** Foco em conteúdo e legibilidade. Proibido o uso de gradientes berrantes, brilhos de neon ou selos coloridos estilo playground.

---

## 2. Tipografia
- **Família:** `Inter`, `Plus Jakarta Sans` ou `Geist Sans`. Nunca use fontes geométricas largas (como Poppins, Montserrat ou Nunito) para interfaces de sistema.
- **Pesos:**
  - `font-normal` (400) para textos corridos, descrições e células de dados.
  - `font-medium` (500) para labels, botões, subtítulos e abas.
  - No máximo `font-semibold` (600) para títulos e números de KPI.
  - **PROIBIDO:** `font-bold` (700) e `font-extrabold` (800).
- **Escala rígida:**
  - **Título de página (H1):** `20px` (`text-xl`), `font-semibold`, `tracking-tight` (`-0.02em`).
  - **Título de seção/card (H2):** `15px` ou `16px` (`text-base` / `text-[15px]`), `font-medium`.
  - **Título de modal:** `16px` (`text-base`), `font-semibold`.
  - **Texto padrão / Corpo / Tabela / Menu:** `13px` ou `14px` (`text-[13px]` / `text-sm`), `font-normal`.
  - **Campos de formulário:** `13px` a `14px`, `font-normal`.
  - **Labels, badges e textos auxiliares:** `12px` (`text-xs`), `font-medium`.
  - **Números de destaque (KPIs):** `26px` (`text-2xl` / `text-[26px]`), `font-semibold`, `tracking-tight`, `tabular-nums`.

---

## 3. Cores e Contraste (Regra 60-30-10)
- **Fundo da aplicação (60%):** Neutro muito sutil (`#F8FAFC` / `slate-50` no light mode; `#09090B` / `zinc-950` no dark mode).
- **Superfícies / Cards / Sidebar (30%):** Branco puro (`#FFFFFF`) no light mode ou `#121214` no dark mode com borda fina de `1px solid #E2E8F0`. **Nunca pinte cards inteiros ou sidebars inteiras com cor primária saturada.**
- **Cor de destaque / Brand (10%):**
  - Botão de ação principal (CTA): Sóbrio `#0F172A` (`slate-900`) com texto branco `#FFFFFF`.
  - Acentos, links e seleções ativas: `#2563EB` (azul sóbrio) ou `#0F172A` aplicado com estrita função (foco, link, indicador analítico).
- **Textos:**
  - Títulos: `#0F172A` (`slate-900`).
  - Textos secundários/descrições: `#64748B` (`slate-500`).
  - Linhas divisórias entre registros: `#F1F5F9` (`slate-100`).

---

## 4. Bordas, Sombras e Arredondamento
- **Bordas:** Sempre finas e sutis (`1px solid #E2E8F0` / `border-slate-200`). Nunca use bordas grossas (`2px+`) em botões, inputs ou cards.
- **Sombras:** Proibido o uso de `shadow-md`, `shadow-lg`, `shadow-xl`. Cards usam borda de `1px` sem sombra ou no máximo `shadow-2xs` (`0 1px 2px rgba(15, 23, 42, 0.04)`).
- **Hover em cards:** Apenas escurece levemente a borda (`border-color: #cbd5e1`), **sem subir (`transform: none`, sem `translateY`) e sem ganhar sombras difusas**.
- **Border Radius:**
  - Cards, modais e containers principais: `10px` a `12px` (`rounded-xl`).
  - Botões, inputs e selects: `6px` a `8px` (`rounded-md` ou `rounded-lg`).
  - **NUNCA use `rounded-full` (pílula) em botões de ação, inputs ou formulários.** (Reserve `rounded-full` apenas para avatares e pequenos badges de status).

---

## 5. Dimensões de Componentes e Espaçamento
- **Escala de espaçamento:** Use apenas múltiplos de 4 (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`).
- **Botões:**
  - Altura padrão: `34px` ou `36px` (`h-9`).
  - Padding: `px-3.5 py-1.5`.
  - Texto: `13px` (`text-[13px]`), `font-medium`.
- **Inputs e Selects:** Altura padrão de `36px` (`h-9`), borda `1px solid #E2E8F0`, foco sutil (`ring-1`).
- **Ícones:** Traço fino (`strokeWidth={1.5}` ou similar). Tamanho padrão de `16px` (`w-4 h-4`) dentro de botões e menus, e no máximo `18px` ou `20px` dentro de cards.
- **Abas de filtro e segmented controls:** Container discreto com fundo `#F1F5F9`, abas de `28px` com texto de `12px`. Proibido colocar bolinhas coloridas chamativas (dots vermelhos, verdes, azuis) dentro das abas de filtro.

---

## 6. Layout e Navegação
- **Headers:** Mantenha títulos de página, subtítulo e controles globais/ações principais alinhados de forma clara e limpa. Ação principal à direita.
- **Scrollbars:** Discretas e finas (`6px`) em tons neutros (`#cbd5e1`), sem trilhos pesados.
