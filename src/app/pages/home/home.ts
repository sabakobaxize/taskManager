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
import { Router } from '@angular/router';
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

  constructor(
    private router: Router,
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
confirmDelete(projectId: string | undefined, event: Event) {
  event.stopPropagation(); // Prevents the card click from firing
  
  if (!projectId) return;

  if (confirm('Are you sure you want to delete this project?')) {
    this.projectService.deleteProject(projectId)
      .then(() => {
      alert('Project deleted successfully');
        // If the user was looking at the tasks for this project, clear them
        if (this.selectedProject?.id === projectId) {
          this.selectedProject = null;
       
        }
      })
      .catch(err => {
        console.error('Delete failed:', err);
        alert('You do not have permission to delete this project.');
      });
  }
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
  this.router.navigate(['/tasks'], { 
    state: { data: project } 
  });}
confirmDeleteTask(taskId: string | undefined, event: Event) {
  event.stopPropagation(); 
  console.log("Attempting to delete task with ID:", taskId); 
  if (!taskId) {
    console.error("No Task ID provided");
    return;
  }

  if (confirm('Are you sure you want to delete this task?')) {
    this.taskService.deleteTask(taskId)
      .then(() => {
        // We don't need to change this.page because we are already on the tasks page
        console.log('Task deleted successfully');
      })
      .catch(err => {
        console.error('Delete failed:', err);
        alert('Permission Denied: You can only delete tasks you created.');
      });
  }
}

}
