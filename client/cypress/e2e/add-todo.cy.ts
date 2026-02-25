import { Todo } from 'src/app/todo/todo';
import { AddTodoPage } from '../support/add-todo.po';

describe('Add Todo', () => {
  const page = new AddTodoPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTitle().should('have.text', 'New Todo');
  });

  it('Should enable and disable the add Todo button', () => {
    // ADD Todo button should be disabled until all the necessary fields
    // are filled. Once the last (`#emailField`) is filled, then the button should
    // become enabled.
    page.addTodoButton().should('be.disabled');
    page.getFormField('owner').type('Fry');
    page.addTodoButton().should('be.disabled');
    page.getFormField('category').type('homework');
    page.addTodoButton().should('be.disabled');
    page.getFormField('body').type('Elit reprehenderit aliqua consectetur est dolor officia et adipisicing elit officia nisi elit enim nisi.');
    page.addTodoButton().should('be.disabled');
    page.selectMatSelectValue('status', 'true');
    // all the required fields have valid input, then it should be enabled
    page.addTodoButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=ownerError]').should('not.exist');
    // Just clicking the owner field without entering anything should cause an error message
    page.getFormField('owner').click().blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Some more tests for various invalid owner inputs
    page.getFormField('owner').type('J').blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    page
      .getFormField('owner')
      .clear()
      .type('This is a very long owner that goes beyond the 50 character limit')
      .blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Entering a valid owner should remove the error.
    page.getFormField('owner').clear().type('John Smith').blur();
    cy.get('[data-test=ownerError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=categoryError]').should('not.exist');
    // Just clicking the age field without entering anything should cause an error message
    page.getFormField('category').click().blur();
    // Some more tests for various invalid age inputs
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    page.getFormField('category').type('t').blur();
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    page.getFormField('category').clear().type('This is a very long category that goes beyond the character limit').blur();
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    // Entering a valid category should remove the error.
    page.getFormField('category').clear().type('homework').blur();
    cy.get('[data-test=categoryError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=statusError]').should('not.exist');
    // Just clicking the status field without entering anything should cause an error message
    page.selectMatSelectValue('status', 'null').click()
    cy.get('[data-test=statusError]').should('exist').and('be.visible');
    // Entering a valid status should remove the error.
    page.selectMatSelectValue('status', 'true').click()
    cy.get('[data-test=statusError]').should('not.exist');
  });

  describe('Adding a new Todo', () => {
    beforeEach(() => {
      cy.task('seed:database');
    });

    it('Should stay on the page, and have the right info in the snack bar', () => {
      const todo: Todo = {
        _id: null,
        owner: "Barry",
        status: true,
        body: "In sunt ex non tempor cillum commodo amet incididunt qui commodo quis. Cillum non labore ex sint esse.",
        category: "video games"
      };

      // The `page.addTodo(Todo)` call ends with clicking the "Add Todo"
      // button on the interface. That then leads to the client sending an
      // HTTP request to the server, which has to process that request
      // (including making calls to add the Todo to the database and wait
      // for those to respond) before we get a response and can update the GUI.
      // By calling `cy.intercept()` we're saying we want Cypress to "notice"
      // when we go to `/api/Todos`. The `AddTodoComponent.submitForm()` method
      // routes to `/api/Todos/{MongoDB-ID}` if the REST request to add the Todo
      // succeeds, and that routing will get "noticed" by the Cypress because
      // of the `cy.intercept()` call.
      //
      // The `.as('addTodo')` call basically gives that event a owner (`addTodo`)
      // which we can use in things like `cy.wait()` to say which event or events
      // we want to wait for.
      //
      // The `cy.wait('@addTodo')` tells Cypress to wait until we have successfully
      // routed to `/api/Todos` before we continue with the following checks. This
      // hopefully ensures that the server (and database) have completed all their
      // work, and that we should have a properly formed page on the client end
      // to check.
      cy.intercept('/api/todos').as('addTodo');
      page.addTodo(todo);
      cy.wait('@addTodo');

      // New URL should end in the 24 hex character Mongo ID of the newly added Todo.
      // We'll wait up to five full minutes for this these `should()` assertions to succeed.
      // Hopefully that long timeout will help ensure that our Cypress tests pass in
      // GitHub Actions, where we're often running on slow VMs.
      cy.url({ timeout: 300000 })
        .should('match', /\/todos\/new$/);

      // We should see the confirmation message at the bottom of the screen
      page.getSnackBar().should('contain', `Added todo ${todo.owner}`);
    });

    it('Should fail with invalid body', () => {
      const todo: Todo = {
        _id: null,
        owner: "Barry",
        status: true,
        body: null,
        category: "homework"
      };

      // Here we're _not_ expecting to route to `/api/Todos` since adding this
      // Todo should fail. So we don't add `cy.intercept()` and `cy.wait()` calls
      // around this `page.addTodo(Todo)` call. If we _did_ add them, the test wouldn't
      // actually fail because a `cy.wait()` that times out isn't considered a failure,
      // although we could catch the timeout and turn it into a failure if we needed to.
      page.addTodo(todo);

      // We should get an error message
      page.getSnackBar().should('contain', 'Tried to add an illegal new todo');

      // We should have stayed on the new Todo page
      cy.url()
        .should('match', /\/todos\/new$/);

      // The things we entered in the form should still be there
      page.getFormField('owner').should('have.value', todo.owner);
      page.getFormField('category').should('have.value', todo.category);
      page.getFormField('body').should('have.value', '');
      page.getFormField('status').should('contain', 'Complete');
    });
  });
});
