"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Loader2,
  Eye,
  EyeOff,
  Building,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { USER_TYPES } from "@/lib/data";
import type { RegisterRequest } from "@/lib/api-config";
import {
  verifyNationalId,
  isValidNationalIdFormat,
  type NidaData,
} from "@/lib/nida-service";
import {
  PasswordStrength,
  isPasswordValid,
} from "@/components/ui/password-strength";
import { CountryCombobox } from "@/components/ui/country-combobox";
import countries from "world-countries";

const sortedCountries = [
  { name: "Rwanda", code: "RW" },
  ...countries
    .filter((c) => c.name.common !== "Rwanda")
    .map((c) => ({ name: c.name.common, code: c.cca2 }))
    .sort((a, b) => a.name.localeCompare(b.name)),
];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "" as RegisterRequest["userType"] | "",
    nationality: "",
    identityNumber: "",
    organizationName: "",
    organizationEmail: "",
    phone: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [nidaVerified, setNidaVerified] = useState(false);
  const [nidaData, setNidaData] = useState<NidaData | null>(null);
  const [verificationError, setVerificationError] = useState<string>("");
  const [showPhoneSelection, setShowPhoneSelection] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const isRwandan = formData.nationality === "Rwanda";
  const isOrganization =
    formData.userType !== "individual" && formData.userType !== "";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if ((name === "nationality" || name === "identityNumber") && nidaVerified) {
      setNidaVerified(false);
      setNidaData(null);
      setVerificationError("");
    }
  };

  const handleUserTypeChange = (value: string) => {
    setFormData({
      ...formData,
      userType: value as RegisterRequest["userType"],
      ...(value === "individual"
        ? {
            organizationName: "",
            organizationEmail: "",
          }
        : {}),
    });
  };

  const handleNationalityChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      nationality: value,
      identityNumber: "",
      name: "",
      phone: "",
      address: "",
    }));
    setNidaVerified(false);
    setNidaData(null);
    setVerificationError("");
  };

  const handleVerifyNida = async () => {
    if (!formData.identityNumber) {
      setVerificationError("Please enter your National ID");
      return;
    }

    if (!isValidNationalIdFormat(formData.identityNumber)) {
      setVerificationError("Invalid National ID format. Must be 16 digits.");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      const result = await verifyNationalId(formData.identityNumber);

      if (result.success && result.data) {
        setNidaData(result.data);
        setNidaVerified(true);
        setVerificationError("");

        // Update form data with NIDA info
        setFormData((prev) => ({
          ...prev,
          name: result.data!.fullName,
          address: result.data!.address,
          identityNumber: result.data!.identityNumber,
        }));

        // Show phone selection if phone numbers are available
        if (result.data.phoneNumbers && result.data.phoneNumbers.length > 0) {
          setShowPhoneSelection(true);
        } else {
          // Auto-advance if no phone numbers
          setTimeout(() => {
            setCurrentStep(2);
          }, 500);
        }
      } else {
        setVerificationError(result.error || "Failed to verify National ID");
        setNidaVerified(false);
        setNidaData(null);
      }
    } catch (error) {
      setVerificationError("Failed to verify National ID. Please try again.");
      setNidaVerified(false);
      setNidaData(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const validateStep1 = () => {
    if (!formData.userType) {
      toast.error("Please select your account type");
      return false;
    }

    if (!formData.nationality) {
      toast.error("Please select your nationality");
      return false;
    }

    if (isRwandan) {
      if (!formData.identityNumber) {
        toast.error("Please enter your National ID");
        return false;
      }

      if (!nidaVerified) {
        toast.error("Please verify your National ID first");
        return false;
      }
    } else {
      if (!formData.identityNumber.trim()) {
        toast.error("Please enter your passport number");
        return false;
      }

      if (!formData.name.trim()) {
        toast.error("Please enter your full name");
        return false;
      }

      if (!formData.phone.trim()) {
        toast.error("Please enter your phone number");
        return false;
      }

      const phoneRegex = /^[\d\s\+\-\(\)]+$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error("Please enter a valid phone number");
        return false;
      }
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return false;
    }

    if (isOrganization && !formData.organizationName.trim()) {
      toast.error("Please enter your organization name");
      return false;
    }

    if (!formData.password) {
      toast.error("Please enter a password");
      return false;
    }

    if (!isPasswordValid(formData.password)) {
      toast.error("Please meet all password requirements");
      return false;
    }

    if (!formData.confirmPassword) {
      toast.error("Please confirm your password");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      const registerData: RegisterRequest = {
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
        userType: formData.userType as RegisterRequest["userType"],
        nationality: formData.nationality.trim(),
        identityNumber: formData.identityNumber.trim(),
        phone: formData.phone.trim(),
        ...(formData.address.trim() && { address: formData.address.trim() }),
        ...(isOrganization &&
          formData.organizationName.trim() && {
            organizationName: formData.organizationName.trim(),
          }),
        ...(isOrganization &&
          formData.organizationEmail.trim() && {
            organizationEmail: formData.organizationEmail.trim(),
          }),
      };

      const result = await register(registerData);

      if (result.success) {
        toast.success(
          "Registration successful! Please check your email to verify your account.",
        );
        router.push("/login");
      } else {
        toast.error(result.error || "Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Image
        src="/images/register.png"
        alt="Rwanda landscape"
        fill
        className="object-cover"
        priority
      />

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 min-h-screen flex">
        <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 flex-col justify-center items-start p-8 lg:p-10">
          <div className="flex items-center mb-8">
            <Image
              src="/images/favicon.png"
              alt="NLA Logo"
              width={100}
              height={100}
              className="object-contain"
            />
            <div className="text-white">
              <h1 className="text-2xl font-bold text-blue">NLA</h1>
              <p className="text-xs opacity-90 text-light-blue">
                National Land Authority
              </p>
            </div>
          </div>

          <div className="text-white max-w-lg">
            <h2 className="text-2xl lg:text-4xl font-bold mb-6 leading-tight">
              JOIN OUR
              <br />
              <span className="text-green-500">RESEARCH COMMUNITY</span>
            </h2>
            <p className="lg:text-lg opacity-90 mb-8">
              Register to access Rwanda&#39;s land data for research and
              analysis purposes with proper authorization.
            </p>
            <div className="flex items-center space-x-6 text-xs">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue rounded-full mr-2"></div>
                Research Access
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green rounded-full mr-2"></div>
                Data Privacy
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow rounded-full mr-2"></div>
                Verified Users
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-3/5 xl:w-2/3 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-2xl">
            <div className="lg:hidden text-center mb-6">
              <div className="flex justify-center items-center mb-4">
                <Image
                  src="/images/favicon.png"
                  alt="NLA Logo"
                  width={70}
                  height={70}
                  className="object-contain"
                />
                <div className="text-white">
                  <h1 className="text-lg text-blue font-bold">
                    NLA Data Portal
                  </h1>
                  <p className="text-sm text-yellow opacity-90">
                    National Land Authority
                  </p>
                </div>
              </div>
            </div>

            <Card className="bg-white border-0">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Register as External User
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Step {currentStep} of 2:{" "}
                  {currentStep === 1
                    ? "Account Information"
                    : "Contact & Credentials"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep >= 1 ? "bg-blue text-white" : "bg-gray-200 text-gray-600"}`}
                    >
                      1
                    </div>
                    <div
                      className={`w-16 h-1 transition-all duration-300 ${currentStep >= 2 ? "bg-blue" : "bg-gray-200"}`}
                    ></div>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep >= 2 ? "bg-blue text-white" : "bg-gray-200 text-gray-600"}`}
                    >
                      2
                    </div>
                  </div>
                </div>

                {/* Slide animation container */}
                <div className="relative overflow-hidden">
                  {/* STEP 1 */}
                  <div
                    className={`transition-transform duration-500 ease-in-out ${currentStep === 1 ? "translate-x-0" : "-translate-x-full"} ${currentStep === 2 ? "hidden" : ""}`}
                  >
                    <form className="space-y-6">
                      {/* STEP 1 Content */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="userType"
                            className="text-gray-900 font-semibold"
                          >
                            Account Type *
                          </Label>
                          <Select
                            value={formData.userType}
                            onValueChange={handleUserTypeChange}
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {USER_TYPES.map((type) => (
                                <SelectItem
                                  key={type.value}
                                  value={type.value}
                                  className="py-3"
                                >
                                  <div className="flex items-center gap-2">
                                    {type.value === "individual" ? (
                                      <User className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <Building className="h-4 w-4 text-gray-500" />
                                    )}
                                    <span className="font-medium">
                                      {type.label}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="nationality"
                            className="text-gray-900 font-semibold"
                          >
                            Nationality *
                          </Label>
                          <CountryCombobox
                            value={formData.nationality}
                            onValueChange={handleNationalityChange}
                            countries={sortedCountries}
                            placeholder="Select country"
                          />
                        </div>
                      </div>

                      {formData.nationality && (
                        <div className="space-y-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
                          <h3 className="font-semibold text-gray-900">
                            Identity Verification
                          </h3>

                          {isRwandan ? (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label
                                  htmlFor="identityNumber"
                                  className="text-gray-700"
                                >
                                  National ID Number *
                                </Label>
                                <div className="flex gap-2">
                                  <Input
                                    id="identityNumber"
                                    name="identityNumber"
                                    type="text"
                                    placeholder="Enter 16-digit National ID"
                                    value={formData.identityNumber}
                                    onChange={handleChange}
                                    disabled={isVerifying || nidaVerified}
                                    maxLength={19}
                                    className="h-9"
                                  />
                                  <Button
                                    type="button"
                                    onClick={handleVerifyNida}
                                    disabled={
                                      isVerifying ||
                                      nidaVerified ||
                                      !formData.identityNumber
                                    }
                                    className="whitespace-nowrap px-6"
                                  >
                                    {isVerifying ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying
                                      </>
                                    ) : nidaVerified ? (
                                      <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Verified
                                      </>
                                    ) : (
                                      "Verify ID"
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {verificationError && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                  <div className="flex items-center text-red-800">
                                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                                    <span className="text-sm font-medium">
                                      {verificationError}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label
                                  htmlFor="identityNumber"
                                  className="text-gray-700"
                                >
                                  Passport Number *
                                </Label>
                                <Input
                                  id="identityNumber"
                                  name="identityNumber"
                                  type="text"
                                  placeholder="Enter your passport number"
                                  value={formData.identityNumber}
                                  onChange={handleChange}
                                  className="h-9"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700">
                                  Full Name *
                                </Label>
                                <Input
                                  id="name"
                                  name="name"
                                  type="text"
                                  placeholder="Enter your full name"
                                  value={formData.name}
                                  onChange={handleChange}
                                  className="h-9"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="phone"
                                    className="text-gray-700"
                                  >
                                    Phone Number *
                                  </Label>
                                  <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="+XXX XXX XXX XXX"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="h-9"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label
                                    htmlFor="address"
                                    className="text-gray-700"
                                  >
                                    Address (Optional)
                                  </Label>
                                  <Input
                                    id="address"
                                    name="address"
                                    type="text"
                                    placeholder="Enter your address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="h-9"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={handleNext}
                        className="w-full bg-blue hover:bg-blue/90 text-white h-9 text-base font-semibold"
                        disabled={!formData.nationality}
                      >
                        Next Step
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </div>

                  {/* STEP 2 */}
                  <div
                    className={`transition-transform duration-500 ease-in-out ${currentStep === 2 ? "translate-x-0" : "translate-x-full"} ${currentStep === 1 ? "hidden" : ""}`}
                  >
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* STEP 2 Content */}
                      {nidaVerified && nidaData && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center text-green-800 mb-3">
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            <span className="font-semibold">
                              ID Verified Successfully
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
                            <div>
                              <strong>Name:</strong> {nidaData.fullName}
                            </div>
                            <div>
                              <strong>DOB:</strong> {nidaData.dateOfBirth}
                            </div>
                            <div className="md:col-span-2">
                              <strong>Address:</strong> {nidaData.address}
                            </div>
                            {nidaData.phone && (
                              <div>
                                <strong>Phone:</strong> {nidaData.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-gray-900 font-semibold"
                          >
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="h-9"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="phone"
                            className="text-gray-900 font-semibold"
                          >
                            Phone Number *
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+250 XXX XXX XXX"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={isLoading || (isRwandan && nidaVerified)}
                            className="h-9"
                          />
                        </div>
                      </div>

                      {isOrganization && (
                        <div className="space-y-4 p-5 bg-blue-50 rounded-lg border border-blue-200">
                          <h3 className="font-semibold text-gray-900 flex items-center">
                            <Building className="h-5 w-5 mr-2 text-blue-600" />
                            Organization Details
                          </h3>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="organizationName"
                                className="text-gray-700"
                              >
                                Organization Name *
                              </Label>
                              <Input
                                id="organizationName"
                                name="organizationName"
                                type="text"
                                placeholder="Enter organization name"
                                value={formData.organizationName}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="h-9"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="organizationEmail"
                                className="text-gray-700"
                              >
                                Organization Email (Optional)
                              </Label>
                              <Input
                                id="organizationEmail"
                                name="organizationEmail"
                                type="email"
                                placeholder="contact@organization.com"
                                value={formData.organizationEmail}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="h-9"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">
                          Create Password
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700">
                              Password *
                            </Label>
                            <div className="relative">
                              <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="h-9 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="confirmPassword"
                              className="text-gray-700"
                            >
                              Confirm Password *
                            </Label>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Re-enter password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="h-9 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <PasswordStrength password={formData.password} />

                        {formData.confirmPassword && (
                          <p
                            className={`text-sm ${formData.password === formData.confirmPassword ? "text-green-600" : "text-red-600"}`}
                          >
                            {formData.password === formData.confirmPassword
                              ? "✓ Passwords match"
                              : "✗ Passwords do not match"}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={handleBack}
                          variant="outline"
                          className="w-1/3 h-9 text-base font-semibold"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-green hover:bg-green/90 text-white h-9 text-base font-semibold"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-blue font-semibold hover:underline"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Phone Number Selection Dialog */}
      <Dialog open={showPhoneSelection} onOpenChange={setShowPhoneSelection}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Your Phone Number</DialogTitle>
            <DialogDescription>
              Choose the phone number you want to use for your account
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto pr-2">
            <div className="space-y-2">
              {nidaData?.phoneNumbers.map((phone, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      phone: phone.number,
                    }));
                    setShowPhoneSelection(false);
                    setTimeout(() => setCurrentStep(2), 500);
                  }}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {phone.operator.substring(0, 1)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {phone.number}
                      </div>
                      <div className="text-xs text-gray-600">
                        {phone.operator} • Since {phone.servicePeriod}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-blue-600"
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
