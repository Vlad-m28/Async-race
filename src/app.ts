// import './styles.css';
import { Garage } from './components/garage/garage';
import { Winners } from './components/winners/winners';

export class App {
    private garage: Garage;
    private winners: Winners;
    private currentView: 'garage' | 'winners' = 'garage';
    private element: HTMLElement;

    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'app';

        this.garage = new Garage();
        this.winners = new Winners();

        this.createHeader();
        this.renderView();
    }

    private createHeader(): void {
        const header = document.createElement('header');
        header.className = 'app-header';

        const garageBtn = document.createElement('button');
        garageBtn.textContent = 'Garage';
        garageBtn.addEventListener('click', () => this.switchView('garage'));

        const winnersBtn = document.createElement('button');
        winnersBtn.textContent = 'Winners';
        winnersBtn.addEventListener('click', () => this.switchView('winners'));

        header.append(garageBtn, winnersBtn);
        this.element.prepend(header);
    }

    private switchView(view: 'garage' | 'winners'): void {
        this.currentView = view;
        this.renderView();
    }

    private renderView(): void {
        const container = this.element.querySelector('.view-container') || document.createElement('div');
        container.className = 'view-container';
        container.innerHTML = '';

        if (this.currentView === 'garage') {
            container.appendChild(this.garage.renderGarage());
        } else {
            container.appendChild(this.winners.renderWinners());
        }

        if (!this.element.contains(container)) {
            this.element.appendChild(container);
        }
    }

    public start(): void {
        document.body.appendChild(this.element);
    }
}

const app = new App();
app.start();