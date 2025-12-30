import React from 'react';

export default function HeroSection() {
  return (
    <div 
      className="w-full relative rounded-xl lg:rounded-[46px] overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('https://static-media.gritworks.ai/fe-images/PNG/SG%20Commons/sg_commons_main.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '240px',
        backgroundRepeat: 'no-repeat',
        width: '100%'
      }}
    >
      <div className="w-full h-full flex items-end px-4 lg:px-8 pt-12 pb-4">
        <div>
          <h1 className="text-lg md:text-3xl text-white mb-3 font-semibold">
            Shikshagraha Commons
          </h1>
          <p className="text-white text-sm md:text-lg font-light">
          A compendium of solutions shared for public use by the Shikshagraha movement partners under the Creative Commons Attribution Share-Alike license.
          </p>
        </div>
      </div>
    </div>
  );
}
