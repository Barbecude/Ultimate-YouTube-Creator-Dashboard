import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: string;
    className?: string;
}

export function PageHeader({ title, className }: PageHeaderProps) {
    return (
        <div className={cn("", className)}>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
    );
}
