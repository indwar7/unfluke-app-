import React, { useEffect } from 'react';
import './parallax.css';  // Create and import your CSS file
const ParallaxComponent = () => {

  useEffect(() => {
    const handleScroll = () => {
      const parallax = document.querySelector('.parallax');
      const offset = window.pageYOffset;
      parallax.style.backgroundPositionY = offset * 0.2 + 'px';  // Adjust the multiplier for effect strength
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
<>
<div className="parallax">
      <div className="parallax-content">
        {/* <h1>Parallax Effect</h1>
        <p>This is a basic parallax effect using CSS and JavaScript.</p> */}
      </div>
    </div>
</>
  );
};

export default ParallaxComponent;
