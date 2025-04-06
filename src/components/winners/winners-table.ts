import { IWinnerWithCar } from '../../types/interfaces';

export class WinnersTable {
  constructor(
    private onSort: (sortBy: 'id' | 'wins' | 'time') => void
  ) {}

  render(winners: IWinnerWithCar[], sortBy: string, sortOrder: string): string {
    return `
      <table class="winners-table">
        <thead>
          <tr>
            <th data-sort="id">ID ${sortBy === 'id' ? this.getSortArrow(sortOrder) : ''}</th>
            <th>Car</th>
            <th>Name</th>
            <th data-sort="wins">Wins ${sortBy === 'wins' ? this.getSortArrow(sortOrder) : ''}</th>
            <th data-sort="time">Best Time (s) ${sortBy === 'time' ? this.getSortArrow(sortOrder) : ''}</th>
          </tr>
        </thead>
        <tbody>
          ${winners.map(winner => this.renderWinnerRow(winner)).join('')}
        </tbody>
      </table>
    `;
  }

  private renderWinnerRow(winner: IWinnerWithCar): string {
    return `
      <tr>
        <td>${winner.id}</td>
        <td>
          <svg width="40" height="20" viewBox="0 0 80 40" fill="${winner.car.color}">
            <path d="M10,20 L20,10 L60,10 L70,20 L60,30 L20,30 Z"/>
          </svg>
        </td>
        <td>${winner.car.name}</td>
        <td>${winner.wins}</td>
        <td>${(winner.time / 1000).toFixed(2)}</td>
      </tr>
    `;
  }

  private getSortArrow(order: string): string {
    return order === 'ASC' ? '↑' : '↓';
  }
}