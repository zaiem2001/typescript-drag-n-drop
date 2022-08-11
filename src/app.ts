import { ProjectList } from "./Components/ProjectList";
import { ProjectManager } from "./Components/ProjectManager";
import { ProjectStatus } from "./Models/Model";

new ProjectManager();
new ProjectList(ProjectStatus.ACTIVE);
new ProjectList(ProjectStatus.COMPLETED);

console.log("Zaiem")