import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
//import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Todo } from './todo';

@Injectable({
  providedIn: 'root'
})

export class TodoService {
  private httpClient = inject(HttpClient);

  readonly todoUrl: string = `${environment.apiUrl}todos`;

  private readonly ownerKey = 'owner';
  private readonly limitKey = 'limit';

  getTodos(filters?: {owner?: string; limit?: number}): Observable<Todo[]> {

    let httpParams: HttpParams = new HttpParams();

    if (filters) {
      if (filters.owner) {
        httpParams = httpParams.set(this.ownerKey, filters.owner);
      }
      if (filters.limit) {
        httpParams = httpParams.set(this.limitKey, filters.limit);
      }
    }

    return this.httpClient.get<Todo[]>(this.todoUrl, {
      params: httpParams,
    });
  }

  filterTodos(todos: Todo[], filters: { owner?: string; }): Todo[] { // skipcq: JS-0105
    let filteredTodos = todos;

    // Filter by name
    if (filters.owner) {
      filters.owner = filters.owner.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => todo.owner.toLowerCase().indexOf(filters.owner) !== -1);
    }

    return filteredTodos;
  }
}
