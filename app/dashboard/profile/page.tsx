"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { PencilSquareIcon } from "@heroicons/react/24/solid";

import UidInput from "@/components/UidInput";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    let unsub: any;

    const loadProfile = async () => {
      unsub = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        let data;

        if (snap.exists()) {
          data = snap.data();
        } else {
          // create default profile
          data = {
            name: user.displayName || "",
            email: user.email || "",
            role: "user",
            createdAt: new Date(),
            publicUid: user.uid,
            bio: "",
            gender: "",
            dob: "",
            currentCity: "",
            hometown: "",
            work: "",
            contact: "",
            education: "",
          };
          await setDoc(ref, data);
        }

        setProfile(data);
        setForm({
          name: data.name || "",
          bio: data.bio || "",
          gender: data.gender || "",
          dob: data.dob || "",
          currentCity: data.currentCity || "",
          hometown: data.hometown || "",
          work: data.work || "",
          contact: data.contact || "",
          education: data.education || "",
        });
        setLoading(false);
      });
    };

    loadProfile();
    return () => unsub && unsub();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    const ref = doc(db, "users", auth.currentUser.uid);

    // Only update editable fields, don't touch createdAt or uid
    const updatedData = { ...form };

    await updateDoc(ref, updatedData);

    // Merge updated data into profile state without changing createdAt
    setProfile((prev: any) => ({ ...prev, ...updatedData }));
    setEditing(false);
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!profile) return <p className="p-6 text-red-600">Profile not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      {/* Banner + Avatar */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl"></div>
        <img
          src={profile.profilePhotoURL || "/default-avatar.png"}
          className="w-28 h-28 rounded-full border-4 border-white shadow absolute left-6 -bottom-12 object-cover"
        />
      </div>

      <div className="mt-16 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{profile.name || ""}</h1>
          <p className="text-gray-600">{profile.bio || "No bio available"}</p>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
        >
          <PencilSquareIcon className="w-5 h-5" />
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      {/* Editable Section */}
      <div className="mt-6 space-y-6">
        {editing ? (
          <div className="space-y-4">
            <Input label="Name" name="name" value={form.name} onChange={handleChange} />
            <Input label="Bio" name="bio" value={form.bio} onChange={handleChange} textarea />
            <Input label="Gender" name="gender" value={form.gender} onChange={handleChange} />
            <Input label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} />
            <Input label="Current City" name="currentCity" value={form.currentCity} onChange={handleChange} />
            <Input label="Hometown" name="hometown" value={form.hometown} onChange={handleChange} />
            <Input label="Workplace" name="work" value={form.work} onChange={handleChange} />
            <Input label="Contact Info" name="contact" value={form.contact} onChange={handleChange} />
            <Input label="Education" name="education" value={form.education} onChange={handleChange} />

            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-gray-700">
            <Info label="Email" value={profile.email || ""} />
            <Info label="Gender" value={profile.gender || ""} />
            <Info label="Date of Birth" value={profile.dob || ""} />
            <Info label="Current City" value={profile.currentCity || ""} />
            <Info label="Hometown" value={profile.hometown || ""} />
            <Info label="Workplace" value={profile.work || ""} />
            <Info label="Contact Info" value={profile.contact || ""} />
            <Info label="Education" value={profile.education || ""} />
          </div>
        )}

        {/* PUBLIC UID SECTION */}
        <div className="p-4 border rounded-xl bg-gray-50 mt-8">
          <UidInput
            currentUid={auth.currentUser!.uid}
            savedPublicUid={profile.publicUid}
            onUpdated={async (newUid) => {
              const ref = doc(db, "users", auth.currentUser!.uid);
              await updateDoc(ref, { publicUid: newUid });
              setProfile((prev: any) => ({ ...prev, publicUid: newUid }));
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: any) {
  return (
    <p>
      <span className="font-semibold">{label}: </span>
      {value || <span className="text-gray-400">Not provided</span>}
    </p>
  );
}

function Input({ label, name, value, onChange, textarea, type = "text" }: any) {
  return (
    <div>
      <label className="block font-semibold mb-1">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          value={value || ""}
          rows={3}
          onChange={onChange}
          className="w-full border rounded-lg p-2"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          className="w-full border rounded-lg p-2"
        />
      )}
    </div>
  );
}

