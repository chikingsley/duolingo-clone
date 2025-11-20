import React from 'react';

export function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-500">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">Welcome to Lingo</h1>
        <p className="text-2xl mb-8">Learn languages with fun!</p>
        <a
          href="/courses"
          className="bg-white text-green-500 px-8 py-4 rounded-full font-bold text-xl hover:bg-gray-100 transition"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
