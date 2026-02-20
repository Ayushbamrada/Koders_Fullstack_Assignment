/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Important: This ensures Tailwind processes all files
  safelist: [
    'bg-gray-50',
    'bg-gray-100',
    'bg-blue-50',
    'bg-green-50',
    'border-gray-300',
    'border-blue-300',
    'border-green-300',
    'text-gray-900',
    'text-gray-600',
    'text-gray-500',
    'bg-red-100',
    'text-red-800',
    'bg-yellow-100',
    'text-yellow-800',
    'bg-green-100',
    'text-green-800',
  ]
}