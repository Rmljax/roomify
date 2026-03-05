import {useParams, useNavigate} from "react-router";
import {useEffect, useRef, useState} from "react";
import {Loader2, ArrowLeft, Download, Share2, ImageIcon} from "lucide-react";
import Button from "../../components/ui/Button";

const VisualizerId = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [imageData, setImageData] = useState<string | null>(null);
    const [renderedImageData, setRenderedImageData] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        if (id) {
            const data = sessionStorage.getItem(`upload_${id}`);
            if (data) {
                setImageData(data);
                // Simulate visualization generation
                startVisualization();
            } else {
                setError("No image found for this ID.");
            }
        }
        return () => {
            isMounted.current = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [id]);

    const startVisualization = () => {
        setIsProcessing(true);
        // Simulate a delay for the visualization process
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            // In a real app, we would fetch the rendered image from a service
            // For now, we'll just use the original image as a placeholder or a mock URL
            if (isMounted.current) {
                setRenderedImageData("https://roomify-mlhuk267-dfwu1i.puter.site/projects/1770803585402/rendered.png");
                setIsProcessing(false);
            }
        }, 3000);
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background">
                <p className="text-xl text-red-500 mb-4">{error}</p>
                <Button onClick={() => navigate('/')} variant="primary">Go Home</Button>
            </div>
        );
    }

    return (
        <div className="visualizer">
            <div className="topbar">
                <div className="brand" onClick={() => navigate('/')}>
                    <div className="logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box">
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                            <path d="m3.3 7 8.7 5 8.7-5" />
                            <path d="M12 22V12" />
                        </svg>
                    </div>
                    <span className="name">Roomify</span>
                </div>
                <Button variant="ghost" size="sm" className="exit" onClick={() => navigate('/')}>
                    <ArrowLeft className="icon" /> Exit Visualizer
                </Button>
            </div>

            <div className="content">
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Visualization Project</p>
                            <h2>Visualizer: {id}</h2>
                            <p className="note">AI-powered 3D architectural render from 2D floor plan</p>
                        </div>
                        <div className="panel-actions">
                            <Button variant="outline" size="sm" className="share" disabled={isProcessing}>
                                <Share2 className="w-4 h-4 mr-2" /> Share
                            </Button>
                            <Button variant="primary" size="sm" className="export" disabled={isProcessing}>
                                <Download className="w-4 h-4 mr-2" /> Export Render
                            </Button>
                        </div>
                    </div>

                    <div className={`render-area ${isProcessing ? 'is-processing' : ''}`}>
                        {renderedImageData ? (
                            <img src={renderedImageData} alt="Rendered visualization" className="render-img" />
                        ) : (
                            <div className="render-placeholder">
                                {imageData && <img src={imageData} alt="Original floor plan" className="render-fallback" />}
                            </div>
                        )}

                        {isProcessing && (
                            <div className="render-overlay">
                                <div className="rendering-card">
                                    <Loader2 className="spinner" />
                                    <p className="title">Generating 3D Visualization...</p>
                                    <p className="subtitle">Converting floor plan to architectural render</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="panel compare">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <h3>Original Floor Plan</h3>
                            <p className="hint">Uploaded source file used for generation</p>
                        </div>
                    </div>
                    <div className="compare-stage">
                        {imageData ? (
                            <img src={imageData} alt="Original floor plan" className="compare-img" />
                        ) : (
                            <div className="compare-fallback h-64 flex items-center justify-center bg-zinc-50">
                                <ImageIcon className="w-12 h-12 text-zinc-200" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisualizerId;