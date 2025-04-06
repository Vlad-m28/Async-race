import { Garage } from './components/garage/garage';
import { Winners } from './components/winners/winners';
import './styles/styles.css';

export class App {
  private garage: Garage;
  private winners: Winners;
  private currentView: 'garage' | 'winners' = 'garage';

  constructor() {
    this.garage = new Garage();
    this.winners = new Winners();
    this.initApp();
  }

  private initApp(): void {
    this.renderApp();
    this.setupEventListeners();
    this.switchView('garage');
  }

  private renderApp(): void {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <header class="header">
        <h1 class="logo">Async Race</h1>
        <nav class="nav">
          <button class="nav-btn" data-view="garage">Garage</button>
          <button class="nav-btn" data-view="winners">Winners</button>
        </nav>
      </header>
      <main id="view-container"></main>
      <div class="modal" id="winner-modal">
        <div class="modal-content">
          <button class="modal-close">&times;</button>
          <h2 class="modal-title">Congratulations!</h2>
          <p id="winner-message"></p>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // Обработка переключения вкладок
      if (target.classList.contains('nav-btn')) {
        const view = target.getAttribute('data-view') as 'garage' | 'winners';
        this.switchView(view);
      }

      // Закрытие модального окна
      if (target.classList.contains('modal-close')) {
        this.closeModal();
      }
    });
  }

  private async switchView(view: 'garage' | 'winners'): Promise<void> {
    if (this.currentView === view) return;
    
    this.currentView = view;
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) return;

    // Обновляем активную кнопку
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === view);
    });

    // Загружаем соответствующее представление
    if (view === 'garage') {
      viewContainer.innerHTML = '<div id="garage-view"></div>';
      await this.garage.render();
    } else {
      viewContainer.innerHTML = '<div id="winners-view"></div>';
      await this.winners.render();
    }
  }

  private closeModal(): void {
    const modal = document.getElementById('winner-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }
}