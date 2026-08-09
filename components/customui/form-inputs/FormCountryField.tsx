import type * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { CountryCombobox } from "../CountrySelect";

interface FormCountryComboboxFieldProps {
  name: string;
  label: string | React.ReactNode;
  required?: boolean;
  hoistedCountryCodes?: string[];
  placeholder?: string;
  disabled?: boolean;
  onChange?(value: string | null): void;
  className?: string;
}

export function FormCountryComboboxField({
  name,
  label,
  required = false,
  hoistedCountryCodes,
  placeholder,
  disabled,
  onChange,
  className,
}: FormCountryComboboxFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full flex-1">
          {label ? (
            <FormLabel>
              {label}
              {required ? <span className="text-red-500 ml-0.5">*</span> : null}
            </FormLabel>
          ) : null}
          <FormControl>
            <CountryCombobox
              {...field}
              hoistedCountryCodes={hoistedCountryCodes}
              placeholder={placeholder}
              disabled={disabled}
              className={className}
              onChange={(val) => {
                field.onChange(val);
                if (onChange) {
                  onChange(val);
                }
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
