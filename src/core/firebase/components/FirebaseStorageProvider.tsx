import React, { useEffect } from 'react';
import configuration from '~/configuration';

import { FirebaseStorage, getStorage } from 'firebase/storage';
import { StorageProvider, useFirebaseApp } from 'reactfire';

export default function FirebaseStorageProvider({
  children,
  useEmulator,
}: React.PropsWithChildren<{ useEmulator?: boolean }>) {
  const app = useFirebaseApp();
  const emulator = useEmulator ?? configuration.emulator;
  const bucketUrl = configuration.firebase.storageBucket;
  const sdk = getStorage(app, bucketUrl);

  useEffect(() => {
    if (emulator) {
      void connectToEmulator(sdk);
    }
  }, [emulator, sdk]);

  return <StorageProvider sdk={sdk}>{children}</StorageProvider>;
}

async function connectToEmulator(storage: FirebaseStorage) {
  const { connectStorageEmulator } = await import('firebase/storage');

  const port = 9199;
  const emulatorHost = configuration.emulatorHost ?? 'localhost';

  connectStorageEmulator(storage, emulatorHost, port);
}
