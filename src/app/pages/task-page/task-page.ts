import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task-service';
import { MatDialog } from '@angular/material/dialog';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';
import { map, Observable } from 'rxjs';
import { CreateTaskModal } from '../../components/create-task-modal/create-task-modal';
import { take, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project-service';
@Component({
  selector: 'app-task-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './task-page.html',
  styleUrl: './task-page.css',
})
export class TaskPage implements OnInit {
  user$!: Observable<any>;

  tasks$!: Observable<Task[]>;
  progress$!: Observable<number>;
  project!: Project;
  project$!: Observable<Project | undefined>;
  loadingTasks: boolean = true;
  constructor(
    private router: Router,
    public auth: AuthService,
    private projectService: ProjectService,
    private taskService: TaskService,
    private dialog: MatDialog
  ) {
    this.user$ = this.auth.user$;
    const navigation = this.router.getCurrentNavigation();
    this.project = navigation?.extras.state?.['data'];
   
  }
 ngOnInit(): void {
  if (this.project?.id) {
    // 1. Initialize the live stream for the project info
    this.project$ = this.projectService.getProjectById(this.project.id);

    // 2. Load the tasks
    this.openTasks();

    // 3. Setup the progress stream
    this.progress$ = this.tasks$.pipe(
      map(tasks => {
        if (!tasks?.length) return 0;
        const doneCount = tasks.filter(t => t.done).length;
        return Math.round((doneCount / tasks.length) * 100);
      }),
      tap(percentage => {
        const shouldBeDone = percentage === 100;
        
        // Only update Firebase if the status is actually changing
        // This prevents infinite loops or wasted document writes
        if (this.project.isDone !== shouldBeDone) {
          this.project.isDone = shouldBeDone; // Keep local copy in sync
          this.projectService.updateProjectStatus(this.project.id!, shouldBeDone)
            .catch(err => console.error("Update failed:", err));
        }
      })
    );
  }
}
  openCreateTaskModal() {
    if (!this.project) return;

    this.user$.pipe(take(1)).subscribe(user => {
      this.dialog.open(CreateTaskModal, {
        data: {
          projectId: this.project!.id!,
          ownerId: user.uid
        }
      });
    });
  }
  toggleTaskStatus(task: Task) {
    if (!task.id) return;

    // Since isDone is a boolean, we just send the opposite of its current value
    const newStatus = !task.done;

    this.taskService.updateTaskStatus(task.id, newStatus)
      .then(() => {
        console.log(`Task marked as ${newStatus ? 'done' : 'not done'}`);
      })
      .catch(err => {
        console.error("Permission error or network issue:", err);
      });
  }




openTasks() {
  this.tasks$ = this.taskService.getTasks(this.project.id!, this.auth.getCurrentUser()!.uid).pipe(tap(() => {
    this.loadingTasks = false;
  }));
}
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
        console.log('Task deleted successfully');
      })
      .catch(err => {
        console.error('Delete failed:', err);
        alert('Permission Denied: You can only delete tasks you created.');
      });
  }
}
}
