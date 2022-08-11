import { Component } from "./BaseFile";
import { DragTarget } from "../Interfaces/DragInterfaces";
import { Project, ProjectStatus } from "../Models/Model";
import { projectState } from "../ProjectState";
import { ProjectItem } from "./ProjectItem";

export class ProjectList
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
