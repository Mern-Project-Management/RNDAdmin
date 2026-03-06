import React from 'react'
import Slideshow from './../componets/home/SlideShow';
import CategoryCards from '../componets/home/CategoryCards';
import FeaturedProducts from '../componets/home/FeatureProducts';
import CorporateProfile from '../componets/home/CorporateProfile';
import Footer from '../componets/home/Footer';
// import FeaturedProducts from '../componets/home/feature/FeatureProducts';

const HomePage = () => {
  return (
    <div className='w-full'>
      {/* <h1 className="text-3xl font-bold mb-4 text-center">Responsive Slideshow</h1> */}
      <Slideshow />
      <CategoryCards />
      <FeaturedProducts />
      <CorporateProfile />

    </div>
  )
}

export default HomePage
