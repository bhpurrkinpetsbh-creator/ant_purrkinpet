import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Mic, Mail, Download, X, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface SupportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SupportDialog({ open, onOpenChange }: SupportDialogProps) {
    const [subject, setSubject] = useState("Issue_");
    const [description, setDescription] = useState("Hi Shaid,\n\nPlease find the issue we observed\n\n");
    const [isRecordingScreen, setIsRecordingScreen] = useState(false);
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);

    const [screenBlob, setScreenBlob] = useState<Blob | null>(null);
    const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);

    const screenRecorderRef = useRef<MediaRecorder | null>(null);
    const voiceRecorderRef = useRef<MediaRecorder | null>(null);
    const screenChunksRef = useRef<Blob[]>([]);
    const voiceChunksRef = useRef<Blob[]>([]);

    // Screen Recording Logic
    const startScreenRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false // Screen audio is tricky, usually video is enough
            });

            const recorder = new MediaRecorder(stream);
            screenRecorderRef.current = recorder;
            screenChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) screenChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const fullBlob = new Blob(screenChunksRef.current, { type: "video/webm" });
                setScreenBlob(fullBlob);
                stream.getTracks().forEach(track => track.stop()); // Stop sharing
                setIsRecordingScreen(false);
                toast.success("Screen recording captured!");
            };

            recorder.start();
            setIsRecordingScreen(true);

            // Handle user clicking "Stop Sharing" on browser UI
            stream.getVideoTracks()[0].onended = () => {
                if (recorder.state !== 'inactive') recorder.stop();
            };

        } catch (err) {
            console.error("Error starting screen record:", err);
            toast.error("Could not start screen recording.");
        }
    };

    const stopScreenRecording = () => {
        if (screenRecorderRef.current && screenRecorderRef.current.state === "recording") {
            screenRecorderRef.current.stop();
        }
    };

    // Voice Recording Logic
    const startVoiceRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const recorder = new MediaRecorder(stream);
            voiceRecorderRef.current = recorder;
            voiceChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) voiceChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const fullBlob = new Blob(voiceChunksRef.current, { type: "audio/webm" });
                setVoiceBlob(fullBlob);
                stream.getTracks().forEach(track => track.stop());
                setIsRecordingVoice(false);
                toast.success("Voice note captured!");
            };

            recorder.start();
            setIsRecordingVoice(true);
        } catch (err) {
            console.error("Error starting voice record:", err);
            toast.error("Could not access microphone.");
        }
    };

    const stopVoiceRecording = () => {
        if (voiceRecorderRef.current && voiceRecorderRef.current.state === "recording") {
            voiceRecorderRef.current.stop();
        }
    };

    // n8n Webhook URL
    const N8N_WEBHOOK_URL = "https://n8n.srv1034374.hstgr.cloud/webhook/getsupportissue";

    const sendToWebhook = async () => {
        const formData = new FormData();
        formData.append("subject", subject);
        formData.append("description", description);
        formData.append("timestamp", new Date().toISOString());

        if (screenBlob) {
            formData.append("screen_recording", screenBlob, `screen-${Date.now()}.webm`);
        }

        if (voiceBlob) {
            formData.append("voice_note", voiceBlob, `voice-${Date.now()}.webm`);
        }

        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                toast.success("Support ticket sent successfully!");
                onOpenChange(false);
                // Optional: Reset form
                setSubject("");
                setDescription("");
                clearBlob('screen');
                clearBlob('voice');
            } else {
                throw new Error("Webhook failed");
            }
        } catch (error) {
            console.error("Webhook error:", error);
            toast.error("Failed to send ticket automatically. Downloading files instead.");
            // Fallback to download
            downloadFiles();
        }
    };

    const downloadFiles = () => {
        if (screenBlob) {
            setTimeout(() => {
                const url = URL.createObjectURL(screenBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `screen-recording-${Date.now()}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }, 100);
        }

        if (voiceBlob) {
            setTimeout(() => {
                const url = URL.createObjectURL(voiceBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `voice-note-${Date.now()}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }, 300);
        }

        toast.info("Please email these files to support@purrkinpets.com");
    };

    // Send Logic
    const handleSend = async () => {
        toast.loading("Sending support ticket...");
        await sendToWebhook();
        toast.dismiss();
    };

    const clearBlob = (type: 'screen' | 'voice') => {
        if (type === 'screen') setScreenBlob(null);
        if (type === 'voice') setVoiceBlob(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display">Contact Support</DialogTitle>
                    <DialogDescription>
                        Describe your issue. To help us better, you can record your screen or voice.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                placeholder="Brief summary of the issue"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Detailed explanation..."
                                className="h-32"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="block">Recordings (Optional)</Label>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Screen Recording Card */}
                                <div className="border rounded-lg p-4 flex flex-col items-center justify-center gap-3 bg-muted/20">
                                    <Video className={`h-8 w-8 ${isRecordingScreen ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
                                    <div className="text-center">
                                        <div className="font-medium text-sm">Screen Recording</div>
                                        {screenBlob ? (
                                            <div className="text-xs text-green-600 font-medium mt-1 flex items-center justify-center gap-1">
                                                Captured {(screenBlob.size / 1024 / 1024).toFixed(2)}MB
                                            </div>
                                        ) : (
                                            <div className="text-xs text-muted-foreground mt-1">Capture your screen</div>
                                        )}
                                    </div>

                                    {isRecordingScreen ? (
                                        <Button variant="destructive" size="sm" onClick={stopScreenRecording} className="w-full">
                                            <StopCircle className="h-4 w-4 mr-2" /> Stop
                                        </Button>
                                    ) : screenBlob ? (
                                        <div className="flex gap-2 w-full">
                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                                                const url = URL.createObjectURL(screenBlob);
                                                window.open(url, '_blank');
                                            }}>Preview</Button>
                                            <Button variant="ghost" size="icon" onClick={() => clearBlob('screen')}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button variant="outline" size="sm" className="w-full" onClick={startScreenRecording}>
                                            Record Screen
                                        </Button>
                                    )}
                                </div>

                                {/* Voice Recording Card */}
                                <div className="border rounded-lg p-4 flex flex-col items-center justify-center gap-3 bg-muted/20">
                                    <Mic className={`h-8 w-8 ${isRecordingVoice ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
                                    <div className="text-center">
                                        <div className="font-medium text-sm">Voice Note</div>
                                        {voiceBlob ? (
                                            <div className="text-xs text-green-600 font-medium mt-1 flex items-center justify-center gap-1">
                                                Captured {(voiceBlob.size / 1024).toFixed(0)}KB
                                            </div>
                                        ) : (
                                            <div className="text-xs text-muted-foreground mt-1">Record a message</div>
                                        )}
                                    </div>

                                    {isRecordingVoice ? (
                                        <Button variant="destructive" size="sm" onClick={stopVoiceRecording} className="w-full">
                                            <StopCircle className="h-4 w-4 mr-2" /> Stop
                                        </Button>
                                    ) : voiceBlob ? (
                                        <div className="flex gap-2 w-full">
                                            <audio src={URL.createObjectURL(voiceBlob)} controls className="w-full h-8 hidden" id="audio-preview" />
                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                                                const audio = new Audio(URL.createObjectURL(voiceBlob));
                                                audio.play();
                                            }}>Play</Button>
                                            <Button variant="ghost" size="icon" onClick={() => clearBlob('voice')}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button variant="outline" size="sm" className="w-full" onClick={startVoiceRecording}>
                                            Record Voice
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="bg-muted/30 p-3 rounded-md border text-xs text-muted-foreground mt-2">
                    <p><strong>Note:</strong> We will send your issue and recordings directly to our support team. If connection fails, we'll download the files for you.</p>
                </div>

                <DialogFooter className="mt-4 pt-4 border-t flex sm:justify-between items-center gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Back to Dashboard</Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="hidden sm:flex">Close</Button>
                        <Button onClick={handleSend} className="gap-2 bg-primary flex-1 sm:flex-none">
                            <Mail className="h-4 w-4" />
                            Send Ticket
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
