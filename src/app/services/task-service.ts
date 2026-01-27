import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
@Injectable({
  providedIn: 'root',
})
export class TaskService {
    constructor(private firestore: Firestore) {}

  getTasks(projectId: string): Observable<Task[]> {
    const ref = collection(this.firestore, 'tasks');
    const q = query(ref, where('projectId', '==', projectId));
    return collectionData(q, { idField: 'id' }) as Observable<Task[]>;
  }

  addTask(task: Task) {
    const ref = collection(this.firestore, 'tasks');
    return addDoc(ref, task);
  }

  deleteTask(taskId: string) {
    const ref = doc(this.firestore, `tasks/${taskId}`);
    return deleteDoc(ref);
  }
}
