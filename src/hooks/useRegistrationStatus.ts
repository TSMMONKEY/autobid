import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface RegistrationStatus {
  id: string;
  user_id: string;
  identification_complete: boolean;
  address_complete: boolean;
  contact_complete: boolean;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  deposit_paid: boolean;
  deposit_amount: number;
  created_at: string;
  updated_at: string;
}

export const useRegistrationStatus = () => {
  const { user, loading: authLoading } = useAuth();
  const [registration, setRegistration] = useState<RegistrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRegistration = useCallback(async () => {
    if (!user?.id) {
      setRegistration(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_registration")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // If no record exists, create one
        if (error.code === "PGRST116") {
          const { data: newData, error: insertError } = await supabase
            .from("user_registration")
            .insert({ user_id: user.id })
            .select()
            .single();

          if (insertError) {
            console.error("Error creating registration:", insertError);
            setRegistration(null);
          } else {
            setRegistration(newData as RegistrationStatus);
          }
        } else {
          console.error("Error fetching registration:", error);
          setRegistration(null);
        }
      } else {
        setRegistration(data as RegistrationStatus);
      }
    } catch (err) {
      console.error("Error in fetchRegistration:", err);
      setRegistration(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      fetchRegistration();
    }
  }, [authLoading, fetchRegistration]);

  const isComplete = registration
    ? registration.identification_complete &&
      registration.address_complete &&
      registration.contact_complete &&
      registration.terms_accepted &&
      registration.privacy_accepted &&
      registration.deposit_paid
    : false;

  const canBid = registration?.deposit_paid ?? false;

  const completionItems = registration
    ? [
        { key: "identification", label: "Complete Identification", complete: registration.identification_complete },
        { key: "address", label: "Complete Physical Address", complete: registration.address_complete },
        { key: "contact", label: "Complete Contact Details", complete: registration.contact_complete },
        { key: "terms", label: "Accept Terms and Conditions", complete: registration.terms_accepted },
        { key: "privacy", label: "Accept Privacy Policy", complete: registration.privacy_accepted },
        { key: "deposit", label: "R5,000 Deposit Required", complete: registration.deposit_paid },
      ]
    : [];

  const incompleteItems = completionItems.filter((item) => !item.complete);

  return {
    registration,
    loading: authLoading || loading,
    isComplete,
    canBid,
    completionItems,
    incompleteItems,
    refetch: fetchRegistration,
  };
};
