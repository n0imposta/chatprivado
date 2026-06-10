import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send } from 'lucide-react';

const socketUrl = import.meta.env.PROD ? window.location.origin : 'http://localhost:5000';
const socket = io(socketUrl, {
    path: '/_/backend/socket.io'
});

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
    
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    
    const userVideo = useRef<HTMLVideoElement>(null);
    const peerVideo = useRef<HTMLVideoElement>(null);
    const peersRef = useRef<any[]>([]);
    const userStream = useRef<MediaStream | null>(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            userStream.current = stream;
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }

            socket.emit('join-room', roomID);

            socket.on('user-joined', (userId: string) => {
                const peer = createPeer(userId, socket.id as string, stream);
                peersRef.current.push({
                    peerID: userId,
                    peer,
                });
            });

            socket.on('user-joined-signal', (payload: any) => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                });
            });

            socket.on('receiving-returned-signal', (payload: any) => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                if(item) {
                    item.peer.signal(payload.signal);
                }
            });
            
            socket.on('user-disconnected', () => {
                if (peerVideo.current) {
                    peerVideo.current.srcObject = null;
                }
                // Handle peer removal from refs if needed
            });

        }).catch(err => {
             console.error("Error accessing media devices", err);
             alert("Error accessing camera/microphone. Please allow permissions.");
        });
        
        return () => {
            if (userStream.current) {
                userStream.current.getTracks().forEach(track => track.stop());
            }
            socket.disconnect();
        };
    }, [roomID]);

    function createPeer(userToSignal: string, callerID: string, stream: MediaStream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            socket.emit('sending-signal', { userToSignal, callerID, signal });
        });

        peer.on('stream', stream => {
            if (peerVideo.current) {
                peerVideo.current.srcObject = stream;
            }
        });

        peer.on('data', data => {
            const text = new TextDecoder("utf-8").decode(data);
            setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'other', text }]);
        });

        return peer;
    }

    function addPeer(incomingSignal: any, callerID: string, stream: MediaStream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            socket.emit('returning-signal', { signal, callerID });
        });

        peer.on('stream', stream => {
            if (peerVideo.current) {
                peerVideo.current.srcObject = stream;
            }
        });

        peer.on('data', data => {
            const text = new TextDecoder("utf-8").decode(data);
            setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'other', text }]);
        });

        peer.signal(incomingSignal);
        return peer;
    }

    const toggleVideo = () => {
        if (userStream.current) {
            const videoTrack = userStream.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (userStream.current) {
            const audioTrack = userStream.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setAudioEnabled(audioTrack.enabled);
            }
        }
    };
    
    const hangUp = () => {
        if (userStream.current) {
            userStream.current.getTracks().forEach(track => track.stop());
        }
        navigate('/');
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        peersRef.current.forEach(p => {
            p.peer.send(newMessage);
        });

        setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'me', text: newMessage }]);
        setNewMessage('');
    };

    return (
        <div className="room-container">
            <div className="video-section">
                <div className="videos-grid">
                    <div className="video-wrapper">
                        <video ref={userVideo} autoPlay muted playsInline />
                        <div className="video-label">Tú</div>
                    </div>
                    <div className="video-wrapper">
                        <video ref={peerVideo} autoPlay playsInline />
                        <div className="video-label">Invitado</div>
                    </div>
                </div>
                
                <div className="controls">
                    <button className="control-btn" onClick={toggleAudio}>
                        {audioEnabled ? <Mic size={24} /> : <MicOff size={24} color="#ef4444" />}
                    </button>
                    <button className="control-btn" onClick={toggleVideo}>
                        {videoEnabled ? <Video size={24} /> : <VideoOff size={24} color="#ef4444" />}
                    </button>
                    <button className="control-btn danger" onClick={hangUp}>
                        <PhoneOff size={24} />
                    </button>
                </div>
            </div>
            
            <div className="chat-section">
                <div className="chat-header">
                    Chat Seguro
                </div>
                <div className="chat-messages">
                    {messages.map(msg => (
                        <div key={msg.id} className={`message ${msg.sender}`}>
                            {msg.text}
                        </div>
                    ))}
                </div>
                <form className="chat-input" onSubmit={sendMessage}>
                    <input 
                        type="text" 
                        placeholder="Escribe un mensaje..." 
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
