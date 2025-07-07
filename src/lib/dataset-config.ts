interface Dataset {
    id: string
    name: string
    description: string
    requiresPeriod?: boolean
    requiresUpiList?: boolean
    requiresIdList?: boolean
    requiresUpi?: boolean
    hasAdminLevel?: boolean
    hasUserLevel?: boolean
    hasTransactionType?: boolean
    hasLandUse?: boolean
    hasSizeRange?: boolean
    criteria: string[]
    fields?: string[]
}

interface DatasetCategory {
    name: string
    icon: string
    description: string
    datasets: Dataset[]
}

export const DATASET_CATEGORIES: Record<string, DatasetCategory> = {
    'transaction-reports': {
        name: 'Transaction Reports',
        icon: '📊',
        description: 'Reports on land transaction activities and statistics',
        datasets: [
            {
                id: 'pending-transactions',
                name: 'Transactions Pending for Approval',
                description: 'Track transactions awaiting administrative approval',
                requiresPeriod: true,
                hasAdminLevel: true,
                hasTransactionType: true,
                criteria: ['administrativeLevel', 'transactionType', 'period']
            },
            {
                id: 'approved-applications',
                name: 'Approved Applications',
                description: 'Statistics on approved land applications',
                requiresPeriod: true,
                hasAdminLevel: true,
                hasTransactionType: true,
                criteria: ['administrativeLevel', 'transactionType', 'period']
            },
            {
                id: 'approved-transfers',
                name: 'Approved Land Transfers',
                description: 'Details of completed land transfers',
                requiresPeriod: true,
                hasAdminLevel: true,
                fields: ['upi', 'province', 'district', 'sector', 'cell', 'village', 'size', 'approval_date', 'sale_price', 'transfer_type'],
                criteria: ['administrativeLevel', 'period']
            }
        ]
    },
    'user-reports': {
        name: 'User Activity Reports',
        icon: '👥',
        description: 'Reports on user activities and performance metrics',
        datasets: [
            {
                id: 'user-processed-applications',
                name: 'Applications Processed by User',
                description: 'Track staff productivity and application processing',
                requiresPeriod: true,
                hasUserLevel: true,
                criteria: ['userId', 'period']
            }
        ]
    },
    'parcel-reports': {
        name: 'Parcel Analysis Reports',
        icon: '🗺️',
        description: 'Detailed reports on land parcels and their characteristics',
        datasets: [
            {
                id: 'registered-parcels',
                name: 'Registered Parcels Count',
                description: 'Number of registered parcels by administrative area',
                hasAdminLevel: true,
                criteria: ['administrativeLevel']
            },
            {
                id: 'parcels-without-info',
                name: 'Incomplete Parcel Records',
                description: 'Parcels missing essential information',
                hasAdminLevel: true,
                criteria: ['administrativeLevel']
            },
            {
                id: 'parcels-by-land-use',
                name: 'Parcels by Land Use Type',
                description: 'Distribution of parcels across different land use categories',
                hasAdminLevel: true,
                hasLandUse: true,
                criteria: ['administrativeLevel', 'landUse']
            },
            {
                id: 'parcels-by-size',
                name: 'Parcels by Size Range',
                description: 'Analysis of parcel distribution by size categories',
                hasAdminLevel: true,
                hasSizeRange: true,
                criteria: ['administrativeLevel', 'sizeRange']
            },
            {
                id: 'ownership-from-upis',
                name: 'Ownership Details from UPI List',
                description: 'Detailed ownership information for specific parcels',
                requiresUpiList: true,
                fields: ['UPI', 'administrative_level', 'size', 'land_use', 'ownership', 'ID', 'planned_land_use', 'is_mortgaged', 'is_restricted', 'is_provisionally_registered'],
                criteria: ['upiList']
            },
            {
                id: 'upis-from-ids',
                name: 'UPI List from National IDs',
                description: 'Find all parcels owned by specific individuals',
                requiresIdList: true,
                fields: ['UPI', 'administrative_level', 'size', 'land_use', 'ownership', 'ID', 'planned_land_use', 'is_mortgaged', 'is_restricted', 'is_provisionally_registered'],
                criteria: ['idList']
            }
        ]
    },
    'shapefiles': {
        name: 'Spatial Data (Shapefiles)',
        icon: '🌍',
        description: 'Geographic data files for mapping and spatial analysis',
        datasets: [
            {
                id: 'parcel-shapefile',
                name: 'Parcel Boundaries Shapefile',
                description: 'Geographic boundaries and attributes of land parcels',
                hasAdminLevel: true,
                requiresUpi: true,
                fields: ['UPI', 'province', 'district', 'sector', 'cell', 'x', 'y', 'shape', 'latitude', 'longitude', 'existing_land_use', 'planned_land_use', 'owners'],
                criteria: ['administrativeLevel', 'upi']
            }
        ]
    }
}

export const TRANSACTION_TYPES = [
    { value: 'all', label: 'All Transaction Types' },
    { value: 'subdivision', label: 'Subdivision' },
    { value: 'transfer-by-donation', label: 'Transfer By Donation' },
    { value: 'requesting-title-from-public-land', label: 'Requesting Title From Public Land' },
    { value: 'boundary-rectification-area-correction', label: 'Boundary Rectification / Area Correction' },
    { value: 'sporadic-registration', label: 'Sporadic Registration' },
    { value: 'transfer-by-voluntary-sale', label: 'Transfer By Voluntary Sale' },
    { value: 'parcel-merge', label: 'Parcel Merge' },
    { value: 'adding-or-removing-rightholders', label: 'Adding Or Removing Rightholders' },
    { value: 'transfer-by-auction-as-court-order', label: 'Transfer By Auction As Court Order' },
    { value: 'change-parcel-representative', label: 'Change Parcel Representative' },
    { value: 'transfer-by-succession', label: 'Transfer By Succession' },
    { value: 'transfer-by-court-decision', label: 'Transfer By Court Decision' },
    { value: 'cancel-restriction-for-stateland-bufferzone-wetland', label: 'Cancel Restriction For Stateland, Bufferzone, Wetland' },
    { value: 'transfer-by-auction-authorised-by-registrar', label: 'Transfer By Auction Authorised By Registrar' },
    { value: 'transfer-by-exchange', label: 'Transfer By Exchange' },
    { value: 'transfer-by-forced-sale-rra', label: 'Transfer by Forced Sale (RRA)' },
    { value: 'change-of-person-name-or-id', label: 'Change Of Person (Name Or ID)' },
    { value: 'replacement-of-title', label: 'Replacement Of Title' },
    { value: 'cancel-restriction-under-dispute', label: 'Cancel Restriction Under Dispute' },
    { value: 'add-parcel', label: 'Add Parcel' },
    { value: 'convert-rights', label: 'Convert Rights' },
    { value: 'transfer-by-expropriation', label: 'Transfer By Expropriation' },
    { value: 'establish-restriction-by-caveat', label: 'Establish Restriction By Caveat' },
    { value: 'cancel-restriction-by-caveat', label: 'Cancel Restriction By Caveat' },
    { value: 'establish-restriction-by-surety', label: 'Establish Restriction By Surety' },
    { value: 'land-documents-not-collected-during-slr', label: 'Land Documents Not Collected During SLR' },
    { value: 'switch-parcel', label: 'Switch Parcel' },
    { value: 'cancel-restriction-by-surety', label: 'Cancel Restriction By Surety' },
    { value: 'parcel-change-of-land-use', label: 'Parcel Change Of Land Use' },
    { value: 'confirmation-of-ownership', label: 'Confirmation Of Ownership' },
    { value: 'changes-on-right-shares', label: 'Changes On Right Shares' }
]

export const LAND_USE_TYPES = [
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'forestry', label: 'Forestry' },
    { value: 'residential', label: 'Residential' },
    { value: 'wetland-and-water-body', label: 'Wetland and Water Body' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'buffer-zone', label: 'Buffer Zone' },
    { value: 'public-facility', label: 'Public Facility' },
    { value: 'unknown', label: 'Unknown' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'public-utility', label: 'Public Utility' },
    { value: 'ecotourism-parks-open-space', label: 'Ecotourism, Parks, and Open Space' },
    { value: 'public-administration', label: 'Public Administration' }
]