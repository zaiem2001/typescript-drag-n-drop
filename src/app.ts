/// <reference path="Interfaces/DragInterfaces.ts" />
/// <reference path="Models/Model.ts" />
/// <reference path="ProjectState.ts" />
/// <reference path="Components/BaseFile.ts" />
/// <reference path="Components/ProjectItem.ts" />
/// <reference path="Components/ProjectList.ts" />
/// <reference path="Components/ProjectManager.ts" />

namespace App {
  new ProjectManager();
  new ProjectList(ProjectStatus.ACTIVE);
  new ProjectList(ProjectStatus.COMPLETED);
}
