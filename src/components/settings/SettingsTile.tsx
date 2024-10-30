import { Section, SectionBody, SectionHeader } from '~/core/ui/Section';

const SettingsTile: React.FCC<{
  heading?: string | React.ReactNode;
  subHeading?: string | React.ReactNode;
  className?: string;
}> = ({ children, heading, subHeading, className }) => {
  return (
    <Section className={className}>
      <SectionHeader title={heading} description={subHeading} />

      <SectionBody>{children}</SectionBody>
    </Section>
  );
};

export default SettingsTile;
