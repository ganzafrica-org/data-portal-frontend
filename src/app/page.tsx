"use client"

import React, {useState, useEffect, useRef} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  MapPin,
  Database,
  BarChart3,
  Shield,
  Download,
  Search,
  Globe,
  Building,
  CheckCircle,
  Mail,
  Phone,
  Menu,
  X
} from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.5, ease: "easeOut" }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.3
    }
  }
}

const slideInLeft = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 1.0, ease: "easeOut" }
}


const AnimatedStat = ({ number, label }: { number: string; label: string }) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)

  const getNumericValue = (str: string): number => {
    const match = str.match(/[\d.]+/)
    return match ? parseFloat(match[0]) : 0
  }

  const numericValue = getNumericValue(number)

  useEffect(() => {
    const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !inView) {
            setInView(true)
          }
        },
        { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [inView])

  useEffect(() => {
    if (inView) {
      let startTime: number | null = null
      const duration = 2000

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)

        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentValue = numericValue * easeOutQuart

        setCount(currentValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [inView, numericValue])

  const formatNumber = (value: number): string => {
    if (number.includes('M+')) {
      return `${value.toFixed(1)}M+`
    } else if (number.includes('K+')) {
      return `${Math.round(value)}K+`
    } else if (number.includes('%')) {
      return `${value.toFixed(1)}%`
    } else {
      return Math.round(value).toString()
    }
  }

  return (
      <div ref={ref} className="text-center">
        <motion.div
            className="text-3xl font-bold text-yellow mb-1"
            initial={{ scale: 0.5 }}
            animate={{ scale: inView ? 1 : 0.5 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
          {formatNumber(count)}
        </motion.div>
        <div className="text-sm opacity-90">{label}</div>
      </div>
  )
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMobileMenuOpen(false)
    }
  }

  const dataTypes = [
    {
      icon: MapPin,
      title: "Parcel Information",
      description: "Comprehensive land parcel data including boundaries, ownership, and land use classifications",
      features: ["Unique Parcel Identifiers (UPI)", "Ownership Details", "Land Use Types", "Parcel Boundaries"]
    },
    {
      icon: Database,
      title: "Transaction Records",
      description: "Complete transaction history and land transfer documentation",
      features: ["Approval Records", "Transfer History", "Transaction Status", "Legal Documentation"]
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Statistical data and analytical reports for research and planning",
      features: ["Land Use Statistics", "Ownership Patterns", "Regional Analysis", "Custom Reports"]
    },
    {
      icon: Building,
      title: "Administrative Data",
      description: "Hierarchical administrative divisions and location-based information",
      features: ["Province/District Data", "Sector/Cell Information", "Village Classifications", "Geographic Coordinates"]
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: "Secure & Trusted",
      description: "Government-verified data with role-based access controls"
    },
    {
      icon: Download,
      title: "Multiple Formats",
      description: "Download data in CSV, Excel, and shapefile formats"
    },
    {
      icon: Search,
      title: "Advanced Filtering",
      description: "Search and filter data by location, date, and criteria"
    },
    {
      icon: Globe,
      title: "Real-time Access",
      description: "Up-to-date information from the national land registry"
    }
  ]

  const userTypes = [
    {
      type: "Researchers",
      description: "Access anonymized datasets for academic research and analysis",
      access: "Aggregated Data",
      color: "text-yellow"
    },
    {
      type: "Government Agencies",
      description: "Internal access to operational data for planning and decision-making",
      access: "Full Access",
      color: "text-blue"
    },
    {
      type: "Development Partners",
      description: "Verified organizations working on development projects",
      access: "Project-specific Data",
      color: "text-yellow"
    }
  ]

  const navItems = [
    { label: 'Home', id: 'hero' },
    { label: 'Data Types', id: 'data-types' },
    { label: 'Benefits', id: 'benefits' },
  ]


  return (
      <div className="min-h-screen bg-white">
        
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-lg'
                    : 'bg-transparent'
            }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Image
                    src="/images/favicon.png"
                    alt="NLA Logo"
                    width={60}
                    height={60}
                    className="object-contain mr-3"
                />
                <div className={`transition-colors ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                  <h1 className="text-lg font-bold">NLA Data Portal</h1>
                  <p className="text-xs opacity-80">National Land Authority</p>
                </div>
              </div>

              
              <div className="hidden lg:flex items-center space-x-8">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`text-sm font-medium transition-colors hover:scale-105 ${
                            isScrolled ? 'text-gray-700 hover:text-blue' : 'text-white hover:text-yellow'
                        }`}
                    >
                      {item.label}
                    </button>
                ))}
              </div>

              
              <div className="hidden md:flex space-x-3">
                <Link href="/login">
                  <Button className={`text-sm px-4 py-2 transition-all ${
                      isScrolled
                          ? 'bg-yellow text-green hover:bg-green hover:text-white'
                          : 'bg-yellow text-green hover:bg-green hover:text-white'
                  }`}>
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-blue hover:bg-blue/90 text-white text-sm px-4 py-2">
                    Register
                  </Button>
                </Link>
              </div>

              
              <button
                  className={`md:hidden p-2 ${isScrolled ? 'text-gray-900' : 'text-white'}`}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden bg-white border-t shadow-lg"
                >
                  <div className="py-4 space-y-3">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className="block w-full text-left px-4 py-2 text-gray-700 hover:text-blue hover:bg-gray-50"
                        >
                          {item.label}
                        </button>
                    ))}
                    <div className="px-4 pt-4 space-y-2">
                      <Link href="/login" className="block">
                        <Button className="w-full bg-yellow text-green hover:bg-green hover:text-white">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/register" className="block">
                        <Button className="w-full bg-blue hover:bg-blue/90 text-white">
                          Register
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
            )}
          </div>
        </motion.nav>

        
        <section id="hero" className="relative min-h-[30vh] xl:min-h-[25vh] overflow-hidden flex flex-col">
          <Image
              src="/images/landing-1.png"
              alt="Rwanda landscape"
              fill
              className="object-cover"
              priority
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32">
            <div className="text-center text-white max-w-5xl">
              <motion.div
                  initial="initial"
                  animate="animate"
                  variants={staggerContainer}
                  className="space-y-6 sm:space-y-8"
              >
                <motion.h1
                    variants={fadeInUp}
                    className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight"
                >
                  <div className="mb-2">RWANDA&#39;S COMPREHENSIVE</div>
                  <motion.div
                      variants={fadeInUp}
                      className="text-blue"
                  >
                    LAND DATA PORTAL
                  </motion.div>
                </motion.h1>

                <motion.p
                    variants={fadeInUp}
                    className="text-base sm:text-lg md:text-xl opacity-90 max-w-4xl mx-auto"
                >
                  Access secure, verified land administration data for research, planning, and development
                </motion.p>


                
                <motion.div
                    variants={fadeInUp}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 pb-4 max-w-4xl mx-auto"
                >
                  {[
                    { number: "1M+", label: "Registered Parcels" },
                    { number: "500K+", label: "Processed Transactions" },
                    { number: "30", label: "Districts Covered" },
                    { number: "99.9%", label: "Data Accuracy" }
                  ].map((stat, index) => (
                      <div key={index} className="text-center">
                        <AnimatedStat number={stat.number} label={stat.label} />
                      </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        
        <section id="data-types" className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                viewport={{ once: true }}
                className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-3">
                What Data Can You <span className="text-blue">Access?</span>
              </h2>

            </motion.div>

            <motion.div
                initial="initial"
                whileInView="animate"
                variants={staggerContainer}
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {dataTypes.map((item, index) => (
                  <motion.div key={index} variants={fadeInUp} className="group">
                    <Card className="h-72 border-0 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                      <CardHeader className="text-center">
                        <div className="p-4 bg-blue/10 group-hover:bg-blue/20 rounded-lg mx-auto mb-4 w-16 h-16 flex items-center justify-center transition-colors">
                          <item.icon className="h-8 w-8 text-blue" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-blue transition-colors">{item.title}</CardTitle>
                      </CardHeader>

                      
                      <CardContent className="group-hover:hidden text-sm">
                        <CardDescription className="text-center text-gray-600">
                          {item.description}
                        </CardDescription>
                      </CardContent>


                      <CardContent className="hidden group-hover:flex flex-col items-center justify-center h-full">
                        <ul className="space-y-2 text-sm">
                          {item.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center">
                                <CheckCircle className="h-3 w-3 text-green mr-2 flex-shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                              </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        
        <section id="benefits" className="py-10 px-4 sm:px-6 lg:px-8 relative">
          <Image
              src="/images/landing-2.png"
              alt="Rwanda landscape"
              fill
              className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                viewport={{ once: true }}
                className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-2">
                Why Choose <span className="text-yellow">NLA Data Portal?</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              <motion.div
                  initial="initial"
                  whileInView="animate"
                  variants={staggerContainer}
                  viewport={{ once: true }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {benefits.map((benefit, index) => (
                    <motion.div
                        key={index}
                        variants={slideInLeft}
                        className="text-center text-white"
                    >
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300">
                        <benefit.icon className="h-10 w-10 text-yellow mx-auto mb-3" />
                        <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                        <p className="text-white/80 text-sm">{benefit.description}</p>
                      </div>
                    </motion.div>
                ))}
              </motion.div>

              
              <div id="access">
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.2 }}
                    viewport={{ once: true }}
                    className="text-white"
                >
                  <h3 className="text-2xl font-bold mb-6 text-center lg:text-left">Access Levels</h3>
                  <div className="space-y-4">
                    {userTypes.map((user, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold">{user.type}</h4>
                            <span className={`text-sm font-medium ${user.color}`}>
                              {user.access}
                            </span>
                          </div>
                          <p className="text-white/80 text-sm">{user.description}</p>
                        </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        
        <footer id="contact" className="bg-gray-900 text-white py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center mb-3">
                  <Image
                      src="/images/favicon.png"
                      alt="NLA Logo"
                      width={60}
                      height={60}
                      className="object-contain mr-3"
                  />
                  <div>
                    <h3 className="font-bold text-lg">NLA Data Portal</h3>
                    <p className="text-sm opacity-75">National Land Authority</p>
                  </div>
                </div>
                <p className="opacity-75 mb-4">
                  Secure access to Rwanda&#39;s comprehensive land administration data for research, planning, and development.
                </p>
                <div className="flex space-x-4">
                  <Link href="/register">
                    <Button className="bg-yellow text-green hover:bg-green hover:text-white">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="bg-blue hover:bg-blue/90 text-white">
                      Register
                    </Button>
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-4">Quick Access</h4>
                <ul className="space-y-2 text-sm opacity-75">
                  <li>Parcel Information</li>
                  <li>Transaction Records</li>
                  <li>Analytics & Reports</li>
                  <li>Administrative Data</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4">Contact Us</h4>
                <div className="space-y-3 text-sm opacity-75">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>info@nla.gov.rw</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>+250 788 000 000</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Kigali, Rwanda</span>
                  </div>
                  <Link href="https://www.lands.rw" className="block hover:text-blue transition-colors">
                    Visit NLA Website
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm opacity-75">
              <p>&copy; {new Date().getFullYear()} National Land Authority. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
  )
}