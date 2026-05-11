"use client";

import { useMemo, useState } from "react";
import { Calendar, Car, Clock, X } from "lucide-react";

import { Button } from "@/components/ui/Button";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** yyyy-mm-dd for native <input type="date"> */
function dateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

interface FieldCaptionProps {
  children: React.ReactNode;
}

function FieldCaption({ children }: FieldCaptionProps): React.JSX.Element {
  return (
    <span className="block body-3 font-bold uppercase tracking-wide text-brand-gray-900">
      {children}
    </span>
  );
}

interface LocationFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showClear?: boolean;
}

function LocationField({
  id,
  label,
  placeholder,
  value,
  onChange,
  showClear = false,
}: LocationFieldProps): React.JSX.Element {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="cursor-pointer">
        <FieldCaption>{label}</FieldCaption>
      </label>
      <div className="relative flex items-center rounded-lg border border-brand-gray-300 bg-brand-white transition-colors focus-within:border-brand-gray-700 focus-within:ring-1 focus-within:ring-brand-gray-700">
        <Car
          className="pointer-events-none absolute left-3 h-5 w-5 text-brand-gray-500"
          aria-hidden
        />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="body-2 min-h-[2.75rem] w-full rounded-lg bg-transparent py-2.5 pr-10 pl-10 text-brand-gray-900 placeholder:text-brand-gray-500 focus:outline-none"
        />
        {showClear ? (
          <button
            type="button"
            className={`absolute right-2 rounded-md p-1 text-brand-gray-500 transition-colors hover:bg-brand-gray-50 hover:text-brand-gray-900 ${
              value ? "visible" : "invisible pointer-events-none"
            }`}
            aria-label="Clear drop-off location"
            onClick={() => onChange("")}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}

interface DateTimeFieldProps {
  labelId: string;
  caption: string;
  dateInputId: string;
  timeInputId: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}

function DateTimeField({
  labelId,
  caption,
  dateInputId,
  timeInputId,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
}: DateTimeFieldProps): React.JSX.Element {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span id={labelId}>
        <FieldCaption>{caption}</FieldCaption>
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className="flex min-h-11 divide-x divide-brand-gray-300 overflow-hidden rounded-lg border border-brand-gray-300 bg-brand-white transition-colors focus-within:border-brand-gray-700 focus-within:ring-1 focus-within:ring-brand-gray-700"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2">
          <Calendar
            className="pointer-events-none h-5 w-5 shrink-0 text-brand-gray-500"
            aria-hidden
          />
          <input
            id={dateInputId}
            type="date"
            value={dateValue}
            onChange={(e) => onDateChange(e.target.value)}
            aria-label={`${caption} — date`}
            className="body-2 min-w-0 flex-1 bg-transparent text-brand-gray-900 focus:outline-none"
          />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2">
          <Clock
            className="pointer-events-none h-5 w-5 shrink-0 text-brand-gray-500"
            aria-hidden
          />
          <input
            id={timeInputId}
            type="time"
            value={timeValue}
            onChange={(e) => onTimeChange(e.target.value)}
            aria-label={`${caption} — time`}
            className="body-2 min-w-0 flex-1 bg-transparent text-brand-gray-900 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label: string;
}

function Toggle({
  checked,
  onCheckedChange,
  label,
}: ToggleProps): React.JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className="group flex items-center gap-3 rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red-200"
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked ? "bg-brand-red-200" : "bg-brand-gray-300"
        }`}
      >
        <span
          aria-hidden
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-[1.375rem]" : "translate-x-0.5"
          }`}
        />
      </span>
      <span className="body-3 text-brand-gray-700">{label}</span>
    </button>
  );
}

export default function VehicleSearchBar(): React.JSX.Element {
  const initialDates = useMemo(() => {
    const pickup = new Date();
    const dropoff = new Date(pickup);
    dropoff.setDate(dropoff.getDate() + 2);
    return {
      pickupDate: dateInputValue(pickup),
      dropoffDate: dateInputValue(dropoff),
    };
  }, []);

  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [differentDropoff, setDifferentDropoff] = useState(false);

  const [pickupDate, setPickupDate] = useState(initialDates.pickupDate);
  const [pickupTime, setPickupTime] = useState("12:00");
  const [dropoffDate, setDropoffDate] = useState(initialDates.dropoffDate);
  const [dropoffTime, setDropoffTime] = useState("12:00");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    // Wire to search / cars API when that route exists.
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-brand-gray-100 bg-brand-white p-4 shadow-sm sm:p-6 lg:p-8"
    >
      <div
        className={`grid grid-cols-1 gap-4 sm:gap-5 ${
          differentDropoff ? "lg:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        <LocationField
          id="pickup-location"
          label="Pick-up location"
          placeholder="Enter pick-up location or zip code"
          value={pickupLocation}
          onChange={setPickupLocation}
        />

        {differentDropoff ? (
          <LocationField
            id="dropoff-location"
            label="Drop-off location"
            placeholder="Select drop-off location"
            value={dropoffLocation}
            onChange={setDropoffLocation}
            showClear
          />
        ) : null}

        <DateTimeField
          labelId="pickup-datetime-label"
          caption="Pick-up date & time"
          dateInputId="pickup-date"
          timeInputId="pickup-time"
          dateValue={pickupDate}
          timeValue={pickupTime}
          onDateChange={setPickupDate}
          onTimeChange={setPickupTime}
        />

        <DateTimeField
          labelId="dropoff-datetime-label"
          caption="Drop-off date & time"
          dateInputId="dropoff-date"
          timeInputId="dropoff-time"
          dateValue={dropoffDate}
          timeValue={dropoffTime}
          onDateChange={setDropoffDate}
          onTimeChange={setDropoffTime}
        />
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-brand-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Toggle
          checked={differentDropoff}
          onCheckedChange={(next) => {
            setDifferentDropoff(next);
            if (!next) {
              setDropoffLocation("");
            }
          }}
          label="Return to different location"
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full font-bold sm:w-auto sm:min-w-44"
        >
          Show Vehicles
        </Button>
      </div>
    </form>
  );
}
