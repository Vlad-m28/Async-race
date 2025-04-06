// import './car.css';
import { Car, EngineResponse } from 'api/types';
import { Api } from '../../api/api';
import { animateCar, resetCar } from '../../utils/helpers';

export class CarComponent {
    private car: Car;
    private onSelect: (id: number) => void;
    private onRemove: (id: number) => void;
    private element: HTMLElement;

    constructor(car: Car, onSelect: (id: number) => void, onRemove: (id: number) => void) {
        this.car = car;
        this.onSelect = onSelect;
        this.onRemove = onRemove;
        this.element = this.createCarElement();
    }

    private createCarElement(): HTMLElement {
        const carElement = document.createElement('div');
        carElement.className = 'car';
        carElement.dataset.id = this.car.id.toString();

        const controls = document.createElement('div');
        controls.className = 'car-controls';

        const selectBtn = document.createElement('button');
        selectBtn.textContent = 'Select';
        selectBtn.addEventListener('click', () => this.onSelect(this.car.id));

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => this.onRemove(this.car.id));

        const carName = document.createElement('span');
        carName.textContent = this.car.name;

        controls.append(selectBtn, removeBtn, carName);

        const track = document.createElement('div');
        track.className = 'car-track';

        const carSvg = document.createElement('div');
        carSvg.className = 'car-svg';
        carSvg.innerHTML = `
            <svg width="100" height="30" viewBox="0 0 100 30" fill="${this.car.color}">
                <rect x="10" y="10" width="80" height="10" rx="2"/>
                <rect x="20" y="5" width="60" height="5" rx="2"/>
                <circle cx="25" cy="25" r="5"/>
                <circle cx="75" cy="25" r="5"/>
            </svg>
        `;

        const finishFlag = document.createElement('div');
        finishFlag.className = 'finish-flag';
        finishFlag.innerHTML = '🏁';

        track.append(carSvg, finishFlag);

        carElement.append(controls, track);

        return carElement;
    }

    public async start(): Promise<number> {
        const { velocity, distance } = await Api.startEngine(this.car.id);
        const time = distance / velocity;
        await animateCar(this.element, time);
        const success = (await Api.drive(this.car.id)).success;
        if (!success) {
            resetCar(this.element);
            throw new Error('Engine failure');
        }
        return time;
    }

    public async stop(): Promise<void> {
        await Api.stopEngine(this.car.id);
        resetCar(this.element);
    }

    public render(): HTMLElement {
        return this.element;
    }

    public update(car: Car): void {
        this.car = car;
        const svg = this.element.querySelector('.car-svg svg') as SVGElement;
        svg.setAttribute('fill', car.color);
        const name = this.element.querySelector('.car-controls span') as HTMLElement;
        name.textContent = car.name;
    }
}