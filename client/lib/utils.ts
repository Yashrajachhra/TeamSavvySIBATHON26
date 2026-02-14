import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'PKR'): string {
    const symbols: Record<string, string> = { PKR: 'Rs', INR: '\u20B9', USD: '$', EUR: '\u20AC', AED: 'AED' };
    const locales: Record<string, string> = { PKR: 'en-PK', INR: 'en-IN', USD: 'en-US', EUR: 'de-DE', AED: 'en-AE' };
    try {
        return new Intl.NumberFormat(locales[currency] || 'en-US', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        const sym = symbols[currency] || currency;
        return `${sym} ${amount.toLocaleString()}`;
    }
}

export function formatNumber(num: number): string {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('en-IN');
}

export function formatKWh(kwh: number): string {
    if (kwh >= 1000) return `${(kwh / 1000).toFixed(1)} MWh`;
    return `${kwh.toFixed(0)} kWh`;
}
