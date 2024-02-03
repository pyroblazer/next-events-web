"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link'
import { Button } from '../ui/button';

const CarouselSection = () => {
  const images = ['/assets/images/hero.png', '/assets/images/hero1.png', '/assets/images/hero2.png', '/assets/images/hero2.png'];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section>
      <div
        className="bg-contain relative text-white"
        style={{
          backgroundImage: `url(${images[currentImageIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1.5s ease-in-out'
        }}
      >
        <div className="bg-black bg-opacity-60 p-8 md:py-20">
          <div className="wrapper grid grid-cols-1 gap-5 2xl:gap-0">
            <div className="flex flex-col justify-center gap-8 text-center relative z-10">
              <h1 className="h1-bold mb-8">
                Empower Moments, Foster Connections: Unleash Your Events with Our Platform!
              </h1>
              <p className="p-regular-20 md:p-regular-24 mb-8">
                Immerse yourself in our expansive global meetup events, connecting with diverse
                individuals to enrich your personal and professional journey, fostering meaningful
                relationships that contribute to the transformation of your skills and perspectives on
                a global scale.
              </p>
              <Button accessibilityLabel='Explore Now' size="lg" asChild className="button w-full sm:w-fi mb-8 text-white">
                <Link href="#events">Explore Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarouselSection;