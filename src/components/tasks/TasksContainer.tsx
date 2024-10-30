import PageLoadingIndicator from '~/core/ui/PageLoadingIndicator';
import Alert from '~/core/ui/Alert';
import Button from '~/core/ui/Button';

import useFetchTasks from '~/lib/tasks/hooks/use-fetch-tasks';
import TasksTable from '~/components/tasks/TasksTable';
import Modal from '~/core/ui/Modal';
import CreateTaskForm from '~/components/tasks/CreateTaskForm';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const TasksContainer: React.FC<{
  organizationId: string;
}> = ({ organizationId }) => {
  const { status, data: tasks } = useFetchTasks(organizationId);

  if (status === `loading`) {
    return <PageLoadingIndicator>Loading Tasks...</PageLoadingIndicator>;
  }

  if (status === `error`) {
    return (
      <Alert type={'error'}>
        Sorry, we encountered an error while fetching your tasks.
      </Alert>
    );
  }

  return (
    <div className={'flex flex-col space-y-4'}>
      <div>
        <CreateTaskButton>
          <span className={'flex space-x-2 items-center'}>
            <PlusCircleIcon className={'h-5'} />
            <span>New Task</span>
          </span>
        </CreateTaskButton>
      </div>

      <TasksTable tasks={tasks} />
    </div>
  );
};

function CreateTaskButton(props: React.PropsWithChildren) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Modal heading={`Create Task`} setIsOpen={setOpen} isOpen={open}>
        <CreateTaskForm onCreate={() => setOpen(false)} />
      </Modal>

      <Button variant={'ghost'} {...props} onClick={() => setOpen(true)} />
    </>
  );
}

export default TasksContainer;
