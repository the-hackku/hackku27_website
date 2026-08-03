import type { FieldValues } from "react-hook-form";

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "tel"
  | "select"
  | "combobox"
  | "country"
  | "checkbox"
  | "file";

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldConfig<TValues extends FieldValues> {
  type: FieldType;
  label: string | React.ReactNode;
  placeholder?: string;
  options?: FieldOption[];
  multiselect?: boolean;
  fullWidth?: boolean;

  // Method-style signature to satisfy Biome
  renderIf?(values: Partial<TValues>): boolean;

  // Remains a property signature because it accepts a union of boolean | function
  required?: boolean | ((values: Partial<TValues>) => boolean);

  group?: string;
  className?: string;
}

export type FormConfig<TValues extends FieldValues> = {
  [K in keyof TValues]: FieldConfig<TValues>;
};
