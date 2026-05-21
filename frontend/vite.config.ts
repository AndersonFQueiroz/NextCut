// defineConfig tipa o objeto de configuração e habilita autocomplete da IDE para opções do Vite.
import { defineConfig } from 'vite'
// Plugin que compila JSX/TSX e aplica Fast Refresh ao salvar arquivos durante npm run dev.
import react from '@vitejs/plugin-react'

// Objeto exportado é lido pelo comando `vite` ou `vite build`.
// Documentação oficial das opções: https://vite.dev/config/
export default defineConfig({
  // plugins: lista de extensões do Vite; sem @vitejs/plugin-react o projeto não entenderia JSX em .tsx.
  plugins: [react()],
})
