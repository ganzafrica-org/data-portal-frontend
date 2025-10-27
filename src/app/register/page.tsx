"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
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
import type { RegisterRequest } from '@/lib/api-config'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: '' as RegisterRequest['userType'] | '',
        nationality: '',
        identityNumber: '',
        organizationName: '',
        organizationEmail: '',
        phone: '',
        address: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { register } = useAuth()
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
            userType: value as RegisterRequest['userType'],
            // Clear organization fields if switching to individual
            ...(value === 'individual' ? {
                organizationName: '',
                organizationEmail: ''
            } : {})
        })
    }

    const isOrganization = formData.userType !== 'individual' && formData.userType !== ''
    const selectedUserType = USER_TYPES.find(type => type.value === formData.userType)

    const validateForm = () => {
        // Check required fields
        if (!formData.name.trim()) {
            toast.error('Please enter your full name')
            return false
        }

        if (!formData.email.trim()) {
            toast.error('Please enter your email')
            return false
        }

        if (!formData.password) {
            toast.error('Please enter a password')
            return false
        }

        if (!formData.confirmPassword) {
            toast.error('Please confirm your password')
            return false
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return false
        }

        // API password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
        if (!passwordRegex.test(formData.password)) {
            toast.error('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number')
            return false
        }

        if (!formData.userType) {
            toast.error('Please select your account type')
            return false
        }

        if (!formData.nationality.trim()) {
            toast.error('Please enter your nationality')
            return false
        }

        if (!formData.identityNumber.trim()) {
            toast.error('Please enter your identity/passport number')
            return false
        }

        if (!formData.phone.trim()) {
            toast.error('Please enter your phone number')
            return false
        }

        // Phone validation
        const phoneRegex = /^[\d\s\+\-\(\)]+$/
        if (!phoneRegex.test(formData.phone)) {
            toast.error('Please enter a valid phone number')
            return false
        }

        // Organization-specific validation
        if (isOrganization && !formData.organizationName.trim()) {
            toast.error('Please enter your organization name')
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)

        try {
            // Prepare data according to API requirements
            const registerData: RegisterRequest = {
                email: formData.email.trim(),
                password: formData.password,
                name: formData.name.trim(),
                userType: formData.userType as RegisterRequest['userType'],
                nationality: formData.nationality.trim(),
                identityNumber: formData.identityNumber.trim(),
                phone: formData.phone.trim(),
                ...(formData.address.trim() && { address: formData.address.trim() }),
                ...(isOrganization && formData.organizationName.trim() && {
                    organizationName: formData.organizationName.trim()
                }),
                ...(isOrganization && formData.organizationEmail.trim() && {
                    organizationEmail: formData.organizationEmail.trim()
                })
            }

            const result = await register(registerData)

            if (result.success) {
                toast.success('Registration successful! Please check your email to verify your account.')
                router.push('/login')
            } else {
                toast.error(result.error || 'Registration failed. Please try again.')
            }
        } catch (error: any) {
            console.error('Registration error:', error)
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
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-gray-700 text-sm">
                                            Full Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-700 text-sm">
                                            Email Address *
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="Enter your email address"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nationality" className="text-gray-700 text-sm">
                                                Nationality *
                                            </Label>
                                            <Input
                                                id="nationality"
                                                name="nationality"
                                                type="text"
                                                placeholder="e.g., Rwandan"
                                                value={formData.nationality}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="identityNumber" className="text-gray-700 text-sm">
                                                Identity/Passport Number *
                                            </Label>
                                            <Input
                                                id="identityNumber"
                                                name="identityNumber"
                                                type="text"
                                                placeholder="Enter your ID or passport number"
                                                value={formData.identityNumber}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-gray-700 text-sm">
                                            Phone Number *
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="+250 XXX XXX XXX"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-gray-700 text-sm">
                                            Address (Optional)
                                        </Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            type="text"
                                            placeholder="Enter your address"
                                            value={formData.address}
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

                                            <div className="space-y-2">
                                                <Label htmlFor="organizationEmail" className="text-gray-700 text-sm">
                                                    Organization Email (Optional)
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
                                            <p className="text-xs text-gray-500">
                                                Min 8 chars, 1 uppercase, 1 lowercase, 1 number
                                            </p>
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