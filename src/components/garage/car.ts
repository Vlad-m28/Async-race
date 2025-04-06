import { ICar } from "../../types/interfaces";

export class CarComponent {
    private animationId: number | null = null;
    private position = 0;
    private element: HTMLElement | null = null;
    private startBtn: HTMLButtonElement | null = null;
    private stopBtn: HTMLButtonElement | null = null;

    constructor(
        public car: ICar,
        private onDelete: (id: number) => void,
        private onSelect: (id: number) => void,
        private onStart: (id: number) => Promise<number>,
        private onStop: (id: number) => Promise<void>
    ) {}

    render(): HTMLElement {
        this.element = document.createElement('div');
        this.element.className = 'car-track';
        this.element.dataset.id = this.car.id.toString();
        this.element.innerHTML = `
            <div class="car-controls">
                <button class="btn select-btn">Select</button>
                <button class="btn delete-btn">Delete</button>
                <button class="btn start-btn">Start</button>
                <button class="btn stop-btn" disabled>Stop</button>
                <span class="car-name">${this.car.name}</span>
            </div>
            <div class="track">
                <div class="car" style="background-color: ${this.car.color}; left: 0">
                    <svg width="80" height="40" viewBox="0 0 80 40">
                        <path d="M10,20 L20,10 L60,10 L70,20 L60,30 L20,30 Z" fill="${this.car.color}"/>
                    </svg>
                </div>
                <div class="finish-flag"></div>
            </div>
        `;

        this.startBtn = this.element.querySelector('.start-btn');
        this.stopBtn = this.element.querySelector('.stop-btn');
        this.setupEventListeners();
        return this.element;
    }

    private setupEventListeners(): void {
        this.element?.querySelector('.select-btn')?.addEventListener('click', () => {
            this.onSelect(this.car.id);
        });

        this.element?.querySelector('.delete-btn')?.addEventListener('click', () => {
            this.onDelete(this.car.id);
        });

        this.element?.querySelector('.start-btn')?.addEventListener('click', async () => {
            if (this.startBtn) this.startBtn.disabled = true;
            if (this.stopBtn) this.stopBtn.disabled = false;
            try {
                await this.onStart(this.car.id);
            } catch (error) {
                this.setErrorState(true);
                if (this.startBtn) this.startBtn.disabled = false;
                if (this.stopBtn) this.stopBtn.disabled = true;
            }
        });

        this.element?.querySelector('.stop-btn')?.addEventListener('click', async () => {
            await this.onStop(this.car.id);
            if (this.startBtn) this.startBtn.disabled = false;
            if (this.stopBtn) this.stopBtn.disabled = true;
        });
    }

    animate(duration: number): void {
        const carElement = this.element?.querySelector('.car');
        if (!carElement) return;

        const trackWidth = (this.element?.querySelector('.track')?.clientWidth || 800) - 100;
        const startTime = performance.now();

        const animateFrame = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            this.position = progress * trackWidth;
            
            (carElement as HTMLElement).style.left = `${this.position}px`;
            
            if (progress < 1) {
                this.animationId = requestAnimationFrame(animateFrame);
            }
        };
        
        this.animationId = requestAnimationFrame(animateFrame);
    }

    stopAnimation(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resetPosition(): void {
        const carElement = this.element?.querySelector('.car');
        if (carElement) {
            (carElement as HTMLElement).style.left = '0';
            this.position = 0;
        }
    }

    setDisabled(disabled: boolean): void {
        if (this.startBtn) this.startBtn.disabled = disabled;
        if (this.stopBtn) this.stopBtn.disabled = !disabled;
    }

    setErrorState(isError: boolean): void {
        const carElement = this.element?.querySelector('.car');
        if (carElement) {
            carElement.classList.toggle('error-state', isError);
        }
    }
}