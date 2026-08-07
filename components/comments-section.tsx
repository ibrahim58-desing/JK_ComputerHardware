'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Send, MessageSquare, CheckCircle2 } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { RevealGroup, itemVariants } from '@/components/reveal'

type CommentItem = {
  id: number
  name: string
  message: string
  createdAt: string
}

export function CommentsSection({ initialComments }: { initialComments: CommentItem[] }) {
  const [comments, setComments] = useState(initialComments)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      })
      const data = await res.json()

      if (data.success) {
        setComments((prev) => [data.data, ...prev])
        setName('')
        setMessage('')
        setSent(true)
        setTimeout(() => setSent(false), 3000)
      } else {
        setError(data.error || 'Failed to post comment. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="bg-surface px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          label="Community"
          title="Leave a Comment"
          description="Got feedback, a question, or just want to say hi? Drop a comment below — we read every one."
          align="center"
        />

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-4 rounded-3xl border border-card-border bg-card p-6 shadow-blue sm:p-7"
        >
          <input
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            required
            maxLength={1000}
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your comment..."
            className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between gap-4">
            <AnimatePresence>
              {sent && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-sm font-medium text-emerald-700"
                >
                  <CheckCircle2 size={16} />
                  Posted!
                </motion.p>
              )}
            </AnimatePresence>
            <button
              type="submit"
              disabled={sending}
              className="ml-auto flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-blue-lg disabled:opacity-60"
            >
              {sending ? 'Posting...' : 'Post Comment'}
              <Send size={16} />
            </button>
          </div>
        </form>

        {comments.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-2 py-8 text-center text-text-secondary">
            <MessageSquare size={28} className="opacity-30" />
            <p className="text-sm">No comments yet — be the first to say something.</p>
          </div>
        ) : (
          <RevealGroup className="mt-10 max-h-[520px] space-y-4 overflow-y-auto pr-1">
            {comments.map((c) => (
              <motion.div
                key={c.id}
                variants={itemVariants}
                className="flex gap-4 rounded-2xl border border-card-border bg-card p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    <span className="text-xs text-text-secondary">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="mt-1 break-words text-sm text-text-secondary">{c.message}</p>
                </div>
              </motion.div>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}
