import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ResumeData } from "../types";
import { formatResumeLinks, lines } from "../utils/resume";

export type ResumeTemplate = "classic" | "compact" | "developer";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#172026",
    lineHeight: 1.35
  },
  compactPage: {
    padding: 30,
    fontSize: 9
  },
  developerPage: {
    padding: 34
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.15,
    marginBottom: 3
  },
  developerName: {
    color: "#166f73"
  },
  headline: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.25,
    marginBottom: 5
  },
  contact: {
    fontSize: 9,
    color: "#4d5b63",
    lineHeight: 1.35,
    marginBottom: 12
  },
  paragraph: {
    lineHeight: 1.35
  },
  section: {
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.2,
    borderBottomWidth: 1,
    borderBottomColor: "#172026",
    paddingBottom: 2,
    marginBottom: 5,
    textTransform: "uppercase"
  },
  row: {
    marginBottom: 7
  },
  developerSectionTitle: {
    color: "#166f73",
    borderBottomColor: "#166f73"
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  rowTitle: {
    flex: 1,
    paddingRight: 8
  },
  rowDate: {
    minWidth: 80,
    textAlign: "right"
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
    flex: 1,
    lineHeight: 1.35
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

export default function ResumePdf({
  resume,
  template = "classic"
}: {
  resume: ResumeData;
  template?: ResumeTemplate;
}) {
  const contactItems = [
    resume.email,
    resume.phone,
    resume.location,
    ...formatResumeLinks(resume.links)
  ].filter(Boolean);

  return (
    <Document title={`${resume.fullName} Resume`}>
      <Page
        size="A4"
        style={[
          styles.page,
          template === "compact" ? styles.compactPage : {},
          template === "developer" ? styles.developerPage : {}
        ]}
      >
        <Text style={[styles.name, template === "developer" ? styles.developerName : {}]}>{resume.fullName}</Text>
        <Text style={styles.headline}>{resume.headline}</Text>
        <Text style={styles.contact}>{contactItems.join(" | ")}</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, template === "developer" ? styles.developerSectionTitle : {}]}>Summary</Text>
          <Text style={styles.paragraph}>{resume.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, template === "developer" ? styles.developerSectionTitle : {}]}>Skills</Text>
          <Text style={styles.paragraph}>{resume.skills}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, template === "developer" ? styles.developerSectionTitle : {}]}>Experience</Text>
          {resume.experience.map((item) => (
            <View style={styles.row} key={`${item.company}-${item.role}`}>
              <View style={styles.rowTop}>
                <Text style={[styles.bold, styles.rowTitle]}>
                  {item.role}, {item.company}
                </Text>
                <Text style={[styles.muted, styles.rowDate]}>
                  {item.start} - {item.end}
                </Text>
              </View>
              <Text style={styles.muted}>{item.location}</Text>
              <BulletList value={item.bullets} />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, template === "developer" ? styles.developerSectionTitle : {}]}>Projects</Text>
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
          <Text style={[styles.sectionTitle, template === "developer" ? styles.developerSectionTitle : {}]}>Education</Text>
          {resume.education.map((item) => (
            <View style={styles.rowTop} key={`${item.school}-${item.degree}`}>
              <Text style={styles.rowTitle}>
                <Text style={styles.bold}>{item.degree}</Text>, {item.school}
              </Text>
              <Text style={[styles.muted, styles.rowDate]}>{[item.year, item.score].filter(Boolean).join(" | ")}</Text>
            </View>
          ))}
        </View>

        {resume.certifications ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, template === "developer" ? styles.developerSectionTitle : {}]}>Certifications</Text>
            <Text style={styles.paragraph}>{resume.certifications}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
