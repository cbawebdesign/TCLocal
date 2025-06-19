
import React, { CSSProperties } from 'react';

const LogoImage: React.FC<{
  className?: string;
  style?: CSSProperties;
}> = ({ className, style }) => { // Add style here
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/test7-8a527.appspot.com/o/Screenshot_at_Mar_03_11-22-37-removebg-preview.png?alt=media&token=1ed97138-6872-41e9-9e87-56a2304bb104'; // Replace with your actual image URL

  return (
    <img
      className={`${className ?? 'w-[95px] sm:w-[105px]'}`}
      style={style} // Now style is defined
      src={logoUrl}
      alt="Logo"
    />
  );
};

export default LogoImage;