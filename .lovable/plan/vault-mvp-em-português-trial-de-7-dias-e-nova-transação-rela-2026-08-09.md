# VAULT — MVP em Português, Trial de 7 dias e nova Transação/Relatórios

## O que eu verifiquei antes deste plano

- **Idioma não muda:** os dicionários existem e estão completos (238 chaves em `pt-PT`, `en-US`, `es-ES`), mas as páginas quase não os usam. Exemplos reais: `RelatoriosPage.tsx` e `AuthPage.tsx` têm **0** chamadas de tradução, `OnboardingPage.tsx` tem 1, `DashboardPage.tsx` tem 4. Ou seja: o texto está escrito à mão em inglês no código — escolher Português nunca poderia mudar nada.
- **Moeda:** o catálogo já está limitado exactamente a `$ (USD)`, `R$ (BRL)`, `Kz (AOA)`, `€ (EUR)`, `£ (GBP)`. O que falha é o mesmo problema: telas com valores formatados à mão em vez de usar o formatador da moeda escolhida.
- **Paywall imediato após o onboarding:** no fim do onboarding o perfil é gravado com `plan_status: "awaiting_payment"` (linha 421 de `OnboardingPage.tsx`), e o `ProtectedRoute` bloqueia tudo nesse estado. É por isso que o utilizador nunca entra no app depois do quiz. Não existe nenhum trial a ser criado.
- **Admin:** a conta `fonsecapascoal93@gmail.com` já existe, confirmada, com `role = admin` em `user_roles`, `plano = admin`, `plan_status = active`. O bypass de admin já está no `ProtectedRoute`. Não é preciso criar utilizador; vou apenas garantir/repor a password e confirmar que nunca vê paywall.
- **Erro "Something went wrong" no login:** ainda **não** está diagnosticado. É o `ErrorBoundary` a apanhar uma excepção em runtime — vou reproduzir o login no navegador e ler o erro real antes de corrigir. Não vou adivinhar a causa.

## O que vou fazer

### 1. App 100% em Português (MVP)
- Fixar o idioma em `pt-PT`: a estrutura de i18n fica intacta (para juntar EN/ES no futuro), mas o selector de idioma sai do onboarding e das configurações e o `LanguageContext` passa a servir sempre `pt-PT`.
- Varrer todas as páginas e componentes e substituir texto inglês por Português: autenticação, onboarding/quiz, dashboard, transações, categorias, relatórios, histórico, metas, fundo de emergência, lista de compras, scanner, voz, perfil, configurações, suporte, paywall, mensagens de erro, validações, loading, toasts, estados vazios.
- Remover os ficheiros `en-US.json` / `es-ES.json` do carregamento e apagar o `LanguageToggle` do UI.

### 2. Moeda funcional em todo o app
- A escolha do onboarding continua a gravar no perfil e passa a ser respeitada em **todos** os ecrãs através do formatador central (`formatMoney`) — sem símbolos escritos à mão.
- Apenas as 5 moedas: `$`, `R$`, `Kz`, `€`, `£`.

### 3. Trial de 7 dias em vez de paywall no onboarding
- No fim do onboarding o perfil passa a ficar `plan_status = trial_active` com `trial_start = agora` e `trial_end = agora + 7 dias`, e o utilizador entra directamente no dashboard com acesso total.
- Banner discreto "7 dias grátis — X dias restantes".
- Quando `trial_end` passa (calculado sempre a partir da data gravada no Supabase, não do relógio do browser), o estado passa a expirado e o paywall aparece em qualquer ecrã premium — sem contorno por URL, refresh ou localStorage.
- Admin: acesso total, sempre, sem paywall nem banner.

### 4. Rotas e autenticação
- Revisão de todas as rotas existentes: rotas duplicadas/legado, redirects, loops, ecrãs em branco, botões a apontar para rotas inexistentes, refresh e logout/login.
- Sessão persistente confirmada; reproduzir e corrigir o erro de login.

### 5. Nova tela de Transação
- Selector `Despesa / Receita`, valor em destaque na moeda do utilizador, teclado numérico próprio (1-9, separador decimal, apagar) sem teclado nativo, campo Descrição, grelha de categorias com ícone e feedback ao toque (categorias vindas do Supabase, incluindo as de receita).
- Guardar: validação → Supabase → actualização imediata de dashboard, histórico, relatórios e métricas → feedback rápido "Transação adicionada" → voltar.

### 6. Relatórios
- Selector de período (este mês, 30 dias, 3/6/12 meses, personalizado).
- Quatro métricas: gasto, recebido, saldo, poupado.
- Gráfico de evolução interactivo (receitas/despesas/saldo) com tooltip.
- Donut de distribuição por categoria com ícone, valor e percentagem, selecção por toque.
- Comparação simples com o período anterior e uma área curta de insight (com mensagem de fallback quando não há dados).

### 7. Verificação final
- Percorrer no navegador: registo → login → onboarding → quiz → moeda → dashboard com trial → criar despesa e receita → histórico → relatórios; e o cenário de trial expirado → paywall. Confirmar ausência de texto inglês visível e ausência de erros na consola.

## Notas técnicas

- Sem alterações de schema previstas: `profiles` já tem `plan_status`, `trial_start`, `trial_end`, `currency_code`, `language`. Só peço migração se a verificação mostrar algo realmente em falta.
- RLS actual das `profiles` usa `id = auth.uid()`; os `update` do app usam `.eq("user_id", ...)`. Como `user_id` é sincronizado por trigger com `id`, funciona — vou uniformizar para `id` para eliminar risco.
- Webhooks Hotmart (`/api/public/hotmart-webhook`) e a lógica de assinatura ficam como estão; só o estado inicial pós-onboarding muda.
- Nada de dados de cartão no Supabase; segredos apenas no servidor.
