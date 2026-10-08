import {
  useRef,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { Location, Subsite, DownloadTab, VisibilityFilter } from "./data";
import { isEffectivelyHidden, visibilityChipLabel } from "./data";
import {
  IconCheck,
  IconCheckCircle,
  IconClose,
  IconDirections,
  IconDownload,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconFilter,
  IconList,
  IconMap,
  IconMinus,
  IconMore,
  IconNav,
  IconSearch,
  IconSettings,
  IconSync,
  IconWarning,
} from "./icons";

export function PhoneChrome({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="phone-wrap">
      <header className="phone-meta">
        <h2>{title}</h2>
        <p>{hint}</p>
      </header>
      <div className="phone">
        <div className="phone-notch" />
        <div className="phone-screen">{children}</div>
      </div>
    </section>
  );
}

export function Checkbox({
  checked,
  indeterminate,
}: {
  checked: boolean;
  indeterminate?: boolean;
}) {
  const state = indeterminate
    ? "checkbox indeterminate"
    : checked
      ? "checkbox checked"
      : "checkbox";
  return (
    <span className={state} aria-hidden="true">
      {indeterminate ? <IconMinus /> : checked ? <IconCheck /> : null}
    </span>
  );
}

export function LocationsTopBar({
  selecting,
  filterActive,
  onFilter,
  onSelectToggle,
  showEditButton = true,
  onSettings,
  rightSlot,
}: {
  selecting?: boolean;
  filterActive?: boolean;
  onFilter?: () => void;
  onSelectToggle?: () => void;
  showEditButton?: boolean;
  onSettings?: () => void;
  rightSlot?: ReactNode;
}) {
  return (
    <header className="loc-top-bar">
      <h1>Locations</h1>
      <div className="loc-top-actions">
        {selecting ? (
          <button
            type="button"
            className="text-btn light"
            onClick={onSelectToggle}
          >
            Cancel
          </button>
        ) : (
          <>
            <button type="button" className="icon-btn" aria-label="Search">
              <IconSearch />
            </button>
            {showEditButton ? (
              <button
                type="button"
                className="icon-btn"
                aria-label="Edit"
                onClick={onSelectToggle}
              >
                <IconEdit />
              </button>
            ) : null}
            <button
              type="button"
              className={filterActive ? "icon-btn has-badge" : "icon-btn"}
              aria-label="Filter"
              onClick={onFilter}
            >
              <IconFilter />
              {filterActive ? (
                <span className="filter-badge" aria-hidden="true">
                  1
                </span>
              ) : null}
            </button>
            {rightSlot}
            <button
              type="button"
              className="icon-btn"
              aria-label="Settings"
              onClick={onSettings}
            >
              <IconSettings />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export function DownloadTabs({
  tab,
  allCount,
  downloadedCount,
  onTabChange,
}: {
  tab: DownloadTab;
  allCount: number;
  downloadedCount: number;
  onTabChange: (tab: DownloadTab) => void;
}) {
  return (
    <div className="loc-tabs" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={tab === "all"}
        className={tab === "all" ? "loc-tab active" : "loc-tab"}
        onClick={() => onTabChange("all")}
      >
        ALL ({allCount})
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={tab === "downloaded"}
        className={tab === "downloaded" ? "loc-tab active" : "loc-tab"}
        onClick={() => onTabChange("downloaded")}
      >
        DOWNLOADED ({downloadedCount})
      </button>
    </div>
  );
}

export function VisibilityFilterChip({
  visibility,
  onClear,
}: {
  visibility: VisibilityFilter;
  onClear: () => void;
}) {
  /** Unhidden is the default — no chip. */
  if (visibility === "unhidden") return null;
  const label = visibilityChipLabel(visibility);
  return (
    <div className="chip-row" aria-label="Active filters">
      <button
        type="button"
        className="filter-chip"
        onClick={onClear}
        aria-label={`Clear filter: ${label}`}
      >
        <span>{label}</span>
        <IconClose />
      </button>
    </div>
  );
}

export function VisibilitySegment({
  value,
  onChange,
}: {
  value: VisibilityFilter;
  onChange: (v: VisibilityFilter) => void;
}) {
  const options: VisibilityFilter[] = ["unhidden", "hidden", "all"];
  return (
    <div className="visibility-segment" role="group" aria-label="Visibility">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={
            value === opt ? "vis-seg-btn active" : "vis-seg-btn"
          }
          onClick={() => onChange(opt)}
        >
          {opt === "unhidden" ? "Unhidden" : opt === "hidden" ? "Hidden" : "All"}
        </button>
      ))}
    </div>
  );
}

export function ListFab() {
  return (
    <div className="list-fab" aria-hidden="true">
      <button type="button" className="fab-btn active" aria-label="List view">
        <IconList />
      </button>
      <button type="button" className="fab-btn" aria-label="Map view">
        <IconMap />
      </button>
    </div>
  );
}

export function LocationHeaderRow({
  location,
  selecting,
  checked,
  indeterminate,
  onToggleSelect,
  menu,
  swipeActions,
}: {
  location: Location;
  selecting?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
  onToggleSelect?: () => void;
  menu?: ReactNode;
  swipeActions?: ReactNode;
}) {
  const content = (
    <div
      className={
        location.hidden
          ? "loc-section-header is-hidden"
          : "loc-section-header"
      }
    >
      {selecting ? (
        <button
          type="button"
          className="select-hit"
          onClick={onToggleSelect}
          aria-pressed={checked}
        >
          <Checkbox checked={!!checked} indeterminate={indeterminate} />
        </button>
      ) : null}
      <span className="loc-section-title">{location.name}</span>
      {location.hidden ? (
        <span className="hidden-inline" title="Location hidden">
          <IconEyeOff />
        </span>
      ) : null}
      {menu}
    </div>
  );

  if (swipeActions) {
    return (
      <SwipeReveal actions={swipeActions} className="swipe-header">
        {content}
      </SwipeReveal>
    );
  }
  return content;
}

export function SubsiteRow({
  location,
  subsite,
  selecting,
  checked,
  onToggleSelect,
  onLongPress,
  menu,
  trailing,
  swipeActions,
  showHiddenLabel,
  showDirections = true,
}: {
  location: Location;
  subsite: Subsite;
  selecting?: boolean;
  checked?: boolean;
  onToggleSelect?: () => void;
  onLongPress?: () => void;
  menu?: ReactNode;
  trailing?: ReactNode;
  swipeActions?: ReactNode;
  showHiddenLabel?: boolean;
  showDirections?: boolean;
}) {
  const effectivelyHidden = isEffectivelyHidden(location, subsite);
  const longPressTimer = useRef<number | null>(null);

  const clearLongPress = () => {
    if (longPressTimer.current != null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const startLongPress = () => {
    if (!onLongPress || selecting) return;
    clearLongPress();
    longPressTimer.current = window.setTimeout(() => {
      onLongPress();
      longPressTimer.current = null;
    }, 450);
  };

  const row = (
    <article
      className={
        effectivelyHidden ? "subsite-row is-hidden" : "subsite-row"
      }
      onPointerDown={startLongPress}
      onPointerUp={clearLongPress}
      onPointerLeave={clearLongPress}
      onPointerCancel={clearLongPress}
    >
      {selecting ? (
        <button
          type="button"
          className="select-hit"
          onClick={onToggleSelect}
          aria-pressed={checked}
        >
          <Checkbox checked={!!checked} />
        </button>
      ) : null}

      <div className="subsite-body">
        <div className="subsite-title-row">
          <h3>{subsite.name}</h3>
          {effectivelyHidden ? (
            <span className="hidden-inline" title="Hidden">
              <IconEyeOff />
              {showHiddenLabel ? <span className="hidden-text">Hidden</span> : null}
            </span>
          ) : null}
        </div>
        <p className="subsite-meta">{subsite.meta}</p>
        {subsite.downloaded ? (
          <div className="subsite-status">
            {subsite.syncLabel ? (
              <span className="status-ok">
                <IconCheckCircle />
                {subsite.syncLabel}
              </span>
            ) : null}
            {subsite.unsyncedAnswers ? (
              <span className="status-warn">
                <IconWarning />
                {subsite.unsyncedAnswers} Unsynced Answers
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {!selecting && !menu ? (
        trailing ?? (
          <div className="subsite-actions">
            {subsite.downloaded ? (
              <>
                <button type="button" className="icon-btn dark" aria-label="Sync">
                  <IconSync />
                </button>
                {showDirections ? (
                  <button
                    type="button"
                    className="icon-btn dark"
                    aria-label="Directions"
                  >
                    <IconNav />
                  </button>
                ) : null}
              </>
            ) : (
              <button
                type="button"
                className="icon-btn dark"
                aria-label="Download"
              >
                <IconDownload />
              </button>
            )}
          </div>
        )
      ) : null}
      {!selecting && menu ? (
        <div className="subsite-actions with-menu">
          {subsite.downloaded ? (
            <>
              <button type="button" className="icon-btn dark" aria-label="Sync">
                <IconSync />
              </button>
              {showDirections ? (
                <button
                  type="button"
                  className="icon-btn dark"
                  aria-label="Directions"
                >
                  <IconNav />
                </button>
              ) : null}
            </>
          ) : (
            <button
              type="button"
              className="icon-btn dark"
              aria-label="Download"
            >
              <IconDownload />
            </button>
          )}
          {menu}
        </div>
      ) : null}
    </article>
  );

  if (swipeActions) {
    return (
      <SwipeReveal actions={swipeActions} className="swipe-row">
        {row}
      </SwipeReveal>
    );
  }
  return row;
}

export function SwipeReveal({
  children,
  actions,
  className,
}: {
  children: ReactNode;
  actions: ReactNode;
  className?: string;
}) {
  const startX = useRef(0);
  const baseOffset = useRef(0);
  const current = useRef(0);
  const dragging = useRef(false);
  const elRef = useRef<HTMLDivElement>(null);
  const openWidth = 96;

  const setOffset = (x: number) => {
    current.current = x;
    if (elRef.current) {
      elRef.current.style.transform = `translateX(${x}px)`;
    }
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    dragging.current = true;
    startX.current = e.clientX;
    baseOffset.current = current.current;
    elRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragging.current) return;
    const fromStart = e.clientX - startX.current + baseOffset.current;
    setOffset(Math.min(0, Math.max(-openWidth, fromStart)));
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (elRef.current?.hasPointerCapture(e.pointerId)) {
      elRef.current.releasePointerCapture(e.pointerId);
    }
    setOffset(current.current < -openWidth / 2 ? -openWidth : 0);
  };

  return (
    <div className={className ? `swipe-shell ${className}` : "swipe-shell"}>
      <div className="swipe-actions">{actions}</div>
      <div
        ref={elRef}
        className="swipe-front"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {children}
      </div>
    </div>
  );
}

export function BulkBar({
  count,
  onHide,
  onUnhide,
  onCancel,
}: {
  count: number;
  onHide: () => void;
  onUnhide: () => void;
  onCancel?: () => void;
}) {
  return (
    <footer className="bulk-bar">
      <span className="bulk-count">
        {count} Selected
      </span>
      <div className="bulk-actions">
        {onCancel ? (
          <button type="button" className="text-btn" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button
          type="button"
          className="bulk-btn primary"
          disabled={count === 0}
          onClick={onHide}
        >
          HIDE
        </button>
        <button
          type="button"
          className="bulk-btn primary"
          disabled={count === 0}
          onClick={onUnhide}
        >
          UNHIDE
        </button>
      </div>
    </footer>
  );
}

export function EmptyList({ message }: { message: string }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
    </div>
  );
}

export function OverflowMenu({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: { label: string; onClick: () => void }[];
}) {
  if (!open) return null;
  return (
    <>
      <button
        type="button"
        className="menu-backdrop"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="overflow-menu" role="menu">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className="overflow-item"
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

export type SheetItem = {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  icon?: "directions" | "hide" | "unhide" | "eye";
};

function SheetItemIcon({ icon }: { icon?: SheetItem["icon"] }) {
  if (icon === "directions") return <IconDirections />;
  if (icon === "hide" || icon === "eye") return <IconEye />;
  if (icon === "unhide") return <IconEye />;
  return null;
}

export function ActionBottomSheet({
  open,
  title,
  onClose,
  items,
  showCancel = false,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  items: SheetItem[];
  showCancel?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="bottom-sheet-root" role="presentation">
      <button
        type="button"
        className="bottom-sheet-backdrop"
        aria-label="Dismiss"
        onClick={onClose}
      />
      <div
        className="bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Actions"}
      >
        <div className="bottom-sheet-handle" aria-hidden="true" />
        {title ? <h2 className="bottom-sheet-title">{title}</h2> : null}
        <ul className="bottom-sheet-list">
          {items.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                className={
                  item.destructive
                    ? "bottom-sheet-item destructive"
                    : "bottom-sheet-item"
                }
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
              >
                {item.icon ? (
                  <span className="bottom-sheet-icon" aria-hidden="true">
                    <SheetItemIcon icon={item.icon} />
                  </span>
                ) : null}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        {showCancel ? (
          <button
            type="button"
            className="bottom-sheet-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function MoreButton({
  onClick,
  label = "More",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      className="icon-btn dark"
      aria-label={label}
      onClick={onClick}
    >
      <IconMore />
    </button>
  );
}
