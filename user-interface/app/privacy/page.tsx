import type { Metadata } from 'next'
import { PageHero } from '@/components/page-hero'
import { getSiteSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Privacy Policy — JK Infosystem',
  description: 'How JK Infosystem collects, uses, and protects your information.',
}

export const revalidate = 300

export default async function PrivacyPage() {
  const settings = await getSiteSettings()
  const updated = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <PageHero title="Privacy Policy" subtitle={`Last updated: ${updated}`} variant="blue" />

      <section className="bg-background px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-10 text-sm leading-relaxed text-text-secondary">
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-3">What we collect</h2>
            <p>
              We collect information you choose to give us directly — there is no account
              system and no tracking of you across other sites.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Contact form:</strong> your name, phone
                number, email address, and message, when you submit an enquiry.
              </li>
              <li>
                <strong className="text-foreground">Public comments:</strong> your name and
                comment text, when you post to the homepage comment wall. These are shown to
                every visitor of the site — please don&apos;t include anything you consider
                private.
              </li>
              <li>
                <strong className="text-foreground">Basic analytics:</strong> aggregate,
                privacy-friendly page-view analytics via Vercel Analytics. This does not use
                advertising or cross-site tracking cookies.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-3">Why we collect it</h2>
            <p>
              Enquiry details are used only to respond to your question and, where relevant,
              fulfil an order you&apos;ve asked us about. Comments are used to display community
              feedback on the site. We do not sell or rent your information to third parties,
              and we do not use it for advertising.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-3">Cookies</h2>
            <p>
              As a visitor browsing the site, we do not set tracking or advertising cookies.
              Cookies are only used for the admin login system that our staff use to manage
              the site — they are not set for regular visitors.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-3">How long we keep it</h2>
            <p>
              Enquiries and comments are retained until you ask us to remove them, or until
              our team clears older records during routine housekeeping. There is no automatic
              deletion schedule at this time.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-3">Your choices</h2>
            <p>
              You can ask us to correct or delete an enquiry or comment you&apos;ve submitted at
              any time — just contact us using the details below and mention what you&apos;d
              like changed or removed.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-3">Contact us</h2>
            <p>
              For any question about this policy or your information, reach us at{' '}
              {settings.contact_email ? (
                <a href={`mailto:${settings.contact_email}`} className="text-primary hover:underline">
                  {settings.contact_email}
                </a>
              ) : (
                'the contact details on our Contact page'
              )}
              {settings.contact_phone && <> or call {settings.contact_phone}</>}.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
