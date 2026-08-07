import type { TaskStatusSortFn } from '../types.js';
export type { TaskStatusSortFn };
export declare const TASK_STATUS_SORT_KEY: unique symbol;
/**
 * Reactive holder provided once by the host. Plugins write through
 * `registerTaskStatusSort`; ComboboxStatus reads `.value` in a computed so
 * HMR updates apply without remounting.
 */
export declare const taskStatusSortFn: import("vue").ShallowRef<TaskStatusSortFn | null, TaskStatusSortFn | null>;
export declare const registerTaskStatusSort: (pluginId: string, fn: TaskStatusSortFn) => void;
export declare const unregisterTaskStatusSort: (pluginId: string) => void;
//# sourceMappingURL=task-status-sort.d.ts.map