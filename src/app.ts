enum ProjectStatus {
  ACTIVE = "active",
  COMPLETED = "finished",
}

interface Draggable {
  dragStartHandler(e: DragEvent): void;
  dragEndHandler(e: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(e: DragEvent): void;
  dropHandler(e: DragEvent): void;
  dragLeaveHandler(e: DragEvent): void;
}

interface Project {
  id: string;
  title: string;
  description: string;
  people: number;
  status: ProjectStatus;
}

type ListenerFn<T> = (items: T[]) => void;

class State<T> {
  protected listeners: ListenerFn<T>[] = [];

  addListener(listenerFn: ListenerFn<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProjects(projectObj: Project) {
    this.projects.push(projectObj);
    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((project) => project.id === projectId);

    if (project && newStatus !== project.status) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    this.listeners.map((listener) => {
      listener([...this.projects]);
    });
  }
}

const projectState = ProjectState.getInstance();

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

class ProjectItem
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

class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: any[];

  constructor(private type: ProjectStatus) {
    super("project-list", "app", false, `${type}-projects`);

    this.assignedProjects = [];

    this.configure();
    this.render();
  }

  dragOverHandler(e: DragEvent): void {
    if (e.dataTransfer && e.dataTransfer.types[0] === "text/plain") {
      e.preventDefault();
      const listEl = this.renderEl.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  dragLeaveHandler(_e: DragEvent): void {
    const listEl = this.renderEl.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  dropHandler(e: DragEvent): void {
    const dataId = e.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      dataId,
      this.type === ProjectStatus.ACTIVE
        ? ProjectStatus.ACTIVE
        : ProjectStatus.COMPLETED
    );
  }

  configure() {
    this.renderEl.addEventListener("dragover", this.dragOverHandler.bind(this));
    this.renderEl.addEventListener(
      "dragleave",
      this.dragLeaveHandler.bind(this)
    );
    this.renderEl.addEventListener("drop", this.dropHandler.bind(this));

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project: Project) => {
        if (this.type === ProjectStatus.ACTIVE) {
          return project.status === ProjectStatus.ACTIVE;
        }

        return project.status === ProjectStatus.COMPLETED;
      });

      this.assignedProjects = relevantProjects;

      this.renderProjects();
    });
  }

  render() {
    const listId = `${this.type}-projects-list`;
    this.renderEl.querySelector("ul")!.id = listId;
    this.renderEl.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " Projects";
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;

    listEl.innerHTML = "";
    this.assignedProjects.map((project: Project) => {
      const renderIn = this.renderEl.querySelector("ul")! as HTMLUListElement;
      new ProjectItem(renderIn.id, project);
    });
  }
}

class ProjectManager extends Component<HTMLDivElement, HTMLFormElement> {
  titleInpEl: HTMLInputElement;
  descriptionInpEl: HTMLInputElement;
  peopleInpEl: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

    this.titleInpEl = this.renderEl.querySelector("#title") as HTMLInputElement;
    this.descriptionInpEl = this.renderEl.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInpEl = this.renderEl.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.renderEl.addEventListener("submit", this.submitHandler.bind(this));
  }

  render() {}

  private validateInputs(element: string): boolean {
    if (!element.trim()) return false;
    return true;
  }

  private getUserInput(): [string, string, number] | void {
    const title = this.titleInpEl.value;
    const desc = this.descriptionInpEl.value;
    const people = this.peopleInpEl.value;

    if (
      !this.validateInputs(title) ||
      !this.validateInputs(desc) ||
      !this.validateInputs(people)
    ) {
      alert("Invalid User Input!");
      return;
    }

    return [title, desc, +people];
  }

  private submitHandler(e: Event) {
    e.preventDefault();

    const userInput = this.getUserInput();

    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;

      projectState.addProjects({
        title,
        description: desc,
        people,
        status: ProjectStatus.ACTIVE,
        id: Date.now().toString(),
      });

      this._clearInputs();
    }
  }

  private _clearInputs() {
    this.titleInpEl.value = "";
    this.descriptionInpEl.value = "";
    this.peopleInpEl.value = "";
  }
}

const project_1 = new ProjectManager();
const activeList = new ProjectList(ProjectStatus.ACTIVE);
const completedList = new ProjectList(ProjectStatus.COMPLETED);
