const express = require('express');
const wppconnect = require('@wppconnect-team/wppconnect');

const app = express();
app.use(express.json());

const PORT = 8081;

let clientInstance = null;

// Inicializa o WhatsApp
wppconnect
  .create({
    session: 'nextcut-session',
    catchQR: (base64Qr, asciiQR) => {
      console.log('\n\n=========================================');
      console.log('Escaneie o QR Code abaixo no seu WhatsApp:');
      console.log('=========================================\n\n');
      console.log(asciiQR); // Mostra o QR code no próprio terminal
    },
    statusFind: (statusSession, session) => {
      console.log('Status do WhatsApp:', statusSession, session);
    },
    headless: true, // Roda em modo invisível (sem abrir janela do Chrome)
  })
  .then((client) => {
    clientInstance = client;
    console.log('✅ WhatsApp conectado com sucesso!');
  })
  .catch((error) => console.log('Erro ao iniciar o WhatsApp:', error));

// Endpoint que o Backend do NextCut (Java) vai chamar
// Evolution API envia para /message/sendText/:instance
app.post('/message/sendText/:instance', async (req, res) => {
  if (!clientInstance) {
    return res.status(503).json({ error: 'WhatsApp ainda não está pronto/conectado.' });
  }

  const { number, text } = req.body;

  if (!number || !text) {
    return res.status(400).json({ error: 'Número e texto são obrigatórios.' });
  }

  try {
    // WPPConnect usa o formato 5531999999999@c.us
    const chatId = `${number}@c.us`;
    const result = await clientInstance.sendText(chatId, text);
    
    console.log(`Mensagem enviada para ${number}:`, text.split('\n')[0]);
    res.json({ success: true, messageId: result.id || 'sent' });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Falha ao enviar mensagem.' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Micro-serviço de WhatsApp rodando na porta ${PORT}`);
  console.log(`Ponto de entrada: POST http://localhost:${PORT}/message/sendText/NextCut\n`);
});
