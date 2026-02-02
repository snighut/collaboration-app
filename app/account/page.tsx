"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

export default function AccountPage() {
  const { user, session } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!session) {
      router.replace("/login?redirect=/account");
    } else if (user) {
      setName(user.user_metadata?.name || "");
      setEmail(user.email || "");
      setBio(user.user_metadata?.bio || "");
      setLocation(user.user_metadata?.location || "");
      setWebsite(user.user_metadata?.website || "");
    }
  }, [session, user, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    // Update name, bio, location, website
    const { error: metaError } = await supabase.auth.updateUser({ data: { name, bio, location, website } });
    if (metaError) {
      setError(metaError.message);
      setLoading(false);
      return;
    }
    // Update email if changed
    if (email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) {
        setError(emailError.message);
        setLoading(false);
        return;
      }
      setSuccess("Email update requested. Please check your inbox for verification.");
    }
    // Update password if provided
    if (password) {
      const { error: pwError } = await supabase.auth.updateUser({ password });
      if (pwError) {
        setError(pwError.message);
        setLoading(false);
        return;
      }
      setSuccess("Password updated successfully!");
    }
    if (!password && email === user.email) {
      setSuccess("Profile updated successfully!");
    }
    setLoading(false);
  };

  if (!session) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Account Settings</h2>
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Tell us about yourself"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="City, Country"
            />
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Website</label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://yourwebsite.com"
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
          <button
            type="button"
            className="mt-4 px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-100 font-semibold shadow hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors w-full"
            onClick={() => router.back()}
          >
            Done
          </button>
        </form>
      </div>
    </div>
  );
}
