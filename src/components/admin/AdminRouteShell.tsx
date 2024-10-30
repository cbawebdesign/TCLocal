import AdminProviders from '~/components/admin/AdminProviders';
import AdminSidebar from '~/components/admin/AdminSidebar';
import { Page } from '~/core/ui/Page';
import Toaster from '~/core/ui/Toaster';

function AdminRouteShell(props: React.PropsWithChildren) {
  return (
    <AdminProviders>
      <Page sidebar={<AdminSidebar />}>{props.children}</Page>
      <Toaster />
    </AdminProviders>
  );
}

export default AdminRouteShell;
