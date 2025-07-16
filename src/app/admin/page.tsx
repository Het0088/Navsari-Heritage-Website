'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users, Building, BarChart3, Settings, Plus, Edit, 
  Trash2, Eye, Shield, MapPin, Star, Clock, 
  Search, Filter, Download, Upload, Bell,
  TrendingUp, Calendar, Award, AlertCircle,
  LogOut, Home, User, FileCheck, CheckCircle, 
  XCircle, Loader, Briefcase, Building2
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Vendor {
  _id: string;
  name: string;
  nameGuj?: string;
  email: string;
  contact: string;
  businessName: string;
  businessType: string;
  category: string;
  location: string;
  description?: string;
  openHours: string;
  specialties: string[];
  rating: number;
  price: string;
  image: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  permit: {
    status: 'permitted' | 'pending' | 'applied' | 'rejected';
    licenseNumber?: string;
    issuedBy?: string;
    issuedDate?: string;
    expiryDate?: string;
    renewalDate?: string;
    lastUpdatedBy?: string;
    notes?: string;
    documents?: string[];
  };
  permitHistory: {
    status: 'permitted' | 'pending' | 'applied' | 'rejected';
    updatedBy: string;
    updatedByName: string;
    date: string;
    notes?: string;
  }[];
  joinDate: string;
  totalSales?: number;
  lastActivity?: string;
  views?: number;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

interface PermitModalData {
  vendor: Vendor | null;
  isOpen: boolean;
}

interface AddVendorModalData {
  isOpen: boolean;
}

interface HeritageItem {
  id: string;
  title: string;
  category: string;
  status: 'published' | 'draft' | 'review';
  views: number;
  rating: number;
  lastUpdated: string;
}

// After the Vendor interface, add the Municipal interface
interface Municipal {
  _id: string;
  name: string;
  email: string;
  role: 'municipal' | 'admin' | 'vendor' | 'user';
  isActive: boolean;
  profile?: {
    businessName?: string;
    businessType?: string;
    category?: string;
    location?: string;
    description?: string;
    contact?: string;
    avatar?: string;
  };
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

interface MunicipalModalData {
  municipal: Municipal | null;
  isOpen: boolean;
}

interface AddMunicipalModalData {
  isOpen: boolean;
}

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [permitStatus, setPermitStatus] = useState('all');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [permitModal, setPermitModal] = useState<PermitModalData>({ vendor: null, isOpen: false });
  const [addVendorModal, setAddVendorModal] = useState<AddVendorModalData>({ isOpen: false });
  const [viewModal, setViewModal] = useState<PermitModalData>({ vendor: null, isOpen: false });
  const [editModal, setEditModal] = useState<PermitModalData>({ vendor: null, isOpen: false });

  // Municipal state
  const [municipals, setMunicipals] = useState<Municipal[]>([]);
  const [municipalLoading, setMunicipalLoading] = useState(true);
  const [addMunicipalModal, setAddMunicipalModal] = useState<AddMunicipalModalData>({ isOpen: false });
  const [viewMunicipalModal, setViewMunicipalModal] = useState<MunicipalModalData>({ municipal: null, isOpen: false });
  const [editMunicipalModal, setEditMunicipalModal] = useState<MunicipalModalData>({ municipal: null, isOpen: false });
  const [municipalSearchQuery, setMunicipalSearchQuery] = useState('');
  const [municipalFilterStatus, setMunicipalFilterStatus] = useState('all');

  // Fetch vendors from API
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (permitStatus !== 'all') params.append('permitStatus', permitStatus);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/vendors?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setVendors(data.vendors || []);
      } else {
        console.error('Failed to fetch vendors:', data.error);
        setVendors([]);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // Update permit status
  const updatePermitStatus = async (vendorId: string, permitData: any) => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}/permit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permitData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Refresh vendors list
        fetchVendors();
        setPermitModal({ vendor: null, isOpen: false });
        alert('Permit status updated successfully!');
      } else {
        alert(data.error || 'Failed to update permit status');
      }
    } catch (error) {
      console.error('Error updating permit:', error);
      alert('Failed to update permit status');
    }
  };

  // Update vendor
  const updateVendor = async (vendorId: string, vendorData: any) => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        fetchVendors();
        setEditModal({ vendor: null, isOpen: false });
        alert('Vendor updated successfully!');
      } else {
        alert(data.error || 'Failed to update vendor');
      }
    } catch (error) {
      console.error('Error updating vendor:', error);
      alert('Failed to update vendor');
    }
  };

  // Delete vendor
  const deleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchVendors();
        alert('Vendor deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete vendor');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Failed to delete vendor');
    }
  };

  // Fetch vendors on component mount and when filters change
  useEffect(() => {
    fetchVendors();
  }, [filterStatus, permitStatus, searchQuery]);

  // Fetch municipals from API
  const fetchMunicipals = async () => {
    try {
      setMunicipalLoading(true);
      const params = new URLSearchParams();
      params.append('role', 'municipal');
      if (municipalFilterStatus !== 'all') params.append('isActive', municipalFilterStatus);
      if (municipalSearchQuery) params.append('search', municipalSearchQuery);
      
      const response = await fetch(`/api/users?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setMunicipals(data.users || []);
      } else {
        console.error('Failed to fetch municipal users:', data.error);
        setMunicipals([]);
      }
    } catch (error) {
      console.error('Error fetching municipal users:', error);
      setMunicipals([]);
    } finally {
      setMunicipalLoading(false);
    }
  };

  // Update municipal
  const updateMunicipal = async (municipalId: string, municipalData: any) => {
    try {
      const response = await fetch(`/api/users/${municipalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(municipalData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        fetchMunicipals();
        setEditMunicipalModal({ municipal: null, isOpen: false });
        alert('Municipal user updated successfully!');
      } else {
        alert(data.error || 'Failed to update municipal user');
      }
    } catch (error) {
      console.error('Error updating municipal user:', error);
      alert('Failed to update municipal user');
    }
  };

  // Delete municipal
  const deleteMunicipal = async (municipalId: string) => {
    if (!confirm('Are you sure you want to delete this municipal user?')) return;
    
    try {
      const response = await fetch(`/api/users/${municipalId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchMunicipals();
        alert('Municipal user deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete municipal user');
      }
    } catch (error) {
      console.error('Error deleting municipal user:', error);
      alert('Failed to delete municipal user');
    }
  };

  // Fetch municipals on component mount and when filters change
  useEffect(() => {
    fetchMunicipals();
  }, [municipalFilterStatus, municipalSearchQuery]);

  // Add Vendor Form Component
  const AddVendorForm = ({ onSubmit, onCancel }: { 
    onSubmit: (data: any) => void; 
    onCancel: () => void; 
  }) => {
    const [formData, setFormData] = useState({
      name: '',
      nameGuj: '',
      email: '',
      contact: '',
      businessName: '',
      businessType: 'Street Food Vendor',
      category: 'food',
      location: '',
      description: '',
      openHours: '',
      specialties: '',
      price: '',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      coordinates: { lat: 20.9463, lng: 72.9036 }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const submitData = {
        ...formData,
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s)
      };
      onSubmit(submitData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gujarati Name</label>
            <input
              type="text"
              value={formData.nameGuj}
              onChange={(e) => setFormData({...formData, nameGuj: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact *</label>
            <input
              type="tel"
              required
              value={formData.contact}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
          <input
            type="text"
            required
            value={formData.businessName}
            onChange={(e) => setFormData({...formData, businessName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
            <select
              required
              value={formData.businessType}
              onChange={(e) => setFormData({...formData, businessType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            >
              <option value="Street Food Vendor">Street Food Vendor</option>
              <option value="Traditional Sweet Shop">Traditional Sweet Shop</option>
              <option value="Mobile Food Cart">Mobile Food Cart</option>
              <option value="Vegetable Vendor">Vegetable Vendor</option>
              <option value="Fruit Vendor">Fruit Vendor</option>
              <option value="Handicrafts Shop">Handicrafts Shop</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            >
              <option value="food">Food & Street Food</option>
              <option value="clothing">Clothing & Textiles</option>
              <option value="antiques">Antiques & Heritage</option>
              <option value="day-markets">Day Markets</option>
              <option value="vegetables-fruits">Vegetables & Fruits</option>
              <option value="art-crafts">Art & Crafts</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Opening Hours *</label>
            <input
              type="text"
              required
              placeholder="e.g., 9:00 AM - 6:00 PM"
              value={formData.openHours}
              onChange={(e) => setFormData({...formData, openHours: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range *</label>
            <input
              type="text"
              required
              placeholder="e.g., ₹20-100"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Specialties (comma-separated)</label>
          <input
            type="text"
            placeholder="e.g., Gujarati Thali, Street Food, Organic Vegetables"
            value={formData.specialties}
            onChange={(e) => setFormData({...formData, specialties: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
          />
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-navsari-500 to-heritage-600 text-white rounded-lg hover:shadow-lg"
          >
            Add Vendor
          </button>
        </div>
      </form>
    );
  };

  // Permit Management Form Component
  const PermitManagementForm = ({ vendor, onSubmit, onCancel }: { 
    vendor: Vendor; 
    onSubmit: (data: any) => void; 
    onCancel: () => void; 
  }) => {
    const [permitData, setPermitData] = useState({
      status: vendor.permit.status,
      licenseNumber: vendor.permit.licenseNumber || '',
      issuedDate: vendor.permit.issuedDate ? vendor.permit.issuedDate.split('T')[0] : '',
      expiryDate: vendor.permit.expiryDate ? vendor.permit.expiryDate.split('T')[0] : '',
      renewalDate: vendor.permit.renewalDate ? vendor.permit.renewalDate.split('T')[0] : '',
      notes: vendor.permit.notes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(permitData);
    };

    return (
      <div>
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800">{vendor.name}</h3>
          <p className="text-sm text-gray-600">{vendor.businessName}</p>
          <p className="text-sm text-gray-500">Current Status: 
            <span className={`ml-1 px-2 py-1 rounded text-xs ${getPermitStatusColor(vendor.permit.status)}`}>
              {vendor.permit.status}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permit Status *</label>
            <select
              required
              value={permitData.status}
              onChange={(e) => setPermitData({...permitData, status: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            >
              <option value="applied">Applied</option>
              <option value="pending">Pending Review</option>
              <option value="permitted">Permitted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {permitData.status === 'permitted' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                <input
                  type="text"
                  value={permitData.licenseNumber}
                  onChange={(e) => setPermitData({...permitData, licenseNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Issued Date</label>
                  <input
                    type="date"
                    value={permitData.issuedDate}
                    onChange={(e) => setPermitData({...permitData, issuedDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={permitData.expiryDate}
                    onChange={(e) => setPermitData({...permitData, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
                  />
                </div>
              </div>
            </>
          )}

          {permitData.status === 'pending' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Renewal Date</label>
              <input
                type="date"
                value={permitData.renewalDate}
                onChange={(e) => setPermitData({...permitData, renewalDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={permitData.notes}
              onChange={(e) => setPermitData({...permitData, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
              placeholder="Add any notes about this permit status change..."
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg"
            >
              Update Permit
            </button>
          </div>
        </form>

        {vendor.permitHistory && vendor.permitHistory.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-3">Permit History</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {vendor.permitHistory.slice(0, 5).map((history, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs ${getPermitStatusColor(history.status)}`}>
                      {history.status}
                    </span>
                    <span className="text-gray-500">{new Date(history.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 mt-1">Updated by: {history.updatedByName}</p>
                  {history.notes && <p className="text-gray-500 text-xs mt-1">{history.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // View Vendor Component
  const ViewVendorDetails = ({ vendor }: { vendor: Vendor }) => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-navsari-500 to-heritage-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
            {vendor.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{vendor.name}</h3>
            {vendor.nameGuj && <p className="text-gray-600">{vendor.nameGuj}</p>}
            <p className="text-sm text-gray-500">{vendor.businessName}</p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vendor.status)}`}>
            {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPermitStatusColor(vendor.permit.status)}`}>
            Permit: {vendor.permit.status.charAt(0).toUpperCase() + vendor.permit.status.slice(1)}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Contact Information</label>
              <div className="mt-1">
                <p className="text-gray-800">{vendor.email}</p>
                <p className="text-gray-800">{vendor.contact}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Business Type</label>
              <p className="mt-1 text-gray-800">{vendor.businessType}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Category</label>
              <p className="mt-1 text-gray-800">{vendor.category}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <p className="mt-1 text-gray-800">{vendor.location}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Opening Hours</label>
              <p className="mt-1 text-gray-800">{vendor.openHours}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Price Range</label>
              <p className="mt-1 text-gray-800">{vendor.price}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Rating</label>
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-gray-800">{vendor.rating.toFixed(1)}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Join Date</label>
              <p className="mt-1 text-gray-800">{new Date(vendor.joinDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {vendor.description && (
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="mt-1 text-gray-800">{vendor.description}</p>
          </div>
        )}

        {/* Specialties */}
        {vendor.specialties && vendor.specialties.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-500">Specialties</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {vendor.specialties.map((specialty, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Permit Details */}
        <div className="border-t pt-4">
          <label className="text-sm font-medium text-gray-500">Permit Information</label>
          <div className="mt-2 space-y-2">
            {vendor.permit.licenseNumber && (
              <p className="text-sm"><span className="font-medium">License Number:</span> {vendor.permit.licenseNumber}</p>
            )}
            {vendor.permit.issuedDate && (
              <p className="text-sm"><span className="font-medium">Issued Date:</span> {new Date(vendor.permit.issuedDate).toLocaleDateString()}</p>
            )}
            {vendor.permit.expiryDate && (
              <p className="text-sm"><span className="font-medium">Expiry Date:</span> {new Date(vendor.permit.expiryDate).toLocaleDateString()}</p>
            )}
            {vendor.permit.notes && (
              <p className="text-sm"><span className="font-medium">Notes:</span> {vendor.permit.notes}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Edit Vendor Form Component
  const EditVendorForm = ({ vendor, onSubmit, onCancel }: { 
    vendor: Vendor;
    onSubmit: (data: any) => void; 
    onCancel: () => void; 
  }) => {
    const [formData, setFormData] = useState({
      name: vendor.name,
      nameGuj: vendor.nameGuj || '',
      email: vendor.email,
      contact: vendor.contact,
      businessName: vendor.businessName,
      businessType: vendor.businessType,
      category: vendor.category,
      location: vendor.location,
      description: vendor.description || '',
      openHours: vendor.openHours,
      specialties: vendor.specialties.join(', '),
      price: vendor.price,
      status: vendor.status
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const submitData = {
        ...formData,
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s)
      };
      onSubmit(submitData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gujarati Name</label>
            <input
              type="text"
              value={formData.nameGuj}
              onChange={(e) => setFormData({...formData, nameGuj: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact *</label>
            <input
              type="tel"
              required
              value={formData.contact}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
          <input
            type="text"
            required
            value={formData.businessName}
            onChange={(e) => setFormData({...formData, businessName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
            <select
              required
              value={formData.businessType}
              onChange={(e) => setFormData({...formData, businessType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            >
              <option value="Street Food Vendor">Street Food Vendor</option>
              <option value="Traditional Sweet Shop">Traditional Sweet Shop</option>
              <option value="Mobile Food Cart">Mobile Food Cart</option>
              <option value="Vegetable Vendor">Vegetable Vendor</option>
              <option value="Fruit Vendor">Fruit Vendor</option>
              <option value="Handicrafts Shop">Handicrafts Shop</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            >
              <option value="food">Food & Street Food</option>
              <option value="clothing">Clothing & Textiles</option>
              <option value="antiques">Antiques & Heritage</option>
              <option value="day-markets">Day Markets</option>
              <option value="vegetables-fruits">Vegetables & Fruits</option>
              <option value="art-crafts">Art & Crafts</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Opening Hours *</label>
            <input
              type="text"
              required
              placeholder="e.g., 9:00 AM - 6:00 PM"
              value={formData.openHours}
              onChange={(e) => setFormData({...formData, openHours: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range *</label>
            <input
              type="text"
              required
              placeholder="e.g., ₹20-100"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Specialties (comma-separated)</label>
          <input
            type="text"
            placeholder="e.g., Gujarati Thali, Street Food, Organic Vegetables"
            value={formData.specialties}
            onChange={(e) => setFormData({...formData, specialties: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
          />
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg"
          >
            Update Vendor
          </button>
        </div>
      </form>
    );
  };

  const heritageItems: HeritageItem[] = [
    {
      id: '1',
      title: 'Main Bazaar Vending Zone',
      category: 'street-food',
      status: 'published',
      views: 1234,
      rating: 4.5,
      lastUpdated: '2025-03-15'
    },
    {
      id: '2',
      title: 'Railway Station Vending Zone',
      category: 'mobile-vendors',
      status: 'published',
      views: 2156,
      rating: 4.8,
      lastUpdated: '2025-03-14'
    },
    {
      id: '3',
      title: 'Weekly Haat Bazar Setup',
      category: 'temporary-market',
      status: 'draft',
      views: 0,
      rating: 0,
      lastUpdated: '2025-03-16'
    }
  ];

  const stats = [
    { label: 'Registered Vendors', value: '156', change: '+12%', icon: Users, color: 'from-blue-400 to-blue-600' },
    { label: 'Vending Zones', value: '8', change: '+2', icon: MapPin, color: 'from-green-400 to-green-600' },
    { label: 'Monthly Revenue', value: '₹2.5L', change: '+18%', icon: TrendingUp, color: 'from-purple-400 to-purple-600' },
    { label: 'Haat Bazars', value: '12', change: '+3', icon: Building, color: 'from-orange-400 to-orange-600' }
  ];



  // Check if user has admin/municipal access
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'municipal')) {
      router.push('/');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navsari-50 to-heritage-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-navsari-600"></div>
      </div>
    );
  }

  if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'municipal')) {
    return null;
  }

  const filteredVendors = vendors;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅';
      case 'pending': return '⏳';
      case 'suspended': return '❌';
      case 'inactive': return '🚫';
      default: return '❓';
    }
  };

  const getPermitStatusColor = (status: string) => {
    switch (status) {
      case 'permitted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPermitStatusIcon = (status: string) => {
    switch (status) {
      case 'permitted': return '✅';
      case 'pending': return '⏳';
      case 'applied': return '📝';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navsari-50 via-white to-heritage-50">
      {/* Use the same navbar as the main website */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex space-x-1 bg-white/60 backdrop-blur-sm rounded-2xl p-2 mb-8"
        >
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'vendors', label: 'Street Vendors', icon: Users },
            { id: 'heritage', label: 'Vending Zones', icon: MapPin },
            { id: 'municipal', label: 'Municipal', icon: Building2 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-navsari-500 to-heritage-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { action: 'New street vendor registered', user: 'Priya Desai - Locho Stall', time: '2 hours ago', icon: Users, color: 'text-blue-600' },
                  { action: 'New vending zone approved', item: 'Railway Station Area', time: '4 hours ago', icon: MapPin, color: 'text-green-600' },
                  { action: 'Vendor permit renewed', user: 'Ravi Kumar - Ghari Shop', time: '1 day ago', icon: Calendar, color: 'text-purple-600' },
                  { action: 'Haat bazar scheduled', rating: 'Weekly Market Setup', time: '2 days ago', icon: Building, color: 'text-yellow-600' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-white/40 rounded-xl">
                    <div className={`p-2 rounded-lg bg-gray-100 ${activity.color}`}>
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{activity.action}</p>
                      <p className="text-sm text-gray-600">
                        {activity.user || activity.item || activity.rating} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-4 items-center justify-between"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500 bg-white/60 backdrop-blur-sm"
                />
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500 bg-white/60 backdrop-blur-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={permitStatus}
                  onChange={(e) => setPermitStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500 bg-white/60 backdrop-blur-sm"
                >
                  <option value="all">All Permits</option>
                  <option value="permitted">Permitted</option>
                  <option value="pending">Pending</option>
                  <option value="applied">Applied</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button 
                  onClick={() => setAddVendorModal({ isOpen: true })}
                  className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-navsari-500 to-heritage-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Vendor</span>
                </button>
              </div>
            </motion.div>

            {/* Vendors Grid */}
            <motion.div
              layout
              className="grid gap-6"
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-navsari-600" />
                  <span className="ml-2 text-gray-600">Loading vendors...</span>
                </div>
              ) : filteredVendors.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              ) : (
                filteredVendors.map((vendor, index) => (
                <motion.div
                  key={vendor._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-navsari-400 to-heritage-500 rounded-xl flex items-center justify-center text-white font-semibold">
                        {vendor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{vendor.name}</h3>
                        <p className="text-gray-600">{vendor.businessName}</p>
                        <p className="text-sm text-gray-500">{vendor.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="space-y-2">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vendor.status)}`}>
                          <span>{getStatusIcon(vendor.status)}</span>
                          <span className="capitalize">{vendor.status}</span>
                        </div>
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getPermitStatusColor(vendor.permit.status)}`}>
                          <span>{getPermitStatusIcon(vendor.permit.status)}</span>
                          <span className="capitalize">{vendor.permit.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 mt-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{vendor.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Business Type:</span>
                      <p className="font-medium">{vendor.businessType}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <p className="font-medium">{vendor.location}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Sales:</span>
                      <p className="font-medium">₹{(vendor.totalSales || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Joined {new Date(vendor.joinDate).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-2">
                      <button 
                        title="View Details"
                        onClick={() => setViewModal({ vendor, isOpen: true })}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {session?.user?.role === 'municipal' && (
                        <button 
                          title="Manage Permit"
                          onClick={() => setPermitModal({ vendor, isOpen: true })}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <FileCheck className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        title="Edit Vendor"
                        onClick={() => setEditModal({ vendor, isOpen: true })}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        title="Delete Vendor"
                        onClick={() => deleteVendor(vendor._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
              )}
            </motion.div>
          </div>
        )}

        {/* Vending Zones Tab */}
        {activeTab === 'heritage' && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-2xl font-bold text-gray-800">Vending Zones Management</h2>
              <button className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-navsari-500 to-heritage-600 text-white rounded-xl hover:shadow-lg transition-all">
                <Plus className="w-5 h-5" />
                <span>Add Vending Zone</span>
              </button>
            </motion.div>

            <motion.div
              layout
              className="grid gap-6"
            >
              {heritageItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                      <p className="text-gray-600 capitalize">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === 'published' ? 'bg-green-100 text-green-800' :
                        item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status === 'published' ? '✅' : item.status === 'draft' ? '📝' : '👁️'}
                        <span className="ml-1 capitalize">{item.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Views:</span>
                      <p className="font-medium">{item.views.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Rating:</span>
                      <p className="font-medium flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{item.rating || 'No ratings'}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Updated:</span>
                      <p className="font-medium">{item.lastUpdated}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Municipal Tab */}
        {activeTab === 'municipal' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-4 items-center justify-between"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search municipal users..."
                  value={municipalSearchQuery}
                  onChange={(e) => setMunicipalSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500 bg-white/60 backdrop-blur-sm"
                />
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={municipalFilterStatus}
                  onChange={(e) => setMunicipalFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500 bg-white/60 backdrop-blur-sm"
                >
                  <option value="all">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <button 
                  onClick={() => setAddMunicipalModal({ isOpen: true })}
                  className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-navsari-500 to-heritage-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Municipal User</span>
                </button>
              </div>
            </motion.div>

            {/* Municipal Users Grid */}
            <motion.div
              layout
              className="grid gap-6"
            >
              {municipalLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-navsari-600" />
                  <span className="ml-2 text-gray-600">Loading municipal users...</span>
                </div>
              ) : municipals.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No municipal users found</h3>
                  <p className="text-gray-500">Add municipal staff members to manage the system.</p>
                </div>
              ) : (
                municipals.map((municipal, index) => (
                <motion.div
                  key={municipal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-semibold">
                        {municipal.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{municipal.name}</h3>
                        <p className="text-gray-600">{municipal.email}</p>
                        <p className="text-sm text-gray-500">Municipal Staff</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                        municipal.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <span>{municipal.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Role</p>
                      <p className="font-medium capitalize">{municipal.role}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium">{new Date(municipal.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => setViewMunicipalModal({ municipal, isOpen: true })}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setEditMunicipalModal({ municipal, isOpen: true })}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => deleteMunicipal(municipal._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )))}
            </motion.div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-8"
          >
            {/* Settings Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">System Settings</h2>
                <p className="text-gray-600 mt-2">Manage your platform configuration and preferences</p>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                <CheckCircle className="w-5 h-5" />
                <span>Save All Changes</span>
              </button>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Settings Navigation */}
              <div className="lg:col-span-1">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 sticky top-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
                  <nav className="space-y-2">
                    {[
                      { id: 'general', label: 'General', icon: '⚙️' },
                      { id: 'security', label: 'Security', icon: '🔒' },
                      { id: 'appearance', label: 'Appearance', icon: '🎨' },
                      { id: 'users', label: 'User Management', icon: '👥' },
                      { id: 'data', label: 'Data & Analytics', icon: '📊' },
                      { id: 'system', label: 'System', icon: '💻' },
                      { id: 'maintenance', label: 'Maintenance', icon: '🔧' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSettingsTab(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                          activeSettingsTab === item.id
                            ? 'bg-navsari-100 text-navsari-700 border border-navsari-200'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* General Settings */}
                {activeSettingsTab === 'general' && (
                  <div className="space-y-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">General Settings</h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Platform Name
                          </label>
                          <input
                            type="text"
                            defaultValue="Navsari Heritage Portal"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Email
                          </label>
                          <input
                            type="email"
                            defaultValue="admin@navsari.gov.in"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Support Phone
                          </label>
                          <input
                            type="tel"
                            defaultValue="+91 2637 243234"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time Zone
                          </label>
                          <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500">
                            <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                            <option value="UTC">UTC (GMT+0)</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Platform Description
                          </label>
                          <textarea
                            rows={3}
                            defaultValue="Empowering street vendors and preserving cultural heritage through digital transformation."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeSettingsTab === 'security' && (
                  <div className="space-y-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">Security Settings</h3>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                              <span className="text-yellow-600">🔐</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">Two-Factor Authentication</h4>
                              <p className="text-sm text-gray-600">Add an extra layer of security to admin accounts</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navsari-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navsari-600"></div>
                          </label>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Session Timeout (minutes)
                            </label>
                            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500">
                              <option value="30">30 minutes</option>
                              <option value="60" selected>60 minutes</option>
                              <option value="120">2 hours</option>
                              <option value="480">8 hours</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Maximum Login Attempts
                            </label>
                            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500">
                              <option value="3">3 attempts</option>
                              <option value="5" selected>5 attempts</option>
                              <option value="10">10 attempts</option>
                            </select>
                          </div>
                        </div>

                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                          <h4 className="font-semibold text-red-800 mb-2">Security Actions</h4>
                          <div className="flex flex-wrap gap-3">
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                              Reset All Sessions
                            </button>
                            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                              View Security Logs
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance Settings */}
                {activeSettingsTab === 'appearance' && (
                  <div className="space-y-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">Appearance Settings</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-4">
                            Theme Selection
                          </label>
                          <div className="grid grid-cols-3 gap-4">
                            {[
                              { id: 'light', name: 'Light', preview: 'bg-white border-2 border-gray-200' },
                              { id: 'dark', name: 'Dark', preview: 'bg-gray-800 border-2 border-gray-600' },
                              { id: 'auto', name: 'Auto', preview: 'bg-gradient-to-r from-white to-gray-800 border-2 border-gray-300' }
                            ].map((theme) => (
                              <div key={theme.id} className="relative">
                                <input
                                  type="radio"
                                  id={theme.id}
                                  name="theme"
                                  defaultChecked={theme.id === 'light'}
                                  className="sr-only peer"
                                />
                                <label
                                  htmlFor={theme.id}
                                  className={`flex flex-col items-center p-4 cursor-pointer rounded-xl border-2 transition-all peer-checked:border-navsari-500 peer-checked:bg-navsari-50 hover:border-gray-300`}
                                >
                                  <div className={`w-16 h-12 rounded-lg ${theme.preview} mb-2`}></div>
                                  <span className="text-sm font-medium">{theme.name}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Primary Color
                            </label>
                            <div className="flex items-center space-x-3">
                              <input
                                type="color"
                                defaultValue="#f0761b"
                                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                              />
                              <input
                                type="text"
                                defaultValue="#f0761b"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Secondary Color
                            </label>
                            <div className="flex items-center space-x-3">
                              <input
                                type="color"
                                defaultValue="#0ea5e9"
                                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                              />
                              <input
                                type="text"
                                defaultValue="#0ea5e9"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navsari-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                {/* User Management Settings */}
                {activeSettingsTab === 'users' && (
                  <div className="space-y-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">User Management Settings</h3>
                      
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Default User Role
                            </label>
                            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500">
                              <option value="user" selected>User</option>
                              <option value="vendor">Vendor</option>
                              <option value="municipal">Municipal</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Account Approval
                            </label>
                            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500">
                              <option value="automatic" selected>Automatic</option>
                              <option value="manual">Manual Review</option>
                            </select>
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                          <h4 className="font-semibold text-blue-800 mb-3">User Statistics</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">1,247</div>
                              <div className="text-sm text-blue-700">Total Users</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">156</div>
                              <div className="text-sm text-green-700">Active Vendors</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">23</div>
                              <div className="text-sm text-purple-700">Municipal Staff</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">12</div>
                              <div className="text-sm text-orange-700">Pending Approvals</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data & Analytics Settings */}
                {activeSettingsTab === 'data' && (
                  <div className="space-y-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">Data & Analytics Settings</h3>
                      
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-4 border border-gray-200 rounded-xl">
                            <h4 className="font-semibold text-gray-800 mb-3">Data Export</h4>
                            <div className="space-y-3">
                              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                                <Download className="w-5 h-5" />
                                <span>Export All Data</span>
                              </button>
                              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                                <Download className="w-5 h-5" />
                                <span>Export Vendors Only</span>
                              </button>
                            </div>
                          </div>

                          <div className="p-4 border border-gray-200 rounded-xl">
                            <h4 className="font-semibold text-gray-800 mb-3">Data Import</h4>
                            <div className="space-y-3">
                              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                                <Upload className="w-5 h-5" />
                                <span>Import Vendors</span>
                              </button>
                              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors">
                                <Upload className="w-5 h-5" />
                                <span>Import Heritage Data</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                          <h4 className="font-semibold text-green-800 mb-3">Analytics Configuration</h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-green-700 mb-2">
                                Data Retention (days)
                              </label>
                              <select className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                <option value="30">30 days</option>
                                <option value="90" selected>90 days</option>
                                <option value="365">1 year</option>
                                <option value="unlimited">Unlimited</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-green-700 mb-2">
                                Report Frequency
                              </label>
                              <select className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                <option value="daily">Daily</option>
                                <option value="weekly" selected>Weekly</option>
                                <option value="monthly">Monthly</option>
                              </select>
                            </div>
                            <div className="flex items-end">
                              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Generate Report
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* System Settings */}
                {activeSettingsTab === 'system' && (
                  <div className="space-y-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">System Configuration</h3>
                      
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              System Language
                            </label>
                            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500">
                              <option value="en" selected>English</option>
                              <option value="gu">ગુજરાતી (Gujarati)</option>
                              <option value="hi">हिंदी (Hindi)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Currency
                            </label>
                            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500">
                              <option value="INR" selected>₹ Indian Rupee (INR)</option>
                              <option value="USD">$ US Dollar (USD)</option>
                            </select>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                          <h4 className="font-semibold text-gray-800 mb-3">System Information</h4>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Version:</span>
                              <span className="ml-2 font-medium">2.1.0</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Last Updated:</span>
                              <span className="ml-2 font-medium">January 15, 2025</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Server Status:</span>
                              <span className="ml-2 font-medium text-green-600">● Online</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Uptime:</span>
                              <span className="ml-2 font-medium">15 days, 7 hours</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Maintenance Settings */}
                {activeSettingsTab === 'maintenance' && (
                  <div className="space-y-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">Maintenance & Updates</h3>
                      
                      <div className="space-y-6">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-yellow-800">Maintenance Mode</h4>
                              <p className="text-sm text-yellow-700">Enable to perform system updates</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                            </label>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-4 border border-gray-200 rounded-xl">
                            <h4 className="font-semibold text-gray-800 mb-3">Database Maintenance</h4>
                            <div className="space-y-2">
                              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Optimize Database
                              </button>
                              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Backup Database
                              </button>
                              <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                                Clear Cache
                              </button>
                            </div>
                          </div>

                          <div className="p-4 border border-gray-200 rounded-xl">
                            <h4 className="font-semibold text-gray-800 mb-3">System Logs</h4>
                            <div className="space-y-2">
                              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                View Error Logs
                              </button>
                              <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                View Access Logs
                              </button>
                              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                Clear All Logs
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-xl">
                          <h4 className="font-semibold text-gray-800 mb-3">Map Coordinates Update</h4>
                          <p className="text-sm text-gray-600 mb-4">Update map coordinates to fix location accuracy issues</p>
                          <div className="space-y-2">
                            <button 
                              onClick={async () => {
                                if (confirm('Update all vendor coordinates? This will fix map location accuracy.')) {
                                  try {
                                    const response = await fetch('/api/update-coordinates', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ type: 'vendors' })
                                    });
                                    const data = await response.json();
                                    if (data.success) {
                                      alert(`Successfully updated coordinates for ${data.data.updated.length} vendors`);
                                    } else {
                                      alert(data.error || 'Failed to update coordinates');
                                    }
                                  } catch (error) {
                                    console.error('Error updating coordinates:', error);
                                    alert('Failed to update coordinates');
                                  }
                                }
                              }}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Update Vendor Coordinates
                            </button>
                            <button 
                              onClick={async () => {
                                if (confirm('Update all heritage site coordinates? This will fix map location accuracy.')) {
                                  try {
                                    const response = await fetch('/api/update-coordinates', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ type: 'heritage' })
                                    });
                                    const data = await response.json();
                                    if (data.success) {
                                      alert(`Successfully updated coordinates for ${data.data.updated.length} heritage sites`);
                                    } else {
                                      alert(data.error || 'Failed to update coordinates');
                                    }
                                  } catch (error) {
                                    console.error('Error updating coordinates:', error);
                                    alert('Failed to update coordinates');
                                  }
                                }
                              }}
                              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Update Heritage Coordinates
                            </button>
                            <button 
                              onClick={async () => {
                                if (confirm('Update heritage sites with GPS-verified accurate coordinates? This will use precise location data for all heritage sites.')) {
                                  try {
                                    const response = await fetch('/api/update-coordinates', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ type: 'heritage-accurate' })
                                    });
                                    const data = await response.json();
                                    if (data.success) {
                                      alert(`✅ Successfully updated ${data.heritage.updates.length} heritage sites with accurate GPS coordinates!`);
                                    } else {
                                      alert(data.error || 'Failed to update coordinates');
                                    }
                                  } catch (error) {
                                    console.error('Error updating coordinates:', error);
                                    alert('Failed to update coordinates');
                                  }
                                }
                              }}
                              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                              🎯 Update with Accurate Heritage Coordinates
                            </button>
                            <button 
                              onClick={async () => {
                                if (confirm('Update ALL map coordinates? This will fix location accuracy for both vendors and heritage sites.')) {
                                  try {
                                    const response = await fetch('/api/update-coordinates', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ type: 'all' })
                                    });
                                    const data = await response.json();
                                    if (data.success) {
                                      alert(`Successfully updated coordinates for vendors and heritage sites. ${data.message}`);
                                    } else {
                                      alert(data.error || 'Failed to update coordinates');
                                    }
                                  } catch (error) {
                                    console.error('Error updating coordinates:', error);
                                    alert('Failed to update coordinates');
                                  }
                                }
                              }}
                              className="w-full px-4 py-2 bg-navsari-600 text-white rounded-lg hover:bg-navsari-700 transition-colors"
                            >
                              Update All Coordinates
                            </button>
                          </div>
                          <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                            <p className="text-xs text-emerald-700">
                              🎯 <strong>New:</strong> The "Accurate Heritage Coordinates" button uses GPS-verified locations for 23+ heritage sites including temples, gardens, museums, and cultural venues across Navsari for precise map positioning.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Vendor Modal */}
      {addVendorModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setAddVendorModal({ isOpen: false })}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New Vendor</h2>
              <button
                onClick={() => setAddVendorModal({ isOpen: false })}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <AddVendorForm 
              onSubmit={async (vendorData) => {
                try {
                  const response = await fetch('/api/vendors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(vendorData)
                  });
                  
                  const data = await response.json();
                  
                  if (response.ok) {
                    alert('Vendor added successfully!');
                    setAddVendorModal({ isOpen: false });
                    fetchVendors(); // Refresh the list
                  } else {
                    alert(data.error || 'Failed to add vendor');
                  }
                } catch (error) {
                  console.error('Error adding vendor:', error);
                  alert('Failed to add vendor');
                }
              }}
              onCancel={() => setAddVendorModal({ isOpen: false })}
            />
          </motion.div>
        </div>
      )}

      {/* Permit Management Modal */}
      {permitModal.isOpen && permitModal.vendor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setPermitModal({ vendor: null, isOpen: false })}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Manage Permit</h2>
              <button
                onClick={() => setPermitModal({ vendor: null, isOpen: false })}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <PermitManagementForm
              vendor={permitModal.vendor}
              onSubmit={(permitData) => updatePermitStatus(permitModal.vendor!._id, permitData)}
              onCancel={() => setPermitModal({ vendor: null, isOpen: false })}
            />
          </motion.div>
        </div>
      )}

      {/* View Vendor Modal */}
      {viewModal.isOpen && viewModal.vendor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setViewModal({ vendor: null, isOpen: false })}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Vendor Details</h2>
              <button
                onClick={() => setViewModal({ vendor: null, isOpen: false })}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <ViewVendorDetails vendor={viewModal.vendor} />
          </motion.div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {editModal.isOpen && editModal.vendor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setEditModal({ vendor: null, isOpen: false })}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Vendor</h2>
              <button
                onClick={() => setEditModal({ vendor: null, isOpen: false })}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <EditVendorForm 
              vendor={editModal.vendor}
              onSubmit={(vendorData) => updateVendor(editModal.vendor!._id, vendorData)}
              onCancel={() => setEditModal({ vendor: null, isOpen: false })}
            />
          </motion.div>
        </div>
      )}

      {/* Add Municipal Modal */}
      {addMunicipalModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setAddMunicipalModal({ isOpen: false })}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New Municipal User</h2>
              <button
                onClick={() => setAddMunicipalModal({ isOpen: false })}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                role: 'municipal',
                isActive: true,
                profile: {
                  contact: formData.get('contact'),
                  location: formData.get('location'),
                  description: formData.get('description')
                }
              };

              try {
                const response = await fetch('/api/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(userData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                  alert('Municipal user added successfully!');
                  setAddMunicipalModal({ isOpen: false });
                  fetchMunicipals();
                } else {
                  alert(data.error || 'Failed to add municipal user');
                }
              } catch (error) {
                console.error('Error adding municipal user:', error);
                alert('Failed to add municipal user');
              }
            }}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department/Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g., Municipal Corporation Office"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Role description or responsibilities"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-navsari-500 focus:border-navsari-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setAddMunicipalModal({ isOpen: false })}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-navsari-500 to-heritage-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Add Municipal User
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
} 