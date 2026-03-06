"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

/* --------------------------- */
/* 🔹 Background Animation     */
/* --------------------------- */
function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">

      {/* Animated Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-600 to-blue-500 animate-gradient-ultra" />

      {/* Rotating Glow Rings */}
      <div className="absolute w-[900px] h-[900px] bg-purple-500/30 blur-[180px] rounded-full animate-spin-slow top-[10%] left-[10%]" />

      <div className="absolute w-[700px] h-[700px] bg-blue-500/30 blur-[150px] rounded-full animate-spin-reverse bottom-[10%] right-[10%]" />

      {/* Floating Orbs */}
      {[...Array(20)].map((_, i) => (
        <span
          key={i}
          className="absolute block rounded-full opacity-40 bg-white/30"
          style={{
            width: `${Math.random() * 80 + 20}px`,
            height: `${Math.random() * 80 + 20}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float-ultra-${i % 3} ${Math.random() * 4 + 2}s ease-in-out infinite`,
          }}
        />
      ))}

      <style jsx>{`

        @keyframes float-ultra-0 {
          0%,100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-40px) scale(1.3); }
        }

        @keyframes float-ultra-1 {
          0%,100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-50px) scale(1.4); }
        }

        @keyframes float-ultra-2 {
          0%,100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-45px) scale(1.35); }
        }

        @keyframes gradient-ultra {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient-ultra {
          background-size: 300% 300%;
          animation: gradient-ultra 5s ease infinite;
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        .animate-spin-slow {
          animation: spinSlow 35s linear infinite;
        }

        .animate-spin-reverse {
          animation: spinReverse 40s linear infinite;
        }

      `}</style>
    </div>
  )
}

/* --------------------------- */
/* 🔹 Main Page Component       */
/* --------------------------- */
export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) router.push("/dashboard")
    }
    checkUser()
  }, [router])

  const handleLogin = async () => {
    setIsLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/dashboard`,
      },
    })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      {/* Animated Background */}
      <BackgroundAnimation />

      {/* Glass Login Card */}
      <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-10 text-white z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Weekly Chronicle
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Your digital editorial workspace
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 my-6"></div>

        {/* Google Login Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-3 rounded-xl shadow-lg 
                      hover:shadow-xl hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]
                      ${isLoading ? "cursor-not-allowed opacity-70" : ""}`}
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.3 2.3 29.5 0 24 0 14.6 0 6.6 5.5 2.6 13.5l7.1 5.5C11.6 13 17.3 9.5 24 9.5z" />
            <path fill="#34A853" d="M46.5 24.5c0-1.7-.1-3.4-.4-5H24v9.5h12.7c-.5 3-2.2 5.6-4.7 7.3l7.3 5.7c4.2-3.9 6.2-9.7 6.2-17.5z" />
            <path fill="#4A90E2" d="M9.7 28.9c-.6-1.7-1-3.5-1-5.4s.4-3.7 1-5.4l-7.1-5.5C1 15.6 0 19.6 0 24s1 8.4 2.6 11.4l7.1-5.5z" />
            <path fill="#FBBC05" d="M24 48c6.5 0 12-2.1 16-5.7l-7.3-5.7c-2 1.4-4.6 2.2-8.7 2.2-6.7 0-12.4-3.5-14.3-8.6l-7.1 5.5C6.6 42.5 14.6 48 24 48z" />
          </svg>

          {isLoading ? (
            <div className="flex items-center gap-2">
              <span>Signing in...</span>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            </div>
          ) : (
            "Continue with Google (SSO)"
          )}
        </button>

        {/* Footer */}
        <p className="text-xs text-center text-white/70 mt-8">
          Secure Single Sign-On powered by Google
        </p>
      </div>
    </div>
  )
}