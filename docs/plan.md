Abaixo está um planejamento de desenvolvimento estruturado em fases, já considerando as particularidades de hospedar uma aplicação React + Vite + Firebase no **GitHub Pages**. O maior ponto de atenção é o roteamento: o GitHub Pages não suporta o redirecionamento de URL que o `BrowserRouter` precisa, então será obrigatório usar `HashRouter`. Além disso, a URL final terá o formato `https://habner-gabryel.github.io/caca-ao-tesouro-dashboard/`, o que exige configurar o `base` do Vite corretamente.

---

## Fase 0 — Fundação e Configuração do Ambiente

O objetivo aqui é ter um esqueleto React rodando localmente e já preparado para o formato de URL do GitHub Pages.

**0.1. Criar o projeto**
- `npm create vite@latest caca-tesouro-ejs -- --template react` (ou `react-ts`, se preferir TypeScript).
- Instalar dependências: `react-router-dom`, `firebase`, `qrcode.react`.

**0.2. Configurar o Vite para o GitHub Pages**
No `vite.config.js`, defina o `base` com o nome exato do repositório:
```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/caca-tesouro-ejs/', // nome do seu repositório
})
```
Se o repositório se chamar `caca-tesouro-ejs`, os assets serão servidos em `/caca-tesouro-ejs/assets/...`.

**0.3. Configurar o React Router**
No `main.jsx`, substitua `BrowserRouter` por `HashRouter`. **Não** defina `basename` no `HashRouter`, pois o roteamento por hash já é relativo por natureza:
```jsx
// src/main.jsx
import { HashRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <App />
  </HashRouter>
)
```

**0.4. Configurar o Firebase no código**
Crie `src/firebase.js` com as credenciais. Use variáveis de ambiente com o prefixo `VITE_` (o Vite só expõe variáveis com esse prefixo ao código do cliente). Para desenvolvimento local, crie um arquivo `.env.local`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
# etc.
```
No código:
```js
// src/firebase.js
import { initializeApp } from 'firebase/app'
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
}
export const app = initializeApp(firebaseConfig)
```

**0.5. Configurar o Firebase Console (auth e domínios)**
- Ative o provedor **E-mail/senha** em Authentication.
- Em **Authentication → Settings → Authorized domains**, adicione `seu-usuario.github.io` (o domínio raiz do GitHub Pages). Se usar um domínio customizado depois, adicione-o também.

---

## Fase 1 — Modelagem de Dados e Regras de Segurança

Esta fase garante que o painel administrativo seja inacessível sem autorização e que a página pública não vaze as dicas.

**1.1. Estrutura de coleções no Firestore**
- `equipes`: `{ nome, numero, ativo }`
- `qrCodes`: documento completo (admin only). Campos: `id`, `tipo`, `local`, `canalRadio`, `dicaTexto`, `memeUrl`, `ativo`.
- `qrPublic`: espelho público. Campos: `tipo`, `canalRadio`, `memeUrl`, `ativo`. **Nunca inclua `dicaTexto` nem `local`**.
- `acessos`: `{ qrId, equipeId, equipeNome, origem, timestamp }`.
- `admins`: `{ nome }` — criado manualmente no console para cada UID de administrador.

**1.2. Escrever as regras do Firestore**
As regras são a única barreira real de segurança. A página pública precisa **criar** documentos em `acessos` sem autenticação, mas as regras devem validar o formato e a existência dos documentos referenciados.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    match /admins/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false;
    }

    match /equipes/{id} {
      allow read: if true; // necessário para o dropdown na página pública
      allow write: if isAdmin();
    }

    match /qrPublic/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /qrCodes/{id} {
      allow read, write: if isAdmin();
    }

    match /acessos/{id} {
      allow read: if isAdmin();

      allow create: if
        request.resource.data.keys().hasOnly([
          'qrId', 'equipeId', 'equipeNome', 'origem', 'timestamp'
        ])
        && request.resource.data.qrId is string
        && request.resource.data.equipeId is string
        && request.resource.data.origem in ['qr', 'manual']
        && request.resource.data.timestamp == request.time
        && exists(/databases/$(database)/documents/qrPublic/$(request.resource.data.qrId))
        && exists(/databases/$(database)/documents/equipes/$(request.resource.data.equipeId));

      allow update, delete: if isAdmin();
    }
  }
}
```

**1.3. Criar o primeiro administrador**
- Crie um usuário manualmente em Authentication.
- Copie o UID e crie `admins/{uid}` no Firestore.
- Nunca permita cadastro público de usuários.

---

## Fase 2 — Desenvolvimento do Núcleo Público (Página do QR)

A página que o participante acessa ao escanear o QR deve ser mobile-first, leve e direta.

**2.1. Rota `/q/:qrId`**
- Buscar `qrPublic/{qrId}`.
- Se não existir ou `ativo === false`, exibir mensagem de QR inválido.
- Carregar `equipes` com `ativo === true` para o dropdown.
- O participante seleciona a equipe e confirma.

**2.2. Lógica após a confirmação**
- Criar documento em `acessos` com `origem: 'qr'`.
- Se `tipo === 'dica'`: exibir **apenas** o canal de rádio (ex.: “Sintonize o Canal 2 e aguarde”). Não exibir a frase da dica.
- Se `tipo === 'meme'`: exibir a imagem do meme.

**2.3. Considerações mobile**
- Botões grandes (mínimo 44px de altura), tipografia legível, contraste alto.
- Evitar dependências pesadas nesta página; ela será aberta no celular, possivelmente com internet instável no campus.

---

## Fase 3 — Painel Administrativo

O painel é para notebook, com foco em monitoramento em tempo real.

**3.1. Proteção de rota**
Crie um componente `AdminRoute` que verifica `onAuthStateChanged` e a existência de `admins/{uid}`. Se não for admin, redireciona para `/admin/login`.

**3.2. Dashboard principal (`/admin`)**
- Escutar `qrCodes` e `acessos` com `onSnapshot`.
- Para cada QR, determinar o **último acesso** (primeiro acesso da lista ordenada por timestamp desc).
- Exibir cartões com estado visual:
  - **Aguardando**: borda cinza/neutra.
  - **Acessado**: borda verde, nome da equipe e, se for dica, um alerta destacado: *“Transmitir no Canal X para Equipe Y”*.
- Um feed lateral com os acessos mais recentes ajuda na operação em tempo real.

**3.3. CRUD de dicas e memes (`/admin/qrcodes`)**
- Formulário com campos condicionais (se `tipo === 'dica'`, mostrar `canalRadio` e `dicaTexto`; se `tipo === 'meme'`, mostrar `memeUrl`).
- Ao salvar, usar um `writeBatch` para gravar **simultaneamente** em `qrCodes` e `qrPublic` com o mesmo ID.

**3.4. Geração e impressão de QR Codes (`/admin/qrcodes/print`)**
- Renderizar `QRCodeSVG` com `value={`${window.location.origin}${import.meta.env.BASE_URL}q/${qrId}`}`.
  - Exemplo: `https://seu-usuario.github.io/caca-tesouro-ejs/#/q/QR001`.
- CSS `@media print` para organizar os QR Codes em folha A4, com o ID visível abaixo de cada um.

**3.5. Registro manual (contingência)**
- Formulário simples para selecionar QR e equipe quando a internet falhar no campus. Grava em `acessos` com `origem: 'manual'`.

---

## Fase 4 — Integração, Usabilidade e Testes

**4.1. Teste do fluxo completo localmente**
- Rode `npm run dev` e escaneie um QR gerado na tela com o celular (mesma rede Wi-Fi).
- Verifique se o acesso aparece no dashboard em tempo real.
- Teste o registro manual.

**4.2. Teste de build e preview**
- `npm run build` e `npm run preview`.
- Confirme que os assets carregam corretamente no caminho `/nome-do-repositorio/`.

**4.3. Ajustes de responsividade**
- Página pública: testar em telas pequenas (320px–428px).
- Painel: testar em resoluções de notebook (1366×768, 1440×900).

---

## Fase 5 — Deploy no GitHub Pages

Há duas abordagens. A mais recomendada é usar **GitHub Actions** com a fonte “GitHub Actions” nas configurações do repositório, pois automatiza o deploy a cada push na branch principal.

**5.1. Configurar os segredos do Firebase no GitHub**
Em **Settings → Secrets and variables → Actions**, adicione cada variável `VITE_FIREBASE_...` como secret. O workflow injetará esses valores no build.

**5.2. Criar o workflow de deploy**
Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v4
```

**5.3. Ativar o Pages no repositório**
Em **Settings → Pages → Source**, selecione **GitHub Actions**. Após o primeiro push na `main`, o workflow deve rodar e publicar o site.

**5.4. Adicionar o domínio aos autorizados do Firebase (reforço)**
Confirme que `seu-usuario.github.io` está nos domínios autorizados do Firebase Authentication. Sem isso, o login do administrador pode falhar no ambiente publicado.

**5.5. Teste pós-deploy**
- Acesse `https://seu-usuario.github.io/nome-do-repositorio/` e verifique se o app carrega.
- Teste o login administrativo.
- Gere um QR, escaneie com o celular e confirme se a URL pública (`...#/q/QR001`) abre corretamente.

---

## Fase 6 — Checklist Final para o Dia do Evento

- [ ] Regras do Firestore publicadas e testadas no simulador.
- [ ] Domínio `seu-usuario.github.io` nos domínios autorizados do Firebase Auth.
- [ ] `HashRouter` configurado e `base` do Vite correspondendo ao nome do repositório.
- [ ] Segredos do Firebase configurados no GitHub Actions e deploy validado.
- [ ] QR Codes impressos e testados com celular real.
- [ ] Painel administrativo aberto em um notebook no Bloco A para conferência dos prêmios.
- [ ] Formulário de contingência manual acessível na tela do organizador.
- [ ] Bateria/power bank para o notebook do painel.

---

### Resumo das armadilhas específicas do GitHub Pages

| Ponto | O que fazer | Por quê |
|---|---|---|
| Roteamento | Usar `HashRouter` sem `basename` | GitHub Pages não faz rewrite de URLs; o hash evita 404 ao atualizar páginas internas |
| Caminho dos assets | `base: '/nome-do-repo/'` no `vite.config.js` | Se ficar como `/`, os arquivos JS/CSS darão 404 no subdiretório do GitHub Pages |
| Auth do Firebase | Adicionar `usuario.github.io` aos domínios autorizados | O Firebase Auth só permite login em domínios explicitamente autorizados |
| Segredos do build | Usar `VITE_*` como secrets no GitHub Actions | O Vite só expõe ao cliente variáveis com esse prefixo, e o GitHub Actions precisa injetá-las no momento do build |
