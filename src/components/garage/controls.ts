import { Car } from "../../api/types";

export class GarageControls {
    private selectedCar: Car | null = null;

    constructor(
        private onCreate: (name: string, color: string) => void,
        private onUpdate: (id: number, name: string, color: string) => void,
        private onGenerate: () => void,
        private onRace: () => void,
        private onReset: () => void,
        private onPrevPage: () => void,
        private onNextPage: () => void
    ) {}

    render(): string {
        return `
            <div class="control-panel">
                <div class="input-group">
                    <input type="text" class="input-text create-name" placeholder="Car name">
                    <input type="color" class="input-color create-color" value="#ffffff">
                    <button class="btn create-btn">Create</button>
                </div>
                <div class="input-group">
                    <input type="text" class="input-text update-name" placeholder="Car name" ${!this.selectedCar ? 'disabled' : ''}>
                    <input type="color" class="input-color update-color" value="#ffffff" ${!this.selectedCar ? 'disabled' : ''}>
                    <button class="btn update-btn" ${!this.selectedCar ? 'disabled' : ''}>Update</button>
                </div>
            </div>
            <div class="control-panel">
                <button class="btn race-btn">Race</button>
                <button class="btn reset-btn" disabled>Reset</button>
                <button class="btn generate-btn">Generate Cars</button>
            </div>
        `;
    }

    setSelectedCar(car: Car): void {
        this.selectedCar = car;
        
        const updateName = document.querySelector('.update-name') as HTMLInputElement;
        const updateColor = document.querySelector('.update-color') as HTMLInputElement;
        
        if (updateName && updateColor) {
            updateName.value = car.name;
            updateName.disabled = false;
            updateColor.value = car.color;
            updateColor.disabled = false;
            
            const updateBtn = document.querySelector('.update-btn') as HTMLButtonElement;
            if (updateBtn) updateBtn.disabled = false;
        }
    }

    setRaceStatus(isRacing: boolean): void {
        const raceBtn = document.querySelector('.race-btn') as HTMLButtonElement;
        const resetBtn = document.querySelector('.reset-btn') as HTMLButtonElement;
        
        if (raceBtn) raceBtn.disabled = isRacing;
        if (resetBtn) resetBtn.disabled = !isRacing;
    }

    setupEventListeners(): void {
        document.querySelector('.create-btn')?.addEventListener('click', () => {
            const nameInput = document.querySelector('.create-name') as HTMLInputElement;
            const colorInput = document.querySelector('.create-color') as HTMLInputElement;
            
            if (nameInput && colorInput && nameInput.value.trim()) {
                this.onCreate(nameInput.value.trim(), colorInput.value);
                nameInput.value = '';
            }
        });

        document.querySelector('.update-btn')?.addEventListener('click', () => {
            if (!this.selectedCar) return;
            
            const nameInput = document.querySelector('.update-name') as HTMLInputElement;
            const colorInput = document.querySelector('.update-color') as HTMLInputElement;
            
            if (nameInput && colorInput && nameInput.value.trim()) {
                this.onUpdate(this.selectedCar.id, nameInput.value.trim(), colorInput.value);
            }
        });

        document.querySelector('.generate-btn')?.addEventListener('click', () => {
            this.onGenerate();
        });

        document.querySelector('.race-btn')?.addEventListener('click', () => {
            this.onRace();
        });

        document.querySelector('.reset-btn')?.addEventListener('click', () => {
            this.onReset();
        });

        document.querySelector('.prev-btn')?.addEventListener('click', () => {
            this.onPrevPage();
        });

        document.querySelector('.next-btn')?.addEventListener('click', () => {
            this.onNextPage();
        });
    }
}