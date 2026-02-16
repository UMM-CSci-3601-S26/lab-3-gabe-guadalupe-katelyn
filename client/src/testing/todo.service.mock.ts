/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { Todo } from '../app/todo/todo';
import { TodoService } from 'src/app/todo/todo.service';

/**
 * A "mock" version of the `TodoService` that can be used to test components
 * without having to create an actual service. It needs to be `Injectable` since
 * that's how services are typically provided to components.
 */
@Injectable({
  providedIn: AppComponent
})
export class MockTodoService implements Pick<TodoService, 'getTodos' | 'filterTodos'> {
  static testTodos: Todo[] = [
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
  getTodos(_filters: { limit?: number }): Observable<Todo[]> {
    return of(MockTodoService.testTodos);
  }
  filterTodos(todos: Todo[], filters: {
    owner?: string;
    body?: string;
  }): Todo[] {
    return []
  }
}
