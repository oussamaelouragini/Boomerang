import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import Stepper from "../components/Stepper";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

const STEPS = [
  { id: 1, label: "Photo & Name" },
  { id: 2, label: "About You" },
  { id: 3, label: "Links" },
];

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const avatarRef = useRef();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: user?.name || "",
    bio: "",
    phone: "",
    studyProgram: "",
    studentId: "",
    linkedin: "",
    facebook: "",
    website: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initials = form.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("bio", form.bio);
      formData.append("phone", form.phone);
      formData.append("studyProgram", form.studyProgram);
      formData.append("studentId", form.studentId);
      formData.append("links[linkedin]", form.linkedin);
      formData.append("links[facebook]", form.facebook);
      formData.append("links[website]", form.website);
      if (avatarFile) formData.append("avatar", avatarFile);

      await api.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refreshUser();
      toast.success("Profile set up!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-dark">Welcome to Boomerang</h1>
        <p className="mt-1 text-sm text-muted">Let's set up your profile — this only takes a minute</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <Stepper steps={STEPS} current={step} />

        <div className="mt-8">
          {/* Step 1: Photo & Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => avatarRef.current?.click()}
                  className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary-light text-primary transition-all hover:ring-4 hover:ring-primary/20"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => avatarRef.current?.click()}
                  className="mt-2 text-sm font-medium text-primary hover:underline"
                >
                  Upload a photo
                </button>
                <p className="text-xs text-muted">Optional — you can always add one later</p>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-dark">Display name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {/* Step 2: About You */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-dark">Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={3}
                  maxLength={300}
                  className="w-full resize-none rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="A short intro about yourself..."
                />
                <p className="mt-1 text-right text-xs text-muted">{form.bio.length}/300</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-dark">Phone number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="+216 XX XXX XXX"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-dark">Study program</label>
                <input
                  type="text"
                  name="studyProgram"
                  value={form.studyProgram}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Epi Digital & Technique — 3rd year"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-dark">Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  value={form.studentId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="EPI-2024-001"
                />
              </div>
            </div>
          )}

          {/* Step 3: Links */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted">Add your social links so others can connect with you outside the app.</p>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-dark">
                  <svg className="h-4 w-4 text-muted" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={form.linkedin}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-dark">
                  <svg className="h-4 w-4 text-muted" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" />
                  </svg>
                  Facebook
                </label>
                <input
                  type="url"
                  name="facebook"
                  value={form.facebook}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="https://facebook.com/username"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-dark">
                  <svg className="h-4 w-4 text-muted" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={prev}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-dark"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-dark"
            >
              Skip for now
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
            >
              Continue
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Get Started"}
              {!submitting && (
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        All fields are optional. You can update your profile anytime from settings.
      </p>
    </div>
  );
}
