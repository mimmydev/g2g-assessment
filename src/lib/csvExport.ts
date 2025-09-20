import type { User } from '../models/user';

const formatDate = (date: Date): string => {
  try {
    const isoString = date.toISOString();
    const parts = isoString.split('T');
    return parts[0] || '';
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

const escapeCsvValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const usersToCSV = (users: User[]): string => {
  const headers = [
    'Name',
    'Email',
    'Date of Birth',
    'Gender',
    'Profile Picture',
    'Created At',
    'Updated At',
    'ID',
  ];

  const headerRow = headers.map(escapeCsvValue).join(',');

  const rows = users.map((user) => {
    const values = [
      user.name,
      user.email,
      formatDate(new Date(user.dateOfBirth)),
      user.gender,
      user.profilePicture || '',
      formatDate(new Date(user.createdAt)),
      formatDate(new Date(user.updatedAt)),
      user.id || '',
    ];

    return values.map(escapeCsvValue).join(',');
  });

  return [headerRow, ...rows].join('\n');
};

export const exportUsersToCSV = (users: User[], filename = 'users.csv'): void => {
  const csvString = usersToCSV(users);

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
