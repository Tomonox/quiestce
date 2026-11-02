import { generateGameBoard, pickSecretBrainrot } from './brainrotData.js';

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class GameManager {
  constructor() {
    this.rooms = new Map();
    // Periodic cleanup of abandoned rooms (> 45 min)
    setInterval(() => this.cleanupInactiveRooms(), 10 * 60 * 1000);
  }

  createRoom(hostData, options = {}) {
    let code = generateRoomCode();
    while (this.rooms.has(code)) {
      code = generateRoomCode();
    }

    const host = {
      id: hostData.id,
      socketId: hostData.id,
      nickname: (hostData.nickname || 'Joueur 1').trim().slice(0, 20),
      avatar: hostData.avatar || '👑',
      isHost: true,
      ready: true,
      secret: null,
      eliminatedCards: [],
      rematchRequested: false
    };

    const room = {
      code,
      status: 'waiting', // waiting, ready, playing, game_over
      createdAt: Date.now(),
      lastActivity: Date.now(),
      players: [host],
      boardSize: options.boardSize || 24,
      board: [],
      turnNumber: 1,
      currentTurnPlayerId: null,
      turnState: 'asking', // 'asking', 'answering'
      pendingQuestion: null,
      history: [],
      winner: null,
      winReason: null
    };

    this.rooms.set(code, room);
    return room;
  }

  joinRoom(code, playerData) {
    const cleanCode = (code || '').toUpperCase().trim();
    const room = this.rooms.get(cleanCode);
    if (!room) {
      return { error: 'Salon introuvable. Vérifiez le code.' };
    }

    if (room.players.length >= 2) {
      return { error: 'Ce salon est déjà complet (2 joueurs max).' };
    }

    if (room.status === 'playing') {
      return { error: 'Une partie est déjà en cours dans ce salon.' };
    }

    const guest = {
      id: playerData.id,
      socketId: playerData.id,
      nickname: (playerData.nickname || 'Joueur 2').trim().slice(0, 20),
      avatar: playerData.avatar || '⚡',
      isHost: false,
      ready: true,
      secret: null,
      eliminatedCards: [],
      rematchRequested: false
    };

    room.players.push(guest);
    room.status = 'ready';
    room.lastActivity = Date.now();

    return { room };
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toUpperCase().trim());
  }

  getRoomByPlayerId(socketId) {
    for (const room of this.rooms.values()) {
      if (room.players.some(p => p.socketId === socketId)) {
        return room;
      }
    }
    return null;
  }

  startGame(code, requesterSocketId, options = {}) {
    const room = this.getRoom(code);
    if (!room) return { error: 'Salon introuvable.' };

    const host = room.players.find(p => p.isHost);
    if (!host || host.socketId !== requesterSocketId) {
      return { error: 'Seul l\'hôte peut lancer la partie.' };
    }

    if (room.players.length < 2) {
      return { error: 'Il faut 2 joueurs pour démarrer la partie.' };
    }

    const boardSize = options.boardSize || room.boardSize || 24;
    room.boardSize = boardSize;
    room.board = generateGameBoard(boardSize);

    // Pick unique secrets for both players
    room.players[0].secret = pickSecretBrainrot(room.board);
    // Ensure second secret can be different or from board
    room.players[1].secret = pickSecretBrainrot(room.board);

    // Reset player state
    room.players.forEach(p => {
      p.eliminatedCards = [];
      p.rematchRequested = false;
    });

    room.status = 'playing';
    room.turnNumber = 1;
    // Host starts first
    room.currentTurnPlayerId = room.players[0].socketId;
    room.turnState = 'asking';
    room.pendingQuestion = null;
    room.history = [];
    room.winner = null;
    room.winReason = null;
    room.lastActivity = Date.now();

    return { room };
  }

  askQuestion(code, askerSocketId, { category, questionText }) {
    const room = this.getRoom(code);
    if (!room || room.status !== 'playing') return { error: 'Partie non active.' };

    if (room.currentTurnPlayerId !== askerSocketId) {
      return { error: 'Ce n\'est pas votre tour.' };
    }

    if (room.turnState !== 'asking') {
      return { error: 'Une question est déjà en attente de réponse.' };
    }

    const asker = room.players.find(p => p.socketId === askerSocketId);
    const opponent = room.players.find(p => p.socketId !== askerSocketId);

    const question = {
      id: 'q_' + Date.now(),
      askerId: askerSocketId,
      askerName: asker.nickname,
      category: category || 'Général',
      text: (questionText || '').trim(),
      timestamp: Date.now()
    };

    room.pendingQuestion = question;
    room.turnState = 'answering';
    room.lastActivity = Date.now();

    return { room, question, targetSocketId: opponent.socketId };
  }

  answerQuestion(code, respondentSocketId, answer) {
    const room = this.getRoom(code);
    if (!room || room.status !== 'playing') return { error: 'Partie non active.' };

    if (room.turnState !== 'answering' || !room.pendingQuestion) {
      return { error: 'Aucune question en attente de réponse.' };
    }

    const opponent = room.players.find(p => p.socketId !== room.currentTurnPlayerId);
    if (opponent.socketId !== respondentSocketId) {
      return { error: 'Seul l\'adversaire interrogé peut répondre.' };
    }

    const cleanAnswer = answer === 'OUI' ? 'OUI' : 'NON';

    const historyItem = {
      ...room.pendingQuestion,
      answer: cleanAnswer,
      answeredAt: Date.now()
    };

    room.history.push(historyItem);
    room.pendingQuestion = null;

    // Switch turn to the respondent
    room.currentTurnPlayerId = opponent.socketId;
    room.turnState = 'asking';
    room.turnNumber += 1;
    room.lastActivity = Date.now();

    return { room, historyItem };
  }

  makeGuess(code, guesserSocketId, guessedBrainrotId) {
    const room = this.getRoom(code);
    if (!room || room.status !== 'playing') return { error: 'Partie non active.' };

    if (room.currentTurnPlayerId !== guesserSocketId) {
      return { error: 'Vous ne pouvez deviner que pendant votre tour.' };
    }

    const guesser = room.players.find(p => p.socketId === guesserSocketId);
    const opponent = room.players.find(p => p.socketId !== guesserSocketId);
    const guessedCard = room.board.find(b => b.id === guessedBrainrotId);

    if (!guessedCard) {
      return { error: 'Personnage introuvable sur le plateau.' };
    }

    const isCorrect = opponent.secret && opponent.secret.id === guessedBrainrotId;

    room.status = 'game_over';
    room.lastActivity = Date.now();

    if (isCorrect) {
      room.winner = {
        socketId: guesser.socketId,
        nickname: guesser.nickname,
        avatar: guesser.avatar
      };
      room.winReason = `${guesser.nickname} a correctement deviné : c'était bien ${guessedCard.name} ! 🎉`;
    } else {
      room.winner = {
        socketId: opponent.socketId,
        nickname: opponent.nickname,
        avatar: opponent.avatar
      };
      room.winReason = `${guesser.nickname} a accusé ${guessedCard.name}... Mauvaise réponse ! ${opponent.nickname} remporte la partie ! 🏆`;
    }

    const result = {
      room,
      isCorrect,
      guessedCard,
      guesser,
      opponent,
      winner: room.winner,
      winReason: room.winReason
    };

    return result;
  }

  toggleCardElimination(code, playerSocketId, cardId) {
    const room = this.getRoom(code);
    if (!room || room.status !== 'playing') return null;

    const player = room.players.find(p => p.socketId === playerSocketId);
    if (!player) return null;

    const idx = player.eliminatedCards.indexOf(cardId);
    if (idx >= 0) {
      player.eliminatedCards.splice(idx, 1);
    } else {
      player.eliminatedCards.push(cardId);
    }

    room.lastActivity = Date.now();
    return {
      eliminatedCards: player.eliminatedCards,
      count: player.eliminatedCards.length
    };
  }

  requestRematch(code, playerSocketId) {
    const room = this.getRoom(code);
    if (!room) return { error: 'Salon introuvable.' };

    const player = room.players.find(p => p.socketId === playerSocketId);
    if (!player) return { error: 'Joueur introuvable.' };

    player.rematchRequested = true;

    // If both players requested rematch, auto-restart
    const bothReady = room.players.length === 2 && room.players.every(p => p.rematchRequested);
    if (bothReady) {
      return this.startGame(code, room.players[0].socketId, { boardSize: room.boardSize });
    }

    return { room, waitingForOther: true, requestedBy: player.nickname };
  }

  removePlayer(socketId) {
    for (const [code, room] of this.rooms.entries()) {
      const pIdx = room.players.findIndex(p => p.socketId === socketId);
      if (pIdx >= 0) {
        const leavingPlayer = room.players[pIdx];
        room.players.splice(pIdx, 1);

        if (room.players.length === 0) {
          // Room empty, delete
          this.rooms.delete(code);
          return { code, roomDestroyed: true };
        } else {
          // Make remaining player host
          room.players[0].isHost = true;
          if (room.status === 'playing') {
            room.status = 'game_over';
            room.winner = {
              socketId: room.players[0].socketId,
              nickname: room.players[0].nickname,
              avatar: room.players[0].avatar
            };
            room.winReason = `${leavingPlayer.nickname} a quitté la partie. Victoire par forfait ! 🚪`;
          } else {
            room.status = 'waiting';
          }
          return { code, room, remainingPlayer: room.players[0], leavingPlayer };
        }
      }
    }
    return null;
  }

  // Security: Never leak opponent secret until game is over!
  getSanitizedState(room, forSocketId) {
    if (!room) return null;

    const me = room.players.find(p => p.socketId === forSocketId);
    const opponent = room.players.find(p => p.socketId !== forSocketId);

    const isGameOver = room.status === 'game_over';

    return {
      code: room.code,
      status: room.status,
      boardSize: room.boardSize,
      board: room.board,
      turnNumber: room.turnNumber,
      currentTurnPlayerId: room.currentTurnPlayerId,
      turnState: room.turnState,
      pendingQuestion: room.pendingQuestion,
      history: room.history,
      winner: room.winner,
      winReason: room.winReason,
      // Personal player view
      me: me ? {
        id: me.id,
        socketId: me.socketId,
        nickname: me.nickname,
        avatar: me.avatar,
        isHost: me.isHost,
        secret: me.secret, // My secret is visible to me!
        eliminatedCards: me.eliminatedCards,
        rematchRequested: me.rematchRequested
      } : null,
      // Opponent public view (secret strictly hidden unless game is over)
      opponent: opponent ? {
        id: opponent.id,
        socketId: opponent.socketId,
        nickname: opponent.nickname,
        avatar: opponent.avatar,
        isHost: opponent.isHost,
        eliminatedCount: opponent.eliminatedCards.length,
        rematchRequested: opponent.rematchRequested,
        secret: isGameOver ? opponent.secret : null // Hidden during gameplay!
      } : null
    };
  }

  cleanupInactiveRooms() {
    const now = Date.now();
    const TIMEOUT = 45 * 60 * 1000; // 45 min
    for (const [code, room] of this.rooms.entries()) {
      if (now - room.lastActivity > TIMEOUT) {
        console.log(`Cleaning up inactive room: ${code}`);
        this.rooms.delete(code);
      }
    }
  }
}

export const gameManager = new GameManager();
