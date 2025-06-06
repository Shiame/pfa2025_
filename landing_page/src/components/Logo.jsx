import { FaMapMarkedAlt } from 'react-icons/fa';

function Logo({ size = "md" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  return (
    <img 
      src="logo.png" 
      alt="Un Maroc Meilleur Logo"
      className={`${sizeClasses[size]} object-contain`}
    />
  );
  
}

export default Logo;