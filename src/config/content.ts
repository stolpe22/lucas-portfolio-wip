import rawPtContent from "./content.json";
import rawEnContent from "./content.en.json";
import type { SiteContent } from "../types/content";

export type SupportedLanguage = "pt" | "en";

export const localizedContent: Record<SupportedLanguage, SiteContent> = {
	pt: rawPtContent as SiteContent,
	en: rawEnContent as SiteContent,
};
