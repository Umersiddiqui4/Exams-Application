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
} from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";


interface AktsFieldsProps {
  currentForm: any;
  selectedExamType: boolean;
  setPassportPreview: (value: string | null) => void;
  passportPreview: string | null;
  fileErrors: { [key: string]: string };
  validateFile: (file: File, fieldName: string, title?: string, attachmentId?: string) => void;
  selectedExam: any;
  attachments: any[];
  setAttachments: React.Dispatch<React.SetStateAction<any[]>>;
  attachmentUrl: string | null;
  deleteUploadedFile: (inputId: string) => Promise<void>;
  onEmailBlur?: () => void;
  onFullNameBlur?: () => void;
  onCandidateIdBlur: (candidateId: string) => void;
}




export function AktFeilds(props: AktsFieldsProps) {
  const {
    currentForm,
    selectedExamType,
    setPassportPreview,
    passportPreview,
    fileErrors,
    validateFile,
    selectedExam,
    setAttachments,
    attachments,
    deleteUploadedFile,
    onEmailBlur,
    onFullNameBlur,
    onCandidateIdBlur,
  } = props;

  const [whatsappPhone, setWhatsappPhone] = useState<string | undefined>();
  const [emergencyPhone, setEmergencyPhone] = useState<string | undefined>();
  const [whatsappError, setWhatsappError] = useState<string | null>(null);

  // Auto-set the exam date when selectedExam changes
  useEffect(() => {
    if (selectedExam && selectedExam.examSlots && selectedExam.examSlots.length > 0) {
      const examDate = new Date(selectedExam.examSlots[0].startDate);
      currentForm.setValue("examDate", examDate);
    }
  }, [selectedExam, currentForm]);
  const [emergencyError, setEmergencyError] = useState<string | null>(null);

  const handleWhatsappBlur = () => {
    if (!whatsappPhone) {
      setWhatsappError("Phone number is required");
    } else if (!isValidPhoneNumber(whatsappPhone)) {
      setWhatsappError("Invalid phone number");
    } else {
      setWhatsappError(null);
    }
  };

  const handleEmergencyBlur = () => {
    if (!emergencyPhone) {
      setEmergencyError("Phone number is required");
    } else if (!isValidPhoneNumber(emergencyPhone)) {
      setEmergencyError("Invalid phone number");
    } else {
      setEmergencyError(null);
    }
  };

  console.log("attachments", attachments);


  const removeAttachment = async (id: string) => {
    // Find the attachment to get its title for API deletion
    const attachment = attachments.find((att: any) => att.id === id);
    if (attachment) {
      // Delete from API using the title as inputId
      await deleteUploadedFile(attachment.title);
    }
    
    // Remove from local state
    setAttachments(
      attachments.filter((attachment: any) => attachment.id !== id)
    );
  };


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
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value) {
                            onCandidateIdBlur(value);
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
                          JPG, JPEG, PNG, GIF, WebP (MAX. )
                        </p>
                      </div>
                      <input
                        id="passport-image"
                        type="file"
                        className="hidden"
                        accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            validateFile(e.target.files[0], "passport-image", "passport-image");
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                {fileErrors["PASSPORT IMAGE"] && (
                  <p className="text-sm text-red-500 mt-1">{fileErrors["PASSPORT IMAGE"]}</p>
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
                            onBlur={handleEmergencyBlur}
                            onChange={(value) => {
                              field.onChange(value);
                              setEmergencyPhone(value);
                            }}
                            className="flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </FormControl>
                      <FormMessage>
                        {emergencyError && (
                          <span className="text-sm text-red-500">{emergencyError}</span>
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
                            currentForm.formState.errors.emergencyContact
                              ? "border-red-500 dark:border-red-700"
                              : ""
                          }`}
                        >
                          <PhoneInput
                            international
                            countryCallingCodeEditable={true}
                            value={field.value}
                            onBlur={handleWhatsappBlur}
                            onChange={(value) => {
                              field.onChange(value);
                              setWhatsappPhone(value);
                            }}
                            className="flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </FormControl>
                      <FormMessage>
                        {whatsappError && (
                          <span className="text-sm text-red-500">{whatsappError}</span>
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
              ELIGIBILITY<span className="text-red-500 ml-1">*</span>
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
              {!(currentForm.watch("eligibilityA") || currentForm.watch("eligibilityB") || currentForm.watch("eligibilityC")) && (
        <div className="w-full mb-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Eligibility Required
                </h3>
                <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                  <p>You must select at least one eligibility criterion to access the document upload section.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )} 
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
              EXAMINATION CENTER PREFERENCE<span className="text-red-500 ml-1">*</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
            <div className="space-y-6">
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                Please choose below the examination centre where you would like
                to take the Part 1 examination.
              </p>
              {/* <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                <strong>Note:</strong> Limited seats at each venue are available
                for the computer-based exam administered by Pearson VUE and will
                be allocated on a <strong>first come first served basis</strong>
                . Others will be accommodated in a paper-based exam administered
                by British Council.
              </p> */}

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

      {/* AKT Exam Date - Single Day Exam */}
      <Accordion
        type="single"
        collapsible
        defaultValue="exam-date"
        className="w-full mb-4"
      >
        <AccordionItem
          value="exam-date"
          className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
            <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
              <Calendar className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              EXAM DATE
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
            <div className="space-y-6">
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                The AKT examination is a single-day exam. The exam date has been scheduled as shown below.
              </p>

              {selectedExam && selectedExam.examSlots && selectedExam.examSlots.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                          Scheduled Exam Date
                        </h3>
                        <p className="text-green-700 dark:text-green-300">
                          {format(new Date(selectedExam.examSlots[0].startDate), "EEEE, MMMM do, yyyy")}
                        </p>
                        {/* <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          Time: 9:00 AM - 5:00 PM
                        </p> */}
                      </div>
                    </div>
                  </div>

                 
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    <strong>Note:</strong> No exam date has been scheduled yet. Please contact the exam administrator.
                  </p>
                </div>
              )}

              {/* <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Important:</strong> The AKT is a computer-based examination held on a single day. 
                  Please ensure you are available on the scheduled exam date.
                </p>
              </div> */}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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

                      </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Warning message when no eligibility is selected */}
      {!(currentForm.watch("eligibilityA") || currentForm.watch("eligibilityB") || currentForm.watch("eligibilityC")) && (
        <div className="w-full mb-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                      </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Eligibility Required
                </h3>
                <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                  <p>Please select at least one eligibility criterion above to proceed with document uploads.</p>
                      </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Required Documents Section - Only show if eligibility is selected */}
      {(currentForm.watch("eligibilityA") || currentForm.watch("eligibilityB") || currentForm.watch("eligibilityC")) && (
      <Accordion
        type="single"
        collapsible
          defaultValue="required-documents"
        className="w-full mb-4"
      >
        <AccordionItem
          value="required-documents"
          className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
            <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
              <Upload className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              REQUIRED DOCUMENTS
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> Based on your selected eligibility criteria, please upload the required documents. 
                  All documents should be in JPG, JPEG, PNG, or PDF format.
                </p>
              </div>

              {/* Common Documents */}
              <div className="space-y-4">
                
                {/* Signature */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Signature <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center justify-center w-full">
                    {attachments.find(att => att.title === "signature")?.attachmentUrl ? (
                      <div className="relative w-full">
                        <div className="flex flex-col items-center">
                          <img
                            src={attachments.find(att => att.title === "signature")?.attachmentUrl}
                            alt="Signature preview"
                            className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                          />
                <Button
                  type="button"
                            variant="outline"
                  size="sm"
                            onClick={() => removeAttachment(attachments.find(att => att.title === "signature")?.id || "")}
                            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                >
                            Change Document
                </Button>
              </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="signature"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" />
                          <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-semibold">Click to upload</span> signature
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            JPG, JPEG, PNG, PDF (MAX. 3MB)
                  </p>
                </div>
                        <input
                          id="signature"
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                // Check if attachment already exists
                                const existingAttachment = attachments.find(att => att.title === "signature");
                                if (!existingAttachment) {
                                  // Create new attachment
                                  const newAttachment = {
                                    id: crypto.randomUUID(),
                                    title: "signature",
                                    file: file,
                                    attachmentUrl: ""
                                  };
                                  setAttachments(prev => {
                                    const updated = [...prev, newAttachment];
                                    // Call validateFile after state is updated
                                    setTimeout(() => validateFile(file, "signature"), 0);
                                    return updated;
                                  });
                                } else {
                                  validateFile(file, "signature");
                                }
                              }
                            }}
                        />
                      </label>
                    )}
                  </div>
                  {fileErrors["SIGNATURE"] && (
                    <p className="text-sm text-red-500 mt-1">{fileErrors["SIGNATURE"]}</p>
                  )}
                </div>

                {/* Passport Bio Page */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Passport Bio Page (Valid) <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center justify-center w-full">
                    {attachments.find(att => att.title === "passport_bio_page")?.attachmentUrl ? (
                      <div className="relative w-full">
                        <div className="flex flex-col items-center">
                          <img
                            src={attachments.find(att => att.title === "passport_bio_page")?.attachmentUrl}
                            alt="Passport bio page preview"
                            className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAttachment(attachments.find(att => att.title === "passport_bio_page")?.id || "")}
                            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          >
                            Change Document
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="passport_bio_page"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" />
                          <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-semibold">Click to upload</span> passport bio page
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            JPG, JPEG, PNG, PDF (MAX. 3MB)
                          </p>
                        </div>
                        <input
                          id="passport_bio_page"
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                // Check if attachment already exists
                                const existingAttachment = attachments.find(att => att.title === "passport_bio_page");
                                if (!existingAttachment) {
                                  // Create new attachment
                                  const newAttachment = {
                                    id: crypto.randomUUID(),
                                    title: "passport_bio_page",
                                    file: file,
                                    attachmentUrl: ""
                                  };
                                  setAttachments(prev => {
                                    const updated = [...prev, newAttachment];
                                    // Call validateFile after state is updated
                                    setTimeout(() => validateFile(file, "passport_bio_page"), 0);
                                    return updated;
                                  });
                                } else {
                                  validateFile(file, "passport_bio_page");
                                }
                              }
                            }}
                        />
                      </label>
                    )}
                  </div>
                  {fileErrors["PASSPORT BIO PAGE"] && (
                    <p className="text-sm text-red-500 mt-1">{fileErrors["PASSPORT BIO PAGE"]}</p>
                  )}
                      </div>

                {/* Valid License */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Valid License <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center justify-center w-full">
                    {attachments.find(att => att.title === "valid-license")?.attachmentUrl ? (
                      <div className="relative w-full">
                        <div className="flex flex-col items-center">
                          <img
                            src={attachments.find(att => att.title === "valid-license")?.attachmentUrl}
                            alt="Valid license preview"
                            className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAttachment(attachments.find(att => att.title === "valid-license")?.id || "")}
                            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          >
                            Change Document
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="valid-license"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" />
                          <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-semibold">Click to upload</span> valid license
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            JPG, JPEG, PNG, PDF (MAX. 3MB)
                          </p>
                        </div>
                        <input
                          id="valid-license"
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                // Check if attachment already exists
                                const existingAttachment = attachments.find(att => att.title === "valid-license");
                                if (!existingAttachment) {
                                  // Create new attachment
                                  const newAttachment = {
                                    id: crypto.randomUUID(),
                                    title: "valid-license",
                                    file: file,
                                    attachmentUrl: ""
                                  };
                                  setAttachments(prev => {
                                    const updated = [...prev, newAttachment];
                                    // Call validateFile after state is updated
                                    setTimeout(() => validateFile(file, "valid-license"), 0);
                                    return updated;
                                  });
                                } else {
                                  validateFile(file, "valid-license");
                                }
                              }
                            }}
                        />
                      </label>
                    )}
                  </div>
                  {fileErrors["VALID LICENSE"] && (
                    <p className="text-sm text-red-500 mt-1">{fileErrors["VALID LICENSE"]}</p>
                  )}
                </div>

                {/* MBBS Degree */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    MBBS Degree <span className="text-red-500">*</span>
                        </Label>
                  <div className="flex items-center justify-center w-full">
                    {attachments.find(att => att.title === "mbbs-degree")?.attachmentUrl ? (
                      <div className="relative w-full">
                        <div className="flex flex-col items-center">
                          <img
                            src={attachments.find(att => att.title === "mbbs-degree")?.attachmentUrl}
                            alt="MBBS degree preview"
                            className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAttachment(attachments.find(att => att.title === "mbbs-degree")?.id || "")}
                            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          >
                            Change Document
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="mbbs-degree"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" />
                          <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-semibold">Click to upload</span> MBBS degree
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            JPG, JPEG, PNG, PDF (MAX. 3MB)
                          </p>
                        </div>
                        <input
                          id="mbbs-degree"
                            type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                // Check if attachment already exists
                                const existingAttachment = attachments.find(att => att.title === "mbbs-degree");
                                if (!existingAttachment) {
                                  // Create new attachment
                                  const newAttachment = {
                                    id: crypto.randomUUID(),
                                    title: "mbbs-degree",
                                    file: file,
                                    attachmentUrl: ""
                                  };
                                  setAttachments(prev => {
                                    const updated = [...prev, newAttachment];
                                    // Call validateFile after state is updated
                                    setTimeout(() => validateFile(file, "mbbs-degree"), 0);
                                    return updated;
                                  });
                                } else {
                                  validateFile(file, "mbbs-degree");
                                }
                              }
                            }}
                        />
                      </label>
                    )}
                  </div>
                  {fileErrors["MBBS DEGREE"] && (
                    <p className="text-sm text-red-500 mt-1">{fileErrors["MBBS DEGREE"]}</p>
                  )}
                </div>
              </div>

              {/* Case-specific Documents */}
              <div className="space-y-4">
                
                {/* Show Internship/House Job Certificate for Case A and B */}
                {(currentForm.watch("eligibilityA") || currentForm.watch("eligibilityB")) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Internship/House Job Certificate <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center justify-center w-full">
                      {attachments.find(att => att.title === "internship-certificate")?.attachmentUrl ? (
                        <div className="relative w-full">
                          <div className="flex flex-col items-center">
                            <img
                              src={attachments.find(att => att.title === "internship-certificate")?.attachmentUrl}
                              alt="Internship certificate preview"
                              className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeAttachment(attachments.find(att => att.title === "internship-certificate")?.id || "")}
                              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            >
                              Change Document
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="internship-certificate"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" />
                            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                              <span className="font-semibold">Click to upload</span> internship certificate
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              JPG, JPEG, PNG, PDF (MAX. 3MB)
                            </p>
                        </div>
                          <input
                            id="internship-certificate"
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                // Check if attachment already exists
                                const existingAttachment = attachments.find(att => att.title === "internship-certificate");
                                if (!existingAttachment) {
                                  // Create new attachment
                                  const newAttachment = {
                                    id: crypto.randomUUID(),
                                    title: "internship-certificate",
                                    file: file,
                                    attachmentUrl: ""
                                  };
                                  setAttachments(prev => {
                                    const updated = [...prev, newAttachment];
                                    // Call validateFile after state is updated
                                    setTimeout(() => validateFile(file, "internship-certificate"), 0);
                                    return updated;
                                  });
                                } else {
                                  validateFile(file, "internship-certificate");
                                }
                              }
                            }}
                          />
                        </label>
                      )}
                      </div>
                    {fileErrors["INTERNSHIP CERTIFICATE"] && (
                      <p className="text-sm text-red-500 mt-1">{fileErrors["INTERNSHIP CERTIFICATE"]}</p>
                    )}
                  </div>
                )}

                {/* Show Experience Certificate for Case B and C */}
                {(currentForm.watch("eligibilityB") || currentForm.watch("eligibilityC")) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Experience Certificate <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center justify-center w-full">
                      {attachments.find(att => att.title === "experience-certificate")?.attachmentUrl ? (
                        <div className="relative w-full">
                          <div className="flex flex-col items-center">
                            <img
                              src={attachments.find(att => att.title === "experience-certificate")?.attachmentUrl}
                              alt="Experience certificate preview"
                              className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                            />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                              onClick={() => removeAttachment(attachments.find(att => att.title === "experience-certificate")?.id || "")}
                              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        >
                              Change Document
                        </Button>
                      </div>
                    </div>
                      ) : (
                        <label
                          htmlFor="experience-certificate"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" />
                            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                              <span className="font-semibold">Click to upload</span> experience certificate
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              JPG, JPEG, PNG, PDF (MAX. 3MB)
                            </p>
                          </div>
                          <input
                            id="experience-certificate"
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                // Check if attachment already exists
                                const existingAttachment = attachments.find(att => att.title === "experience-certificate");
                                if (!existingAttachment) {
                                  // Create new attachment
                                  const newAttachment = {
                                    id: crypto.randomUUID(),
                                    title: "experience-certificate",
                                    file: file,
                                    attachmentUrl: ""
                                  };
                                  setAttachments(prev => {
                                    const updated = [...prev, newAttachment];
                                    // Call validateFile after state is updated
                                    setTimeout(() => validateFile(file, "experience-certificate"), 0);
                                    return updated;
                                  });
                                } else {
                                  validateFile(file, "experience-certificate");
                                }
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                    {fileErrors["EXPERIENCE CERTIFICATE"] && (
                      <p className="text-sm text-red-500 mt-1">{fileErrors["EXPERIENCE CERTIFICATE"]}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      )}
    </div>
  );
}
