// @/app/(component)/breadcrumbs.tsx
import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbsProps {
    breadcrumbs: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ breadcrumbs = [] }) => {
    return (
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
                {breadcrumbs.map((breadcrumb, index) => (
                    <li key={index} className={`breadcrumb-item ${!breadcrumb.path ? 'active' : ''}`} aria-current={!breadcrumb.path ? 'page' : undefined}>
                        {breadcrumb.path ? <Link href={breadcrumb.path} className="text-decoration-none">{breadcrumb.label}</Link> : breadcrumb.label}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
