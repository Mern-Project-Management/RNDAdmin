import { useGetAllChemicalCategoriesQuery } from '@/slice/chemicalSlice/chemicalCategory'
import { useGetActiveServiceCategoriesQuery } from '@/slice/serviceSlice'

import { useState } from "react";

import NavbarComp from './componets/navbar/Navbar';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: categories } = useGetAllChemicalCategoriesQuery();
  const { data: serviceCategories } = useGetActiveServiceCategoriesQuery();
  
  console.log(categories)
  return (
    <header className="w-full">
    <NavbarComp  categories={ categories } serviceCategories={ serviceCategories }/>
    </header>
  );
}; 

export default Navbar;
 
