import React, { useState } from "react";
import { Star } from "lucide-react";

export default function ReviewForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    organization: "",
    rating: 0,
    feedback: "",
  });

  // Update form state
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle star rating
  const handleRating = (val) => {
    setForm({ ...form, rating: val });
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
    setForm({ name: "", organization: "", rating: 0, feedback: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 rounded-xl p-6 mt-8 relative  mx-auto"
    >
      <h2 className="text-lg font-semibold text-blue-700 mb-4">
        We value your feedback
      </h2>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
            <input
              className="w-full border rounded px-3 py-2 bg-white focus:outline-none"
              type="text"
              name="name"
              id="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1" htmlFor="organization">organization</label>
            <input
              className="w-full border rounded px-3 py-2 bg-white focus:outline-none"
              type="text"
              name="organization"
              id="organization"
              value={form.organization}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Star Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={`star-${val}`}
                type="button"
                className="focus:outline-none"
                onClick={() => handleRating(val)}
              >
                <Star
                  fill={form.rating >= val ? "#FFD700" : "none"}
                  stroke="#FFD700"
                  size={24}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="feedback">Feedback</label>
          <textarea
            className="w-full border rounded px-3 py-2 bg-white focus:outline-none resize-none"
            name="feedback"
            id="feedback"
            value={form.feedback}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded shadow font-medium hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
