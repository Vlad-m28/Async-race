import { Api } from '../../api/api';
import { ICar, IRaceResult, IAnimationState } from '../../types/interfaces';

export class Garage {
  private cars: ICar[] = [];
  private animationState: IAnimationState = {};
  private raceInProgress = false;

  async startCar(car: ICar): Promise<IRaceResult> {
    try {
      const { velocity, distance } = await Api.startEngine(car.id);
      const time = Math.round(distance / velocity);
      
      this.startAnimation(car.id, time);
      
      const success = await Api.driveCar(car.id);
      if (!success) {
        this.stopCar(car.id);
        return { success: false, id: car.id, time: 0, name: car.name };
      }
      
      return { 
        success: true, 
        id: car.id, 
        time: parseFloat((time / 1000).toFixed(2)), 
        name: car.name 
      };
    } catch (error) {
      console.error(`Error starting car ${car.id}:`, error);
      return { success: false, id: car.id, time: 0, name: car.name };
    }
  }

  async stopCar(id: number): Promise<void> {
    this.stopAnimation(id);
    try {
      await Api.stopEngine(id);
    } catch (error) {
      console.error(`Error stopping car ${id}:`, error);
    }
  }

  async startRace(): Promise<void> {
    if (this.raceInProgress || this.cars.length === 0) return;
    
    this.raceInProgress = true;
    this.resetRace();
    
    try {
      const results = await Promise.all(
        this.cars.map(car => this.startCar(car))
      );
      
      const finishedCars = results.filter(result => result.success);
      if (finishedCars.length > 0) {
        const winner = finishedCars.reduce((prev, current) => 
          prev.time < current.time ? prev : current
        );
        
        await Api.saveWinner(
          { id: winner.id, name: winner.name, color: '' }, 
          winner.time
        );
        this.showWinnerMessage(winner.name, winner.time);
      }
    } catch (error) {
      console.error('Race error:', error);
    } finally {
      this.raceInProgress = false;
    }
  }

  async resetRace(): Promise<void> {
    await Promise.all(
      this.cars.map(car => this.stopCar(car.id))
    ).catch(error => console.error('Error resetting race:', error));
  }

  render(): string {
    return `
      <div class="garage">
        <h2>Garage (${this.cars.length})</h2>
        <div class="controls">
          <div class="create-car">
            <input type="text" class="new-car-name">
            <input type="color" class="new-car-color" value="#ffffff">
            <button class="create-btn">Create</button>
          </div>
          <div class="race-controls">
            <button class="race-btn">Race</button>
            <button class="reset-btn">Reset</button>
          </div>
        </div>
        <div class="cars-list">
          ${this.cars.map(car => this.renderCar(car)).join('')}
        </div>
      </div>
    `;
  }

  private renderCar(car: ICar): string {
    return `
      <div class="car" data-id="${car.id}">
        <div class="car-header">
          <button class="select-btn">Select</button>
          <button class="remove-btn">Remove</button>
          <span class="car-name">${car.name}</span>
        </div>
        <div class="car-track">
          <div class="car-icon" style="background-color: ${car.color}"></div>
          <div class="finish-flag"></div>
        </div>
      </div>
    `;
  }

  private startAnimation(id: number, duration: number): void {
    this.stopAnimation(id);
    
    const carElement = document.querySelector(`.car[data-id="${id}"] .car-icon`) as HTMLElement;
    if (!carElement) return;
    
    const start = performance.now();
    const animate = (timestamp: number) => {
      if (!this.animationState[id]) return;
      
      const progress = Math.min((timestamp - start) / duration, 1);
      const trackWidth = (carElement.parentElement?.clientWidth || 800) - 40;
      carElement.style.left = `${progress * trackWidth}px`;
      
      if (progress < 1) {
        this.animationState[id].requestId = requestAnimationFrame(animate);
      }
    };
    
    this.animationState[id] = {
      id,
      start,
      progress: 0,
      requestId: requestAnimationFrame(animate)
    };
  }

  private stopAnimation(id: number): void {
    if (this.animationState[id]) {
      cancelAnimationFrame(this.animationState[id].requestId);
      const carElement = document.querySelector(`.car[data-id="${id}"] .car-icon`) as HTMLElement;
      if (carElement) {
        carElement.style.left = '0';
      }
      delete this.animationState[id];
    }
  }

  private showWinnerMessage(name: string, time: number): void {
    const message = `${name} won in ${time}s!`;
    const winnerElement = document.createElement('div');
    winnerElement.className = 'winner-message';
    winnerElement.textContent = message;
    document.body.appendChild(winnerElement);
    setTimeout(() => winnerElement.remove(), 3000);
  }

  private setupCarEventListeners(): void {
    document.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      const carElement = target.closest('.car');
      if (!carElement) return;
  
      const id = parseInt(carElement.getAttribute('data-id') || '0');
      
      if (target.classList.contains('select-btn')) {
        // Обработка выбора машины
      } else if (target.classList.contains('remove-btn')) {
        // Обработка удаления машины
      } else if (target.classList.contains('start-btn')) {
        await this.startCar(this.cars.find(c => c.id === id)!);
      } else if (target.classList.contains('stop-btn')) {
        await this.stopCar(id);
      }
    });
  
    document.querySelector('.race-btn')?.addEventListener('click', () => this.startRace());
    document.querySelector('.reset-btn')?.addEventListener('click', () => this.resetRace());
  }
}