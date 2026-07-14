export type CommentaryMeta = {
  kind?: string;
  sfx?: string | null;
  priority?: number;
};

export type CommentaryHooks = {
  onShow?: (msg: string, meta?: CommentaryMeta) => void;
};

export type CommentaryHandle = {
  clear: () => void;
  say: (
    msg: string,
    opts?: { priority?: number; hold?: number; meta?: CommentaryMeta },
  ) => void;
};

type QueueEntry = {
  msg: string;
  priority: number;
  hold: number;
  meta?: CommentaryMeta;
};

/** Paced race commentary — queues lines so callouts aren't overwritten instantly. */
export const createCommentary = (
  el: HTMLElement,
  hooks: CommentaryHooks = {},
): CommentaryHandle => {
  let queue: QueueEntry[] = [];
  let busy = false;
  let timer = 0;
  const minGap = 400;
  const defaultHold = 2600;

  const pump = () => {
    if (busy || queue.length === 0) return;
    busy = true;
    queue.sort((a, b) => b.priority - a.priority);
    const next = queue.shift();
    if (!next) {
      busy = false;
      return;
    }

    el.textContent = next.msg;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
    hooks.onShow?.(next.msg, next.meta);

    timer = window.setTimeout(() => {
      busy = false;
      timer = window.setTimeout(() => pump(), minGap);
    }, next.hold);
  };

  const clear = () => {
    clearTimeout(timer);
    queue = [];
    busy = false;
    el.textContent = '';
    el.classList.remove('flash');
  };

  const say = (
    msg: string,
    opts: { priority?: number; hold?: number; meta?: CommentaryMeta } = {},
  ) => {
    const priority = opts.priority ?? 0;
    const hold = opts.hold ?? defaultHold;
    const entry: QueueEntry = { msg, priority, hold, meta: opts.meta };

    if (priority >= 2) {
      queue = queue.filter((q) => q.priority >= 2);
      queue.unshift(entry);
      if (busy && priority >= 3) {
        clearTimeout(timer);
        busy = false;
      }
    } else {
      if (queue.some((q) => q.msg === msg)) return;
      if (el.textContent === msg && busy) return;
      queue.push(entry);
    }
    pump();
  };

  return { clear, say };
};
