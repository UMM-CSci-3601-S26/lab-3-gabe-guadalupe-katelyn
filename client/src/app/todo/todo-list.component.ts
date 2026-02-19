import { Component, computed, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, of, switchMap, tap } from 'rxjs';
import { Todo } from './todo';
import { TodoCardComponent } from './todo-card.component';
import { TodoService } from './todo.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-todo',
  imports: [
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    TodoCardComponent,
    MatListModule,
    RouterLink,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
  ],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss',
})
export class TodoComponent {
  private todoService = inject(TodoService);

  private snackBar = inject(MatSnackBar);

  todoOwner = signal<string | undefined>(undefined);
  todoBody = signal<string | undefined>(undefined);
  todoCategory = signal<string | undefined>(undefined);
  todoSort = signal<string | undefined>(undefined);
  todoStatus = signal<boolean | undefined>(undefined);

  todoLimit = signal<number | undefined>(undefined);

  errMsg = signal<string | undefined>(undefined);

  private todoOwner$ = toObservable(this.todoOwner);
  private todoCategory$ = toObservable(this.todoCategory);

  serverFilteredTodos =
    toSignal(
      combineLatest([
        this.todoOwner$,
        this.todoCategory$,
      ]).pipe(
        switchMap(([owner, category]) =>
          this.todoService.getTodos({
            owner,
            category
          })
        ),

        catchError((err) => {
          if (!(err.error instanceof ErrorEvent)) {
            this.errMsg.set(
              `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
            );
          }
          this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
          return of<Todo[]>([]);
        }),
        tap(() => {
          // empty
        })
      )
    );

  filteredTodos = computed(() => {
    const serverFilteredTodos = this.serverFilteredTodos();
    return this.todoService.filterTodos(serverFilteredTodos, {
      body: this.todoBody(),
      status: this.todoStatus(),
      sort: this.todoSort(),
      limit: this.todoLimit()
    });
  });

  setStatusFilter(value: 'all' | 'complete' | 'incomplete') {
    if (value === 'complete') this.todoStatus.set(true);
    else if (value === 'incomplete') this.todoStatus.set(false);
    else this.todoStatus.set(undefined);
  }

  resetFilters() {
    this.todoOwner.set(undefined);
    this.todoBody.set(undefined);
    this.todoCategory.set(undefined);
    this.todoStatus.set(undefined);
    this.todoLimit.set(undefined);
    this.todoSort.set(undefined);
  }
}
