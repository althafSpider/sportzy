import { WebSocket, WebSocketServer } from "ws";
import { json } from "zod";

function sendJson(socket, payload) {
    if(socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify(payload));
}
function broadcast(wss,payload) {
for (const client of wss.clients) {
    if(client.readyState !== WebSocket.OPEN) return
    console.log("broadcasting", payload);
    
    client.send(JSON.stringify(payload))
}
}
export function attachWebscoketServer(server) {
    const wss = new WebSocketServer({ server, path: '/ws',maxPayload:1024 * 1024 });
    wss.on('connection',(socket) => {
         sendJson(socket, { type: 'welcome' });

        socket.on('error',console.error);
    })
    function broadcastMatchCreated(match) {
        broadcast(wss, { type: 'match_created', data: match });
    }
    return { broadcastMatchCreated }
}

