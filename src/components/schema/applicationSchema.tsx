import * as z from "zod"





const aktsFormSchema = z.object({
  candidateId: z
    .string()
    // .length(7, "Candidate ID must be exactly 7 numbers")
    // .regex(/^\d+$/, "Candidate ID must contain only numbers")
    .optional(),
  passportImage: z.any(),
  fullName: z.string().min(2, "Full name is required"),
  gender: z.string().min(1, "Gender is required"),
  schoolName: z.string().min(1, "School name is required"),
  schoolLocation: z.string().min(1, "School location is required"),
  QualificationDate: z.string().min(1, "Qualification date is required"),

  // Address
  poBox: z.string().min(1, "P.O. Box is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  country: z.string().min(1, "Country is required"),

  // Contact
  whatsapp: z.string().min(5, "WhatsApp number is required"),
  emergencyContact: z.string().min(5, "Emergency contact is required"),
  email: z.string().email("Invalid email address"),

  // Experience
  dateOfPassingPart1: z.string().min(1, "Date of passing Part 1 exam is required"),
  previousAktsAttempts: z.string().min(1, "Number of previous AKTs attempts is required"),

  // Experience and License
  countryOfExperience: z.string().min(1, "Country of experience is required"),
  countryOfOrigin: z.string().min(1, "Country of origin is required"),
  registrationAuthority: z.string().min(1, "Registration authority is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  dateOfRegistration: z.date({
    required_error: "Date of registration is required",
  }),

  // AKTs Session
  preferenceDate1: z.string().optional(),
  preferenceDate2: z.string().optional(),
  preferenceDate3: z.string().optional(),

  // Eligibility (for AKTs)
  eligibilityA: z.boolean().optional(),
  eligibilityB: z.boolean().optional(),
  eligibilityC: z.boolean().optional(),

//   Examination Center Preference (for AKTs)
  examinationCenter: z.string().optional(),

  // Candidate Statement (for AKTs)
  candidateStatementA: z.boolean().optional(),
  candidateStatementB: z.boolean().optional(),
  candidateStatementC: z.boolean().optional(),

  // Uploads
  // signature: z.any().optional(),

  // Agreement
  agreementName: z.string().optional(),
  agreementDate: z.date({
    required_error: "Date is required",
  }),
  attachments: z.array(z.any()).optional()
})




const formSchema = z.object({
  candidateId: z
    .string()
    .length(7, "Candidate ID must be exactly 7 numbers")
    .regex(/^\d+$/, "Candidate ID must contain only numbers"),
  passportImage: z.any().optional(),
  fullName: z.string().min(2, "Full name is required"),

  // Address
  poBox: z.string().min(1, "P.O. Box is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  country: z.string().min(1, "Country is required"),

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
  countryOfExperience: z.string().min(1, "Country of experience is required"),
  countryOfOrigin: z.string().min(1, "Country of origin is required"),
  registrationAuthority: z
    .string()
    .min(1, "Registration authority is required"),
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
  agreementDate: z.date({
    required_error: "Date is required",
  }),
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
  dateOfPassingPart1: "AKT - November 2024",
  previousOsceAttempts: "1",
  countryOfExperience: "Pakistan",
  countryOfOrigin: "Pakistan",
  registrationAuthority: "Pakistan Medical Council",
  registrationNumber: "PMC12345",
  dateOfRegistration: new Date("2020-01-01"),
  preferenceDate1: "",
  preferenceDate2: "",
  preferenceDate3: "",
  part1PassingEmail: undefined,
  medicalLicense: undefined,
  passportBioPage: undefined,
  signature: undefined,
  agreementName: "John Doe",
  agreementDate: new Date(),
  termsAgreed: true,
};
export const aktsFormDefaultValues: AktsFormValues = {
  candidateId: "",
  passportImage: undefined,
  fullName: "",
  gender: "",
  schoolName: "",
  schoolLocation: "",
  QualificationDate: "",
  poBox: "",
  district: "",
  city: "",
  province: "",
  country: "",
  whatsapp: "",
  emergencyContact: "",
  email: "",
  dateOfPassingPart1: "",
  previousAktsAttempts: "",
  countryOfExperience: "",
  countryOfOrigin: "",
  registrationAuthority: "",
  registrationNumber: "",
  dateOfRegistration: new Date(),
  preferenceDate1: "",
  preferenceDate2: "",
  preferenceDate3: "",
  // signature: undefined,
  agreementName: "",
  agreementDate: new Date(),
  eligibilityA: false,
  eligibilityB: false,
  eligibilityC: false,
  examinationCenter: "",
  candidateStatementA: false,
  candidateStatementB: false,
  candidateStatementC: false,
  attachments: [],
};