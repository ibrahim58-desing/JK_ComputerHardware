import { z } from 'zod'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required').max(128),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
})

// ─── Products ─────────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().default(''),
  shortDescription: z.string().max(500).default(''),
  price: z.string().max(50).default(''),
  originalPrice: z.string().max(50).nullable().optional(),
  stock: z.number().int().min(0).default(0),
  brand: z.string().max(100).default(''),
  specs: z.array(z.string()).default([]),
  badge: z
    .object({
      label: z.string(),
      tone: z.enum(['blue', 'purple', 'red', 'green']),
    })
    .nullable()
    .optional(),
  offer: z.string().max(100).nullable().optional(),
  image: z.string().default('/placeholder.jpg'),
  galleryImages: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  status: z.enum(['active', 'inactive']).default('active'),
  categoryId: z.number().int().positive('Category is required'),
})

// createProductSchema.partial() is NOT enough on its own: Zod still applies
// a field's .default(...) when that key is simply absent from the request
// body, even though the field is now "optional". Every partial update (e.g.
// editing just the price) was silently resetting `image` back to
// '/placeholder.jpg' — since the edit form never sends `image` — which then
// hid the product from the storefront's placeholder-image filter. Re-declare
// every defaulted field here as plain-optional so an absent key really means
// "leave this field alone" instead of "reset it to the schema default".
export const updateProductSchema = createProductSchema.partial().extend({
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  stock: z.number().int().min(0).optional(),
  brand: z.string().max(100).optional(),
  specs: z.array(z.string()).optional(),
  image: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

// ─── Categories ───────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
})

export const updateCategorySchema = createCategorySchema

// ─── Enquiries ────────────────────────────────────────────────────────────────

export const createEnquirySchema = z.object({
  customerName: z.string().min(1, 'Name is required').max(200),
  phone: z.string().max(20).default(''),
  email: z.string().email('Invalid email').max(200).or(z.literal('')).default(''),
  subject: z.string().max(300).default(''),
  message: z.string().min(1, 'Message is required').max(5000),
  productId: z.number().int().positive().nullable().optional(),
})

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const createTestimonialSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  role: z.string().max(100).default(''),
  content: z.string().min(1, 'Testimonial text is required').max(1000),
  rating: z.number().int().min(1).max(5).default(5),
  status: z.enum(['active', 'inactive']).default('active'),
  displayOrder: z.number().int().default(0),
})

// Same defaults-leak-through-partial() issue as updateProductSchema above —
// re-declare the defaulted fields as plain-optional.
export const updateTestimonialSchema = createTestimonialSchema.partial().extend({
  role: z.string().max(100).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  displayOrder: z.number().int().optional(),
})

// ─── Homepage Comments ────────────────────────────────────────────────────────

export const createCommentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  message: z.string().min(1, 'Comment is required').max(1000),
})

// ─── Site Settings ────────────────────────────────────────────────────────────

const ALLOWED_SETTING_KEYS = [
  'site_name',
  'site_tagline',
  'site_description',
  'contact_phone',
  'contact_email',
  'contact_address',
  'whatsapp_number',
  'instagram_url',
  'facebook_url',
  'youtube_url',
  'google_maps_url',
  'working_hours',
  'homepage_categories',
  'top_products',
] as const

export const updateSettingsSchema = z
  .record(z.string(), z.string().max(2000))
  .refine(
    (data) => Object.keys(data).every((k) => ALLOWED_SETTING_KEYS.includes(k as typeof ALLOWED_SETTING_KEYS[number])),
    { message: 'One or more setting keys are not allowed' }
  )

// ─── Image Reorder ────────────────────────────────────────────────────────────

export const reorderImagesSchema = z.object({
  imageIds: z.array(z.number().int().positive()),
})
