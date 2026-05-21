import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Eraser, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { socketService } from '../../lib/socket';

interface DrawingPoint {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    color: string;
    size: number;
    isEraser?: boolean;
}

interface WhiteboardProps {
    isTeacher: boolean;
    roomName: string;
    isOpen: boolean;
    onClose?: () => void;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({ isTeacher, roomName, isOpen }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [penColor, setPenColor] = useState('#EF4444');
    const [penSize, setPenSize] = useState(3);
    const [isEraser, setIsEraser] = useState(false);
    
    const drawingRef = useRef(false);
    const lastPosRef = useRef({ x: 0, y: 0 });

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        
        // Save current content before resize
        const ctx = canvas.getContext('2d');
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx && canvas.width > 0 && canvas.height > 0) {
             tempCtx.drawImage(canvas, 0, 0);
        }

        canvas.width = rect.width;
        canvas.height = rect.height;

        // Restore content after resize, scaling to new size
        if (ctx && tempCanvas.width > 0 && tempCanvas.height > 0) {
            ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(resizeCanvas, 50);
        }
    }, [isOpen, resizeCanvas]);

    useEffect(() => {
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);

    const drawLine = useCallback((x0: number, y0: number, x1: number, y1: number, color: string, size: number, isEraserMode: boolean = false, emit = true) => {
        const canvas = canvasRef.current;
        if (!canvas || canvas.width === 0 || canvas.height === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const absX0 = x0 * canvas.width;
        const absY0 = y0 * canvas.height;
        const absX1 = x1 * canvas.width;
        const absY1 = y1 * canvas.height;

        ctx.beginPath();
        // ★ Optimized Eraser: use globalCompositeOperation = 'destination-out' to completely clear pixels
        if (isEraserMode) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = color;
        }

        ctx.moveTo(absX0, absY0);
        ctx.lineTo(absX1, absY1);
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.closePath();

        // Restore to default
        ctx.globalCompositeOperation = 'source-over';

        if (emit && isTeacher) {
            const socket = socketService.getSocket();
            socket.emit('drawing', {
                conversationId: roomName,
                x0, y0, x1, y1,
                color,
                size,
                isEraser: isEraserMode
            });
        }
    }, [isTeacher, roomName]);

    const clearCanvas = useCallback((emit = true) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        if (emit && isTeacher) {
            socketService.getSocket().emit('clear_whiteboard', { conversationId: roomName });
        }
    }, [isTeacher, roomName]);

    useEffect(() => {
        const socket = socketService.getSocket();
        
        const handleDrawing = (data: DrawingPoint) => {
            drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size, data.isEraser, false);
        };

        const handleClear = () => {
            clearCanvas(false);
        };

        if (!isTeacher) {
            socket.on('drawing', handleDrawing);
            socket.on('clear_whiteboard', handleClear);
        }

        return () => {
            socket.off('drawing', handleDrawing);
            socket.off('clear_whiteboard', handleClear);
        };
    }, [isTeacher, drawLine, clearCanvas]);

    const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isTeacher || !canvasRef.current) return;
        drawingRef.current = true;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        lastPosRef.current = {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isTeacher || !drawingRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const currentX = clientX - rect.left;
        const currentY = clientY - rect.top;

        const x0 = lastPosRef.current.x / canvas.width;
        const y0 = lastPosRef.current.y / canvas.height;
        const x1 = currentX / canvas.width;
        const y1 = currentY / canvas.height;

        const color = penColor;
        const size = isEraser ? 24 : penSize;

        drawLine(x0, y0, x1, y1, color, size, isEraser, true);

        lastPosRef.current = { x: currentX, y: currentY };
    };

    const handleEnd = () => {
        drawingRef.current = false;
    };

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-slate-800/95 backdrop-blur-sm flex flex-col z-20">
            {isTeacher && (
                <div className="h-14 border-b border-white/10 bg-slate-900/90 flex items-center justify-between px-4 shrink-0 shadow-lg relative z-30">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-lg border border-white/5">
                            {['#EF4444', '#3B82F6', '#10B981', '#FFFFFF'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => { setPenColor(c); setIsEraser(false); }}
                                    className={cn("w-6 h-6 rounded-full border-2 transition-transform shadow-sm",
                                        penColor === c && !isEraser ? "scale-110 border-white shadow-white/20" : "border-transparent opacity-80 hover:opacity-100"
                                    )}
                                    style={{ backgroundColor: c }}
                                    title="لون القلم"
                                />
                            ))}
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-1" />

                        <button
                            onClick={() => setIsEraser(!isEraser)}
                            className={cn("p-2 rounded-lg transition-all border border-transparent flex items-center justify-center",
                                isEraser ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                            )}
                            title="الممحاة"
                        >
                            <Eraser size={18} />
                        </button>

                        <div className="w-px h-6 bg-white/10 mx-1" />

                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                            {[2, 5, 10].map(s => (
                                <button
                                    key={s}
                                    onClick={() => { setPenSize(s); setIsEraser(false); }}
                                    className={cn("text-[10px] font-bold px-3 py-1.5 rounded-md transition-all",
                                        penSize === s && !isEraser ? "bg-indigo-500/30 text-indigo-200" : "text-white/60 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    {s === 2 ? 'رقيق' : s === 5 ? 'متوسط' : 'عريض'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => clearCanvas(true)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                            title="مسح كامل السبورة"
                        >
                            <Trash2 size={16} /> <span className="hidden sm:inline">مسح الكل</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 relative w-full h-full">
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={handleEnd}
                    className={cn("absolute inset-0 w-full h-full block touch-none",
                        !isTeacher ? "pointer-events-none" : "cursor-crosshair"
                    )}
                />
            </div>
        </div>
    );
};
