import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable } from 'rxjs';
import { MockTodoService } from 'src/testing/todo.service.mock';
import { Todo } from './todo';
import { TodoCardComponent } from './todo-card.component';
import { TodoService } from './todo.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TodoComponent } from './todo-list.component';


describe('Todo list', () => {
  let todoList: TodoComponent;
  let fixture: ComponentFixture<TodoComponent>;
  let todoService: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TodoComponent, TodoCardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TodoService, useClass: MockTodoService },
        provideRouter([])
      ],
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TodoComponent);
      todoList = fixture.componentInstance;
      todoService = TestBed.inject(TodoService);
      fixture.detectChanges();
    });
  }));

  it('should create the component', () => {
    expect(todoList).toBeTruthy();
  });

  it('should initialize with serverFilteredTodos available', () => {
    todoList.todoOwner.set(undefined);
    fixture.detectChanges();

    const todos = todoList.serverFilteredTodos();
    expect(todos).toBeDefined();
    expect(Array.isArray(todos)).toBe(true);
  });

  it('should call getTodo() when todoCategory signal changes', () => {
    const spy = spyOn(todoService, 'getTodos').and.callThrough();
    todoList.todoCategory.set('homework');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith({ category: 'homework', owner: undefined });
  });

  it('should call getTodo() when todoOwner signal changes', () => {
    const spy = spyOn(todoService, 'getTodos').and.callThrough();
    todoList.todoOwner.set('Fry');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith({ category: undefined, owner: 'Fry' });
  });

});

describe('Misbehaving Todo List', () => {
  let todoList: TodoComponent;
  let fixture: ComponentFixture<TodoComponent>;

  let todoServiceStub: {
    getTodos: () => Observable<Todo[]>;
    filterTodos: () => Todo[];
  };

  beforeEach(() => {
    // stub TodoService for test purposes
    todoServiceStub = {
      getTodos: () =>
        new Observable((observer) => {
          observer.error('getTodos() Observer generates an error');
        }),
      filterTodos: () => []
    };
  });

  // Construct the `todoList` used for the testing in the `it` statement
  // below.
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TodoComponent
      ],
      // providers:    [ TodoService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{
        provide: TodoService,
        useValue: todoServiceStub
      }, provideRouter([])],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoComponent);
    todoList = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("generates an error if we don't set up a TodoListService", () => {
    // If the service fails, we expect the `serverFilteredTodos` signal to
    // be an empty array of todos.
    expect(todoList.serverFilteredTodos())
      .withContext("service can't give values to the list if it's not there")
      .toEqual([]);
    // We also expect the `errMsg` signal to contain the "Problem contacting…"
    // error message. (It's arguably a bit fragile to expect something specific
    // like this; maybe we just want to expect it to be non-empty?)
    expect(todoList.errMsg())
      .withContext('the error message will be')
      .toContain('Problem contacting the server – Error Code:');
  });
});
