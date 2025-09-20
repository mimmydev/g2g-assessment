import { computed, type Ref } from 'vue';
import type { User } from '@/models/user';

export function useFilteredUsers(
  users: Ref<User[]>,
  filterCriteria: {
    genderFilter: Ref<User['gender'] | 'all'>;
    profilePictureFilter: Ref<'with' | 'without' | 'all'>;
    dateOfBirthFilter: Ref<string>;
    createdAtFilter: Ref<string>;
    updatedAtFilter: Ref<string>;
  },
  sortCriteria: {
    sortBy: Ref<keyof User>;
    sortOrder: Ref<'asc' | 'desc'>;
  }
) {
  const filteredUsers = computed(() => {
    let result = users.value;

    // Apply gender filter
    if (filterCriteria.genderFilter.value !== 'all') {
      result = result.filter((user) => user.gender === filterCriteria.genderFilter.value);
    }

    // Apply profile picture filter
    if (filterCriteria.profilePictureFilter.value !== 'all') {
      result = result.filter((user) => {
        const hasProfilePicture = user.profilePicture && user.profilePicture.trim() !== '';
        return filterCriteria.profilePictureFilter.value === 'with'
          ? hasProfilePicture
          : !hasProfilePicture;
      });
    }

    // Apply date of birth filter
    if (filterCriteria.dateOfBirthFilter.value) {
      const filterDate = new Date(filterCriteria.dateOfBirthFilter.value);
      result = result.filter((user) => {
        const userDate = new Date(user.dateOfBirth);
        return userDate.toDateString() === filterDate.toDateString();
      });
    }

    // Apply created at filter
    if (filterCriteria.createdAtFilter.value) {
      const filterDate = new Date(filterCriteria.createdAtFilter.value);
      result = result.filter((user) => {
        const userDate = new Date(user.createdAt);
        return userDate.toDateString() === filterDate.toDateString();
      });
    }

    // Apply updated at filter
    if (filterCriteria.updatedAtFilter.value) {
      const filterDate = new Date(filterCriteria.updatedAtFilter.value);
      result = result.filter((user) => {
        const userDate = new Date(user.updatedAt);
        return userDate.toDateString() === filterDate.toDateString();
      });
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      const aVal = a[sortCriteria.sortBy.value];
      const bVal = b[sortCriteria.sortBy.value];

      if (aVal instanceof Date && bVal instanceof Date) {
        return sortCriteria.sortOrder.value === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      if (sortCriteria.sortBy.value === 'gender') {
        const aGender = a.gender as string;
        const bGender = b.gender as string;
        return sortCriteria.sortOrder.value === 'asc'
          ? aGender.localeCompare(bGender)
          : bGender.localeCompare(aGender);
      }

      if (sortCriteria.sortBy.value === 'profilePicture') {
        const aStr = (aVal as string) || '';
        const bStr = (bVal as string) || '';
        if (!aStr && !bStr) return 0;
        if (!aStr) return sortCriteria.sortOrder.value === 'asc' ? 1 : -1;
        if (!bStr) return sortCriteria.sortOrder.value === 'asc' ? -1 : 1;
        return sortCriteria.sortOrder.value === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortCriteria.sortOrder.value === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });

    return result;
  });

  return { filteredUsers };
}
