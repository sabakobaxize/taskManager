import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { ProjectService } from '../../services/project-service';
import { TaskService } from '../../services/task-service';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';
import { MatDialog } from '@angular/material/dialog';
import { LoginModal } from '../../components/login-modal/login-modal';
import { CreateTaskModal } from '../../components/create-task-modal/create-task-modal';
import { CommonModule } from '@angular/common'; 
import { CreateProjectModal } from '../../components/create-project-modal/create-project-modal';
import { switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';
@Component({
  selector: 'app-home',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  user$!: Observable<any>;

  projects$!: Observable<Project[]>;
  tasks$!: Observable<Task[]>;

  selectedProject: Project | null = null;
  page: 'projects' | 'tasks' = 'projects';

  constructor(
    public auth: AuthService,            // <-- make public
    private projectService: ProjectService,
    private taskService: TaskService,
      private dialog: MatDialog
  ) {
    this.user$ = this.auth.user$;   
    //initializes projects based on user
     this.projects$ = this.user$.pipe(
    switchMap(user => {
      if (user) {
        return this.projectService.getProjects(user.uid);
      } else {
        return of([]); // Return empty list if no user
      }
    })
  );   
  }

openLoginModal() {
  this.dialog.open(LoginModal, {
    data: { mode: 'login' }
  });
}

openRegisterModal() {
  this.dialog.open(LoginModal, {
    data: { mode: 'register' }
  });
}

openCreateTaskModal() {
  if (!this.selectedProject) return;

  this.user$.pipe(take(1)).subscribe(user => {
    this.dialog.open(CreateTaskModal, {
      data: { 
        projectId: this.selectedProject!.id!,
        ownerId: user.uid
      }
    });
  });
}

openCreateProjectModal() {
  this.user$.pipe(take(1)).subscribe(user => {
    this.dialog.open(CreateProjectModal, {
      data: { uid: user.uid }
    });
  });
}
  openTasks(project: Project) {
    this.selectedProject = project;
    this.page = 'tasks';
    this.tasks$ = this.taskService.getTasks(project.id!);
  }

  loadProjects(userId: string) {
    this.projects$ = this.projectService.getProjects(userId);
  }
}
