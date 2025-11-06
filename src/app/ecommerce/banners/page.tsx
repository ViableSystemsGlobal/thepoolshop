"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/toast-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Trash2, Edit, ArrowUp, ArrowDown, Plus, X } from "lucide-react";
import Image from "next/image";

interface Banner {
  id: string;
  title: string | null;
  image: string;
  link: string | null;
  linkText: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BannersPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ecommerce/banners');
      if (response.ok) {
        const data = await response.json();
        setBanners(data.banners || []);
      }
    } catch (err) {
      console.error('Error loading banners:', err);
      error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'banner');

    const response = await fetch('/api/upload/branding', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return data.url;
    } else {
      throw new Error('Failed to upload image');
    }
  };

  const handleSave = async (bannerData: Partial<Banner>) => {
    try {
      const imageUrl = bannerData.image || '';
      
      if (editingBanner) {
        // Update existing banner
        const response = await fetch(`/api/ecommerce/banners/${editingBanner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...bannerData,
            image: imageUrl,
          }),
        });

        if (response.ok) {
          success('Banner updated successfully!');
          setEditingBanner(null);
          setShowForm(false);
          loadBanners();
        } else {
          error('Failed to update banner');
        }
      } else {
        // Create new banner
        const response = await fetch('/api/ecommerce/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...bannerData,
            image: imageUrl,
          }),
        });

        if (response.ok) {
          success('Banner created successfully!');
          setShowForm(false);
          loadBanners();
        } else {
          error('Failed to create banner');
        }
      }
    } catch (err) {
      console.error('Error saving banner:', err);
      error('Failed to save banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`/api/ecommerce/banners/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success('Banner deleted successfully!');
        loadBanners();
      } else {
        error('Failed to delete banner');
      }
    } catch (err) {
      console.error('Error deleting banner:', err);
      error('Failed to delete banner');
    }
  };

  const handleOrderChange = async (id: string, direction: 'up' | 'down') => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;

    const currentIndex = banners.findIndex(b => b.id === id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= banners.length) return;

    const otherBanner = banners[newIndex];
    
    // Swap orders
    try {
      await Promise.all([
        fetch(`/api/ecommerce/banners/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: otherBanner.order }),
        }),
        fetch(`/api/ecommerce/banners/${otherBanner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: banner.order }),
        }),
      ]);
      
      loadBanners();
    } catch (err) {
      console.error('Error updating order:', err);
      error('Failed to update banner order');
    }
  };

  const BannerForm = ({ banner }: { banner?: Banner }) => {
    const [formData, setFormData] = useState({
      title: banner?.title || '',
      image: banner?.image || '',
      link: banner?.link || '',
      linkText: banner?.linkText || '',
      order: banner?.order || banners.length,
      isActive: banner?.isActive !== undefined ? banner.isActive : true,
    });

    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setUploading(true);
        const url = await handleFileUpload(file);
        setFormData({ ...formData, image: url });
        success('Image uploaded successfully!');
      } catch (err) {
        error('Failed to upload image');
      } finally {
        setUploading(false);
      }
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{banner ? 'Edit Banner' : 'Create New Banner'}</CardTitle>
          <CardDescription>
            {banner ? 'Update banner details' : 'Add a new promotional banner'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title (Optional)</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Banner title"
            />
          </div>

          <div>
            <Label>Banner Image *</Label>
            {formData.image && (
              <div className="mb-2">
                <Image
                  src={formData.image}
                  alt="Banner preview"
                  width={300}
                  height={150}
                  className="rounded border"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="banner-upload"
              disabled={uploading}
            />
            <Label htmlFor="banner-upload" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                {uploading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Uploading...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {formData.image ? 'Change image' : 'Upload banner image'}
                    </p>
                  </div>
                )}
              </div>
            </Label>
          </div>

          <div>
            <Label>Link URL (Optional)</Label>
            <Input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label>Link Text (Optional)</Label>
            <Input
              value={formData.linkText}
              onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
              placeholder="Click here"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={() => handleSave(formData)}
              disabled={!formData.image || uploading}
            >
              {banner ? 'Update Banner' : 'Create Banner'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingBanner(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-gray-600 mt-1">Manage promotional banners for your e-commerce homepage</p>
        </div>
        <Button
          onClick={() => {
            setEditingBanner(null);
            setShowForm(true);
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Banner</span>
        </Button>
      </div>

      {showForm && <BannerForm banner={editingBanner || undefined} />}

      <div className="space-y-4">
        {banners.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">No banners found. Create your first banner to get started.</p>
            </CardContent>
          </Card>
        ) : (
          banners.map((banner, index) => (
            <Card key={banner.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Image
                      src={banner.image}
                      alt={banner.title || 'Banner'}
                      width={200}
                      height={100}
                      className="rounded border"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{banner.title || 'Untitled Banner'}</h3>
                        {banner.link && (
                          <p className="text-sm text-gray-600 mt-1">
                            Link: <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{banner.linkText || banner.link}</a>
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          Order: {banner.order} | {banner.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOrderChange(banner.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOrderChange(banner.id, 'down')}
                          disabled={index === banners.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingBanner(banner);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(banner.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Only the first 3 active banners will be displayed on the homepage slider. 
          Make sure to set the display order and activate banners as needed.
        </p>
      </div>
    </div>
  );
}

