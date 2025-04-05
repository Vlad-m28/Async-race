import GarageController from '@controllers/garage.controller';
import WinnersController from '@controllers/winners.controller';

export default class AppController {
    private static instance: AppController;
    private garageController = GarageController.getInstance();
    private winnersController = WinnersController.getInstance();

    private constructor() {}

    public static getInstance(): AppController {
        if (!AppController.instance) {
            AppController.instance = new AppController();
        }
        return AppController.instance;
    }

    public async handleRaceFinish(winnerData: { carId: number; time: number }) {
        await this.winnersController.addWinner({
            id: winnerData.carId,
            time: winnerData.time
        });
    }

    public getGarageController() {
        return this.garageController;
    }

    public getWinnersController() {
        return this.winnersController;
    }

    public async initialize() {
        await Promise.all([
            this.garageController.getCars(1),
            this.winnersController.getWinners(1)
        ]);
    }
}