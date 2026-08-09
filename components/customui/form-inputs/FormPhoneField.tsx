import type * as React from "react";
import { useFormContext } from "react-hook-form";
import { PhoneInput } from "@/components/customui/PhoneInput";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

interface FormPhoneFieldProps {
  name: string;
  label: string | React.ReactNode;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onChange?(value: string | null): void;
}

export function FormPhoneField({
  name,
  label,
  required = false,
  placeholder,
  disabled,
  onChange
}: FormPhoneFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1 text-base">
          {label ? (
            <FormLabel>
              {label}
              {required ? <span className="text-red-500 ml-0.5">*</span> : null}
            </FormLabel>
          ) : null}
          <FormControl>
            <PhoneInput
              {...field}
              value={field.value || ""}
              onChange={(value) => {
                field.onChange(value);
                if (onChange) {
                  onChange(value);
                }
              }}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full text-base bg-white"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
