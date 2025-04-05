import { ICar } from './car.model';

export type SortField = 'id' | 'wins' | 'time';
export type SortOrder = 'ASC' | 'DESC';

export interface IWinner {
    id: number;
    wins: number;
    time: number;
}

export interface IWinnerFull extends IWinner {
    car: ICar;
}

export interface IWinnersResponse {
    winners: IWinnerFull[];
    count: number;
}