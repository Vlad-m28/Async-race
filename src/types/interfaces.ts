// Car interfaces
export interface ICar {
  id: number;
  name: string;
  color: string;
}

export interface ICarCreate {
  name: string;
  color: string;
}

export interface ICarUpdate extends ICarCreate {
  id: number;
}

// Engine interfaces
export interface IEngineStartResponse {
  velocity: number;
  distance: number;
}

export interface IEngineDriveResponse {
  success: boolean;
}

// Winner interfaces
export interface IWinner {
  id: number;
  wins: number;
  time: number;
}

export interface IWinnerCreate {
  id: number;
  wins: number;
  time: number;
}

export interface IWinnerUpdate {
  wins: number;
  time: number;
}

export interface IWinnerWithCar extends IWinner {
  car: ICar;
}

// API Response interfaces
export interface IWinnersResponse {
  winners: IWinner[];
  total: number;
}

export interface IGetWinnersResponse {
  winners: IWinnerWithCar[];
  total: number;
}

// Pagination interfaces
export interface IPaginationParams {
  page: number;
  limit: number;
}

export interface IWinnersParams extends IPaginationParams {
  sort: "id" | "wins" | "time";
  order: "ASC" | "DESC";
}

// Component props interfaces
export interface ICarComponentProps {
  car: ICar;
  onDelete: (id: number) => void;
  onSelect: (id: number) => void;
  onStart: (id: number) => Promise<number>; // Измененный тип
  onStop: (id: number) => Promise<void>;
}

export interface IGarageControlsProps {
  onCreate: (name: string, color: string) => Promise<void>;
  onUpdate: (id: number, name: string, color: string) => Promise<void>;
  onGenerate: () => Promise<void>;
  onRace: () => Promise<void>;
  onReset: () => Promise<void>;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export interface IWinnersTableProps {
  winners: IWinnerWithCar[];
  sortBy: "id" | "wins" | "time";
  sortOrder: "ASC" | "DESC";
  onSort: (sortBy: "id" | "wins" | "time") => void;
}

// App state interfaces
export interface IAppState {
  garagePage: number;
  winnersPage: number;
  winnersSort: "id" | "wins" | "time";
  winnersOrder: "ASC" | "DESC";
  selectedCar: ICar | null;
  isRaceStarted: boolean;
}
