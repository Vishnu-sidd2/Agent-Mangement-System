import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const StatCard = ({ title, value, icon, color, onClick }) => {
  const valueRef = useRef(null);
  
  useEffect(() => {
    // Animate the counter up from 0 to the actual value
    gsap.fromTo(
      valueRef.current,
      { innerText: 0 },
      { 
        innerText: value, 
        duration: 1.5, 
        ease: 'power2.out',
        snap: { innerText: 1 } // Snap to integer values
      }
    );
  }, [value]);
  
  return (
    <div 
      className={`stat-card cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br ${color} p-6 shadow-lg transition-transform hover:scale-105`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p ref={valueRef} className="mt-2 text-4xl font-bold text-white">{value}</p>
        </div>
        <div className="rounded-full bg-white/20 p-3">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;