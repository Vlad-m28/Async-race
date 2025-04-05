import { ICar, IEngineResponse } from '@core/models/car.model';
import { IWinner, IWinnerFull } from '@core/models/winner.model';

const BASE_URL = 'http://localhost:3000';

export default class ApiService {
    // Car endpoints
    static async getCars(page: number, limit = 7): Promise<{ cars: ICar[]; count: number }> {
        const response = await fetch(`${BASE_URL}/garage?_page=${page}&_limit=${limit}`);
        return {
            cars: await response.json(),
            count: Number(response.headers.get('X-Total-Count'))
        };
    }

    static async getCar(id: number): Promise<ICar> {
        const response = await fetch(`${BASE_URL}/garage/${id}`);
        return response.json();
    }

    static async createCar(car: Omit<ICar, 'id'>): Promise<ICar> {
        const response = await fetch(`${BASE_URL}/garage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(car)
        });
        return response.json();
    }

    static async updateCar(id: number, car: Omit<ICar, 'id'>): Promise<ICar> {
        const response = await fetch(`${BASE_URL}/garage/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(car)
        });
        return response.json();
    }

    static async deleteCar(id: number): Promise<void> {
        await fetch(`${BASE_URL}/garage/${id}`, {
            method: 'DELETE'
        });
    }

    // Engine endpoints
    static async startEngine(id: number): Promise<IEngineResponse> {
        const response = await fetch(`${BASE_URL}/engine?id=${id}&status=started`, {
            method: 'PATCH'
        });
        return response.json();
    }

    static async stopEngine(id: number): Promise<void> {
        await fetch(`${BASE_URL}/engine?id=${id}&status=stopped`, {
            method: 'PATCH'
        });
    }

    static async driveMode(id: number): Promise<boolean> {
        try {
            const response = await fetch(`${BASE_URL}/engine?id=${id}&status=drive`, {
                method: 'PATCH'
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    // Winners endpoints
    static async getWinners(page: number, limit = 10, sort?: string, order?: string): Promise<{ winners: IWinnerFull[]; count: number }> {
        const url = new URL(`${BASE_URL}/winners`);
        url.searchParams.append('_page', page.toString());
        url.searchParams.append('_limit', limit.toString());
        if (sort) url.searchParams.append('_sort', sort);
        if (order) url.searchParams.append('_order', order);

        const response = await fetch(url.toString());
        const winners = await response.json();
        const count = Number(response.headers.get('X-Total-Count'));

        const winnersWithCars = await Promise.all(
            winners.map(async (winner: IWinner) => {
                const car = await this.getCar(winner.id);
                return { ...winner, car };
            })
        );

        return {
            winners: winnersWithCars,
            count
        };
    }

    static async getWinner(id: number): Promise<IWinner> {
        const response = await fetch(`${BASE_URL}/winners/${id}`);
        return response.json();
    }

    static async createWinner(winner: Omit<IWinner, 'id'>): Promise<IWinner> {
        const response = await fetch(`${BASE_URL}/winners`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(winner)
        });
        return response.json();
    }

    static async updateWinner(id: number, winner: Omit<IWinner, 'id'>): Promise<IWinner> {
        const response = await fetch(`${BASE_URL}/winners/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(winner)
        });
        return response.json();
    }

    static async deleteWinner(id: number): Promise<void> {
        await fetch(`${BASE_URL}/winners/${id}`, {
            method: 'DELETE'
        });
    }
}