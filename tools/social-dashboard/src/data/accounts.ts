import type { AccountInfo, AccountType } from '../types';

export const ACCOUNTS: Record<AccountType, AccountInfo> = {
  onde: {
    id: 'onde',
    displayName: 'Onde',
    username: '@Onde_FRH',
    verified: true,
  },
  frh: {
    id: 'frh',
    displayName: 'FreeRiverHouse',
    username: '@FreeRiverHouse',
    verified: true,
  },
  magmatic: {
    id: 'magmatic',
    displayName: 'magmatic',
    username: '@magmatic__',
    verified: false,
  },
};

export const SCHEDULE: Record<AccountType, string[]> = {
  onde: ['8:08', '11:11', '22:22'],
  frh: ['9:09', '12:12', '21:21'],
  magmatic: ['17:17'],
};

export function getNextScheduledTime(account: AccountType): string {
  const times = SCHEDULE[account];
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const time of times) {
    const [hours, minutes] = time.split(':').map(Number);
    const timeMinutes = hours * 60 + minutes;
    if (timeMinutes > currentMinutes) {
      return `Today at ${time}`;
    }
  }

  // All times passed, return first time tomorrow
  return `Tomorrow at ${times[0]}`;
}
