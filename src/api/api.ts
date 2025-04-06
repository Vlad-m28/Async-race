import { Car, EngineResponse, Winner, SortBy, SortOrder } from './types';

const BASE_URL = 'http://127.0.0.1:3000';
// const BASE_URL = 'http://localhost:3000';

export class Api {
    // Car methods
    static async getCars(page: number, limit = 7): Promise<{ cars: Car[]; count: number }> {
        const response = await fetch(`${BASE_URL}/garage?_page=${page}&_limit=${limit}`);
        return {
            cars: await response.json(),
            count: Number(response.headers.get('X-Total-Count')),
        };
    }

    static async getCar(id: number): Promise<Car> {
        const response = await fetch(`${BASE_URL}/garage/${id}`);
        return response.json();
    }

    static async createCar(car: Omit<Car, 'id'>): Promise<Car> {
        const response = await fetch(`${BASE_URL}/garage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(car),
        });
        return response.json();
    }

    static async updateCar(id: number, car: Omit<Car, 'id'>): Promise<Car> {
        const response = await fetch(`${BASE_URL}/garage/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(car),
        });
        return response.json();
    }

    static async deleteCar(id: number): Promise<void> {
        await fetch(`${BASE_URL}/garage/${id}`, { method: 'DELETE' });
    }

    // Engine methods
    static async startEngine(id: number): Promise<EngineResponse> {
        const response = await fetch(`${BASE_URL}/engine?id=${id}&status=started`, { method: 'PATCH' });
        return response.json();
    }

    static async stopEngine(id: number): Promise<void> {
        await fetch(`${BASE_URL}/engine?id=${id}&status=stopped`, { method: 'PATCH' });
    }

    static async drive(id: number): Promise<{ success: boolean }> {
        try {
            const response = await fetch(`${BASE_URL}/engine?id=${id}&status=drive`, { method: 'PATCH' });
            return response.ok ? { success: true } : { success: false };
        } catch {
            return { success: false };
        }
    }

    // Winners methods
    static async getWinners(
        page: number,
        limit = 10,
        sort?: SortBy,
        order?: SortOrder
    ): Promise<{ winners: Winner[]; count: number }> {
        const url = new URL(`${BASE_URL}/winners`);
        url.searchParams.append('_page', page.toString());
        url.searchParams.append('_limit', limit.toString());
        if (sort) url.searchParams.append('_sort', sort);
        if (order) url.searchParams.append('_order', order);

        const response = await fetch(url.toString());
        return {
            winners: await response.json(),
            count: Number(response.headers.get('X-Total-Count')),
        };
    }

    static async getWinner(id: number): Promise<Winner> {
        const response = await fetch(`${BASE_URL}/winners/${id}`);
        return response.json();
    }

    static async createWinner(winner: Winner): Promise<Winner> {
        const response = await fetch(`${BASE_URL}/winners`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(winner),
        });
        return response.json();
    }

    static async updateWinner(id: number, winner: Omit<Winner, 'id'>): Promise<Winner> {
        const response = await fetch(`${BASE_URL}/winners/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(winner),
        });
        return response.json();
    }

    static async deleteWinner(id: number): Promise<void> {
        await fetch(`${BASE_URL}/winners/${id}`, { method: 'DELETE' });
    }
}