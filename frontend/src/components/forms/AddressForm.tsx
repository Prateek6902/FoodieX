import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

const addressSchema = z.object({
  address_line1: z.string().min(1, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(6, 'Invalid postal code'),
  country: z.string().min(1, 'Country is required'),
  address_type: z.enum(['HOME', 'WORK', 'OTHER']),
  is_default: z.boolean().default(false),
})

type AddressFormData = z.infer<typeof addressSchema>

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => Promise<void>
  initialData?: Partial<AddressFormData>
  isLoading?: boolean
}

export const AddressForm = ({ onSubmit, initialData, isLoading }: AddressFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('address_line1')}
        label="Street Address"
        placeholder="Enter street address"
        error={errors.address_line1?.message}
      />
      <Input
        {...register('address_line2')}
        label="Address Line 2 (Optional)"
        placeholder="Apartment, suite, etc."
        error={errors.address_line2?.message}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('city')}
          label="City"
          placeholder="Enter city"
          error={errors.city?.message}
        />
        <Input
          {...register('state')}
          label="State"
          placeholder="Enter state"
          error={errors.state?.message}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('postal_code')}
          label="Postal Code"
          placeholder="Enter postal code"
          error={errors.postal_code?.message}
        />
        <Input
          {...register('country')}
          label="Country"
          placeholder="Enter country"
          error={errors.country?.message}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/70">Address Type</label>
        <div className="flex gap-4">
          {['HOME', 'WORK', 'OTHER'].map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="radio"
                value={type}
                {...register('address_type')}
                className="text-primary"
              />
              <span className="text-white/70">{type}</span>
            </label>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" {...register('is_default')} />
        <span className="text-sm text-white/70">Set as default address</span>
      </label>
      <Button type="submit" isLoading={isLoading} fullWidth>
        Save Address
      </Button>
    </form>
  )
}