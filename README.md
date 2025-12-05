# @cyoot/electron-nexus

Uma biblioteca de arquitetura para Electron que organiza o Processo Principal utilizando Classes, Controladores e Injeção de Dependência.

O objetivo desta biblioteca é eliminar a complexidade de gerenciar múltiplas janelas (`BrowserWindow`), roteamento de IPCs e eventos nativos, fornecendo uma API fluente e tipada.

## Instalação

```bash
npm install @cyoot/electron-nexus
```

## Conceitos Principais

* **WindowController:** O orquestrador central que gerencia o ciclo de vida, singletons e segurança.
* **WindowBuilder:** Define a aparência e conteúdo da janela de forma declarativa.
* **IpcChannel:** Gerencia comunicação assíncrona com o Frontend, com escopo isolado por janela.
* **WindowEvents:** Gerencia eventos nativos da janela (resize, close, blur).
* **WindowRouter:** Utilitário para comunicação entre janelas (Broadcast ou Direcionado).

## Guia de Uso

### 1. Definindo uma Janela

Em vez de criar funções soltas, cada janela é uma Classe. A configuração é definida no construtor.

```typescript
import { WindowBuilder, IpcChannel, WindowEvents } from '@cyoot/electron-nexus';
import path from 'path';

export class MainWindow {
    constructor() {
        // 1. Configuração Visual
        new WindowBuilder({ singleton: true })
            .setup({ width: 1024, height: 768, title: 'Main Window' })
            .file(path.join(__dirname, 'index.html'))
            .setup({ 
                webPreferences: { 
                    preload: path.join(__dirname, 'preload.js') 
                } 
            });

        // 2. Comunicação (IPC)
        // O callback recebe automaticamente a instância da janela (win)
        new IpcChannel()
            .on('app:ping', (evt, win, data) => {
                console.log('Recebido:', data);
                evt.reply('app:pong', { msg: 'Pong' });
            })
            .handle('app:version', () => '1.0.0');

        // 3. Eventos Nativos
        new WindowEvents()
            .on('close', (evt, win) => {
            });
    }
}
```

### 2. Configurando o Processo Principal (Main)

No seu arquivo de entrada do Electron, inicialize o `WindowController`.

```typescript
import { app } from 'electron';
import { WindowController } from '@cyoot/electron-nexus';
import { MainWindow } from './windows/MainWindow';

// Configurações globais aplicadas a todas as janelas
const controller = new WindowController({
    defaults: {
        backgroundColor: '#ffffff',
        frame: true
    }
});

app.whenReady().then(() => {
    controller.open(MainWindow);
});
```

### 3. Comunicação entre Janelas (Router)

O `WindowRouter` permite enviar mensagens do backend para janelas específicas ou para todas, sem que o Frontend precise solicitar.

```typescript
import { WindowRouter } from '@cyoot/electron-nexus';
import { MainWindow } from './windows/MainWindow';

// Enviar para uma janela específica (Singleton)
WindowRouter.sendTo(MainWindow, 'system:update', { status: 'downloading' });

// Enviar para todas as janelas abertas (Broadcast)
WindowRouter.broadcast('system:theme-change', 'dark');
```

### 4. Configuração do Preload

Para garantir a segurança e o funcionamento dos IPCs, utilize um arquivo de preload que exponha os métodos `send`, `on` e `invoke`.

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => {
        const subscription = (event, ...args) => func(...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
    },
    invoke: (channel, data) => ipcRenderer.invoke(channel, data)
});
```

## TypeScript

Esta biblioteca foi escrita em TypeScript e inclui definições de tipos (`.d.ts`). Recomenda-se o uso de **Generics** nos métodos de IPC para garantir segurança de tipos no payload.

```typescript
new IpcChannel()
    .on<{ id: number }>('user:get', (evt, win, data) => {
        // data.id é tipado como number
    });
```

## Licença

MIT