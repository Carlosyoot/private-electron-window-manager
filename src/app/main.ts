import { WindowController } from "../lib/Controller";
import { ChatWindow, ConfigWindow, ViewerWindow } from "./classexample";

const app = new WindowController();

// --- CASO 1: Singleton (Fácil) ---
// Abre a config
app.open(ConfigWindow); 

// Tenta abrir de novo -> Apenas foca a existente
app.open(ConfigWindow); 


// --- CASO 2: Multi-Instância (Explícito) ---
const chatJoao = app.open(ChatWindow); // Instância A
const chatMaria = app.open(ChatWindow); // Instância B


// --- CASO 3: Resolvendo Parent ---

// A. Usando CLASSE como Pai (Funciona pois ConfigWindow é Singleton)
app.open(ViewerWindow, { 
  parent: ConfigWindow, 
  modal: true 
});

// B. Usando INSTÂNCIA como Pai (Funciona para Multi-instância)
// Abre o visualizador preso à janela do João
app.open(ViewerWindow, { 
  parent: chatJoao, 
  modal: true 
});

// C. Erro de Ambiguidade (O Controller protege você)
try {
  // ERRO: Existem 2 ChatWindows. Qual delas é o pai?
  app.open(ViewerWindow, { parent: ChatWindow }); 
} catch (e) {
  console.error(e.message); // "Você tentou usar a classe ChatWindow... mas ela não é um Singleton..."
}


// --- CASO 4: IPC Direcionado ---
app.send(chatMaria, 'nova-msg', 'Oi Maria!'); // Vai só para a Maria
app.send(ConfigWindow, 'update', { theme: 'dark' }); // Vai para a Config (via classe)