export interface ICar {
    id: number;
    name: string;
    color: string;
}

export interface IEngine {
    velocity: number;
    distance: number;
}

export interface IEngineResponse {
    success: boolean;
    time?: number;
    error?: string;
}