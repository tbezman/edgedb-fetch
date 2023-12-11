"use client";

import router from "next/router";
import {
  PropsWithChildren,
  useCallback,
  MouseEvent,
  ComponentProps,
  useTransition,
} from "react";

import NextLink from "next/link";

export function Link({
  children,
  className,
  noTransition = false,

  ...props
}: ComponentProps<typeof NextLink> &
  PropsWithChildren<{
    href: string;
    className?: string;
    noTransition?: boolean;
  }>) {
  const [isTransitioning, startTransition] = useTransition();

  const handleLinkClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      startTransition(() => {
        router.push(event.currentTarget.href);
      });
    },
    [],
  );

  return (
    <NextLink
      onClick={noTransition ? undefined : handleLinkClick}
      {...props}
      className={`text-blue-600 underline visited:text-gray-700 focus:scale-[.98] origin-left transition-transform duration-100 ${className}`}
    >
      <div className="flex items-baseline gap-x-2">
        {children}

        {isTransitioning ? (
          <svg
            className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-900"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : null}
      </div>
    </NextLink>
  );
}
