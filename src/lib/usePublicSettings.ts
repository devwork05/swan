"use client";

import { useQuery } from "@tanstack/react-query";
import { api, qk } from "@/lib/api";
import { useTheme } from "next-themes";

/**
 * Shared hook for /settings (public platform settings). Every component that
 * renders brand assets (logo, name, favicon, contact) should read from here so
 * the whole app stays in sync when an admin updates settings.
 *
 * Returns sensible fallbacks while the query loads or on error so the UI never
 * renders empty.
 */

/**
 * Fallbacks used ONLY when a value hasn't loaded yet. Text values are empty
 * strings — components should render nothing rather than a "Swan Trade
 * Capital" placeholder that flashes and then swaps. The logo image is the
 * only exception since a totally invisible logo looks broken.
 */
export const FALLBACKS = {
  companyName: "",
  logo: "/assets/logo.png",
  favicon: "/assets/logo.png",
  contactEmail: "",
  contactPhone: "",
  whatsappNumber: "",
  address: "",
  cardPaymentAddress: "",
};

export function usePublicSettings() {
  const { data } = useQuery({
    queryKey: qk.publicSettings,
    queryFn: () => api.settings.public(),
    staleTime: 5 * 60_000,
  });

  return {
    ...data,
    companyName: data?.companyName || FALLBACKS.companyName,
    contactEmail: data?.contactEmail || FALLBACKS.contactEmail,
    contactPhone: data?.contactPhone || FALLBACKS.contactPhone,
    whatsappNumber: data?.whatsappNumber || FALLBACKS.whatsappNumber,
    address: data?.address || FALLBACKS.address,
    darkLogo: data?.siteDarkLogoUrl || FALLBACKS.logo,
    lightLogo: data?.siteLightLogoUrl || FALLBACKS.logo,
    favicon: data?.siteFaviconUrl || FALLBACKS.favicon,
    enableCardFeature: data?.enableCardFeature ?? false,
    virtualCardFee: data?.virtualCardFee ?? 0,
    physicalCardFee: data?.physicalCardFee ?? 0,
    cardPaymentAddress: data?.cardPaymentAddress || FALLBACKS.cardPaymentAddress,
  };
}

/**
 * Returns whichever of dark/light logo matches the currently active theme.
 * Convenient for headers/sidebars that just want "the logo".
 */
export function useBrandLogo() {
  const settings = usePublicSettings();
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? settings.darkLogo : settings.lightLogo;
}
