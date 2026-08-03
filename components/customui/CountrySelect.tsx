import { countries } from "country-data-list";
import { Globe } from "lucide-react";
import type * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CircleFlag } from "react-circle-flags";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

interface CountryData {
  name: string;
  alpha2: string;
  alpha3: string;
}

const EXCLUDED_ALPHA3 = new Set<string>([
  "EUU",
  "EUR",
  "PRK",
  "ATA",
  "CXR",
  "CCK",
  "BVT",
  "HMD",
  "SGS",
  "ATF",
  "IOT",
  "PCN",
  "NFK",
  "TKL",
  "UMI",
  "SJM",
  "ALA",
  "GGL",
  "JEY",
  "IMN",
  "GIB",
  "BMU",
  "GRL",
  "FRO",
  "SPM",
  "WLF",
  "PYF",
  "NCL",
  "FLK",
  "CYM",
  "VIR",
  "VGB",
  "AIA",
  "MSR",
  "TCA",
  "ABW",
  "CUW",
  "SXM",
  "BES",
  "ASM",
  "GUM",
  "MNP",
  "PRI",
  "BLM",
  "MAF",
  "GLP",
  "MTQ",
  "MYT",
  "REU",
  "GUF",
  "ESH",
  "HKG",
  "MAC",
  "SCG",
  "YUG",
  "ANT",
  "SUN",
  "CSK",
  "NTZ",
  "CTN",
  "FXX",
  "PCH",
]);

const SANITIZED_COUNTRIES: CountryData[] = (() => {
  const rawList = Array.isArray(countries) ? countries : (countries.all ?? []);
  const seenAlpha3 = new Set<string>();
  const list: CountryData[] = [];

  for (const c of rawList) {
    if (c?.name && c.alpha2 && c.alpha3) {
      const alpha3 = c.alpha3.toUpperCase();

      if (EXCLUDED_ALPHA3.has(alpha3) || c.status === "deleted") {
        continue;
      }

      if (!seenAlpha3.has(alpha3)) {
        seenAlpha3.add(alpha3);
        list.push({
          name: c.name,
          alpha2: c.alpha2.toLowerCase(),
          alpha3,
        });
      }
    }
  }

  return list;
})();

const ALPHA3_LOOKUP_MAP = new Map<string, CountryData>(
  SANITIZED_COUNTRIES.map((country) => [country.alpha3, country]),
);

export interface CountryComboboxProps {
  value?: string;
  defaultValue?: string;
  onChange?(value: string | null): void;
  onBlur?(): void;
  name?: string;
  disabled?: boolean;
  hoistedCountryCodes?: string[];
  placeholder?: string;
  className?: string;
}

export function CountryCombobox({
  value,
  defaultValue,
  onChange,
  onBlur,
  name,
  disabled = false,
  hoistedCountryCodes = [],
  placeholder = "Select country...",
  className,
  ref: externalRef,
  ...props
}: CountryComboboxProps & { ref?: React.Ref<HTMLInputElement> }) {
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue ?? null,
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeAlpha3 =
    (value !== undefined ? value : internalValue)?.toUpperCase() ?? null;

  const selectedCountry = useMemo(() => {
    if (!activeAlpha3) {
      return null;
    }
    return ALPHA3_LOOKUP_MAP.get(activeAlpha3) ?? null;
  }, [activeAlpha3]);

  const displayCountry = isMounted ? selectedCountry : null;

  const { hoistedList, remainingList, searchResults } = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (query.length > 0) {
      const filtered = SANITIZED_COUNTRIES.filter((country) =>
        country.name.toLowerCase().includes(query),
      ).sort((a, b) => a.name.localeCompare(b.name));

      return {
        hoistedList: [],
        remainingList: [],
        searchResults: filtered,
      };
    }

    const hoistedSet = new Set<string>();
    const hoisted: CountryData[] = [];

    for (const code of hoistedCountryCodes) {
      const normalizedCode = code.toUpperCase();
      const country = ALPHA3_LOOKUP_MAP.get(normalizedCode);
      if (country && !hoistedSet.has(country.alpha3)) {
        hoistedSet.add(country.alpha3);
        hoisted.push(country);
      }
    }

    const remaining = SANITIZED_COUNTRIES.filter(
      (country) => !hoistedSet.has(country.alpha3),
    ).sort((a, b) => a.name.localeCompare(b.name));

    return {
      hoistedList: hoisted,
      remainingList: remaining,
      searchResults: [],
    };
  }, [searchValue, hoistedCountryCodes]);

  const updateSelection = (newValue: string | null) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setSearchValue(newText);

    // If the user completely deletes the input text, clear the active selection
    if (newText === "" && activeAlpha3 !== null) {
      updateSelection(null);
    }
  };

  const handleSelect = (code: string | null) => {
    const newValue = code === activeAlpha3 ? null : code;
    updateSelection(newValue);
    setSearchValue("");
    setIsFocused(false);

    if (inputRef.current) {
      inputRef.current.blur();
    } else {
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (selectedCountry && !searchValue) {
      setSearchValue(selectedCountry.name);
      requestAnimationFrame(() => {
        e.target.select();
      });
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setSearchValue("");
    if (inputRef.current) {
      inputRef.current.blur();
    }
    onBlur?.();
  };

  const setCombinedRef = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof externalRef === "function") {
      externalRef(node);
    } else if (externalRef) {
      (externalRef as React.MutableRefObject<HTMLInputElement | null>).current =
        node;
    }
  };

  const isSearching = searchValue.trim().length > 0;
  const hasResults = isSearching
    ? searchResults.length > 0
    : hoistedList.length > 0 || remainingList.length > 0;

  const showSelectedOverlay = displayCountry && !isFocused && !isSearching;

  return (
    <Combobox
      value={activeAlpha3}
      onValueChange={handleSelect}
      disabled={disabled}>
      <div className="relative flex items-center w-full">
        {/* Leading Slot */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
          {displayCountry ? (
            <CircleFlag
              countryCode={displayCountry.alpha2}
              className="size-4 shrink-0 rounded-full object-cover"
            />
          ) : (
            <Globe className="size-4 text-muted-foreground shrink-0" />
          )}
        </div>

        {/* Selected Label Overlay */}
        {showSelectedOverlay ? (
          <span className="absolute left-9 pointer-events-none text-foreground text-sm truncate z-10 max-w-[calc(100%-2.5rem)]">
            {displayCountry.name}
          </span>
        ) : null}

        {/* Input Field */}
        <ComboboxInput
          ref={setCombinedRef}
          name={name}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={searchValue}
          onChange={handleInputChange}
          placeholder={showSelectedOverlay ? "" : placeholder}
          className={`w-full pl-9 text-foreground bg-white ${className ?? ""}`}
          {...props}
        />
      </div>

      {/* Dropdown Menu */}
      <ComboboxContent className="w-full bg-white text-foreground shadow-lg border rounded-md z-50">
        <ComboboxList className="bg-white">
          {!hasResults && <ComboboxEmpty>No country found.</ComboboxEmpty>}

          {/* Filtered Search Results */}
          {isSearching &&
            searchResults.map((country) => (
              <ComboboxItem key={country.alpha3} value={country.alpha3}>
                <CircleFlag
                  countryCode={country.alpha2}
                  className="size-4 shrink-0 mr-2 rounded-full object-cover"
                />
                <span className="truncate text-foreground">{country.name}</span>
              </ComboboxItem>
            ))}

          {/* Default State */}
          {!isSearching && (
            <>
              {/* Hoisted Section */}
              {hoistedList.map((country) => (
                <ComboboxItem key={country.alpha3} value={country.alpha3}>
                  <CircleFlag
                    countryCode={country.alpha2}
                    className="size-4 shrink-0 mr-2 rounded-full object-cover"
                  />
                  <span className="truncate text-foreground">
                    {country.name}
                  </span>
                </ComboboxItem>
              ))}

              {/* Visual Separator */}
              {hoistedList.length > 0 && remainingList.length > 0 && (
                <hr className="my-1 h-px border-0 bg-border" />
              )}

              {/* Standard Alphabetical Section */}
              {remainingList.map((country) => (
                <ComboboxItem key={country.alpha3} value={country.alpha3}>
                  <CircleFlag
                    countryCode={country.alpha2}
                    className="size-4 shrink-0 mr-2 rounded-full object-cover"
                  />
                  <span className="truncate text-foreground">
                    {country.name}
                  </span>
                </ComboboxItem>
              ))}
            </>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
