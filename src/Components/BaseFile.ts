export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  hostEl: T;
  renderEl: U;

  constructor(
    templateId: string,
    hostId: string,
    insertAtFirst: boolean,
    newElemId?: string
  ) {
    this.templateEl = document.getElementById(
      templateId
    )! as HTMLTemplateElement;

    this.hostEl = document.getElementById(hostId)! as T;

    const importedNode = document.importNode(this.templateEl.content, true);

    this.renderEl = importedNode.firstElementChild as U;

    if (newElemId) this.renderEl.id = newElemId;

    this.attach(insertAtFirst);
  }

  private attach(insertAtFirst: boolean) {
    this.hostEl.insertAdjacentElement(
      insertAtFirst ? "afterbegin" : "beforeend",
      this.renderEl
    );
  }

  abstract configure(): void;
  abstract render(): void;
}
