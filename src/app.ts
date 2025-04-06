import { Garage } from './components/garage/garage';
import { Winners } from './components/winners/winners';
import './styles/styles.css';

export class App {
  private garage = new Garage();
  private winners = new Winners();
  private currentView: 'garage' | 'winners' = 'garage';

  async init(): Promise<void> {
    this.render();
    this.setupEventListeners();
  }

  private async render(): Promise<void> {
    const root = document.getElementById('root');
    if (!root) return;

    const garageView = await this.garage.render();
    const winnersView = await this.winners.render();
    
    root.innerHTML = `
      <header>
        <nav>
          <button class="garage-btn ${this.currentView === 'garage' ? 'active' : ''}">Garage</button>
          <button class="winners-btn ${this.currentView === 'winners' ? 'active' : ''}">Winners</button>
        </nav>
      </header>
      <main>
        <div id="garage-view" style="display: ${this.currentView === 'garage' ? 'block' : 'none'}">
          ${garageView}
        </div>
        <div id="winners-view" style="display: ${this.currentView === 'winners' ? 'block' : 'none'}">
          ${winnersView}
        </div>
      </main>
    `;
  }

  private setupEventListeners(): void {
    document.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;

      if (target.classList.contains('garage-btn')) {
        this.currentView = 'garage';
        await this.render();
      } else if (target.classList.contains('winners-btn')) {
        this.currentView = 'winners';
        await this.render();
      }
    });
  }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});