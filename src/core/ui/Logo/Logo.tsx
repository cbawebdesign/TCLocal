import Link from 'next/link';
import LogoImage from './LogoImage';

const Logo: React.FCC<{
  label?: string;
  href?: string;
  className?: string;
}> = ({ label, href, className }) => {
  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <LogoImage className={className} />
    </Link>
  );
};

export default Logo;
