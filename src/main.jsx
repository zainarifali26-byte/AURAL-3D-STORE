import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/manrope';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './styles/base.css';
import './styles/home.css';
import './styles/store.css';
import App from './App.jsx';
import { BagProvider } from './state/bag.jsx';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <BagProvider>
        <App />
      </BagProvider>
    </BrowserRouter>
  </StrictMode>,
);
