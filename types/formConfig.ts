import { ReactNode } from "react";
import { z } from "zod";

/**
 * Field type definitions for dynamic form building
 */
export type FieldType =
  | "text"
  | "number"
  | "email"
  | "file"
  | "select"
  | "combobox"
  | "checkbox"
  | "textarea";

/**
 * Option for select/combobox fields
 */
export interface FieldOption {
  label: string;
  value: string;
}

/**
 * Conditional rendering configuration
 */
export interface ConditionalRender {
  fieldName: string;
  value: string | boolean;
  negate?: boolean; // If true, shows when NOT equal to value
}

/**
 * Single form field configuration
 */
export interface FormFieldConfig {
  name: string;
  label: string | ReactNode;
  type: FieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: FieldOption[];
  multiselect?: boolean;
  allowCustomInput?: boolean;
  defaultValue?: string | number | boolean | string[];
  inputRef?: React.Ref<HTMLInputElement>;
  showWhen?: ConditionalRender; // Shows field conditionally
  validation?: z.ZodSchema; // Custom validation
}

/**
 * Form section - groups related fields
 */
export interface FormSection {
  title?: string;
  description?: string;
  fields: FormFieldConfig[];
  showWhen?: ConditionalRender;
}

/**
 * Complete form configuration
 */
export interface FormConfig {
  title: string;
  description?: ReactNode;
  sections: FormSection[];
  submitLabel?: string;
  showProgress?: boolean;
  localStorage?: {
    enabled: boolean;
    key: string;
  };
}

/**
 * Form submission callback
 */
export type FormSubmitHandler<T extends Record<string, any>> = (
  data: T
) => Promise<void>;

/**
 * Form state values
 */
export type FormValues = Record<string, any>;
