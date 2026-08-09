import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface Option<T> {
  label: string;
  value: T;
}

interface FormSelectFieldProps<T> {
  name: string;
  label: string | React.ReactNode;
  options: Option<T>[];
  required?: boolean;
  onChange?(value: T): void;
}

export function FormSelectField<T extends string>({
  name,
  label,
  options,
  required = false,
  onChange,
}: FormSelectFieldProps<T>) {
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
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                if (onChange) { onChange(value as T); }
              }}
              value={field.value || ""}>
              <SelectTrigger className="w-full bg-white">
                {field.value || "Select..."}
              </SelectTrigger>
              <SelectContent className="bg-white">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="bg-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
