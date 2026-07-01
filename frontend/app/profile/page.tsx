'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { authAPI } from '@/lib/apiServices';
import { useAuthStore } from '@/store';

interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

const initialFormState = {
  street: '',
  city: '',
  state: '',
  country: '',
  zip: '',
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(initialFormState);
  const [profile, setProfile] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadAddresses = async () => {
      if (!user) {
        return;
      }

      setProfile({
        email: user.email || '',
        firstName: user.fullName?.firstName || '',
        lastName: user.fullName?.lastName || '',
      });

      try {
        const response = await authAPI.getAddresses();
        setAddresses(response.data?.data || []);
      } catch (err) {
        console.error('Failed to load addresses', err);
        setError('Unable to load saved addresses. Please try again.');
      }
    };

    loadAddresses();
  }, [user]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const missing = Object.entries(form).filter(([, value]) => !value.trim());
    if (missing.length > 0) {
      setError('Please complete all address fields.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await authAPI.addAddress(form);
      const newAddress: Address = response.data?.data || response.data;
      setAddresses((current) => [...current, newAddress]);
      setForm(initialFormState);
      setSuccess('Address added successfully.');
    } catch (err) {
      console.error('Failed to add address', err);
      setError('Unable to add address. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileChange = (field: 'email' | 'firstName' | 'lastName', value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await authAPI.updateProfile({
        email: profile.email,
        fullName: {
          firstName: profile.firstName,
          lastName: profile.lastName,
        },
      });

      const updatedUser = response.data?.user || response.data?.data || response.data;
      setUser(updatedUser);
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      console.error('Failed to update profile', err);
      setError(err.response?.data?.message || 'Unable to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-sm text-slate-400">Loading profile…</p>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-10 text-center shadow-xl">
          <h1 className="text-3xl font-semibold text-white">Sign in to view your profile</h1>
          <p className="max-w-md text-sm text-slate-400">
            You need to be logged in to see saved addresses and manage your profile.
          </p>
          <Link href="/login" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90">
            Go to login
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-white">My Profile</h1>
          <p className="mt-3 text-sm text-slate-300">Manage your account details and checkout preferences.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Name</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {user.fullName?.firstName || user.username || 'Account'} {user.fullName?.lastName || ''}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Email</p>
              <p className="mt-2 text-lg font-semibold text-white">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Saved Addresses</h2>
                <p className="mt-2 text-sm text-slate-400">Review addresses used for checkout.</p>
              </div>
            </div>

            {error ? <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
            {success ? <p className="mt-4 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</p> : null}

            <div className="mt-6 space-y-4">
              {addresses.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/80 p-6 text-slate-300">
                  <p className="text-sm">No saved addresses yet. Add one to complete checkout faster.</p>
                </div>
              ) : (
                addresses.map((address) => (
                  <div key={address._id} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                    <p className="font-semibold text-white">{address.street}</p>
                    <p className="mt-1 text-sm text-slate-400">{address.city}, {address.state}, {address.zip}</p>
                    <p className="text-sm text-slate-400">{address.country}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-white">Edit Profile</h2>
            <p className="mt-2 text-sm text-slate-400">Update your name and email address.</p>

            <form onSubmit={handleProfileSave} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-200">First name</span>
                <input
                  value={profile.firstName}
                  onChange={(event) => handleProfileChange('firstName', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-200">Last name</span>
                <input
                  value={profile.lastName}
                  onChange={(event) => handleProfileChange('lastName', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-200">Email</span>
                <input
                  value={profile.email}
                  onChange={(event) => handleProfileChange('email', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <button
                type="submit"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Update Profile
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Add New Address</h2>
                <p className="mt-2 text-sm text-slate-400">Add a delivery address for future orders.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {[
                { label: 'Street', name: 'street', type: 'text' },
                { label: 'City', name: 'city', type: 'text' },
                { label: 'State', name: 'state', type: 'text' },
                { label: 'Country', name: 'country', type: 'text' },
                { label: 'Zip code', name: 'zip', type: 'text' },
              ].map((field) => (
                <label key={field.name} className="block">
                  <span className="text-sm font-semibold text-slate-200">{field.label}</span>
                  <input
                    type={field.type}
                    value={form[field.name as keyof typeof form]}
                    onChange={(event) => handleChange(field.name as keyof typeof form, event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              ))}

              <button
                type="submit"
                disabled={submitting}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Save Address'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
