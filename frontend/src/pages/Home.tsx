import { useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();

    const createRoom = () => {
        const id = Math.random().toString(36).substring(2, 9);
        navigate(`/room/${id}`);
    };

    return (
        <div className="home-container">
            <div className="home-card">
                <Video size={56} color="#3b82f6" style={{ margin: '0 auto 1rem auto' }} />
                <h1>Chat Privado</h1>
                <p>Comunícate de forma segura y directa con WebRTC. Los mensajes y videollamadas no se guardan en ningún servidor.</p>
                <button className="btn-primary" onClick={createRoom}>
                    Crear Sala Segura
                </button>
            </div>
        </div>
    );
}
