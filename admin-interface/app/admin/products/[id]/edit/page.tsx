'use client'

import { useState, useEffect, use } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import { Toast, useToast } from '@/components/ui/toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [product, setProduct] = useState<any>(null)
  const [imageToDelete, setImageToDelete] = useState<number | null>(null)
  const [deletingImage, setDeletingImage] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    stock: 0,
    status: 'active',
    featured: false,
    shortDescription: '',
    description: '',
    specs: '',
    offer: '',
  })

  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    Promise.all([
      adminFetch('/api/admin/categories').then(r => r.json()),
      adminFetch(`/api/admin/products/${resolvedParams.id}`).then(r => r.json())
    ]).then(([cats, prod]) => {
      if (cats.success) setCategories(cats.data)
      if (prod.success) {
        setProduct(prod.data)
        setFormData({
          name: prod.data.name,
          brand: prod.data.brand || '',
          price: (prod.data.price || '').replace(/^\s*₹\s*/, ''),
          originalPrice: (prod.data.originalPrice || '').replace(/^\s*₹\s*/, ''),
          categoryId: prod.data.categoryId.toString(),
          stock: prod.data.stock,
          status: prod.data.status,
          featured: prod.data.featured,
          shortDescription: prod.data.shortDescription || '',
          description: prod.data.description || '',
          specs: Array.isArray(prod.data.specs) ? prod.data.specs.join(', ') : '',
          offer: prod.data.offer || '',
        })
      }
      setLoading(false)
    })
  }, [resolvedParams.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const payload = {
        ...formData,
        price: formData.price.trim() ? `₹${formData.price.trim()}` : '',
        originalPrice: formData.originalPrice.trim() ? `₹${formData.originalPrice.trim()}` : '',
        categoryId: parseInt(formData.categoryId, 10),
        specs: formData.specs.split(',').map((s) => s.trim()).filter(Boolean),
      }

      const res = await adminFetch(`/api/admin/products/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        showToast('success', 'Product updated successfully')
      } else {
        showToast('error', data.error || 'Failed to update product')
      }
    } catch (error) {
      showToast('error', 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? Number(value)
          : name === 'price' || name === 'originalPrice'
          ? value.replace(/^\s*₹\s*/, '')
          : value,
    }))
  }

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    
    setUploading(true)
    const body = new FormData()
    body.append('image', e.target.files[0])

    try {
      const res = await adminFetch('/api/admin/upload', {
        method: 'POST',
        body,
      })
      const data = await res.json()
      
      if (data.success) {
        // Update the product's main image
        await adminFetch(`/api/admin/products/${resolvedParams.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: data.data.imageUrl })
        })
        // Refresh product data
        const prodRes = await adminFetch(`/api/admin/products/${resolvedParams.id}`)
        const prodData = await prodRes.json()
        if (prodData.success) setProduct(prodData.data)
      } else {
        showToast('error', data.error || 'Failed to upload image')
      }
    } catch (err) {
      showToast('error', 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    
    setUploading(true)
    const body = new FormData()
    Array.from(e.target.files).forEach(file => {
      body.append('images', file)
    })

    try {
      const res = await adminFetch(`/api/admin/products/${resolvedParams.id}/images`, {
        method: 'POST',
        body,
      })
      const data = await res.json()
      
      if (data.success) {
        // Refresh product to get new images
        const prodRes = await adminFetch(`/api/admin/products/${resolvedParams.id}`)
        const prodData = await prodRes.json()
        if (prodData.success) {
          setProduct(prodData.data)
          // Automatically set first image as main image if not set
          if (prodData.data.images.length > 0 && prodData.data.image === '/placeholder.jpg') {
            await adminFetch(`/api/admin/products/${resolvedParams.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: prodData.data.images[0].imageUrl })
            })
          }
        }
      } else {
        showToast('error', data.error || 'Failed to upload images')
      }
    } catch (err) {
      showToast('error', 'Upload failed')
    } finally {
      setUploading(false)
      // reset file input
      e.target.value = ''
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    setDeletingImage(true)
    try {
      await adminFetch(`/api/admin/products/${resolvedParams.id}/images/${imageId}`, {
        method: 'DELETE'
      })
      // Refresh product
      const prodRes = await adminFetch(`/api/admin/products/${resolvedParams.id}`)
      const prodData = await prodRes.json()
      if (prodData.success) setProduct(prodData.data)
    } catch (err) {
      showToast('error', 'Delete failed')
    } finally {
      setDeletingImage(false)
      setImageToDelete(null)
    }
  }

  const handleSetMainImage = async (imageUrl: string) => {
    try {
      await adminFetch(`/api/admin/products/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl })
      })
      showToast('success', 'Main image updated')
      const prodRes = await adminFetch(`/api/admin/products/${resolvedParams.id}`)
      const prodData = await prodRes.json()
      if (prodData.success) setProduct(prodData.data)
    } catch (err) {
      showToast('error', 'Update failed')
    }
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
  if (!product) return <div>Product not found</div>

  return (
    <div className="max-w-4xl">
      <Toast toast={toast} onClose={hideToast} />
      <ConfirmDialog
        open={imageToDelete !== null}
        title="Delete image"
        message="Are you sure you want to delete this image? This can't be undone."
        confirmLabel="Delete"
        destructive
        loading={deletingImage}
        onConfirm={() => imageToDelete !== null && handleDeleteImage(imageToDelete)}
        onCancel={() => setImageToDelete(null)}
      />
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="p-2 hover:bg-card border border-card-border rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-heading text-3xl font-bold text-foreground">Edit Product</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <form id="productForm" onSubmit={handleSubmit} className="space-y-8">
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
                  <label className="block text-sm font-medium mb-1.5">Display Price (optional)</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-text-secondary">₹</span>
                    <input type="text" name="price" value={formData.price} onChange={handleChange} placeholder="42,999" className="w-full rounded-xl border border-input bg-background pl-8 pr-4 py-2.5 text-sm outline-none focus:border-primary" />
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">Leave blank if the price isn&apos;t set yet. The price range filter on the Products page uses the numbers in this field automatically.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Original Price (optional)</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-text-secondary">₹</span>
                    <input type="text" name="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="49,999" className="w-full rounded-xl border border-input bg-background pl-8 pr-4 py-2.5 text-sm outline-none focus:border-primary" />
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">Leave blank if there&apos;s no discount. When set, it shows struck through next to the price.</p>
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
              <div>
                <label className="block text-sm font-medium mb-1.5">Offer (optional)</label>
                <input type="text" name="offer" placeholder="e.g. 10% OFF, Flat ₹2,000 Off, Festive Deal" value={formData.offer} onChange={handleChange} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                <p className="mt-1 text-xs text-text-secondary">Leave blank if there&apos;s no offer. When set, it shows as a highlighted tag on the product card.</p>
              </div>
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
          </form>
        </div>

        {/* Sidebar for images */}
        <div className="space-y-6">
          {/* Main Image */}
          <div className="bg-card rounded-2xl border border-card-border p-6 shadow-blue">
            <h2 className="font-heading text-xl font-bold mb-4">Main Image</h2>
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border-2 border-primary bg-surface aspect-square flex items-center justify-center">
                {product.image && product.image !== '/placeholder.jpg' ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-text-secondary">
                    <ImageIcon size={48} className="mx-auto opacity-20 mb-2" />
                    <p className="text-xs">No main image</p>
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">Main</span>
              </div>
              <label className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-card-border rounded-xl cursor-pointer hover:bg-surface hover:border-primary/50 transition-colors">
                {uploading ? <Loader2 size={18} className="animate-spin text-primary" /> : <Upload size={18} className="text-primary" />}
                <span className="text-sm font-medium text-foreground">{uploading ? 'Uploading...' : 'Change Main Image'}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleMainImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Gallery Images */}
          <div className="bg-card rounded-2xl border border-card-border p-6 shadow-blue">
            <h2 className="font-heading text-xl font-bold mb-4">Gallery Images</h2>
            
            <div className="space-y-4">
              {product.images?.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {product.images.map((img: any) => (
                    <div key={img.id} className="relative rounded-xl overflow-hidden border-2 border-card-border group">
                      <img src={img.imageUrl} alt="" className="w-full aspect-square object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleSetMainImage(img.imageUrl)}
                          className="p-2 bg-white rounded-lg hover:bg-primary hover:text-white transition-colors"
                          title="Set as main image"
                        >
                          <ImageIcon size={14} />
                        </button>
                        <button
                          onClick={() => setImageToDelete(img.id)}
                          className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 border-2 border-dashed border-card-border rounded-xl text-text-secondary text-sm">
                  No gallery images
                </div>
              )}

              <label className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-card-border rounded-xl cursor-pointer hover:bg-surface hover:border-primary/50 transition-colors">
                {uploading ? <Loader2 size={18} className="animate-spin text-primary" /> : <Upload size={18} className="text-primary" />}
                <span className="text-sm font-medium text-foreground">{uploading ? 'Uploading...' : 'Add Gallery Images'}</span>
                <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>
          
          <div className="bg-card rounded-2xl border border-card-border p-6 shadow-blue">
            <button 
              type="submit" 
              form="productForm"
              disabled={saving} 
              className="w-full flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
