import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
   constructor(private firestore: Firestore) {}

  getProjects(userId: string): Observable<Project[]> {
    const ref = collection(this.firestore, 'projects');
    return collectionData(ref, { idField: 'id' }) as Observable<Project[]>;
  }

  addProject(project: Project) {
    const ref = collection(this.firestore, 'projects');
    return addDoc(ref, project);
  }

  deleteProject(projectId: string) {
    const ref = doc(this.firestore, `projects/${projectId}`);
    return deleteDoc(ref);
  }
}
