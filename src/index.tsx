import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { StateProvider } from './StateContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StateProvider>
    <App />
  </StateProvider>
);
