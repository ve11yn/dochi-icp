import bg from '../assets/bg.jpg';

interface FlippedGradientBackgroundProps {
  children: React.ReactNode;
}

function FlippedGradientBackground({ children }: FlippedGradientBackgroundProps) {
  return (
    <div className="relative w-full">
      {/* Positioned background behind the content */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          maskImage:
            'linear-gradient(to top, white 0%, rgba(255,255,255,0.9) 40%, transparent 60%)',
          WebkitMaskImage:
            'linear-gradient(to top, white 0%, rgba(255,255,255,0.9) 40%, transparent 60%)',
        }}
      />

      {/* Footer or other content sits on top */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}


export default FlippedGradientBackground;