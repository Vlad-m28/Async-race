import { Car } from '../api/types';

export function animateCar(element: HTMLElement, duration: number): Promise<void> {
    return new Promise((resolve) => {
        const car = element.querySelector('.car-svg') as HTMLElement;
        const trackWidth = element.querySelector('.car-track')?.clientWidth || 0;
        const carWidth = car.clientWidth;

        car.style.transition = `transform ${duration}ms linear`;
        car.style.transform = `translateX(${trackWidth - carWidth - 10}px)`;

        const onTransitionEnd = () => {
            car.removeEventListener('transitionend', onTransitionEnd);
            resolve();
        };

        car.addEventListener('transitionend', onTransitionEnd);
    });
}

export function resetCar(element: HTMLElement): void {
    const car = element.querySelector('.car-svg') as HTMLElement;
    car.style.transition = 'none';
    car.style.transform = 'translateX(0)';
    // Force reflow
    void car.offsetWidth;
}

export function generateRandomCars(count: number): Omit<Car, 'id'>[] {
    const brands = [
        'Tesla',
        'BMW',
        'Mercedes',
        'Audi',
        'Ford',
        'Toyota',
        'Honda',
        'Chevrolet',
        'Porsche',
        'Ferrari',
    ];
    const models = [
        'Model S',
        'X5',
        'C-Class',
        'A4',
        'Mustang',
        'Camry',
        'Civic',
        'Corvette',
        '911',
        '488',
    ];

    const cars: Omit<Car, 'id'>[] = [];
    for (let i = 0; i < count; i++) {
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const model = models[Math.floor(Math.random() * models.length)];
        const name = `${brand} ${model}`;
        const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        cars.push({ name, color });
    }
    return cars;
}