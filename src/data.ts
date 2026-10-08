export type VisibilityFilter = "unhidden" | "hidden" | "all";
export type DownloadTab = "all" | "downloaded";

export type Subsite = {
  id: string;
  name: string;
  downloaded: boolean;
  meta: string;
  syncLabel?: string;
  unsyncedAnswers?: number;
  crop: string;
  hidden: boolean;
};

export type Location = {
  id: string;
  name: string;
  hidden: boolean;
  subsites: Subsite[];
};

export function cloneLocations(source: Location[]): Location[] {
  return source.map((loc) => ({
    ...loc,
    subsites: loc.subsites.map((s) => ({ ...s })),
  }));
}

/** Seed data matching the Locations screenshot (with 1–2 pre-hidden for demos). */
export const seedLocations: Location[] = [
  {
    id: "loc-1",
    name: "Location 1",
    hidden: false,
    subsites: [
      {
        id: "ss-1-1",
        name: "Subsite Name 1",
        downloaded: false,
        meta: "6 activities, Corn",
        crop: "Corn",
        hidden: false,
      },
      {
        id: "ss-1-2",
        name: "Subsite Name 2",
        downloaded: false,
        meta: "4 activities, Soybean",
        crop: "Soybean",
        hidden: true,
      },
    ],
  },
  {
    id: "loc-2",
    name: "Location 2",
    hidden: false,
    subsites: [
      {
        id: "ss-2-1",
        name: "Subsite Name 1",
        downloaded: true,
        meta: "7 Activities, 5 Sets, 300 Plots, 450 Plants, 25 Acres, 10.1 Hectares, Corn",
        syncLabel: "Just now",
        unsyncedAnswers: 8,
        crop: "Corn",
        hidden: false,
      },
      {
        id: "ss-2-2",
        name: "Subsite Name 2",
        downloaded: true,
        meta: "7 Activities, 5 Sets, 300 Plots, 450 Plants, 25 Acres, 10.1 Hectares, Corn",
        syncLabel: "1 Week Ago",
        crop: "Corn",
        hidden: false,
      },
    ],
  },
  {
    id: "loc-3",
    name: "Location 3",
    hidden: true,
    subsites: [
      {
        id: "ss-3-1",
        name: "Subsite Name 1",
        downloaded: true,
        meta: "7 Activities, 5 Sets, 300 Plots, 450 Plants, 25 Acres, 10.1 Hectares, Corn",
        syncLabel: "2 Days Ago",
        crop: "Corn",
        hidden: false,
      },
      {
        id: "ss-3-2",
        name: "Subsite Name 2",
        downloaded: false,
        meta: "3 activities, Wheat",
        crop: "Wheat",
        hidden: false,
      },
      {
        id: "ss-3-3",
        name: "Subsite Name 3",
        downloaded: true,
        meta: "2 Activities, 1 Set, 40 Plots, Cotton",
        syncLabel: "Just now",
        crop: "Cotton",
        hidden: true,
      },
    ],
  },
];

export function isEffectivelyHidden(
  location: Location,
  subsite: Subsite,
): boolean {
  return location.hidden || subsite.hidden;
}

export function countSubsites(
  locations: Location[],
  tab: DownloadTab,
  visibility: VisibilityFilter,
): number {
  return filterLocations(locations, tab, visibility).reduce(
    (n, loc) => n + loc.subsites.length,
    0,
  );
}

export function countAllSubsites(locations: Location[]): number {
  return locations.reduce((n, loc) => n + loc.subsites.length, 0);
}

export function countDownloadedSubsites(locations: Location[]): number {
  return locations.reduce(
    (n, loc) => n + loc.subsites.filter((s) => s.downloaded).length,
    0,
  );
}

export function filterLocations(
  locations: Location[],
  tab: DownloadTab,
  visibility: VisibilityFilter,
): Location[] {
  return locations
    .map((loc) => {
      const subsites = loc.subsites.filter((s) => {
        if (tab === "downloaded" && !s.downloaded) return false;
        const hidden = isEffectivelyHidden(loc, s);
        if (visibility === "unhidden") return !hidden;
        if (visibility === "hidden") return hidden;
        return true;
      });
      return { ...loc, subsites };
    })
    .filter((loc) => loc.subsites.length > 0);
}

export function setLocationHidden(
  locations: Location[],
  locationId: string,
  hidden: boolean,
): Location[] {
  return locations.map((loc) =>
    loc.id === locationId ? { ...loc, hidden } : loc,
  );
}

export function setSubsiteHidden(
  locations: Location[],
  locationId: string,
  subsiteId: string,
  hidden: boolean,
): Location[] {
  return locations.map((loc) => {
    if (loc.id !== locationId) return loc;
    return {
      ...loc,
      subsites: loc.subsites.map((s) =>
        s.id === subsiteId ? { ...s, hidden } : s,
      ),
    };
  });
}

export type SelectionKey =
  | { type: "location"; locationId: string }
  | { type: "subsite"; locationId: string; subsiteId: string };

export function selectionKeyId(key: SelectionKey): string {
  return key.type === "location"
    ? `loc:${key.locationId}`
    : `sub:${key.locationId}:${key.subsiteId}`;
}

export function applyBulkHide(
  locations: Location[],
  selected: Set<string>,
  hide: boolean,
): Location[] {
  let next = locations;
  for (const loc of locations) {
    if (selected.has(selectionKeyId({ type: "location", locationId: loc.id }))) {
      next = setLocationHidden(next, loc.id, hide);
    }
    for (const s of loc.subsites) {
      if (
        selected.has(
          selectionKeyId({
            type: "subsite",
            locationId: loc.id,
            subsiteId: s.id,
          }),
        )
      ) {
        next = setSubsiteHidden(next, loc.id, s.id, hide);
      }
    }
  }
  return next;
}

export function visibilityLabel(v: VisibilityFilter): string {
  switch (v) {
    case "unhidden":
      return "Unhidden";
    case "hidden":
      return "Hidden";
    case "all":
      return "All Locations";
  }
}

/** Chip label shown under tabs for the active visibility filter. */
export function visibilityChipLabel(v: VisibilityFilter): string {
  return visibilityLabel(v);
}
