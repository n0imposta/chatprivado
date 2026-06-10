import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomID" element={<Room />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
