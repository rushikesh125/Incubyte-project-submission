'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';

function formatSegment(segment) {
  // Handle special cases
  const specialCases = {
    'dashboard': 'Dashboard',
    'settings': 'Settings',
    'profile': 'Profile',
    'users': 'Users',
    'products': 'Products',
    'orders': 'Orders',
    'admin': 'Admin'
  };

  if (specialCases[segment]) {
    return specialCases[segment];
  }

  // Handle dynamic segments (UUIDs, IDs, etc.)
  if (/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(segment)) {
    return 'Details';
  }
  
  if (/^\d+$/.test(segment)) {
    return 'Item';
  }

  // Convert kebab-case to Title Case
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment);

  // Don't show breadcrumb on home page or if only one segment
  if (pathSegments.length === 0) {
    return null;
  }

  // Limit to last 3 segments for minimal display
  const maxSegments = 3;
  const displaySegments = pathSegments.length > maxSegments 
    ? pathSegments.slice(-maxSegments)
    : pathSegments;

  // Add root if we're truncating
  const showRoot = pathSegments.length > maxSegments;

  return (
    <Breadcrumb>
      <BreadcrumbList className="rounded-lg text-sm">
        {showRoot && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-gray-400">...</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {displaySegments.map((segment, index) => {
          const isLast = index === displaySegments.length - 1;
          const fullPath = showRoot 
            ? '/' + pathSegments.slice(0, pathSegments.length - displaySegments.length + index + 1).join('/')
            : '/' + displaySegments.slice(0, index + 1).join('/');

          return (
            <React.Fragment key={fullPath}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-medium">
                    {formatSegment(segment)}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={fullPath}>
                    {formatSegment(segment)}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}