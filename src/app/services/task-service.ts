import { Injectable } from '@angular/core';
import { updateDoc,} from '@angular/fire/firestore';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
@Injectable({
  providedIn: 'root',
})
export class TaskService {
 constructor(private firestore: Firestore) {}

getTasks(projectId: string, userId: string): Observable<Task[]> {
  const ref = collection(this.firestore, 'tasks');
  
  // You MUST include ownerId in the query to satisfy the security rules
  const q = query(
    ref, 
    where('projectId', '==', projectId),
    where('ownerId', '==', userId) // Add this!
  );
  
  return collectionData(q, { idField: 'id' }) as Observable<Task[]>;
}
updateTaskStatus(taskId: string, isDone: boolean) {
  const taskDocRef = doc(this.firestore, `tasks/${taskId}`);
  
  // Directly updates the boolean field in Firestore
  return updateDoc(taskDocRef, { done: isDone });
}
  // CHANGE: Pass the userId here
  addTask(task: Task, userId: string) {
    const ref = collection(this.firestore, 'tasks');
    const taskWithOwner = {
      ...task,
      ownerId: userId, // Add this for security!
      createdAt: new Date()
    };
    return addDoc(ref, taskWithOwner);
  }

deleteTask(taskId: string) {
  // Ensure taskId is not undefined
  if (!taskId) return Promise.reject('No Task ID provided');
  
  const docRef = doc(this.firestore, `tasks/${taskId}`);
  return deleteDoc(docRef);
}
}
