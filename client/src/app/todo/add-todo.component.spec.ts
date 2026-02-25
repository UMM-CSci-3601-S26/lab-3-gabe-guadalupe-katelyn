import { Location } from '@angular/common';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { AbstractControl, FormGroup } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { MockTodoService } from 'src/testing/todo.service.mock';
import { AddTodoComponent } from './add-todo.component';
import { TodoService } from './todo.service';
import { provideHttpClient } from '@angular/common/http';

describe('AddTodoComponent', () => {
  let addTodoComponent: AddTodoComponent;
  let addTodoForm: FormGroup;
  let fixture: ComponentFixture<AddTodoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AddTodoComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TodoService, useClass: MockTodoService }
      ]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTodoComponent);
    addTodoComponent = fixture.componentInstance;
    fixture.detectChanges();
    addTodoForm = addTodoComponent.addTodoForm;
    expect(addTodoForm).toBeDefined();
    expect(addTodoForm.controls).toBeDefined();
  });

  it('should create the component and form', () => {
    expect(addTodoComponent).toBeTruthy();
    expect(addTodoForm).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(addTodoForm.valid).toBeFalsy();
  });

  describe('The owner field', () => {
    let ownerControl: AbstractControl;

    beforeEach(() => {
      ownerControl = addTodoComponent.addTodoForm.controls.owner;
    });

    it('should not allow empty owners', () => {
      ownerControl.setValue('');
      expect(ownerControl.valid).toBeFalsy();
    });

    it('should be fine with "Chris Smith"', () => {
      ownerControl.setValue('Chris Smith');
      expect(ownerControl.valid).toBeTruthy();
    });

    it('should fail on single character owners', () => {
      ownerControl.setValue('x');
      expect(ownerControl.valid).toBeFalsy();
      expect(ownerControl.hasError('minlength')).toBeTruthy();
    });

    it('should fail on really long owners', () => {
      ownerControl.setValue('x'.repeat(100));
      expect(ownerControl.valid).toBeFalsy();
      expect(ownerControl.hasError('maxlength')).toBeTruthy();
    });

    it('should allow digits in the owner', () => {
      ownerControl.setValue('Bad2Th3B0ne');
      expect(ownerControl.valid).toBeTruthy();
    });
  });

  describe('The category field', () => {
    let categoryControl: AbstractControl;

    beforeEach(() => {
      categoryControl = addTodoComponent.addTodoForm.controls.category;
    });

    it('should not allow empty categories', () => {
      categoryControl.setValue('');
      expect(categoryControl.valid).toBeFalsy();
    });

    it('should be fine with "Homework"', () => {
      categoryControl.setValue('Homework');
      expect(categoryControl.valid).toBeTruthy();
    });

    it('should fail on single character categories', () => {
      categoryControl.setValue('x');
      expect(categoryControl.valid).toBeFalsy();
      expect(categoryControl.hasError('minlength')).toBeTruthy();
    });

    it('should fail on really long categories', () => {
      categoryControl.setValue('x'.repeat(100));
      expect(categoryControl.valid).toBeFalsy();
      expect(categoryControl.hasError('maxlength')).toBeTruthy();
    });
  });

  describe('The status field', () => {
    let statusControl: AbstractControl;

    beforeEach(() => {
      statusControl = addTodoForm.controls.status;
    });

    it('should not allow empty values', () => {
      statusControl.setValue('');
      expect(statusControl.valid).toBeFalsy();
      expect(statusControl.hasError('required')).toBeTruthy();
    });

    it('should allow "true"', () => {
      statusControl.setValue(true);
      expect(statusControl.valid).toBeTruthy();
    });

    it('should allow "false"', () => {
      statusControl.setValue(false);
      expect(statusControl.valid).toBeTruthy();
    });
  });

  describe('getErrorMessage()', () => {
    it('should return the correct error message', () => {
      let controlName: keyof typeof addTodoComponent.addTodoValidationMessages = 'owner';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'required': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Owner is required');

      controlName = 'category';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'required': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Category is required');
    });

    it('should return "Unknown error" if no error message is found', () => {
      const controlName: keyof typeof addTodoComponent.addTodoValidationMessages = 'owner';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'unknown': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Unknown error');
    });
  });
});



describe('AddTodoComponent#submitForm()', () => {
  let component: AddTodoComponent;
  let fixture: ComponentFixture<AddTodoComponent>;
  let todoService: TodoService;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AddTodoComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: TodoService, useClass: MockTodoService },
        provideRouter([{path: 'todos/:id', component: AddTodoComponent}])
      ]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTodoComponent);
    component = fixture.componentInstance;
    todoService = TestBed.inject(TodoService);
    location = TestBed.inject(Location);
    TestBed.inject(Router);
    TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  beforeEach(() => {
    component.addTodoForm.controls.owner.setValue('Chris Smith');
    component.addTodoForm.controls.category.setValue('Homework');
    component.addTodoForm.controls.status.setValue(false);
    component.addTodoForm.controls.body.setValue('This is a test todo');
  });

  it('should call addTodo() and handle success response', fakeAsync(() => {
    const addTodoSpy = spyOn(todoService, 'addTodo').and.returnValue(of('1'));
    component.submitForm();
    expect(addTodoSpy).toHaveBeenCalledWith(component.addTodoForm.value);
    tick();
    expect(location.path()).toBe('/todos/1');
    flush();
  }));

  it('should call addTodo() and handle error response', () => {
    const path = location.path();
    const errorResponse = { status: 500, message: 'Server error' };
    const addTodoSpy = spyOn(todoService, 'addTodo')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addTodoSpy).toHaveBeenCalledWith(component.addTodoForm.value);
    expect(location.path()).toBe(path);
  });


  it('should call addTodo() and handle error response for illegal todo', () => {
    const path = location.path();
    const errorResponse = { status: 400, message: 'Illegal todo error' };
    const addTodoSpy = spyOn(todoService, 'addTodo')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addTodoSpy).toHaveBeenCalledWith(component.addTodoForm.value);
    expect(location.path()).toBe(path);
  });

  it('should call addTodo() and handle unexpected error response if it arises', () => {
    const path = location.path();
    const errorResponse = { status: 404, message: 'Not found' };
    const addTodoSpy = spyOn(todoService, 'addTodo')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addTodoSpy).toHaveBeenCalledWith(component.addTodoForm.value);
    expect(location.path()).toBe(path);
  });
});
