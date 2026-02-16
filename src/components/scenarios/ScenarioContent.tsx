import { useEffect, useRef, useCallback } from 'react';
import { Link2, Paperclip, UserRound, MessageSquare } from 'lucide-react';
import type { InteractiveElement } from '../../types';

type ActionType =
  | 'scenario_viewed'
  | 'element_clicked'
  | 'element_hovered'
  | 'link_inspected'
  | 'email_header_expanded'
  | 'sender_checked'
  | 'url_analyzed'
  | 'profile_investigated'
  | 'time_spent_on_element';

type TrackedAction = {
  action: ActionType;
  element_id?: string | null;
  element_type?: string | null;
  details?: Record<string, unknown>;
};

type ScenarioContentProps = {
  type: string;
  content: Record<string, unknown>;
  htmlContent?: string;
  interactiveElements?: readonly InteractiveElement[];
  onAction?: (action: TrackedAction) => void;
};

export default function ScenarioContent({
  type,
  content,
  htmlContent,
  interactiveElements = [],
  onAction,
}: ScenarioContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimers = useRef<Map<string, number>>(new Map());
  const elementMap = useRef<Map<string, InteractiveElement>>(new Map());

  useEffect(() => {
    elementMap.current.clear();
    interactiveElements.forEach((el) => {
      elementMap.current.set(el.id, el);
    });
  }, [interactiveElements]);

  useEffect(() => {
    onAction?.({ action: 'scenario_viewed' });
  }, [onAction]);

  const handleElementClick = useCallback(
    (elementId: string, elementType?: string) => {
      onAction?.({
        action: 'element_clicked',
        element_id: elementId,
        element_type: elementType,
      });
    },
    [onAction]
  );

  const handleElementHover = useCallback(
    (elementId: string, elementType: string | undefined, entering: boolean) => {
      if (entering) {
        hoverTimers.current.set(elementId, Date.now());
        onAction?.({
          action: 'element_hovered',
          element_id: elementId,
          element_type: elementType,
        });
      } else {
        const startTime = hoverTimers.current.get(elementId);
        if (startTime) {
          const duration = Math.round((Date.now() - startTime) / 1000);
          if (duration >= 2) {
            onAction?.({
              action: 'time_spent_on_element',
              element_id: elementId,
              element_type: elementType,
              details: { time_spent: duration },
            });
          }
          hoverTimers.current.delete(elementId);
        }
      }
    },
    [onAction]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !htmlContent) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('[data-interactive="true"]');
      if (interactiveEl) {
        e.preventDefault();
        const elementId = interactiveEl.id;
        const element = elementMap.current.get(elementId);
        handleElementClick(elementId, element?.type);
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.dataset.interactive === 'true') {
        const element = elementMap.current.get(target.id);
        handleElementHover(target.id, element?.type, true);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.dataset.interactive === 'true') {
        const element = elementMap.current.get(target.id);
        handleElementHover(target.id, element?.type, false);
      }
    };

    container.addEventListener('click', handleClick);
    container.addEventListener('mouseenter', handleMouseEnter, true);
    container.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      container.removeEventListener('click', handleClick);
      container.removeEventListener('mouseenter', handleMouseEnter, true);
      container.removeEventListener('mouseleave', handleMouseLeave, true);
    };
  }, [htmlContent, handleElementClick, handleElementHover]);

  if (htmlContent) {
    return (
      <div
        ref={containerRef}
        className="scenario-html-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  if (type === 'phishing_email') {
    return (
      <div className="space-y-4 rounded-2xl border border-base-200 bg-base-200/40 p-5">
        <div className="space-y-1 border-b border-base-200 pb-4">
          <p className="text-sm text-base-content/70">From</p>
          <p className="text-sm font-medium text-base-content">{content.from as string}</p>
          <p className="text-sm text-base-content/70">Subject</p>
          <p className="text-sm font-medium text-base-content">{content.subject as string}</p>
        </div>
        <p className="whitespace-pre-wrap text-sm text-base-content/80">{content.body as string}</p>
        {Boolean(content.has_link) && (
          <div className="flex items-center gap-2 rounded-xl border border-base-200 bg-base-100 px-3 py-2 text-sm text-primary">
            <Link2 className="h-4 w-4" />
            <span className="truncate underline">{content.link_url as string}</span>
          </div>
        )}
        {Boolean(content.has_attachment) && (
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <Paperclip className="h-4 w-4" />
            <span>attachment.pdf</span>
          </div>
        )}
      </div>
    );
  }

  if (type === 'fake_profile') {
    return (
      <div className="space-y-4 rounded-2xl border border-base-200 bg-base-200/40 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-200 text-base-content/60">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-base-content">
              {content.display_name as string}
            </p>
            <p className="text-xs text-base-content/60">
              @{content.username as string} · {content.platform as string}
            </p>
          </div>
        </div>
        <p className="text-sm text-base-content/70">{content.bio as string}</p>
        <div className="grid grid-cols-3 gap-3 text-xs text-base-content/60">
          <div>
            <p className="text-base-content">{content.followers as number}</p>
            <p>followers</p>
          </div>
          <div>
            <p className="text-base-content">{content.following as number}</p>
            <p>following</p>
          </div>
          <div>
            <p className="text-base-content">{content.posts_count as number}</p>
            <p>posts</p>
          </div>
        </div>
        <p className="text-xs text-base-content/60">
          Account age: {content.account_age_days as number} days
        </p>
        <div className="rounded-xl border border-base-200 bg-base-100 p-3 text-sm italic text-base-content/70">
          "{content.message as string}"
        </div>
      </div>
    );
  }

  if (type === 'malicious_link') {
    return (
      <div className="space-y-4 rounded-2xl border border-base-200 bg-base-200/40 p-5">
        <p className="text-sm text-base-content/70">{content.context as string}</p>
        <div className="rounded-xl border border-base-200 bg-base-100 p-3">
          <p className="text-xs uppercase tracking-wide text-base-content/50">Displayed link</p>
          <p className="text-sm font-medium text-primary underline">
            {content.displayed_url as string}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-base-content/60">
          <span className="badge badge-outline">HTTPS {content.uses_https ? 'Yes' : 'No'}</span>
          <span className="badge badge-outline">
            Shortened {content.is_shortened ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    );
  }

  if (type === 'messaging') {
    return (
      <div className="space-y-4 rounded-2xl border border-base-200 bg-base-200/40 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-base-200 text-base-content/60">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-base-content">
              {content.sender_name as string}
            </p>
            <p className="text-xs text-base-content/60">{content.platform as string}</p>
          </div>
        </div>
        <div className="rounded-xl border border-base-200 bg-base-100 p-3 text-sm text-base-content/80">
          {content.message as string}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-base-200 bg-base-200/40 p-5">
      <pre className="text-xs text-base-content/70">{JSON.stringify(content, null, 2)}</pre>
    </div>
  );
}
