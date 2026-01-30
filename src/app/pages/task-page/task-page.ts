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
  ngOnInit(): void{
    if(this.project){
    this.openTasks();}

this.progress$ = this.tasks$.pipe(
      map(tasks => {
        if (!tasks || tasks.length === 0) return 0;
        const doneCount = tasks.filter(t => t.done).length;
        return Math.round((doneCount / tasks.length) * 100);
      }),
      tap(percentage => {
        if (percentage === 100) {
          // Logic to update project status when 100%
          this.projectService.updateProjectStatus(this.project.id!, true).catch(err => {
            console.error("Failed to update project status:", err);
          });
        }else{
          this.projectService.updateProjectStatus(this.project.id!, false).catch(err => {
            console.error("Failed to update project status:", err);
          });
        }
      })
    );
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
  this.tasks$ = this.taskService.getTasks(this.project.id!, this.auth.getCurrentUser()!.uid);
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
