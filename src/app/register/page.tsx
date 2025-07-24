"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Eye, EyeOff, Building, User, Info } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { USER_TYPES } from '@/lib/data'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: '',
        organizationName: '',
        organizationEmail: '',
        organizationWebsite: '',
        position: '',
        purpose: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleUserTypeChange = (value: string) => {
        setFormData({
            ...formData,
            userType: value,
            // Clear organization fields if switching to individual
            ...(value === 'individual' ? {
                organizationName: '',
                organizationEmail: '',
                organizationWebsite: '',
                position: ''
            } : {})
        })
    }

    const isOrganization = formData.userType !== 'individual' && formData.userType !== ''
    const selectedUserType = USER_TYPES.find(type => type.value === formData.userType)

    const validateForm = () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !formData.userType) {
            toast.error('Please fill in all required fields')
            return false
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return false
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return false
        }

        // Organization-specific validation
        if (isOrganization) {
            if (!formData.organizationName || !formData.organizationEmail || !formData.position) {
                toast.error('Please fill in all organization details')
                return false
            }

            // Validate organization email domain
            const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
            const emailDomain = formData.organizationEmail.split('@')[1]?.toLowerCase()

            if (personalDomains.includes(emailDomain)) {
                toast.error('Please use your organization\'s official email address')
                return false
            }

            if (formData.email === formData.organizationEmail) {
                toast.error('Personal and organization emails should be different')
                return false
            }
        }

        if (!formData.purpose.trim()) {
            toast.error('Please describe the purpose of your data access request')
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 2000))

            toast.success('Registration successful! Please check your email to verify your account.')
            router.push('/login')
        } catch (error: any) {
            console.log(error)
            toast.error('Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
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
                <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 flex-col justify-center items-start p-8 lg:p-10">
                    <div className="flex items-center mb-8">
                        <Image
                            src="/images/favicon.png"
                            alt="NLA Logo"
                            width={100}
                            height={100}
                            className="object-contain"
                        />
                        <div className="text-white">
                            <h1 className="text-2xl font-bold text-blue">NLA</h1>
                            <p className="text-xs opacity-90 text-light-blue">National Land Authority</p>
                        </div>
                    </div>

                    <div className="text-white max-w-lg">
                        <h2 className="text-2xl lg:text-4xl font-bold mb-6 leading-tight">
                            JOIN OUR<br />
                            <span className="text-green-500">RESEARCH COMMUNITY</span>
                        </h2>
                        <p className="lg:text-lg opacity-90 mb-8">
                            Register to access Rwanda&#39;s land data for research and analysis purposes with proper authorization.
                        </p>
                        <div className="flex items-center space-x-6 text-xs">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue rounded-full mr-2"></div>
                                Research Access
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green rounded-full mr-2"></div>
                                Data Privacy
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-yellow rounded-full mr-2"></div>
                                Verified Users
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-3/5 xl:w-2/3 flex items-center justify-center p-4 lg:p-8">
                    <div className="w-full max-w-2xl">
                        <div className="lg:hidden text-center mb-6">
                            <div className="flex justify-center items-center mb-4">
                                <Image
                                    src="/images/favicon.png"
                                    alt="NLA Logo"
                                    width={70}
                                    height={70}
                                    className="object-contain"
                                />
                                <div className="text-white">
                                    <h1 className="text-lg text-blue font-bold">NLA Data Portal</h1>
                                    <p className="text-sm text-yellow opacity-90">National Land Authority</p>
                                </div>
                            </div>
                        </div>

                        <Card className="bg-white border-0">
                            <CardHeader className="text-center pb-4">
                                <CardTitle className="text-xl font-bold text-gray-900">
                                    Register as External User
                                </CardTitle>
                                <CardDescription className="text-gray-600">
                                    Create your account to request access to land data
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* User Type Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="userType" className="text-gray-700 text-sm font-medium">
                                            Account Type *
                                        </Label>
                                        <Select value={formData.userType} onValueChange={handleUserTypeChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your account type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {USER_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        <div className="flex items-center">
                                                            {type.value === 'individual' ? (
                                                                <User className="h-4 w-4 mr-2" />
                                                            ) : (
                                                                <Building className="h-4 w-4 mr-2" />
                                                            )}
                                                            <div>
                                                                <div className="font-medium">{type.label}</div>
                                                                <div className="text-xs text-gray-500">{type.description}</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedUserType && (
                                            <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-blue-800">{selectedUserType.description}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Personal Information */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName" className="text-gray-700 text-sm">
                                                First Name *
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
                                                Last Name *
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
                                        <Label htmlFor="email" className="text-gray-700 text-sm">
                                            Personal Email *
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="Enter your personal email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* Organization Information */}
                                    {isOrganization && (
                                        <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                            <h4 className="font-medium text-gray-900 flex items-center">
                                                <Building className="h-4 w-4 mr-2" />
                                                Organization Information
                                            </h4>

                                            <div className="space-y-2">
                                                <Label htmlFor="organizationName" className="text-gray-700 text-sm">
                                                    Organization Name *
                                                </Label>
                                                <Input
                                                    id="organizationName"
                                                    name="organizationName"
                                                    type="text"
                                                    placeholder="Enter organization name"
                                                    value={formData.organizationName}
                                                    onChange={handleChange}
                                                    disabled={isLoading}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="organizationEmail" className="text-gray-700 text-sm">
                                                        Organization Email *
                                                    </Label>
                                                    <Input
                                                        id="organizationEmail"
                                                        name="organizationEmail"
                                                        type="email"
                                                        placeholder="Enter organization email"
                                                        value={formData.organizationEmail}
                                                        onChange={handleChange}
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="organizationWebsite" className="text-gray-700 text-sm">
                                                        Organization Website
                                                    </Label>
                                                    <Input
                                                        id="organizationWebsite"
                                                        name="organizationWebsite"
                                                        type="url"
                                                        placeholder="https://example.com"
                                                        value={formData.organizationWebsite}
                                                        onChange={handleChange}
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="position" className="text-gray-700 text-sm">
                                                    Your Position/Role *
                                                </Label>
                                                <Input
                                                    id="position"
                                                    name="position"
                                                    type="text"
                                                    placeholder="e.g., Research Director, Project Manager"
                                                    value={formData.position}
                                                    onChange={handleChange}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Password Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-gray-700 text-sm">
                                                Password *
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
                                                Confirm Password *
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
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-green hover:bg-green/90 text-white"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            'Create Account'
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