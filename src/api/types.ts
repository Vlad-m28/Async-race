export interface Car {
    id: number;
    name: string;
    color: string;
}

export interface EngineResponse {
    velocity: number;
    distance: number;
}

export interface Winner {
    id: number;
    wins: number;
    time: number;
}

export interface WinnerWithCar extends Winner {
    car: {
        name: string;
        color: string;
    };
}

export interface WinnersParams {
    page: number;
    limit: number;
    sort: 'id' | 'wins' | 'time';
    order: 'ASC' | 'DESC';
}