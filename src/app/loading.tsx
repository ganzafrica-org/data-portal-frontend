import AppLoader from '@/components/app-loader'

export default function PublicLoading() {
    return (
        <AppLoader
            variant="public"
            message="NLA Data Portal"
            subMessage="Loading Rwanda's Land Data Portal..."
        />
    )
}