// Importa o cliente axios para facilitar chamadas HTTP com baseURL e interceptors
import axios from 'axios'

// Nota: se o navegador bloquear requisições por CORS, o backend Java (arquivo App.java)
// pode precisar chamar algo como `app.config.enableCorsForAllOrigins();` ou equivalente
// no inicializador do Javalin. Arquivo backend alvo: backend/src/main/java/com/nextcut/app/App.java

// Cria uma instância do axios com baseURL vindo das variáveis de ambiente do Vite
const api = axios.create({
  // baseURL usa VITE_API_URL para apontar para http://localhost:8080 em desenvolvimento
  baseURL: import.meta.env.VITE_API_URL,
})

// Interceptor de requisição: injeta o token correto salvo em localStorage
api.interceptors.request.use((config) => {
  // Lê o token salvo com a chave `nextcut_token` conforme contrato do frontend/backend
  const token = localStorage.getItem('nextcut_token')

  // Se houver token, adiciona o header Authorization no padrão Bearer
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Retorna a configuração possivelmente modificada para que o axios prossiga
  return config
})

// Interceptor de resposta: traduz mensagens de erro de servidor para uma mensagem amigável
api.interceptors.response.use(
  // Passa a resposta adiante sem alterações quando tudo OK
  (response) => response,
  // Trata erros transformando mensagens de 5xx em uma mensagem legível e preservando o erro
  (error) => {
    // Se for erro de servidor, adiciona uma mensagem amigável em `error.userMessage`
    if (error.response?.status >= 500) {
      error.userMessage = 'Não foi possível concluir a ação. Tente novamente em instantes.'
    }

    // Rejeita a promise para que o consumidor trate o erro adequadamente
    return Promise.reject(error)
  },
)

// Exporta a instância configurada para ser usada pelo frontend
export default api
