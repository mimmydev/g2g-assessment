/// <reference types="vite/client" />
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy
} from "firebase/firestore";
import type { User, CreateUserInput, UpdateUserInput } from "../src/models/user";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Collection reference
const USERS_COLLECTION = 'users';

// Helper function to convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Helper function to convert Firestore document to User
const convertDocToUser = (doc: any): User => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    email: data.email,
    dateOfBirth: convertTimestampToDate(data.dateOfBirth),
    gender: data.gender,
    profilePicture: data.profilePicture,
    createdAt: convertTimestampToDate(data.createdAt),
    updatedAt: convertTimestampToDate(data.updatedAt)
  };
};

// CRUD Operations
export const userService = {
  // Create a new user
  async createUser(userInput: CreateUserInput): Promise<User> {
    try {
      const now = serverTimestamp();
      const userDoc = {
        ...userInput,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collection(db, USERS_COLLECTION), userDoc);
      const newDoc = await getDoc(docRef);
      
      if (!newDoc.exists()) {
        throw new Error('Failed to create user');
      }
      
      return convertDocToUser(newDoc);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create user');
    }
  },

  // Get all users
  async getUsers(): Promise<User[]> {
    try {
      const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(convertDocToUser);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch users');
    }
  },

  // Get a single user by ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, USERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return convertDocToUser(docSnap);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user');
    }
  },

  // Update a user
  async updateUser(userInput: UpdateUserInput): Promise<User> {
    try {
      const { id, ...updateData } = userInput;
      const docRef = doc(db, USERS_COLLECTION, id);
      
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updatedData);
      
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('User not found after update');
      }
      
      return convertDocToUser(updatedDoc);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update user');
    }
  },

  // Delete a user
  async deleteUser(id: string): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  }
};

// Export Firestore instance for direct access if needed
export { db };
