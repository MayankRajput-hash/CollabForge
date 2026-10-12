import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

function fromSupabaseProfile(profile) {
  return {
    id: profile.id,
    name: profile.name || '',
    email: profile.email || '',
    avatar: profile.avatar || '',
    university: profile.university || '',
    cohort: profile.cohort || '',
    niche: profile.niche || '',
    bio: profile.bio || '',
    skills: profile.skills || [],
    availability: profile.availability || '',
    github: profile.github || '',
    linkedin: profile.linkedin || '',
    rating: Number(profile.rating ?? 5),
    verified: Boolean(profile.verified),
    completedProjects: Number(profile.completed_projects ?? profile.completedProjects ?? 0)
  };
}

function toSupabaseProfile(profile) {
  return {
    name: profile.name,
    university: profile.university,
    cohort: profile.cohort,
    niche: profile.niche,
    bio: profile.bio,
    skills: profile.skills,
    availability: profile.availability,
    github: profile.github || null,
    linkedin: profile.linkedin || null,
    avatar: profile.avatar || null
  };
}

function profileFromAuthUser(authUser) {
  const metadata = authUser.user_metadata || {};
  return {
    id: authUser.id,
    email: authUser.email || '',
    name: metadata.name || authUser.email?.split('@')[0] || 'Student Member',
    university: metadata.university || '',
    cohort: metadata.cohort || '',
    niche: metadata.niche || '',
    bio: metadata.bio || '',
    skills: Array.isArray(metadata.skills) ? metadata.skills : [],
    availability: metadata.availability || '',
    avatar: metadata.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser.email || authUser.id)}`,
    rating: 5,
    verified: Boolean(authUser.email_confirmed_at),
    completedProjects: 0
  };
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const loadPublicProfiles = async () => {
    if (!isSupabaseConfigured || !supabase) return;

    const { data, error } = await supabase
      .from('public_profiles')
      .select('*')
      .order('name');

    if (error) throw error;
    setUsers((data || []).map(fromSupabaseProfile));
  };

  const syncSupabaseProfile = async (authUser) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) throw error;

    let profileData = data;
    if (!profileData) {
      const candidate = profileFromAuthUser(authUser);
      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .upsert({ id: candidate.id, email: candidate.email, ...toSupabaseProfile(candidate) })
        .select('*')
        .single();

      if (createError) throw createError;
      profileData = createdProfile;
    }

    const profile = fromSupabaseProfile(profileData);
    setCurrentUser(profile);
    setUsers(previous => [profile, ...previous.filter(user => user.id !== profile.id)]);
    return profile;
  };

  useEffect(() => {
    localStorage.removeItem('collabforge_current_user');
    localStorage.removeItem('collabforge_users');

    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!mounted) return;

        setSession(data.session);
        if (data.session?.user) {
          await syncSupabaseProfile(data.session.user);
        }
        await loadPublicProfiles();
      } catch (error) {
        console.error('Unable to initialize authentication:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);

      if (!nextSession) {
        setCurrentUser(null);
        return;
      }

      window.setTimeout(() => {
        if (!mounted) return;
        void syncSupabaseProfile(nextSession.user).catch(error => {
          console.error('Unable to load student profile:', error);
        });
        void loadPublicProfiles().catch(error => {
          console.error('Unable to load student directory:', error);
        });
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (userData) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, message: 'Authentication is unavailable until Supabase is configured.' };
    }

    const skills = Array.isArray(userData.skills)
      ? userData.skills
      : (userData.skills || '').split(',').map(skill => skill.trim()).filter(Boolean);

    const { data, error } = await supabase.auth.signUp({
      email: userData.email.trim(),
      password: userData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
        data: {
          name: userData.name.trim(),
          university: userData.university.trim(),
          cohort: userData.cohort.trim(),
          niche: userData.niche,
          bio: userData.bio || '',
          skills,
          availability: userData.availability
        }
      }
    });

    if (error) return { success: false, message: error.message };

    if (data.session && data.user) {
      try {
        await syncSupabaseProfile(data.user);
      } catch (profileError) {
        return { success: false, message: `Account created, but the profile could not be loaded: ${profileError.message}` };
      }
    }

    return { success: true, user: data.user, requiresEmailConfirmation: !data.session };
  };

  const login = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, message: 'Authentication is unavailable until Supabase is configured.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) return { success: false, message: error.message };

    try {
      const user = await syncSupabaseProfile(data.user);
      return { success: true, user };
    } catch (profileError) {
      return { success: false, message: `Signed in, but your profile could not be loaded: ${profileError.message}` };
    }
  };

  const signInWithOAuth = async (provider) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, message: 'Authentication is unavailable until Supabase is configured.' };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/profile` }
    });

    if (error) return { success: false, message: error.message };
    return { success: true, data };
  };

  const requestPasswordReset = async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, message: 'Authentication is unavailable until Supabase is configured.' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/update-password`
    });

    return error ? { success: false, message: error.message } : { success: true };
  };

  const updatePassword = async (password) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, message: 'Authentication is unavailable until Supabase is configured.' };
    }

    const { data, error } = await supabase.auth.updateUser({ password });
    return error ? { success: false, message: error.message } : { success: true, user: data.user };
  };

  const logout = async () => {
    if (!isSupabaseConfigured || !supabase) return { success: false };

    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, message: error.message };

    setSession(null);
    setCurrentUser(null);
    return { success: true };
  };

  const updateProfile = async (updatedData) => {
    if (!currentUser || !isSupabaseConfigured || !supabase) {
      throw new Error('Sign in with a configured Supabase account before editing your profile.');
    }

    const skills = Array.isArray(updatedData.skills)
      ? updatedData.skills
      : (updatedData.skills || '').split(',').map(skill => skill.trim()).filter(Boolean);
    const updatedProfile = { ...currentUser, ...updatedData, skills };

    const { data, error } = await supabase
      .from('profiles')
      .update(toSupabaseProfile(updatedProfile))
      .eq('id', currentUser.id)
      .select('*')
      .single();

    if (error) throw error;

    const profile = fromSupabaseProfile(data);
    setCurrentUser(profile);
    setUsers(previous => previous.map(user => user.id === profile.id ? profile : user));
    return profile;
  };

  return (
    <AuthContext.Provider value={{
      users,
      currentUser,
      session,
      loading,
      signUp,
      login,
      signInWithOAuth,
      requestPasswordReset,
      updatePassword,
      logout,
      updateProfile,
      isSupabaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}