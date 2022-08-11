namespace App {
  export class ProjectItem
    extends Component<HTMLUListElement, HTMLLIElement>
    implements Draggable
  {
    private project: Project;

    get persons() {
      return this.project.people === 1
        ? "1 Person"
        : `${this.project.people} People`;
    }

    constructor(hostId: string, project: Project) {
      super("single-project", hostId, false, project.id);
      this.project = project;

      this.configure();
      this.render();
    }

    dragStartHandler(e: DragEvent) {
      const { dataTransfer } = e;

      dataTransfer!.setData("text/plain", this.project.id);
      dataTransfer!.effectAllowed = "move";
    }

    dragEndHandler(_e: DragEvent) {
      // console.log("END");
      const listEl = document.querySelector("ul")!;
      listEl.classList.remove("droppable");
    }

    configure() {
      this.renderEl.addEventListener(
        "dragstart",
        this.dragStartHandler.bind(this)
      );

      this.renderEl.addEventListener("dragend", this.dragEndHandler.bind(this));
    }

    render() {
      const { title, description } = this.project;

      this.renderEl.querySelector("h2")!.textContent = title;
      this.renderEl.querySelector("h3")!.textContent =
        this.persons + " Assigned.";
      this.renderEl.querySelector("p")!.textContent = description;
    }
  }
}
