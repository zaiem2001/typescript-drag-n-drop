import { ProjectList } from "./Components/ProjectList.js";
import { ProjectManager } from "./Components/ProjectManager.js";
import { ProjectStatus } from "./Models/Model.js";

new ProjectManager();
new ProjectList(ProjectStatus.ACTIVE);
new ProjectList(ProjectStatus.COMPLETED);
