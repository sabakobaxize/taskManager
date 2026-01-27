export interface Project {
  id?: string;        // Firestore doc id
  ownerId: string;    // user uid
  title: string;
  isDone: boolean;
  description?: string;
  createdAt: any;     // timestamp
}