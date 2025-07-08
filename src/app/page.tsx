"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  MapPin,
  Database,
  BarChart3,
  Users,
  Shield,
  Download,
  Search,
  Globe,
  Building,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone
} from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.5, ease: "easeOut" }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.6
    }
  }
}

const slideInLeft = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 1.0, ease: "easeOut" }
}

const slideInRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 1.0, ease: "easeOut" }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 1.0, ease: "easeOut" }
}

export default function LandingPage() {
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
      color: "text-green"
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

  return (
      <div className="min-h-screen bg-white">

        <section className="relative md:min-h-screen overflow-hidden flex flex-col">
          <Image
              src="/images/landing-1.png"
              alt="Rwanda landscape"
              fill
              className="object-cover"
              priority
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 h-full flex flex-col">

            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="flex justify-between items-center p-4 sm:p-6 lg:p-8 flex-shrink-0"
            >
              <div className="flex items-center">
                <Image
                    src="/images/favicon.png"
                    alt="NLA Logo"
                    width={50}
                    height={50}
                    className="object-contain mr-3"
                />
                <div className="text-white">
                  <h1 className="text-lg sm:text-xl font-bold">NLA Data Portal</h1>
                  <p className="text-xs opacity-90">National Land Authority</p>
                </div>
              </div>
              <div className="hidden md:flex space-x-2 sm:space-x-4">
                <Link href="/login">
                  <Button className="bg-yellow text-green hover:bg-green hover:text-white transition-colors text-sm sm:text-base px-3 sm:px-4 py-2">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-blue hover:bg-blue/90 text-white transition-colors text-sm sm:text-base px-3 sm:px-4 py-2">
                    Register
                  </Button>
                </Link>
              </div>
            </motion.nav>


            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 ">
              <div className="text-center text-white max-w-full">
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={staggerContainer}
                    className="space-y-6 sm:space-y-8"
                >
                  <motion.h1
                      variants={fadeInUp}
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
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
                      className="text-base sm:text-lg md:text-xl lg:text-2xl opacity-90 max-w-4xl mx-auto px-4"
                  >
                    Access secure, verified land administration data for research, planning, and development
                  </motion.p>

                  <motion.div
                      variants={fadeInUp}
                      className="flex flex-col sm:flex-row gap-4 justify-center pt-4 sm:pt-6"
                  >
                    <Link href="/login">
                      <Button
                          size="lg"
                          className="w-auto bg-green hover:bg-green/90 text-white px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl transition-all hover:scale-105"
                      >
                        Get Started Today
                        <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>

          </div>
        </section>


        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                viewport={{ once: true }}
                className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                What Data Can You <span className="text-blue">Access?</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Explore Rwanda&#39;s comprehensive land data repository with verified, up-to-date information across multiple categories
              </p>
            </motion.div>

            <motion.div
                initial="initial"
                whileInView="animate"
                variants={staggerContainer}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16"
            >
              {dataTypes.map((item, index) => (
                  <motion.div key={index} variants={fadeInUp}>
                    <Card className="border-0 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full">
                      <CardHeader>
                        <div className="flex items-center mb-4">
                          <div className="p-3 bg-blue/10 rounded-lg mr-4 flex-shrink-0">
                            <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue" />
                          </div>
                          <div>
                            <CardTitle className="text-lg sm:text-xl">{item.title}</CardTitle>
                          </div>
                        </div>
                        <CardDescription className="text-gray-600 text-sm sm:text-base">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {item.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green mr-2 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{feature}</span>
                              </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
              ))}
            </motion.div>


            <motion.div
                initial="initial"
                whileInView="animate"
                variants={staggerContainer}
                viewport={{ once: true }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center"
            >
              {[
                { number: "1M+", label: "Registered Parcels", color: "text-blue" },
                { number: "500K+", label: "Processed Transactions", color: "text-green" },
                { number: "30", label: "Districts Covered", color: "text-yellow" },
                { number: "99.9%", label: "Data Accuracy", color: "text-blue" }
              ].map((stat, index) => (
                  <motion.div key={index} variants={scaleIn} className="p-4">
                    <div className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-2`}>
                      {stat.number}
                    </div>
                    <div className="text-sm sm:text-base text-gray-600">{stat.label}</div>
                  </motion.div>
              ))}
            </motion.div>
          </div>
        </section>


        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative">
          <Image
              src="/images/landing-2.png"
              alt="Rwanda landscape"
              fill
              className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                viewport={{ once: true }}
                className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                Why Choose <span className="text-yellow">NLA Data Portal?</span>
              </h2>
              <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto">
                Trusted by researchers, government agencies, and development partners nationwide
              </p>
            </motion.div>

            <motion.div
                initial="initial"
                whileInView="animate"
                variants={staggerContainer}
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            >
              {benefits.map((benefit, index) => (
                  <motion.div
                      key={index}
                      variants={slideInLeft}
                      className="text-center text-white"
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 mb-4 hover:bg-white/20 transition-all duration-300">
                      <benefit.icon className="h-10 w-10 sm:h-12 sm:w-12 text-yellow mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-bold mb-2">{benefit.title}</h3>
                      <p className="text-white/80 text-sm">{benefit.description}</p>
                    </div>
                  </motion.div>
              ))}
            </motion.div>
          </div>
        </section>


        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                viewport={{ once: true }}
                className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Who Can <span className="text-green">Access Our Data?</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Different access levels for different user types, ensuring appropriate data security and privacy
              </p>
            </motion.div>

            <motion.div
                initial="initial"
                whileInView="animate"
                variants={staggerContainer}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
            >
              {userTypes.map((user, index) => (
                  <motion.div key={index} variants={slideInRight}>
                    <Card className="hover:shadow-lg transition-all duration-300 text-center hover:scale-[1.02] h-full">
                      <CardHeader>
                        <div className="p-4 bg-gray-50 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center">
                          <Users className="h-8 w-8 sm:h-10 sm:w-10 text-gray-600" />
                        </div>
                        <CardTitle className="text-lg sm:text-xl">{user.type}</CardTitle>
                        <div className={`text-sm font-medium ${user.color}`}>
                          {user.access}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm sm:text-base">{user.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
              ))}
            </motion.div>
          </div>
        </section>


        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative">
          <Image
              src="/images/landing-3.png"
              alt="Rwanda landscape"
              fill
              className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />

          <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
              viewport={{ once: true }}
              className="relative z-10 max-w-4xl mx-auto text-center text-white"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Ready to Access Rwanda&#39;s Land Data?
            </h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90">
              Join hundreds of researchers, planners, and organizations already using our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                    size="lg"
                    className="w-auto bg-blue hover:bg-blue/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg transition-all hover:scale-105"
                >
                  Register for External Access
                </Button>
              </Link>
              <Link href="/register/employee">
                <Button
                    size="lg"
                    className="w-auto bg-yellow hover:bg-yellow/90 text-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg transition-all hover:scale-105"
                >
                  Employee Registration
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>


        <footer className="bg-gray-900 text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Image
                      src="/images/favicon.png"
                      alt="NLA Logo"
                      width={40}
                      height={40}
                      className="object-contain mr-3"
                  />
                  <div>
                    <h3 className="font-bold">NLA Data Portal</h3>
                    <p className="text-xs opacity-75">National Land Authority</p>
                  </div>
                </div>
                <p className="text-sm opacity-75">
                  Secure access to Rwanda&#39;s comprehensive land administration data.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm opacity-75">
                  <li><Link href="/register" className="hover:text-blue transition-colors">Register</Link></li>
                  <li><Link href="/login" className="hover:text-blue transition-colors">Sign In</Link></li>
                  <li><Link href="https://www.lands.rw" className="hover:text-blue transition-colors">About NLA</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Data Access</h4>
                <ul className="space-y-2 text-sm opacity-75">
                  <li>Parcel Information</li>
                  <li>Transaction Records</li>
                  <li>Analytics & Reports</li>
                  <li>Administrative Data</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Contact</h4>
                <div className="space-y-2 text-sm opacity-75">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    info@nla.gov.rw
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    +250 788 000 000
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Kigali, Rwanda
                  </div>
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