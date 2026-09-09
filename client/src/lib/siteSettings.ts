import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";

export interface SiteContacts {
  hotline: string;
  supportPhone: string;
  whatsappNumber: string;
  whatsappMessage: string;
  email: string;
  openingHours: string;
  address: string;
  facebookUrl: string;
}

export interface SiteBankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  swiftCode?: string;
  instructions: string;
}

export const DEFAULT_CONTACTS: SiteContacts = {
  hotline: "+94 11 234 5678",
  supportPhone: "+94 77 123 4567",
  whatsappNumber: "+94 77 123 4567",
  whatsappMessage:
    "Hello Manju Group, I would like to inquire about your products.",
  email: "info@manjugroup.lk",
  openingHours: "Mon–Fri: 8:30 AM – 6:00 PM, Sat: 9:00 AM – 4:00 PM",
  address:
    "Manju Group Corporate HQ, No. 123, Galle Road, Colombo 03, Sri Lanka",
  facebookUrl: "https://www.facebook.com/ManjuEnterprisesLK",
};

export const DEFAULT_BANK_DETAILS: SiteBankDetails = {
  bankName: "Commercial Bank of Ceylon",
  accountName: "Manju Group (Pvt) Ltd",
  accountNumber: "1234 5678 9012",
  branch: "Colombo Main Branch",
  swiftCode: "CCEYLKFX",
  instructions:
    "Please use your Order Number (e.g., ORD-XXXXX) as the bank transfer reference. After payment, send your deposit slip or screenshot via WhatsApp with your Order Number for instant confirmation.",
};

const CONTACTS_CACHE_KEY = "manju_site_contacts_cache";
const BANK_CACHE_KEY = "manju_site_bank_cache";

function getCachedContacts(): SiteContacts {
  if (typeof window === "undefined") return DEFAULT_CONTACTS;
  try {
    const raw = localStorage.getItem(CONTACTS_CACHE_KEY);
    if (!raw) return DEFAULT_CONTACTS;
    return { ...DEFAULT_CONTACTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONTACTS;
  }
}

function getCachedBankDetails(): SiteBankDetails {
  if (typeof window === "undefined") return DEFAULT_BANK_DETAILS;
  try {
    const raw = localStorage.getItem(BANK_CACHE_KEY);
    if (!raw) return DEFAULT_BANK_DETAILS;
    return { ...DEFAULT_BANK_DETAILS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_BANK_DETAILS;
  }
}

// ── Hook for Site Contacts ───────────────────────────────────────────────────
export function useSiteContacts() {
  const [contacts, setContacts] = useState<SiteContacts>(getCachedContacts);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.getSiteSetting.useQuery({
    key: "site_contacts",
  });

  const setSettingMutation = trpc.admin.setSiteSetting.useMutation({
    onSuccess: () => {
      utils.admin.getSiteSetting.invalidate({ key: "site_contacts" });
    },
  });

  useEffect(() => {
    if (data?.value) {
      const merged: SiteContacts = {
        ...DEFAULT_CONTACTS,
        ...(data.value as Partial<SiteContacts>),
      };
      setContacts(merged);
      try {
        localStorage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(merged));
      } catch {
        // ignore
      }
    }
  }, [data]);

  const updateContacts = (newContacts: SiteContacts) => {
    setContacts(newContacts);
    try {
      localStorage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(newContacts));
    } catch {
      // ignore
    }
    return setSettingMutation.mutateAsync({
      key: "site_contacts",
      value: newContacts,
    });
  };

  const resetContacts = () => {
    setContacts(DEFAULT_CONTACTS);
    try {
      localStorage.setItem(
        CONTACTS_CACHE_KEY,
        JSON.stringify(DEFAULT_CONTACTS)
      );
    } catch {
      // ignore
    }
    return setSettingMutation.mutateAsync({
      key: "site_contacts",
      value: DEFAULT_CONTACTS,
    });
  };

  return {
    contacts,
    updateContacts,
    resetContacts,
    isLoading,
    isSaving: setSettingMutation.isPending,
  };
}

// ── Hook for Bank Transfer Details ───────────────────────────────────────────
export function useSiteBankDetails() {
  const [bankDetails, setBankDetails] =
    useState<SiteBankDetails>(getCachedBankDetails);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.getSiteSetting.useQuery({
    key: "site_bank_details",
  });

  const setSettingMutation = trpc.admin.setSiteSetting.useMutation({
    onSuccess: () => {
      utils.admin.getSiteSetting.invalidate({ key: "site_bank_details" });
    },
  });

  useEffect(() => {
    if (data?.value) {
      const merged: SiteBankDetails = {
        ...DEFAULT_BANK_DETAILS,
        ...(data.value as Partial<SiteBankDetails>),
      };
      setBankDetails(merged);
      try {
        localStorage.setItem(BANK_CACHE_KEY, JSON.stringify(merged));
      } catch {
        // ignore
      }
    }
  }, [data]);

  const updateBankDetails = (newBank: SiteBankDetails) => {
    setBankDetails(newBank);
    try {
      localStorage.setItem(BANK_CACHE_KEY, JSON.stringify(newBank));
    } catch {
      // ignore
    }
    return setSettingMutation.mutateAsync({
      key: "site_bank_details",
      value: newBank,
    });
  };

  const resetBankDetails = () => {
    setBankDetails(DEFAULT_BANK_DETAILS);
    try {
      localStorage.setItem(
        BANK_CACHE_KEY,
        JSON.stringify(DEFAULT_BANK_DETAILS)
      );
    } catch {
      // ignore
    }
    return setSettingMutation.mutateAsync({
      key: "site_bank_details",
      value: DEFAULT_BANK_DETAILS,
    });
  };

  return {
    bankDetails,
    updateBankDetails,
    resetBankDetails,
    isLoading,
    isSaving: setSettingMutation.isPending,
  };
}

// ── Helper to upload media directly with admin token & progress ──────────────
export async function uploadAdminMedia(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{
  url: string;
  filename: string;
  size: number;
  isVideo: boolean;
}> {
  const isVideo = file.type.startsWith("video/");
  const rawExt = file.name.split(".").pop() || (isVideo ? "mp4" : "webp");
  const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || (isVideo ? "mp4" : "webp");
  const prefix = isVideo ? "ad_video" : "ad_img";
  const uniqueId = Math.random().toString(36).substring(2, 10);
  const cleanName = `${prefix}_${Date.now()}_${uniqueId}.${ext}`;

  // 1. Direct Cloud Upload to Supabase Storage (Safe for 50MB videos & photos, no Vercel payload limits)
  try {
    if (onProgress) onProgress(15);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(cleanName, file, {
        contentType: file.type || (isVideo ? "video/mp4" : "image/webp"),
        upsert: true,
      });

    if (!uploadError && uploadData) {
      if (onProgress) onProgress(100);
      const { data: publicUrlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(cleanName);

      return {
        url: publicUrlData.publicUrl,
        filename: cleanName,
        size: file.size,
        isVideo,
      };
    }
  } catch (supabaseErr) {
    console.warn("[MediaUpload] Supabase direct upload fallback:", supabaseErr);
  }

  // 2. Fallback to server endpoint
  return new Promise((resolve, reject) => {
    const adminToken = localStorage.getItem("manju_admin_token") || "";

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload", true);

    if (adminToken) {
      xhr.setRequestHeader("X-Admin-Token", adminToken);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.success) {
          resolve(res);
        } else {
          reject(new Error(res.error || `Upload failed with status ${xhr.status}`));
        }
      } catch {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error occurred during file upload"));
    };

    xhr.send(formData);
  });
}
