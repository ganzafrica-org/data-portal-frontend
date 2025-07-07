"use client"

import { FileText, Database, BarChart3 } from "lucide-react"

export default function AppLoader() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 flex items-center justify-center">
            <div className="text-center space-y-8">
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl">
                                <FileText className="h-10 w-10 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                                <Database className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 bg-clip-text text-transparent">
                            NLA Data Portal
                        </h1>
                    </div>
                </div>

                
                <div className="flex justify-center space-x-6">
                    <div className="animate-bounce" style={{ animationDelay: '0ms' }}>
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-lg">
                            <FileText className="h-7 w-7 text-blue-600" />
                        </div>
                    </div>
                    <div className="animate-bounce" style={{ animationDelay: '200ms' }}>
                        <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
                            <Database className="h-7 w-7 text-green-500" />
                        </div>
                    </div>
                    <div className="animate-bounce" style={{ animationDelay: '400ms' }}>
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center shadow-lg">
                            <BarChart3 className="h-7 w-7 text-yellow-500" />
                        </div>
                    </div>
                </div>

                
                <div className="w-80 mx-auto">
                    <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                        <div className="bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 h-3 rounded-full animate-pulse shadow-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>Initializing...</span>
                        <span>Loading data...</span>
                        <span>Ready!</span>
                    </div>
                </div>

                
                <div className="relative w-64 h-16 mx-auto">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-1 bg-gradient-to-r from-blue-200 via-green-200 to-yellow-200 rounded-full"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                        <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full animate-ping shadow-lg"></div>
                        <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full animate-ping shadow-lg" style={{ animationDelay: '500ms' }}></div>
                        <div className="w-4 h-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full animate-ping shadow-lg" style={{ animationDelay: '1000ms' }}></div>
                    </div>
                    
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full shadow-lg animate-pulse" style={{
                            animation: 'moveAcross 3s infinite linear',
                            animationDelay: '0s'
                        }}></div>
                    </div>
                </div>

                
                <div className="space-y-2">
                    <div className="flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-blue rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-yellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Please wait while we prepare your experience</p>
                </div>
            </div>

            <style jsx>{`
                @keyframes moveAcross {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(256px); }
                }
            `}</style>
        </div>
    )
}