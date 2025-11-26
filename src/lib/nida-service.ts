/**
 * NIDA (National Identification Agency) Service
 *
 * This service calls our backend which in turn calls the NIDA API
 * to verify Rwandan National IDs and fetch citizen information.
 */

import apiClient, { getErrorMessage, ApiResponse } from "./api-config";

export interface PhoneNumber {
  number: string;
  operator: string;
  servicePeriod: string;
}

export interface NidaData {
  fullName: string;
  foreName: string;
  surnames: string;
  dateOfBirth: string;
  sex: string;
  nationality: string;
  identityNumber: string;
  phone: string;
  phoneNumbers: PhoneNumber[];
  address: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  civilStatus?: string;
  maritalStatus?: string;
  placeOfBirth?: string;
  countryOfBirth?: string;
  dateOfIssue?: string;
  dateOfExpiry?: string;
  documentNumber?: string;
}

export interface NidaVerificationResult {
  success: boolean;
  data?: NidaData;
  error?: string;
}

/**
 * Verify a Rwandan National ID through our backend API
 * @param nationalId - The 16-digit Rwandan National ID number
 * @returns Promise containing verification result with citizen data
 */
export async function verifyNationalId(
  nationalId: string,
): Promise<NidaVerificationResult> {
  try {
    // Validate ID format (16 digits)
    const cleanedId = nationalId.replace(/\s/g, "");
    if (!/^\d{16}$/.test(cleanedId)) {
      return {
        success: false,
        error: "Invalid National ID format. Must be 16 digits.",
      };
    }

    const response = await apiClient.post<ApiResponse<NidaData>>(
      "/auth/verify-nida",
      {
        nationalId: cleanedId,
      },
    );

    if (response.data.success && response.data.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return {
      success: false,
      error: response.data.message || "Failed to verify National ID",
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Format a National ID for display (e.g., 1234 5678 9012 3456)
 * @param nationalId - The 16-digit National ID
 * @returns Formatted ID string
 */
export function formatNationalId(nationalId: string): string {
  const cleaned = nationalId.replace(/\s/g, "");
  return cleaned.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

/**
 * Validate National ID format (client-side only)
 * @param nationalId - The National ID to validate
 * @returns True if valid format, false otherwise
 */
export function isValidNationalIdFormat(nationalId: string): boolean {
  return /^\d{16}$/.test(nationalId.replace(/\s/g, ""));
}
