import { useState, useEffect } from "react";
import { CATEGORIES, POST_TYPES } from "@shared/constants/categories.js";
import { LOCATIONS, getAreas } from "@shared/constants/locations.js";
import ImageUpload from "./ImageUpload";
import Select from "./Select";
import Stepper from "./Stepper";

const categoryOptions = [
  { value: "electronics", label: "Electronics" },
  { value: "books", label: "Books" },
  { value: "clothing", label: "Clothing" },
  { value: "keys", label: "Keys" },
  { value: "id-cards", label: "ID Cards" },
  { value: "other", label: "Other" },
];

const contactOptions = [
  { value: "chat", label: "In-app chat" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone number" },
];

const STEPS = [
  { id: 1, label: "Type & Details" },
  { id: 2, label: "Location & Date" },
  { id: 3, label: "Photos & Submit" },
];

export default function PostForm({ initialData, onSubmit, submitting }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    type: "lost",
    title: "",
    description: "",
    category: "electronics",
    location: { building: LOCATIONS[0].building, area: LOCATIONS[0].areas[0] || "" },
    dateLostFound: new Date().toISOString().split("T")[0],
    contactPreference: "chat",
    ...initialData,
  });
  const [images, setImages] = useState(initialData?.images || []);
  const [errors, setErrors] = useState({});

  const areas = getAreas(form.location.building);
  const buildingOptions = LOCATIONS.map((loc) => ({ value: loc.building, label: loc.building }));
  const areaOptions = areas.map((area) => ({ value: area, label: area }));

  useEffect(() => {
    if (!areas.includes(form.location.area)) {
      setForm((f) => ({ ...f, location: { ...f.location, area: areas[0] || "" } }));
    }
  }, [form.location.building]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSelectChange = (name, value) => {
    if (name === "building") {
      setForm({ ...form, location: { building: value, area: getAreas(value)[0] || "" } });
    } else if (name === "area") {
      setForm({ ...form, location: { ...form.location, area: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const validateStep = (s) => {
    const newErrors = {};
    if (s === 1) {
      if (!form.title || form.title.length < 3) newErrors.title = "Title must be at least 3 characters";
      if (!form.description || form.description.length < 10) newErrors.description = "Description must be at least 10 characters";
    }
    if (s === 3) {
      if (images.length === 0) newErrors.images = "At least one image is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) return;
    if (!validateStep(3)) return;

    const formData = new FormData();
    formData.append("type", form.type);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("location", JSON.stringify(form.location));
    formData.append("dateLostFound", form.dateLostFound);
    formData.append("contactPreference", form.contactPreference);
    images.forEach((img) => {
      if (img instanceof File) formData.append("images", img);
    });

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stepper steps={STEPS} current={step} />

      <div className="mt-8">
        {/* Step 1: Type & Details */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "lost" })}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 transition-all ${
                  form.type === "lost"
                    ? "border-warning bg-warning/5"
                    : "border-border bg-white hover:border-warning/40"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${form.type === "lost" ? "bg-warning/20" : "bg-background"}`}>
                  <svg className={`h-5 w-5 ${form.type === "lost" ? "text-warning" : "text-muted"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className={`text-sm font-bold ${form.type === "lost" ? "text-warning" : "text-dark"}`}>
                  I Lost Something
                </span>
                <span className="text-[11px] text-muted">Report a missing item</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "found" })}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 transition-all ${
                  form.type === "found"
                    ? "border-success bg-success/5"
                    : "border-border bg-white hover:border-success/40"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${form.type === "found" ? "bg-success/20" : "bg-background"}`}>
                  <svg className={`h-5 w-5 ${form.type === "found" ? "text-success" : "text-muted"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className={`text-sm font-bold ${form.type === "found" ? "text-success" : "text-dark"}`}>
                  I Found Something
                </span>
                <span className="text-[11px] text-muted">Help someone find it</span>
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-dark">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Blue AirPods Pro case"
              />
              {errors.title && <p className="mt-1 text-xs text-danger">{errors.title}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-dark">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full resize-none rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Describe the item — color, size, distinguishing marks..."
              />
              {errors.description && <p className="mt-1 text-xs text-danger">{errors.description}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-dark">Category</label>
              <Select
                value={form.category}
                onChange={(val) => handleSelectChange("category", val)}
                options={categoryOptions}
                placeholder="Select category"
              />
            </div>
          </div>
        )}

        {/* Step 2: Location & Date */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Where on campus?</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-dark">Building</label>
                  <Select
                    value={form.location.building}
                    onChange={(val) => handleSelectChange("building", val)}
                    options={buildingOptions}
                    placeholder="Select building"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-dark">Area</label>
                  <input
                    type="text"
                    list="area-suggestions"
                    value={form.location.area}
                    onChange={(e) => handleSelectChange("area", e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Cafeteria, Room 204, Amphi A..."
                  />
                  <datalist id="area-suggestions">
                    {areas.map((area) => (
                      <option key={area} value={area} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">When & how</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-dark">
                    Date {form.type === "lost" ? "lost" : "found"}
                  </label>
                  <input
                    type="date"
                    name="dateLostFound"
                    value={form.dateLostFound}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-dark">Contact preference</label>
                  <Select
                    value={form.contactPreference}
                    onChange={(val) => handleSelectChange("contactPreference", val)}
                    options={contactOptions}
                    placeholder="How to contact you"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Photos & Submit */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="mb-1 text-sm font-semibold text-dark">Upload photos</p>
              <p className="mb-4 text-xs text-muted">Add 1-3 clear photos of the item to help identify it</p>
              <ImageUpload images={images} onChange={setImages} />
              {errors.images && <p className="mt-2 text-xs text-danger">{errors.images}</p>}
            </div>

            <div className="rounded-xl border border-border bg-background/50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Summary</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-muted">Type</span>
                  <p className="font-medium text-dark capitalize">{form.type}</p>
                </div>
                <div>
                  <span className="text-muted">Category</span>
                  <p className="font-medium text-dark">{categoryOptions.find((c) => c.value === form.category)?.label}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted">Title</span>
                  <p className="font-medium text-dark">{form.title || "—"}</p>
                </div>
                <div>
                  <span className="text-muted">Location</span>
                  <p className="font-medium text-dark">{form.location.building} — {form.location.area}</p>
                </div>
                <div>
                  <span className="text-muted">Date</span>
                  <p className="font-medium text-dark">{new Date(form.dateLostFound).toLocaleDateString()}</p>
                </div>
              </div>
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
          <div />
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
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Report"}
            {!submitting && (
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
