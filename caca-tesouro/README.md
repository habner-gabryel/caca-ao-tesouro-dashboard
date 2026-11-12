# Caça ao Tesouro Dashboard

Aplicação React para o fluxo de QR Code, painel administrativo e impressão em ambiente GitHub Pages.

## Visão geral

A estrutura inicial já contempla:

- roteamento com `HashRouter` para funcionar no GitHub Pages;
- página pública para leitura do QR e confirmação de equipe;
- painel administrativo com login e dashboard básico;
- gestão de QR Codes com condicional de tipo (`dica` ou `meme`);
- tela de impressão com `QRCodeSVG`.

## Configuração local

1. Copie o arquivo `.env.example` para `.env.local`.
2. Preencha as variáveis Firebase com o prefixo `VITE_`.
3. Rode:

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy no GitHub Pages

A base do Vite já foi configurada para o repositório `caca-ao-tesouro-dashboard`, e o `HashRouter` evita problemas de roteamento em páginas estáticas.

Para produção, as variáveis do Firebase devem ser injetadas via secrets no GitHub Actions conforme o plano de deploy do projeto.
