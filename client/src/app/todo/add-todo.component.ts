import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: ['./add-todo.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatButtonModule]
})
export class AddTodoComponent {
  private todoService = inject(TodoService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);


  addTodoForm = new FormGroup({
    owner: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ])),

    category: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ])),

    status: new FormControl<boolean>(false, Validators.compose([
      Validators.required,
    ])),

    body: new FormControl('', Validators.compose([
      Validators.required,
      Validators.maxLength(300),
    ])),
  });

  readonly addTodoValidationMessages = {
    owner: [
      {type: 'required', message: 'Owner is required'},
      {type: 'minlength', message: 'Owner must be at least 2 characters long'},
      {type: 'maxlength', message: 'Owner must be at most 50 characters long'},
    ],

    category: [
      {type: 'required', message: 'Category is required'},
      {type: 'minlength', message: 'Category must be at least 2 characters long'},
      {type: 'maxlength', message: 'Category must be at most 50 characters long'},
    ],

    status: [
      {type: 'required', message: 'Status is required'}
    ],

    body: [
      { type: 'required', message: 'Body is required' },
      { type: 'maxlength', message: 'Body must be at most 300 characters long' },
    ]
  };

  formControlHasError(controlName: string): boolean {
    return this.addTodoForm.get(controlName).invalid &&
      (this.addTodoForm.get(controlName).dirty || this.addTodoForm.get(controlName).touched);
  }

  getErrorMessage(name: keyof typeof this.addTodoValidationMessages): string {
    for(const {type, message} of this.addTodoValidationMessages[name]) {
      if (this.addTodoForm.get(name).hasError(type)) {
        return message;
      }
    }
    return 'Unknown error';
  }

  submitForm() {
    this.todoService.addTodo(this.addTodoForm.value).subscribe({
      next: (newId) => {
        this.snackBar.open(
          `Added todo ${this.addTodoForm.value.owner}`,
          null,
          { duration: 2000 }
        );
        this.router.navigate(['/todos/', newId]);
      },
      error: err => {
        if (err.status === 400) {
          this.snackBar.open(
            `Tried to add an illegal new todo – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        } else if (err.status === 500) {
          this.snackBar.open(
            `The server failed to process your request to add a new todo. Is the server up? – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        } else {
          this.snackBar.open(
            `An unexpected error occurred – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        }
      },
    });
  }

}
