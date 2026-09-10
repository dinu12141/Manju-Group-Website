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
  // Google Map Location configuration
  mapLatitude?: string;
  mapLongitude?: string;
  mapZoom?: number | string;
  mapEmbedUrl?: string;
  directionsUrl?: string;
  locationTitle?: string;
  locationCity?: string;
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
  address: "No. 234, Galle Road, Kollupitiya, Colombo 03, Sri Lanka",
  facebookUrl: "https://www.facebook.com/ManjuEnterprisesLK",
  mapLatitude: "6.9034",
  mapLongitude: "79.8524",
  mapZoom: 15,
  mapEmbedUrl: "",
  directionsUrl: "",
  locationTitle: "Corporate Headquarters",
  locationCity: "Colombo 03",
};

/**
 * Parses user input for coordinates like "6.9034, 79.8524" or google maps URLs containing "@6.9034,79.8524" or "?q=6.9034,79.8524"
 */
export function parseCoordinatesInput(
  input: string
): { latitude: string; longitude: string } | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Pattern 1: URL with @latitude,longitude (e.g., google.com/maps/place/.../@6.9034,79.8524,15z)
  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { latitude: atMatch[1], longitude: atMatch[2] };
  }

  // Pattern 2: URL or string with q=lat,lng
  const qMatch = trimmed.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return { latitude: qMatch[1], longitude: qMatch[2] };
  }

  // Pattern 3: destination=lat,lng
  const destMatch = trimmed.match(/[?&]destination=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (destMatch) {
    return { latitude: destMatch[1], longitude: destMatch[2] };
  }

  // Pattern 4: Raw "lat, lng" e.g. "6.9034, 79.8524" or "6.9034,79.8524"
  const rawMatch = trimmed.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
  if (rawMatch) {
    return { latitude: rawMatch[1], longitude: rawMatch[2] };
  }

  return null;
}

/**
 * Extracts iframe src or formats Google Maps URL for embedding
 */
export function extractEmbedUrl(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  // 1. If user pasted an iframe tag
  const iframeMatch = trimmed.match(/<iframe\s+[^>]*?src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1];
  }
  // 2. If it's already an embed link (google.com/maps/embed or maps?output=embed)
  if (trimmed.includes("/maps/embed") || trimmed.includes("output=embed")) {
    return trimmed;
  }
  // 3. If it's a standard Google Maps link with coordinates or query
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const coords = parseCoordinatesInput(trimmed);
    if (coords) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(coords.latitude)},${encodeURIComponent(coords.longitude)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    if (
      trimmed.includes("google.com/maps") ||
      trimmed.includes("maps.google.com")
    ) {
      const sep = trimmed.includes("?") ? "&" : "?";
      return `${trimmed}${sep}output=embed`;
    }
    return trimmed;
  }
  return "";
}

/**
 * Computes the iframe src for the embedded Google Map
 */
export function getMapEmbedUrl(
  contacts?: Partial<SiteContacts> | null
): string {
  if (!contacts) {
    return "https://maps.google.com/maps?q=6.9034,79.8524&t=&z=15&ie=UTF8&iwloc=&output=embed";
  }

  // 1. Explicit Embed URL or iframe code
  if (contacts.mapEmbedUrl && contacts.mapEmbedUrl.trim()) {
    const extracted = extractEmbedUrl(contacts.mapEmbedUrl);
    if (extracted) return extracted;
  }

  // 2. Latitude and Longitude
  const lat = contacts.mapLatitude?.trim();
  const lng = contacts.mapLongitude?.trim();
  const zoom = contacts.mapZoom || 15;
  if (lat && lng) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
  }

  // 3. Address
  if (contacts.address && contacts.address.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(contacts.address.trim())}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
  }

  // 4. Default fallback
  return "https://maps.google.com/maps?q=6.9034,79.8524&t=&z=15&ie=UTF8&iwloc=&output=embed";
}

/**
 * Computes the direct live navigation / directions link
 */
export function getDirectionsUrl(
  contacts?: Partial<SiteContacts> | null
): string {
  if (!contacts) {
    return "https://www.google.com/maps/dir/?api=1&destination=6.9034,79.8524&travelmode=driving";
  }

  if (contacts.directionsUrl && contacts.directionsUrl.trim()) {
    return contacts.directionsUrl.trim();
  }

  const lat = contacts.mapLatitude?.trim();
  const lng = contacts.mapLongitude?.trim();
  if (lat && lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&travelmode=driving`;
  }

  if (contacts.address && contacts.address.trim()) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contacts.address.trim())}&travelmode=driving`;
  }

  return "https://www.google.com/maps/dir/?api=1&destination=6.9034,79.8524&travelmode=driving";
}

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
  const ext =
    rawExt.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() ||
    (isVideo ? "mp4" : "webp");
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

    xhr.upload.onprogress = e => {
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
          reject(
            new Error(res.error || `Upload failed with status ${xhr.status}`)
          );
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
