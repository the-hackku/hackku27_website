"use client";

import type * as React from "react";
import { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { FormLabel } from "@/components/ui/form";

export interface ComboboxSelectProps {
  name: string;
  label?: React.ReactNode;
  options: { label: string; value: string | number }[];
  placeholder?: string;
  required?: boolean;
  multiselect?: boolean;
}

export function ComboboxSelect({
  name,
  label,
  options,
  placeholder = "Select...",
  required,
  multiselect = false,
}: ComboboxSelectProps) {
  const { control } = useFormContext();
  const inputId = useId();
  const anchor = useComboboxAnchor();

  const normalizedOptions = options.map((opt) => ({
    label: String(opt.label),
    value: String(opt.value),
  }));

  const getOptionLabel = (val: string) =>
    normalizedOptions.find((opt) => opt.value === val)?.label ?? val;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const safeValue = multiselect
          ? Array.isArray(field.value)
            ? field.value
            : []
          : typeof field.value === "string" || typeof field.value === "number"
            ? String(field.value)
            : "";

        return (
          <div className="flex flex-col space-y-1.5">
            {label ? (
            <FormLabel>
              {label}
              {required ? <span className="text-red-500 ml-0.5">*</span> : null}
            </FormLabel>
          ) : null}

            <Combobox
              items={normalizedOptions}
              value={safeValue}
              onValueChange={(val) => {
                const newValue = val ?? (multiselect ? [] : "");
                field.onChange(newValue);
              }}
              multiple={multiselect}>
              {multiselect ? (
                <ComboboxChips ref={anchor} className="bg-white">
                  <ComboboxValue>
                    {(values: string[]) => (
                      <>
                        {values.map((val: string) => (
                          <ComboboxChip key={val} className="bg-slate-100">
                            {getOptionLabel(val)}
                          </ComboboxChip>
                        ))}
                        <ComboboxChipsInput
                          id={inputId}
                          placeholder={values.length > 0 ? "" : placeholder}
                          onBlur={field.onBlur}
                        />
                      </>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
              ) : (
                /* Attach anchor ref to a wrapper div for single-select mode */
                <div ref={anchor}>
                  <ComboboxInput
                    id={inputId}
                    placeholder={placeholder}
                    onBlur={field.onBlur}
                    className="bg-white"
                  />
                </div>
              )}

              <ComboboxContent anchor={anchor} className="bg-white">
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem
                      key={item.value}
                      value={item.value}
                      className="bg-white">
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>

            {fieldState.error ? (
              <p className="text-sm font-medium text-red-500">
                {fieldState.error.message}
              </p>
            ) : null}
          </div>
        );
      }}
    />
  );
}
