"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormInputFieldProps {
  name: string;
  label: string | React.ReactNode;
  placeholder?: string;
  required?: boolean;
  type?: string;
  autocomplete?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  formatValue?(value: string): string;
}

export function FormInputField({
  name,
  label,
  placeholder,
  required = false,
  type = "text",
  inputRef,
  formatValue,
}: FormInputFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name as string}
      render={({ field }) => (
        <FormItem className="flex-1 text-base">
          <FormLabel>
            {label}
            {required ? <span className="text-red-500 ml-0.5">*</span> : null}
          </FormLabel>
          <FormControl>
            <Input
              ref={inputRef}
              type={type}
              placeholder={placeholder}
              value={formatValue ? formatValue(field.value) : field.value || ""}
              onChange={(e) => field.onChange(e.target.value)}
              className="w-full text-base bg-white"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
