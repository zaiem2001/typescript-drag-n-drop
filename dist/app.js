"use strict";
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["ACTIVE"] = "active";
    ProjectStatus["COMPLETED"] = "finished";
})(ProjectStatus || (ProjectStatus = {}));
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProjects(projectObj) {
        this.projects.push(projectObj);
        this.updateListeners();
    }
    moveProject(projectId, newStatus) {
        const project = this.projects.find((project) => project.id === projectId);
        if (project && newStatus !== project.status) {
            project.status = newStatus;
            this.updateListeners();
        }
    }
    updateListeners() {
        this.listeners.map((listener) => {
            listener([...this.projects]);
        });
    }
}
const projectState = ProjectState.getInstance();
class Component {
    constructor(templateId, hostId, insertAtFirst, newElemId) {
        this.templateEl = document.getElementById(templateId);
        this.hostEl = document.getElementById(hostId);
        const importedNode = document.importNode(this.templateEl.content, true);
        this.renderEl = importedNode.firstElementChild;
        if (newElemId)
            this.renderEl.id = newElemId;
        this.attach(insertAtFirst);
    }
    attach(insertAtFirst) {
        this.hostEl.insertAdjacentElement(insertAtFirst ? "afterbegin" : "beforeend", this.renderEl);
    }
}
class ProjectItem extends Component {
    constructor(hostId, project) {
        super("single-project", hostId, false, project.id);
        this.project = project;
        this.configure();
        this.render();
    }
    get persons() {
        return this.project.people === 1
            ? "1 Person"
            : `${this.project.people} People`;
    }
    dragStartHandler(e) {
        const { dataTransfer } = e;
        dataTransfer.setData("text/plain", this.project.id);
        dataTransfer.effectAllowed = "move";
    }
    dragEndHandler(_e) {
        const listEl = document.querySelector("ul");
        listEl.classList.remove("droppable");
    }
    configure() {
        this.renderEl.addEventListener("dragstart", this.dragStartHandler.bind(this));
        this.renderEl.addEventListener("dragend", this.dragEndHandler.bind(this));
    }
    render() {
        const { title, description } = this.project;
        this.renderEl.querySelector("h2").textContent = title;
        this.renderEl.querySelector("h3").textContent =
            this.persons + " Assigned.";
        this.renderEl.querySelector("p").textContent = description;
    }
}
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.configure();
        this.render();
    }
    dragOverHandler(e) {
        if (e.dataTransfer && e.dataTransfer.types[0] === "text/plain") {
            e.preventDefault();
            const listEl = this.renderEl.querySelector("ul");
            listEl.classList.add("droppable");
        }
    }
    dragLeaveHandler(_e) {
        const listEl = this.renderEl.querySelector("ul");
        listEl.classList.remove("droppable");
    }
    dropHandler(e) {
        const dataId = e.dataTransfer.getData("text/plain");
        projectState.moveProject(dataId, this.type === ProjectStatus.ACTIVE
            ? ProjectStatus.ACTIVE
            : ProjectStatus.COMPLETED);
    }
    configure() {
        this.renderEl.addEventListener("dragover", this.dragOverHandler.bind(this));
        this.renderEl.addEventListener("dragleave", this.dragLeaveHandler.bind(this));
        this.renderEl.addEventListener("drop", this.dropHandler.bind(this));
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter((project) => {
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
        this.renderEl.querySelector("ul").id = listId;
        this.renderEl.querySelector("h2").textContent =
            this.type.toUpperCase() + " Projects";
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        listEl.innerHTML = "";
        this.assignedProjects.map((project) => {
            const renderIn = this.renderEl.querySelector("ul");
            new ProjectItem(renderIn.id, project);
        });
    }
}
class ProjectManager extends Component {
    constructor() {
        super("project-input", "app", true, "user-input");
        this.titleInpEl = this.renderEl.querySelector("#title");
        this.descriptionInpEl = this.renderEl.querySelector("#description");
        this.peopleInpEl = this.renderEl.querySelector("#people");
        this.configure();
    }
    configure() {
        this.renderEl.addEventListener("submit", this.submitHandler.bind(this));
    }
    render() { }
    validateInputs(element) {
        if (!element.trim())
            return false;
        return true;
    }
    getUserInput() {
        const title = this.titleInpEl.value;
        const desc = this.descriptionInpEl.value;
        const people = this.peopleInpEl.value;
        if (!this.validateInputs(title) ||
            !this.validateInputs(desc) ||
            !this.validateInputs(people)) {
            alert("Invalid User Input!");
            return;
        }
        return [title, desc, +people];
    }
    submitHandler(e) {
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
    _clearInputs() {
        this.titleInpEl.value = "";
        this.descriptionInpEl.value = "";
        this.peopleInpEl.value = "";
    }
}
const project_1 = new ProjectManager();
const activeList = new ProjectList(ProjectStatus.ACTIVE);
const completedList = new ProjectList(ProjectStatus.COMPLETED);
