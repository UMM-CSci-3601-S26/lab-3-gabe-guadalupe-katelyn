import { Todo } from 'src/app/todo/todo';

export class AddTodoPage {

  private readonly url = '/todos/new';
  private readonly title = '.add-todo-title';
  private readonly button = '[data-test=confirmAddTodoButton]';
  private readonly snackBar = '.mat-mdc-simple-snack-bar';
  private readonly ownerFieldName = 'owner';
  private readonly categoryFieldName = 'category';
  private readonly statusFieldName = 'status';
  private readonly bodyFieldName = 'body';
  private readonly formFieldSelector = 'mat-form-field';
  private readonly dropDownSelector = 'mat-option';

  navigateTo() {
    return cy.visit(this.url);
  }

  getTitle() {
    return cy.get(this.title);
  }

  addTodoButton() {
    return cy.get(this.button);
  }

  selectMatSelectValue(fieldName: string, value: string) {
    // Find and click the drop down
    this.getFormField(fieldName).click();

    let label: string;
    if (value === 'true') {
      label = 'Complete';
    } else if (value === 'false') {
      label = 'Incomplete';
    } else if (value === 'null') {
      label = '--';
    } else {
      throw new Error(`Unknown value passed to selectMatSelectValue`);
    }
    // Select and click the desired value from the resulting menu
    return cy.get(this.dropDownSelector).contains(label).click();
  }

  getFormField(fieldName: string) {
    return cy.get(`${this.formFieldSelector} [formcontrolname=${fieldName}]`);
  }

  getSnackBar() {
    // Since snackBars are often shown in response to errors,
    // we'll add a timeout of 10 seconds to help increase the likelihood that
    // the snackbar becomes visible before we might fail because it
    // hasn't (yet) appeared.
    return cy.get(this.snackBar, { timeout: 10000 });
  }

  addTodo(newTodo: Todo) {
    this.getFormField(this.ownerFieldName).type(newTodo.owner);
    this.getFormField(this.categoryFieldName).type(newTodo.category);
    this.selectMatSelectValue(this.statusFieldName, newTodo.status.toString());
    if (newTodo.body) {
      this.getFormField(this.bodyFieldName).type(newTodo.body);
    }
    return this.addTodoButton().click();
  }
}
