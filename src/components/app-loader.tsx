"use client"

import { FileText, Database, BarChart3 } from "lucide-react"

export default function AppLoader() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
            <div className="text-center space-y-8">
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-xl shadow-lg">
                                <FileText className="h-8 w-8 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-secondary rounded-full flex items-center justify-center animate-pulse">
                                <Database className="h-3 w-3 text-white" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">NLA Data Portal</h1>
                        <p className="text-gray-600">Loading your dashboard...</p>
                    </div>
                </div>

                {/* Animated Icons */}
                <div className="flex justify-center space-x-8">
                    <div className="animate-bounce" style={{ animationDelay: '0ms' }}>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <div className="animate-bounce" style={{ animationDelay: '200ms' }}>
                        <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                            <Database className="h-6 w-6 text-secondary" />
                        </div>
                    </div>
                    <div className="animate-bounce" style={{ animationDelay: '400ms' }}>
                        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-accent" />
                        </div>
                    </div>
                </div>

                <div className="w-64 mx-auto">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-primary via-secondary to-accent h-2 rounded-full animate-pulse"></div>
                    </div>
                </div>

                <div className="relative w-48 h-12 mx-auto">
                    <div className="absolute inset-0 flex items-center justify-between">
                        <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
                        <div className="w-3 h-3 bg-secondary rounded-full animate-ping" style={{ animationDelay: '300ms' }}></div>
                        <div className="w-3 h-3 bg-accent rounded-full animate-ping" style={{ animationDelay: '600ms' }}></div>
                    </div>
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-0.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-30"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}