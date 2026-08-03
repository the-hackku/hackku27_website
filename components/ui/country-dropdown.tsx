"use client";

import { countries } from "country-data-list";
import { Globe } from "lucide-react";
import { useMemo } from "react";
import { CircleFlag } from "react-circle-flags";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

export interface Country {
  alpha2: string;
  alpha3: string;
  countryCallingCodes: string[];
  currencies: string[];
  emoji?: string;
  ioc: string;
  languages: string[];
  name: string;
  status: string;
}

const defaultCountries = countries.all.filter(
  (country: Country) =>
    country.emoji && country.status !== "deleted" && country.ioc !== "PRK",
);

export interface CountryDropdownProps {
  options?: Country[];
  value?: string;
  onChange?(value: string): void;
  disabled?: boolean;
  placeholder?: string;
  slim?: boolean;
  className?: string;
}

export function CountryDropdown({
  options = defaultCountries,
  value,
  onChange,
  disabled = false,
  placeholder = "Select a country",
  slim = false,
  className,
}: CountryDropdownProps) {
  
  // Format the country data so Combobox uses the FULL NAME as its internal value.
  const countryItems = useMemo(() => {
    return options.map((c) => ({
      value: c.name, // Combobox internally relies on this being the full name
      label: c.name,
      code: c.alpha3, // We store the 3-char code strictly to emit back to your form
      alpha2: c.alpha2.toLowerCase(),
    }));
  }, [options]);

  // Find the selected country based on the 3-char code passed from your form
  const selectedCountry = countryItems.find((c) => c.code === value);

  // The Combobox display value must exactly match the `value` key in the items array
  const comboboxValue = selectedCountry?.value || "";

  // Fixes the TypeScript error by accepting string | null
  const handleValueChange = (newValue: string | null) => {
    if (!newValue) {
      onChange?.("");
      return;
    }
    // Reverse lookup: Find the country by its name, then emit its 3-char code
    const country = countryItems.find((c) => c.value === newValue);
    onChange?.(country ? country.code : "");
  };

  return (
    <div className={cn("relative w-full", slim && "w-20", className)}>
      
      {/* Absolute Flag/Globe overlay - top-0 & bottom-0 perfectly centers it vertically */}
      <div className="pointer-events-none absolute bottom-0 left-3 top-0 z-10 flex w-5 items-center justify-center">
        {selectedCountry ? (
          <div className="flex h-5 w-5 overflow-hidden rounded-full">
            <CircleFlag countryCode={selectedCountry.alpha2} height={20} />
          </div>
        ) : (
          <Globe size={18} className="text-muted-foreground" />
        )}
      </div>

      <Combobox
        items={countryItems}
        value={comboboxValue}
        onValueChange={handleValueChange}
      >
        <ComboboxInput
          placeholder={slim ? "" : placeholder}
          disabled={disabled}
          // The left padding ensures the typing cursor starts after the absolute flag overlay
          className={cn("w-full pl-10", slim && "pl-8 text-transparent")} 
        />

        <ComboboxContent>
          <ComboboxEmpty>No country found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.code} value={item.value}>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
                    <CircleFlag countryCode={item.alpha2} height={20} />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}