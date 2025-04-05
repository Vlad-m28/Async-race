import { ICar } from '@core/models/car.model';
import { IWinner } from '@core/models/winner.model';

/**
 * Генератор случайных цветов в HEX-формате
 */
export const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Генератор случайных имен автомобилей
 */
export const generateRandomName = (): string => {
  const brands = ['Tesla', 'BMW', 'Mercedes', 'Audi', 'Ford', 'Porsche', 'Ferrari'];
  const models = ['Model S', 'X5', 'C-Class', 'A4', 'Mustang', '911', 'F8 Tributo'];
  const randomBrand = brands[Math.floor(Math.random() * brands.length)];
  const randomModel = models[Math.floor(Math.random() * models.length)];
  return `${randomBrand} ${randomModel}`;
};

/**
 * Генератор случайных автомобилей
 * @param count - количество автомобилей для генерации
 */
export const generateRandomCars = (count: number): Omit<ICar, 'id'>[] => {
  return Array.from({ length: count }, () => ({
    name: generateRandomName(),
    color: generateRandomColor()
  }));
};

/**
 * Форматирование времени в секундах (например, 1.234 -> "1.2")
 */
export const formatTime = (seconds: number): string => {
  return seconds.toFixed(1);
};

/**
 * Сравнение результатов гонки для сортировки победителей
 */
export const compareRaceResults = (a: IWinner, b: IWinner): number => {
  // Сначала по времени, затем по количеству побед
  if (a.time !== b.time) {
    return a.time - b.time;
  }
  return b.wins - a.wins;
};

/**
 * Ограничение числа в диапазон
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Анимация с использованием requestAnimationFrame
 */
export const animate = (
  element: HTMLElement,
  duration: number,
  callback: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    const frame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      
      callback(progress);
      
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    };
    
    requestAnimationFrame(frame);
  });
};

/**
 * Задержка выполнения (для симуляции анимации/ожидания)
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Обработчик ошибок API с повторными попытками
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await delay(delayMs);
    return withRetry(fn, retries - 1, delayMs);
  }
};

/**
 * Утилита для обработки событий с делегированием
 */
export const delegateEvent = (
  container: HTMLElement,
  eventType: string,
  selector: string,
  handler: (event: Event, target: HTMLElement) => void
) => {
  container.addEventListener(eventType, (event) => {
    const target = (event.target as HTMLElement).closest(selector);
    if (target && container.contains(target)) {
      handler(event, target);
    }
  });
};

/**
 * Форматирование числа с ведущим нулем
 */
export const padNumber = (num: number, length = 2): string => {
  return String(num).padStart(length, '0');
};

/**
 * Проверка, является ли значение объектом
 */
export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};