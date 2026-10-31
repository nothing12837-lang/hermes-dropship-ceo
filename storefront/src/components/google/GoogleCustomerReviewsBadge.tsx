'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { GOOGLE_MERCHANT_CENTER_ID } from './GoogleCustomerReviewsOptIn';

declare global {
  interface Window {
    gapi?: any;
    renderBadge?: () => void;
  }
}

interface GoogleCustomerReviewsBadgeProps {
  variant?: 'inline' | 'floating';
}

export function GoogleCustomerReviewsBadge({ variant = 'inline' }: GoogleCustomerReviewsBadgeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant === 'floating') {
      window.renderBadge = function () {
        if (typeof window !== 'undefined' && window.gapi && typeof window.gapi.load === 'function') {
          const badgeContainer = document.createElement('div');
          badgeContainer.id = 'gcr-floating-badge-container';
          document.body.appendChild(badgeContainer);
          window.gapi.load('ratingbadge', function () {
            if (window.gapi.ratingbadge && typeof window.gapi.ratingbadge.render === 'function') {
              window.gapi.ratingbadge.render(badgeContainer, {
                merchant_id: GOOGLE_MERCHANT_CENTER_ID,
                position: 'BOTTOM_RIGHT',
              });
            }
          });
        }
      };

      if (typeof window !== 'undefined' && window.gapi && window.gapi.ratingbadge) {
        window.renderBadge();
      }
    } else if (variant === 'inline' && containerRef.current) {
      window.renderBadge = function () {
        if (typeof window !== 'undefined' && window.gapi && typeof window.gapi.load === 'function' && containerRef.current) {
          window.gapi.load('ratingbadge', function () {
            if (window.gapi.ratingbadge && typeof window.gapi.ratingbadge.render === 'function' && containerRef.current) {
              window.gapi.ratingbadge.render(containerRef.current, {
                merchant_id: GOOGLE_MERCHANT_CENTER_ID,
              });
            }
          });
        }
      };

      if (typeof window !== 'undefined' && window.gapi && window.gapi.ratingbadge) {
        window.renderBadge();
      }
    }
  }, [variant]);

  return (
    <div className="inline-flex items-center">
      <Script
        id="google-customer-reviews-badge-script"
        src="https://apis.google.com/js/platform.js?onload=renderBadge"
        strategy="afterInteractive"
      />
      {variant === 'inline' && (
        <div ref={containerRef} className="google-customer-reviews-inline-badge min-h-[32px] flex items-center" />
      )}
    </div>
  );
}
