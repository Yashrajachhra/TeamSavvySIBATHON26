import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
    title: 'SmartSolar — AI-Powered Solar Intelligence',
    description: 'Plan, finance, and maintain your rooftop solar panels with AI-powered insights. Optimize placement, find green financing, and monitor panel efficiency.',
    keywords: 'solar, panels, rooftop, AI, financing, maintenance, energy, renewable',
    openGraph: {
        title: 'SmartSolar — AI-Powered Solar Intelligence',
        description: 'Plan, finance, and maintain your rooftop solar panels with AI-powered insights.',
        type: 'website',
        locale: 'en_IN',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <head>
                <link rel="icon" href="/favicon.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#f97316" />
            </head>
            <body className="antialiased">
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                        },
                    }}
                />
            </body>
        </html>
    );
}
