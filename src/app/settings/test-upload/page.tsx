"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'favicon');

      console.log('📤 Uploading file:', file.name);

      const response = await fetch('/api/upload/branding', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response status:', response.status);

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {uploading && (
            <div className="text-blue-600">Uploading...</div>
          )}

          {error && (
            <div className="text-red-600">
              Error: {error}
            </div>
          )}

          {result && (
            <div className="space-y-2">
              <div className="text-green-600">✅ Upload successful!</div>
              <div className="bg-gray-100 p-4 rounded">
                <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
              </div>
              {result.url && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Uploaded image:</p>
                  <img 
                    src={result.url} 
                    alt="Uploaded" 
                    className="w-32 h-32 object-contain border rounded"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
