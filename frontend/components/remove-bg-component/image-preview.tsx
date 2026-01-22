"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"

interface ImagePreviewProps {
    src: string
    filename: string
    onRemove?: () => void
    className?: string
}

export function ImagePreview({
    src,
    filename,
    onRemove,
    className,
}: ImagePreviewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={className}
        >
            <div className="relative overflow-hidden rounded-xl border bg-muted/30">
                <div className="relative aspect-square w-full">
                    <Image
                        src={src || "/placeholder.svg"}
                        alt={filename}
                        fill
                        className="object-contain p-2"
                        unoptimized
                    />
                </div>
                {onRemove && (
                    <Button
                        variant="destructive"
                        size="icon-sm"
                        className="absolute right-2 top-2 size-7"
                        onClick={onRemove}
                    >
                        <X className="size-4" />
                        <span className="sr-only">Remove image</span>
                    </Button>
                )}
                <div className="border-t bg-background/80 px-3 py-2 backdrop-blur-sm">
                    <p className="truncate text-xs text-muted-foreground">{filename}</p>
                </div>
            </div>
        </motion.div>
    )
}
