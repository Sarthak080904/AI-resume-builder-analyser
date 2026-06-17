import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ResumeData } from "../types";
import { formatResumeLinks, lines } from "../utils/resume";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#172026",
    lineHeight: 1.35
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3
  },
  headline: {
    fontSize: 11,
    marginBottom: 5
  },
  contact: {
    fontSize: 9,
    color: "#4d5b63",
    marginBottom: 12
  },
  section: {
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    borderBottomWidth: 1,
    borderBottomColor: "#172026",
    paddingBottom: 2,
    marginBottom: 5,
    textTransform: "uppercase"
  },
  row: {
    marginBottom: 7
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  bold: {
    fontFamily: "Helvetica-Bold"
  },
  muted: {
    color: "#4d5b63"
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 2
  },
  bulletDot: {
    width: 10
  },
  bulletText: {
    flex: 1
  }
});

function BulletList({ value }: { value: string }) {
  return (
    <View>
      {lines(value).map((line) => (
        <View style={styles.bullet} key={line}>
          <Text style={styles.bulletDot}>-</Text>
          <Text style={styles.bulletText}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ResumePdf({ resume }: { resume: ResumeData }) {
  const contactItems = [
    resume.email,
    resume.phone,
    resume.location,
    ...formatResumeLinks(resume.links)
  ].filter(Boolean);

  return (
    <Document title={`${resume.fullName} Resume`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{resume.fullName}</Text>
        <Text style={styles.headline}>{resume.headline}</Text>
        <Text style={styles.contact}>{contactItems.join(" | ")}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text>{resume.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text>{resume.skills}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {resume.experience.map((item) => (
            <View style={styles.row} key={`${item.company}-${item.role}`}>
              <View style={styles.rowTop}>
                <Text style={styles.bold}>
                  {item.role}, {item.company}
                </Text>
                <Text style={styles.muted}>
                  {item.start} - {item.end}
                </Text>
              </View>
              <Text style={styles.muted}>{item.location}</Text>
              <BulletList value={item.bullets} />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {resume.projects.map((item) => (
            <View style={styles.row} key={item.name}>
              <Text style={styles.bold}>
                {item.name} {item.tech ? `| ${item.tech}` : ""}
              </Text>
              <BulletList value={item.bullets} />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {resume.education.map((item) => (
            <View style={styles.rowTop} key={`${item.school}-${item.degree}`}>
              <Text>
                <Text style={styles.bold}>{item.degree}</Text>, {item.school}
              </Text>
              <Text style={styles.muted}>{[item.year, item.score].filter(Boolean).join(" | ")}</Text>
            </View>
          ))}
        </View>

        {resume.certifications ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <Text>{resume.certifications}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
