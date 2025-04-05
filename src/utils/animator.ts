export default class Animator {
    private animationFrameId = 0;

    constructor(private element: HTMLElement) {}

    async animate(distance: number, velocity: number): Promise<void> {
        return new Promise((resolve) => {
            const duration = distance / velocity;
            const startTime = performance.now();
            
            const animateFrame = (currentTime: number) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                this.element.style.transform = `translateX(${progress * 100}%)`;
                
                if (progress < 1) {
                    this.animationFrameId = requestAnimationFrame(animateFrame);
                } else {
                    resolve();
                }
            };
            
            this.animationFrameId = requestAnimationFrame(animateFrame);
        });
    }

    stop() {
        cancelAnimationFrame(this.animationFrameId);
    }
}