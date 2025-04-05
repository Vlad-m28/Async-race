import { Component } from '../templates/component';
import { IWinnerFull, SortField, SortOrder } from '../models/winner.model';
import { ApiService } from '../../api/api.service';
import { WinnerComponent } from '../components/winner.component';

export class WinnersPage extends Component<HTMLElement, HTMLElement> {
    private currentPage = 1;
    private sortBy: SortField = 'wins';
    private sortOrder: SortOrder = 'DESC';

    constructor() {
        super('winners-template', 'app', false, 'winners-container');
        this.initialize();
    }

    protected render() {
        // Implement render logic
    }

    private async initialize() {
        await this.loadWinners();
        this.setupSortingHeaders();
    }

    private async loadWinners() {
        const { winners, count } = await ApiService.getWinners(
            this.currentPage,
            10,
            this.sortBy,
            this.sortOrder
        );

        this.renderWinners(winners, count);
    }

    private renderWinners(winners: IWinnerFull[], count: number) {
        const container = this.element.querySelector('tbody') as HTMLTableSectionElement;
        container.innerHTML = '';

        winners.forEach((winner, index) => {
            const position = (this.currentPage - 1) * 10 + index + 1;
            new WinnerComponent('winners-body', winner, position);
        });

        const countElement = this.element.querySelector('.winners-count') as HTMLSpanElement;
        countElement.textContent = `Total winners: ${count}`;
    }

    private setupSortingHeaders() {
        const winsHeader = this.element.querySelector('.sort-by-wins') as HTMLElement;
        const timeHeader = this.element.querySelector('.sort-by-time') as HTMLElement;

        winsHeader.addEventListener('click', () => this.handleSort('wins'));
        timeHeader.addEventListener('click', () => this.handleSort('time'));
    }

    private async handleSort(field: SortField) {
        if (this.sortBy === field) {
            this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
        } else {
            this.sortBy = field;
            this.sortOrder = 'ASC';
        }
        await this.loadWinners();
    }
}