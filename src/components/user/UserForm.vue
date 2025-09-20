<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { toTypedSchema } from '@vee-validate/zod';
import { toast } from 'vue-sonner';
import { CalendarIcon } from 'lucide-vue-next';
import { fromDate, toCalendarDate } from '@internationalized/date';
import { createUserSchema, GENDER_OPTIONS } from '@/models/user';
import type { CreateUserInput, User } from '@/models/user';
import { useUsers } from '@/composables/useUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn, formatDate } from '@/lib/utils';

interface Props {
  open?: boolean;
  user?: User | null;
}

interface Emits {
  (e: 'success'): void;
  (e: 'close'): void;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  user: null,
});

const emit = defineEmits<Emits>();

const { createUser, updateUser, loading } = useUsers();

const formRef = ref<InstanceType<typeof Form>>();

const isEditMode = computed(() => !!props.user);
const submitButtonText = computed(() => (isEditMode.value ? 'Update User' : 'Create User'));
const loadingText = computed(() => (isEditMode.value ? 'Updating...' : 'Creating...'));

const getInitialValues = () => {
  if (isEditMode.value && props.user) {
    return {
      name: props.user.name,
      email: props.user.email,
      dateOfBirth: props.user.dateOfBirth.toISOString().split('T')[0],
      gender: props.user.gender,
      profilePicture: props.user.profilePicture || '',
    };
  }

  return {
    name: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    profilePicture: '',
  };
};

const initialValues = computed(() => getInitialValues());

const initializeForm = async () => {
  if (!formRef.value) {
    console.warn('Form ref not available yet');
    return;
  }

  await nextTick();

  if (isEditMode.value && props.user) {
    const formData = {
      name: props.user.name,
      email: props.user.email,
      dateOfBirth: props.user.dateOfBirth.toISOString().split('T')[0],
      gender: props.user.gender,
      profilePicture: props.user.profilePicture || '',
    };

    formRef.value.setValues(formData);
  } else {
    formRef.value.resetForm();
  }
};

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      await nextTick();
      await nextTick();
      await initializeForm();
    }
  },
  { immediate: true }
);

watch(
  () => props.user,
  async () => {
    if (props.open) {
      await nextTick();
      await initializeForm();
    }
  },
  { immediate: true, deep: true }
);

const onSubmit = async (values: any) => {
  try {
    const userInput: CreateUserInput = {
      name: values.name,
      email: values.email,
      dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : undefined,
      gender: values.gender,
      ...(values.profilePicture && { profilePicture: values.profilePicture }),
    };

    let result;
    if (isEditMode.value && props.user && props.user.id) {
      const updateInput = { ...userInput, id: props.user.id };
      result = await updateUser(updateInput);
      if (result) {
        toast.success('User updated successfully!', {
          description: `${result.name} has been updated.`,
        });
        emit('success');
      } else {
        toast.error('Failed to update user', {
          description: 'Please try again or contact support if the problem persists.',
        });
      }
    } else {
      result = await createUser(userInput);
      if (result) {
        toast.success('User created successfully!', {
          description: `${result.name} has been added to the system.`,
        });
        emit('success');
      } else {
        toast.error('Failed to create user', {
          description: 'Please try again or contact support if the problem persists.',
        });
      }
    }
  } catch (error) {
    console.error('Error processing user:', error);
    toast.error('An unexpected error occurred', {
      description: 'Please try again later.',
    });
  }
};

const resetForm = () => {
  formRef.value?.resetForm();
};

defineExpose({
  resetForm,
});
</script>

<template>
  <Form
    ref="formRef"
    :key="`${isEditMode ? 'edit' : 'create'}-${props.user?.id || 'new'}`"
    :validation-schema="toTypedSchema(createUserSchema)"
    :initial-values="initialValues"
    @submit="onSubmit"
  >
    <div class="space-y-4">
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input type="text" placeholder="Enter full name" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" placeholder="Enter email address" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="dateOfBirth">
        <FormItem>
          <FormLabel>Date of Birth</FormLabel>
          <Popover>
            <PopoverTrigger as-child>
              <FormControl>
                <Button
                  variant="outline"
                  :class="
                    cn(
                      'w-full justify-start text-left font-normal',
                      !componentField.modelValue && 'text-muted-foreground'
                    )
                  "
                >
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{
                    formatDate(
                      componentField.modelValue ? new Date(componentField.modelValue) : null
                    )
                  }}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0" align="start">
              <Calendar
                :model-value="
                  componentField.modelValue
                    ? fromDate(new Date(componentField.modelValue), 'UTC')
                    : undefined
                "
                :default-value="fromDate(new Date(1990, 0, 1), 'UTC')"
                :max-value="fromDate(new Date(), 'UTC')"
                @update:model-value="
                  (date) => {
                    if (date && componentField['onUpdate:modelValue']) {
                      const jsDate = toCalendarDate(date).toDate('UTC');
                      const dateString = jsDate.toISOString().split('T')[0];
                      componentField['onUpdate:modelValue'](dateString);
                    }
                  }
                "
                initial-focus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="gender">
        <FormItem>
          <FormLabel>Gender</FormLabel>
          <Select
            v-model="componentField.modelValue"
            @update:model-value="
              (value) => {
                componentField['onUpdate:modelValue']?.(value);
              }
            "
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem
                v-for="option in GENDER_OPTIONS"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="profilePicture">
        <FormItem>
          <FormLabel>Profile Picture URL (Optional)</FormLabel>
          <FormControl>
            <Input type="url" placeholder="Enter profile picture URL" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <div class="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" @click="emit('close')" :disabled="loading">
          Cancel
        </Button>
        <Button type="submit" :disabled="loading">
          <span v-if="loading">{{ loadingText }}</span>
          <span v-else>{{ submitButtonText }}</span>
        </Button>
      </div>
    </div>
  </Form>
</template>
