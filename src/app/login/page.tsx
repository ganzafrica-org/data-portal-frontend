"use client"

import React, { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Eye, EyeOff, User, Building } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const { login, isLoading } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !password) {
            toast.error('Please fill in all fields')
            return
        }

        const success = await login(email, password)

        if (success) {
            toast.success('Login successful')
            router.push('/dashboard')
        } else {
            toast.error('Invalid credentials. Try password: "password"')
        }
    }

    const demoAccounts = [
        {
            type: 'Individual Researcher',
            email: 'john.mukiza@researcher.com',
            role: 'External',
            icon: <User className="h-4 w-4" />,
            color: 'bg-blue-100 text-blue-800'
        },
        {
            type: 'Academic Institution',
            email: 'sarah.johnson@university.edu',
            role: 'External',
            icon: <Building className="h-4 w-4" />,
            color: 'bg-purple-100 text-purple-800'
        },
        {
            type: 'Private Company',
            email: 'david.smith@consultancy.com',
            role: 'External',
            icon: <Building className="h-4 w-4" />,
            color: 'bg-orange-100 text-orange-800'
        },
        {
            type: 'NLA Employee',
            email: 'marie.uwimana@nla.gov.rw',
            role: 'Internal',
            icon: <User className="h-4 w-4" />,
            color: 'bg-green-100 text-green-800'
        },
        {
            type: 'NLA Admin',
            email: 'admin@nla.gov.rw',
            role: 'Admin',
            icon: <User className="h-4 w-4" />,
            color: 'bg-red-100 text-red-800'
        }
    ]

    return (
        <div className="min-h-screen relative overflow-hidden">
            <Image
                src="/images/login.png"
                alt="Rwanda landscape"
                fill
                className="object-cover"
                priority
            />

            <div className="absolute inset-0 bg-black/30" />

            <div className="relative z-10 min-h-screen flex">
                <div className="hidden md:flex md:w-1/2 lg:w-2/5 xl:w-1/3 flex-col justify-center items-start p-8 lg:p-10">
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
                            ACCESS RWANDA&#39;S<br />
                            <span className="text-blue">LAND DATA</span>
                        </h2>
                        <p className="lg:text-lg opacity-90 mb-8">
                            Secure and comprehensive access to national land administration data for authorized users across various sectors.
                        </p>
                        <div className="flex items-center space-x-6 text-xs">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue rounded-full mr-2"></div>
                                Trusted Platform
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green rounded-full mr-2"></div>
                                Secure Access
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-yellow rounded-full mr-2"></div>
                                Real-time Data
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
                                    Sign In
                                </CardTitle>
                                <CardDescription className="text-gray-600">
                                    Enter your credentials to access the portal
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-700 text-sm">
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
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
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
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

                                    <div className="text-right">
                                        <Link href="/forgot-password" className="text-sm text-blue hover:underline">
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-blue hover:bg-blue/90 text-white"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            'SIGN IN'
                                        )}
                                    </Button>
                                </form>

                                <div className="text-center text-sm text-gray-600">
                                    OR
                                </div>

                                <div className="flex flex-col space-y-2">
                                    <Link href="/register">
                                        <Button
                                            variant="outline"
                                            className="w-full border-blue text-blue hover:text-white hover:bg-blue"
                                        >
                                            <User className="h-4 w-4 mr-2" />
                                            Register as External User
                                        </Button>
                                    </Link>
                                    <Link href="/register/employee">
                                        <Button
                                            variant="outline"
                                            className="w-full border-green text-green hover:text-white hover:bg-green"
                                        >
                                            <Building className="h-4 w-4 mr-2" />
                                            Register as Employee
                                        </Button>
                                    </Link>
                                </div>

                                {/* Demo Credentials */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                                    <h4 className="font-medium mb-3 text-gray-900">Demo Accounts</h4>
                                    <div className="space-y-2">
                                        {demoAccounts.map((account, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border text-xs">
                                                <div className="flex items-center space-x-2">
                                                    {account.icon}
                                                    <span className="font-medium text-gray-700">{account.type}</span>
                                                    <Badge className={account.color} variant="outline">
                                                        {account.role}
                                                    </Badge>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEmail(account.email)
                                                        setPassword("password")
                                                    }}
                                                    className="text-blue hover:underline"
                                                >
                                                    Use
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}