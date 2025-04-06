import { Api } from '../../api/api';
import { IWinnerWithCar, IGetWinnersResponse } from '../../types/interfaces';
import { WinnersTable } from './winners-table';
import { showModal } from '../../utils/helpers';

export class Winners {
  private currentPage = 1;
  private winners: IWinnerWithCar[] = [];
  private totalWinners = 0;
  private sortBy: 'id' | 'wins' | 'time' = 'id';
  private sortOrder: 'ASC' | 'DESC' = 'ASC';
  private table: WinnersTable;

  constructor() {
    this.table = new WinnersTable(
      this.sortWinners.bind(this)
    );
  }

  async render(): Promise<void> {
    await this.loadWinners();
    
    const winnersView = document.getElementById('winners');
    if (!winnersView) return;
    
    winnersView.innerHTML = `
      <h2>Winners (${this.totalWinners})</h2>
      ${this.table.render(this.winners, this.sortBy, this.sortOrder)}
      <div class="pagination">
        <button class="btn prev-btn" ${this.currentPage === 1 ? 'disabled' : ''}>Prev</button>
        <span class="page-info">Page ${this.currentPage}</span>
        <button class="btn next-btn" ${this.currentPage * 10 >= this.totalWinners ? 'disabled' : ''}>Next</button>
      </div>
    `;
    
    this.setupEventListeners();
  }

  private async loadWinners(): Promise<void> {
    const { winners: winnersData, total } = await Api.getWinners({
      page: this.currentPage,
      limit: 10,
      sort: this.sortBy,
      order: this.sortOrder
    });
    
    const winnersWithCars = await Promise.all(
      winnersData.map(async winner => {
        try {
          const car = await Api.getCar(winner.id);
          return { ...winner, car };
        } catch (e) {
          console.error(`Failed to fetch car ${winner.id}`, e);
          return { 
            ...winner, 
            car: { 
              id: winner.id, 
              name: 'Unknown', 
              color: '#000000' 
            } 
          };
        }
      })
    );
    
    this.winners = winnersWithCars;
    this.totalWinners = total;
  }

  private async sortWinners(sortBy: 'id' | 'wins' | 'time'): Promise<void> {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'ASC';
    }
    
    await this.render();
  }

  private async prevPage(): Promise<void> {
    if (this.currentPage > 1) {
      this.currentPage--;
      await this.render();
    }
  }

  private async nextPage(): Promise<void> {
    if (this.currentPage * 10 < this.totalWinners) {
      this.currentPage++;
      await this.render();
    }
  }

  private setupEventListeners(): void {
    document.querySelectorAll('[data-sort]').forEach(element => {
      element.addEventListener('click', () => {
        const sortBy = element.getAttribute('data-sort');
        if (sortBy === 'id' || sortBy === 'wins' || sortBy === 'time') {
          this.sortWinners(sortBy);
        }
      });
    });

    document.querySelector('.prev-btn')?.addEventListener('click', this.prevPage.bind(this));
    document.querySelector('.next-btn')?.addEventListener('click', this.nextPage.bind(this));
  }
}