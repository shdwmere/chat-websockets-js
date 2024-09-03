const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });
const clc = require('cli-color');

const greenBold = clc.green.bold;
const greenBoldUnderl = clc.green.bold.underline;
const yellowBold = clc.yellow.bold;
const yellowBoldUnderl = clc.yellow.bold.underline;
const cyanBold = clc.cyan.bold;
const redBold = clc.red.bold;
const redBoldUnderl = clc.red.bold.underline;


// Mantenha uma lista de clientes conectados com suas identificações
const clients = new Map();

server.on('listening', () => {
    const { port } = server.address();
    console.log(greenBold(`\n[+] WebSocket Server | Running on Port ${port}\n`));
});

// Quando um cliente se conecta ao servidor
server.on('connection', ws => {
    console.log(cyanBold('\n[+] Novo cliente conectado'));
    
    // Envia uma mensagem solicitando o nome do usuário
    ws.send('Por favor, informe seu nome de usuario.');
    ws.send('Caso esteja no Postman, mande em JSON: { "username": "seu_nome" }')

    // Recebe a primeira mensagem com o nome de usuário
    ws.once('message', message => {
        try {
            const { username } = JSON.parse(message);
            if (username && typeof username === 'string') {
                clients.set(ws, username);
                console.log(greenBold(`\n[+] Usuário ${yellowBoldUnderl(username)} conectado`));

                // Envia uma mensagem de boas-vindas
                ws.send(`• Bem-vindo ao servidor WebSocket, ${username}!`);
            } else {
                ws.send('Nome de usuário inválido. Por favor, envie um JSON válido com o nome de usuário.');
                ws.close();
                return;
            }

            // Processa mensagens subsequentes
            ws.on('message', message => {
                console.log(`\n${yellowBold(username)}: ${message}`);
                broadcast(`${username}: ${message}`, ws);
            });

            // Processa desconexão
            ws.on('close', () => {
                console.log(redBold(`\n[-] Usuário ${redBoldUnderl(username)} desconectado`));
                clients.delete(ws);
            });
        } catch (error) {
            ws.send('Erro ao processar o nome de usuário. Envie um JSON válido.');
            ws.close();
        }
    });

});

function broadcast(message, sender) {
    clients.forEach((username, client) => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            // transmitindo mensagens que não sejam do remetente
            client.send(`${message}`);
        }
    });
}
