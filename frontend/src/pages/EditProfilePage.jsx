import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { toast } from "sonner";
import PasswordInput from "../components/PasswordInput";

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const avatarRef = useRef();

  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    studyProgram: user?.studyProgram || "",
    studentId: user?.studentId || "",
    linkedin: user?.links?.linkedin || "",
    facebook: user?.links?.facebook || "",
    website: user?.links?.website || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar ? `${API_BASE}${user.avatar}` : null
  );
  const [submitting, setSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.name.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

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
      toast.success("Profile updated");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-dark">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Photo</p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-4 ring-primary-light transition-all hover:ring-primary/20 ${
                avatarPreview ? "" : "bg-primary-light text-primary"
              }`}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <svg className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              )}
            </button>
            <div>
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Change photo
              </button>
              <p className="mt-0.5 text-xs text-muted">JPEG, PNG or WebP. Max 5MB.</p>
            </div>
            <input
              ref={avatarRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Personal info */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Personal info</p>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-dark">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-dark">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={3}
                maxLength={300}
                className="w-full resize-none rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Tell us a bit about yourself..."
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
          </div>
        </div>

        {/* Academic info */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Academic</p>
          <div className="space-y-4">
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
        </div>

        {/* Links */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Links</p>
          <div className="space-y-4">
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
        </div>

        {/* Security */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Security</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-dark">Password</p>
              <p className="text-xs text-muted">Update your password to keep your account secure</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-primary-light"
            >
              <svg className="h-4 w-4 text-muted" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Change
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-dark transition-colors hover:bg-background"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <ChangePasswordModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </div>
  );
}

function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.currentPassword) newErrors.currentPassword = "Required";
    if (!form.newPassword || form.newPassword.length < 6) newErrors.newPassword = "Minimum 6 characters";
    if (form.newPassword !== form.confirmPassword) newErrors.confirmPassword = "Passwords don't match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await api.put("/auth/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password updated");
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update password";
      if (msg.includes("incorrect")) {
        setErrors({ currentPassword: msg });
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm" onClick={onClose} />
      <div ref={modalRef} className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-card-hover">
        <h3 className="text-lg font-bold text-dark">Change Password</h3>
        <p className="mt-1 text-sm text-muted">Enter your current password and choose a new one</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-dark">Current password</label>
            <PasswordInput name="currentPassword" value={form.currentPassword} onChange={handleChange} placeholder="••••••••" autoFocus />
            {errors.currentPassword && <p className="mt-1 text-xs text-danger">{errors.currentPassword}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-dark">New password</label>
            <PasswordInput name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="Minimum 6 characters" />
            {errors.newPassword && <p className="mt-1 text-xs text-danger">{errors.newPassword}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-dark">Confirm new password</label>
            <PasswordInput name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" />
            {errors.confirmPassword && <p className="mt-1 text-xs text-danger">{errors.confirmPassword}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-dark transition-colors hover:bg-background"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
