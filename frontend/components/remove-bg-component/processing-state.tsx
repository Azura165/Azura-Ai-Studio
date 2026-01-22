"use client"

import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface ProcessingStateProps {
    progress: number
    message?: string
}

export function ProcessingState({
    progress,
    message = "Processing your image...",
}: ProcessingStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
        >
            <div className="rounded-xl border bg-card p-6">
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Loader2 className="size-8 text-primary" />
                    </motion.div>

                    <div className="w-full space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{message}</span>
                            <span className="font-medium text-foreground">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Please wait while we remove the background
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
