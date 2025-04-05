import { Component } from '../templates/component';
import { IWinnerFull } from '../models/winner.model';

export class WinnerComponent extends Component<HTMLElement, HTMLElement> {
    constructor(
        hostId: string, 
        private winnerData: IWinnerFull,
        private position: number
    ) {
        super('winner-template', hostId, false, `winner-${winnerData.id}`);
        this.render();
    }

    public render() {
        const positionCell  = this.element.querySelector('.winner-position') as HTMLElement;
        const carCell  = this.element.querySelector('.winner-car') as HTMLElement;
        const nameCell  = this.element.querySelector('.winner-name') as HTMLElement;
        const winsCell  = this.element.querySelector('.winner-wins') as HTMLElement;
        const timeCell  = this.element.querySelector('.winner-time') as HTMLElement;
        
        positionCell.textContent = this.position.toString();
        carCell.style.backgroundColor = this.winnerData.car.color;
        nameCell.textContent = this.winnerData.car.name;
        winsCell.textContent = this.winnerData.wins.toString();
        timeCell.textContent = this.winnerData.time.toFixed(2);
    }
}