import type {
  AskingItem,
  OfferingItem,
  OrgProfile,
} from "@/app/components/org/types";
import type { ListingDoc, OrgDoc } from "./types";

export function listingToAskingItem(listing: ListingDoc): AskingItem {
  return {
    id: listing.id,
    name: listing.name,
    category: listing.category,
    urgency: listing.urgency ?? "medium",
    quantity: listing.quantity,
    image: listing.imageUrl ?? "",
  };
}

export function listingToOfferingItem(listing: ListingDoc): OfferingItem {
  return {
    id: listing.id,
    name: listing.name,
    category: listing.category,
    expiration: listing.expiration || undefined,
    quantity: listing.quantity,
    image: listing.imageUrl ?? "",
  };
}

export function orgDocToProfile(
  org: OrgDoc,
  askingItems: AskingItem[],
  offeringItems: OfferingItem[]
): OrgProfile {
  return {
    id: org.id,
    name: org.name,
    bio: org.bio,
    phoneNumber: org.phoneNumber,
    address: org.address,
    location: org.location,
    bannerImage: org.bannerImageUrl,
    avatarImage: "",
    askingItems,
    offeringItems,
  };
}