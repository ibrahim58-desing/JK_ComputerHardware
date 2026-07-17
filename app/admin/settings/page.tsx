'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Save, Loader2, Home } from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  // Settings state
  const [homepageCategories, setHomepageCategories] = useState<string[]>([])

  useEffect(() => {
    Promise.all([
      adminFetch('/api/admin/categories').then(r => r.json()),
      adminFetch('/api/admin/settings').then(r => r.json())
    ]).then(([catsRes, settingsRes]) => {
      if (catsRes.success) {
        setCategories(catsRes.data)
      }
      if (settingsRes.success) {
        if (settingsRes.data.homepage_categories) {
          try {
            setHomepageCategories(JSON.parse(settingsRes.data.homepage_categories))
          } catch (e) {
            setHomepageCategories([])
          }
        }
      }
      setLoading(false)
    })
  }, [])

  const handleCategoryToggle = (id: string) => {
    setHomepageCategories(prev => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id)
      } else {
        if (prev.length >= 3) {
          alert('You can select a maximum of 3 categories for the homepage.')
          return prev
        }
        return [...prev, id]
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        homepage_categories: JSON.stringify(homepageCategories)
      }
      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        alert('Settings saved successfully!')
      } else {
        alert('Failed to save settings')
      }
    } catch (e) {
      alert('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">Site Settings</h1>
        <p className="mt-2 text-text-secondary">Manage global configurations for the website.</p>
      </div>

      <div className="space-y-8">
        <div className="bg-card rounded-2xl border border-card-border p-6 shadow-blue space-y-6">
          <div className="flex items-center gap-3 border-b border-card-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Home size={20} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">Homepage Categories</h2>
              <p className="text-sm text-text-secondary">Select up to 3 categories to display prominently on the homepage.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((c) => {
              const idStr = c.id.toString()
              const isSelected = homepageCategories.includes(idStr)
              
              return (
                <label 
                  key={c.id} 
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(0,87,255,0.1)]' 
                      : 'border-card-border hover:border-primary/50 hover:bg-surface'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={isSelected}
                    onChange={() => handleCategoryToggle(idStr)}
                  />
                  <span className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {c.name}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving} 
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-70"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
