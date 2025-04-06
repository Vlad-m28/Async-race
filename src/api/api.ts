import { 
    ICar, 
    IEngineResponse, 
    IWinner, 
    IWinnerWithCar, 
    IWinnersResponse,
    IGetWinnersParams
  } from '../types/interfaces';
  
  const BASE_URL = 'http://127.0.0.1:3000';
  
  export class Api {
    // Car API
    static async getCar(id: number): Promise<ICar> {
      const response = await fetch(`${BASE_URL}/garage/${id}`);
      return this.handleResponse<ICar>(response);
    }
  
    // Engine API
    static async startEngine(id: number): Promise<IEngineResponse> {
      const response = await fetch(`${BASE_URL}/engine?id=${id}&status=started`, {
        method: 'PATCH'
      });
      return this.handleResponse<IEngineResponse>(response);
    }
  
    static async stopEngine(id: number): Promise<void> {
      const response = await fetch(`${BASE_URL}/engine?id=${id}&status=stopped`, {
        method: 'PATCH'
      });
      await this.handleResponse<void>(response);
    }
  
    static async driveCar(id: number): Promise<boolean> {
      try {
        const response = await fetch(`${BASE_URL}/engine?id=${id}&status=drive`, {
          method: 'PATCH'
        });
        await this.handleResponse(response);
        return true;
      } catch (error) {
        return false;
      }
    }
  
    // Winners API
    static async getWinner(id: number): Promise<IWinner | null> {
      try {
        const response = await fetch(`${BASE_URL}/winners/${id}`);
        return await this.handleResponse<IWinner>(response);
      } catch (error) {
        return null;
      }
    }
  
    static async createWinner(winner: Omit<IWinner, 'wins'>): Promise<IWinner> {
      const response = await fetch(`${BASE_URL}/winners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...winner, wins: 1 })
      });
      return this.handleResponse<IWinner>(response);
    }
  
    static async updateWinner(id: number, winner: Partial<IWinner>): Promise<IWinner> {
      const response = await fetch(`${BASE_URL}/winners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(winner)
      });
      return this.handleResponse<IWinner>(response);
    }
  
    static async saveWinner(car: ICar, time: number): Promise<void> {
      const existingWinner = await this.getWinner(car.id);
      
      if (existingWinner) {
        await this.updateWinner(car.id, {
          wins: existingWinner.wins + 1,
          time: Math.min(existingWinner.time, time)
        });
      } else {
        await this.createWinner({
          id: car.id,
          time
        });
      }
    }
  
    static async getWinners(params: IGetWinnersParams): Promise<IWinnersResponse> {
      const { page, limit, sort, order } = params;
      const response = await fetch(
        `${BASE_URL}/winners?_page=${page}&_limit=${limit}&_sort=${sort}&_order=${order}`
      );
      
      const items = await this.handleResponse<IWinner[]>(response);
      const count = parseInt(response.headers.get('X-Total-Count') || '0', 10);
      
      const itemsWithCars = await Promise.all(
        items.map(async (winner) => {
          const car = await this.getCar(winner.id);
          return { ...winner, car };
        })
      );
      
      return { items: itemsWithCars, count };
    }
  
    private static async handleResponse<T>(response: Response): Promise<T> {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json() as Promise<T>;
    }
  }