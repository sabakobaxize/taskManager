import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, query, where,} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';
import { updateDoc } from 'firebase/firestore';
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
   constructor(private firestore: Firestore) {}


  getProjects(userId: string): Observable<Project[]> {
  const projectsRef = collection(this.firestore, 'projects');
  
  // Create a query that filters projects by ownerId
  const q = query(projectsRef, where('ownerId', '==', userId));
  
  return collectionData(q, { idField: 'id' }) as Observable<Project[]>;
}
updateProjectStatus(projectIc: string, isDone: boolean) {
  const projectDocRef = doc(this.firestore, `projects/${projectIc}`);
  
  // Directly updates the boolean field in Firestore
  return updateDoc(projectDocRef, { isDone: isDone });
}

  addProject(project: Project) {
    const ref = collection(this.firestore, 'projects');
    return addDoc(ref, project);
  }
deleteProject(projectId: string) {
  // Create a reference to the specific project document
  const docRef = doc(this.firestore, `projects/${projectId}`);
  
  // This will only succeed if the Security Rules pass (ownerId == auth.uid)
  return deleteDoc(docRef);
}
}
