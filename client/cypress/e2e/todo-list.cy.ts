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

  it('Should show 300 todos', () => {
    page.getTodoCards().should('have.length', 300);
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

  it('Should type something partial in the body filter and check that it returned correct elements', () => {
    // Filter for bodies that contain 'nisi si'
    cy.get('[data-test=todoBodyInput]').type('nisi si', { force: true });

    page.getTodoCards().should('have.lengthOf', 3);

    // Each todo card's body should include the text we are filtering by
    page.getTodoCards().each(e => {
      cy.wrap(e).find('.todo-card-body').invoke('text').should('match', /nisi si/i);
    });
  });

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

  it('Should select a category groceries, and check that it returned correct todos', () => {
    // Filter for category 'groceries';
    cy.get('[data-test=todoCategoryInput]').click();
    cy.get('mat-option').contains('Groceries').click();

    // All of the todos that show should have the category we are looking for
    page.getTodoCards().each(e => {
      cy.wrap(e).find('.todo-card-category').should('contain', 'groceries');
    });
  });

  it('Should select a category homework, and check that it returned correct todos', () => {
    // Filter for category 'homework';
    cy.get('[data-test=todoCategoryInput]').click();
    cy.get('mat-option').contains('Homework').click();

    // All of the todos that show should have the category we are looking for
    page.getTodoCards().each(e => {
      cy.wrap(e).find('.todo-card-category').should('contain', 'homework');
    });
  });

  it('Should select a category software design, and check that it returned correct todos', () => {
    // Filter for category 'software design';
    cy.get('[data-test=todoCategoryInput]').click();
    cy.get('mat-option').contains('Software Design').click();

    // All of the todos that show should have the category we are looking for
    page.getTodoCards().each(e => {
      cy.wrap(e).find('.todo-card-category').should('contain', 'software design');
    });
  });

  it('Should select a category video games, and check that it returned correct todos', () => {
    // Filter for category 'video games';
    cy.get('[data-test=todoCategoryInput]').click();
    cy.get('mat-option').contains('Video Games').click();

    // All of the todos that show should have the category we are looking for
    page.getTodoCards().each(e => {
      cy.wrap(e).find('.todo-card-category').should('contain', 'video games');
    });
  });

  it('Should type a number in the limit filter and check that it returned the correct number of todos', () => {
    cy.get('[data-test=todoLimitInput]').type('10');
    page.getTodoCards().should('have.length', 10);

    cy.get('[data-test=todoLimitInput]').clear().type('50');
    page.getTodoCards().should('have.length', 50);
  });
});
