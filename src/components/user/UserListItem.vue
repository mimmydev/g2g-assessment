<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/models/user';
import { Cake, Trash, Pencil, Mail, Hourglass } from 'lucide-vue-next';

interface Props {
  user: User;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [user: User];
  delete: [userId: string];
}>();

const userInitials = computed(() => {
  return props.user.name
    .split(' ')
    .map((name) => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const formattedDateOfBirth = computed(() => {
  return props.user.dateOfBirth.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

const formattedCreatedAt = computed(() => {
  return props.user.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

const genderLabel = computed(() => {
  return props.user.gender.charAt(0).toUpperCase() + props.user.gender.slice(1);
});

const handleEdit = () => {
  emit('edit', props.user);
};

const handleDelete = () => {
  if (props.user.id) {
    emit('delete', props.user.id);
  }
};
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4 flex-1">
        <Avatar class="h-12 w-12">
          <AvatarImage :src="user.profilePicture || ''" :alt="`${user.name}'s avatar`" />
          <AvatarFallback class="bg-blue-100 text-blue-600 font-medium">
            {{ userInitials }}
          </AvatarFallback>
        </Avatar>

        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-3">
            <h3 class="text-lg font-medium text-gray-900 truncate">
              {{ user.name }}
            </h3>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {{ genderLabel }}
            </span>
          </div>

          <div class="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
            <div class="flex items-center text-sm text-gray-500">
              <Mail class="mr-2" />
              {{ user.email }}
            </div>
            <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
              <Cake class="mr-2" />
              Born {{ formattedDateOfBirth }}
            </div>
            <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
              <Hourglass class="mr-2" />
              Joined {{ formattedCreatedAt }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-2 ml-4">
        <Button
          variant="outline"
          size="sm"
          @click="handleEdit"
          class="text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
        >
          <Pencil class="mr-2" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" @click="handleDelete" class="cursor-pointer">
          <Trash />
          Delete
        </Button>
      </div>
    </div>
  </div>
</template>
