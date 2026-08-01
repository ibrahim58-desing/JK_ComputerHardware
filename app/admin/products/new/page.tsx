'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Upload, Image as ImageIcon, X } from 'lucide-react'

export default function AddProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    categoryId: '',
    stock: 0,
    status: 'active',
    featured: false,
    shortDescription: '',
    description: '',
    specs: '', // comma separated for simplicity in UI
    image: '/placeholder.jpg',
    galleryImages: [] as string[],
  })

  useEffect(() => {
    adminFetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId, 10),
        specs: formData.specs.split(',').map((s) => s.trim()).filter(Boolean),
      }

      const res = await adminFetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        router.push('/admin/products')
      } else {
        alert(data.error || 'Failed to create product')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    
    setImageUploading(true)
    const body = new FormData()
    body.append('image', e.target.files[0])

    try {
      const res = await adminFetch('/api/admin/upload', {
        method: 'POST',
        body,
      })
      const data = await res.json()
      
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.data.imageUrl }))
      } else {
        alert(data.error || 'Failed to upload image')
      }
    } catch (err) {
      alert('Upload failed')
    } finally {
      setImageUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    
    setGalleryUploading(true)
    const newImages: string[] = []
    
    // Upload files sequentially for simplicity
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i]
      const body = new FormData()
      body.append('image', file)

      try {
        const res = await adminFetch('/api/admin/upload', {
          method: 'POST',
          body,
        })
        const data = await res.json()
        if (data.success) {
          newImages.push(data.data.imageUrl)
        }
      } catch (err) {
        console.error('Gallery upload failed for a file', err)
      }
    }

    if (newImages.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        galleryImages: [...prev.galleryImages, ...newImages] 
      }))
    }
    
    setGalleryUploading(false)
    e.target.value = ''
  }

  const removeGalleryImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== indexToRemove)
    }))
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="p-2 hover:bg-card border border-card-border rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-heading text-3xl font-bold text-foreground">Add Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-card rounded-2xl border border-card-border p-6 shadow-blue space-y-6">
          <h2 className="font-heading text-xl font-bold">Basic Information</h2>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1.5">Product Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Display Price (e.g. ₹42,999)</label>
              <input type="text" name="price" required value={formData.price} onChange={handleChange} placeholder="₹42,999" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
              <p className="mt-1 text-xs text-text-secondary">The price range filter on the Products page uses the numbers in this field automatically.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select name="categoryId" required value={formData.categoryId} onChange={handleChange} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Stock</label>
              <input type="number" name="stock" min="0" required value={formData.stock} onChange={handleChange} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-card-border p-6 shadow-blue space-y-6">
          <h2 className="font-heading text-xl font-bold">Details</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1.5">Short Description</label>
            <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleChange} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Description</label>
            <textarea name="description" rows={5} value={formData.description} onChange={handleChange} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Specifications (comma separated)</label>
            <input type="text" name="specs" placeholder="e.g. 24 Cores, 5.8GHz Boost, 125W" value={formData.specs} onChange={handleChange} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-card-border p-6 shadow-blue space-y-6">
          <h2 className="font-heading text-xl font-bold">Main Image</h2>
          
          <div className="space-y-4 max-w-sm">
            <div className="relative rounded-xl overflow-hidden border-2 border-card-border bg-surface aspect-square flex items-center justify-center text-text-secondary">
              {formData.image !== '/placeholder.jpg' ? (
                <img src={formData.image} alt="Product preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={48} className="opacity-20" />
              )}
            </div>

            <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-card-border rounded-xl cursor-pointer hover:bg-surface hover:border-primary/50 transition-colors">
              {imageUploading ? <Loader2 size={20} className="animate-spin text-primary" /> : <Upload size={20} className="text-primary" />}
              <span className="text-sm font-medium text-foreground">{imageUploading ? 'Uploading...' : 'Upload Main Image'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} disabled={imageUploading} />
            </label>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-card-border p-6 shadow-blue space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold">Gallery Images (Optional)</h2>
            <label className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border-2 border-primary text-primary rounded-xl cursor-pointer hover:bg-primary/10 transition-colors">
              {galleryUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {galleryUploading ? 'Uploading...' : 'Add Photos'}
              <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleGalleryUpload} disabled={galleryUploading} />
            </label>
          </div>
          
          {formData.galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {formData.galleryImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-card-border group">
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button type="button" onClick={() => removeGalleryImage(idx)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-text-secondary">No gallery images added.</div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-card-border p-6 shadow-blue space-y-6">
          <h2 className="font-heading text-xl font-bold">Visibility</h2>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center mt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="h-5 w-5 rounded border-input text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Featured Product</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/products" className="px-6 py-3 rounded-xl font-semibold border border-card-border hover:bg-card transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading || imageUploading || galleryUploading} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-70">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Product
          </button>
        </div>
      </form>
    </div>
  )
}
