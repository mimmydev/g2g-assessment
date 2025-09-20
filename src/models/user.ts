import { z } from 'zod';

const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return age;
};

export const userSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name should not contain numbers or special characters'),

  email: z.string().email('Invalid email format'),

  dateOfBirth: z
    .date({
      required_error: 'Date of birth is required',
      invalid_type_error: 'Date of birth must be a valid date',
    })
    .refine(
      (date) => {
        const age = calculateAge(date);
        return age >= 1 && age <= 100;
      },
      {
        message: 'Age must be between 1 and 100 years old',
      }
    ),

  gender: z.enum(['male', 'female'], {
    required_error: 'Gender is required',
    invalid_type_error: 'Gender must be male or female',
  }),

  profilePicture: z
    .string()
    .url('Profile picture must be a valid URL')
    .optional()
    .or(z.literal('')),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userWithIdSchema = userSchema.extend({
  id: z.string().optional(),
});

export const createUserSchema = userSchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    dateOfBirth: z
      .string()
      .min(1, 'Date of birth is required')
      .refine(
        (dateString) => {
          const date = new Date(dateString);
          return !isNaN(date.getTime());
        },
        {
          message: 'Date of birth must be a valid date',
        }
      )
      .refine(
        (dateString) => {
          const date = new Date(dateString);
          const age = calculateAge(date);
          return age >= 1 && age <= 100;
        },
        {
          message: 'Age must be between 1 and 100 years old',
        }
      )
      .transform((dateString) => new Date(dateString)),

    profilePicture: z
      .string()
      .refine(
        (value) => {
          if (!value || value.trim() === '') return true;
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        {
          message: 'Profile picture must be a valid URL',
        }
      )
      .optional()
      .transform((value) => (value && value.trim() !== '' ? value : undefined)),
  });

export const updateUserSchema = createUserSchema.partial().refine(
  (data) => {
    if (data.dateOfBirth) {
      const date = new Date(data.dateOfBirth);
      const age = calculateAge(date);
      return age >= 1 && age <= 100;
    }
    return true;
  },
  {
    message: 'Age must be between 1 and 100 years old',
    path: ['dateOfBirth'],
  }
);

export type User = z.infer<typeof userSchema> & { id?: string };
export type UserWithId = z.infer<typeof userWithIdSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const;

export const formatDateForInput = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const parseDateFromInput = (dateString: string | undefined): Date => {
  if (!dateString || dateString.trim() === '') {
    return new Date('');
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return new Date('');
  }

  return date;
};

export const validateUser = (user: unknown): user is User => {
  return userSchema.safeParse(user).success;
};

export const validateUserWithId = (user: unknown): user is UserWithId => {
  return userWithIdSchema.safeParse(user).success;
};

export const validateCreateUser = (input: unknown): input is CreateUserInput => {
  return createUserSchema.safeParse(input).success;
};

export const validateUpdateUser = (input: unknown): input is UpdateUserInput => {
  return updateUserSchema.safeParse(input).success;
};

export const firestoreDocToUser = (doc: any): User => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    email: data.email,
    dateOfBirth: data.dateOfBirth.toDate(),
    gender: data.gender,
    profilePicture: data.profilePicture || '',
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};
