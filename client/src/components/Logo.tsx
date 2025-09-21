interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  name?: string;
  tagline?: string;
  iconText?: string;
  iconBg?: string;
  imageSrc?: string;
}

export function Logo({ 
  size = "md", 
  className = "", 
  showText = true,
  name = "Carbon Sense",
  tagline = "Individual Dashboard", 
  iconText = "CS",
  iconBg = "bg-primary",
  imageSrc
}: LogoProps) {
  const sizeClasses = {
    sm: {
      icon: "w-6 h-6",
      text: "text-sm",
      tagline: "text-xs",
    },
    md: {
      icon: "w-8 h-8", 
      text: "text-sm",
      tagline: "text-xs",
    },
    lg: {
      icon: "w-12 h-12",
      text: "text-lg", 
      tagline: "text-sm",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="logo">
      {/* Logo Icon - can be replaced with actual image */}
      {imageSrc ? (
        <img 
          src={imageSrc} 
          alt={`${name} logo`}
          className={`${sizes.icon} rounded-lg object-cover`}
        />
      ) : (
        <div className={`${sizes.icon} ${iconBg} rounded-lg flex items-center justify-center`}>
          <span className={`text-primary-foreground font-bold ${sizes.text}`}>
            {iconText}
          </span>
        </div>
      )}
      
      {/* Logo Text */}
      {showText && (
        <div className="min-w-0">
          <h2 className={`font-semibold ${sizes.text} text-foreground`} data-testid="logo-name">
            {name}
          </h2>
          <p className={`${sizes.tagline} text-muted-foreground truncate`} data-testid="logo-tagline">
            {tagline}
          </p>
        </div>
      )}
    </div>
  );
}