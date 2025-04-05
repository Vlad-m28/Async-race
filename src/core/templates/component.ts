export default abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    protected element: U;

    constructor(
        protected templateId: string,
        protected hostElementId: string,
        protected insertAtStart: boolean,
        protected newElementId?: string
    ) {
        const template = document.getElementById(this.templateId)! as HTMLTemplateElement;
        const hostElement = document.getElementById(this.hostElementId)! as T;

        const importedNode = document.importNode(template.content, true);
        this.element = importedNode.firstElementChild as U;
        if (this.newElementId) this.element.id = this.newElementId;

        this.attach();
    }

    private attach() {
        const hostElement = document.getElementById(this.hostElementId)! as T;
        hostElement.insertAdjacentElement(
            this.insertAtStart ? 'afterbegin' : 'beforeend',
            this.element
        );
    }

    protected query<K extends HTMLElement>(selector: string): K | null {
        return this.element.querySelector(selector) as K | null;
    }

    protected queryAll<K extends HTMLElement>(selector: string): NodeListOf<K> {
        return this.element.querySelectorAll(selector) as NodeListOf<K>;
    }

    abstract render(): void;
}