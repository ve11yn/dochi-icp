import bg from '../assets/bg.jpg';

function FlippedGradientBackground({ children }) {
  return (
    <div className="relative w-full min-h-screen">
      {/* Background Image - flipped */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: 'rotate(180deg)' // This flips the gradient
        }}
      />
      
      {/* White Fade Overlay - starts from top (which is now bottom due to flip) */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(180deg, white 0%, rgba(255,255,255,0.8) 20%, transparent 40%, transparent 100%)'
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