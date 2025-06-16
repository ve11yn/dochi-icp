import bg from '../assets/bg.jpg';

interface FlippedGradientBackgroundProps {
  children: React.ReactNode;
}

function FlippedGradientBackground({ children }: FlippedGradientBackgroundProps) {
  return (
    <div className="h-300 w-screen relative m-0 p-0">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
        style={{
          backgroundImage: `url(${bg})`
        }}
      />
      
      {/* Inverted White Fade Overlay - fades upward from bottom */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(0deg, transparent 0%, transparent 20%, rgba(255,255,255,0.9) 40%, white 50%)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}

export default FlippedGradientBackground;