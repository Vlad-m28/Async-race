import {
  ICar,
  ICarCreate,
  ICarUpdate,
  IEngineStartResponse,
  IEngineDriveResponse,
  IWinner,
  IWinnerCreate,
  IWinnerUpdate,
  IWinnersParams,
  IWinnersResponse,
} from "../types/interfaces";

const BASE_URL = "http://127.0.0.1:3000";

export class Api {
  // Cars methods
  static async getCars(
    page: number,
    limit: number = 7
  ): Promise<{ cars: ICar[]; total: number }> {
    const response = await fetch(
      `${BASE_URL}/garage?_page=${page}&_limit=${limit}`
    );
    const cars = await response.json();
    const total = Number(response.headers.get("X-Total-Count"));
    return { cars, total };
  }

  static async getCar(id: number): Promise<ICar> {
    const response = await fetch(`${BASE_URL}/garage/${id}`);
    return response.json();
  }

  static async createCar(car: ICarCreate): Promise<ICar> {
    const response = await fetch(`${BASE_URL}/garage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(car),
    });
    return response.json();
  }

  static async updateCar(id: number, car: ICarUpdate): Promise<ICar> {
    const response = await fetch(`${BASE_URL}/garage/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(car),
    });
    return response.json();
  }

  static async deleteCar(id: number): Promise<void> {
    await fetch(`${BASE_URL}/garage/${id}`, { method: "DELETE" });
  }

  // Engine methods
  static async startEngine(id: number): Promise<IEngineStartResponse> {
    const response = await fetch(`${BASE_URL}/engine?id=${id}&status=started`, {
      method: "PATCH",
    });
    return response.json();
  }

  static async stopEngine(id: number): Promise<IEngineStartResponse> {
    const response = await fetch(`${BASE_URL}/engine?id=${id}&status=stopped`, {
      method: "PATCH",
    });
    return response.json();
  }

  static async drive(id: number): Promise<{ success: boolean; time?: number }> {
    try {
      const response = await fetch(`${BASE_URL}/engine?id=${id}&status=drive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000), // Таймаут 5 секунд
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Drive API error:", errorData);
        return { success: false };
      }

      // Возвращаем время, если сервер его предоставляет
      const data = await response.json().catch(() => ({}));
      return {
        success: true,
        time: data.time || undefined,
      };
    } catch (error) {
      console.error("Drive failed:", error);
      return { success: false };
    }
  }

  // Winners methods
  static async getWinners(params: IWinnersParams): Promise<IWinnersResponse> {
    const { page, limit, sort, order } = params;
    const response = await fetch(
      `${BASE_URL}/winners?_page=${page}&_limit=${limit}&_sort=${sort}&_order=${order}`
    );
    const winners = await response.json();
    const total = Number(response.headers.get("X-Total-Count"));
    return { winners, total };
  }

  static async getWinner(id: number): Promise<IWinner> {
    const response = await fetch(`${BASE_URL}/winners/${id}`);
    return response.json();
  }

  static async createWinner(winner: IWinnerCreate): Promise<IWinner> {
    const response = await fetch(`${BASE_URL}/winners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(winner),
    });
    return response.json();
  }

  static async updateWinner(
    id: number,
    winner: IWinnerUpdate
  ): Promise<IWinner> {
    const response = await fetch(`${BASE_URL}/winners/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(winner),
    });
    return response.json();
  }

  static async deleteWinner(id: number): Promise<void> {
    await fetch(`${BASE_URL}/winners/${id}`, { method: "DELETE" });
  }
}
