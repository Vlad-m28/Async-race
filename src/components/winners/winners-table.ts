import { IWinnerWithCar } from '../../types/interfaces';

export function renderWinnersTable(winners: IWinnerWithCar[]): string {
  return `
    <table class="winners-table">
      <thead>
        <tr>
          <th>Number</th>
          <th>Car</th>
          <th>Name</th>
          <th>Wins</th>
          <th>Best Time (s)</th>
        </tr>
      </thead>
      <tbody>
        ${winners.map((winner, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>
              <div class="car-icon" style="background-color: ${winner.car.color}"></div>
            </td>
            <td>${winner.car.name}</td>
            <td>${winner.wins}</td>
            <td>${winner.time}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}