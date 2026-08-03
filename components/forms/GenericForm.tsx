import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  type DefaultValues,
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
import type { z } from "zod";
import { FormCheckboxField } from "@/components/customui/form-inputs/FormCheckboxField";
import { ComboboxSelect } from "@/components/customui/form-inputs/FormCombobox";
import { FormInputField } from "@/components/customui/form-inputs/FormInputField";
import { FormSelectField } from "@/components/customui/form-inputs/FormSelectField";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { FieldConfig, FormConfig } from "@/types/form";
import { FormCountryComboboxField } from "../customui/form-inputs/FormCountryField";
import { FormPhoneField } from "../customui/form-inputs/FormPhoneField";

interface GenericFormProps<TValues extends FieldValues> {
  schema: z.ZodType<TValues, z.ZodType>;
  config: FormConfig<TValues>;
  onSubmit: SubmitHandler<TValues>;
  defaultValues?: DefaultValues<TValues>;
  localStorageKey?: string;
  submitLabel?: string;
}

export function GenericForm<TValues extends FieldValues>({
  schema,
  config,
  onSubmit,
  defaultValues,
  localStorageKey,
  submitLabel = "Submit",
}: GenericFormProps<TValues>) {
  const [progress, setProgress] = useState(0);

  const form = useForm<TValues>({
    resolver: zodResolver(schema as never) as never,
    mode: "onChange",
    defaultValues: (defaultValues ?? {}) as DefaultValues<TValues>,
  });

  const {
    watch,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = form;
  const currentValues = watch();

  useEffect(() => {
    if (!localStorageKey) { return; }

    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<TValues>;
        const fallbacks = defaultValues ?? ({} as DefaultValues<TValues>);
        reset({ ...fallbacks, ...parsed } as DefaultValues<TValues>);
      } catch (error) {
        console.error("Failed to parse saved form data:", error);
      }
    }
  }, [localStorageKey, defaultValues, reset]);

  useEffect(() => {
    if (!localStorageKey) {
      return;
    }
    const subscription = watch((values) => {
      const savableValues = Object.fromEntries(
        Object.entries(values).filter(
          ([key]) => config[key as keyof TValues]?.type !== "file",
        ),
      );
      localStorage.setItem(localStorageKey, JSON.stringify(savableValues));
    });
    return () => subscription.unsubscribe();
  }, [watch, localStorageKey, config]);

  useEffect(() => {
    const totalFields = Object.keys(config).filter((key) => {
      const fieldConfig = config[key as keyof TValues];
      return fieldConfig.renderIf
        ? fieldConfig.renderIf(currentValues as Partial<TValues>)
        : true;
    }).length;

    const filledFields = Object.keys(config).reduce((acc, key) => {
      const val = currentValues[key as keyof TValues];
      const isVisible =
        config[key as keyof TValues].renderIf?.(
          currentValues as Partial<TValues>,
        ) ?? true;
      if (!isVisible) {
        return acc;
      }

      const hasValue =
        typeof val === "boolean"
          ? val
          : Array.isArray(val)
            ? val.length > 0
            : Boolean(val);
      return acc + (hasValue ? 1 : 0);
    }, 0);

    const calculatedProgress =
      totalFields === 0 ? 0 : Math.round((filledFields / totalFields) * 100);
    setProgress(isValid ? 100 : Math.min(calculatedProgress, 99));
  }, [currentValues, config, isValid]);

  const groupedFields = Object.entries(config).reduce(
    (acc, [key, fieldConfig]) => {
      const configItem = fieldConfig as FieldConfig<TValues>;
      const group = configItem.group || "General";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push({ key, ...configItem });
      return acc;
    },
    {} as Record<string, (FieldConfig<TValues> & { key: string })[]>,
  );

  const renderField = (key: string, fieldConfig: FieldConfig<TValues>) => {
    if (
      fieldConfig.renderIf &&
      !fieldConfig.renderIf(currentValues as Partial<TValues>)
    ) {
      return null;
    }

    const isRequired =
      typeof fieldConfig.required === "function"
        ? fieldConfig.required(currentValues as Partial<TValues>)
        : fieldConfig.required;

    const commonProps = {
      name: key,
      label: fieldConfig.label,
      placeholder: fieldConfig.placeholder,
      required: isRequired,
    };

    // Removed the `key` prop from the individual components here, 
    // as it is now being handled by the wrapper <div> in the render loop below.
    switch (fieldConfig.type) {
      case "text":
      case "number":
      case "email":
      case "file":
        return <FormInputField {...commonProps} type={fieldConfig.type} />;
      case "tel":
        return <FormPhoneField {...commonProps} />;
      case "select":
        return (
          <FormSelectField
            {...commonProps}
            options={(fieldConfig.options || []).map((opt) => ({
              ...opt,
              value: String(opt.value),
            }))}
          />
        );
      case "combobox":
        return (
          <ComboboxSelect
            {...commonProps}
            options={(fieldConfig.options || []).map((opt) => ({
              ...opt,
              value: String(opt.value),
            }))}
            multiselect={fieldConfig.multiselect}
          />
        );
      case "country":
        return <FormCountryComboboxField {...commonProps} />;
      case "checkbox":
        return <FormCheckboxField {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {Object.entries(groupedFields).map(([groupName, fields]) => {
          const hasVisibleFields = fields.some(
            (field) =>
              !field.renderIf ||
              field.renderIf(currentValues as Partial<TValues>),
          );

          if (!hasVisibleFields) {
            return null;
          }

          return (
            <div key={groupName} className="space-y-4">
              {groupName !== "General" && (
                <h2 className="text-lg font-semibold border-b pb-2">
                  {groupName}
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => {
                  const fieldComponent = renderField(field.key, field);
                  if (!fieldComponent) { return null; }
                  
                  const isFullWidth = ("fullWidth" in field && Boolean(field.fullWidth));

                  return (
                    <div 
                      key={field.key} 
                      className={isFullWidth ? "md:col-span-2" : ""}
                    >
                      {fieldComponent}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <Progress value={progress} className="flex-1 mr-4" />
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-500 text-white hover:bg-blue-600 transition">
            {/** biome-ignore lint/suspicious/noLeakedRender: submitLabel is meant to be displayed */}
            {isSubmitting ? "Submitting..." : submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}