import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { format, fields, distributorIds } = body;

    // Get distributors with selected fields
    const distributors = await prisma.distributor.findMany({
      where: {
        id: {
          in: distributorIds
        }
      },
      include: {
        interestedProducts: {
          include: {
            product: {
              select: {
                name: true,
                sku: true
              }
            }
          }
        }
      },
      orderBy: {
        approvedAt: 'desc'
      }
    });

    // Prepare data for export
    const exportData = distributors.map(distributor => {
      const row: any = {};
      
      fields.forEach((field: string) => {
        switch (field) {
          case 'firstName':
            row['First Name'] = distributor.firstName;
            break;
          case 'lastName':
            row['Last Name'] = distributor.lastName;
            break;
          case 'businessName':
            row['Business Name'] = distributor.businessName;
            break;
          case 'businessType':
            row['Business Type'] = distributor.businessType;
            break;
          case 'email':
            row['Email'] = distributor.email;
            break;
          case 'phone':
            row['Phone'] = distributor.phone;
            break;
          case 'address':
            row['Address'] = distributor.address;
            break;
          case 'city':
            row['City'] = distributor.city;
            break;
          case 'region':
            row['Region'] = distributor.region;
            break;
          case 'country':
            row['Country'] = distributor.country;
            break;
          case 'territory':
            row['Territory'] = distributor.territory;
            break;
          case 'status':
            row['Status'] = distributor.status;
            break;
          case 'approvedAt':
            row['Approved Date'] = distributor.approvedAt ? new Date(distributor.approvedAt).toLocaleDateString() : '';
            break;
          case 'expectedVolume':
            row['Expected Volume'] = distributor.expectedVolume ? `GHS ${distributor.expectedVolume.toLocaleString()}` : '';
            break;
          case 'experience':
            row['Experience'] = distributor.experience;
            break;
          case 'investmentCapacity':
            row['Investment Capacity'] = distributor.investmentCapacity ? `GHS ${distributor.investmentCapacity.toLocaleString()}` : '';
            break;
        }
      });

      // Add interested products as a separate field
      if (distributor.interestedProducts && distributor.interestedProducts.length > 0) {
        row['Interested Products'] = distributor.interestedProducts
          .map(ip => `${ip.product.name} (${ip.product.sku})`)
          .join(', ');
      }

      return row;
    });

    if (format === 'csv') {
      // Generate CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="distributors_export_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      // For Excel, we'll return JSON that can be processed by a client-side library
      // In a real implementation, you'd use a library like 'xlsx' or 'exceljs'
      return NextResponse.json({
        success: true,
        data: exportData,
        message: 'Excel export data prepared. Use a client-side library to generate Excel file.'
      });
    }

  } catch (error) {
    console.error('Error exporting distributors:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
