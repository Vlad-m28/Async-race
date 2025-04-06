import './winners.css';
import { Api } from '../../api/api';
import { WinnerWithCar, SortBy, SortOrder } from '../../api/types';

export class Winners {
    private currentPage = 1;
    private readonly limit = 10;
    private totalCount = 0;
    private winners: WinnerWithCar[] = [];
    private sortBy: SortBy = 'id';
    private sortOrder: SortOrder = 'ASC';
    private element: HTMLElement;

    constructor() {
        this.element = this.createWinnersElement();
        this.loadWinners();
    }

    private createWinnersElement(): HTMLElement {
        const winners = document.createElement('div');
        winners.className = 'winners';

        const winnersHeader = document.createElement('h2');
        winnersHeader.className = 'winners-header';

        const table = document.createElement('table');
        table.className = 'winners-table';

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Number</th>
                <th data-sort="id">Car</th>
                <th data-sort="name">Name</th>
                <th data-sort="wins" class="sortable">Wins</th>
                <th data-sort="time" class="sortable">Best Time (s)</th>
            </tr>
        `;

        thead.querySelectorAll('[data-sort]').forEach((th) => {
            th.addEventListener('click', () => {
                const sortBy = th.getAttribute('data-sort') as SortBy;
                if (this.sortBy === sortBy) {
                    this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
                } else {
                    this.sortBy = sortBy;
                    this.sortOrder = 'ASC';
                }
                this.loadWinners();
            });
        });

        const tbody = document.createElement('tbody');

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

        table.append(thead, tbody);
        winners.append(winnersHeader, table, pagination);

        return winners;
    }

    private async loadWinners(): Promise<void> {
        const { winners, count } = await Api.getWinners(
            this.currentPage,
            this.limit,
            this.sortBy,
            this.sortOrder
        );

        this.totalCount = count;
        this.winners = await Promise.all(
            winners.map(async (winner) => {
                const car = await Api.getCar(winner.id);
                return { ...winner, car };
            })
        );

        this.render();
    }

    private render(): void {
        const tbody = this.element.querySelector('tbody') as HTMLElement;
        tbody.innerHTML = '';

        this.winners.forEach((winner, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${(this.currentPage - 1) * this.limit + index + 1}</td>
                <td>
                    <svg width="40" height="20" viewBox="0 0 100 30" fill="${winner.car.color}">
                        <rect x="10" y="10" width="80" height="10" rx="2"/>
                        <rect x="20" y="5" width="60" height="5" rx="2"/>
                        <circle cx="25" cy="25" r="5"/>
                        <circle cx="75" cy="25" r="5"/>
                    </svg>
                </td>
                <td>${winner.car.name}</td>
                <td>${winner.wins}</td>
                <td>${(winner.time / 1000).toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        });

        const winnersHeader = this.element.querySelector('.winners-header') as HTMLElement;
        winnersHeader.textContent = `Winners (${this.totalCount})`;

        const pageInfo = this.element.querySelector('.page-info') as HTMLElement;
        pageInfo.textContent = `Page ${this.currentPage}`;

        const prevBtn = this.element.querySelector('.pagination button:first-child') as HTMLButtonElement;
        prevBtn.disabled = this.currentPage <= 1;

        const nextBtn = this.element.querySelector('.pagination button:last-child') as HTMLButtonElement;
        nextBtn.disabled = this.currentPage * this.limit >= this.totalCount;

        // Update sort indicators
        this.element.querySelectorAll('.sortable').forEach((th) => {
            const sortAttr = th.getAttribute('data-sort');
            th.classList.remove('sorted-asc', 'sorted-desc');
            if (sortAttr === this.sortBy) {
                th.classList.add(this.sortOrder === 'ASC' ? 'sorted-asc' : 'sorted-desc');
            }
        });
    }

    private prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadWinners();
        }
    }

    private nextPage(): void {
        if (this.currentPage * this.limit < this.totalCount) {
            this.currentPage++;
            this.loadWinners();
        }
    }

    public renderWinners(): HTMLElement {
        return this.element;
    }
}