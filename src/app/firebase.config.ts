import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

const firebaseAppProvider = provideFirebaseApp(() =>
  initializeApp(environment.firebase)
);
const firestoreProvider = provideFirestore(() => getFirestore());

const firebaseProviders: EnvironmentProviders = makeEnvironmentProviders([
  firebaseAppProvider,
  firestoreProvider,
]);

export { firebaseProviders };
