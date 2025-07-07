declare module 'rwanda' {
    export function Provinces(): string[]
    export function Districts(): string[]
    export function Districts(province: string): string[] | undefined
    export function Sectors(): string[]
    export function Sectors(province: string, district: string): string[] | undefined
    export function Cells(): string[]
    export function Cells(province: string, district: string, sector: string): string[] | undefined
    export function Villages(): string[]
    export function Villages(province: string, district: string, sector: string, cell: string): string[] | undefined

    export function District(province: string): string[] | undefined
    export function Sector(province: string, district: string): string[] | undefined
    export function Cell(province: string, district: string, sector: string): string[] | undefined
    export function Village(province: string, district: string, sector: string, cell: string): string[] | undefined
}