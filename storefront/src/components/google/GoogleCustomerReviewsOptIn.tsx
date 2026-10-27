'use client';

import { useEffect } from 'react';
import Script from 'next/script';

/**
 * Google Customer Reviews (GCR) Survey Opt-in Module
 *
 * Connected directly to Google Merchant Center Account ID: 5885607413.
 * Prompts customers upon order confirmation to opt into an email survey
 * sent by Google shortly after the estimated delivery date.
 */

export const GOOGLE_MERCHANT_CENTER_ID = 5885607413;

declare global {
  interface Window {
    gapi?: any;
    renderOptIn?: () => void;
  }
}

export interface GoogleCustomerReviewsOptInProps {
  orderId: string;
  email: string;
  estimatedDeliveryDate?: string;
  deliveryCountry?: string;
}

export function calculateEstimatedDeliveryDate(daysFromNow: number = 4): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export function GoogleCustomerReviewsOptIn({
  orderId,
  email,
  estimatedDeliveryDate,
  deliveryCountry = 'IN',
}: GoogleCustomerReviewsOptInProps) {
  const targetDate = estimatedDeliveryDate || calculateEstimatedDeliveryDate(4);
  const cleanEmail = email && email.includes('@') ? email.trim() : '';
  const cleanOrderId = String(orderId || '').trim();

  useEffect(() => {
    if (!cleanEmail || !cleanOrderId || cleanOrderId === 'ord_pending') return;

    window.renderOptIn = function () {
      if (typeof window !== 'undefined' && window.gapi && typeof window.gapi.load === 'function') {
        window.gapi.load('surveyoptin', function () {
          if (window.gapi.surveyoptin && typeof window.gapi.surveyoptin.render === 'function') {
            window.gapi.surveyoptin.render({
              merchant_id: GOOGLE_MERCHANT_CENTER_ID,
              order_id: cleanOrderId,
              email: cleanEmail,
              delivery_country: deliveryCountry,
              estimated_delivery_date: targetDate,
              opt_in_style: 'CENTER_DIALOG',
            });
          }
        });
      }
    };

    // If script is already cached/loaded, invoke immediately
    if (typeof window !== 'undefined' && window.gapi && window.gapi.surveyoptin) {
      window.renderOptIn();
    }
  }, [cleanOrderId, cleanEmail, targetDate, deliveryCountry]);

  if (!cleanEmail || !cleanOrderId || cleanOrderId === 'ord_pending') {
    return null;
  }

  return (
    <Script
      id="google-customer-reviews-surveyoptin"
      src="https://apis.google.com/js/platform.js?onload=renderOptIn"
      strategy="afterInteractive"
    />
  );
}
