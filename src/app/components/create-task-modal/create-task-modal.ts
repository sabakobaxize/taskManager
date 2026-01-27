import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskService } from '../../services/task-service';
import { Task } from '../../models/task.model';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-task-modal.html',
  styleUrl: './create-task-modal.css',
})
export class CreateTaskModal {
  form = new FormGroup({
    title: new FormControl('', Validators.required),
  });

  constructor(
    private taskService: TaskService,
    private dialogRef: MatDialogRef<CreateTaskModal>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: string; ownerId: string }
  ) {}

  createTask() {
    const task: Task = {
      projectId: this.data.projectId,
      ownerId: this.data.ownerId,
      title: this.form.value.title as string,
      done: false,
      createdAt: new Date(),
    };

    this.taskService.addTask(task,this.data.ownerId).then(() => {
      this.dialogRef.close();
    });
  }

  close() {
    this.dialogRef.close();
  }
}
