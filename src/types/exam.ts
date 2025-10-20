// Exam Component Types

export interface LocationOption {
  value: string;
  label: string;
}

export interface ExamSlot {
  slotNumber: number;
  slotDate: string;
}

export interface ExamFormData {
  name: string;
  title: string;
  type: string;
  examDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  applicationLimit: number | string;
  waitingListLimit: number | string;
  location: string;
  instructions: string;
  isActive: boolean;
  slot1Date?: string;
  slot2Date?: string;
  slot3Date?: string;
}

export interface ExamOccurrenceData {
  id: string;
  type: string;
  title: string;
  examDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  applicationLimit: number;
  waitingListLimit: number;
  location: string[];
  instructions: string;
  isActive: boolean;
  exam?: {
    id: string;
    name: string;
  };
  examSlots?: ExamSlot[];
}

export interface ExamData {
  id: string;
  name: string;
  description?: string;
}

// React Select Types
export interface SelectOption {
  value: string;
  label: string;
}

export type SelectChangeHandler = (selectedOptions: SelectOption[] | null) => void;

