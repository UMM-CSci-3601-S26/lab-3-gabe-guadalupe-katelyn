import { HttpClient, HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { Todo } from './todo';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  // A small collection of test todos
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
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    // Construct an instance of the service with the mock
    // HTTP client.
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    todoService = TestBed.inject(TodoService);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('When getTodos() is called with no parameters', () => {
    /* We really don't care what `getTodos()` returns. Since all the
    * filtering (when there is any) is happening on the server,
    * `getTodos()` is really just a "pass through" that returns whatever it receives,
    * without any "post processing" or manipulation. The test in this
    * `describe` confirms that the HTTP request is properly formed
    * and sent out in the world, but we don't _really_ care about
    * what `getTodos()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in this test, we'll keep it simple and have
    * the (mocked) HTTP request return the entire list `testTodos`
    * even though in "real life" we would expect the server to
    * return return a filtered subset of the todos. Furthermore, we
    * won't actually check what got returned (there won't be an `expect`
    * about the returned value). Since we don't use the returned value in this test,
    * It might also be fine to not bother making the mock return it.
    */
    it('calls `api/todos`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      // Call `todoService.getTodos()` and confirm that the correct call has
      // been made with the correct arguments.
      //
      // We have to `subscribe()` to the `Observable` returned by `getTodos()`.
      // The `todos` argument in the function is the array of Todos returned by
      // the call to `getTodos()`.
      todoService.getTodos().subscribe(() => {
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        // The mocked method should have been called with two arguments:
        //   * the appropriate URL ('/api/todos' defined in the `TodoService`)
        //   * An options object containing an empty `HttpParams`
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams() });
      });
    }));
  });

  describe('When getTodos() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {
    /*
    * As in the test of `getTodos()` that takes in no filters in the params,
    * we really don't care what `getTodos()` returns in the cases
    * where the filtering is happening on the server. Since all the
    * filtering is happening on the server, `getTodos()` is really
    * just a "pass through" that returns whatever it receives, without
    * any "post processing" or manipulation. So the tests in this
    * `describe` block all confirm that the HTTP request is properly formed
    * and sent out in the world, but don't _really_ care about
    * what `getTodos()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in each of these tests, we'll keep it simple and have
    * the (mocked) HTTP request return the entire list `testTodos`
    * even though in "real life" we would expect the server to
    * return return a filtered subset of the todos. Furthermore, we
    * won't actually check what got returned (there won't be an `expect`
    * about the returned value).
    */

    // it('correctly calls api/todos with filter parameter \'limit\'', () => {
    //   const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

    //   todoService.getTodos({ limit: 1}).subscribe(() => {
    //     expect(mockedMethod)
    //       .withContext('one call')
    //       .toHaveBeenCalledTimes(1);
    //     expect(mockedMethod)
    //       .withContext('talks to the correct endpoint')
    //       .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('limit', 1) });
    //   });
    // });
  });

  describe('Filtering on the client using `filterTodos()` (Angular/Client filtering)', () => {
    /*
     * Since `filterTodos` actually filters "locally" (in
     * Angular instead of on the server), we do want to
     * confirm that everything it returns has the desired
     * properties. Since this doesn't make a call to the server,
     * though, we don't have to use the mock HttpClient and
     * all those complications.
     */
    // it('filters by owner', () => {
    //   const todoOwner = 'Fry';
    //   const filteredTodos = todoService.filterTodos(testTodos, { owner: todoOwner });
    //   expect(filteredTodos.length).toBe(1);
    //   filteredTodos.forEach(todo => {
    //     expect(todo.owner.indexOf(todoOwner)).toBeGreaterThanOrEqual(0);
    //   });
    // });

    it('filters by body', () => {
      const todoBody = 'sunt ex non';
      const filteredTodos = todoService.filterTodos(testTodos, { body: todoBody });
      expect(filteredTodos.length).toBe(3);
      filteredTodos.forEach(todo => {
        expect(todo.body.indexOf(todoBody)).toBeGreaterThanOrEqual(0);
      });
    });

    // it('filters by category', () => {
    //   const todoCategory = 'homework';
    //   const filteredTodos = todoService.filterTodos(testTodos, { category: todoCategory });
    //   expect(filteredTodos.length).toBe(1);
    //   filteredTodos.forEach(todo => {
    //     expect(todo.category.indexOf(todoCategory)).toBeGreaterThanOrEqual(0);
    //   });
    // });
  });
});
