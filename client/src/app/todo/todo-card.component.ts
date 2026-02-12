import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule, NgClass } from '@angular/common';
// import { RouterLink } from '@angular/router';
import { Todo } from './todo';

@Component({
  selector: 'app-todo-card',
  templateUrl: './todo-card.component.html',
  styleUrls: ['./todo-card.component.scss'],
  imports: [CommonModule, NgClass, MatCardModule, MatButtonModule, MatListModule, MatIconModule]
})
export class TodoCardComponent {

  todo = input.required<Todo>();
  //simple = input(false);
}
