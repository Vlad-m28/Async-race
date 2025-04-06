import { App } from './app';
import './styles/styles.css';

// Инициализация приложения
function initializeApp() {
    const root = document.getElementById('root');
    if (!root) {
      console.error('Root element not found!');
      return;
    }
  
    const app = new App();
    app.init();
  }
  
  // Запуск после полной загрузки DOM
  if (document.readyState === 'complete') {
    initializeApp();
  } else {
    document.addEventListener('DOMContentLoaded', initializeApp);
  }