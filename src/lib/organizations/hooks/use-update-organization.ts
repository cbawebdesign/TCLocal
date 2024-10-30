import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from 'reactfire';
import useSWRMutation from 'swr/mutation';

import { Organization } from '~/lib/organizations/types/organization';
import { ORGANIZATIONS_COLLECTION } from '~/lib/firestore-collections';

/**
 * @name useUpdateOrganization
 * @description Hook to update an organization's general information (name, logo and timezone)
 */
export function useUpdateOrganization() {
  const firestore = useFirestore();

  return useSWRMutation(
    ['update-organization'],
    (
      _,
      {
        arg: organization,
      }: {
        arg: {
          id: string;
        } & Partial<Organization>;
      },
    ) => {
      const { id, ...data } = organization;
      const ref = doc(firestore, ORGANIZATIONS_COLLECTION, id);

      return updateDoc(ref, data);
    },
  );
}
