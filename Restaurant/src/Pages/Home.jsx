import React from 'react'
import About from '../components/About.jsx'
import HeroSection from '../components/HeroSection.jsx'
import Quanlities from '../components/Quanlities.jsx'
import Menu from '../components/Menu.jsx'
import WhoAreWe from './../components/WhoAreWe';
import Team from '../components/Team.jsx'
import Reservation from '../components/Reservation.jsx'
import Footer from '../components/Footer.jsx'


const Home = () => {
  return (
    <>
    <HeroSection/>
    <About/>
    <Quanlities/>
    <Menu/>
    <WhoAreWe/>
    <Team/>
    <Reservation/>
    <Footer/>
    </>
  )
}

export default Home