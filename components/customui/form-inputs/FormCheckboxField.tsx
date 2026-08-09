import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

interface FormCheckboxFieldProps {
  name: string;
  label: React.ReactNode;
  required?: boolean;
}

export function FormCheckboxField({
  name,
  label,
  required = false,
}: FormCheckboxFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md bg-white">
          <FormControl>
            <Checkbox
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormLabel className="m-0 font-normal">
            {label}
            {required ? <span className="text-red-500 ml-1">*</span> : null}
          </FormLabel>
        </FormItem>
      )}
    />
  );
}