import ApiService from '@api/api.service';
import { IWinner, IWinnerFull, SortField, SortOrder } from '@core/models/winner.model';

export default class WinnersController {
    private static instance: WinnersController;
    private winners: IWinnerFull[] = [];
    private currentPage = 1;
    private totalWinners = 0;
    private sortBy: SortField = 'wins';
    private sortOrder: SortOrder = 'DESC';

    private constructor() {}

    public static getInstance(): WinnersController {
        if (!WinnersController.instance) {
            WinnersController.instance = new WinnersController();
        }
        return WinnersController.instance;
    }

    public async getWinners(page: number, limit = 10) {
        const { winners, count } = await ApiService.getWinners(
            page,
            limit,
            this.sortBy,
            this.sortOrder
        );
        this.winners = winners;
        this.totalWinners = count;
        this.currentPage = page;
        return { winners, count };
    }

    public async addWinner(winnerData: Omit<IWinner, 'id'> & { id: number }) {
        try {
            const existingWinner = await ApiService.getWinner(winnerData.id);
            const updatedWinner = await ApiService.updateWinner(winnerData.id, {
                wins: existingWinner.wins + 1,
                time: Math.min(existingWinner.time, winnerData.time)
            });
            return updatedWinner;
        } catch (error) {
            const newWinner = await ApiService.createWinner({
                id: winnerData.id,
                wins: 1,
                time: winnerData.time
            });
            return newWinner;
        }
    }

    public setSortOptions(field: SortField, order: SortOrder) {
        this.sortBy = field;
        this.sortOrder = order;
    }

    public getCurrentPage() {
        return this.currentPage;
    }

    public getTotalWinners() {
        return this.totalWinners;
    }

    public getSortOptions() {
        return { sortBy: this.sortBy, sortOrder: this.sortOrder };
    }
}