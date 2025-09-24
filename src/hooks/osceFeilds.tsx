import { Checkbox } from "@/components/ui/checkbox";

import { cn } from "@/lib/utils";

import { Calendar as CalendarComponent } from "@/components/ui/calendar";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  aktsFormDefaultValues,
  aktsFormSchema,
  AktsFormValues,
  formDefaultValues,
  formSchema,
  FormValues,
} from "@/components/schema/applicationSchema";
import { format } from "date-fns";
import { Upload, Calendar, User, FileText, Shield } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const part1ExamDates = [
  "AKT - November 2024",
  "AKT - May 2024",
  "AKT - November 2023",
  "AKT - May 2023",
  "AKT - November 2022",
  "AKT - June 2022",
  "AKT - January 2022",
  "AKT - June 2021",
  "AKT - September 2020",
  "AKT - November 2019",
  "AKT - May 2019",
];

const parseSlotDates = (slotString: string): Date[] => {
  // If the slot string contains a range (e.g., "2025-04-02 | 2025-04-08")
  const dates = slotString.split(" | ");

  if (dates.length === 2) {
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[1]);

    // Generate all dates between start and end (inclusive)
    const allDates: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      allDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return allDates;
  }

  // If it's not a range, just return the parsed dates
  return dates.map((dateStr) => new Date(dateStr));
};
interface OsceFieldsProps {
  currentForm: any;
  selectedExamType: boolean;
  setPassportPreview: (value: string | null) => void;
  passportPreview: string | null;
  fileError: string | null;
  validateFile: (file: File, fieldName: string) => void;
  warning: boolean;
  selectedExam: any;
  setMedicalLicensePreview: (value: string | null) => void;
  medicalLicensePreview: string | null;
  setPart1EmailPreview: (value: string | null) => void;
  part1EmailPreview: string | null;
  setPassportBioPreview: (value: string | null) => void;
  passportBioPreview: string | null;
  setSignaturePreview: (value: string | null) => void;
  signaturePreview: string | null;
  deleteUploadedFile: (inputId: string) => Promise<void>;
  onEmailBlur: () => void;
  onFullNameBlur: () => void;
}

export function OsceFeilds(props: OsceFieldsProps) {
  const {
    currentForm,
    selectedExamType,
    setPassportPreview,
    passportPreview,
    fileError,
    validateFile,
    warning,
    selectedExam,
    setMedicalLicensePreview,
    medicalLicensePreview,
    setPart1EmailPreview,
    part1EmailPreview,
    setPassportBioPreview,
    passportBioPreview,
    setSignaturePreview,
    signaturePreview,
    deleteUploadedFile,
    onEmailBlur,
    onFullNameBlur,
  } = props;
  const [phone, setPhone] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [slotOptions, setSlotOptions] = useState<{label: string, value: string}[]>([]);

  const [selectedSlots, setSelectedSlots] = useState<{
    preferenceDate1: string | null;
    preferenceDate2: string | null;
    preferenceDate3: string | null;
  }>({
    preferenceDate1: null,
    preferenceDate2: null,
    preferenceDate3: null,
  });

  const osceForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: formDefaultValues,
    shouldUnregister: false,
    mode: "onChange", // ✅ Added real-time validation
  });

  const aktsForm = useForm<AktsFormValues>({
    resolver: zodResolver(aktsFormSchema),
    defaultValues: aktsFormDefaultValues,
    shouldUnregister: false,
    mode: "onBlur", // ✅ Added real-time validation
  });

  const handleBlury = () => {
    if (!phone) {
      setError("Phone number is required");
    } else if (!isValidPhoneNumber(phone)) {
      setError("Invalid phone number");
    } else {
      setError(null);
    }
  };

  // Parse slot dates when selectedExam changes
  useEffect(() => {
    if (selectedExam) {
      const slots: {label: string, value: string}[] = [];
      const allDates: Date[] = [];

      [selectedExam.slot1, selectedExam.slot2, selectedExam.slot3].forEach((slotStr, index) => {
        if (slotStr) {
          const dates = parseSlotDates(slotStr);
          if (dates.length >= 2) {
            const startDate = dates[0];
            const endDate = dates[dates.length - 1];
            const slotLabel = `Slot ${index + 1}: ${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
            slots.push({ label: slotLabel, value: index.toString() });
            allDates.push(...dates);
          }
        }
      });

      // Combine all dates and remove duplicates
      const uniqueDatesStr = [
        ...new Set(
          allDates
            .filter((date) => date instanceof Date && !isNaN(date.getTime()))
            .map((date) => date.toISOString())
        ),
      ];
      const uniqueDates = uniqueDatesStr.map((dateStr) => new Date(dateStr));

      // Sort dates in ascending order
      uniqueDates.sort((a, b) => a.getTime() - b.getTime());

      setAvailableDates(uniqueDates);
      setSlotOptions(slots);
    }
  }, [selectedExam]);
  // Get available slots for a specific field (excluding slots selected in other fields)
  const getAvailableSlotsForField = (
    fieldName: "preferenceDate1" | "preferenceDate2" | "preferenceDate3"
  ) => {
    return slotOptions.filter((slot) => {
      // Check if this slot is selected in another field
      for (const [field, selectedSlot] of Object.entries(selectedSlots)) {
        if (field !== fieldName && selectedSlot === slot.value) {
          return false;
        }
      }
      return true;
    });
  };

  useEffect(() => {
    const activeForm = selectedExamType ? aktsForm : osceForm;

    // 👇 Yeh watch function callback ke sath hai, so it's a Subscription
    const subscription = activeForm.watch((value) => {
      setSelectedSlots({
        preferenceDate1: value.preferenceDate1 || null,
        preferenceDate2: value.preferenceDate2 || null,
        preferenceDate3: value.preferenceDate3 || null,
      });
    });

    // ✅ Clean up safely
    return () => {
      if (
        typeof subscription === "object" &&
        subscription !== null &&
        "unsubscribe" in subscription
      ) {
        subscription.unsubscribe();
      }
    };
  }, [selectedExamType]);

  return (
    <div>
      <Accordion
        type="single"
        collapsible
        defaultValue="personal"
        className="w-full"
      >
        <AccordionItem
          value="personal"
          className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
            <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
              <User className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              PERSONAL AND CONTACT INFORMATION
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
            <div className="space-y-6">
              {/* Candidate ID */}
               <FormField
                  control={currentForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>
                        E-mail {" "}<span className="text-red-500">*</span>
                      </FormLabel>
                      {/* <FormDescription>
                                  Please provide valid personal email address that you regularly check, as most
                                  correspondence and important announcements are communicated to candidates by email.
                                </FormDescription> */}
                      <FormControl>
                        <Input
                          placeholder="Enter Email"
                          type="email"
                          {...field}
                          onBlur={(e) => {
                            // Trigger application creation check when email loses focus
                            const emailValue = e.target.value.trim();
                            if (emailValue && !currentForm.formState.errors.email) {
                              onEmailBlur();
                            }
                          }}
                          className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                            currentForm.formState.errors.email
                              ? "border-red-500 dark:border-red-700"
                              : ""
                          }`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={currentForm.control}
                name="candidateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Candidate ID{" "}
                      {!selectedExamType && (
                        <span className="text-red-500">*</span>
                      )}
                      {selectedExamType && (
                        <span className="text-slate-500">
                          (Optional for AKTs)
                        </span>
                      )}
                    </FormLabel>
                    <FormDescription>
                      Please quote it in all correspondence.
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="e.g. 1234567"
                        {...field}
                        maxLength={7}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 7) {
                            field.onChange(value);
                          }
                        }}
                        className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                          currentForm.formState.errors.candidateId
                            ? "border-red-500 dark:border-red-700"
                            : ""
                        }`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Passport Image */}
              <div className="space-y-2">
                <FormLabel className="text-base font-medium">
                  Passport Size image:
                </FormLabel>
                <div className="flex items-center justify-center w-full">
                  {passportPreview ? (
                    <div className="relative w-full">
                      <div className="flex flex-col items-center">
                        <img
                          src={passportPreview || "/placeholder.svg"}
                          alt="Passport preview"
                          className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await deleteUploadedFile("passport-image");
                            setPassportPreview(null);
                            const fileInput = document.getElementById(
                              "passport-image"
                            ) as HTMLInputElement;
                            if (fileInput) fileInput.value = "";
                          }}
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        >
                          Change Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="passport-image"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" />
                        <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          PNG, JPG (MAX. 2MB)
                        </p>
                      </div>
                      <input
                        id="passport-image"
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            validateFile(e.target.files[0], "passport-image");
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                {fileError && (
                  <p className="text-sm text-red-500 mt-1">{fileError}</p>
                )}
              </div>

              {/* Full Name */}

              <FormField
                control={currentForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Full name as you would like it to appear on record{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Full Name"
                        {...field}
                        onBlur={(e) => {
                          // Trigger application creation check when full name loses focus
                          const fullNameValue = e.target.value.trim();
                          if (fullNameValue && !currentForm.formState.errors.fullName) {
                            onFullNameBlur();
                          }
                        }}
                        className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                          currentForm.formState.errors.fullName
                            ? "border-red-500 dark:border-red-700"
                            : ""
                        }`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Residential Address */}
              <div className="space-y-4">
                <h3 className="text-base font-medium">Residential Address</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={currentForm.control}
                    name="poBox"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          House no. and street or P.O.Box:{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter P.O.Box"
                            {...field}
                            className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                              currentForm.formState.errors.poBox
                                ? "border-red-500 dark:border-red-700"
                                : ""
                            }`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={currentForm.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          District: <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter District"
                            {...field}
                            className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                              currentForm.formState.errors.district
                                ? "border-red-500 dark:border-red-700"
                                : ""
                            }`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={currentForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          City / Town / Village:{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter City / Town / Village"
                            {...field}
                            className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                              currentForm.formState.errors.city
                                ? "border-red-500 dark:border-red-700"
                                : ""
                            }`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={currentForm.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Province / Region:{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Province / Region"
                            {...field}
                            className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                              currentForm.formState.errors.province
                                ? "border-red-500 dark:border-red-700"
                                : ""
                            }`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={currentForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Country: <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Country"
                            {...field}
                            className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                              currentForm.formState.errors.country
                                ? "border-red-500 dark:border-red-700"
                                : ""
                            }`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Details */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={currentForm.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        WhatsApp number: <span className="text-red-500">*</span>
                      </FormLabel>
                      {/* <FormDescription>In full international format</FormDescription> */}
                      <FormControl>
                        <div
                          className={`bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 ${
                            currentForm.formState.errors.whatsapp
                              ? "border-red-500 dark:border-red-700"
                              : ""
                          }`}
                        >
                          <PhoneInput
                            international
                            countryCallingCodeEditable={true}
                            value={field.value}
                            onBlur={handleBlury}
                            onChange={(value) => {
                              field.onChange(value);
                              setPhone(value);
                            }}
                            className="flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </FormControl>
                      <FormMessage>
                        {error && (
                          <span className="text-sm text-red-500">{error}</span>
                        )}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={currentForm.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Emergency contact number{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      {/* <FormDescription>In full international format</FormDescription> */}
                      <FormControl>
                        <div
                          className={`bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 ${
                            currentForm.formState.errors.whatsapp
                              ? "border-red-500 dark:border-red-700"
                              : ""
                          }`}
                        >
                          <PhoneInput
                            international
                            countryCallingCodeEditable={true}
                            value={field.value}
                            onBlur={handleBlury}
                            onChange={(value) => {
                              field.onChange(value);
                              setPhone(value);
                            }}
                            className="flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </FormControl>
                      <FormMessage>
                        {error && (
                          <span className="text-sm text-red-500">{error}</span>
                        )}
                      </FormMessage>
                    </FormItem>
                  )}
                />

               
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date of passing Part 1 exam */}
                <FormField
                  control={currentForm.control}
                  name="dateOfPassingPart1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Date of passing Part 1 exam{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                              currentForm.formState.errors.dateOfPassingPart1
                                ? "border-red-500 dark:border-red-700"
                                : ""
                            }`}
                          >
                            <SelectValue placeholder="Select date" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                          {part1ExamDates.map((date) => (
                            <SelectItem
                              key={date}
                              value={date}
                              className="dark:text-slate-200 dark:focus:bg-slate-700"
                            >
                              {date}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* No. of previous OSCE attempts */}

                <FormField
                  control={currentForm.control}
                  name="previousOsceAttempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        No. of previous OSCE attempts{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                              currentForm.formState.errors.previousOsceAttempts
                                ? "border-red-500 dark:border-red-700"
                                : ""
                            }`}
                          >
                            <SelectValue placeholder="Select number" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                          <SelectItem
                            value="0"
                            className="dark:text-slate-200 dark:focus:bg-slate-700"
                          >
                            0
                          </SelectItem>
                          <SelectItem
                            value="1"
                            className="dark:text-slate-200 dark:focus:bg-slate-700"
                          >
                            1
                          </SelectItem>
                          <SelectItem
                            value="2"
                            className="dark:text-slate-200 dark:focus:bg-slate-700"
                          >
                            2
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Experience and License Details */}
      <Accordion
        type="single"
        collapsible
        defaultValue="experience"
        className="w-full"
      >
        <AccordionItem
          value="experience"
          className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
            <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
              <FileText className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              EXPERIENCE AND LICENSE DETAILS
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={currentForm.control}
                  name="countryOfExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Country of postgraduate clinical experience:{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter country of postgraduate clinical experience"
                          {...field}
                          className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                            currentForm.formState.errors.countryOfExperience
                              ? "border-red-500 dark:border-red-700"
                              : ""
                          }`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={currentForm.control}
                  name="countryOfOrigin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Country of ethnic origin{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Country of ethnic origin"
                          {...field}
                          className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                            currentForm.formState.errors.countryOfOrigin
                              ? "border-red-500 dark:border-red-700"
                              : ""
                          }`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={currentForm.control}
                  name="registrationAuthority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Registration authority{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Registration authority"
                          {...field}
                          className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                            currentForm.formState.errors.registrationAuthority
                              ? "border-red-500 dark:border-red-700"
                              : ""
                          }`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={currentForm.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Registration number{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Registration number"
                          {...field}
                          className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                            currentForm.formState.errors.registrationNumber
                              ? "border-red-500 dark:border-red-700"
                              : ""
                          }`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={currentForm.control}
                  name="dateOfRegistration"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        Date of full registration{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>dd/mm/yyyy</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 dark:bg-slate-800 dark:border-slate-700"
                          align="start"
                        >
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            className="dark:bg-slate-800"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* OSCE Session */}
      <Accordion
        type="single"
        collapsible
        defaultValue="osce"
        className="w-full"
      >
        <AccordionItem
          value="osce"
          className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
            <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
              <Calendar className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              {selectedExamType ? "AKTs SESSION" : "OSCE SESSION"}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-md border border-indigo-100 dark:border-indigo-800">
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  The {selectedExamType ? "AKT" : "OSCE"} exam will take place in the following slots (
                  {selectedExam ? selectedExam?.name : ""}{" "}
                  {slotOptions.map((slot, index) => (
                    <span key={slot.value}>
                      {slot.label}
                      {index < slotOptions.length - 1 ? ", " : ""}
                    </span>
                  ))}
                  ). If you have a preference (e.g. for travel purposes) for a
                  particular slot, please indicate below your preferred choice:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={currentForm.control}
                  name="preferenceDate1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preference Date 1</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger
                            className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500`}
                          >
                            <SelectValue placeholder="Select a date" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                          <SelectItem key="" value={" "}>
                            None
                          </SelectItem>
                          {getAvailableSlotsForField("preferenceDate1").map(
                            (slot) => (
                              <SelectItem
                                key={slot.value}
                                value={slot.value}
                              >
                                {slot.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={currentForm.control}
                  name="preferenceDate2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preference Date 2</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger
                            className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 `}
                          >
                            <SelectValue placeholder="Select a date" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                          <SelectItem key="" value={" "}>
                            None
                          </SelectItem>
                          {getAvailableSlotsForField("preferenceDate2").map(
                            (slot) => (
                              <SelectItem
                                key={slot.value}
                                value={slot.value}
                              >
                                {slot.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={currentForm.control}
                  name="preferenceDate3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preference Date 3</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger
                            className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500`}
                          >
                            <SelectValue placeholder="Select a date" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                          <SelectItem key="" value={" "}>
                            None
                          </SelectItem>
                          {getAvailableSlotsForField("preferenceDate3").map(
                            (slot) => (
                              <SelectItem
                                key={slot.value}
                                value={slot.value}
                              >
                                {slot.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-100 dark:border-amber-800">
                <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                  PLEASE NOTE
                </h4>
                <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                  <li>
                    The number of seats are limited and slots will be allocated
                    on the "First Come First Served" basis.
                  </li>
                  <li>
                    Whilst we will try to accommodate your preference, it may
                    not be possible due to a large number of applicants.
                  </li>
                  <li>
                    Please email us well in advance if you require a letter of
                    invitation for visa purposes and make sure you complete all
                    travel formalities in good time (visa applications, travel
                    permits, leaves, etc.) No Refunds will be granted in case
                    any candidate fails to get the visa prior to the exam date.
                  </li>
                  <li>
                    Candidates with a disability are requested to read the rules
                    and regulation document [Page 10] available on the website.
                  </li>
                  <li>
                    The MRCGP [INT.] South Asia Secretariat will notify you by
                    email of your allocated date and time at least four weeks
                    before the exam starting date. [It is advised to make your
                    travel arrangements once you receive this email]
                  </li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Candidate's Statement */}
      {!selectedExamType && (
        <Accordion
          type="single"
          collapsible
          defaultValue="statement"
          className="w-full"
        >
          <AccordionItem
            value="statement"
            className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
          >
            <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
              <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
                <Shield className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                CANDIDATE'S STATEMENT
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                    I hereby apply to sit the South Asia MRCGP [INT.] Part 2
                    (OSCE) Examination, success in which will allow me to apply
                    for International Membership of the UK's Royal College of
                    General Practitioners. Detailed information on the
                    membership application process can be found on the RCGP
                    website:{" "}
                    <a
                      href="#"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Member Ship
                    </a>
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                    I have read and agree to abide by the conditions set out in
                    the South Asia MRCGP [INT.] Examination Rules and
                    Regulations as published on the MRCGP [INT.] South Asia
                    website:{" "}
                    <a
                      href="http://www.mrcgpintsouthasia.org"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      www.mrcgpintsouthasia.org
                    </a>{" "}
                    If accepted for International Membership, I undertake to
                    continue approved postgraduate study while I remain in
                    active general practice/family practice, and to uphold and
                    promote the aims of the RCGP to the best of my ability.
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                    I understand that, on being accepted for International
                    Membership, an annual subscription fee is to be payable to
                    the RCGP. I understand that only registered International
                    Members who maintain their RCGP subscription are entitled to
                    use the post-nominal designation "MRCGP [INT]". Success in
                    the exam does not give me the right to refer to myself as
                    MRCGP [INT.].
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    I also understand and agree that my personal data will be
                    handled by the MRCGP [INT.] South Asia Board and I also give
                    permission for my personal data to be handled by the
                    regional MRCGP [INT.] South Asia co-ordinators.
                  </p>
                </div>
                <FormField
                  control={currentForm.control}
                  name="termsAgreed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          I agree to the terms and conditions{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormDescription className="text-xs">
                          By checking this box, I confirm that I have read and
                          agree to the statements above.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* File Uploads */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">
                      Required Documents
                    </h3>

                    <div className="space-y-2">
                      <FormLabel>
                        Valid Medical license: (Use .png or .jpg only){" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="flex items-center justify-center w-full">
                        {medicalLicensePreview ? (
                          <div className="relative w-full">
                            <div className="flex flex-col items-center">
                              <img
                                src={
                                  medicalLicensePreview ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg"
                                }
                                alt="Medical license preview"
                                className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  await deleteUploadedFile("medical-license");
                                  setMedicalLicensePreview(null);
                                  const fileInput = document.getElementById(
                                    "medical-license"
                                  ) as HTMLInputElement;
                                  if (fileInput) fileInput.value = "";
                                }}
                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                              >
                                Change Image
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="medical-license"
                            className={
                              warning ||
                              currentForm.formState.errors.medicalLicense
                                ? "border-red-500 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                                : "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }
                          >
                            <div
                              className={`flex flex-col items-center justify-center pt-5 pb-6 `}
                            >
                              <Upload className="w-6 h-6 mb-1 text-slate-500 dark:text-slate-400" />
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                <span className={`font-semibold`}>
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </p>
                            </div>
                            <input
                              id="medical-license"
                              type="file"
                              className="hidden"
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  validateFile(
                                    e.target.files[0],
                                    "medical-license"
                                  );
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <FormLabel>
                        Part I passing email: (Use .png or .jpg only)
                      </FormLabel>
                      <div className="flex items-center justify-center w-full">
                        {part1EmailPreview ? (
                          <div className="relative w-full">
                            <div className="flex flex-col items-center">
                              <img
                                src={
                                  part1EmailPreview ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg"
                                }
                                alt="Part I passing email preview"
                                className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  await deleteUploadedFile("part1-email");
                                  setPart1EmailPreview(null);
                                  const fileInput = document.getElementById(
                                    "part1-email"
                                  ) as HTMLInputElement;
                                  if (fileInput) fileInput.value = "";
                                }}
                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                              >
                                Change Image
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="part1-email"
                            className={
                              "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 "
                            }
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-6 h-6 mb-1 text-slate-500 dark:text-slate-400" />
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </p>
                            </div>
                            <input
                              id="part1-email"
                              type="file"
                              className="hidden"
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  validateFile(
                                    e.target.files[0],
                                    "part1-email"
                                  );
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-medium">&nbsp;</h3>

                    <div className="space-y-2">
                      <FormLabel>
                        Passport bio Page (Valid): (Use .png or .jpg only){" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="flex items-center justify-center w-full">
                        {passportBioPreview ? (
                          <div className="relative w-full">
                            <div className="flex flex-col items-center">
                              <img
                                src={
                                  passportBioPreview ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg"
                                }
                                alt="Passport bio page preview"
                                className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  await deleteUploadedFile("passport-bio");
                                  setPassportBioPreview(null);
                                  const fileInput = document.getElementById(
                                    "passport-bio"
                                  ) as HTMLInputElement;
                                  if (fileInput) fileInput.value = "";
                                }}
                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                              >
                                Change Image
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="passport-bio"
                            className={
                              warning ||
                              currentForm.formState.errors.medicalLicense
                                ? "border-red-500 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                                : "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-6 h-6 mb-1 text-slate-500 dark:text-slate-400" />
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </p>
                            </div>
                            <input
                              id="passport-bio"
                              type="file"
                              className="hidden"
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  validateFile(
                                    e.target.files[0],
                                    "passport-bio"
                                  );
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <FormLabel>
                        Signature: (Use .png or .jpg only){" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="flex items-center justify-center w-full">
                        {signaturePreview ? (
                          <div className="relative w-full">
                            <div className="flex flex-col items-center">
                              <img
                                src={signaturePreview || "/placeholder.svg"}
                                alt="Signature preview"
                                className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  await deleteUploadedFile("signature");
                                  setSignaturePreview(null);
                                  const fileInput = document.getElementById(
                                    "signature"
                                  ) as HTMLInputElement;
                                  if (fileInput) fileInput.value = "";
                                }}
                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                              >
                                Change Image
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="signature"
                            className={
                              warning ||
                              currentForm.formState.errors.medicalLicense
                                ? "border-red-500 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                                : "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-6 h-6 mb-1 text-slate-500 dark:text-slate-400" />
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </p>
                            </div>
                            <input
                              id="signature"
                              type="file"
                              className="hidden"
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  validateFile(e.target.files[0], "signature");
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={currentForm.control}
                      name="agreementName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name: </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter Full name"
                              {...field}
                              className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={currentForm.control}
                      name="agreementDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>
                            Date: <span className="text-red-500">*</span>
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? format(field.value, "PPP")
                                    : format(new Date(), "PPP")}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 dark:bg-slate-800 dark:border-slate-700"
                              align="start"
                            >
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                                className="dark:bg-slate-800"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
