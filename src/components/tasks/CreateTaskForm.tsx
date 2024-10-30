import { useRouter } from 'next/router';
import { FormEventHandler, useCallback } from 'react';
import { toast } from 'sonner';

import TextField from '~/core/ui/TextField';
import Button from '~/core/ui/Button';
import useCreateTask from '~/lib/tasks/hooks/use-create-task';
import { useRequestState } from '~/core/hooks/use-request-state';
import If from '~/core/ui/If';

import { useCurrentOrganization } from '~/lib/organizations/hooks/use-current-organization';

const CreateTaskForm = (props: { onCreate: () => void }) => {
  const createTask = useCreateTask();
  const { setLoading, state } = useRequestState();
  const router = useRouter();
  const organization = useCurrentOrganization();
  const organizationId = organization?.id as string;

  const onCreateTask: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();

      const target = event.currentTarget;
      const data = new FormData(target);
      const name = data.get('name') as string;

      const dueDate = (data.get('dueDate') as string) || getDefaultDueDate();

      setLoading(true);

      const task = {
        organizationId,
        name,
        dueDate,
        description: ``,
        done: false,
      };

      const promise = createTask(task).then(() => {
        return router.push(`/tasks`);
      });

      toast.promise(promise, {
        success: `Task created!`,
        error: `Ops, error!`,
        loading: `Creating task...`,
      });

      props.onCreate();
    },
    [setLoading, organizationId, createTask, props, router],
  );

  return (
    <form onSubmit={onCreateTask}>
      <div className={'flex flex-col space-y-4'}>
        <TextField.Label>
          Name
          <TextField.Input
            required
            name={'name'}
            placeholder={'ex. Launch on IndieHackers'}
          />
          <TextField.Hint>Hint: whatever you do, ship!</TextField.Hint>
        </TextField.Label>

        <TextField.Label>
          Due date (optional)
          <TextField.Input name={'dueDate'} type={'date'} />
          <TextField.Hint>
            Leave blank to set the due date to tomorrow.
          </TextField.Hint>
        </TextField.Label>

        <div
          className={
            'flex flex-col space-y-2 md:space-y-0 md:space-x-2' + ' md:flex-row'
          }
        >
          <Button loading={state.loading}>
            <If condition={state.loading} fallback={<>Create Task</>}>
              Creating Task...
            </If>
          </Button>
        </div>
      </div>
    </form>
  );
};

function getDefaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(23, 59, 59);

  return date.toDateString();
}

export default CreateTaskForm;
