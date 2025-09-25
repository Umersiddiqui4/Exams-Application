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
import { format } from "date-fns";
import {
  Upload,
  Calendar,
  User,
  FileText,
  Shield,
  MapPin,
  Plus,
  X,
} from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";


interface AktsFieldsProps {
  currentForm: any;
  selectedExamType: boolean;
  setPassportPreview: (value: string | null) => void;
  passportPreview: string | null;
  fileError: string | null;
  validateFile: (file: File, fieldName: string, title?: string) => void;
  selectedExam: any;
  attachments: any[];
  setAttachments: React.Dispatch<React.SetStateAction<any[]>>;
  attachmentUrl: string | null;
  onEmailBlur?: () => void;
  onFullNameBlur?: () => void;
}


const genderCategory = ["Male", "Female", "Other"];


export function AktFeilds(props: AktsFieldsProps) {
  const {
    currentForm,
    selectedExamType,
    setPassportPreview,
    passportPreview,
    fileError,
    validateFile,
    selectedExam,
    setAttachments,
    attachments,
    onEmailBlur,
    onFullNameBlur,
  } = props;

  const [phone, setPhone] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const handleBlury = () => {
    if (!phone) {
      setError("Phone number is required");
    } else if (!isValidPhoneNumber(phone)) {
      setError("Invalid phone number");
    } else {
      setError(null);
    }
  };

  useEffect(() => {
    if (selectedExam && selectedExam.examSlots) {
      const allDates: Date[] = [];
      const ranges: {start: Date, end: Date, label: string}[] = [];

      selectedExam.examSlots.forEach((slot: any, index: number) => {
        if (slot.startDate && slot.endDate) {
          const startDate = new Date(slot.startDate);
          const endDate = new Date(slot.endDate);

          // Create slot range
          const slotLabel = `Slot ${index + 1}: ${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
          ranges.push({ start: startDate, end: endDate, label: slotLabel });

          // Generate all dates between start and end (inclusive)
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            allDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      });

      const uniqueDatesStr = [
        ...new Set(
          allDates
            .filter((date) => date instanceof Date && !isNaN(date.getTime()))
            .map((date) => date.toISOString().split('T')[0]) // Use date only, not time
        ),
      ];
      const uniqueDates = uniqueDatesStr.map((dateStr) => new Date(dateStr));

      uniqueDates.sort((a, b) => a.getTime() - b.getTime());

    }
  }, [selectedExam]);

  const addAttachment = () => {
    const newAttachment: any = {
      id: Date.now().toString(),
      title: "",
      file: null,
    };
    setAttachments([...attachments, newAttachment]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(
      attachments.filter((attachment: any) => attachment.id !== id)
    );
  };

  const updateAttachmentTitle = (id: string, title: string) => {
    setAttachments(
      attachments.map((attachment: any) =>
        attachment.id === id ? { ...attachment, title } : attachment
      )
    );
  };

 const updateAttachmentFile = async (id: string, file: File | null) => {
  if (!file) {
    setAttachments(prev =>
      prev.map(att =>
        att.id === id ? { ...att, file: null, attachmentUrl: "" } : att
      )
    );
    return;
  }

  // pehle file set karo (for preview, etc.)
  setAttachments(prev =>
    prev.map(att => (att.id === id ? { ...att, file } : att))
  );

  try {
    // file ko validate karo
    const attachment = attachments.find(att => att.id === id);

    const url = await validateFile(file, "attachment", attachment?.title);

   
      // ✅ URL mil gaya → direct state update
      setAttachments(prev =>
        prev.map(att =>
          att.id === id ? { ...att, attachmentUrl: url, file } : att
        )
      );
  
  } catch (err) {
    console.error("Error validating file:", err);
  }
};



console.log("Rendering AktFeilds with attachments:", attachments);

  return (
    <div>
      <Accordion
        type="single"
        collapsible
        defaultValue="personal"
        className="w-full mb-4"
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
               <FormField
                  control={currentForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>
                        E-mail <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Email"
                          type="email"
                          {...field}
                          onBlur={() => {
                            field.onBlur();
                            onEmailBlur?.();
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
              {/* Candidate ID */}
              <FormField
                control={currentForm.control}
                name="candidateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Candidate ID
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
                          onClick={() => {
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
                            validateFile(e.target.files[0], "attachment", "Passport Image");
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
                        onBlur={() => {
                          field.onBlur();
                          onFullNameBlur?.();
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
             
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={currentForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Gender <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                              currentForm.formState.errors.gender
                                ? "border-red-500 dark:border-red-700"
                                : ""
                            }`}
                          >
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                          {genderCategory.map((date: any) => (
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

                <FormField
                  control={currentForm.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Graduating School Name:{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Graduating School Name"
                          {...field}
                          className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                            currentForm.formState.errors.schoolName
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
                  name="schoolLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Graduating School Location:{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Graduating School Location"
                          {...field}
                          className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                            currentForm.formState.errors.schoolLocation
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
                  name="QualificationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Date Of Qualification:{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Select qualification date"
                          type="date"
                          value={field.value || ""}
                          onChange={(e) => {
                            const selectedDate = e.target.value;

                            // Store as ISO date string (YYYY-MM-DD format)
                            field.onChange(selectedDate);
                          }}
                          max={new Date().toISOString().split("T")[0]} // Prevent future dates
                          className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                            currentForm.formState.errors.QualificationDate
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
                {/* <FormField
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
                /> */}

                {/* No. of previous OSCE attempts */}
                <FormField
                  control={currentForm.control}
                  name="previousAktsAttempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        No. of previous AKTs attempts{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                              currentForm.formState.errors.previousAktsAttempts
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
        className="w-full mb-4"
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

      {/* Eligibility Section - Only for AKTs */}
      <Accordion
        type="single"
        collapsible
        defaultValue="eligibility"
        className="w-full mb-4"
      >
        <AccordionItem
          value="eligibility"
          className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
            <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
              <Shield className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              ELIGIBILITY
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
            <div className="space-y-6">
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                I am eligible to apply for the MRCGP[INT] South Asia Examination
                under the following criterion – please choose at least ONE:
              </p>

              <div className="space-y-4">
                <FormField
                  control={currentForm.control}
                  name="eligibilityA"
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
                          I have satisfactorily completed a structured two-year
                          training course or a two-year diploma in family
                          medicine as recognised by the MRCGP [INT] South Asia
                          Board (certificates of experience and references
                          attached).
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={currentForm.control}
                  name="eligibilityB"
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
                          I have satisfactorily completed a structured one-year
                          training programme / diploma in family medicine as
                          recognised by the MRCGP[INT] South Asia Board
                          (certificates of experience and references attached)
                          along with a further 2 years of clinical experience.
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={currentForm.control}
                  name="eligibilityC"
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
                          I have completed a minimum of five years of clinical
                          experience of which a minimum of three years has been
                          in family medicine (experience during must be in last
                          10 years).
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Examination Center Preference - Only for AKTs */}
      <Accordion
        type="single"
        collapsible
        defaultValue="center-preference"
        className="w-full mb-4"
      >
        <AccordionItem
          value="center-preference"
          className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
            <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
              <MapPin className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              EXAMINATION CENTER PREFERENCE
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
            <div className="space-y-6">
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                Please choose below the examination centre where you would like
                to take the Part 1 examination. Candidates will be assigned to
                an examination centre on the basis of availability of their
                choice, otherwise alternate centre will be offered.
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                <strong>Note:</strong> Limited seats at each venue are available
                for the computer-based exam administered by Pearson VUE and will
                be allocated on a <strong>first come first served basis</strong>
                . Others will be accommodated in a paper-based exam administered
                by British Council.
              </p>

              <FormField
                control={currentForm.control}
                name="examinationCenter"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl aria-required="true">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedExam?.location
                          ? selectedExam.location.split(', ').map((location: string) => (
                              <div
                                key={location.trim()}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  id={location.trim()}
                                  value={location.trim()}
                                  checked={field.value === location.trim()}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label
                                  htmlFor={location.trim()}
                                  className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                >
                                  {location.trim()}
                                </label>
                              </div>
                            ))
                          : null}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>NOTE:</strong> Changing your exam centre preference is
                  only possible in exceptional circumstances and subject to
                  availability. Requests after the registration closing deadline
                  may not be accommodated.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* <Accordion
        type="single"
        collapsible
        defaultValue="osce"
        className="w-full mb-4"
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
                  The AKT exam will take place over {availableDates.length} days (
                  {selectedExam ? selectedExam?.name : ""}{" "}
                  {Object.values(availableDates).map((dateStr: any) => {
                    const day = new Date(dateStr).getDate();
                    return <span key={dateStr}>{day}, </span>;
                  })}
                  ) If you have a preference (e.g. for travel purposes) for a
                  particular day, please indicate below your preferred choice:
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
                          {getAvailableDatesForField("preferenceDate1").map(
                            (date) => (
                              <SelectItem
                                key={date.toISOString()}
                                value={date.toISOString()}
                              >
                                {format(date, "MMMM d, yyyy")}
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
                          {getAvailableDatesForField("preferenceDate2").map(
                            (date) => (
                              <SelectItem
                                key={date.toISOString()}
                                value={date.toISOString()}
                              >
                                {format(date, "MMMM d, yyyy")}
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
                          {getAvailableDatesForField("preferenceDate3").map(
                            (date) => (
                              <SelectItem
                                key={date.toISOString()}
                                value={date.toISOString()}
                              >
                                {format(date, "MMMM d, yyyy")}
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
      </Accordion> */}

      <Accordion
        type="single"
        collapsible
        defaultValue="candidate-statement"
        className="w-full mb-4"
      >
        <AccordionItem
          value="candidate-statement"
          className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
            <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
              <FileText className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              CANDIDATE STATEMENT
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                  I hereby apply to sit the MRCGP [INT] South Asia Examination,
                  success in which will allow me to become an International
                  Member of the UK's Royal College of General Practitioners. I
                  have read and agree to abide by the conditions set out in the
                  MRCGP [INT] South Asia Examination Rules and Regulations as
                  published on the MRCGP [INT] South Asia website:
                  www.mrcgpintsouthasia.org
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                  I understand that success in the two modules of the South Asia
                  MRCGP [INT] examination does not automatically make me an
                  International Member of the RCGP, and that I must apply to
                  register with the RCGP as an International Member before I am
                  allowed to refer to myself as "MRCGP [INT]".
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                  I understand that "MRCGP [INT]" stands for "Member of the
                  Royal College of General Practitioners [International]" and
                  the title is subject to remaining a Member in Good Standing,
                  which involves continuing annual membership subscription and
                  adhering to the RCGP values and philosophy.
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  If accepted for International Membership, I undertake to
                  continue approved postgraduate study while I remain in active
                  general practice, and to uphold and promote the aims of the
                  College to the best of my ability.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  I attach the following:
                </p>

                <FormField
                  control={currentForm.control}
                  name="candidateStatementA"
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
                          A photocopy of my qualification, internship/house job
                          and registration documentation.
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={currentForm.control}
                  name="candidateStatementB"
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
                          One passport-size photograph.
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={currentForm.control}
                  name="candidateStatementC"
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
                          Job experience certificates / private practice
                          certificates etc to prove that you fulfil the
                          eligibility criteria.
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion
        type="single"
        collapsible
        defaultValue="experience"
        className="w-full mb-4"
      >
        <AccordionItem
          value="attachments"
          className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
            <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
              <Upload className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              ATTACHMENTS
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Add supporting documents and files
                </p>
                <Button
                  type="button"
                  onClick={addAttachment}
                  size="sm"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {attachments.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No attachments added yet</p>
                  <p className="text-sm">
                    Click the Add button to upload documents
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {attachments.map((attachment: any) => (
                  <div
                    key={attachment.id}
                    className="flex flex-col sm:flex-row gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="flex-1">
                      <Label
                        htmlFor={`title-${attachment.id}`}
                        className="text-sm font-medium"
                      >
                        Title
                      </Label>
                      <Input
                        id={`title-${attachment.id}`}
                        placeholder="Enter document title"
                        value={attachment.title}
                        onChange={(e) =>
                          updateAttachmentTitle(attachment.id, e.target.value)
                        }
                        className="mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600"
                      />
                    </div>

                    <div className="flex-1">
                      <Label
                        htmlFor={`file-${attachment.id}`}
                        className="text-sm font-medium"
                      >
                        Upload Document
                      </Label>
                      <div className="mt-1 relative">
                        <Input
                          id={`file-${attachment.id}`}
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            updateAttachmentFile(attachment.id, file);
                          }}
                          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 flex justify-center items-center  file:text-sm"
                        />
                        {attachment.file && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Selected: {attachment.file.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
