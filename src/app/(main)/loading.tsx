import AppLoader from '@/components/app-loader'

export default function MainLoading() {
    return (
        <AppLoader
            variant="main"
            message="Loading Dashboard"
            subMessage="Preparing your land data interface..."
        />
    )
}