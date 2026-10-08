import { useMemo, useState } from "react";
import {
  applyBulkHide,
  cloneLocations,
  countAllSubsites,
  countDownloadedSubsites,
  filterLocations,
  seedLocations,
  selectionKeyId,
  setLocationHidden,
  setSubsiteHidden,
  type DownloadTab,
  type Location,
  type VisibilityFilter,
} from "./data";
import {
  ActionBottomSheet,
  BulkBar,
  DownloadTabs,
  EmptyList,
  ListFab,
  LocationHeaderRow,
  LocationsTopBar,
  MoreButton,
  PhoneChrome,
  SubsiteRow,
  VisibilityFilterChip,
  type SheetItem,
} from "./LocationsShared";
import { IconClose } from "./icons";

type MenuState =
  | { kind: "location"; locationId: string }
  | { kind: "subsite"; locationId: string; subsiteId: string }
  | null;

/**
 * Interactive Locations list matching the Collect 2026 hide/unhide Figma flows:
 * - Unhidden is the default (no chip). Hidden / All Locations show a clearable chip.
 * - Edit (pencil) enters bulk hide/unhide selection
 * - Kebab opens a bottom sheet (Hide/Unhide + Get Directions)
 * - Same behavior on ALL and DOWNLOADED tabs
 */
export function LocationsPrototype() {
  const [locations, setLocations] = useState<Location[]>(() =>
    cloneLocations(seedLocations),
  );
  const [tab, setTab] = useState<DownloadTab>("all");
  /** Default is unhidden — no chip. Chip only for hidden / all. */
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [draftVisibility, setDraftVisibility] =
    useState<VisibilityFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [menu, setMenu] = useState<MenuState>(null);

  const filtered = useMemo(
    () => filterLocations(locations, tab, visibility),
    [locations, tab, visibility],
  );

  const allCount = countAllSubsites(locations);
  const downloadedCount = countDownloadedSubsites(locations);

  const toggleKey = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const enterSelect = () => {
    setSelecting(true);
    setSelected(new Set());
    setMenu(null);
  };

  const exitSelect = () => {
    setSelecting(false);
    setSelected(new Set());
  };

  const selectLocationGroup = (loc: Location) => {
    const locKey = selectionKeyId({ type: "location", locationId: loc.id });
    const subKeys = loc.subsites.map((s) =>
      selectionKeyId({
        type: "subsite",
        locationId: loc.id,
        subsiteId: s.id,
      }),
    );
    const allOn =
      selected.has(locKey) ||
      (subKeys.length > 0 && subKeys.every((k) => selected.has(k)));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOn) {
        next.delete(locKey);
        subKeys.forEach((k) => next.delete(k));
      } else {
        next.add(locKey);
        subKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  };

  const locationSelectionState = (loc: Location) => {
    const locKey = selectionKeyId({ type: "location", locationId: loc.id });
    const subKeys = loc.subsites.map((s) =>
      selectionKeyId({
        type: "subsite",
        locationId: loc.id,
        subsiteId: s.id,
      }),
    );
    if (selected.has(locKey)) return { checked: true, indeterminate: false };
    const selectedSubs = subKeys.filter((k) => selected.has(k)).length;
    if (selectedSubs === 0) return { checked: false, indeterminate: false };
    if (selectedSubs === subKeys.length)
      return { checked: true, indeterminate: false };
    return { checked: false, indeterminate: true };
  };

  const activeLocation =
    menu != null
      ? locations.find((l) => l.id === menu.locationId)
      : undefined;
  const activeSubsite =
    menu?.kind === "subsite" && activeLocation
      ? activeLocation.subsites.find((s) => s.id === menu.subsiteId)
      : undefined;

  const sheetItems: SheetItem[] = (() => {
    if (!menu || !activeLocation) return [];

    if (menu.kind === "location") {
      return [
        {
          label: activeLocation.hidden ? "Unhide Location" : "Hide Location",
          icon: activeLocation.hidden ? "unhide" : "hide",
          onClick: () =>
            setLocations((prev) =>
              setLocationHidden(
                prev,
                activeLocation.id,
                !activeLocation.hidden,
              ),
            ),
        },
      ];
    }

    if (menu.kind === "subsite" && activeSubsite) {
      const hidden = activeLocation.hidden || activeSubsite.hidden;
      const items: SheetItem[] = [];
      if (activeSubsite.downloaded) {
        items.push({
          label: "Get Directions",
          icon: "directions",
          onClick: () => {
            /* prototype: directions */
          },
        });
      }
      items.push({
        label: hidden ? "Unhide Location" : "Hide Location",
        icon: hidden ? "unhide" : "hide",
        onClick: () => {
          if (activeLocation.hidden) {
            setLocations((prev) =>
              setLocationHidden(prev, activeLocation.id, false),
            );
            return;
          }
          setLocations((prev) =>
            setSubsiteHidden(
              prev,
              activeLocation.id,
              activeSubsite.id,
              !activeSubsite.hidden,
            ),
          );
        },
      });
      return items;
    }

    return [];
  })();

  const emptyMessage =
    visibility === "hidden"
      ? "You do not have hidden locations"
      : "No locations match this view";

  return (
    <PhoneChrome
      title="Locations — Hide / Unhide"
      hint="Edit enters bulk mode. ⋮ opens the bottom sheet. Clear or change the visibility filter anytime — works on All and Downloaded."
    >
      <div className="app-screen loc-screen">
        <LocationsTopBar
          selecting={selecting}
          filterActive={visibility !== "unhidden"}
          showEditButton
          onSelectToggle={() => (selecting ? exitSelect() : enterSelect())}
          onFilter={() => {
            setDraftVisibility(visibility);
            setFilterOpen(true);
          }}
          onSettings={() => {
            setLocations(cloneLocations(seedLocations));
            setVisibility("all");
            exitSelect();
          }}
        />

        <DownloadTabs
          tab={tab}
          allCount={allCount}
          downloadedCount={downloadedCount}
          onTabChange={setTab}
        />

        <VisibilityFilterChip
          visibility={visibility}
          onClear={() => setVisibility("unhidden")}
        />

        <div className="list-scroll loc-list">
          {filtered.length === 0 ? (
            <EmptyList message={emptyMessage} />
          ) : (
            filtered.map((loc) => {
              const sel = locationSelectionState(loc);
              return (
                <section key={loc.id} className="loc-section">
                  <div className="loc-section-wrap">
                    <LocationHeaderRow
                      location={loc}
                      selecting={selecting}
                      checked={sel.checked}
                      indeterminate={sel.indeterminate}
                      onToggleSelect={() => selectLocationGroup(loc)}
                      menu={
                        selecting ? null : (
                          <MoreButton
                            onClick={() =>
                              setMenu({
                                kind: "location",
                                locationId: loc.id,
                              })
                            }
                          />
                        )
                      }
                    />
                  </div>
                  {loc.subsites.map((s) => {
                    const key = selectionKeyId({
                      type: "subsite",
                      locationId: loc.id,
                      subsiteId: s.id,
                    });
                    return (
                      <SubsiteRow
                        key={s.id}
                        location={loc}
                        subsite={s}
                        selecting={selecting}
                        checked={selected.has(key)}
                        onToggleSelect={() => toggleKey(key)}
                        onLongPress={enterSelect}
                        showHiddenLabel={false}
                        showDirections={false}
                        menu={
                          selecting ? null : (
                            <MoreButton
                              onClick={() =>
                                setMenu({
                                  kind: "subsite",
                                  locationId: loc.id,
                                  subsiteId: s.id,
                                })
                              }
                            />
                          )
                        }
                      />
                    );
                  })}
                </section>
              );
            })
          )}
        </div>

        {selecting ? (
          <BulkBar
            count={selected.size}
            onHide={() => {
              setLocations((prev) => applyBulkHide(prev, selected, true));
              exitSelect();
            }}
            onUnhide={() => {
              setLocations((prev) => applyBulkHide(prev, selected, false));
              exitSelect();
            }}
          />
        ) : (
          <ListFab />
        )}

        <ActionBottomSheet
          open={menu != null && sheetItems.length > 0}
          onClose={() => setMenu(null)}
          items={sheetItems}
        />

        {filterOpen ? (
          <div className="sheet-screen" role="dialog" aria-label="Filter">
            <header className="modal-bar">
              <button
                type="button"
                className="icon-btn dark"
                aria-label="Close"
                onClick={() => setFilterOpen(false)}
              >
                <IconClose />
              </button>
              <h2>Filter</h2>
              <button
                type="button"
                className="text-btn"
                onClick={() => setDraftVisibility("unhidden")}
              >
                Reset
              </button>
            </header>
            <div className="modal-body">
              <h3 className="sheet-section-title">Visibility</h3>
              {(
                [
                  ["unhidden", "Unhidden (default)"],
                  ["hidden", "Hidden"],
                  ["all", "All Locations"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className="radio-row"
                  onClick={() => setDraftVisibility(value)}
                  aria-pressed={draftVisibility === value}
                >
                  <span
                    className={
                      draftVisibility === value ? "radio checked" : "radio"
                    }
                  />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <footer className="modal-cta">
              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  setVisibility(draftVisibility);
                  setFilterOpen(false);
                }}
              >
                View Results
              </button>
            </footer>
          </div>
        ) : null}
      </div>
    </PhoneChrome>
  );
}

export function LocationsPrototypePage() {
  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Collect · COLLECT-1649</p>
        <h1>Hide &amp; Unhide Locations</h1>
        <p className="lede">
          Prototype of the Figma flows. Unhidden is the default (no chip). Use
          the filter icon for Hidden or All Locations — clear the chip anytime to
          return to Unhidden. The edit (pencil) icon enters bulk hide/unhide. The
          kebab menu opens the bottom sheet. Same on All and Downloaded tabs.
          Settings resets demo data.
        </p>
      </header>

      <div className="phones">
        <LocationsPrototype />
      </div>
    </div>
  );
}
