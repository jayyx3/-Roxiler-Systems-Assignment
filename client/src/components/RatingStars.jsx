import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating, onRatingChange, readOnly = false, size = 5 }) {
  const [hoverRating, setHoverRating] = useState(0);

  const stars = Array(size).fill(0);

  const getStarColor = (index) => {
    const starValue = index + 1;
    
    // Interactive hover feedback
    if (!readOnly && hoverRating > 0) {
      return starValue <= hoverRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600';
    }

    // Static display or current value
    return starValue <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600';
  };

  return (
    <div className="flex items-center space-x-1">
      {stars.map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            disabled={readOnly}
            onClick={() => onRatingChange && onRatingChange(starValue)}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            className={`transition-all duration-150 ${readOnly ? 'cursor-default' : 'hover:scale-125 cursor-pointer'}`}
          >
            <Star className={`w-5 h-5 ${getStarColor(index)}`} />
          </button>
        );
      })}
    </div>
  );
}
