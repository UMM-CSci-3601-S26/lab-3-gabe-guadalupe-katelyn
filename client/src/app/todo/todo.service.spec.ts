import { HttpClient, HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { Todo } from './todo';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  const testTodos: Todo[] = [
    {
      _id: "58af3a600343927e48e8720f",
      owner: "Blanche",
      status: false,
      body: "In sunt ex non tempor cillum commodo amet incididunt anim qui commodo quis. Cillum non labore ex sint esse.",
      category: "software design"
    },
    {
      _id: "58af3a600343987e48e8720f",
      owner: "Fry",
      status: false,
      body: "sunt ex non tempor cillum commodo amet incididunt anim qui commodo quis. Cillum non labore ex sint esse.",
      category: "homework"
    },
    {
      _id: "58af3a600343927c48e8720f",
      owner: "Barry",
      status: true,
      body: "In sunt ex non tempor cillum commodo amet incididunt qui commodo quis. Cillum non labore ex sint esse.",
      category: "video games"
    }
  ];

  let todoService: TodoService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    todoService = TestBed.inject(TodoService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('When getTodos() is called with no parameters', () => {
    it('calls `api/todos`', waitForAsync(() => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));
      todoService.getTodos().subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams() });
      });
    }));
  });

  it('filters by limit', () => {
  // Use a larger limit than testTodos length to check no filtering
    let limitedTodos = todoService.filterTodos(testTodos, { limit: 5 });
    expect(limitedTodos.length).toBe(testTodos.length);

    // Limit smaller than testTodos length truncates correctly
    limitedTodos = todoService.filterTodos(testTodos, { limit: 2 });
    expect(limitedTodos.length).toBe(2);

    // Limit of zero returns empty array
    limitedTodos = todoService.filterTodos(testTodos, { limit: 0 });
    expect(limitedTodos.length).toBe(0);

    // Limit undefined returns full array
    limitedTodos = todoService.filterTodos(testTodos, {});
    expect(limitedTodos.length).toBe(testTodos.length);
  });

  it('calls getTodos() with owner filter', waitForAsync(() => {
    const spy = spyOn(httpClient, 'get').and.returnValue(of(testTodos));
    todoService.getTodos({ owner: 'Fry' }).subscribe(() => {
      expect(spy).toHaveBeenCalledWith(
        todoService.todoUrl,
        { params: new HttpParams().set('owner', 'Fry') }
      );
    });
  }));

  it('filters by body', () => {
    const todoBody = 'sunt ex non';
    const filteredTodos = todoService.filterTodos(testTodos, { body: todoBody });
    expect(filteredTodos.length).toBe(3);
    filteredTodos.forEach(todo => {
      expect(todo.body.indexOf(todoBody)).toBeGreaterThanOrEqual(0);
    });
  });

  it('calls getTodos() with category filter', waitForAsync(() => {
    const spy = spyOn(httpClient, 'get').and.returnValue(of(testTodos));
    todoService.getTodos({ category: 'homework' }).subscribe(() => {
      expect(spy).toHaveBeenCalledWith(
        todoService.todoUrl,
        { params: new HttpParams().set('category', 'homework') }
      );
    });
  }));
});
