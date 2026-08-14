'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Send, CheckCircle2 } from 'lucide-react'

const fields = [
  { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Karthik J.' },
  { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'you@email.com' },
  { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Custom PC build enquiry' },
] as const

export function ContactForm() {
  const [sent, setSent] = useState(false)

  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)

    const formData = new FormData(e.currentTarget)
    const payload = {
      customerName: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    }

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setSent(true)
        e.currentTarget.reset()
      } else {
        alert('Failed to send message. Please try again.')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-3xl border border-card-border bg-card p-7 shadow-blue sm:p-9">
      <h2 className="font-heading text-2xl font-bold text-card-foreground">
        Send us a message
      </h2>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.name} className={f.name === 'subject' ? 'sm:col-span-2' : ''}>
              <label
                htmlFor={f.name}
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                {f.label}
              </label>
              <input
                id={f.name}
                name={f.name}
                type={f.type}
                required
                placeholder={f.placeholder}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>
          ))}
        </div>
        <div>
          <label
            htmlFor="message"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            placeholder="Tell us what you're looking for..."
            className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="group flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-all hover:gap-3 hover:shadow-blue-lg disabled:opacity-70"
        >
          {sending ? 'Sending...' : 'Send Message'}
          <Send size={17} className="transition-transform group-hover:translate-x-1" />
        </button>

        <AnimatePresence>
          {sent && (
            <motion.div
              initial={{ opacity: 0, y: 12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700"
            >
              <CheckCircle2 size={18} />
              Thanks! We&apos;ll get back to you soon.
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}
