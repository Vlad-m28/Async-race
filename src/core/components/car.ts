import { Component } from '../templates/component';
import { ICar } from '../models/car.model';

export class Car extends Component<HTMLElement, HTMLElement> {
    constructor(hostId: string, protected carData: ICar) {
        super('car-template', hostId, false, `car-${carData.id}`);
        this.render();
    }

    public render() {
        const nameElement  = this.element.querySelector('.car-name') as HTMLElement;
        const imageElement  = this.element.querySelector('.car-image') as HTMLElement;
        
        nameElement.textContent = this.carData.name;
        imageElement.style.backgroundColor = this.carData.color;
    }
}