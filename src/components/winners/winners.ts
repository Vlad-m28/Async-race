import { Api } from '../../api/api';
import { IWinnerWithCar, IWinnersResponse, IGetWinnersParams } from '../../types/interfaces';
import { renderWinnersTable } from './winners-table';

export class Winners {
  private currentPage = 1;
  private sortBy: 'id' | 'wins' | 'time' = 'id';
  private sortOrder: 'ASC' | 'DESC' = 'ASC';

  async render(): Promise<string> {
    const params: IGetWinnersParams = {
      page: this.currentPage,
      limit: 10,
      sort: this.sortBy,
      order: this.sortOrder
    };
    
    const { items, count } = await Api.getWinners(params);
    
    return `
      <div class="winners">
        <h2>Winners (${count})</h2>
        <div class="winners-table-container">
          ${renderWinnersTable(items)}
        </div>
        <div class="pagination">
          <button class="prev-btn" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>
          <span>Page ${this.currentPage}</span>
          <button class="next-btn" ${this.currentPage * 10 >= count ? 'disabled' : ''}>Next</button>
        </div>
      </div>
    `;
  }

  async updateSort(sortBy: 'id' | 'wins' | 'time'): Promise<void> {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'ASC';
    }
  }
}