import AppController from '@controllers/app.controller';

export const appController = AppController.getInstance();
export const garageController = appController.getGarageController();
export const winnersController = appController.getWinnersController();