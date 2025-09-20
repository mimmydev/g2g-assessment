<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
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
  } else {
    console.error('Cannot delete user: ID is undefined');
  }
};
</script>

<template>
  <Card class="hover:shadow-lg transition-shadow duration-200 h-full">
    <CardHeader class="text-center pb-4">
      <div class="flex justify-center mb-3">
        <Avatar class="h-16 w-16">
          <AvatarImage
            v-if="user.profilePicture"
            :src="user.profilePicture"
            :alt="`${user.name}'s avatar`"
          />
          <AvatarFallback class="bg-blue-100 text-blue-600 font-medium text-lg">
            {{ userInitials }}
          </AvatarFallback>
        </Avatar>
      </div>

      <CardTitle class="text-lg font-medium text-gray-900 mb-1">
        {{ user.name }}
      </CardTitle>
      <CardDescription
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 max-w-[8em] justify-center"
      >
        {{ genderLabel }}
      </CardDescription>
    </CardHeader>

    <CardContent class="space-y-3">
      <div class="flex items-center text-sm text-gray-600">
        <Mail class="mr-2" />
        <span class="truncate">{{ user.email }}</span>
      </div>

      <div class="flex items-center text-sm text-gray-600">
        <Cake class="mr-2" />
        <span>Born {{ formattedDateOfBirth }}</span>
      </div>

      <div class="flex items-center text-sm text-gray-600">
        <Hourglass class="mr-2" />
        <span>Joined {{ formattedCreatedAt }}</span>
      </div>
    </CardContent>

    <CardFooter class="flex gap-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        @click="handleEdit"
        class="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
      >
        <Pencil />
        Edit
      </Button>

      <Button variant="destructive" size="sm" @click="handleDelete" class="flex-1 cursor-pointer">
        <Trash />
        Delete
      </Button>
    </CardFooter>
  </Card>
</template>
