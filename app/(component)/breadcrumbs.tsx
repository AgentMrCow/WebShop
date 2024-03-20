// @/app/(component)/breadcrumbs.tsx
import React from 'react';
import Link from 'next/link';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ShadcnBreadcrumbs: React.FC<BreadcrumbsProps> = ({ breadcrumbs = [] }) => {
    return (
        <Breadcrumb className="my-4">
            <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                        <React.Fragment key={index}>
                            <BreadcrumbItem>
                                {breadcrumb.path && !isLast ? (
                                    <BreadcrumbLink asChild>
                                        <Link href={breadcrumb.path}>{breadcrumb.label}</Link>
                                    </BreadcrumbLink>
                                ) : (
                                    <span><strong>{breadcrumb.label}</strong></span>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
};


export default ShadcnBreadcrumbs;
