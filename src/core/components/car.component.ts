import { Component } from '../templates/component';
import { ICar, IEngine } from '../models/car.model';
import { ApiService } from '../../api/api.service';

export class CarComponent extends Component<HTMLElement, HTMLElement> {
    private isDriving = false;

    constructor(hostId: string, private carData: ICar) {
        super('car-template', hostId, false, `car-${carData.id}`);
        this.render();
    }

    protected render() {
        const nameElement  = this.element.querySelector('.car-name') as HTMLElement;
        const imageElement  = this.element.querySelector('.car-image') as HTMLElement;
        
        nameElement.textContent = this.carData.name;
        imageElement.style.backgroundColor = this.carData.color;

        this.setupEventListeners();
    }

    private setupEventListeners() {
        const startBtn = this.element.querySelector('.start-btn') as HTMLButtonElement;
        startBtn.addEventListener('click', () => this.startEngine());
    }

    private async startEngine() {
        if (this.isDriving) return;
        this.isDriving = true;

        try {
            const { velocity, distance } = await ApiService.startEngine(this.carData.id);
            await this.animateCar(distance, velocity);
        } catch (error) {
            console.error('Engine error:', error);
        } finally {
            this.isDriving = false;
        }
    }

    private async animateCar(distance: number, velocity: number) {
        const duration = distance / velocity;
        const carImage = this.element.querySelector('.car-image') as HTMLElement;
        const startTime = performance.now();

        return new Promise<void>((resolve) => {
            const animate = (currentTime: number) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                carImage.style.transform = `translateX(calc(${progress * 100}% - ${progress * 100}px))`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }
}