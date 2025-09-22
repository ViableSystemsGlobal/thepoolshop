// Shared in-memory storage for distributor leads
// This should be replaced with a proper database in production

let distributorLeads: any[] = [
  {
    id: 'dl_1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+233 24 123 4567',
    businessName: 'Doe Enterprises',
    businessType: 'Limited Liability Company',
    city: 'Accra',
    region: 'Greater Accra',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    submittedBy: 'user_1',
    territory: 'Accra Central',
    expectedVolume: 500,
    experience: '5 years in retail distribution',
    notes: 'Strong candidate with excellent track record in the retail sector.',
    yearsInBusiness: 5,
    investmentCapacity: 50000,
    targetMarket: 'FMCG, Electronics, Home & Garden',
    profileImage: '/api/placeholder/150/150'
  },
  {
    id: 'dl_2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+233 20 987 6543',
    businessName: 'Smith Trading Co.',
    businessType: 'Sole Proprietorship',
    city: 'Kumasi',
    region: 'Ashanti',
    status: 'UNDER_REVIEW',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    submittedBy: 'user_1',
    territory: 'Kumasi Metro',
    expectedVolume: 800,
    experience: '8 years in wholesale distribution',
    notes: 'Experienced in FMCG distribution with strong network.',
    yearsInBusiness: 8,
    investmentCapacity: 75000,
    targetMarket: 'FMCG, Pharmaceuticals, Industrial Supplies',
    profileImage: '/api/placeholder/150/150'
  },
];

export function getAllDistributorLeads() {
  return distributorLeads;
}

export function getDistributorLeadById(id: string) {
  return distributorLeads.find(lead => lead.id === id);
}

export function addDistributorLead(lead: any) {
  const newLead = {
    ...lead,
    id: `dl_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  distributorLeads.push(newLead);
  return newLead;
}

export function updateDistributorLead(id: string, updates: any) {
  const index = distributorLeads.findIndex(lead => lead.id === id);
  if (index === -1) {
    return null;
  }
  
  distributorLeads[index] = {
    ...distributorLeads[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  return distributorLeads[index];
}

export function deleteDistributorLead(id: string) {
  const index = distributorLeads.findIndex(lead => lead.id === id);
  if (index === -1) {
    return null;
  }
  
  return distributorLeads.splice(index, 1)[0];
}
