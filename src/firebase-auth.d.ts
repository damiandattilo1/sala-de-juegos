declare module 'firebase/app' {
  export interface FirebaseOptions {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
  }

  export interface FirebaseApp {
    name: string;
    options: FirebaseOptions;
  }

  export function initializeApp(options: FirebaseOptions, name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(name?: string): FirebaseApp;
}

declare module 'firebase/auth' {
  import type { FirebaseApp } from 'firebase/app';

  export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    emailVerified: boolean;
    phoneNumber: string | null;
    photoURL: string | null;
    providerId: string;
    metadata?: {
      creationTime?: string | null;
      lastSignInTime?: string | null;
    };
    getIdToken(forceRefresh?: boolean): Promise<string>;
    getIdTokenResult(forceRefresh?: boolean): Promise<any>;
    reload(): Promise<void>;
    toJSON(): { [key: string]: any };
  }

  export interface Auth {
    currentUser: User | null;
  }

  export function getAuth(app?: FirebaseApp): Auth;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<{ user: User }>;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<{ user: User }>;
  export function signOut(auth: Auth): Promise<void>;
  export function onAuthStateChanged(auth: Auth, nextOrObserver: (user: User | null) => void): () => void;
}

declare module 'firebase/firestore' {
  import type { FirebaseApp } from 'firebase/app';

  export interface Firestore {}
  export interface DocumentReference<T = any> {}
  export interface Query<T = any> {}
  export interface QueryConstraint {}
  export interface QueryDocumentSnapshot<T = any> {
    id: string;
    data(): T;
  }
  export interface QuerySnapshot<T = any> {
    docs: Array<QueryDocumentSnapshot<T>>;
    empty: boolean;
    size: number;
  }
  export interface Timestamp {
    toDate(): Date;
  }
  export interface DocumentSnapshot<T = any> {
    exists(): boolean;
    data(): T | undefined;
  }
  export type Unsubscribe = () => void;

  export function getFirestore(app?: FirebaseApp): Firestore;
  export function doc(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference;
  export function collection(firestore: Firestore, path: string): Query;
  export function setDoc<T = any>(reference: DocumentReference, data: T): Promise<void>;
  export function getDoc<T = any>(reference: DocumentReference): Promise<DocumentSnapshot<T>>;
  export function addDoc<T = any>(reference: Query<T>, data: T): Promise<DocumentReference<T>>;
  export function query<T = any>(baseQuery: Query<T>, ...queryConstraints: QueryConstraint[]): Query<T>;
  export function orderBy(fieldPath: string, directionStr?: 'asc' | 'desc'): QueryConstraint;
  export function where(fieldPath: string, opStr: string, value: any): QueryConstraint;
  export function limit(n: number): QueryConstraint;
  export function getDocs<T = any>(query: Query<T>): Promise<QuerySnapshot<T>>;
  export function serverTimestamp(): any;
  export function onSnapshot<T = any>(
    query: Query<T>,
    onNext: (snapshot: QuerySnapshot<T>) => void,
    onError?: (error: Error) => void
  ): Unsubscribe;
}
