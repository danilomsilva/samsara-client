import { create } from 'zustand';

export type UseSelectedRow = {
  selectedRow: string;
  setSelectedRow: (caseId: string) => void;
};

export const useSelectRow = create((set) => ({
  selectedRow: '',
  setSelectedRow: (caseId: string) =>
    set((state: UseSelectedRow) => ({
      selectedRow: state.selectedRow === caseId ? '' : caseId,
    })),
}));
