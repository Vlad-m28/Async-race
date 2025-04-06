// import './garage.css';
import { Api } from '../../api/api';
import { Car } from '../../api/types';
import { CarComponent } from '../car/car';
import { generateRandomCars } from '../../utils/helpers';

export class Garage {
    private currentPage = 1;
    private readonly limit = 7;
    private totalCount = 0;
    private cars: Car[] = [];
    private carComponents: CarComponent[] = [];
    private selectedCarId: number | null = null;
    private raceInProgress = false;
    private element: HTMLElement;

    constructor() {
        this.element = this.createGarageElement();
        this.loadCars();
    }

    private createGarageElement(): HTMLElement {
        const garage = document.createElement('div');
        garage.className = 'garage';

        const controls = document.createElement('div');
        controls.className = 'garage-controls';

        const raceBtn = document.createElement('button');
        raceBtn.textContent = 'Race';
        raceBtn.addEventListener('click', () => this.startRace());

        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset';
        resetBtn.addEventListener('click', () => this.resetRace());

        const generateBtn = document.createElement('button');
        generateBtn.textContent = 'Generate Cars';
        generateBtn.addEventListener('click', () => this.generateRandomCars());

        controls.append(raceBtn, resetBtn, generateBtn);

        const createForm = document.createElement('form');
        createForm.className = 'car-form';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Car name';
        nameInput.required = true;

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = '#000000';

        const createBtn = document.createElement('button');
        createBtn.type = 'submit';
        createBtn.textContent = 'Create';

        createForm.append(nameInput, colorInput, createBtn);
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createCar(nameInput.value, colorInput.value);
            nameInput.value = '';
        });

        const updateForm = document.createElement('form');
        updateForm.className = 'car-form';

        const updateNameInput = document.createElement('input');
        updateNameInput.type = 'text';
        updateNameInput.placeholder = 'Car name';
        updateNameInput.required = true;
        updateNameInput.disabled = true;

        const updateColorInput = document.createElement('input');
        updateColorInput.type = 'color';
        updateColorInput.value = '#000000';
        updateColorInput.disabled = true;

        const updateBtn = document.createElement('button');
        updateBtn.type = 'submit';
        updateBtn.textContent = 'Update';
        updateBtn.disabled = true;

        updateForm.append(updateNameInput, updateColorInput, updateBtn);
        updateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.selectedCarId) {
                this.updateCar(this.selectedCarId, updateNameInput.value, updateColorInput.value);
                updateNameInput.value = '';
                updateNameInput.disabled = true;
                updateColorInput.disabled = true;
                updateBtn.disabled = true;
                this.selectedCarId = null;
            }
        });

        controls.append(createForm, updateForm);

        const pagination = document.createElement('div');
        pagination.className = 'pagination';

        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Prev';
        prevBtn.addEventListener('click', () => this.prevPage());

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => this.nextPage());

        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';

        pagination.append(prevBtn, pageInfo, nextBtn);

        const garageHeader = document.createElement('h2');
        garageHeader.className = 'garage-header';

        const carsContainer = document.createElement('div');
        carsContainer.className = 'cars-container';

        garage.append(controls, pagination, garageHeader, carsContainer);

        return garage;
    }

    private async loadCars(): Promise<void> {
        const { cars, count } = await Api.getCars(this.currentPage, this.limit);
        this.cars = cars;
        this.totalCount = count;
        this.render();
    }

    private render(): void {
        const carsContainer = this.element.querySelector('.cars-container') as HTMLElement;
        carsContainer.innerHTML = '';

        this.carComponents = this.cars.map((car) => {
            const carComponent = new CarComponent(
                car,
                (id) => this.selectCar(id),
                (id) => this.removeCar(id)
            );
            carsContainer.appendChild(carComponent.render());
            return carComponent;
        });

        const pageInfo = this.element.querySelector('.page-info') as HTMLElement;
        pageInfo.textContent = `Page ${this.currentPage}`;

        const garageHeader = this.element.querySelector('.garage-header') as HTMLElement;
        garageHeader.textContent = `Garage (${this.totalCount} cars)`;

        const prevBtn = this.element.querySelector('.pagination button:first-child') as HTMLButtonElement;
        prevBtn.disabled = this.currentPage <= 1;

        const nextBtn = this.element.querySelector('.pagination button:last-child') as HTMLButtonElement;
        nextBtn.disabled = this.currentPage * this.limit >= this.totalCount;
    }

    private async createCar(name: string, color: string): Promise<void> {
        await Api.createCar({ name, color });
        this.loadCars();
    }

    private selectCar(id: number): void {
        this.selectedCarId = id;
        const updateForm = this.element.querySelector('.car-form:last-child') as HTMLFormElement;
        const nameInput = updateForm.querySelector('input[type="text"]') as HTMLInputElement;
        const colorInput = updateForm.querySelector('input[type="color"]') as HTMLInputElement;
        const submitBtn = updateForm.querySelector('button') as HTMLButtonElement;

        const car = this.cars.find((c) => c.id === id);
        if (car) {
            nameInput.value = car.name;
            colorInput.value = car.color;
            nameInput.disabled = false;
            colorInput.disabled = false;
            submitBtn.disabled = false;
        }
    }

    private async updateCar(id: number, name: string, color: string): Promise<void> {
        await Api.updateCar(id, { name, color });
        this.loadCars();
    }

    private async removeCar(id: number): Promise<void> {
        await Api.deleteCar(id);
        await Api.deleteWinner(id).catch(() => {});
        this.loadCars();
    }

    private async generateRandomCars(): Promise<void> {
        const cars = generateRandomCars(100);
        await Promise.all(cars.map((car) => Api.createCar(car)));
        this.loadCars();
    }

    private async startRace(): Promise<void> {
        if (this.raceInProgress) return;
        this.raceInProgress = true;

        const raceBtn = this.element.querySelector('.garage-controls button:first-child') as HTMLButtonElement;
        raceBtn.disabled = true;

        const resetBtn = this.element.querySelector('.garage-controls button:nth-child(2)') as HTMLButtonElement;
        resetBtn.disabled = false;

        try {
            const winner = await Promise.any(
                this.carComponents.map(async (carComponent) => {
                    const time = await carComponent.start();
                    return { id: carComponent['car'].id, time };
                })
            );

            await this.handleWinner(winner.id, winner.time);
        } catch {
            console.log('All cars failed');
        } finally {
            this.raceInProgress = false;
        }
    }

    private async resetRace(): Promise<void> {
        await Promise.all(this.carComponents.map((car) => car.stop()));

        const raceBtn = this.element.querySelector('.garage-controls button:first-child') as HTMLButtonElement;
        raceBtn.disabled = false;

        const resetBtn = this.element.querySelector('.garage-controls button:nth-child(2)') as HTMLButtonElement;
        resetBtn.disabled = true;
    }

    private async handleWinner(carId: number, time: number): Promise<void> {
        try {
            const car = await Api.getCar(carId);
            const winnerInfo = document.createElement('div');
            winnerInfo.className = 'winner-info';
            winnerInfo.textContent = `${car.name} won in ${(time / 1000).toFixed(2)}s!`;
            document.body.appendChild(winnerInfo);

            setTimeout(() => {
                winnerInfo.remove();
            }, 3000);

            try {
                const existingWinner = await Api.getWinner(carId);
                await Api.updateWinner(carId, {
                    wins: existingWinner.wins + 1,
                    time: Math.min(existingWinner.time, time),
                });
            } catch {
                await Api.createWinner({
                    id: carId,
                    wins: 1,
                    time,
                });
            }
        } catch (error) {
            console.error('Error handling winner:', error);
        }
    }

    private prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadCars();
        }
    }

    private nextPage(): void {
        if (this.currentPage * this.limit < this.totalCount) {
            this.currentPage++;
            this.loadCars();
        }
    }

    public renderGarage(): HTMLElement {
        return this.element;
    }
}