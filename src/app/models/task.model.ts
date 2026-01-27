
export interface Task {
  id?: string;         // Firestore doc id
  projectId: string;   // project id
  ownerId: string;     // user uid
  title: string;
  done: boolean;
  createdAt: any;
}
