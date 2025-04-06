import { Api } from "../../api/api";
import { CarComponent } from "./car";
import { ICar } from "../../types/interfaces";
import { showModal, generateRandomColor, generateRandomName } from "../../utils/helpers";

export class Garage {
    private currentPage = 1;
    private cars: ICar[] = [];
    private totalCars = 0;
    private raceStarted = false;
    private carsOnTrack: { [key: number]: CarComponent } = {};
    private selectedCar: ICar | null = null;
    private readonly carsPerPage = 7;

    constructor() {
        this.startRace = this.startRace.bind(this);
        this.resetRace = this.resetRace.bind(this);
        this.prevPage = this.prevPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
    }

    public async render(): Promise<void> {
        await this.loadCars();
        const garageView = document.getElementById('garage-view');
        if (!garageView) return;

        garageView.innerHTML = `
            <div class="garage-controls">
                <div class="create-update">
                    <div class="control-group">
                        <input type="text" class="input-text create-name" placeholder="Car name">
                        <input type="color" class="input-color create-color" value="#ffffff">
                        <button class="btn create-btn">Create</button>
                    </div>
                    <div class="control-group">
                        <input type="text" class="input-text update-name" placeholder="Car name" disabled>
                        <input type="color" class="input-color update-color" value="#ffffff" disabled>
                        <button class="btn update-btn" disabled>Update</button>
                    </div>
                </div>
                <div class="race-controls">
                    <button class="btn race-btn">Race</button>
                    <button class="btn reset-btn" disabled>Reset</button>
                    <button class="btn generate-btn">Generate Cars</button>
                </div>
            </div>
            <h2 class="garage-title">Garage (${this.totalCars})</h2>
            <h3 class="page-title">Page #${this.currentPage}</h3>
            <div class="race-track-container" id="race-track-container"></div>
            <div class="pagination">
                <button class="btn prev-btn" ${this.currentPage === 1 ? 'disabled' : ''}>Prev</button>
                <button class="btn next-btn" ${this.currentPage * this.carsPerPage >= this.totalCars ? 'disabled' : ''}>Next</button>
            </div>
        `;

        this.renderCars();
        this.setupEventListeners();
    }

    private async loadCars(): Promise<void> {
        try {
            const { cars, total } = await Api.getCars(this.currentPage, this.carsPerPage);
            this.cars = cars;
            this.totalCars = total;
        } catch (error) {
            console.error('Failed to load cars:', error);
        }
    }

    private renderCars(): void {
        const container = document.getElementById('race-track-container');
        if (!container) return;

        container.innerHTML = '';
        this.carsOnTrack = {};

        this.cars.forEach(car => {
            const carComponent = new CarComponent(
                car,
                (id) => this.deleteCar(id),
                (id) => this.selectCar(id),
                async (id) => {
                    try {
                        return await this.startCar(id);
                    } catch (error) {
                        console.error(`Car ${id} failed:`, error);
                        throw error;
                    }
                },
                (id) => this.stopCar(id)
            );
            container.appendChild(carComponent.render());
            this.carsOnTrack[car.id] = carComponent;
        });
    }

    private setupEventListeners(): void {
        document.querySelector('.create-btn')?.addEventListener('click', () => {
            const nameInput = document.querySelector('.create-name') as HTMLInputElement;
            const colorInput = document.querySelector('.create-color') as HTMLInputElement;
            if (nameInput.value.trim()) {
                this.createCar(nameInput.value.trim(), colorInput.value);
                nameInput.value = '';
            }
        });

        document.querySelector('.update-btn')?.addEventListener('click', () => {
            if (!this.selectedCar) return;
            const nameInput = document.querySelector('.update-name') as HTMLInputElement;
            const colorInput = document.querySelector('.update-color') as HTMLInputElement;
            if (nameInput.value.trim()) {
                this.updateCar(this.selectedCar.id, nameInput.value.trim(), colorInput.value);
            }
        });

        document.querySelector('.race-btn')?.addEventListener('click', this.startRace);
        document.querySelector('.reset-btn')?.addEventListener('click', this.resetRace);
        document.querySelector('.generate-btn')?.addEventListener('click', () => this.generateCars());
        document.querySelector('.prev-btn')?.addEventListener('click', this.prevPage);
        document.querySelector('.next-btn')?.addEventListener('click', this.nextPage);
    }

    private async startCar(id: number): Promise<number> {
        if (!this.carsOnTrack[id]) {
            throw new Error(`Car ${id} not found on track`);
        }

        const car = this.carsOnTrack[id];
        let engineResponse;
        
        try {
            engineResponse = await Api.startEngine(id);
            const time = engineResponse.distance / engineResponse.velocity;

            car.animate(time);
            car.setDisabled(true);
            car.setErrorState(false);

            const { success } = await Api.drive(id);
            if (!success) {
                throw new Error('Drive failed');
            }

            return time;
        } catch (error) {
            car.stopAnimation();
            car.resetPosition();
            car.setErrorState(true);
            car.setDisabled(false);

            if (engineResponse) {
                await Api.stopEngine(id).catch(() => {});
            }

            throw error;
        }
    }

    private async stopCar(id: number): Promise<void> {
        const car = this.carsOnTrack[id];
        if (!car) return;
        
        await Api.stopEngine(id);
        car.stopAnimation();
        car.resetPosition();
        car.setErrorState(false);
        car.setDisabled(false);
    }

    private async startRace(): Promise<void> {
        if (this.raceStarted || this.cars.length === 0) return;
        
        this.raceStarted = true;
        this.toggleRaceControls(true);

        try {
            const raceResults = await Promise.allSettled(
                this.cars.map(async car => {
                    try {
                        const time = await this.startCar(car.id);
                        return { id: car.id, time, success: true };
                    } catch {
                        return { id: car.id, time: 0, success: false };
                    }
                })
            );

            const successfulRacers = raceResults
                .filter(result => result.status === 'fulfilled' && result.value.success)
                .map(result => (result as PromiseFulfilledResult<{id: number, time: number, success: boolean}>).value);

            if (successfulRacers.length > 0) {
                const winner = successfulRacers.reduce((prev, current) => 
                    (prev.time < current.time) ? prev : current
                );
                
                const winnerCar = this.cars.find(c => c.id === winner.id);
                if (winnerCar) {
                    showModal(`${winnerCar.name} won in ${(winner.time / 1000).toFixed(2)}s!`);
                    await this.handleWinner(winner.id, winner.time);
                }
            } else {
                showModal('Race finished with no winners!');
            }
        } finally {
            this.raceStarted = false;
            this.toggleRaceControls(false);
        }
    }

    private async resetRace(): Promise<void> {
        if (!this.raceStarted) return;
        
        await Promise.all(
            this.cars.map(car => 
                this.stopCar(car.id).catch(() => {})
            )
        );
        
        this.raceStarted = false;
        this.toggleRaceControls(false);
    }

    private toggleRaceControls(raceStarted: boolean): void {
        const raceBtn = document.querySelector('.race-btn') as HTMLButtonElement;
        const resetBtn = document.querySelector('.reset-btn') as HTMLButtonElement;
        const generateBtn = document.querySelector('.generate-btn') as HTMLButtonElement;
        
        if (raceBtn) raceBtn.disabled = raceStarted;
        if (resetBtn) resetBtn.disabled = !raceStarted;
        if (generateBtn) generateBtn.disabled = raceStarted;
    }

    private async createCar(name: string, color: string): Promise<void> {
        await Api.createCar({ name, color });
        await this.render();
    }

    private async updateCar(id: number, name: string, color: string): Promise<void> {
        await Api.updateCar(id, { id, name, color });
        await this.render();
        this.selectedCar = null;
    }

    private async deleteCar(id: number): Promise<void> {
        await Api.deleteCar(id);
        try {
            await Api.deleteWinner(id);
        } catch (e) {
            console.log('No winner to delete');
        }
        await this.render();
    }

    private selectCar(id: number): void {
        this.selectedCar = this.cars.find(c => c.id === id) || null;
        if (this.selectedCar) {
            const nameInput = document.querySelector('.update-name') as HTMLInputElement;
            const colorInput = document.querySelector('.update-color') as HTMLInputElement;
            const updateBtn = document.querySelector('.update-btn') as HTMLButtonElement;

            nameInput.value = this.selectedCar.name;
            colorInput.value = this.selectedCar.color;
            nameInput.disabled = false;
            colorInput.disabled = false;
            updateBtn.disabled = false;
        }
    }

    private async generateCars(): Promise<void> {
        const promises = [];
        for (let i = 0; i < 100; i++) {
            promises.push(Api.createCar({
                name: generateRandomName(),
                color: generateRandomColor()
            }));
        }
        await Promise.all(promises);
        await this.render();
    }

    private async prevPage(): Promise<void> {
        if (this.currentPage > 1) {
            this.currentPage--;
            await this.render();
        }
    }

    private async nextPage(): Promise<void> {
        if (this.currentPage * this.carsPerPage < this.totalCars) {
            this.currentPage++;
            await this.render();
        }
    }

    private async handleWinner(id: number, time: number): Promise<void> {
        try {
            const winner = await Api.getWinner(id);
            await Api.updateWinner(id, {
                wins: winner.wins + 1,
                time: Math.min(winner.time, time)
            });
        } catch (e) {
            await Api.createWinner({
                id,
                wins: 1,
                time
            });
        }
    }
}