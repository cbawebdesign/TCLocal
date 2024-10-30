
import React, { CSSProperties } from 'react';

const LogoImage: React.FC<{
  className?: string;
  style?: CSSProperties;
}> = ({ className, style }) => { // Add style here
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/tradecompanion-71fd4.appspot.com/o/Screenshot%20at%20Oct%2027%2018-17-29.png?alt=media&token=4a42e933-2f04-48d7-92db-e3f68d8a88e1'; // Replace with your actual image URL

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