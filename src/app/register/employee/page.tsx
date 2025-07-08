"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'

export default function EmployeeRegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        employeeNumber: '',
        workEmail: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.firstName || !formData.lastName || !formData.employeeNumber || !formData.workEmail || !formData.password || !formData.confirmPassword) {
            toast.error('Please fill in all fields')
            return
        }

        if (!formData.workEmail.includes('@nla.gov.rw')) {
            toast.error('Please use your NLA work email (@nla.gov.rw)')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setIsLoading(true)

        await new Promise(resolve => setTimeout(resolve, 1500))

        toast.success('Registration successful! Your account has been created and activated.')
        setIsLoading(false)
        router.push('/login')
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            <Image
                src="/images/register.png"
                alt="Rwanda landscape"
                fill
                className="object-cover"
                priority
            />

            <div className="absolute inset-0 bg-black/30" />

            <div className="relative z-10 min-h-screen flex">
                <div className="hidden md:flex md:w-1/2 lg:w-2/5 xl:w-1/3 flex-col justify-center items-start p-8 lg:p-16">
                    <div className="flex items-center mb-8">
                        <Image
                            src="/images/favicon.png"
                            alt="NLA Logo"
                            width={60}
                            height={60}
                            className="object-contain"
                        />
                        <div className="text-white">
                            <h1 className="text-2xl font-bold text-blue">NLA</h1>
                            <p className="text-xs opacity-90 text-light-blue">National Land Authority</p>
                        </div>
                    </div>

                    <div className="text-white max-w-lg">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                            WELCOME<br />
                            <span className="text-yellow">NLA EMPLOYEE</span>
                        </h2>
                        <p className="lg:text-lg opacity-90 mb-8">
                            Register with your official NLA credentials to access internal land administration tools and data.
                        </p>
                        <div className="flex items-center space-x-6 text-xs">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue rounded-full mr-2"></div>
                                Internal Access
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green rounded-full mr-2"></div>
                                Full Features
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-yellow rounded-full mr-2"></div>
                                Official Staff
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/2 lg:w-3/5 xl:w-2/3 flex items-center justify-center p-4 md:p-8">
                    <div className="w-full max-w-lg">
                        <div className="md:hidden text-center mb-6">
                            <div className="flex justify-center items-center mb-4">
                                <Image
                                    src="/images/favicon.png"
                                    alt="NLA Logo"
                                    width={50}
                                    height={50}
                                    className="object-contain"
                                />
                                <div className="text-white">
                                    <h1 className="text-xl text-blue font-bold">NLA Data Portal</h1>
                                    <p className="text-sm text-yellow opacity-90">National Land Authority</p>
                                </div>
                            </div>
                        </div>

                        <Card className="bg-white border-0">
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-xl font-bold text-gray-900">
                                    Employee Registration
                                </CardTitle>
                                <CardDescription className="text-gray-600">
                                    Register with your NLA employee credentials
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName" className="text-gray-700 text-sm">
                                                First Name
                                            </Label>
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                type="text"
                                                placeholder="Enter first name"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName" className="text-gray-700 text-sm">
                                                Last Name
                                            </Label>
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                type="text"
                                                placeholder="Enter last name"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="employeeNumber" className="text-gray-700 text-sm">
                                            Employee Number
                                        </Label>
                                        <Input
                                            id="employeeNumber"
                                            name="employeeNumber"
                                            type="text"
                                            placeholder="Enter your employee number"
                                            value={formData.employeeNumber}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="workEmail" className="text-gray-700 text-sm">
                                            Work Email
                                        </Label>
                                        <Input
                                            id="workEmail"
                                            name="workEmail"
                                            type="email"
                                            placeholder="your.name@nla.gov.rw"
                                            value={formData.workEmail}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-gray-700 text-sm">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-gray-700 text-sm">
                                            Confirm Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm your password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-yellow hover:bg-yellow/90 text-black font-medium"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            'CREATE EMPLOYEE ACCOUNT'
                                        )}
                                    </Button>
                                </form>

                                <div className="text-center text-sm text-gray-600">
                                    OR
                                </div>

                                <div className="flex justify-center items-center space-y-1">
                                    <Link href="/login">
                                        Already have an account? <span className="text-blue hover:underline">Sign In</span>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}