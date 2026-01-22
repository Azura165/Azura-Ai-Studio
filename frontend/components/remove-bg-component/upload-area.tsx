"use client"

import React from "react"

import { useCallback, useState } from "react"
import { Upload, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface UploadAreaProps {
    onFilesSelected: (files: File[]) => void
    multiple?: boolean
    disabled?: boolean
    accept?: string
}

export function UploadArea({
    onFilesSelected,
    multiple = false,
    disabled = false,
    accept = "image/*",
}: UploadAreaProps) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            if (!disabled) {
                setIsDragging(true)
            }
        },
        [disabled]
    )

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)

            if (disabled) return

            const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
                file.type.startsWith("image/")
            )

            if (droppedFiles.length > 0) {
                onFilesSelected(multiple ? droppedFiles : [droppedFiles[0]])
            }
        },
        [disabled, multiple, onFilesSelected]
    )

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = e.target.files
            if (selectedFiles && selectedFiles.length > 0) {
                const filesArray = Array.from(selectedFiles)
                onFilesSelected(multiple ? filesArray : [filesArray[0]])
            }
            e.target.value = ""
        },
        [multiple, onFilesSelected]
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
        >
            <label
                className={cn(
                    "relative flex min-h-60 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300",
                    isDragging
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                    disabled && "cursor-not-allowed opacity-50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="sr-only"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileInput}
                    disabled={disabled}
                />

                <AnimatePresence mode="wait">
                    {isDragging ? (
                        <motion.div
                            key="dragging"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="rounded-full bg-primary/10 p-4">
                                <Upload className="size-8 text-primary" />
                            </div>
                            <p className="text-lg font-medium text-primary">
                                Drop {multiple ? "images" : "image"} here
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center gap-4 px-4 text-center"
                        >
                            <div className="rounded-full bg-muted p-4">
                                <ImageIcon className="size-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-base font-medium text-foreground">
                                    Drag & drop {multiple ? "images" : "an image"} here
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    or click to browse from your device
                                </p>
                            </div>
                            <div className="rounded-full bg-muted px-4 py-1.5">
                                <p className="text-xs text-muted-foreground">
                                    Supports: PNG, JPG, JPEG, WebP
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </label>
        </motion.div>
    )
}
