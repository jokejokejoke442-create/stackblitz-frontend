import { NextRequest } from 'next/server';
import { Server } from 'socket.io';

let io: Server;

export async function GET(req: NextRequest) {
  if (!io) {
    // Initialize Socket.IO server
    io = new Server({
      path: '/api/socketio',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('message', (msg: { text: string; senderId: string }) => {
        socket.emit('message', {
          text: `Echo: ${msg.text}`,
          senderId: 'system',
          timestamp: new Date().toISOString(),
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

      socket.emit('message', {
        text: 'Welcome to WebSocket Echo Server!',
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });
  }

  return new Response('Socket.IO server initialized', { status: 200 });
}