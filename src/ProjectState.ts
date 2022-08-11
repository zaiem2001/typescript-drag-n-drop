namespace App {
  type ListenerFn<T> = (items: T[]) => void;

  class State<T> {
    protected listeners: ListenerFn<T>[] = [];

    addListener(listenerFn: ListenerFn<T>) {
      this.listeners.push(listenerFn);
    }
  }

  export class ProjectState extends State<Project> {
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

  export const projectState = ProjectState.getInstance();
}
