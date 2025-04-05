import ApiService from '@api/api.service';
import { ICar, IEngineResponse } from '@core/models/car.model';
import { animate, formatTime, withRetry } from '@utils/helpers';

export default class GarageController {
    private static instance: GarageController;
    private cars: ICar[] = [];
    private currentPage = 1;
    private totalCars = 0;
    private raceResults: { [key: number]: IEngineResponse } = {};
    private raceAborted = false;

    private constructor() {}

    public static getInstance(): GarageController {
        if (!GarageController.instance) {
            GarageController.instance = new GarageController();
        }
        return GarageController.instance;
    }

    public async getCars(page: number, limit = 7) {
        const { cars, count } = await ApiService.getCars(page, limit);
        this.cars = cars;
        this.totalCars = count;
        this.currentPage = page;
        return { cars, count };
    }

    public async createCar(carData: Omit<ICar, 'id'>) {
        const newCar = await ApiService.createCar(carData);
        this.cars.push(newCar);
        this.totalCars++;
        return newCar;
    }

    public async startRace() {
        this.raceAborted = false;
        this.raceResults = {};

        const promises = this.cars.map(async (car) => {
            try {
                const engineResponse = await ApiService.startEngine(car.id);
                this.raceResults[car.id] = engineResponse;
                return {
                    carId: car.id,
                    ...engineResponse,
                    success: await withRetry(() => ApiService.driveMode(car.id))
                };
            } catch (error) {
                return { carId: car.id, success: false, error };
            }
        });

        return Promise.all(promises);
    }

    public async animateCarMovement(
        carId: number,
        carElement: HTMLElement,
        duration: number
    ) {
        if (this.raceAborted) return;

        await animate(carElement, duration, (progress) => {
            carElement.style.transform = `translateX(calc(${progress * 100}% - ${progress * 100}px))`;
        });

        return this.raceResults[carId];
    }

    public async resetRace() {
        this.raceAborted = true;
        await Promise.all(
            this.cars.map(car => ApiService.stopEngine(car.id))
        );
    }

    public async determineWinner() {
        const finishedCars = Object.entries(this.raceResults)
            .filter(([_, result]) => result.success)
            .map(([carId, result]) => ({
                carId: Number(carId),
                time: Number((result.distance / result.velocity / 1000).toFixed(2))
            }));

        if (finishedCars.length === 0) return null;

        const winner = finishedCars.reduce((prev, current) => 
            (prev.time < current.time) ? prev : current
        );

        return {
            ...winner,
            car: this.cars.find(c => c.id === winner.carId)!
        };
    }

    public getCurrentPage() {
        return this.currentPage;
    }

    public getTotalCars() {
        return this.totalCars;
    }
}