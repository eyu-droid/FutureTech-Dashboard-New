import QRCode from "react-qr-code";
import { useEffect } from "react";
import type { Route } from "../.react-router/types/app/routes/print-qr.$orderNo";

export async function clientLoader({ params, request }: Route.ClientLoaderArgs) {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    const ticket = url.searchParams.get('ticket');
    return { name, orderNo: params.orderNo, ticket };
}

const PrintQRPage = ({ loaderData }: Route.ComponentProps) => {
    const { name, orderNo, ticket } = loaderData;

    useEffect(() => {
        // Notify opener (if any) when printing has finished or the page closes.
        // This allows the parent window to re-fetch or update UI if it's listening for postMessage.
        const notifyParent = () => {
            try {
                const payload = { type: 'print-qr:closed', orderNo: orderNo ?? null };
                // send to opener (when this window was opened by the app) so the app can refetch if desired
                if (window.opener && typeof window.opener.postMessage === 'function') {
                    window.opener.postMessage(payload, '*');
                }
                // also dispatch a local event so same-window listeners can react
                window.dispatchEvent(new CustomEvent('print-qr:closed', { detail: payload }));
            } catch (e) {
                // swallow errors silently
            }
        };

        // after printing completes in many browsers
        (window as any).onafterprint = notifyParent;
        // also listen for unload to notify parent when user closes the tab
        window.addEventListener('unload', notifyParent);

        return () => {
            (window as any).onafterprint = null;
            window.removeEventListener('unload', notifyParent);
        };
    }, [orderNo]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f2f2f2', padding: 16 }}>
            <style>{`
                /*
                 * Print layout:
                 * - Use A6 page size for badges (105mm x 148mm)
                 * - Have small margins for printing; badge area sized to A6 minus margins
                 */
                @page { size: 105mm 148mm; margin: 6mm; }
                html, body {
                    height: 100%;
                    margin: 0;
                }
                @media print {
                    html, body { margin: 0; padding: 0; height: auto; }
                    .no-print { display: none !important; }
                    /* ensure the badge is printed as a single page with A6 dimensions */
                    .badge { page-break-after: always; page-break-inside: avoid; break-inside: avoid; box-shadow: none; margin: 0; width: 105mm; height: 148mm; }
                }

                /* Badge container tuned to A6 size */
                .badge {
                    width: 105mm;
                    height: 148mm;
                    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
                    border-radius: 6px;
                    padding: 12mm;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    text-align: center;
                    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.06);
                }

                .header {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    flex-direction: column;
                }

                .event-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #111827;
                }

                .event-sub {
                    font-size: 11px;
                    color: #6b7280;
                }

                /* QR wrapper reserves space and prevents clipping */
                .qr-wrap {
                    background: white;
                    padding: 8px;
                    border-radius: 6px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    max-width: 60mm;
                    box-sizing: border-box;
                    border: 1px solid #e6edf3;
                }

                .qr-wrap svg {
                    width: 100% !important;
                    height: auto !important;
                    display: block;
                }

                .name {
                    font-size: 18px;
                    font-weight: 800;
                    margin-top: 8px;
                    color: #0f172a;
                    word-break: break-word;
                }

                .ticket {
                    font-size: 12px;
                    color: #374151;
                    margin-top: 4px;
                }

                .order-no {
                    font-size: 11px;
                    color: #6b7280;
                    margin-top: 6px;
                    word-break: break-word;
                }

                .meta {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    gap: 8px;
                    margin-top: 8px;
                    font-size: 11px;
                    color: #6b7280;
                }

                .footer {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }

                .print-button {
                    padding: 8px 14px;
                    background-color: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                }

                .close-link {
                    color: #2563eb;
                    text-decoration: none;
                    font-size: 13px;
                }
            `}</style>

            <div className="badge" role="document" aria-label="Event badge">
                <div style={{ width: '100%' }}>
                    <div className="header">
                        <img src="https://futuretechaddis.com/wp-content/uploads/2025/04/logo-future-.png" alt="logo" style={{ height: 36 }} />
                        <div className="event-title">Future Tech Addis Expo</div>
                        <div className="event-sub">Nov 28 - Nov 30 • Addis Ababa Convention Center</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 10 }}>
                        <div className="qr-wrap" aria-hidden={!orderNo}>
                            {orderNo && <QRCode value={String(orderNo)} size={300} />}
                        </div>

                        <div className="name">{name ?? 'Attendee'}</div>
                        <div className="ticket">{ticket ? `Ticket: ${ticket}` : 'Ticket: Event'}</div>
                        <div className="order-no">Registration ID: {orderNo ?? 'N/A'}</div>

                        <div className="meta" style={{ marginTop: 8 }}>
                            <div>Event: Future Tech Addis</div>
                            <div>Date: Nov 28 - Nov 30</div>
                        </div>
                    </div>
                </div>

                <div style={{ width: '100%', marginTop: 6 }} className="footer">
                    <div style={{ fontSize: 11, color: '#6b7280' }}>Please present this badge at the entrance</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button className="print-button no-print" onClick={() => window.print()}>Print</button>
                        <a className="close-link no-print" href="/" aria-label="Close">Close</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintQRPage;

