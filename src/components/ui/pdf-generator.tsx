import { format } from "date-fns";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const Watermark = () => (
  <View style={styles.watermarkContainer} fixed>
    <Text style={styles.watermarkText}>Preview</Text>
  </View>
);

export const ApplicationPDFCompletePreview = ({ data, images }: any) => {
  return (
    <Document>
      {/* Main application form page */}
      <Page size="A4" style={styles.page}>
        {/* Watermark */}

        <View style={styles.watermarkContainer} fixed>
          <Text style={styles.watermarkText}>Preview</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent1}>
            <Image src="/icon.png" style={styles.passportImage1} />
            <div className="text-center">
              <Text style={styles.title}>MRCGP [INT.] South Asia</Text>
              <Text style={styles.subtitle}>
                Part 2 (OSCE) Examination Application
              </Text>
            </div>
          </View>
          {images.passport && (
            <Image
              src={images.passport || "/placeholder.svg"}
              style={styles.passportImage}
            />
          )}
        </View>

        {/* Main content - Resume style format */}
        <View style={styles.section}>
          {/* Candidate information section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                CANDIDATE INFORMATION
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Candidate ID:</Text>
                    <Text style={styles.fieldValue}>
                      {data.candidateId || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Full Name:</Text>
                    <Text style={styles.fieldValue}>
                      {data.fullName || "Not provided"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Contact information section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>CONTACT INFORMATION</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>WhatsApp:</Text>
                    <Text style={styles.fieldValue}>
                      {data.whatsapp || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Emergency Contact:</Text>
                    <Text style={styles.fieldValue}>
                      {data.emergencyContact || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Email:</Text>
                    <Text style={styles.fieldValue}>
                      {data.email || "Not provided"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Address section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>CONTACT INFORMATION</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Post Box:</Text>
                    <Text style={styles.fieldValue}>
                      {data.poBox || "No address"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>District</Text>
                    <Text style={styles.fieldValue}>{data.district || ""}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>City:</Text>
                    <Text style={styles.fieldValue}>{data.city || ""}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>province:</Text>
                    <Text style={styles.fieldValue}>{data.province || ""}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Country:</Text>
                    <Text style={styles.fieldValue}>{data.country || ""}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Experience section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>EXPERIENCE</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date of passing Part 1:</Text>
                <Text style={styles.fieldValue}>
                  {data.dateOfPassingPart1 || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Previous OSCE attempts:</Text>
                <Text style={styles.fieldValue}>
                  {data.previousOsceAttempts || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Country of experience:</Text>
                <Text style={styles.fieldValue}>
                  {data.countryOfExperience || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Country of origin:</Text>
                <Text style={styles.fieldValue}>
                  {data.countryOfOrigin || "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* License details section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>LICENSE DETAILS</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Registration authority:</Text>
                <Text style={styles.fieldValue}>
                  {data.registrationAuthority || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Registration number:</Text>
                <Text style={styles.fieldValue}>
                  {data.registrationNumber || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date of registration:</Text>
                <Text style={styles.fieldValue}>
                  {data.dateOfRegistration
                    ? format(data.dateOfRegistration, "PPP")
                    : "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* OSCE Session Preferences */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                OSCE SESSION PREFERENCES
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preference Date 1:</Text>
                <Text style={styles.fieldValue}>
                  {data.preferenceDate1 && data.preferenceDate1 !== " "
                    ? format(new Date(data.preferenceDate1), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preference Date 2:</Text>
                <Text style={styles.fieldValue}>
                  {data.preferenceDate2 && data.preferenceDate2 !== " "
                    ? format(new Date(data.preferenceDate2), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preference Date 3:</Text>
                <Text style={styles.fieldValue}>
                  {data.preferenceDate3 && data.preferenceDate3 !== " "
                    ? format(new Date(data.preferenceDate3), "PPP")
                    : "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* Agreement */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>AGREEMENT</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Name:</Text>
                <Text style={styles.fieldValue}>
                  {data.agreementName || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date:</Text>
                <Text style={styles.fieldValue}>
                  {data.agreementDate
                    ? format(data.agreementDate, "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Terms Agreed:</Text>
                <Text style={styles.fieldValue}>
                  {data.termsAgreed ? "Yes" : "No"}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>Please Note</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.note}>
                  THE NUMBER OF PLACES IS LIMITED, AND SLOTS WILL BE ALLOCATED
                  ON THE "FIRST COME FIRST SERVED" BASIS. Your application may
                  be rejected because of a large number of applicants and you
                  may be invited to apply again or offered a slot at a
                  subsequent examination. Priority will be given to applicants
                  from South Asia and those applications that reach us first, so
                  we encourage you to apply as soon as possible. WHILST WE WILL
                  TRY TO ACCOMMODATE YOUR PREFERENCE, IT MAY NOT BE POSSIBLE DUE
                  TO A LARGE NUMBER OF APPLICANTS. Please email us well in
                  advance if you require a letter of invitation for visa
                  purposes and make sure you complete all travel formalities in
                  good time (visa applications, travel permits, leaves, etc.) No
                  Refunds will be granted in case any candidate fails to get the
                  visa prior to the exam date. Candidates with a disability are
                  requested to read the rules and regulation document [Page 10]
                  available on the website The MRCGP [INT.] South Asia
                  Secretariat will notify you by email of your allocated date
                  and time at least two weeks before the exam starting date.
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                CANDIDATE'S STATEMENT
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.note}>
                  I hereby apply to sit the South Asia MRCGP [INT.] Part 2
                  (OSCE) Examination, success in which will allow me to apply
                  for International Membership of the UK's Royal College of
                  General Practitioners. Detailed information on the membership
                  application process can be found on the RCGP website: Member
                  Ship I have read and agree to abide by the conditions set out
                  in the South Asia MRCGP [INT.] Examination Rules and
                  Regulations as published on the MRCGP [INT.] South Asia
                  website: www.mrcgpintsouthasia.org If accepted for
                  International Membership, I undertake to continue approved
                  postgraduate study while I remain in active general
                  practice/family practice, and to uphold and promote the aims
                  of the RCGP to the best of my ability. I understand that, on
                  being accepted for International Membership, an annual
                  subscription fee is to be payable to the RCGP. I understand
                  that only registered International Members who maintain their
                  RCGP subscription are entitled to use the post-nominal
                  designation "MRCGP [INT]". Success in the exam does not give
                  me the right to refer to myself as MRCGP [INT.]. I attach a
                  banker's draft made payable to "MRCGP [INT.] South Asia", I
                  also understand and agree that my personal data will be
                  handled by the MRCGP [INT.] South Asia Board and I also give
                  permission for my personal data to be handled by the regional
                  MRCGP [INT.] South Asia co-ordinators..
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      {/* Each document on its own page */}
      {images.medicalLicense && (
        <Page size="A4" style={styles.page}>
          {/* Watermark */}
          <Watermark />

          <View style={styles.documentPage}>
            <Text style={styles.documentPageTitle}>Medical License</Text>
            <Image
              src={images.medicalLicense || "/placeholder.svg"}
              style={styles.documentPageImagePrev}
            />
            <View style={styles.documentPageFooter}>
              <Text style={styles.documentPageFooterText}>
                {data.fullName} - Candidate ID: {data.candidateId}
              </Text>
            </View>
          </View>
        </Page>
      )}

      {images.part1Email && (
        <Page size="A4" style={styles.page}>
          {/* Watermark */}
          <Watermark />

          <View style={styles.documentPage}>
            <Text style={styles.documentPageTitle}>Part 1 Passing Email</Text>
            <Image
              src={images.part1Email || "/placeholder.svg"}
              style={styles.documentPageImagePrev}
            />
            <View style={styles.documentPageFooter}>
              <Text style={styles.documentPageFooterText}>
                {data.fullName} - Candidate ID: {data.candidateId}
              </Text>
            </View>
          </View>
        </Page>
      )}

      {images.passportBio && (
        <Page size="A4" style={styles.page}>
          {/* Watermark */}
          <Watermark />

          <View style={styles.documentPage}>
            <Text style={styles.documentPageTitle}>Passport Bio Page</Text>
            <Image
              src={images.passportBio || "/placeholder.svg"}
              style={styles.documentPageImagePrev}
            />
            <View style={styles.documentPageFooter}>
              <Text style={styles.documentPageFooterText}>
                {data.fullName} - Candidate ID: {data.candidateId}
              </Text>
            </View>
          </View>
        </Page>
      )}

      {images.signature && (
        <Page size="A4" style={styles.page}>
          {/* Watermark */}
          <Watermark />

          <View style={styles.documentPage}>
            <Text style={styles.documentPageTitle}>Signature</Text>
            <Image
              src={images.signature || "/placeholder.svg"}
              style={styles.documentPageImagePrev}
            />
            <View style={styles.documentPageFooter}>
              <Text style={styles.documentPageFooterText}>
                {data.fullName} - Candidate ID: {data.candidateId}
              </Text>
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
};
export const ApplicationPDFComplete = ({ data, images }: any) => {
  return (
    <Document>
      {/* Main application form page */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent1}>
            <Image src="/icon.png" style={styles.passportImage1} />
            <div className="text-center">
              <Text style={styles.title}>MRCGP [INT.] South Asia</Text>
              <Text style={styles.subtitle}>
                Part 2 (OSCE) Examination Application
              </Text>
            </div>
          </View>
          {images.passport && (
            <Image
              src={images.passport || "/placeholder.svg"}
              style={styles.passportImage}
            />
          )}
        </View>

        {/* Main content - Resume style format */}
        <View style={styles.section}>
          {/* Candidate information section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                CANDIDATE INFORMATION
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Candidate ID:</Text>
                    <Text style={styles.fieldValue}>
                      {data.candidateId || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Full Name:</Text>
                    <Text style={styles.fieldValue}>
                      {data.fullName || "Not provided"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Contact information section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>CONTACT INFORMATION</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>WhatsApp:</Text>
                    <Text style={styles.fieldValue}>
                      {data.whatsapp || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Emergency Contact:</Text>
                    <Text style={styles.fieldValue}>
                      {data.emergencyContact || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Email:</Text>
                    <Text style={styles.fieldValue}>
                      {data.email || "Not provided"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Address section */}

          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>CONTACT INFORMATION</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Post Box:</Text>
                    <Text style={styles.fieldValue}>
                      {data.poBox || "No address"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>District</Text>
                    <Text style={styles.fieldValue}>{data.district || ""}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>City:</Text>
                    <Text style={styles.fieldValue}>{data.city || ""}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>province:</Text>
                    <Text style={styles.fieldValue}>{data.province || ""}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Country:</Text>
                    <Text style={styles.fieldValue}>{data.country || ""}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Experience section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>EXPERIENCE</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date of passing Part 1:</Text>
                <Text style={styles.fieldValue}>
                  {data.dateOfPassingPart1 || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Previous OSCE attempts:</Text>
                <Text style={styles.fieldValue}>
                  {data.previousOsceAttempts || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Country of experience:</Text>
                <Text style={styles.fieldValue}>
                  {data.countryOfExperience || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Country of origin:</Text>
                <Text style={styles.fieldValue}>
                  {data.countryOfOrigin || "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* License details section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>LICENSE DETAILS</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Registration authority:</Text>
                <Text style={styles.fieldValue}>
                  {data.registrationAuthority || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Registration number:</Text>
                <Text style={styles.fieldValue}>
                  {data.registrationNumber || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date of registration:</Text>
                <Text style={styles.fieldValue}>
                  {data.dateOfRegistration
                    ? format(data.dateOfRegistration, "PPP")
                    : "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* OSCE Session Preferences */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                OSCE SESSION PREFERENCES
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preference Date 1:</Text>
                <Text style={styles.fieldValue}>
                  {data.preferenceDate1 && data.preferenceDate1 !== " "
                    ? format(new Date(data.preferenceDate1), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preference Date 2:</Text>
                <Text style={styles.fieldValue}>
                  {data.preferenceDate2 && data.preferenceDate2 !== " "
                    ? format(new Date(data.preferenceDate2), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preference Date 3:</Text>
                <Text style={styles.fieldValue}>
                  {data.preferenceDate3 && data.preferenceDate3 !== " "
                    ? format(new Date(data.preferenceDate3), "PPP")
                    : "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* Agreement */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>AGREEMENT</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Name:</Text>
                <Text style={styles.fieldValue}>
                  {data.agreementName || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date:</Text>
                <Text style={styles.fieldValue}>
                  {data.agreementDate
                    ? format(data.agreementDate, "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Terms Agreed:</Text>
                <Text style={styles.fieldValue}>
                  {data.termsAgreed ? "Yes" : "No"}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>Please Note</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.note}>
                  THE NUMBER OF PLACES IS LIMITED, AND SLOTS WILL BE ALLOCATED
                  ON THE "FIRST COME FIRST SERVED” BASIS. Your application may
                  be rejected because of a large number of applicants and you
                  may be invited to apply again or offered a slot at a
                  subsequent examination. Priority will be given to applicants
                  from South Asia and those applications that reach us first, so
                  we encourage you to apply as soon as possible. WHILST WE WILL
                  TRY TO ACCOMMODATE YOUR PREFERENCE, IT MAY NOT BE POSSIBLE DUE
                  TO A LARGE NUMBER OF APPLICANTS. Please email us well in
                  advance if you require a letter of invitation for visa
                  purposes and make sure you complete all travel formalities in
                  good time (visa applications, travel permits, leaves, etc.) No
                  Refunds will be granted in case any candidate fails to get the
                  visa prior to the exam date. Candidates with a disability are
                  requested to read the rules and regulation document [Page 10]
                  available on the website The MRCGP [INT.] South Asia
                  Secretariat will notify you by email of your allocated date
                  and time at least two weeks before the exam starting date.
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                CANDIDATE'S STATEMENT
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.note}>
                  I hereby apply to sit the South Asia MRCGP [INT.] Part 2
                  (OSCE) Examination, success in which will allow me to apply
                  for International Membership of the UK's Royal College of
                  General Practitioners. Detailed information on the membership
                  application process can be found on the RCGP website: Member
                  Ship I have read and agree to abide by the conditions set out
                  in the South Asia MRCGP [INT.] Examination Rules and
                  Regulations as published on the MRCGP [INT.] South Asia
                  website: www.mrcgpintsouthasia.org If accepted for
                  International Membership, I undertake to continue approved
                  postgraduate study while I remain in active general
                  practice/family practice, and to uphold and promote the aims
                  of the RCGP to the best of my ability. I understand that, on
                  being accepted for International Membership, an annual
                  subscription fee is to be payable to the RCGP. I understand
                  that only registered International Members who maintain their
                  RCGP subscription are entitled to use the post-nominal
                  designation "MRCGP [INT]". Success in the exam does not give
                  me the right to refer to myself as MRCGP [INT.]. I attach a
                  banker's draft made payable to “MRCGP [INT.] South Asia”, I
                  also understand and agree that my personal data will be
                  handled by the MRCGP [INT.] South Asia Board and I also give
                  permission for my personal data to be handled by the regional
                  MRCGP [INT.] South Asia co-ordinators..
                </Text>
              </View>
            </View>
          </View>
          {/* Footer */}
          {/* <View style={styles.footer}>
              <Text style={styles.footerText}>
                This document serves as a preview of your application for the South Asia MRCGP [INT.] Part 2 (OSCE)
                Examination.
              </Text>
            </View> */}
        </View>
      </Page>

      {/* Each document on its own page */}
      {images.medicalLicense && (
        <Page size="A4" style={styles.page}>
          <View style={styles.documentPage}>
            <Text style={styles.documentPageTitle}>Medical License</Text>
            <Image
              src={images.medicalLicense || "/placeholder.svg"}
              style={styles.documentPageImage}
            />
            <View style={styles.documentPageFooter}>
              <Text style={styles.documentPageFooterText}>
                {data.fullName} - Candidate ID: {data.candidateId}
              </Text>
            </View>
          </View>
        </Page>
      )}

      {images.part1Email && (
        <Page size="A4" style={styles.page}>
          <View style={styles.documentPage}>
            <Text style={styles.documentPageTitle}>Part 1 Passing Email</Text>
            <Image
              src={images.part1Email || "/placeholder.svg"}
              style={styles.documentPageImage}
            />
            <View style={styles.documentPageFooter}>
              <Text style={styles.documentPageFooterText}>
                {data.fullName} - Candidate ID: {data.candidateId}
              </Text>
            </View>
          </View>
        </Page>
      )}

      {images.passportBio && (
        <Page size="A4" style={styles.page}>
          <View style={styles.documentPage}>
            <Text style={styles.documentPageTitle}>Passport Bio Page</Text>
            <Image
              src={images.passportBio || "/placeholder.svg"}
              style={styles.documentPageImage}
            />
            <View style={styles.documentPageFooter}>
              <Text style={styles.documentPageFooterText}>
                {data.fullName} - Candidate ID: {data.candidateId}
              </Text>
            </View>
          </View>
        </Page>
      )}

      {images.signature && (
        <Page size="A4" style={styles.page}>
          <View style={styles.documentPage}>
            <Text style={styles.documentPageTitle}>Signature</Text>
            <Image
              src={images.signature || "/placeholder.svg"}
              style={styles.documentPageImage}
            />
            <View style={styles.documentPageFooter}>
              <Text style={styles.documentPageFooterText}>
                {data.fullName} - Candidate ID: {data.candidateId}
              </Text>
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
};

export const ApplicationPDFCompleteAktApp = ({ data }: any) => {
  console.log("ApplicationPDFCompleteAktApp data:", data);

  return (
    <Document>
      {/* Main application form page */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent1}>
            <Image src="/icon.png" style={styles.passportImage1} />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>MRCGP [INT.] South Asia</Text>
              <Text style={styles.subtitle}>
                Part 2 (OSCE) Examination Application
              </Text>
            </View>
          </View>
          {data.passportUrl && (
            <Image
              src={data.passportUrl || "/placeholder.svg"}
              style={styles.passportImage}
            />
          )}
        </View>

        <View style={styles.section}>
          {/* Candidate information section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                CANDIDATE INFORMATION
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Candidate ID:</Text>
                    <Text style={styles.fieldValue}>
                      {data.candidateId || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Full Name:</Text>
                    <Text style={styles.fieldValue}>
                      {data.fullName || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Gender:</Text>
                    <Text style={styles.fieldValue}>
                      {data.gender || "Not provided"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Contact information section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>CONTACT INFORMATION</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>WhatsApp:</Text>
                    <Text style={styles.fieldValue}>
                      {data.whatsapp || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Emergency Contact:</Text>
                    <Text style={styles.fieldValue}>
                      {data.emergencyContact || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Email:</Text>
                    <Text style={styles.fieldValue}>
                      {data.email || "Not provided"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Address section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>ADDRESS INFORMATION</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Post Box:</Text>
                    <Text style={styles.fieldValue}>
                      {data.poBox || "No address"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>District:</Text>
                    <Text style={styles.fieldValue}>{data.district || ""}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>City:</Text>
                    <Text style={styles.fieldValue}>{data.city || ""}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Province:</Text>
                    <Text style={styles.fieldValue}>{data.province || ""}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Country:</Text>
                    <Text style={styles.fieldValue}>{data.country || ""}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Experience section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>EXPERIENCE</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date of passing Part 1:</Text>
                <Text style={styles.fieldValue}>
                  {data.dateOfPassingPart1 || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Previous AKT attempts:</Text>
                <Text style={styles.fieldValue}>
                  {data.previousAktsAttempts || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Country of experience:</Text>
                <Text style={styles.fieldValue}>
                  {data.countryOfExperience || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Country of origin:</Text>
                <Text style={styles.fieldValue}>
                  {data.countryOfOrigin || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>School Name:</Text>
                <Text style={styles.fieldValue}>
                  {data.schoolName || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>School Location:</Text>
                <Text style={styles.fieldValue}>
                  {data.schoolLocation || "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* License details section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>LICENSE DETAILS</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Registration authority:</Text>
                <Text style={styles.fieldValue}>
                  {data.registrationAuthority || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Registration number:</Text>
                <Text style={styles.fieldValue}>
                  {data.registrationNumber || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date of registration:</Text>
                <Text style={styles.fieldValue}>
                  {data.dateOfRegistration
                    ? format(new Date(data.dateOfRegistration), "PPP")
                    : "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* Exam Details */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>EXAM DETAILS</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Exam Name:</Text>
                <Text style={styles.fieldValue}>
                  {data.examName || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Examination Center:</Text>
                <Text style={styles.fieldValue}>
                  {data.examinationCenter || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Qualification Date:</Text>
                <Text style={styles.fieldValue}>
                  {data.qualificationDate
                    ? format(new Date(data.qualificationDate), "PPP")
                    : "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* OSCE Session Preferences */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                OSCE SESSION PREFERENCES
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preference Date 1:</Text>
                <Text style={styles.fieldValue}>
                  {data.preferenceDate1 && data.preferenceDate1 !== " "
                    ? format(new Date(data.preferenceDate1), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preference Date 2:</Text>
                <Text style={styles.fieldValue}>
                  {data.preferenceDate2 && data.preferenceDate2 !== " "
                    ? format(new Date(data.preferenceDate2), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preference Date 3:</Text>
                <Text style={styles.fieldValue}>
                  {data.preferenceDate3 && data.preferenceDate3 !== " "
                    ? format(new Date(data.preferenceDate3), "PPP")
                    : "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* Eligibility Statements */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                ELIGIBILITY & STATEMENTS
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Eligibility A:</Text>
                <Text style={styles.fieldValue}>
                  {data.eligibilityA ? "✓ Confirmed" : "✗ Not confirmed"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Eligibility B:</Text>
                <Text style={styles.fieldValue}>
                  {data.eligibilityB ? "✓ Confirmed" : "✗ Not confirmed"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Eligibility C:</Text>
                <Text style={styles.fieldValue}>
                  {data.eligibilityC ? "✓ Confirmed" : "✗ Not confirmed"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Candidate Statement A:</Text>
                <Text style={styles.fieldValue}>
                  {data.candidateStatementA ? "✓ Agreed" : "✗ Not agreed"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Candidate Statement B:</Text>
                <Text style={styles.fieldValue}>
                  {data.candidateStatementB ? "✓ Agreed" : "✗ Not agreed"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Candidate Statement C:</Text>
                <Text style={styles.fieldValue}>
                  {data.candidateStatementC ? "✓ Agreed" : "✗ Not agreed"}
                </Text>
              </View>
            </View>
          </View>

          {/* Agreement */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>AGREEMENT</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Applicant Name:</Text>
                <Text style={styles.fieldValue}>
                  {data.applicantName || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Agreement Name:</Text>
                <Text style={styles.fieldValue}>
                  {data.agreementName || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Agreement Date:</Text>
                <Text style={styles.fieldValue}>
                  {data.agreementDate
                    ? format(new Date(data.agreementDate), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Submitted Date:</Text>
                <Text style={styles.fieldValue}>
                  {data.submittedDate
                    ? format(new Date(data.submittedDate), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Status:</Text>
                <Text style={styles.fieldValue}>
                  {data.status || "Pending"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>Please Note</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.note}>
                  THE NUMBER OF PLACES IS LIMITED, AND SLOTS WILL BE ALLOCATED
                  ON THE "FIRST COME FIRST SERVED" BASIS. Your application may
                  be rejected because of a large number of applicants and you
                  may be invited to apply again or offered a slot at a
                  subsequent examination. Priority will be given to applicants
                  from South Asia and those applications that reach us first, so
                  we encourage you to apply as soon as possible. WHILST WE WILL
                  TRY TO ACCOMMODATE YOUR PREFERENCE, IT MAY NOT BE POSSIBLE DUE
                  TO A LARGE NUMBER OF APPLICANTS. Please email us well in
                  advance if you require a letter of invitation for visa
                  purposes and make sure you complete all travel formalities in
                  good time (visa applications, travel permits, leaves, etc.) No
                  Refunds will be granted in case any candidate fails to get the
                  visa prior to the exam date. Candidates with a disability are
                  requested to read the rules and regulation document [Page 10]
                  available on the website The MRCGP [INT.] South Asia
                  Secretariat will notify you by email of your allocated date
                  and time at least two weeks before the exam starting date.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                CANDIDATE'S STATEMENT
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.note}>
                  I hereby apply to sit the South Asia MRCGP [INT.] Part 2
                  (OSCE) Examination, success in which will allow me to apply
                  for International Membership of the UK's Royal College of
                  General Practitioners. Detailed information on the membership
                  application process can be found on the RCGP website: Member
                  Ship I have read and agree to abide by the conditions set out
                  in the South Asia MRCGP [INT.] Examination Rules and
                  Regulations as published on the MRCGP [INT.] South Asia
                  website: www.mrcgpintsouthasia.org If accepted for
                  International Membership, I undertake to continue approved
                  postgraduate study while I remain in active general
                  practice/family practice, and to uphold and promote the aims
                  of the RCGP to the best of my ability. I understand that, on
                  being accepted for International Membership, an annual
                  subscription fee is to be payable to the RCGP. I understand
                  that only registered International Members who maintain their
                  RCGP subscription are entitled to use the post-nominal
                  designation "MRCGP [INT]". Success in the exam does not give
                  me the right to refer to myself as MRCGP [INT.]. I attach a
                  banker's draft made payable to "MRCGP [INT.] South Asia", I
                  also understand and agree that my personal data will be
                  handled by the MRCGP [INT.] South Asia Board and I also give
                  permission for my personal data to be handled by the regional
                  MRCGP [INT.] South Asia co-ordinators..
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      {/* Each document on its own page */}

      {/* Additional Attachments Pages */}
      {data.attachments &&
        data.attachments.map((attachment: any, index: number) => (
          <Page key={attachment.id} size="A4" style={styles.page}>
            <View style={styles.documentPage}>
              <Text style={styles.documentPageTitle}>
                {attachment.title || ` Attachment ${index + 1}`}
              </Text>
              <Image
                src={attachment.attachmentUrl || "/placeholder.svg"}
                style={styles.documentPageImage}
              />
              <View style={styles.documentPageFooter}>
                <Text style={styles.documentPageFooterText}>
                  {data.fullName} - Candidate ID: {data.candidateId}
                </Text>
                <Text style={styles.documentPageFooterText}>
                  Document: {attachment.title || `Attachment ${index + 1}`}
                </Text>
              </View>
            </View>
          </Page>
        ))}
    </Document>
  );
};
export const ApplicationPDFCompleteAkt = ({ data, image, images }: any) => {
  return (
    <Document>
      {/* Main application form page */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent1}>
            <Image src="/icon.png" style={styles.passportImage1} />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>MRCGP [INT.] South Asia</Text>
              <Text style={styles.subtitle}>
                Part 2 (OSCE) Examination Application
              </Text>
            </View>
          </View>
          {images.passport && (
            <Image
              src={images.passport || "/placeholder.svg"}
              style={styles.passportImage}
            />
          )}
        </View>

        <View style={styles.section}>
          {/* Candidate information section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                CANDIDATE INFORMATION
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Candidate ID:</Text>
                    <Text style={styles.fieldValue}>
                      {data.candidateId || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Full Name:</Text>
                    <Text style={styles.fieldValue}>
                      {data.fullName || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Gender:</Text>
                    <Text style={styles.fieldValue}>
                      {data.gender || "Not provided"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Contact information section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>CONTACT INFORMATION</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>WhatsApp:</Text>
                    <Text style={styles.fieldValue}>
                      {data.whatsapp || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Emergency Contact:</Text>
                    <Text style={styles.fieldValue}>
                      {data.emergencyContact || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Email:</Text>
                    <Text style={styles.fieldValue}>
                      {data.email || "Not provided"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Address section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>ADDRESS INFORMATION</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Post Box:</Text>
                    <Text style={styles.fieldValue}>
                      {data.poBox || "No address"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>District:</Text>
                    <Text style={styles.fieldValue}>{data.district || ""}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>City:</Text>
                    <Text style={styles.fieldValue}>{data.city || ""}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Province:</Text>
                    <Text style={styles.fieldValue}>{data.province || ""}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Country:</Text>
                    <Text style={styles.fieldValue}>{data.country || ""}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Experience section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>EXPERIENCE</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date of passing Part 1:</Text>
                <Text style={styles.fieldValue}>
                  {data.dateOfPassingPart1 || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Previous AKT attempts:</Text>
                <Text style={styles.fieldValue}>
                  {data.previousAktsAttempts || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Country of experience:</Text>
                <Text style={styles.fieldValue}>
                  {data.countryOfExperience || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Country of origin:</Text>
                <Text style={styles.fieldValue}>
                  {data.countryOfOrigin || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>School Name:</Text>
                <Text style={styles.fieldValue}>
                  {data.schoolName || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>School Location:</Text>
                <Text style={styles.fieldValue}>
                  {data.schoolLocation || "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* License details section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>LICENSE DETAILS</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Registration authority:</Text>
                <Text style={styles.fieldValue}>
                  {data.registrationAuthority || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Registration number:</Text>
                <Text style={styles.fieldValue}>
                  {data.registrationNumber || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date of registration:</Text>
                <Text style={styles.fieldValue}>
                  {data.dateOfRegistration
                    ? format(new Date(data.dateOfRegistration), "PPP")
                    : "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* Exam Details */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>EXAM DETAILS</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Exam Name:</Text>
                <Text style={styles.fieldValue}>
                  {data.examName || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Examination Center:</Text>
                <Text style={styles.fieldValue}>
                  {data.examinationCenter || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Qualification Date:</Text>
                <Text style={styles.fieldValue}>
                  {data.qualificationDate
                    ? format(new Date(data.qualificationDate), "PPP")
                    : "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* OSCE Session Preferences */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                OSCE SESSION PREFERENCES
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preference Date 1:</Text>
                <Text style={styles.fieldValue}>
                  {data.preferenceDate1 && data.preferenceDate1 !== " "
                    ? format(new Date(data.preferenceDate1), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preference Date 2:</Text>
                <Text style={styles.fieldValue}>
                  {data.preferenceDate2 && data.preferenceDate2 !== " "
                    ? format(new Date(data.preferenceDate2), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preference Date 3:</Text>
                <Text style={styles.fieldValue}>
                  {data.preferenceDate3 && data.preferenceDate3 !== " "
                    ? format(new Date(data.preferenceDate3), "PPP")
                    : "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* Attachments Summary
          {data.attachments && data.attachments.length > 0 && (
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>ATTACHMENTS</Text>
              </View>
              <View style={styles.resumeBody}>
                {data.attachments.map((attachment: any, index: number) => (
                  <View key={attachment.id} style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>{`Document ${index + 1}:`}</Text>
                    <Text style={styles.fieldValue}>{attachment.title || `Attachment ${index + 1}`}</Text>
                  </View>
                ))}
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Total Attachments:</Text>
                  <Text style={styles.fieldValue}>{data.attachments.length}</Text>
                </View>
              </View>
            </View>
          )} */}

          {/* {data.attachments &&
        data.attachments.map((attachment: any, index: number) => (
          <Page key={attachment.id} size="A4" style={styles.page}>
            <View style={styles.documentPage}>
              <Text style={styles.documentPageTitle}>{attachment.title || ` Attachment ${index + 1}`}</Text>
              <Image src={attachment.attachmentUrl || "/placeholder.svg"} style={styles.documentPageImage} />
              <View style={styles.documentPageFooter}>
                <Text style={styles.documentPageFooterText}>
                  {data.fullName} - Candidate ID: {data.candidateId}
                </Text>
                <Text style={styles.documentPageFooterText}>
                  Document: {attachment.title || `Attachment ${index + 1}`}
                </Text>
              </View>
            </View>
          </Page>
        ))} */}

          {/* Eligibility Statements */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                ELIGIBILITY & STATEMENTS
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Eligibility A:</Text>
                <Text style={styles.fieldValue}>
                  {data.eligibilityA ? "✓ Confirmed" : "✗ Not confirmed"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Eligibility B:</Text>
                <Text style={styles.fieldValue}>
                  {data.eligibilityB ? "✓ Confirmed" : "✗ Not confirmed"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Eligibility C:</Text>
                <Text style={styles.fieldValue}>
                  {data.eligibilityC ? "✓ Confirmed" : "✗ Not confirmed"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Candidate Statement A:</Text>
                <Text style={styles.fieldValue}>
                  {data.candidateStatementA ? "✓ Agreed" : "✗ Not agreed"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Candidate Statement B:</Text>
                <Text style={styles.fieldValue}>
                  {data.candidateStatementB ? "✓ Agreed" : "✗ Not agreed"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Candidate Statement C:</Text>
                <Text style={styles.fieldValue}>
                  {data.candidateStatementC ? "✓ Agreed" : "✗ Not agreed"}
                </Text>
              </View>
            </View>
          </View>

          {/* Agreement */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>AGREEMENT</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Applicant Name:</Text>
                <Text style={styles.fieldValue}>
                  {data.applicantName || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Agreement Name:</Text>
                <Text style={styles.fieldValue}>
                  {data.agreementName || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Agreement Date:</Text>
                <Text style={styles.fieldValue}>
                  {data.agreementDate
                    ? format(new Date(data.agreementDate), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Submitted Date:</Text>
                <Text style={styles.fieldValue}>
                  {data.submittedDate
                    ? format(new Date(data.submittedDate), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Status:</Text>
                <Text style={styles.fieldValue}>
                  {data.status || "Pending"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>Please Note</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.note}>
                  THE NUMBER OF PLACES IS LIMITED, AND SLOTS WILL BE ALLOCATED
                  ON THE "FIRST COME FIRST SERVED" BASIS. Your application may
                  be rejected because of a large number of applicants and you
                  may be invited to apply again or offered a slot at a
                  subsequent examination. Priority will be given to applicants
                  from South Asia and those applications that reach us first, so
                  we encourage you to apply as soon as possible. WHILST WE WILL
                  TRY TO ACCOMMODATE YOUR PREFERENCE, IT MAY NOT BE POSSIBLE DUE
                  TO A LARGE NUMBER OF APPLICANTS. Please email us well in
                  advance if you require a letter of invitation for visa
                  purposes and make sure you complete all travel formalities in
                  good time (visa applications, travel permits, leaves, etc.) No
                  Refunds will be granted in case any candidate fails to get the
                  visa prior to the exam date. Candidates with a disability are
                  requested to read the rules and regulation document [Page 10]
                  available on the website The MRCGP [INT.] South Asia
                  Secretariat will notify you by email of your allocated date
                  and time at least two weeks before the exam starting date.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                CANDIDATE'S STATEMENT
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.note}>
                  I hereby apply to sit the South Asia MRCGP [INT.] Part 2
                  (OSCE) Examination, success in which will allow me to apply
                  for International Membership of the UK's Royal College of
                  General Practitioners. Detailed information on the membership
                  application process can be found on the RCGP website: Member
                  Ship I have read and agree to abide by the conditions set out
                  in the South Asia MRCGP [INT.] Examination Rules and
                  Regulations as published on the MRCGP [INT.] South Asia
                  website: www.mrcgpintsouthasia.org If accepted for
                  International Membership, I undertake to continue approved
                  postgraduate study while I remain in active general
                  practice/family practice, and to uphold and promote the aims
                  of the RCGP to the best of my ability. I understand that, on
                  being accepted for International Membership, an annual
                  subscription fee is to be payable to the RCGP. I understand
                  that only registered International Members who maintain their
                  RCGP subscription are entitled to use the post-nominal
                  designation "MRCGP [INT]". Success in the exam does not give
                  me the right to refer to myself as MRCGP [INT.]. I attach a
                  banker's draft made payable to "MRCGP [INT.] South Asia", I
                  also understand and agree that my personal data will be
                  handled by the MRCGP [INT.] South Asia Board and I also give
                  permission for my personal data to be handled by the regional
                  MRCGP [INT.] South Asia co-ordinators..
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      {/* Each document on its own page */}

      {/* Additional Attachments Pages */}
      {image &&
        image.length > 0 &&
        image.map((attachment: any, index: number) => (
          <Page key={attachment.id} size="A4" style={styles.page}>
            <View style={styles.documentPage}>
              <Text style={styles.documentPageTitle}>
                {attachment.title || `Attachment ${index + 1}`}
              </Text>
              <Image
                src={attachment.attachmentUrl || "/placeholder.svg"}
                style={styles.documentPageImage}
              />
              <View style={styles.documentPageFooter}>
                <Text style={styles.documentPageFooterText}>
                  {data.fullName} - Candidate ID: {data.candidateId}
                </Text>
                <Text style={styles.documentPageFooterText}>
                  Document: {attachment.title || `Attachment ${index + 1}`}
                </Text>
              </View>
            </View>
          </Page>
        ))}
    </Document>
  );
};

export const ApplicationPDFCompleteAktPreview = ({
  data,
  image,
  images,
}: any) => {
  return (
    <Document>
      {/* Main application form page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.watermarkContainer} fixed>
          <Text style={styles.watermarkText}>Preview</Text>
        </View>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent1}>
            <Image src="/icon.png" style={styles.passportImage1} />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>MRCGP [INT.] South Asia</Text>
              <Text style={styles.subtitle}>
                Part 2 (OSCE) Examination Application
              </Text>
            </View>
          </View>
          {images.passport && (
            <Image
              src={images.passport || "/placeholder.svg"}
              style={styles.passportImage}
            />
          )}
        </View>

        <View style={styles.section}>
          {/* Candidate information section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                CANDIDATE INFORMATION
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Candidate ID:</Text>
                    <Text style={styles.fieldValue}>
                      {data.candidateId || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Full Name:</Text>
                    <Text style={styles.fieldValue}>
                      {data.fullName || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Gender:</Text>
                    <Text style={styles.fieldValue}>
                      {data.gender || "Not provided"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Contact information section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>CONTACT INFORMATION</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>WhatsApp:</Text>
                    <Text style={styles.fieldValue}>
                      {data.whatsapp || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Emergency Contact:</Text>
                    <Text style={styles.fieldValue}>
                      {data.emergencyContact || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Email:</Text>
                    <Text style={styles.fieldValue}>
                      {data.email || "Not provided"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Address section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>ADDRESS INFORMATION</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Post Box:</Text>
                    <Text style={styles.fieldValue}>
                      {data.poBox || "No address"}
                    </Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>District:</Text>
                    <Text style={styles.fieldValue}>{data.district || ""}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>City:</Text>
                    <Text style={styles.fieldValue}>{data.city || ""}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Province:</Text>
                    <Text style={styles.fieldValue}>{data.province || ""}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Country:</Text>
                    <Text style={styles.fieldValue}>{data.country || ""}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Experience section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>EXPERIENCE</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date of passing Part 1:</Text>
                <Text style={styles.fieldValue}>
                  {data.dateOfPassingPart1 || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Previous AKT attempts:</Text>
                <Text style={styles.fieldValue}>
                  {data.previousAktsAttempts || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Country of experience:</Text>
                <Text style={styles.fieldValue}>
                  {data.countryOfExperience || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Country of origin:</Text>
                <Text style={styles.fieldValue}>
                  {data.countryOfOrigin || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>School Name:</Text>
                <Text style={styles.fieldValue}>
                  {data.schoolName || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>School Location:</Text>
                <Text style={styles.fieldValue}>
                  {data.schoolLocation || "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* License details section */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>LICENSE DETAILS</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Registration authority:</Text>
                <Text style={styles.fieldValue}>
                  {data.registrationAuthority || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Registration number:</Text>
                <Text style={styles.fieldValue}>
                  {data.registrationNumber || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date of registration:</Text>
                <Text style={styles.fieldValue}>
                  {data.dateOfRegistration
                    ? format(new Date(data.dateOfRegistration), "PPP")
                    : "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* Exam Details */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>EXAM DETAILS</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Exam Name:</Text>
                <Text style={styles.fieldValue}>
                  {data.examName || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Examination Center:</Text>
                <Text style={styles.fieldValue}>
                  {data.examinationCenter || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Qualification Date:</Text>
                <Text style={styles.fieldValue}>
                  {data.qualificationDate
                    ? format(new Date(data.qualificationDate), "PPP")
                    : "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* OSCE Session Preferences */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                OSCE SESSION PREFERENCES
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preference Date 1:</Text>
                <Text style={styles.fieldValue}>
                  {data.preferenceDate1 && data.preferenceDate1 !== " "
                    ? format(new Date(data.preferenceDate1), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preference Date 2:</Text>
                <Text style={styles.fieldValue}>
                  {data.preferenceDate2 && data.preferenceDate2 !== " "
                    ? format(new Date(data.preferenceDate2), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preference Date 3:</Text>
                <Text style={styles.fieldValue}>
                  {data.preferenceDate3 && data.preferenceDate3 !== " "
                    ? format(new Date(data.preferenceDate3), "PPP")
                    : "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* Eligibility Statements */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                ELIGIBILITY & STATEMENTS
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Eligibility A:</Text>
                <Text style={styles.fieldValue}>
                  {data.eligibilityA ? "✓ Confirmed" : "✗ Not confirmed"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Eligibility B:</Text>
                <Text style={styles.fieldValue}>
                  {data.eligibilityB ? "✓ Confirmed" : "✗ Not confirmed"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Eligibility C:</Text>
                <Text style={styles.fieldValue}>
                  {data.eligibilityC ? "✓ Confirmed" : "✗ Not confirmed"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Candidate Statement A:</Text>
                <Text style={styles.fieldValue}>
                  {data.candidateStatementA ? "✓ Agreed" : "✗ Not agreed"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Candidate Statement B:</Text>
                <Text style={styles.fieldValue}>
                  {data.candidateStatementB ? "✓ Agreed" : "✗ Not agreed"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Candidate Statement C:</Text>
                <Text style={styles.fieldValue}>
                  {data.candidateStatementC ? "✓ Agreed" : "✗ Not agreed"}
                </Text>
              </View>
            </View>
          </View>

          {/* Agreement */}
          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>AGREEMENT</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Applicant Name:</Text>
                <Text style={styles.fieldValue}>
                  {data.applicantName || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Agreement Name:</Text>
                <Text style={styles.fieldValue}>
                  {data.agreementName || "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Agreement Date:</Text>
                <Text style={styles.fieldValue}>
                  {data.agreementDate
                    ? format(new Date(data.agreementDate), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Submitted Date:</Text>
                <Text style={styles.fieldValue}>
                  {data.submittedDate
                    ? format(new Date(data.submittedDate), "PPP")
                    : "Not provided"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Status:</Text>
                <Text style={styles.fieldValue}>
                  {data.status || "Pending"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>Please Note</Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.note}>
                  THE NUMBER OF PLACES IS LIMITED, AND SLOTS WILL BE ALLOCATED
                  ON THE "FIRST COME FIRST SERVED" BASIS. Your application may
                  be rejected because of a large number of applicants and you
                  may be invited to apply again or offered a slot at a
                  subsequent examination. Priority will be given to applicants
                  from South Asia and those applications that reach us first, so
                  we encourage you to apply as soon as possible. WHILST WE WILL
                  TRY TO ACCOMMODATE YOUR PREFERENCE, IT MAY NOT BE POSSIBLE DUE
                  TO A LARGE NUMBER OF APPLICANTS. Please email us well in
                  advance if you require a letter of invitation for visa
                  purposes and make sure you complete all travel formalities in
                  good time (visa applications, travel permits, leaves, etc.) No
                  Refunds will be granted in case any candidate fails to get the
                  visa prior to the exam date. Candidates with a disability are
                  requested to read the rules and regulation document [Page 10]
                  available on the website The MRCGP [INT.] South Asia
                  Secretariat will notify you by email of your allocated date
                  and time at least two weeks before the exam starting date.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.resumeSection}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeSectionTitle}>
                CANDIDATE'S STATEMENT
              </Text>
            </View>
            <View style={styles.resumeBody}>
              <View style={styles.fieldRow}>
                <Text style={styles.note}>
                  I hereby apply to sit the South Asia MRCGP [INT.] Part 2
                  (OSCE) Examination, success in which will allow me to apply
                  for International Membership of the UK's Royal College of
                  General Practitioners. Detailed information on the membership
                  application process can be found on the RCGP website: Member
                  Ship I have read and agree to abide by the conditions set out
                  in the South Asia MRCGP [INT.] Examination Rules and
                  Regulations as published on the MRCGP [INT.] South Asia
                  website: www.mrcgpintsouthasia.org If accepted for
                  International Membership, I undertake to continue approved
                  postgraduate study while I remain in active general
                  practice/family practice, and to uphold and promote the aims
                  of the RCGP to the best of my ability. I understand that, on
                  being accepted for International Membership, an annual
                  subscription fee is to be payable to the RCGP. I understand
                  that only registered International Members who maintain their
                  RCGP subscription are entitled to use the post-nominal
                  designation "MRCGP [INT]". Success in the exam does not give
                  me the right to refer to myself as MRCGP [INT.]. I attach a
                  banker's draft made payable to "MRCGP [INT.] South Asia", I
                  also understand and agree that my personal data will be
                  handled by the MRCGP [INT.] South Asia Board and I also give
                  permission for my personal data to be handled by the regional
                  MRCGP [INT.] South Asia co-ordinators..
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      {/* Each document on its own page */}

      {/* Additional Attachments Pages */}
      {image &&
        image.length > 0 &&
        image.map((attachment: any, index: number) => (
          <Page key={attachment.id} size="A4" style={styles.page}>
            <View style={styles.watermarkContainer} fixed>
              <Text style={styles.watermarkText}>Preview</Text>
            </View>
            <View style={styles.documentPage}>
              <Text style={styles.documentPageTitle}>
                {attachment.title || `Attachment ${index + 1}`}
              </Text>
              <Image
                src={attachment.attachmentUrl || "/placeholder.svg"}
                style={styles.documentPageImagePrev}
              />
              <View style={styles.documentPageFooter}>
                <Text style={styles.documentPageFooterText}>
                  {data.fullName} - Candidate ID: {data.candidateId}
                </Text>
                <Text style={styles.documentPageFooterText}>
                  Document: {attachment.title || `Attachment ${index + 1}`}
                </Text>
              </View>
            </View>
          </Page>
        ))}
    </Document>
  );
};

const styles = StyleSheet.create({
  watermarkContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.9,
  },
  watermarkText: {
    position: "absolute",
    zIndex: 9999,
    color: "#000000cc",
    fontSize: 150,
    transform: "rotate(-55deg)",
  },
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#6366f1",
    borderBottomStyle: "solid",
  },
  headerContent: {
    flex: 1,
  },
  headerContent1: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  titleContainer: {
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 5,
  },
  titleimage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  passportImage: {
    width: 80,
    height: 80,
    objectFit: "cover",
    borderRadius: 4,
    border: "1px solid #e5e7eb",
  },
  passportImage1: {
    width: 80,
    height: 80,
    objectFit: "cover",
  },
  passportImagePrev: {
    width: 80,
    height: 80,
    objectFit: "cover",
    borderRadius: 4,
    border: "1px solid #e5e7eb",
    opacity: 0.8,
  },
  passportImage1Prev: {
    width: 80,
    height: 80,
    objectFit: "cover",
    opacity: 0.8,
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  column: {
    flex: 1,
    paddingRight: 10,
  },
  resumeSection: {
    marginBottom: 15,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  resumeHeader: {
    backgroundColor: "#6366f1",
    padding: 5,
  },
  resumeSectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
  },
  resumeBody: {
    padding: 8,
    backgroundColor: "#ffffffdb",
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: "bold",
    marginRight: 5,
    flex: 1,
  },
  fieldValue: {
    fontSize: 9,
    flex: 2,
  },
  note: {
    fontSize: 10,
    flex: 2,
  },
  footer: {
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
    textAlign: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#6b7280",
  },
  // Document page styles
  documentPage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  documentPageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#4f46e5",
    textAlign: "center",
  },
  documentPageImage: {
    width: "90%",
    height: "70%",
    objectFit: "contain",
    marginBottom: 20,
    border: "1px solid #e5e7eb",
    zIndex: 1,
  },
  documentPageImagePrev: {
    width: "90%",
    height: "70%",
    objectFit: "contain",
    marginBottom: 20,
    border: "1px solid #e5e7eb",
    zIndex: 1,
    opacity: 0.8,
  },
  documentPageFooter: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    textAlign: "center",
  },
  documentPageFooterText: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 2,
  },
});
