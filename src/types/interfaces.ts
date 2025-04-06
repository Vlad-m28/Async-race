export interface ICar {
    id: number;
    name: string;
    color: string;
  }
  
  export interface IEngineResponse {
    velocity: number;
    distance: number;
  }
  
  export interface IWinner {
    id: number;
    wins: number;
    time: number;
  }
  
  export interface IWinnerWithCar {
    id: number;
    wins: number;
    time: number;
    car: ICar;
  }
  
  export interface IWinnersResponse {
    items: IWinnerWithCar[];
    count: number;
  }
  
  export interface IRaceResult {
    success: boolean;
    id: number;
    time: number;
    name: string;
  }
  
  export interface IAnimationState {
    [key: number]: {
      id: number;
      start: number | null;
      progress: number;
      requestId: number;
    };
  }
  
  export interface IGetWinnersParams {
    page: number;
    limit: number;
    sort: 'id' | 'wins' | 'time';
    order: 'ASC' | 'DESC';
  }