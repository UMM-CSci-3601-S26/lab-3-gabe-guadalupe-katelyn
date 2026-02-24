import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Todo } from './todo';

@Injectable({
  providedIn: 'root'
})

export class TodoService {
  private httpClient = inject(HttpClient);

  readonly todoUrl: string = `${environment.apiUrl}todos`;

  private readonly ownerKey = 'owner';
  private readonly catKey = 'category';

  getTodos(filters?: {
    owner?: string;
    category?: string;
  }): Observable<Todo[]> {

    let httpParams: HttpParams = new HttpParams();

    if (filters) {
      if (filters.owner) {
        httpParams = httpParams.set(this.ownerKey, filters.owner);
      }
      if (filters.category) {
        httpParams = httpParams.set(this.catKey, filters.category);
      }
    }

    return this.httpClient.get<Todo[]>(this.todoUrl, {
      params: httpParams,
    });
  }

  filterTodos(todos: Todo[], filters: {
    limit?: number;
    body?: string;
    status?: boolean;
    sort? : string;
  }): Todo[] {
    let filteredTodos = todos;

    // Filter by body
    if (filters.body) {
      filters.body = filters.body.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => todo.body.toLowerCase().indexOf(filters.body) !== -1);
    }

    // Filter by status
    if (filters.status !== undefined) {
      filteredTodos = filteredTodos.filter(todo => todo.status === filters.status);
    }

    // Filter by limit
    if (filters.limit != null) {
      filteredTodos = filteredTodos.slice(0, filters.limit);
    }

    if (filters.sort) {
      switch (filters.sort) {
      case 'ownerAsc':
        filteredTodos.sort((a, b) =>
          a.owner.localeCompare(b.owner)
        );
        break;

      case 'ownerDesc':
        filteredTodos.sort((a, b) =>
          b.owner.localeCompare(a.owner)
        );
        break;

      case 'bodyAsc':
        filteredTodos.sort((a, b) =>
          a.body.localeCompare(b.body)
        );
        break;

      case 'bodyDesc':
        filteredTodos.sort((a, b) =>
          b.body.localeCompare(a.body)
        );
        break;

      case 'categoryAsc':
        filteredTodos.sort((a, b) =>
          a.category.localeCompare(b.category)
        );
        break;

      case 'categoryDesc':
        filteredTodos.sort((a, b) =>
          b.category.localeCompare(a.category)
        );
        break;

      case 'status':
        filteredTodos.sort((a, b) => {
          if (a.status === b.status) {
            return 0;
          }

          if (a.status) {
            return -1;
          }

          if (b.status) {
            return 1;
          }
        });
      }
    }

    return filteredTodos;
  }

  addTodo(newTodo: Partial<Todo>): Observable<string> {
    return this.httpClient.post<{id: string}>(this.todoUrl, newTodo).pipe(map(response => response.id));
  }

}
