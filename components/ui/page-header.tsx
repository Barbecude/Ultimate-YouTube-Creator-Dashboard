import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: string;
    description?: string;
    className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
    return (
        <div className={cn("mb-6", className)}>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
        </div>
    );
}
