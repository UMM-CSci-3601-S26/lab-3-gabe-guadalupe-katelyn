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
  todoStatus = signal<boolean | undefined>(undefined);

  todoLimit = signal<number | undefined>(undefined);

  errMsg = signal<string | undefined>(undefined);

  viewType = signal<'card' | 'list'>('card');

  private todoLimit$ = toObservable(this.todoLimit);

  serverFilteredTodos =
    toSignal(
      combineLatest([this.todoLimit$]).pipe(
        switchMap(([ limit ]) =>
          this.todoService.getTodos({ limit })
        ),
        catchError((err) => {
          if (!(err.error instanceof ErrorEvent)) {
            this.errMsg.set(
              `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
            );
          }
          this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
          // `catchError` needs to return the same type. `of` makes an observable of the same type, and makes the array still empty
          return of<Todo[]>([]);
        }),
        tap(() => {

        })
      )
    );

  filteredTodos = computed(() => {
    const serverFilteredTodos = this.serverFilteredTodos();
    return this.todoService.filterTodos(serverFilteredTodos, {
      owner: this.todoOwner(),
      body: this.todoBody(),
      category: this.todoCategory(),
      status: this.todoStatus()
    });
  });

  setStatusFilter(value: 'all' | 'complete' | 'incomplete') {
    if (value === 'complete') this.todoStatus.set(true);
    else if (value === 'incomplete') this.todoStatus.set(false);
    else this.todoStatus.set(undefined);
  }
}

