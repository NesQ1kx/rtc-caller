import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();

const server = createServer(app);

const wss = new WebSocketServer({ server });

const rooms = new Map();

wss.on('connection', ws => {
    ws.on('message', message => {
        const data = JSON.parse(message);

        if (data.type === 'create-room') {
            const roomId = uuidv4();
            rooms.set(roomId, []);
            ws.send(JSON.stringify({ type: 'create-room', roomId }));

            return;
        }

        if (data.type === 'join-room') {
            const room = rooms.get(data.roomId);
            room.push(ws);
            ws.roomId = data.roomId;

            ws.send(JSON.stringify({ type: 'join-room', isInitiator: room.length === 1 }));

            if (room.length === 2) {
                room[0].send(JSON.stringify({ type: 'peer-joined' }));
            }

            return;
        }

        if (data.type === 'peer-disconnected') {
            console.log(data);
            const clients = rooms.get(data.roomId) ?? [];

            const newClients = clients.filter(client => client !== ws);
            rooms.set(data.roomId, newClients);

            if (newClients.length) {
                newClients[0].send(JSON.stringify(data));
            }

            return;
        }

        const clients = rooms.get(data.roomId) ?? [];
        for (const client of clients) {
            if (client !== ws && client.readyState === 1) {
                client.send(JSON.stringify(data));
            }
        }
    });

    ws.on('close', () => {
        if (!ws.roomId) return;
        const room = rooms.get(ws.roomId) || [];
        rooms.set(ws.roomId, room.filter(c => c !== ws));
    });
});

app.get('/', (req, res) => {
    res.send('Hello HTTP World!');
});

server.listen(8080);