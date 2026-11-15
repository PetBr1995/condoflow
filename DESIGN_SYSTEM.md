# CondoFlow Design System · Especificação Oficial 🎨

Este guia é a **referência estética mandatória e permanente** para todas as telas, componentes, modais e fluxos do CondoFlow.

---

## 1. Paleta de Cores Obrigatória

### Cores de Estrutura & Layout
- **Sidebar Navy (Principal):** `#0e1d35` (Dark Midnight Navy)
- **Sidebar Hover:** `#162c50`
- **Sidebar Ativo (Pílula):** `#24477d` (Azul ardósia escuro com texto branco)
- **Fundo da Aplicação (Canvas):** `#f4f7fb` (Soft Slate Off-White)
- **Superfície dos Cards e Modais:** `#ffffff`
- **Bordas Sutis:** `#e2e8f0` (Hover: `#cbd5e1`)

### Cores de Ação & Brand
- **Botão Primário / Chip Ativo "Todos":** `#0f213d` (Hover: `#1a325a`)
- **Brand Blue (Destaques / Avatar):** `#2563eb` (Hover: `#1d4ed8`)
- **Azul Pastel para Ícones:** `#dbeafe` com ícone interno em `#1d4ed8`

### Tokens Semânticos de Status
- ⭕ **Aberto / Urgente:** Dot `#ef4444` | Tag Fundo `#fee2e2` | Texto `#b91c1c`
- ⭕ **Em Andamento:** Dot `#3b82f6` | Tag Fundo `#dbeafe` | Texto `#1d4ed8`
- ⭕ **Finalizado / Concluído:** Dot `#22c55e` | Tag Fundo `#dcfce7` | Texto `#15803d`
- ⏰ **Prioridade Média:** Tag Fundo `#fef3c7` | Texto `#b45309`

---

## 2. Tipografia & Hierarquia
- **Fonte Padrão:** `'Plus Jakarta Sans', sans-serif`
- **Título de Página:** `28px` / Peso `800` (Extra Bold) / Cor `#0f172a`
- **Subtítulo de Página:** `14px` / Peso `400` / Cor `#64748b`
- **Título de Card:** `16px` / Peso `700` (Bold) / Cor `#0f172a`
- **Linha de Metadados:** `13px` / Peso `500` / Cor `#64748b`

---

## 3. Padrão de Componentes

### 3.1 Sidebar Lateral Esquerda
- Fundo `#0e1d35`, botão circular flutuante na borda com `<` e `>` para recolher.
- Itens de menu com ícone + label, item ativo em pílula `#24477d`.
- Card de perfil no rodapé com avatar circular azul (`#2563eb`), nome, unidade/cargo e botão `Sair`.

### 3.2 Barra de Ferramentas (Toolbar)
- **Campo de Busca:** Input estilo pílula com ícone de lupa, borda `#e2e8f0` e fundo branco.
- **Chips de Filtro:** Segmentos em pílula (`border-radius: 9999px`), chip "Todos" em `#0f213d`, chips de status com indicador circular colorido (`8px`).
- **Botão Primário:** Fundo sólido `#0f213d`, cantos `8px`, texto branco, ícone `+`.

### 3.3 Cards de Lista
- Fundo branco `#ffffff`, borda `1px solid #e2e8f0`, cantos arredondados de `12px` a `14px`, sombra `0 1px 3px rgba(0,0,0,0.03)`.
- Quadrado de ícone à esquerda em azul pastel (`#dbeafe`) de `44px x 44px` com bordas de `10px`.
- Linha de metadados: `[📅 Data] • [#ID] | [🏢 Unidade]`.
- Lado direito: Pílula de prioridade/status + seta chevron `chevron_right`.
