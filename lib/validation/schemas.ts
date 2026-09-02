/**
 * Zod validation schemas. Every server action / API route must validate
 * incoming payloads with these schemas — never trust client-side validation
 * alone (see SECURITY.md).
 */

import { z } from 'zod';

export const vehicleTypeSchema = z.enum([
  'mini_truck',
  'pickup',
  'lcv',
  'truck_10ft',
  'truck_14ft',
  'truck_17ft',
  'truck_19ft',
  'truck_20ft',
  'truck_22ft',
  'truck_24ft',
  'container_20ft',
  'container_32ft',
  'trailer',
  'tanker',
  'refrigerated',
]);

export const loadTypeSchema = z.enum([
  'general',
  'perishable',
  'fragile',
  'liquid',
  'construction_material',
  'agriculture',
  'electronics',
  'textile',
  'machinery',
  'other',
]);

export const userRoleSchema = z.enum(['truck_owner', 'shipper', 'admin']);

const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const addressSchema = z.object({
  label: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  country: z.string().min(1).max(100).default('India'),
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'Pincode must be 6 digits')
    .nullable()
    .optional(),
  coordinates: coordinateSchema,
});

// Indian vehicle registration format, e.g. "UP32 AB 1234" (kept lenient for demo data)
const vehicleNumberRegex = /^[A-Z]{2}[- ]?\d{1,2}[- ]?[A-Z]{1,3}[- ]?\d{1,4}$/i;

export const createTruckSchema = z.object({
  vehicleNumber: z
    .string()
    .trim()
    .min(4)
    .max(20)
    .regex(vehicleNumberRegex, 'Enter a valid vehicle registration number'),
  vehicleType: vehicleTypeSchema,
  capacityTons: z.number().positive().max(60),
  lengthFt: z.number().positive().max(60).nullable().optional(),
  widthFt: z.number().positive().max(20).nullable().optional(),
  heightFt: z.number().positive().max(20).nullable().optional(),
  originCity: z.string().min(1).max(100),
  destinationCity: z.string().min(1).max(100),
  currentLocation: addressSchema,
  availableFrom: z.coerce.date(),
  availableTo: z.coerce.date().nullable().optional(),
  minPrice: z.number().nonnegative().max(10_000_000).nullable().optional(),
  driverName: z.string().max(100).nullable().optional(),
  driverPhone: z
    .string()
    .regex(/^[+]?\d{10,15}$/, 'Enter a valid phone number')
    .nullable()
    .optional(),
}).refine((data) => !data.availableTo || data.availableTo > data.availableFrom, {
  message: '"available to" must be after "available from"',
  path: ['availableTo'],
});

export const updateTruckStatusSchema = z.object({
  truckId: z.string().uuid(),
  status: z.enum(['available', 'busy', 'in_transit', 'maintenance', 'inactive']),
});

export const createLoadSchema = z
  .object({
    pickupCity: z.string().min(1).max(100),
    pickupAddress: addressSchema,
    destinationCity: z.string().min(1).max(100),
    destinationAddress: addressSchema,
    weightTons: z.number().positive().max(60),
    lengthFt: z.number().positive().max(60).nullable().optional(),
    widthFt: z.number().positive().max(20).nullable().optional(),
    heightFt: z.number().positive().max(20).nullable().optional(),
    loadType: loadTypeSchema,
    vehicleTypeRequired: vehicleTypeSchema,
    pickupDatetime: z.coerce.date(),
    pickupWindowHours: z.number().min(0).max(72).default(6),
    offeredPrice: z.number().positive().max(10_000_000),
    specialInstructions: z.string().max(1000).nullable().optional(),
  })
  .refine((data) => data.pickupCity.toLowerCase() !== data.destinationCity.toLowerCase(), {
    message: 'Pickup and destination cities must be different',
    path: ['destinationCity'],
  })
  .refine((data) => data.pickupDatetime.getTime() > Date.now() - 60_000, {
    message: 'Pickup date/time must be in the future',
    path: ['pickupDatetime'],
  });

export const bookingStatusSchema = z.enum([
  'requested',
  'accepted',
  'rejected',
  'confirmed',
  'pickup',
  'in_transit',
  'delivered',
  'completed',
  'cancelled',
  'disputed',
]);

export const createBookingRequestSchema = z.object({
  loadId: z.string().uuid(),
  truckId: z.string().uuid(),
  matchScore: z.number().min(0).max(100).nullable().optional(),
});

export const bookingTransitionSchema = z.object({
  bookingId: z.string().uuid(),
  nextStatus: bookingStatusSchema,
  reason: z.string().max(500).optional(),
});

export const createRatingSchema = z.object({
  bookingId: z.string().uuid(),
  rateeId: z.string().uuid(),
  stars: z.number().int().min(1).max(5),
  comment: z.string().max(1000).nullable().optional(),
});

export const sendMessageSchema = z.object({
  bookingId: z.string().uuid(),
  body: z.string().min(1).max(2000),
});

export const createDisputeSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().min(10).max(1000),
});

export const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(72),
    fullName: z.string().min(2).max(100),
    role: userRoleSchema.exclude(['admin']), // admins are provisioned manually
    phone: z
      .string()
      .regex(/^[+]?\d{10,15}$/, 'Enter a valid phone number')
      .optional(),
    companyName: z.string().max(150).optional(),
  })
  .strict();

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type CreateTruckInput = z.infer<typeof createTruckSchema>;
export type CreateLoadInput = z.infer<typeof createLoadSchema>;
export type CreateBookingRequestInput = z.infer<typeof createBookingRequestSchema>;
export type BookingTransitionInput = z.infer<typeof bookingTransitionSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
