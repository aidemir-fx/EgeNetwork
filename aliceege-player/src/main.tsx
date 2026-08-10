import '@vidstack/react/player/styles/base.css';
import '@vidstack/react/player/styles/default/theme.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

const root = document.getElementById('root');

if (!root) {
	throw new Error('Root element is missing');
}

createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
