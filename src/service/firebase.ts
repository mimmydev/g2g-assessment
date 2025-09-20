/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
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
  orderBy,
} from 'firebase/firestore';
import type { User, CreateUserInput, UpdateUserInput } from '@/models/user';

/**
 * Firebase Configuration
 *
 * Loads configuration values from environment variables to avoid hardcoding
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Collection Constants
 *
 * Centralizes collection names to avoid string duplication and ensure consistency.
 * Following Single Responsibility, this would be the only place that needs to change
 * if collection names were to be modified.
 */
const USERS_COLLECTION = 'users';

const convertTimestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

const removeUndefinedProperties = (obj: any): any => {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

const convertDateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

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
    updatedAt: convertTimestampToDate(data.updatedAt),
  };
};

/**
 * User Repository Service
 *
 * Implements the Repository Pattern for User entities for CRUD operations
 * that completely hides the Firestore implementation details.
 *
 * Each method:
 * 1. Takes domain objects as parameters
 * 2. Handles data transformations to/from Firestore format
 * 3. Centralizes error handling with meaningful error messages
 * 4. Returns domain objects (not Firestore documents)
 */
export const userService = {
  /**
   * Creates a new user in the database
   *
   * Transforms the input model into Firestore format and handles:
   * - Timestamp conversion for dates
   * - Adding server-generated timestamps for audit fields
   * - Removing undefined properties not supported by Firestore
   *
   * @param userInput - User creation data transfer object
   * @returns Promise resolving to the created user with ID
   * @throws Error if creation fails
   */
  async createUser(userInput: CreateUserInput): Promise<User> {
    try {
      // Use server timestamp for consistent time tracking across clients
      const now = serverTimestamp();
      const cleanedInput = removeUndefinedProperties(userInput);

      // Transform the domain object to Firestore format
      const userDoc = {
        ...cleanedInput,
        ...(cleanedInput.dateOfBirth && {
          dateOfBirth: convertDateToTimestamp(cleanedInput.dateOfBirth),
        }),
        createdAt: now,
        updatedAt: now,
      };

      // Perform database operations
      const docRef = await addDoc(collection(db, USERS_COLLECTION), userDoc);
      const newDoc = await getDoc(docRef);

      // Validate operation success
      if (!newDoc.exists()) {
        throw new Error('Failed to create user');
      }

      // Transform back to domain object
      return convertDocToUser(newDoc);
    } catch (error) {
      // Centralized error handling with meaningful messages
      console.error('Error creating user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create user');
    }
  },

  /**
   * Retrieves all users from the database
   *
   * Fetches users sorted by creation date (newest first) and transforms
   * each Firestore document to a domain User entity.
   *
   * @returns Promise resolving to array of User entities
   * @throws Error if fetching fails
   */
  async getUsers(): Promise<User[]> {
    try {
      const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      // Map each document to a domain User entity
      return querySnapshot.docs.map(convertDocToUser);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch users');
    }
  },

  /**
   * Retrieves a specific user by ID
   *
   * Returns null for non-existent users rather than throwing an exception,
   * allowing the application to handle missing users gracefully.
   *
   * @param id - User ID to retrieve
   * @returns Promise resolving to User entity or null if not found
   * @throws Error if database operation fails
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, USERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      // Handle non-existent user case
      if (!docSnap.exists()) {
        return null;
      }

      return convertDocToUser(docSnap);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user');
    }
  },

  /**
   * Updates an existing user
   *
   * Handles partial updates with a flexible input model that allows
   * updating only specific fields. Automatically updates the updatedAt
   * timestamp to maintain audit trail.
   *
   * @param id - ID of user to update
   * @param userInput - Partial user data with fields to update
   * @returns Promise resolving to updated User entity
   * @throws Error if user doesn't exist or update fails
   */
  async updateUser(id: string, userInput: UpdateUserInput): Promise<User> {
    try {
      const docRef = doc(db, USERS_COLLECTION, id);

      // Remove undefined properties to support partial updates
      const cleanedUpdateData = removeUndefinedProperties(userInput);

      // Transform and prepare data for Firestore update
      const updatedData = {
        ...cleanedUpdateData,
        ...(cleanedUpdateData.dateOfBirth && {
          dateOfBirth: convertDateToTimestamp(cleanedUpdateData.dateOfBirth),
        }),
        updatedAt: serverTimestamp(), // Always update the timestamp
      };

      await updateDoc(docRef, updatedData);

      // Verify update and retrieve the complete updated document
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

  /**
   * Deletes a user from the database
   *
   * Performs a hard delete of the user record. Does not validate
   * user existence before deletion (Firestore treats deleting
   * non-existent documents as a no-op).
   *
   * @param id - ID of user to delete
   * @returns Promise that resolves when deletion is complete
   * @throws Error if deletion operation fails
   */
  async deleteUser(id: string): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  },
};

export { db };
