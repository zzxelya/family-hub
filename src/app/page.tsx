"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/home");
      } else {
        setError("密码错误，请重试");
      }
    } catch {
      setError("连接失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 px-4 relative overflow-hidden">
      {/* Decorative floating circles */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-pink-200/30 rounded-full blur-3xl" />
      <div className="absolute top-[30%] right-[10%] w-32 h-32 bg-purple-200/40 rounded-full blur-2xl" />
      <div className="absolute bottom-[20%] left-[5%] w-24 h-24 bg-amber-200/30 rounded-full blur-2xl" />

      <div className="w-full max-w-sm relative z-10" style={{ animation: "slideUp 0.6s ease-out" }}>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg mb-4">
              <span className="text-4xl">🏠</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Family Hub</h1>
            <p className="text-gray-500 mt-1 text-sm">我们的家</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入家庭密码"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-center text-lg bg-white/60"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center animate-pulse">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl font-medium transition-all duration-200 btn-press shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  验证中...
                </>
              ) : (
                "进入"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
