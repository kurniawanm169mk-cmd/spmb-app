import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './typography-cta.css';

import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Toaster position="top-center" richColors />
        <App />
    </React.StrictMode>,
);
