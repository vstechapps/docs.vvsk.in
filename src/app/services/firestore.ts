import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    User,
    onAuthStateChanged
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where
} from 'firebase/firestore';
import { getAnalytics, logEvent } from "firebase/analytics";
import { BehaviorSubject, Observable, from } from 'rxjs';

import { environment } from '../../environments/environment';

const firebaseConfig = environment.firebase;

@Injectable({
    providedIn: 'root'
})
export class FirestoreService {
    private app = initializeApp(firebaseConfig);
    private auth = getAuth(this.app);
    private db = getFirestore(this.app);
    private analytics = getAnalytics(this.app);

    private userSubject = new BehaviorSubject<User | null>(null);
    user$ = this.userSubject.asObservable();

    constructor() {
        onAuthStateChanged(this.auth, (user) => {
            this.userSubject.next(user);
        });
    }

    log(event: string, data: any = null) {
        let message: any = {
            url: window.location.href,
            device: window.navigator.userAgent,
            timestamp: new Date().toISOString(),
            event: event
        }
        if (data) {
            message.data = data;
        }
        console.log("Sending Event to Analytics: ", message);
        logEvent(this.analytics, event, message);
    }

    // Auth Methods
    async login() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(this.auth, provider);
            this.log('login', { email: result.user.email });
            return result.user;
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    }

    async logout() {
        try {
            await signOut(this.auth);
        } catch (error) {
            console.error('Logout failed', error);
            throw error;
        }
    }

    getCurrentUser(): User | null {
        return this.auth.currentUser;
    }

    // Firestore Methods

    // Create
    async create(collectionName: string, data: any) {
        try {
            const colRef = collection(this.db, collectionName);
            const docRef = await addDoc(colRef, data);
            return docRef.id;
        } catch (error) {
            console.error('Error creating document', error);
            throw error;
        }
    }

    // Read (Get all documents in a collection)
    async read(collectionName: string) {
        try {
            const colRef = collection(this.db, collectionName);
            const snapshot = await getDocs(colRef);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error reading documents', error);
            throw error;
        }
    }

    // Update
    async update(collectionName: string, docId: string, data: any) {
        try {
            const docRef = doc(this.db, collectionName, docId);
            await updateDoc(docRef, data);
        } catch (error) {
            console.error('Error updating document', error);
            throw error;
        }
    }

    // Delete
    async delete(collectionName: string, docId: string) {
        try {
            const docRef = doc(this.db, collectionName, docId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting document', error);
            throw error;
        }
    }
}
