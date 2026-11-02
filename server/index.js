import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getAllBrainrots } from './brainrotData.js';
import { gameManager } from './gameManager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3005;
const isProd = process.env.NODE_ENV === 'production';

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve local Brainrot images
const imagesPath = path.join(__dirname, 'data', 'images');
app.use('/images/brainrots', express.static(imagesPath, {
  maxAge: '7d',
  immutable: true
}));

// API Image Proxy for Fandom CDN with Referer (bulletproof backup)
app.get('/api/image-proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://stealabr.fandom.com/'
      }
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).send('Upstream image error');
    }

    const contentType = upstreamRes.headers.get('content-type') || 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const buffer = await upstreamRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send('Proxy error');
  }
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

app.get('/api/brainrots', (req, res) => {
  const all = getAllBrainrots();
  res.json(all);
});

app.get('/api/stats', (req, res) => {
  res.json({
    connectedPlayers: io.engine.clientsCount,
    activeRooms: gameManager.rooms.size
  });
});

// Serve frontend in production
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/images') || req.path.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Brainrot Qui Est-ce API is running. Client build in progress...');
    }
  });
});

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

function broadcastPlayerCount() {
  io.emit('online_count', { count: io.engine.clientsCount });
}

function broadcastRoomUpdate(room) {
  if (!room) return;
  for (const player of room.players) {
    const state = gameManager.getSanitizedState(room, player.socketId);
    io.to(player.socketId).emit('room_updated', state);
  }
}

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);
  broadcastPlayerCount();

  // Create room
  socket.on('create_room', (data, callback) => {
    try {
      const room = gameManager.createRoom({
        id: socket.id,
        nickname: data?.nickname || 'Joueur 1',
        avatar: data?.avatar || '👑'
      }, {
        boardSize: data?.boardSize || 24
      });

      socket.join(room.code);
      const state = gameManager.getSanitizedState(room, socket.id);

      if (typeof callback === 'function') callback({ success: true, room: state });
      socket.emit('room_created', state);
      console.log(`[Room Created] Code: ${room.code} by ${data?.nickname}`);
    } catch (err) {
      console.error('Error create_room:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Erreur création salon' });
    }
  });

  // Join room
  socket.on('join_room', (data, callback) => {
    try {
      const { code, nickname, avatar } = data || {};
      const result = gameManager.joinRoom(code, {
        id: socket.id,
        nickname: nickname || 'Joueur 2',
        avatar: avatar || '⚡'
      });

      if (result.error) {
        if (typeof callback === 'function') callback({ success: false, error: result.error });
        return;
      }

      const room = result.room;
      socket.join(room.code);

      const state = gameManager.getSanitizedState(room, socket.id);
      if (typeof callback === 'function') callback({ success: true, room: state });

      broadcastRoomUpdate(room);
      console.log(`[Room Joined] ${nickname} joined ${room.code}`);
    } catch (err) {
      console.error('Error join_room:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Erreur connexion salon' });
    }
  });

  // Start game
  socket.on('start_game', (data, callback) => {
    try {
      const { code, boardSize } = data || {};
      const result = gameManager.startGame(code, socket.id, { boardSize });

      if (result.error) {
        if (typeof callback === 'function') callback({ success: false, error: result.error });
        return;
      }

      const room = result.room;
      broadcastRoomUpdate(room);

      // Play sound notification
      io.to(room.code).emit('game_started');
      if (typeof callback === 'function') callback({ success: true });
      console.log(`[Game Started] Room ${room.code} with ${room.board.length} characters`);
    } catch (err) {
      console.error('Error start_game:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Erreur démarrage' });
    }
  });

  // Ask question
  socket.on('ask_question', (data, callback) => {
    try {
      const { code, category, questionText } = data || {};
      const result = gameManager.askQuestion(code, socket.id, { category, questionText });

      if (result.error) {
        if (typeof callback === 'function') callback({ success: false, error: result.error });
        return;
      }

      broadcastRoomUpdate(result.room);

      // Notify the opponent specifically with question popup
      io.to(result.targetSocketId).emit('question_received', result.question);

      if (typeof callback === 'function') callback({ success: true, question: result.question });
      console.log(`[Question Asked] Room ${code}: "${questionText}"`);
    } catch (err) {
      console.error('Error ask_question:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Erreur question' });
    }
  });

  // Answer question (OUI or NON)
  socket.on('answer_question', (data, callback) => {
    try {
      const { code, answer } = data || {};
      const result = gameManager.answerQuestion(code, socket.id, answer);

      if (result.error) {
        if (typeof callback === 'function') callback({ success: false, error: result.error });
        return;
      }

      broadcastRoomUpdate(result.room);
      io.to(result.room.code).emit('question_resolved', result.historyItem);

      if (typeof callback === 'function') callback({ success: true });
      console.log(`[Question Answered] Room ${code}: ${answer}`);
    } catch (err) {
      console.error('Error answer_question:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Erreur réponse' });
    }
  });

  // Make guess (Accuse a character)
  socket.on('make_guess', (data, callback) => {
    try {
      const { code, guessedBrainrotId } = data || {};
      const result = gameManager.makeGuess(code, socket.id, guessedBrainrotId);

      if (result.error) {
        if (typeof callback === 'function') callback({ success: false, error: result.error });
        return;
      }

      // Game is now over, broadcast full state with secrets revealed!
      broadcastRoomUpdate(result.room);

      io.to(result.room.code).emit('game_over_result', {
        isCorrect: result.isCorrect,
        guessedCard: result.guessedCard,
        guesser: result.guesser,
        opponent: result.opponent,
        winner: result.winner,
        winReason: result.winReason
      });

      if (typeof callback === 'function') callback({ success: true });
      console.log(`[Guess Made] Room ${code}: Correct=${result.isCorrect}`);
    } catch (err) {
      console.error('Error make_guess:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Erreur accusation' });
    }
  });

  // Flip/eliminate a card on personal board
  socket.on('toggle_card', (data, callback) => {
    try {
      const { code, cardId } = data || {};
      const result = gameManager.toggleCardElimination(code, socket.id, cardId);

      if (result) {
        // Return updated elimination list to player
        if (typeof callback === 'function') callback({ success: true, ...result });

        // Inform opponent of eliminated cards count without disclosing which card
        const room = gameManager.getRoom(code);
        if (room) {
          const opponent = room.players.find(p => p.socketId !== socket.id);
          if (opponent) {
            io.to(opponent.socketId).emit('opponent_eliminated_count', {
              count: result.count
            });
          }
        }
      }
    } catch (err) {
      console.error('Error toggle_card:', err);
    }
  });

  // Rematch request
  socket.on('request_rematch', (data, callback) => {
    try {
      const { code } = data || {};
      const result = gameManager.requestRematch(code, socket.id);

      if (result.error) {
        if (typeof callback === 'function') callback({ success: false, error: result.error });
        return;
      }

      broadcastRoomUpdate(result.room);

      if (result.waitingForOther) {
        io.to(result.room.code).emit('rematch_offered', { requestedBy: result.requestedBy });
      } else {
        io.to(result.room.code).emit('rematch_started');
      }

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      console.error('Error request_rematch:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Erreur revanche' });
    }
  });

  // Leave room voluntarily
  socket.on('leave_room', (data) => {
    const code = data?.code;
    const leaveResult = gameManager.removePlayer(socket.id);
    if (leaveResult && !leaveResult.roomDestroyed) {
      broadcastRoomUpdate(leaveResult.room);
      io.to(leaveResult.code).emit('player_left', {
        player: leaveResult.leavingPlayer
      });
    }
    if (code) socket.leave(code);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
    broadcastPlayerCount();

    const leaveResult = gameManager.removePlayer(socket.id);
    if (leaveResult && !leaveResult.roomDestroyed) {
      broadcastRoomUpdate(leaveResult.room);
      io.to(leaveResult.code).emit('player_left', {
        player: leaveResult.leavingPlayer
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`🎮 Serveur Brainrot Qui Est-ce démarré sur http://localhost:${PORT}`);
  console.log(`📦 Prêt pour le déploiement sur Render.com`);
});
