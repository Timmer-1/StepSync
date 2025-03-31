interface GridBackgroundProps {
  children: React.ReactNode;
  baseColor?: string;
  gridColor?: string;
}

export default function GridBackground({
  children,
  baseColor = '#0A1921',
  gridColor = 'rgb(22, 78, 99)'
}: GridBackgroundProps) {
  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="fixed inset-0" style={{ backgroundColor: baseColor }}>
        {/* Primary grid - larger squares */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
                linear-gradient(to right, ${gridColor} 1px, transparent 1px),
                linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
              `,
            backgroundSize: '100px 100px'
          }}
        />

        {/* Secondary grid - smaller squares */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
                linear-gradient(to right, ${gridColor} 1px, transparent 1px),
                linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
              `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Radial gradient overlay */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${baseColor}00 0%, ${baseColor}CC 50%, ${baseColor} 100%)`
          }}
        />
      </div>

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}