namespace App {
  export class ProjectManager extends Component<
    HTMLDivElement,
    HTMLFormElement
  > {
    titleInpEl: HTMLInputElement;
    descriptionInpEl: HTMLInputElement;
    peopleInpEl: HTMLInputElement;

    constructor() {
      super("project-input", "app", true, "user-input");

      this.titleInpEl = this.renderEl.querySelector(
        "#title"
      ) as HTMLInputElement;
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
}
