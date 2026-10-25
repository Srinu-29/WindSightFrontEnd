import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Mount the application into the root div from index.html. Importing styles.css
// applies shared styles. StrictMode runs extra development checks, including an
// extra effect setup/cleanup cycle, so requests and timers need proper cleanup.
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
