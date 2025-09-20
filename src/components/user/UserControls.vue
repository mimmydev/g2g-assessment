<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, DownloadIcon } from 'lucide-vue-next';
import { parseDate } from '@internationalized/date';
import { GENDER_OPTIONS } from '@/models/user';
import type { User } from '@/models/user';
import type { DateValue } from 'reka-ui';
import { exportUsersToCSV } from '@/lib/csvExport';

interface Props {
  viewMode?: 'list' | 'grid';
  sortBy?: keyof User;
  sortOrder?: 'asc' | 'desc';
  genderFilter?: User['gender'] | 'all';
  searchQuery?: string;
  dateOfBirthFilter?: string;
  createdAtFilter?: string;
  updatedAtFilter?: string;
  profilePictureFilter?: 'with' | 'without' | 'all';
  users?: User[];
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'list',
  sortBy: 'name',
  sortOrder: 'asc',
  genderFilter: 'all',
  searchQuery: '',
  dateOfBirthFilter: '',
  createdAtFilter: '',
  updatedAtFilter: '',
  profilePictureFilter: 'all',
});

const emit = defineEmits<{
  'update:viewMode': [viewMode: 'list' | 'grid'];
  'update:sortBy': [sortBy: keyof User];
  'update:sortOrder': [order: 'asc' | 'desc'];
  'update:genderFilter': [gender: User['gender'] | 'all'];
  'update:searchQuery': [query: string];
  'update:dateOfBirthFilter': [date: string];
  'update:createdAtFilter': [date: string];
  'update:updatedAtFilter': [date: string];
  'update:profilePictureFilter': [filter: 'with' | 'without' | 'all'];
  sort: [sortBy: keyof User, order: 'asc' | 'desc'];
  filter: [
    filters: {
      gender: User['gender'] | 'all';
      search: string;
      dateOfBirth: string;
      createdAt: string;
      updatedAt: string;
      profilePicture: 'with' | 'without' | 'all';
    },
  ];
}>();

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'dateOfBirth', label: 'Date of Birth' },
  { value: 'gender', label: 'Gender' },
  { value: 'profilePicture', label: 'Profile Picture' },
  { value: 'createdAt', label: 'Created At' },
  { value: 'updatedAt', label: 'Updated At' },
] as const;

const sortOrderOptions = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
] as const;

const genderFilterOptions = [{ value: 'all', label: 'All Genders' }, ...GENDER_OPTIONS] as const;

const profilePictureFilterOptions = [
  { value: 'all', label: 'All Users' },
  { value: 'with', label: 'With Profile Picture' },
  { value: 'without', label: 'Without Profile Picture' },
] as const;

const handleViewModeChange = (mode: 'list' | 'grid') => {
  emit('update:viewMode', mode);
};

const handleSortByChange = (sortBy: any) => {
  const sortField = (sortBy || 'name') as keyof User;
  emit('update:sortBy', sortField);
  emit('sort', sortField, props.sortOrder);
};

const handleSortOrderChange = (order: any) => {
  const sortOrder = (order || 'asc') as 'asc' | 'desc';
  emit('update:sortOrder', sortOrder);
  emit('sort', props.sortBy, sortOrder);
};

const handleGenderFilterChange = (gender: any) => {
  const genderValue = (gender || 'all') as User['gender'] | 'all';
  emit('update:genderFilter', genderValue);
  emitAllFilters();
};

const handleDateOfBirthFilterChange = (date: string) => {
  emit('update:dateOfBirthFilter', date);
  emitAllFilters();
};

const handleCreatedAtFilterChange = (date: string) => {
  emit('update:createdAtFilter', date);
  emitAllFilters();
};

const handleUpdatedAtFilterChange = (date: string) => {
  emit('update:updatedAtFilter', date);
  emitAllFilters();
};

const handleProfilePictureFilterChange = (filter: any) => {
  const filterValue = (filter || 'all') as 'with' | 'without' | 'all';
  emit('update:profilePictureFilter', filterValue);
  emitAllFilters();
};

const handleExportCSV = () => {
  if (props.users && props.users.length > 0) {
    const filename = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
    exportUsersToCSV(props.users, filename);
  }
};

const stringToDateValue = (dateString: string): DateValue | undefined => {
  if (!dateString) return undefined;
  try {
    return parseDate(dateString);
  } catch {
    return undefined;
  }
};

const dateValueToString = (dateValue: DateValue | undefined): string => {
  if (!dateValue) return '';
  return dateValue.toString();
};

const emitAllFilters = () => {
  emit('filter', {
    gender: props.genderFilter,
    search: props.searchQuery,
    dateOfBirth: props.dateOfBirthFilter,
    createdAt: props.createdAtFilter,
    updatedAt: props.updatedAtFilter,
    profilePicture: props.profilePictureFilter,
  });
};

const currentSortLabel = computed(() => {
  return sortOptions.find((option) => option.value === props.sortBy)?.label || 'Name';
});

const currentSortOrderLabel = computed(() => {
  return sortOrderOptions.find((option) => option.value === props.sortOrder)?.label || 'Ascending';
});

const currentGenderFilterLabel = computed(() => {
  return (
    genderFilterOptions.find((option) => option.value === props.genderFilter)?.label ||
    'All Genders'
  );
});
</script>

<template>
  <div class="space-y-4 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">User Controls</h2>

      <div class="flex items-center gap-2">
        <Button
          v-if="users && users.length > 0"
          variant="outline"
          size="sm"
          class="flex items-center"
          @click="handleExportCSV"
        >
          <DownloadIcon class="h-4 w-4 mr-2" />
          Export CSV
        </Button>

        <div class="flex rounded-lg border border-gray-200 overflow-hidden">
          <Button
            :variant="viewMode === 'list' ? 'default' : 'outline'"
            size="sm"
            class="rounded-none border-0"
            @click="handleViewModeChange('list')"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            List
          </Button>
          <Button
            :variant="viewMode === 'grid' ? 'default' : 'outline'"
            size="sm"
            class="rounded-none border-0 border-l border-gray-200"
            @click="handleViewModeChange('grid')"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Grid
          </Button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Sort By</label>
        <Select :model-value="sortBy" @update:model-value="handleSortByChange">
          <SelectTrigger>
            <SelectValue :placeholder="currentSortLabel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Sort Order</label>
        <Select :model-value="sortOrder" @update:model-value="handleSortOrderChange">
          <SelectTrigger>
            <SelectValue :placeholder="currentSortOrderLabel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="option in sortOrderOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Filter by Gender</label>
        <Select :model-value="genderFilter" @update:model-value="handleGenderFilterChange">
          <SelectTrigger>
            <SelectValue :placeholder="currentGenderFilterLabel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="option in genderFilterOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Filter by Profile Picture</label>
        <Select
          :model-value="profilePictureFilter"
          @update:model-value="handleProfilePictureFilterChange"
        >
          <SelectTrigger>
            <SelectValue placeholder="All Users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="option in profilePictureFilterOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Filter by Date of Birth</label>
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" class="w-full justify-start text-left font-normal">
              <CalendarIcon class="mr-2 h-4 w-4" />
              {{ dateOfBirthFilter || 'Select date of birth' }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0" align="start">
            <Calendar
              :model-value="stringToDateValue(dateOfBirthFilter)"
              mode="single"
              :select-multiple="false"
              @update:model-value="
                (date: DateValue | undefined) =>
                  handleDateOfBirthFilterChange(dateValueToString(date))
              "
            />
          </PopoverContent>
        </Popover>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Filter by Created Date</label>
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" class="w-full justify-start text-left font-normal">
              <CalendarIcon class="mr-2 h-4 w-4" />
              {{ createdAtFilter || 'Select created date' }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0" align="start">
            <Calendar
              :model-value="stringToDateValue(createdAtFilter)"
              mode="single"
              :select-multiple="false"
              @update:model-value="
                (date: DateValue | undefined) =>
                  handleCreatedAtFilterChange(dateValueToString(date))
              "
            />
          </PopoverContent>
        </Popover>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Filter by Updated Date</label>
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" class="w-full justify-start text-left font-normal">
              <CalendarIcon class="mr-2 h-4 w-4" />
              {{ updatedAtFilter || 'Select updated date' }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0" align="start">
            <Calendar
              :model-value="stringToDateValue(updatedAtFilter)"
              mode="single"
              :select-multiple="false"
              @update:model-value="
                (date: DateValue | undefined) =>
                  handleUpdatedAtFilterChange(dateValueToString(date))
              "
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <span class="text-sm text-gray-600">Active filters:</span>

      <span
        v-if="genderFilter !== 'all'"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
      >
        Gender:
        {{ genderFilterOptions.find((opt) => opt.value === genderFilter)?.label }}
      </span>

      <span
        v-if="profilePictureFilter !== 'all'"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
      >
        Profile Picture:
        {{ profilePictureFilterOptions.find((opt) => opt.value === profilePictureFilter)?.label }}
      </span>

      <span
        v-if="dateOfBirthFilter"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
      >
        DOB: {{ dateOfBirthFilter }}
      </span>

      <span
        v-if="createdAtFilter"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
      >
        Created: {{ createdAtFilter }}
      </span>

      <span
        v-if="updatedAtFilter"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
      >
        Updated: {{ updatedAtFilter }}
      </span>

      <span
        v-if="
          genderFilter === 'all' &&
          profilePictureFilter === 'all' &&
          !dateOfBirthFilter &&
          !createdAtFilter &&
          !updatedAtFilter
        "
        class="text-sm text-gray-500"
      >
        None
      </span>
    </div>
  </div>
</template>
