import * as z from "zod"
import { formatName, formatAddress } from "../../lib/utils"





const aktsFormSchema = z.object({
  candidateId: z
    .string()
    // .length(7, "Candidate ID must be exactly 7 numbers")
    // .regex(/^\d+$/, "Candidate ID must contain only numbers")
    .optional(),
  passportImage: z.any(),
  fullName: z.string().min(2, "Full name is required").transform(formatName),
  schoolName: z.string().min(1, "School name is required").transform(formatAddress),
  schoolLocation: z.string().min(1, "School location is required").transform(formatAddress),
  QualificationDate: z.string().min(1, "Qualification date is required"),

  // Address
  poBox: z.string().min(1, "P.O. Box is required").transform(formatAddress),
  district: z.string().min(1, "District is required").transform(formatAddress),
  city: z.string().min(1, "City is required").transform(formatAddress),
  province: z.string().min(1, "Province is required").transform(formatAddress),
  country: z.string().min(1, "Country is required").transform(formatAddress),

  // Contact
  whatsapp: z.string().min(5, "WhatsApp number is required"),
  emergencyContact: z.string().min(5, "Emergency contact is required"),
  email: z.string().email("Invalid email address"),

  // Experience
  previousAktsAttempts: z.string().min(1, "Number of previous AKTs attempts is required"),

  // Experience and License
  countryOfExperience: z.string().min(1, "Country of experience is required").transform(formatAddress),
  countryOfOrigin: z.string().min(1, "Country of origin is required").transform(formatAddress),
  registrationAuthority: z.string().min(1, "Registration authority is required").transform(formatAddress),
  registrationNumber: z.string().min(1, "Registration number is required"),
  dateOfRegistration: z.date({
    required_error: "Date of registration is required",
  }),

  // AKTs Session - Single exam date
  examDate: z.date({
    required_error: "Exam date is required",
  }),

  // Eligibility (for AKTs) - At least one must be selected
  eligibilityA: z.boolean().optional(),
  eligibilityB: z.boolean().optional(),
  eligibilityC: z.boolean().optional(),

//   Examination Center Preference (for AKTs)
  examinationCenter: z.string().min(1, "Examination center is required"),

  // Candidate Statement (for AKTs)
  candidateStatementA: z.boolean().optional(),
  candidateStatementB: z.boolean().optional(),
  candidateStatementC: z.boolean().optional(),

  // Uploads
  // signature: z.any().optional(),

  // Agreement
  agreementName: z.string().optional(),
  agreementDate: z.date().optional(),
  attachments: z.array(z.any()).optional()
}).refine((data) => {
  // At least one eligibility option must be selected
  return data.eligibilityA === true || data.eligibilityB === true || data.eligibilityC === true;
}, {
  message: "Please select at least one eligibility option",
  path: ["eligibilityA"], // This will show the error on the first eligibility field
})




const formSchema = z.object({
  candidateId: z
    .string()
    .length(7, "Candidate ID must be exactly 7 numbers")
    .regex(/^\d+$/, "Candidate ID must contain only numbers"),
  passportImage: z.any(),
  fullName: z.string().min(2, "Full name is required").transform(formatName),

  // Address
  poBox: z.string().min(1, "P.O. Box is required").transform(formatAddress),
  district: z.string().min(1, "District is required").transform(formatAddress),
  city: z.string().min(1, "City is required").transform(formatAddress),
  province: z.string().min(1, "Province is required").transform(formatAddress),
  country: z.string().min(1, "Country is required").transform(formatAddress),

  // Contact
  whatsapp: z.string().min(5, "WhatsApp number is required"),
  emergencyContact: z.string().min(5, "Emergency contact is required"),
  email: z.string().email("Invalid email address"),

  // Experience
  dateOfPassingPart1: z
    .string()
    .min(1, "Date of passing Part 1 exam is required"),
  previousOsceAttempts: z
    .string()
    .min(1, "Number of previous OSCE attempts is required"),

  // Experience and License
  countryOfExperience: z.string().min(1, "Country of experience is required").transform(formatAddress),
  countryOfOrigin: z.string().min(1, "Country of origin is required").transform(formatAddress),
  registrationAuthority: z
    .string()
    .min(1, "Registration authority is required")
    .transform(formatAddress),
  registrationNumber: z.string().min(1, "Registration number is required"),
  dateOfRegistration: z.date({
    required_error: "Date of registration is required",
  }),

  // OSCE Session
  preferenceDate1: z.string().optional(),
  preferenceDate2: z.string().optional(),
  preferenceDate3: z.string().optional(),

  // Uploads
  part1PassingEmail: z.any().optional(),
  medicalLicense: z.any(),
  passportBioPage: z.any(),
  signature: z.any(),

  // Agreement
  agreementName: z.string().optional(),
  agreementDate: z.date().optional(),
  termsAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

  type FormValues = z.infer<typeof formSchema>
  type AktsFormValues = z.infer<typeof aktsFormSchema>

export { formSchema, aktsFormSchema };
export type { FormValues, AktsFormValues };


export const formDefaultValues: FormValues = {
    candidateId: "1234567",
  passportImage: undefined,
  fullName: "",
  poBox: "123 Main Street",
  district: "Central",
  city: "Karachi",
  province: "Sindh",
  country: "Pakistan",
  whatsapp: "+923001234567",
  emergencyContact: "+923001234568",
  email: "",
  dateOfPassingPart1: "",
  previousOsceAttempts: "",
  countryOfExperience: "Pakistan",
  countryOfOrigin: "Pakistan",
  registrationAuthority: "Pakistan Medical Council",
  registrationNumber: "PMC12345",
  dateOfRegistration: new Date("2020-01-01"),
  preferenceDate1: "01/01/2000",
  preferenceDate2: "01/01/2000",
  preferenceDate3: "01/01/2000",
  part1PassingEmail: undefined,
  medicalLicense: undefined,
  passportBioPage: undefined,
  signature: undefined,
  // agreementDate: new Date(),
  termsAgreed: true,
};
export const aktsFormDefaultValues: AktsFormValues = {
  candidateId: formDefaultValues.candidateId,
  passportImage: formDefaultValues.passportImage,
  fullName: formDefaultValues.fullName,
  schoolName: "Educator",
  schoolLocation: "Defence",
  QualificationDate: "12/12/2022",
   
  poBox: formDefaultValues.poBox,
  district: formDefaultValues.district,
  city: formDefaultValues.city,
  province: formDefaultValues.province,
  country: formDefaultValues.country,
  whatsapp: formDefaultValues.whatsapp,
  emergencyContact: formDefaultValues.emergencyContact,
  email: formDefaultValues.email,
  previousAktsAttempts: "0",
  countryOfExperience: formDefaultValues.countryOfExperience,
  countryOfOrigin: formDefaultValues.countryOfOrigin,
  registrationAuthority: formDefaultValues.registrationAuthority,
  registrationNumber: formDefaultValues.registrationNumber,
  dateOfRegistration: formDefaultValues.dateOfRegistration,
  examDate: new Date(),
  agreementName: formDefaultValues.agreementName,
  // agreementDate: formDefaultValues.agreementDate,
  eligibilityA: false,
  eligibilityB: false,
  eligibilityC: false,
  examinationCenter: "",
  candidateStatementA: false,
  candidateStatementB: false,
  candidateStatementC: false,
  attachments: [],
};