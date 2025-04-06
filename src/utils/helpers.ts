export function showModal(message: string): void {
    const modal = document.getElementById('winner-modal');
    const messageEl = document.getElementById('winner-message');
    
    if (modal && messageEl) {
        messageEl.textContent = message;
        modal.classList.add('active');
        
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
}

export function generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export function generateRandomName(): string {
    const brands = ['Tesla', 'Ford', 'BMW', 'Audi', 'Mercedes', 'Toyota', 'Honda'];
    const models = ['Model S', 'Mustang', 'X5', 'A4', 'C-Class', 'Camry', 'Civic'];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    return `${brand} ${model}`;
}