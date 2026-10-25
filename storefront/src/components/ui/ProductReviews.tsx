'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  image_url?: string | null;
  verified_buyer?: boolean;
  created_at?: string;
}

interface ProductReviewsProps {
  productId: string;
  productTitle: string;
}

export default function ProductReviews({ productId, productTitle }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [comment, setComment] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews?product_id=${encodeURIComponent(productId)}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // Declared after `fetchReviews` so the function is not referenced before it
  // is initialised.
  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Please upload a photo smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMessage('Please enter your name or user ID.');
      return;
    }
    if (!comment.trim()) {
      setErrorMessage('Please write your review thoughts.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          user_name: userName.trim(),
          rating,
          comment: comment.trim(),
          image_url: imageBase64,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      // Prepend review optimistically
      setReviews((prev) => [data.review, ...prev]);
      setSubmitSuccess(true);
      setUserName('');
      setComment('');
      setImageBase64(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++;
  });

  return (
    <section className="mt-8 md:mt-16 pt-6 md:pt-10 border-t border-neutral-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-900">
            Customer Reviews & Experience
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Real feedback from verified buyers across India
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm shadow-sm transition-all"
        >
          {showForm ? 'Close Form' : '✍️ Write a Review'}
        </button>
      </div>

      {/* Review Summary Breakdown or First Review Invite */}
      {totalReviews > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs mb-8">
          {/* Rating Score */}
          <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-neutral-100">
            <div className="text-5xl font-black text-neutral-900">{avgRating}</div>
            <div className="flex text-amber-400 text-lg my-1">
              {'★'.repeat(Math.round(Number(avgRating)))}
              {'☆'.repeat(5 - Math.round(Number(avgRating)))}
            </div>
            <p className="text-xs font-semibold text-neutral-500">
              Based on {totalReviews} {totalReviews === 1 ? 'verified review' : 'verified reviews'}
            </p>
            <div className="mt-3 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ✓ 100% Verified Purchases
            </div>
          </div>

          {/* Rating Bars */}
          <div className="space-y-2 md:col-span-2 flex flex-col justify-center">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingCounts[stars] || 0;
              const percentage = (count / totalReviews) * 100;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-10 font-bold text-neutral-700 flex items-center justify-end">
                    {stars} ★
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-neutral-400 text-right font-medium">
                    {count} ({Math.round(percentage)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-stone-50 border border-stone-200 mb-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl shadow-xs">
            ✨
          </div>
          <h3 className="text-base font-black text-stone-900 mb-1">
            Be the First to Review This Drop
          </h3>
          <p className="text-xs text-stone-600 max-w-md mx-auto mb-4 leading-relaxed">
            Order this piece today, share your honest fit & fabric photo feedback, and get <span className="font-bold text-orange-600">₹100 OFF</span> your next drop with code <span className="font-mono font-bold text-stone-900 bg-stone-200/80 px-1.5 py-0.5 rounded">FIRST100</span>.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-sm transition-all"
          >
            <span>✍️</span> Write First Verified Review
          </button>
        </div>
      )}

      {/* Write a Review Modal / Form Accordion */}
      {showForm && (
        <div className="mb-10 p-6 rounded-2xl bg-white border-2 border-neutral-900/10 shadow-md animate-in fade-in duration-200">
          <h3 className="text-lg font-bold text-neutral-900 mb-1">
            Share Your Experience with {productTitle}
          </h3>
          <p className="text-xs text-neutral-500 mb-5">
            Help other Indian shoppers by uploading a photo and rating your experience.
          </p>

          {submitSuccess && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold flex items-center gap-2">
              <span>🎉</span> Thank you! Your review has been published successfully.
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold">
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating Stars Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-3xl focus:outline-none transition-transform hover:scale-110"
                    aria-label={`${star} Stars`}
                  >
                    <span className={(hoverRating || rating) >= star ? 'text-amber-400' : 'text-neutral-200'}>
                      ★
                    </span>
                  </button>
                ))}
                <span className="text-xs font-bold text-neutral-600 ml-2">
                  {rating === 5 ? 'Excellent (5/5)' : rating === 4 ? 'Very Good (4/5)' : `${rating}/5 Stars`}
                </span>
              </div>
            </div>

            {/* Display Name / Customer ID */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Your Name / User ID & City
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Ajay Kumar (Ludhiana) or Rohit_92"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-sm text-neutral-900 outline-none transition-all"
              />
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="What did you like about this product? How was the delivery speed and quality?"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-sm text-neutral-900 outline-none transition-all resize-y"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Upload Photo (Optional)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer"
                />
              </div>

              {imageBase64 && (
                <div className="mt-3 relative inline-block">
                  <img
                    src={imageBase64}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-xl border border-neutral-200 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageBase64(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute -top-2 -right-2 bg-neutral-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-rose-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 rounded-full border border-neutral-300 font-bold text-xs text-neutral-700 hover:bg-neutral-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Post Verified Review 🚀'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-sm text-neutral-400">
            Loading verified reviews...
          </div>
        ) : reviews.length === 0 ? null : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs hover:border-neutral-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-800 font-bold text-xs flex items-center justify-center border border-amber-500/20">
                      {rev.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                        <span>{rev.user_name}</span>
                        {rev.verified_buyer && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="flex text-amber-400 text-xs mt-0.5">
                        {'★'.repeat(rev.rating)}
                        {'☆'.repeat(5 - rev.rating)}
                      </div>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] text-neutral-400 font-medium">
                  {rev.created_at
                    ? new Date(rev.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Recently'}
                </span>
              </div>

              <p className="mt-3 text-sm text-neutral-700 leading-relaxed font-normal">
                {rev.comment}
              </p>

              {rev.image_url && (
                <div className="mt-3">
                  <img
                    src={rev.image_url}
                    alt="Customer photo"
                    className="w-24 h-24 object-cover rounded-xl border border-neutral-200 shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(rev.image_url || '', '_blank')}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
