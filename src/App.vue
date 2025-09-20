<script setup lang="ts">
/**
 * Main application component that orchestrates the user management system.
 *
 * This component serves as the entry point and container for the application,
 * handling component orchestration, user interactions, and state management.
 */
import { onMounted, ref } from 'vue';
import UserListItem from './components/user/UserListItem.vue';
import UserGridItem from './components/user/UserGridItem.vue';
import UserControls from './components/user/UserControls.vue';
import UserForm from './components/user/UserForm.vue';
import { useUsers } from './composables/useUsers';
import { useFilteredUsers } from './composables/useFilteredUsers';
import type { User } from './models/user';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/sonner';
import 'vue-sonner/style.css';

/**
 * User management services from the application layer
 */
const { users, loading, error, fetchUsers, deleteUser } = useUsers();

/**
 * View state management
 * Controls how users are displayed (list vs grid)
 */
const viewMode = ref<'list' | 'grid'>('list');

/**
 * Sorting state management
 * Determines how the user list should be ordered
 */
const sortBy = ref<keyof User>('name');
const sortOrder = ref<'asc' | 'desc'>('asc');

/**
 * Filtering state management
 * Controls which users should be shown based on various criteria
 */
const genderFilter = ref<User['gender'] | 'all'>('all');
const dateOfBirthFilter = ref('');
const createdAtFilter = ref('');
const updatedAtFilter = ref('');
const profilePictureFilter = ref<'with' | 'without' | 'all'>('all');

/**
 * Dialog state management
 * Controls the visibility of create and edit user dialogs
 */
const isCreateDialogOpen = ref(false);
const isEditDialogOpen = ref(false);
const editingUser = ref<User | null>(null);

/**
 * Filtered users computed property
 * Uses the dedicated useFilteredUsers composable to maintain SRP
 */
const { filteredUsers: displayedUsers } = useFilteredUsers(
  users,
  {
    genderFilter,
    profilePictureFilter,
    dateOfBirthFilter,
    createdAtFilter,
    updatedAtFilter,
  },
  {
    sortBy,
    sortOrder,
  }
);

onMounted(async () => {
  await fetchUsers();
});

const handleEditUser = (user: User) => {
  editingUser.value = user;
  isEditDialogOpen.value = true;
};

const handleDeleteUser = async (userId: string) => {
  const user = users.value.find((u) => u.id === userId);
  if (user && confirm(`Are you sure you want to delete ${user.name}?`)) {
    const success = await deleteUser(userId);
    if (success) {
      console.log('✅ User deleted successfully:', user.name);
    }
  }
};

const handleCreateSuccess = async () => {
  isCreateDialogOpen.value = false;
  await fetchUsers();
};

const handleCreateClose = () => {
  isCreateDialogOpen.value = false;
};

const handleEditSuccess = async () => {
  isEditDialogOpen.value = false;
  editingUser.value = null;
  await fetchUsers();
};

const handleEditClose = () => {
  isEditDialogOpen.value = false;
  editingUser.value = null;
};

const handleFilterChange = (filters: {
  gender: User['gender'] | 'all';
  search: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
  profilePicture: 'with' | 'without' | 'all';
}) => {
  console.log('🔍 Filters changed:', filters);
};

const handleCreateDialogOpenChange = (open: boolean) => {
  isCreateDialogOpen.value = open;
  if (!open) {
    console.log('📝 Create dialog closed via overlay/escape');
  }
};

const handleEditDialogOpenChange = (open: boolean) => {
  isEditDialogOpen.value = open;
  if (!open) {
    console.log('📝 Edit dialog closed via overlay/escape');
    editingUser.value = null;
  }
};
</script>

<template>
  <div class="min-h-screen bg-background">
    <header
      class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-foreground">G2G Assessment</h1>

        <Dialog :open="isCreateDialogOpen" @update:open="handleCreateDialogOpenChange">
          <DialogTrigger as-child>
            <Button>Create New User</Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. Fill in the required information below.
              </DialogDescription>
            </DialogHeader>
            <UserForm
              :open="isCreateDialogOpen"
              @success="handleCreateSuccess"
              @close="handleCreateClose"
            />
          </DialogContent>
        </Dialog>
      </div>
    </header>

    <Dialog :open="isEditDialogOpen" @update:open="handleEditDialogOpenChange">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Modify the fields below and save your changes.
          </DialogDescription>
        </DialogHeader>
        <UserForm
          :open="isEditDialogOpen"
          :user="editingUser"
          @success="handleEditSuccess"
          @close="handleEditClose"
        />
      </DialogContent>
    </Dialog>

    <main class="container mx-auto px-4 py-6 space-y-6">
      <UserControls
        v-model:view-mode="viewMode"
        v-model:sort-by="sortBy"
        v-model:sort-order="sortOrder"
        v-model:gender-filter="genderFilter"
        v-model:date-of-birth-filter="dateOfBirthFilter"
        v-model:created-at-filter="createdAtFilter"
        v-model:updated-at-filter="updatedAtFilter"
        v-model:profile-picture-filter="profilePictureFilter"
        :users="displayedUsers"
        @filter="handleFilterChange"
      />

      <div v-if="loading" class="flex justify-center py-8">
        <div class="text-muted-foreground">Loading users...</div>
      </div>

      <div v-else-if="error" class="text-center py-8">
        <div class="text-destructive">{{ error }}</div>
      </div>

      <div v-else-if="!users.length" class="text-center py-8">
        <div class="text-muted-foreground">No users found</div>
      </div>

      <div v-else-if="!displayedUsers.length" class="text-center py-8">
        <div class="text-muted-foreground">No users match your current filters</div>
      </div>

      <div v-else>
        <div v-if="viewMode === 'list'" class="space-y-3">
          <UserListItem
            v-for="user in displayedUsers"
            :key="user.id"
            :user="user"
            @edit="handleEditUser"
            @delete="handleDeleteUser"
          />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <UserGridItem
            v-for="user in displayedUsers"
            :key="user.id"
            :user="user"
            @edit="handleEditUser"
            @delete="handleDeleteUser"
          />
        </div>
      </div>
    </main>

    <Toaster />
  </div>
</template>
