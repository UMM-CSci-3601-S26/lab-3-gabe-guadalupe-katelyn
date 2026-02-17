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
  private readonly bodyKey = 'body';
  private readonly catKey = 'category';
  private readonly statusKey = 'status';

  getTodos(filters?: {
    owner?: string;
    body?: string;
    status?: boolean;
    category?: string;
  }): Observable<Todo[]> {

    let httpParams: HttpParams = new HttpParams();

    if (filters) {
      if (filters.owner) {
        httpParams = httpParams.set(this.ownerKey, filters.owner);
      }
      if (filters.body) {
        httpParams = httpParams.set(this.bodyKey, filters.body);
      }
      if (filters.category) {
        httpParams = httpParams.set(this.catKey, filters.category);
      }
      if (filters.status) {
        httpParams = httpParams.set(this.statusKey, filters.status);
      }
    }

    return this.httpClient.get<Todo[]>(this.todoUrl, {
      params: httpParams,
    });
  }

  filterTodos(todos: Todo[], filters: {
    limit?: number;
  }): Todo[] {
    let filteredTodos = todos;

    if (filters.limit !== undefined) {
      filteredTodos = filteredTodos.slice(0, filters.limit);
    }

    return filteredTodos;
  }
}
