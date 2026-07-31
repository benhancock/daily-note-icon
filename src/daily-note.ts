import { App, normalizePath, TFile } from "obsidian";

const DEFAULT_DAILY_NOTE_FORMAT = "YYYY-MM-DD";

export interface MomentLike {
  add(value: number, unit: "day"): MomentLike;
  clone(): MomentLike;
  diff(other: MomentLike): number;
  format(pattern: string): string;
  startOf(unit: "day"): MomentLike;
}

interface InternalPluginManager {
  getPluginById(id: string): unknown;
}

interface AppWithInternalPlugins extends App {
  internalPlugins?: InternalPluginManager;
}

interface DailyNoteSettings {
  folder: string;
  format: string;
}

export function getTodaysDailyNotePath(
  app: App,
  today: MomentLike
): string | null {
  const settings = getDailyNoteSettings(app);
  if (!settings) {
    return null;
  }

  const filename = today.format(settings.format);
  const pathWithoutExtension = settings.folder
    ? `${settings.folder}/${filename}`
    : filename;
  const file = app.vault.getAbstractFileByPath(
    normalizePath(`${pathWithoutExtension}.md`)
  );

  return file instanceof TFile ? file.path : null;
}

function getDailyNoteSettings(app: App): DailyNoteSettings | null {
  const internalPlugins = (app as AppWithInternalPlugins).internalPlugins;
  if (!internalPlugins) {
    return null;
  }

  const dailyNotesPlugin = toRecord(
    internalPlugins.getPluginById("daily-notes")
  );
  const instance = toRecord(dailyNotesPlugin?.instance);
  const options = toRecord(instance?.options);
  if (!options) {
    return null;
  }

  const folder = typeof options.folder === "string" ? options.folder.trim() : "";
  const format =
    typeof options.format === "string" && options.format.trim()
      ? options.format
      : DEFAULT_DAILY_NOTE_FORMAT;

  return { folder, format };
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  return value as Record<string, unknown>;
}
