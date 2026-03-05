import React, {useEffect, useRef, useState} from 'react';
import {useOutletContext} from "react-router";
import {CheckCircle2, ImageIcon, UploadIcon} from "lucide-react";
import {PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS, MAX_UPLOAD_SIZE} from "../lib/constants";

interface UploadProps {
    onComplete: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMounted = useRef(true);

    const {isSignedIn} = useOutletContext<AuthContext>();

    useEffect(() => {
        return () => {
            isMounted.current = false;
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const processFile = (file: File) => {
        if (!isSignedIn) return;
        
        setError(null);
        if (!file.type.startsWith('image/')) {
            setError("Invalid file type. Please upload an image.");
            return;
        }
        if (file.size > MAX_UPLOAD_SIZE) {
            setError(`File is too large. Maximum size is ${MAX_UPLOAD_SIZE / (1024 * 1024)}MB.`);
            return;
        }

        setFile(file);
        setProgress(0);

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
                if (!isMounted.current) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return;
                }

                setProgress((prev) => {
                    if (prev >= 100) {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        
                        timeoutRef.current = setTimeout(() => {
                            if (isMounted.current) {
                                onComplete(base64);
                            }
                        }, REDIRECT_DELAY_MS);
                        return 100;
                    }
                    return Math.min(prev + PROGRESS_STEP, 100);
                });
            }, PROGRESS_INTERVAL_MS);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!isSignedIn) return;
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (!isSignedIn) return;

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpg,.jpeg,.png"
                        disabled={!isSignedIn}
                        onChange={handleInputChange}
                    />
                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20}/>
                        </div>
                        {error && <p className="error-message text-red-500 text-xs font-bold mb-2 uppercase tracking-tight">{error}</p>}
                        <p>{isSignedIn ? (
                            "Click to upload or drag and drop"
                        ):("Sign in or sign up with Puter to upload")}</p>
                        <p className="help">Maximum file size {MAX_UPLOAD_SIZE / (1024 * 1024)} MB.</p>
                    </div>
                </div>
            ):
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (
                                <CheckCircle2 className="check" />
                                ) : (
                                    <ImageIcon className="image"/>
                                )}
                        </div>

                        <h3>{file.name}</h3>

                        <div className="progress">
                            <div className="bar" style={{width: `${progress}%`}}/>

                            <p className="status-text">
                                {progress < 100 ? 'Analyzing Floor Plan...' : 'Redirecting...'}
                            </p>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default Upload;