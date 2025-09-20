import { ref, computed } from 'vue';
import { userService } from '@/service/firebase';
import type { User, CreateUserInput, UpdateUserInput } from '../models/user';

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

export const useUsers = () => {
  const userCount = computed(() => users.value.length);
  const hasUsers = computed(() => users.value.length > 0);

  /**
   * Higher-order function that wraps async operations with loading state and error handling
   *
   * This function implements the Decorator pattern to add consistent loading state
   * management and error handling to all async operations. It creates a clean
   * abstraction that eliminates repetitive try/catch/finally blocks.
   */
  const withLoadingAndError = async <T>(
    operation: () => Promise<T>,
    successMessage?: string
  ): Promise<T | null> => {
    try {
      loading.value = true;
      error.value = null;

      const result = await operation();

      if (successMessage) {
        console.log(successMessage);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      error.value = errorMessage;
      console.error('Operation failed:', errorMessage);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchUsers = async (): Promise<boolean> => {
    const result = await withLoadingAndError(async () => {
      const fetchedUsers = await userService.getUsers();
      users.value = fetchedUsers;
      return fetchedUsers;
    }, 'Users fetched successfully');

    return result !== null;
  };

  const createUser = async (userInput: CreateUserInput): Promise<User | null> => {
    const result = await withLoadingAndError(async () => {
      const newUser = await userService.createUser(userInput);
      users.value.unshift(newUser);
      return newUser;
    }, 'User created successfully');

    return result;
  };

  const updateUser = async (userInput: UpdateUserInput & { id: string }): Promise<User | null> => {
    const result = await withLoadingAndError(async () => {
      const { id, ...updateData } = userInput;
      const updatedUser = await userService.updateUser(id, updateData);

      const index = users.value.findIndex((user) => user.id === updatedUser.id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }

      return updatedUser;
    }, 'User updated successfully');

    return result;
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    const result = await withLoadingAndError(async () => {
      await userService.deleteUser(id);

      users.value = users.value.filter((user) => user.id !== id);
      return true;
    }, 'User deleted successfully');

    return result !== null;
  };

  const getUserById = async (id: string): Promise<User | null> => {
    const localUser = users.value.find((user) => user.id === id);
    if (localUser) {
      return localUser;
    }

    const result = await withLoadingAndError(async () => {
      return await userService.getUserById(id);
    });

    return result;
  };

  const refreshUsers = async (): Promise<boolean> => {
    return await fetchUsers();
  };

  const clearError = () => {
    error.value = null;
  };

  const resetState = () => {
    users.value = [];
    loading.value = false;
    error.value = null;
  };

  const filterUsersByGender = (gender: User['gender'] | 'all') => {
    if (gender === 'all') return users.value;
    return users.value.filter((user) => user.gender === gender);
  };

  const sortUsers = (sortBy: keyof User, order: 'asc' | 'desc' = 'asc') => {
    return [...users.value].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal instanceof Date && bVal instanceof Date) {
        return order === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return 0;
    });
  };

  return {
    users: computed(() => users.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    userCount,
    hasUsers,

    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    refreshUsers,

    clearError,
    resetState,

    filterUsersByGender,
    sortUsers,
  };
};
