import { GetServerSidePropsContext } from 'next';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';

import { withAppProps } from '~/lib/props/with-app-props';
import TaskItemContainer from '~/components/tasks/TaskItemContainer';
import RouteShell from '~/components/RouteShell';

import ErrorBoundary from '~/core/ui/ErrorBoundary';
import Alert from '~/core/ui/Alert';
import Heading from '~/core/ui/Heading';
import Button from '~/core/ui/Button';

const TaskPage: React.FC<{ taskId: string }> = ({ taskId }) => {
  return (
    <RouteShell title={<TaskPageHeading />}>
      <ErrorBoundary
        fallback={<Alert type={'error'}>Ops, an error occurred :(</Alert>}
      >
        <TaskItemContainer taskId={taskId} />
      </ErrorBoundary>
    </RouteShell>
  );
};

function TaskPageHeading() {
  return (
    <div className={'flex items-center space-x-6'}>
      <Heading type={4}>
        <span>Task</span>
      </Heading>

      <Button size={'small'} variant={'ghost'} href={'/tasks'}>
        <span className={'flex space-x-2 items-center'}>
          <ArrowLeftIcon className={'h-4'} />
          <span>Back to Tasks</span>
        </span>
      </Button>
    </div>
  );
}

export default TaskPage;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const appProps = await withAppProps(ctx);
  const taskId = ctx.query.id;

  if ('props' in appProps) {
    return {
      props: {
        ...(appProps.props ?? {}),
        taskId,
      },
    };
  }

  return appProps;
}
