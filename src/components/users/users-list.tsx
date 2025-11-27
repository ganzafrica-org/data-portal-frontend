"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, CheckCircle, XCircle, Eye, Mail, Building, User as UserIcon } from "lucide-react"
import Link from "next/link"
import { User } from "@/lib/api-config"

interface UsersListProps {
  users: User[]
}

export function UsersList({ users }: UsersListProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'internal':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'external':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator'
      case 'internal':
        return 'Internal Staff'
      case 'external':
        return 'External User'
      default:
        return role
    }
  }

  const getUserTypeLabel = (userType: string) => {
    const labels: Record<string, string> = {
      'individual': 'Individual',
      'academic_institution': 'Academic',
      'research_organization': 'Research Org',
      'private_company': 'Private Company',
      'ngo': 'NGO',
      'government_agency': 'Government',
      'international_organization': 'International',
      'employee': 'Employee'
    }
    return labels[userType] || userType
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-600">Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white p-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {user.organizationName ? (
                      <Building className="h-5 w-5 text-gray-600" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.organizationName || user.name}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getRoleColor(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {getUserTypeLabel(user.userType)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {user.isVerified ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-600 text-sm">
                      <XCircle className="h-4 w-4" />
                      <span>Unverified</span>
                    </div>
                  )}
                  {user.isActive ? (
                    <span className="text-xs text-green-600">Active</span>
                  ) : (
                    <span className="text-xs text-red-600">Inactive</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {new Date(user.dateJoined).toLocaleDateString()}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/users/${user.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function UsersListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(count)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-20 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
