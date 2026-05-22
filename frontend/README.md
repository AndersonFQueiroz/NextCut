# NextCut Frontend

Frontend web do NextCut, construído com React, Vite, React Router, Tailwind CSS, Axios e Vitest.

## Como rodar

```bash
npm install
cp .env.example .env
npm run dev
```

O `.env` deve apontar para o backend local:

```env
VITE_API_URL=http://localhost:8080
```

## Scripts

```bash
npm test
npm run build
npm run preview
```

## Estrutura principal

- `src/pages`: telas de entrada do cliente, acompanhamento da fila, login e painel admin.
- `src/components`: componentes reutilizáveis.
- `src/hooks`: hooks de integração, incluindo WebSocket da fila.
- `src/services`: cliente HTTP usado para falar com a API.
- `src/tests`: testes com Vitest e Testing Library.

## Observações

O painel administrativo já possui interface e rotas protegidas no frontend. Algumas ações administrativas dependem de endpoints backend planejados no roadmap do projeto.
