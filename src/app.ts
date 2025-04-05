import { AppController } from './controllers/app.controller';
import { GaragePage } from './pages/garage.page';
import { WinnersPage } from './pages/winners.page';

export class App {
    private garagePage: GaragePage;
    private winnersPage: WinnersPage;
    private appController = new AppController();

    constructor() {
        this.initialize();
    }

    private async initialize() {
        await this.appController.initialize();
        this.garagePage = new GaragePage(this.appController.getGarageController());
        this.winnersPage = new WinnersPage(this.appController.getWinnersController());
        this.setupNavigation();
    }

    private setupNavigation() {
        const garageBtn = document.getElementById('garage-btn');
        const winnersBtn = document.getElementById('winners-btn');

        garageBtn?.addEventListener('click', () => this.toggleViews(true));
        winnersBtn?.addEventListener('click', () => this.toggleViews(false));
    }

    private toggleViews(showGarage: boolean) {
        const garageView = document.getElementById('garage-container');
        const winnersView = document.getElementById('winners-container');
        
        if (showGarage) {
            garageView?.classList.remove('hidden');
            winnersView?.classList.add('hidden');
        } else {
            garageView?.classList.add('hidden');
            winnersView?.classList.remove('hidden');
        }
    }
}

new App();