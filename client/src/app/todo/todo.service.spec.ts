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

  it('sorts todos by owner ascending', () => {
    const result = todoService.filterTodos(testTodos, { sort: 'ownerAsc' });
    const owners = result.map(todo => todo.owner);
    expect(owners).toEqual(['Barry', 'Blanche', 'Fry']);
  });

  it('sorts todos by owner descending', () => {
    const result = todoService.filterTodos(testTodos, { sort: 'ownerDesc' });
    const owners = result.map(todo => todo.owner);
    expect(owners).toEqual(['Fry', 'Blanche', 'Barry']);
  });

  it('sorts todos by body ascending', () => {
    const result = todoService.filterTodos(testTodos, { sort: 'bodyAsc' });
    const bodies = result.map(todo => todo.body);

    const expected = [...bodies].sort((a, b) => a.localeCompare(b));
    expect(bodies).toEqual(expected);
  });

  it('sorts todos by body descending', () => {
    const result = todoService.filterTodos(testTodos, { sort: 'bodyDesc' });
    const bodies = result.map(todo => todo.body);

    const expected = [...bodies].sort((a, b) => b.localeCompare(a));
    expect(bodies).toEqual(expected);
  });

  it('sorts todos by category ascending', () => {
    const result = todoService.filterTodos(testTodos, { sort: 'categoryAsc' });
    const categories = result.map(todo => todo.category);
    expect(categories).toEqual(['homework', 'software design', 'video games']);
  });

  it('sorts todos by category descending', () => {
    const result = todoService.filterTodos(testTodos, { sort: 'categoryDesc' });
    const categories = result.map(todo => todo.category);
    expect(categories).toEqual(['video games', 'software design', 'homework']);
  });

  it('sorts todos by status (complete first)', () => {
    const result = todoService.filterTodos(testTodos, { sort: 'status' });
    const statuses = result.map(todo => todo.status);
    expect(statuses).toEqual([true, false, false]);
  });

  it('correctly calls api/todos with multiple filter parameters', () => {
    const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

    todoService.getTodos({ owner: 'Barry', category: 'video games' }).subscribe(() => {

      // This gets the arguments for the first (and in this case only) call to the `mockMethod`.
      const [url, options] = mockedMethod.calls.argsFor(0);
      // Gets the `HttpParams` from the options part of the call.
      // `options.param` can return any of a broad number of types;
      // it is in fact an instance of `HttpParams`, and I need to use
      // that fact, so I'm casting it (the `as HttpParams` bit).
      const calledHttpParams: HttpParams = (options.params) as HttpParams;
      expect(mockedMethod)
        .withContext('one call')
        .toHaveBeenCalledTimes(1);
      expect(url)
        .withContext('talks to the correct endpoint')
        .toEqual(todoService.todoUrl);
      expect(calledHttpParams.keys().length)
        .withContext('should have 2 params')
        .toEqual(2);
      expect(calledHttpParams.get('owner'))
        .withContext('owner of Barry')
        .toEqual('Barry');
      expect(calledHttpParams.get('category'))
        .withContext('category being video games')
        .toEqual('video games');
    });
  });

  it('filters by status and limit', () => {
    const todoStatus = false;
    const todoLimit = 1;
    const filters = { status: todoStatus, limit: todoLimit };
    const filteredTodos = todoService.filterTodos(testTodos, filters);
    // There should be 2 todos with these properties be we limited to 1.
    expect(filteredTodos.length).toBe(1);
    // Every returned todo should be incomplete.
    filteredTodos.forEach(todo => {
      expect(todo.status).toBe(todoStatus);
    });
  });

});
