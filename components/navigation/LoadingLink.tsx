"use client";

import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useRouteLoading } from "./RouteLoadingProvider";

type LoadingLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    children: ReactNode;
  };

export default function LoadingLink({
  children,
  onClick,
  href,
  target,
  ...props
}: LoadingLinkProps) {
  const { startLoading } = useRouteLoading();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      target === "_blank"
    ) {
      return;
    }

    startLoading();
  };

  return (
    <Link href={href} target={target} {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}