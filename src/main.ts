import {
  MarkdownView,
  Plugin,
  setIcon,
  TAbstractFile,
  TFile,
  WorkspaceLeaf
} from "obsidian";

import { getTodaysDailyNotePath, type MomentLike } from "./daily-note";

const STAR_TAB_CLASS = "daily-note-icon-tab";
const TAB_ICON_SELECTOR = ".workspace-tab-header-inner-icon";

export default class DailyNoteIcon extends Plugin {
  private dailyNotePath: string | null = null;
  private midnightTimer: number | null = null;

  onload(): void {
    this.app.workspace.onLayoutReady(() => {
      this.refreshDailyNote();

      this.registerEvent(
        this.app.workspace.on("layout-change", () => {
          this.refreshDailyNote();
        })
      );
      this.registerEvent(
        this.app.workspace.on("file-open", () => {
          this.refreshDailyNote();
        })
      );
      this.registerEvent(
        this.app.workspace.on("window-open", () => {
          this.updateTabStars();
        })
      );
      this.registerEvent(
        this.app.vault.on("create", (file) => {
          this.handleFileChange(file);
        })
      );
      this.registerEvent(
        this.app.vault.on("delete", (file) => {
          this.handleFileChange(file);
        })
      );
      this.registerEvent(
        this.app.vault.on("rename", (file) => {
          this.handleFileChange(file);
        })
      );

      this.scheduleMidnightRefresh();
    });

    this.register(() => {
      this.clearMidnightTimer();
      this.restoreTabIcons();
    });
  }

  private handleFileChange(file: TAbstractFile): void {
    if (file instanceof TFile || file.path === this.dailyNotePath) {
      this.refreshDailyNote();
    }
  }

  private refreshDailyNote(): void {
    this.dailyNotePath = getTodaysDailyNotePath(
      this.app,
      this.getCurrentMoment()
    );
    this.updateTabStars();
  }

  private updateTabStars(): void {
    this.app.workspace.iterateAllLeaves((leaf) => {
      const tabHeader = this.getTabHeader(leaf);
      const tabIcon = tabHeader?.querySelector<HTMLElement>(TAB_ICON_SELECTOR);
      if (!tabHeader || !tabIcon) {
        return;
      }

      const isDailyNote =
        leaf.view instanceof MarkdownView &&
        leaf.view.file?.path === this.dailyNotePath;

      if (isDailyNote && !tabHeader.hasClass(STAR_TAB_CLASS)) {
        setIcon(tabIcon, "star");
        tabHeader.addClass(STAR_TAB_CLASS);
      } else if (!isDailyNote && tabHeader.hasClass(STAR_TAB_CLASS)) {
        setIcon(tabIcon, leaf.getIcon());
        tabHeader.removeClass(STAR_TAB_CLASS);
      }
    });
  }

  private restoreTabIcons(): void {
    this.app.workspace.iterateAllLeaves((leaf) => {
      const tabHeader = this.getTabHeader(leaf);
      if (!tabHeader?.hasClass(STAR_TAB_CLASS)) {
        return;
      }

      const tabIcon = tabHeader.querySelector<HTMLElement>(TAB_ICON_SELECTOR);
      if (tabIcon) {
        setIcon(tabIcon, leaf.getIcon());
      }
      tabHeader.removeClass(STAR_TAB_CLASS);
    });
  }

  private getTabHeader(leaf: WorkspaceLeaf): HTMLElement | null {
    // There is no public API for changing the icon of a built-in Markdown tab.
    // Guard the runtime tab element so an Obsidian DOM change fails harmlessly.
    const candidate: unknown = (
      leaf as WorkspaceLeaf & { tabHeaderEl?: unknown }
    ).tabHeaderEl;
    if (!candidate || typeof candidate !== "object") {
      return null;
    }

    const candidateNode = candidate as Node;
    const ownerWindow = leaf.view.containerEl.ownerDocument.defaultView;
    if (
      !ownerWindow ||
      typeof candidateNode.instanceOf !== "function" ||
      !candidateNode.instanceOf(ownerWindow.HTMLElement)
    ) {
      return null;
    }

    return candidateNode;
  }

  private scheduleMidnightRefresh(): void {
    this.clearMidnightTimer();

    const now = this.getCurrentMoment();
    const nextMidnight = now.clone().add(1, "day").startOf("day");
    const delay = Math.max(1, nextMidnight.diff(now) + 1000);
    const ownerWindow = this.app.workspace.containerEl.ownerDocument.defaultView;
    if (!ownerWindow) {
      return;
    }

    this.midnightTimer = ownerWindow.setTimeout(() => {
      this.refreshDailyNote();
      this.scheduleMidnightRefresh();
    }, delay);
  }

  private clearMidnightTimer(): void {
    if (this.midnightTimer === null) {
      return;
    }

    const ownerWindow = this.app.workspace.containerEl.ownerDocument.defaultView;
    ownerWindow?.clearTimeout(this.midnightTimer);
    this.midnightTimer = null;
  }

  private getCurrentMoment(): MomentLike {
    const ownerWindow = this.app.workspace.containerEl.ownerDocument.defaultView;
    if (!ownerWindow) {
      throw new Error("Unable to access the workspace window.");
    }

    const createMoment = ownerWindow.moment as unknown as () => MomentLike;
    return createMoment();
  }
}
