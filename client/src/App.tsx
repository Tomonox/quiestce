import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { RoomState, QuestionHistoryItem } from './types/game';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { Lobby } from './components/Lobby';
import { GameBoard } from './components/GameBoard';
import { GameOverModal } from './components/GameOverModal';
import { RulesModal } from './components/RulesModal';
import { EncyclopediaModal } from './components/EncyclopediaModal';
import { audio } from './utils/audio';

export const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User Profile
  const [nickname, setNickname] = useState<string>(() => {
    return localStorage.getItem('brainrot_nickname') || 'Rizzler_' + Math.floor(Math.random() * 900 + 100);
  });
  const [avatar, setAvatar] = useState<string>(() => {
    return localStorage.getItem('brainrot_avatar') || '👑';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => audio.enabled);

  // Modals
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showEncyclopedia, setShowEncyclopedia] = useState<boolean>(false);
  const [gameOverData, setGameOverData] = useState<{
    isOpen: boolean;
    isWinner: boolean;
    winnerNickname: string;
    winReason: string | null;
  }>({
    isOpen: false,
    isWinner: false,
    winnerNickname: '',
    winReason: null
  });

  // URL query parameter ?room=...
  const [initialRoomCode, setInitialRoomCode] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setInitialRoomCode(roomParam.toUpperCase().trim());
    }
  }, []);

  // Save profile changes
  const handleUpdateNickname = (newNick: string) => {
    setNickname(newNick);
    localStorage.setItem('brainrot_nickname', newNick);
  };

  const handleUpdateAvatar = (newAv: string) => {
    setAvatar(newAv);
    localStorage.setItem('brainrot_avatar', newAv);
  };

  const handleToggleSound = () => {
    const next = audio.toggle();
    setSoundEnabled(next);
  };

  // Socket Connection
  useEffect(() => {
    // Connect to same origin (Vite proxy in dev, Express in prod)
    const newSocket = io({
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to Brainrot Qui Est-ce server, ID:', newSocket.id);
    });

    newSocket.on('online_count', ({ count }) => {
      setOnlineCount(count || 1);
    });

    newSocket.on('room_updated', (updatedRoom: RoomState) => {
      setRoom(updatedRoom);

      // Check if game over was reached
      if (updatedRoom.status === 'game_over' && updatedRoom.winner) {
        const isWinner = updatedRoom.winner.socketId === newSocket.id;
        setGameOverData({
          isOpen: true,
          isWinner,
          winnerNickname: updatedRoom.winner.nickname,
          winReason: updatedRoom.winReason
        });
      }
    });

    newSocket.on('game_started', () => {
      audio.playTurnAlert();
      setGameOverData(prev => ({ ...prev, isOpen: false }));
    });

    newSocket.on('question_received', () => {
      audio.playTurnAlert();
    });

    newSocket.on('question_resolved', (historyItem: QuestionHistoryItem) => {
      audio.playAnswer(historyItem.answer === 'OUI');
    });

    newSocket.on('game_over_result', (data) => {
      const isWinner = data.winner?.socketId === newSocket.id;
      setGameOverData({
        isOpen: true,
        isWinner,
        winnerNickname: data.winner?.nickname || 'Gagnant',
        winReason: data.winReason
      });
    });

    newSocket.on('player_left', (data) => {
      setErrorMessage(`${data.player?.nickname || 'L\'adversaire'} a quitté la partie.`);
      setTimeout(() => setErrorMessage(null), 5000);
    });

    newSocket.on('rematch_started', () => {
      setGameOverData(prev => ({ ...prev, isOpen: false }));
      audio.playTurnAlert();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Actions
  const handleCreateRoom = (boardSize: number) => {
    if (!socket) return;
    socket.emit('create_room', { nickname, avatar, boardSize }, (res: any) => {
      if (res?.success) {
        setRoom(res.room);
      } else {
        setErrorMessage(res?.error || 'Erreur lors de la création du salon');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    });
  };

  const handleJoinRoom = (code: string) => {
    if (!socket) return;
    socket.emit('join_room', { code, nickname, avatar }, (res: any) => {
      if (res?.success) {
        setRoom(res.room);
      } else {
        setErrorMessage(res?.error || 'Impossible de rejoindre ce salon');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    });
  };

  const handleStartGame = () => {
    if (!socket || !room) return;
    socket.emit('start_game', { code: room.code, boardSize: room.boardSize }, (res: any) => {
      if (!res?.success) {
        setErrorMessage(res?.error || 'Erreur au démarrage');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    });
  };

  const handleAskQuestion = (category: string, questionText: string) => {
    if (!socket || !room) return;
    socket.emit('ask_question', { code: room.code, category, questionText });
  };

  const handleAnswerQuestion = (answer: 'OUI' | 'NON') => {
    if (!socket || !room) return;
    socket.emit('answer_question', { code: room.code, answer });
  };

  const handleMakeGuess = (guessedBrainrotId: string) => {
    if (!socket || !room) return;
    socket.emit('make_guess', { code: room.code, guessedBrainrotId });
  };

  const handleToggleEliminate = (cardId: string) => {
    if (!socket || !room) return;
    socket.emit('toggle_card', { code: room.code, cardId }, (res: any) => {
      if (res?.success && room.me) {
        setRoom(prev => {
          if (!prev || !prev.me) return prev;
          return {
            ...prev,
            me: {
              ...prev.me,
              eliminatedCards: res.eliminatedCards
            }
          };
        });
      }
    });
  };

  const handleResetEliminations = () => {
    if (!socket || !room || !room.me) return;
    // Un-eliminate all
    const current = [...(room.me.eliminatedCards || [])];
    current.forEach(cId => {
      socket.emit('toggle_card', { code: room.code, cardId: cId });
    });
    setRoom(prev => {
      if (!prev || !prev.me) return prev;
      return {
        ...prev,
        me: {
          ...prev.me,
          eliminatedCards: []
        }
      };
    });
  };

  const handleRequestRematch = () => {
    if (!socket || !room) return;
    socket.emit('request_rematch', { code: room.code });
  };

  const handleLeaveRoom = () => {
    if (!socket || !room) return;
    socket.emit('leave_room', { code: room.code });
    setRoom(null);
    setGameOverData(prev => ({ ...prev, isOpen: false }));
  };

  // Determine current view
  let currentView: 'home' | 'lobby' | 'game' = 'home';
  if (room) {
    if (room.status === 'playing' || room.status === 'game_over') {
      currentView = 'game';
    } else {
      currentView = 'lobby';
    }
  }

  return (
    <div className={currentView === 'game' ? 'h-screen max-h-screen overflow-hidden flex flex-col bg-[#0b0f19]' : 'min-h-screen flex flex-col justify-between'}>
      {/* Toast Notification Banner */}
      {errorMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white text-xs sm:text-sm font-semibold px-5 py-2 rounded-xl shadow-xl border border-red-400 animate-in fade-in slide-in-from-top duration-200">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Navbar */}
      <Navbar
        onlineCount={onlineCount}
        inGameOrLobby={currentView !== 'home'}
        compact={currentView === 'game'}
        roomCode={room?.code}
        onOpenRules={() => setShowRules(true)}
        onOpenEncyclopedia={() => setShowEncyclopedia(true)}
        onLeaveRoom={currentView !== 'home' ? handleLeaveRoom : undefined}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        playerNickname={nickname}
        playerAvatar={avatar}
      />

      {/* Main View */}
      <main className={currentView === 'game' ? 'flex-1 min-h-0 overflow-hidden flex flex-col' : 'flex-1 pb-10'}>
        {currentView === 'home' && (
          <Home
            nickname={nickname}
            avatar={avatar}
            onUpdateNickname={handleUpdateNickname}
            onUpdateAvatar={handleUpdateAvatar}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onOpenRules={() => setShowRules(true)}
            onOpenEncyclopedia={() => setShowEncyclopedia(true)}
            initialRoomCode={initialRoomCode}
          />
        )}

        {currentView === 'lobby' && room && (
          <Lobby
            room={room}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {currentView === 'game' && room && (
          <GameBoard
            room={room}
            onAskQuestion={handleAskQuestion}
            onAnswerQuestion={handleAnswerQuestion}
            onMakeGuess={handleMakeGuess}
            onToggleEliminate={handleToggleEliminate}
            onResetEliminations={handleResetEliminations}
          />
        )}
      </main>

      {/* Footer (Hidden during game so all 24 cards fit with 0 vertical scroll on stream) */}
      {currentView !== 'game' && (
        <footer className="border-t border-slate-800/80 py-4 text-xs text-slate-400 bg-[#0d131f]/90">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              BRAINROT QUI EST-CE ? • Inspiré du jeu MB Jeux / Hasbro & Steal a Brainrot Roblox
            </span>
            <span className="text-[11px] text-slate-400">
              24 Brainrots dynamiques par partie • Déployable sur Render.com
            </span>
          </div>
        </footer>
      )}

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={gameOverData.isOpen}
        isWinner={gameOverData.isWinner}
        winnerNickname={gameOverData.winnerNickname}
        winReason={gameOverData.winReason}
        mySecret={room?.me?.secret || null}
        opponentSecret={room?.opponent?.secret || null}
        opponent={room?.opponent || null}
        onRematch={handleRequestRematch}
        onLeave={handleLeaveRoom}
        rematchRequested={room?.me?.rematchRequested || false}
        opponentRematchRequested={room?.opponent?.rematchRequested || false}
      />

      {/* Rules Modal */}
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />

      {/* Encyclopedia Modal */}
      <EncyclopediaModal
        isOpen={showEncyclopedia}
        onClose={() => setShowEncyclopedia(false)}
      />
    </div>
  );
};
