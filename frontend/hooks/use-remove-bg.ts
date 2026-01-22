"use client"

import { useState, useCallback } from "react"
import axios, { AxiosProgressEvent } from "axios"

export interface ProcessedImage {
    original: string
    processed: string
    filename: string
}

export interface UploadResult {
    results: ProcessedImage[]
}

export interface FileWithProgress {
    file: File
    id: string
    preview: string
    progress: number
    status: "idle" | "uploading" | "success" | "error"
    result?: ProcessedImage
    error?: string
}

const API_ENDPOINT = "http://localhost:5000/api/remove-bg"

export function useRemoveBg() {
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<ProcessedImage | null>(null)

    const processImage = useCallback(async (file: File) => {
        setIsLoading(true)
        setProgress(0)
        setError(null)
        setResult(null)

        const formData = new FormData()
        formData.append("images", file)

        try {
            const response = await axios.post<UploadResult>(API_ENDPOINT, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        )
                        setProgress(percentCompleted)
                    }
                },
            })

            if (response.data.results && response.data.results.length > 0) {
                setResult(response.data.results[0])
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || err.message || "Failed to process image")
            } else {
                setError("An unexpected error occurred")
            }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const reset = useCallback(() => {
        setIsLoading(false)
        setProgress(0)
        setError(null)
        setResult(null)
    }, [])

    return {
        isLoading,
        progress,
        error,
        result,
        processImage,
        reset,
    }
}

export function useRemoveBgMultiple() {
    const [files, setFiles] = useState<FileWithProgress[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [globalProgress, setGlobalProgress] = useState(0)

    const addFiles = useCallback((newFiles: File[]) => {
        const filesWithProgress: FileWithProgress[] = newFiles.map((file) => ({
            file,
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: "idle" as const,
        }))
        setFiles((prev) => [...prev, ...filesWithProgress])
    }, [])

    const removeFile = useCallback((id: string) => {
        setFiles((prev) => {
            const file = prev.find((f) => f.id === id)
            if (file) {
                URL.revokeObjectURL(file.preview)
            }
            return prev.filter((f) => f.id !== id)
        })
    }, [])

    const processAllImages = useCallback(async () => {
        if (files.length === 0) return

        setIsProcessing(true)
        setGlobalProgress(0)

        const formData = new FormData()
        files.forEach((fileItem) => {
            formData.append("images", fileItem.file)
        })

        // Set all files to uploading
        setFiles((prev) =>
            prev.map((f) => ({ ...f, status: "uploading" as const, progress: 0 }))
        )

        try {
            const response = await axios.post<UploadResult>(API_ENDPOINT, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        )
                        setGlobalProgress(percentCompleted)
                        setFiles((prev) =>
                            prev.map((f) => ({ ...f, progress: percentCompleted }))
                        )
                    }
                },
            })

            // Map results back to files
            if (response.data.results) {
                setFiles((prev) =>
                    prev.map((f, index) => {
                        const result = response.data.results[index]
                        if (result) {
                            return {
                                ...f,
                                status: "success" as const,
                                progress: 100,
                                result,
                            }
                        }
                        return {
                            ...f,
                            status: "error" as const,
                            error: "No result returned for this file",
                        }
                    })
                )
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message || "Failed to process images"
                : "An unexpected error occurred"

            setFiles((prev) =>
                prev.map((f) => ({
                    ...f,
                    status: "error" as const,
                    error: errorMessage,
                }))
            )
        } finally {
            setIsProcessing(false)
        }
    }, [files])

    const reset = useCallback(() => {
        files.forEach((f) => URL.revokeObjectURL(f.preview))
        setFiles([])
        setIsProcessing(false)
        setGlobalProgress(0)
    }, [files])

    const clearCompleted = useCallback(() => {
        setFiles((prev) => prev.filter((f) => f.status !== "success"))
    }, [])

    return {
        files,
        isProcessing,
        globalProgress,
        addFiles,
        removeFile,
        processAllImages,
        reset,
        clearCompleted,
    }
}
