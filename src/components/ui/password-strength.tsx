import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One number', test: (p: string) => /\d/.test(p) },
  ];

  const passedChecks = checks.filter(check => check.test(password)).length;
  const strength = passedChecks === 0 ? 0 : passedChecks === checks.length ? 3 : passedChecks >= 3 ? 2 : 1;

  const strengthConfig = {
    0: { label: '', color: 'bg-gray-200', textColor: '' },
    1: { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-600' },
    2: { label: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    3: { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' },
  };

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex gap-1 h-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex-1 rounded-full transition-colors ${
                i <= passedChecks ? strengthConfig[strength].color : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        {strength > 0 && (
          <p className={`text-xs font-medium ${strengthConfig[strength].textColor}`}>
            Password strength: {strengthConfig[strength].label}
          </p>
        )}
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        {checks.map((check, index) => {
          const passed = check.test(password);
          return (
            <div
              key={index}
              className={`flex items-center text-xs ${
                passed ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {passed ? (
                <Check className="h-3 w-3 mr-1.5 flex-shrink-0" />
              ) : (
                <X className="h-3 w-3 mr-1.5 flex-shrink-0" />
              )}
              <span>{check.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function isPasswordValid(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
}
