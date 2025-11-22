import { Scanner, type IDetectedBarcode } from '@yudiel/react-qr-scanner'
import { type FC, useState, useRef, useCallback } from 'react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { QrCode } from 'lucide-react';

const qrcodeRegionId = "html5qr-code-full-region";

type HtmlQRCodeProps = {
    onQRCodeSuccess: (result: IDetectedBarcode[]) => void,
    onQRCodeError: (error: unknown) => void,
}

/**
 * HtmlQRCode component improvements:
 * - Debounces / rate-limits scan events to avoid repeated detections firing multiple times.
 * - Prevents repeated toasts by suppressing duplicate scans of the same code for a short window.
 * - Dispatches a custom window event 'attendee:checkedin' with detail { code } after a scan so a parent can optionally listen and refetch.
 */
const HtmlQRCode: FC<HtmlQRCodeProps> = ({ onQRCodeSuccess, onQRCodeError }) => {
    // disable scanning briefly after a detection to avoid duplicate processing
    const [scanningDisabled, setScanningDisabled] = useState(false);
    // remember the last scanned code to avoid reprocessing the same code repeatedly
    const lastScannedRef = useRef<string | null>(null);

    const handleScan = useCallback((result: IDetectedBarcode[]) => {
        try {
            if (!result || result.length === 0) return;
            const raw = result[0].rawValue;
            if (!raw) return;

            // if scanning disabled or same code was recently scanned, ignore
            if (scanningDisabled) return;
            if (lastScannedRef.current === raw) return;

            // mark as scanned
            lastScannedRef.current = raw;
            setScanningDisabled(true);

            // call the provided callback
            onQRCodeSuccess(result);

            // dispatch a global event that other parts of app can listen to for refetch
            try {
                window.dispatchEvent(new CustomEvent('attendee:checkedin', { detail: { code: raw } }));
            } catch (e) {
                // ignore if not supported
            }

            // re-enable scanning after a short period (3s) and clear last scanned code
            setTimeout(() => {
                lastScannedRef.current = null;
                setScanningDisabled(false);
            }, 3000);
        } catch (err) {
            // forward any errors to parent handler
            onQRCodeError(err);
        }
    }, [scanningDisabled, onQRCodeSuccess, onQRCodeError]);

    const handleError = useCallback((err: unknown) => {
        // forward errors
        onQRCodeError(err);
    }, [onQRCodeError]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'outline'}>
                    <QrCode className='w-5 h-5' />
                    Scan QR Code
                </Button>
            </DialogTrigger>
            <DialogContent className='w-screen'>
                <DialogHeader >
                    <DialogTitle>QR Code scanner</DialogTitle>
                    <DialogDescription>
                        Point your camera at the attendee QR code. The scanner will process the first valid code and debounce subsequent detections for a few seconds.
                    </DialogDescription>
                </DialogHeader>
                {/* 
                    set allowMultiple={false} to reduce repeated detections.
                    Use our wrapper handler to debounce and suppress duplicates.
                */}
                <Scanner onScan={handleScan} onError={handleError} allowMultiple={false} />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default HtmlQRCode;