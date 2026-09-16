import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/** Point the app's data dir at a fresh temp dir. Call before the first getDb(). */
export function pointDataDirAtTemp(prefix: string): string {
    const dir = mkdtempSync(path.join(tmpdir(), `ssv1-${prefix}-`));
    process.env.TONGFLOW_DATA_DIR = dir;
    return dir;
}
