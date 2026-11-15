import { createRoot } from 'react-dom/client';
import './fonts.css';
import './index.css';
import './shell.css';
import './games/perfect-shot/index.css';
import App from './App';
import { initAds } from './ads';

void initAds();
// Pre-warm game and weapon artwork chunks during splash intro so the menu weapon paints immediately.
void import('./games/gunhit/App');
void import('./games/gunhit/game/menuGunArt');
void import('./games/gunhit/game/Game');
void import('./games/gunhit/components/EquippedGunArt');

createRoot(document.getElementById('root')!).render(<App />);
