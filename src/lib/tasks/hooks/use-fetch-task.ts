import { useFirestore, useFirestoreDocData } from 'reactfire';
import { doc, DocumentReference } from 'firebase/firestore';

import { Task } from '~/lib/tasks/types/task';

function useFetchTask(taskId: string) {
  const firestore = useFirestore();
  const tasksCollection = 'tasks';

  const ref = doc(firestore, tasksCollection, taskId) as DocumentReference<
    WithId<Task>
  >;

  return useFirestoreDocData(ref, {
    idField: 'id',
  });
}

export default useFetchTask;
