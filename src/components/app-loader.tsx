"use client"

import { FileText, Database, BarChart3 } from "lucide-react"
import Image from "next/image"

interface AppLoaderProps {
    variant?: 'public' | 'main' | 'default'
    message?: string
    subMessage?: string
}

export default function AppLoader({
                                      variant = 'default',
                                      message = "NLA Data Portal",
                                      subMessage = "Loading..."
                                  }: AppLoaderProps) {

    if (variant === 'public') {
        return (
            <div className="min-h-screen relative overflow-hidden">
                
                <Image
                    src="/images/landing-1.png"
                    alt="Rwanda landscape"
                    fill
                    className="object-cover"
                    priority
                />

                
                <div className="absolute inset-0 bg-black/40" />

                
                <div className="relative z-10 min-h-screen flex items-center justify-center">
                    <div className="text-center text-white space-y-8">
                        
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                        <FileText className="h-10 w-10 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue rounded-full flex items-center justify-center animate-pulse">
                                        <Database className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">
                                    {message}
                                </h1>
                                <p className="text-white/80 mt-2">National Land Authority</p>
                            </div>
                        </div>

                        
                        <div className="space-y-6">
                            <div className="flex justify-center space-x-2">
                                <div className="w-3 h-3 bg-blue rounded-full animate-bounce"></div>
                                <div className="w-3 h-3 bg-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-3 h-3 bg-yellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>

                            <div className="w-64 mx-auto">
                                <div className="w-full bg-white/20 rounded-full h-2">
                                    <div className="bg-blue h-2 rounded-full animate-pulse w-3/4"></div>
                                </div>
                            </div>

                            <p className="text-lg text-white/90 font-medium">
                                {subMessage}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (variant === 'main') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-8 max-w-md mx-auto px-4">
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="flex items-center justify-center w-20 h-20 bg-blue/10 rounded-2xl">
                                    <Database className="h-10 w-10 text-blue" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green rounded-full flex items-center justify-center animate-pulse">
                                    <BarChart3 className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {message}
                            </h1>
                            <p className="text-gray-600 mt-2">National Land Authority</p>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-6">
                        <div className="animate-pulse" style={{ animationDelay: '0ms' }}>
                            <div className="w-12 h-12 bg-blue/10 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-blue" />
                            </div>
                        </div>
                        <div className="animate-pulse" style={{ animationDelay: '200ms' }}>
                            <div className="w-12 h-12 bg-green/10 rounded-lg flex items-center justify-center">
                                <Database className="h-6 w-6 text-green" />
                            </div>
                        </div>
                        <div className="animate-pulse" style={{ animationDelay: '400ms' }}>
                            <div className="w-12 h-12 bg-yellow/10 rounded-lg flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-yellow" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="w-80 mx-auto">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue h-2 rounded-full animate-pulse w-2/3"></div>
                            </div>
                        </div>

                        <div className="flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-blue rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-yellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>

                        <p className="text-lg text-gray-600 font-medium">
                            {subMessage}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center space-y-8">
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="flex items-center justify-center w-20 h-20 bg-blue rounded-2xl">
                                <FileText className="h-10 w-10 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green rounded-full flex items-center justify-center animate-pulse">
                                <Database className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {message}
                        </h1>
                        <p className="text-gray-600 mt-2">National Land Authority</p>
                    </div>
                </div>

                <div className="flex justify-center space-x-6">
                    <div className="animate-bounce" style={{ animationDelay: '0ms' }}>
                        <div className="w-14 h-14 bg-blue/10 rounded-xl flex items-center justify-center">
                            <FileText className="h-7 w-7 text-blue" />
                        </div>
                    </div>
                    <div className="animate-bounce" style={{ animationDelay: '200ms' }}>
                        <div className="w-14 h-14 bg-green/10 rounded-xl flex items-center justify-center">
                            <Database className="h-7 w-7 text-green" />
                        </div>
                    </div>
                    <div className="animate-bounce" style={{ animationDelay: '400ms' }}>
                        <div className="w-14 h-14 bg-yellow/10 rounded-xl flex items-center justify-center">
                            <BarChart3 className="h-7 w-7 text-yellow" />
                        </div>
                    </div>
                </div>

                <div className="w-80 mx-auto">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-blue h-3 rounded-full animate-pulse w-2/3"></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>Loading...</span>
                        <span>Please wait</span>
                        <span>Almost ready</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-blue rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-yellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{subMessage}</p>
                </div>
            </div>
        </div>
    )
}