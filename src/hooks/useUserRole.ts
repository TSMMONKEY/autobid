import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = 'admin' | 'moderator' | 'user';

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    if (!user?.id) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching user roles:", error);
        setRoles([]);
      } else {
        setRoles((data || []).map((r: { role: AppRole }) => r.role));
      }
    } catch (err) {
      console.error("Error in fetchRoles:", err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      fetchRoles();
    }
  }, [authLoading, fetchRoles]);

  const hasRole = useCallback((role: AppRole): boolean => {
    return roles.includes(role);
  }, [roles]);

  const isAdmin = roles.includes('admin');
  const isModerator = roles.includes('moderator') || isAdmin;

  return {
    roles,
    loading: authLoading || loading,
    hasRole,
    isAdmin,
    isModerator,
    refetch: fetchRoles,
  };
};