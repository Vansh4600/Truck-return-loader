import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function relativeTimeFromNow(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = d.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60000);
  if (Math.abs(diffMin) < 60) return `${diffMin >= 0 ? 'in ' : ''}${Math.abs(diffMin)} min${diffMin < 0 ? ' ago' : ''}`;
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return `${diffHr >= 0 ? 'in ' : ''}${Math.abs(diffHr)} hr${diffHr < 0 ? ' ago' : ''}`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay >= 0 ? 'in ' : ''}${Math.abs(diffDay)} day${Math.abs(diffDay) === 1 ? '' : 's'}${diffDay < 0 ? ' ago' : ''}`;
}

export function vehicleTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    mini_truck: 'Mini Truck',
    pickup: 'Pickup',
    lcv: 'LCV',
    truck_10ft: '10 ft Truck',
    truck_14ft: '14 ft Truck',
    truck_17ft: '17 ft Truck',
    truck_19ft: '19 ft Truck',
    truck_20ft: '20 ft Truck',
    truck_22ft: '22 ft Truck',
    truck_24ft: '24 ft Truck',
    container_20ft: '20 ft Container',
    container_32ft: '32 ft Container',
    trailer: 'Trailer',
    tanker: 'Tanker',
    refrigerated: 'Refrigerated',
  };
  return labels[type] ?? type;
}
