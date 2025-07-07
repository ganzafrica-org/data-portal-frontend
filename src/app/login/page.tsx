"use client"

import React, { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">NLA Data Portal</CardTitle>
                        <CardDescription>
                            Sign in to access land data and management tools
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
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
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Demo Credentials:</p>
                        <div className="text-xs space-y-1">
                            <p><strong>External:</strong> john.mukiza@researcher.com</p>
                            <p><strong>Internal:</strong> marie.uwimana@nla.gov.rw</p>
                            <p><strong>Admin:</strong> admin@nla.gov.rw</p>
                            <p><strong>Password:</strong> password</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}