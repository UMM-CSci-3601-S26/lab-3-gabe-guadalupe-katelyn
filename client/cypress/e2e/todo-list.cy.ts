import { TodoListPage } from '../support/todo-list.po';

const page = new TodoListPage();

describe('Todo list', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTodoTitle().should('have.text', 'Todos');
  });

  it('Should show 300 todos in both card and list view', () => {
    page.getTodoCards().should('have.length', 300);
    page.changeView('list');
    page.getTodoListItems().should('have.length', 300);
  });

  it('Should type something in the owner filter and check that it returned correct elements', () => {
    // Filter for todo 'Fry'
    cy.get('[data-test=todoOwnerInput]').type('Fry');

    // All of the todo cards should have the owner we are filtering by
    page.getTodoCards().each(e => {
      cy.wrap(e).find('.todo-card-owner').should('have.text', 'Fry');
    });

    // (We check this two ways to show multiple ways to check this)
    page.getTodoCards().find('.todo-card-owner').each(el =>
      expect(el.text()).to.equal('Fry')
    );
  });

  // it('Should type something partial in the body filter and check that it returned correct elements', () => {
  //   // Filter for bodies that contain 'Nisi si'
  //   cy.get('[data-test=todoBodyInput]').type('Nisi si');

  //   page.getTodoCards().should('have.lengthOf', 3);

  //   // Each todo card's body should include the text we are filtering by
  //   page.getTodoCards().each(e => {
  //     cy.wrap(e).find('.todo-card-body').should('include.text', 'NISI SI');
  //   });
  // });

  it('Should click complete filter and only show completed todos', () => {

    cy.get('[data-test=statusComplete]').click();

    page.getTodoCards().each(card => {
      cy.wrap(card)
        .find('.green-icon')
        .should('exist');
    });

  });

  it('Should click incomplete filter and only show incomplete todos', () => {

    cy.get('[data-test=statusIncomplete]').click();

    page.getTodoCards().each(card => {
      cy.wrap(card)
        .find('.red-icon')
        .should('exist');
    });

  });

  it('Should show all todos when all filter selected', () => {

    cy.get('[data-test=statusComplete]').click();
    cy.get('[data-test=statusAll]').click();

    page.getTodoCards()
      .its('length')
      .should('be.greaterThan', 0);

  });
});
