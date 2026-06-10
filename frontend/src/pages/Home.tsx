import { useNavigate } from 'react-router-dom';
import { Activity, Server, Users, Database, Globe, Hand } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();

    const createRoom = () => {
        const id = Math.random().toString(36).substring(2, 9);
        navigate(`/room/${id}`);
    };

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div className="admin-logo">
                    <Database size={24} color="#94a3b8" />
                    <span>SysAdmin Pro v2.4</span>
                </div>
                <div className="admin-user">
                    <div className="status-dot"></div>
                    <span>Online</span>
                    {/* The Secret Button disguised as a hand icon */}
                    <button className="secret-btn" onClick={createRoom} title="Manual Override">
                        <Hand size={18} />
                    </button>
                </div>
            </header>

            <main className="admin-content">
                <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Dashboard Overview</h1>
                
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-icon"><Server size={24} color="#3b82f6" /></div>
                        <div className="metric-info">
                            <h3>Server Load</h3>
                            <p>34%</p>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon"><Users size={24} color="#10b981" /></div>
                        <div className="metric-info">
                            <h3>Active Sessions</h3>
                            <p>1,248</p>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon"><Activity size={24} color="#f59e0b" /></div>
                        <div className="metric-info">
                            <h3>Network Traffic</h3>
                            <p>4.2 GB/s</p>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon"><Globe size={24} color="#8b5cf6" /></div>
                        <div className="metric-info">
                            <h3>Global Nodes</h3>
                            <p>12/12 Online</p>
                        </div>
                    </div>
                </div>

                <div className="admin-chart-mock">
                    <h3>Traffic Analytics (Last 24h)</h3>
                    <div className="chart-bars">
                        <div className="bar" style={{height: '40%'}}></div>
                        <div className="bar" style={{height: '60%'}}></div>
                        <div className="bar" style={{height: '30%'}}></div>
                        <div className="bar" style={{height: '80%'}}></div>
                        <div className="bar" style={{height: '50%'}}></div>
                        <div className="bar" style={{height: '90%'}}></div>
                        <div className="bar" style={{height: '70%'}}></div>
                    </div>
                </div>
            </main>
        </div>
    );
}
