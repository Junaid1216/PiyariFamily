export type AccountStatus = 'active' | 'inactive';

let currentStatus: AccountStatus | null = null;

export const accountStorage = {
  getStatus: () => currentStatus,
  setStatus: (status: AccountStatus | null) => {
    currentStatus = status;
  },
  clear: () => {
    currentStatus = null;
  },
};
