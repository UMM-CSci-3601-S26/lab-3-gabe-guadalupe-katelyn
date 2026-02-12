import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoCardComponent } from './todo-card.component';

import { Todo } from './todo'

describe('TodoCardComponent', () => {
  let component: TodoCardComponent;
  let fixture: ComponentFixture<TodoCardComponent>;
  let expectedTodo: Todo;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoCardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TodoCardComponent);
    component = fixture.componentInstance;
    expectedTodo = {
      _id: "58af3a600343927e48e8720f",
      owner: "Blanche",
      status: false,
      body: "In sunt ex non tempor cillum commodo amet incididunt anim qui commodo quis. Cillum non labore ex sint esse.",
      category: "software design"
    }
    fixture.componentRef.setInput('todo', expectedTodo);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be associated with the correct todo', () => {
    expect(component.todo()).toEqual(expectedTodo);
  });

  it('should be the todo with owner Blanche', () => {
    expect(component.todo().owner).toEqual('Blanche');
  });
});
