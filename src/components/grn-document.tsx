'use client';

import React from 'react';
import { useTheme } from '@/contexts/theme-context';

interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  unitPrice: number;
  costPrice: number;
  category?: {
    name: string;
  };
}

interface GRNDocumentProps {
  products: Product[];
  grnNumber: string;
  date: string;
  supplierName?: string;
  supplierAddress?: string;
  poNumber?: string;
  deliveryNote?: string;
  receivedBy?: string;
  checkedBy?: string;
  approvedBy?: string;
  remarks?: string;
}

export function GRNDocument({
  products,
  grnNumber,
  date,
  supplierName = '',
  supplierAddress = '',
  poNumber = '',
  deliveryNote = '',
  receivedBy = '',
  checkedBy = '',
  approvedBy = '',
  remarks = ''
}: GRNDocumentProps) {
  const { theme } = useTheme();

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" id="grn-document">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center">
          {/* Company Logo */}
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
            <div className="text-white font-bold text-xl">AD</div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">A.D. POOLS</h1>
            <p className="text-sm text-gray-600">Swimming Pool Solutions</p>
          </div>
        </div>
        
        <div className="text-right">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">GOODS RECEIPT NOTE</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-semibold mr-2">GRN No.:</span>
              <span className="border-b border-gray-300 px-2 py-1 min-w-[120px]">{grnNumber}</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2">Date:</span>
              <span className="border-b border-gray-300 px-2 py-1 min-w-[120px]">{date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Information */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Supplier Name & Address</h3>
          <div className="border-b border-gray-300 px-2 py-1 min-h-[60px]">
            {supplierName && <div className="font-medium">{supplierName}</div>}
            {supplierAddress && <div className="text-sm text-gray-600">{supplierAddress}</div>}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <span className="font-semibold mr-2">Purchase Order (PO) No.:</span>
            <span className="border-b border-gray-300 px-2 py-1 min-w-[150px] inline-block">{poNumber}</span>
          </div>
          <div>
            <span className="font-semibold mr-2">Delivery Note / Waybill No.:</span>
            <span className="border-b border-gray-300 px-2 py-1 min-w-[150px] inline-block">{deliveryNote}</span>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Goods Details</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Item No.</th>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Description of Goods</th>
              <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Quantity Ordered</th>
              <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Quantity Received</th>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id}>
                <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">SKU: {product.sku}</div>
                  {product.description && (
                    <div className="text-sm text-gray-500">{product.description}</div>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <div className="border-b border-gray-300 px-2 py-1 min-w-[80px] mx-auto">-</div>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <div className="border-b border-gray-300 px-2 py-1 min-w-[80px] mx-auto">-</div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="border-b border-gray-300 px-2 py-1 min-h-[20px]">Good Condition</div>
                </td>
              </tr>
            ))}
            {/* Add empty rows for additional items */}
            {Array.from({ length: Math.max(0, 5 - products.length) }).map((_, index) => (
              <tr key={`empty-${index}`}>
                <td className="border border-gray-300 px-4 py-2 text-center">{products.length + index + 1}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="border-b border-gray-300 px-2 py-1 min-h-[20px]"></div>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <div className="border-b border-gray-300 px-2 py-1 min-w-[80px] mx-auto"></div>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <div className="border-b border-gray-300 px-2 py-1 min-w-[80px] mx-auto"></div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="border-b border-gray-300 px-2 py-1 min-h-[20px]"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Approval Section */}
      <div className="grid grid-cols-3 gap-8 mb-8">
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Received By</h4>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Name:</span>
              <div className="border-b border-gray-300 px-2 py-1 min-h-[20px] mt-1">{receivedBy}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Signature:</span>
              <div className="border-b border-gray-300 px-2 py-1 min-h-[20px] mt-1"></div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Date:</span>
              <div className="border-b border-gray-300 px-2 py-1 min-h-[20px] mt-1"></div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Checked By</h4>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Name:</span>
              <div className="border-b border-gray-300 px-2 py-1 min-h-[20px] mt-1">{checkedBy}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Signature:</span>
              <div className="border-b border-gray-300 px-2 py-1 min-h-[20px] mt-1"></div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Date:</span>
              <div className="border-b border-gray-300 px-2 py-1 min-h-[20px] mt-1"></div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Approved By</h4>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Approved:</span>
              <div className="border-b border-gray-300 px-2 py-1 min-h-[20px] mt-1">{approvedBy}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Date:</span>
              <div className="border-b border-gray-300 px-2 py-1 min-h-[20px] mt-1"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Remarks Section */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">Remarks/Comments</h4>
        <div className="border border-gray-300 px-4 py-3 min-h-[60px]">
          {remarks}
        </div>
      </div>
    </div>
  );
}
