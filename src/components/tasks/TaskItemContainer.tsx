import { FormEventHandler, useCallback } from 'react';
import { toast } from 'sonner';
import { PencilIcon } from '@heroicons/react/24/outline';

import useFetchTask from '~/lib/tasks/hooks/use-fetch-task';
import useUpdateTask from '~/lib/tasks/hooks/use-update-task';

import { Task } from '~/lib/tasks/types/task';

import PageLoadingIndicator from '~/core/ui/PageLoadingIndicator';
import Alert from '~/core/ui/Alert';
import Heading from '~/core/ui/Heading';
import Textarea from '~/core/ui/Textarea';

const TaskItemContainer: React.FC<{
  taskId: string;
}> = ({ taskId }) => {
  const { status, data: task } = useFetchTask(taskId);

  if (status === `loading`) {
    return <PageLoadingIndicator>Loading Task...</PageLoadingIndicator>;
  }

  if (status === `error`) {
    return <Alert type={`error`}>Sorry, we encountered an issue</Alert>;
  }

  return (
    <div className={'flex flex-col space-y-1'}>
      <TaskTitleInput task={task} />
      <TaskDescriptionTextarea task={task} />
    </div>
  );
};

function TaskTitleInput({
  task,
}: React.PropsWithChildren<{
  task: WithId<Task>;
}>) {
  const updateTask = useUpdateTask(task.id);
  const taskToaster = useUpdateTaskToaster();

  const onBlur: FormEventHandler<HTMLElement> = useCallback(
    (event) => {
      const target = event.currentTarget;
      const name = target.innerText.trim();
      const promise = updateTask({ name });

      if (name === task.name) {
        return;
      }

      return taskToaster(promise);
    },
    [updateTask, taskToaster, task],
  );

  return (
    <div className={'flex items-center space-x-3 rounded-lg p-4'}>
      <PencilIcon className={'h-5'} />

      <div className={'flex flex-1'}>
        <Heading type={3}>
          <p
            className={
              'p-2 ring ring-transparent transition-colors' +
              ' hover:ring-gray-200 dark:hover:ring-black-300' +
              ' focus:ring-primary-500 dark:focus:ring-primary-500' +
              ' outline-none'
            }
            contentEditable={true}
            onBlur={onBlur}
          >
            {task.name}
          </p>
        </Heading>
      </div>

      <div className={'justify-end text-sm dark:text-gray-400'}>
        This task is due by {new Date(task.dueDate).toDateString()}
      </div>
    </div>
  );
}

function TaskDescriptionTextarea({
  task,
}: React.PropsWithChildren<{
  task: WithId<Task>;
}>) {
  const updateTask = useUpdateTask(task.id);
  const taskToaster = useUpdateTaskToaster();

  return (
    <div
      className={
        'TextFieldInputContainer h-36 p-2 dark:bg-black-500' +
        ' dark:border-black-500'
      }
    >
      <Textarea
        defaultValue={task.description}
        name={'description'}
        className={'TextFieldInput h-full'}
        placeholder={
          'Update the description... it will auto save when you' +
          ' leave this field'
        }
        onBlur={(event) => {
          const description = (
            (event.currentTarget as HTMLTextAreaElement).value ?? ''
          ).trim();

          const promise = updateTask({ description });

          if (description === task.description) {
            return;
          }

          return taskToaster(promise);
        }}
      />
    </div>
  );
}

function useUpdateTaskToaster() {
  return useCallback((promise: Promise<unknown>) => {
    return toast.promise(promise, {
      loading: `Updating task...`,
      success: `Task updated successfully`,
      error: `Ops, we could not update this task!`,
    });
  }, []);
}

export default TaskItemContainer;
