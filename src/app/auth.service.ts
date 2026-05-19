import { Injectable } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { firebaseConfig } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  private auth = getAuth(this.app);
  private db = getFirestore(this.app);

  currentUser$ = new BehaviorSubject<User | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, user => this.currentUser$.next(user));
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(email: string, password: string, nombre: string, apellido: string, edad: number | null) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await setDoc(doc(this.db, 'usuarios', cred.user.uid), { nombre, apellido, edad, email });
  }

  logout() {
    return signOut(this.auth);
  }

  async getNombreUsuario(uid: string): Promise<string> {
    const snap = await getDoc(doc(this.db, 'usuarios', uid));
    return snap.exists() ? snap.data()['nombre'] ?? '' : '';
  }

  waitForAuthReady(): Promise<User | null> {
    return new Promise(resolve => {
      const unsubscribe = onAuthStateChanged(this.auth, user => {
        unsubscribe();
        resolve(user);
      });
    });
  }
}
