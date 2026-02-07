import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProjectService } from '../../services/project-service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-create-project-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-project-modal.html',
  styleUrl: './create-project-modal.css',
})
export class CreateProjectModal {
  form = new FormGroup({
title: new FormControl('',[ Validators.required, Validators.minLength(3)]),
    description: new FormControl(''),
  });

  constructor(
    private projectService: ProjectService,
    private dialogRef: MatDialogRef<CreateProjectModal>,
    @Inject(MAT_DIALOG_DATA) public data: { uid: string }
  ) {}

  createProject() {
        if (this.form.invalid) return; // Guard clause
    const project: Project = {
      ownerId: this.data.uid,
      title: this.form.value.title as string,
      isDone: false,
      description: this.form.value.description as string,
      createdAt: new Date(),
    };

    this.projectService.addProject(project).then(() => {
      this.dialogRef.close();
    });
  }

  close() {
    this.dialogRef.close();
  }
}
