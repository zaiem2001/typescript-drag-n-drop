namespace App {
  export enum ProjectStatus {
    ACTIVE = "active",
    COMPLETED = "finished",
  }

  export interface Project {
    id: string;
    title: string;
    description: string;
    people: number;
    status: ProjectStatus;
  }
}
