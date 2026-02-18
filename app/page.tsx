import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-6">
          AI Growth Engine for Restaurants
        </h1>

        <p className="text-lg text-gray-300 mb-8">
          Analyze reviews. Beat competitors. Increase ratings.
        </p>

        <a
          href="/analyze"
          className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400"
        >
          Get customized report for your restaurant
        </a>
      </div>
    </main>
  )
}
