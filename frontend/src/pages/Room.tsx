import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Send, Copy, Check, Trash2, ShieldCheck } from 'lucide-react';

// Use Render URL for production WebSockets
const socketUrl = import.meta.env.PROD ? 'https://chatprivado-6.onrender.com' : 'http://localhost:5000';
const socket = io(socketUrl);

interface ChatMessage {
    id: string;
    sender: 'me' | 'other';
    text: string;
}

export default function Room() {
    const { roomID } = useParams<{ roomID: string }>();
    const navigate = useNavigate();
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Join room on mount
        socket.emit('join-room', roomID);

        // Listen for incoming messages
        const handleReceiveMessage = (payload: { id: string, text: string }) => {
            setMessages(prev => [...prev, { id: payload.id, sender: 'other', text: payload.text }]);
        };

        socket.on('receive-message', handleReceiveMessage);

        return () => {
            socket.off('receive-message', handleReceiveMessage);
            // Optionally could leave room, but disconnect handles it
        };
    }, [roomID]);

    const sendMsg = (text: string) => {
        if (!text.trim()) return;

        // Emit to server
        socket.emit('send-message', { roomId: roomID, text });

        // Add to local state
        setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'me', text }]);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMsg(newMessage);
        setNewMessage('');
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clearChat = () => {
        setMessages([]);
    };

    return (
        <div className="room-container text-only-mode">
            <div className="chat-section full-width">
                <div className="chat-header">
                    <div className="header-title">
                        <ShieldCheck size={20} color="#10b981" />
                        <span>Chat Privado Encriptado</span>
                        <span className="room-id-badge">#{roomID}</span>
                    </div>
                    
                    <div className="header-actions">
                        <button className={`share-btn ${copied ? 'copied' : ''}`} onClick={copyLink}>
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Copiado' : 'Invitar'}
                        </button>
                        <button className="icon-btn" onClick={clearChat} title="Vaciar chat">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div className="empty-state">
                            <p>La conexión segura está establecida.</p>
                            <p>Esperando mensajes...</p>
                        </div>
                    )}
                    {messages.map(msg => (
                        <div key={msg.id} className={`message ${msg.sender}`}>
                            {msg.text}
                        </div>
                    ))}
                </div>
                
                <div className="quick-actions">
                    <button className="quick-btn" onClick={() => sendMsg("No puedo hablar")}>No puedo hablar</button>
                    <button className="quick-btn" onClick={() => sendMsg("Sí puedo hablar")}>Sí puedo hablar</button>
                    <button className="quick-btn" onClick={() => sendMsg("Escribe en 10 minutos")}>Escribe en 10 minutos</button>
                </div>

                <form className="chat-input" onSubmit={handleFormSubmit}>
                    <input 
                        type="text" 
                        placeholder="Escribe un mensaje seguro..." 
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                    />
                    <button type="submit">
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
