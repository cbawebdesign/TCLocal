import SentryProvider from '~/components/SentryProvider';

function AdminProviders(props: React.PropsWithChildren) {
  return <SentryProvider>{props.children}</SentryProvider>;
}

export default AdminProviders;
