# NextCut

[![CI Tests](https://github.com/AndersonFQueiroz/NextCut/actions/workflows/tests.yml/badge.svg)](https://github.com/AndersonFQueiroz/NextCut/actions/workflows/tests.yml)

Base do frontend (**React + Vite + TailwindCSS**), componentes **Button / Input / Card**, testes (**Vitest** no frontend, **JUnit 5 + Mockito** no backend mínimo) e **GitHub Actions**.

## Rodar o frontend

```bash
cd frontend
npm install
npm run dev
```

## Testes

```bash
cd frontend && npm test
cd backend && mvn test
```

## Estrutura

```
├── frontend/     # Vite + React + Tailwind
├── backend/      # Maven — apenas dependências de teste (issue #9)
└── .github/workflows/tests.yml
```
