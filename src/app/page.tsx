"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
        
        <section className="relative h-screen overflow-hidden">
          <Image
              src="/images/landing-1.png"
              alt="Rwanda landscape"
              fill
              className="object-cover"
              priority
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 h-full flex flex-col">
            
            <nav className="flex justify-between items-center p-6 lg:p-8">
              <div className="flex items-center">
                <Image
                    src="/images/favicon.png"
                    alt="NLA Logo"
                    width={50}
                    height={50}
                    className="object-contain mr-3"
                />
                <div className="text-white">
                  <h1 className="text-xl font-bold">NLA Data Portal</h1>
                  <p className="text-xs opacity-90">National Land Authority</p>
                </div>
              </div>
              <div className="hidden md:flex space-x-4">
                <Link href="/login">
                  <Button  className="bg-yellow  text-green hover:bg-green hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-blue hover:bg-blue/90 text-white">
                    Register
                  </Button>
                </Link>
              </div>
            </nav>

            
            <div className="flex-1 flex items-center justify-center px-6 lg:px-8">
              <div className="text-center text-white max-w-4xl">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                  RWANDA&#39;S COMPREHENSIVE<br />
                  <span className="text-blue">LAND DATA PORTAL</span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90">
                  Access secure, verified land administration data for research, planning, and development
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/login">
                    <Button size="lg" className="bg-green hover:bg-green/90 text-white px-8 py-4 text-lg">
                      Get Started Today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        
        <section className="py-20 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                What Data Can You <span className="text-blue">Access?</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore Rwanda&#39;s comprehensive land data repository with verified, up-to-date information across multiple categories
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {dataTypes.map((item, index) => (
                  <Card key={index} className="border-0 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center mb-4">
                        <div className="p-3 bg-blue/10 rounded-lg mr-4">
                          <item.icon className="h-8 w-8 text-blue" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{item.title}</CardTitle>
                        </div>
                      </div>
                      <CardDescription className="text-gray-600 text-base">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {item.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green mr-2" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
              ))}
            </div>

            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue mb-2">1M+</div>
                <div className="text-gray-600">Registered Parcels</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green mb-2">500K+</div>
                <div className="text-gray-600">Processed Transactions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow mb-2">30</div>
                <div className="text-gray-600">Districts Covered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue mb-2">99.9%</div>
                <div className="text-gray-600">Data Accuracy</div>
              </div>
            </div>
          </div>
        </section>

        
        <section className="py-20 px-6 lg:px-8 relative">
          <Image
              src="/images/landing-2.png"
              alt="Rwanda landscape"
              fill
              className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Why Choose <span className="text-yellow">NLA Data Portal?</span>
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Trusted by researchers, government agencies, and development partners nationwide
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                  <div key={index} className="text-center text-white">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-4">
                      <benefit.icon className="h-12 w-12 text-yellow mx-auto mb-4" />
                      <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                      <p className="text-white/80 text-sm">{benefit.description}</p>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </section>

        
        <section className="py-20 px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Who Can <span className="text-green">Access Our Data?</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Different access levels for different user types, ensuring appropriate data security and privacy
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {userTypes.map((user, index) => (
                  <Card key={index} className=" hover:shadow-lg transition-shadow text-center">
                    <CardHeader>
                      <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-10 w-10 text-gray-600" />
                      </div>
                      <CardTitle className="text-xl">{user.type}</CardTitle>
                      <div className={`text-sm font-medium ${user.color}`}>
                        {user.access}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{user.description}</p>
                    </CardContent>
                  </Card>
              ))}
            </div>
          </div>
        </section>

        
        <section className="py-20 px-6 lg:px-8 relative">
          <Image
              src="/images/landing-3.png"
              alt="Rwanda landscape"
              fill
              className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Access Rwanda&#39;s Land Data?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of researchers, planners, and organizations already using our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-blue hover:bg-blue/90 text-white px-8 py-4 text-lg">
                  Register for External Access
                </Button>
              </Link>
              <Link href="/register/employee">
                <Button size="lg" className="bg-yellow hover:bg-yellow/90 text-black px-8 py-4 text-lg">
                  Employee Registration
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <footer className="bg-gray-900 text-white py-12 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
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
                  <li><Link href="/register" className="hover:text-blue">Register</Link></li>
                  <li><Link href="/login" className="hover:text-blue">Sign In</Link></li>
                  <li><Link href="https://www.lands.rw" className="hover:text-blue">About NLA</Link></li>
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
              <p>&copy; {new Date().getFullYear()}  National Land Authority. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
  )
}