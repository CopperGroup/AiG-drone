"use server"

import Map from "@/components/shared/Map";
import Divider from "@/components/shared/Divider";
import AboutUs from "@/components/landing/AboutUs";
import BannerHero from "@/components/banner/BannerHero";
import { sleep } from "@/lib/utils";
import Categories from "@/components/landing/Categories";
import History from "@/components/landing/History";
import Brand from "@/components/landing/Brand";
import Testimonials from "@/components/landing/Testimonials";

export default async function Home() {
  
  return (
    <>
      <BannerHero/>
      <Categories/>
      <AboutUs/>
      <Testimonials />
      <History/>
      <Brand/>
      {/* <Map/>   */}
    </>
  );
}
