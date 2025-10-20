// src/components/PhoneInputTest.tsx
import { useState } from 'react';
import { PhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PhoneInputTest() {
  const [phone, setPhone] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-xl font-semibold">Phone Input Test</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <PhoneInput
              value={phone}
              onChange={setPhone}
              placeholder="Enter phone number"
              defaultCountry="PK"
              international
              countryCallingCodeEditable={false}
            />
          </div>
          
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-sm"><strong>Current value:</strong> {phone || 'Empty'}</p>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Expected behavior:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Default country should be Pakistan (+92)</li>
              <li>Country code should be visible and non-editable</li>
              <li>Selecting different countries should show their codes</li>
              <li>Phone number should be formatted automatically</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
