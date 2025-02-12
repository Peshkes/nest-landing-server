
export type StatusInfo = {
  weight: number;
  name: string;
};

export const Statuses: Record<string, StatusInfo> = {
  init: { weight: 10, name: "init" },
  success: { weight: 20, name: "success" },
  pend: { weight: 30, name: "pending" },
  failed: { weight: 40, name: "failed" },
} as const;
