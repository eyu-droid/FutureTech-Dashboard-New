import QRCode from "react-qr-code";
import type { Route } from "../.react-router/types/app/routes/print-qr.$orderNo";

export async function clientLoader({ params, request }: Route.ClientLoaderArgs) {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    const ticket = url.searchParams.get('ticket');
    return { name, orderNo: params.orderNo, ticket };
}

const PrintQRPage = ({ loaderData }: Route.ComponentProps) => {
    const { name, orderNo, ticket } = loaderData;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f2f2f2', padding: 16 }}>
            <style>{`
                /*
                 * Print layout for single-badge printing:
                 * - Force page size to exact badge size with zero margins to avoid splitting
                 * - Ensure badge avoids page breaks and QR fits within the badge
                 */
                @page { size: 3.5in 4.5in; margin: 0; }
                html, body {
                    height: 100%;
                }
                @media print {
                    html, body { margin: 0; padding: 0; height: auto; }
                    .no-print { display: none !important; }
                    .badge { page-break-after: always; page-break-inside: avoid; break-inside: avoid; box-shadow: none; margin: 0; width: 3.5in; height: 4.5in; }
                }

                /* Badge container tuned to the page size */
                .badge {
                    width: 3.5in;
                    height: 4.5in;
                    background: white;
                    border-radius: 6px;
                    padding: 18px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    text-align: center;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
                    overflow: hidden; /* ensure children don't bleed out */
                }

                /* QR wrapper reserves space and prevents clipping */
                .qr-wrap {
                    background: white;
                    padding: 10px;
                    border-radius: 6px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    max-width: 260px; /* keep QR well inside badge edges */
                    box-sizing: border-box;
                }

                /* Make the rendered QR svg responsive to the wrapper */
                .qr-wrap svg {
                    width: 100% !important;
                    height: auto !important;
                    display: block;
                }

                .name {
                    font-size: 18px;
                    font-weight: 700;
                    margin-top: 8px;
                    word-break: break-word;
                }
                .ticket {
                    font-size: 13px;
                    color: #444;
                    margin-top: 4px;
                }
                .order-no {
                    font-size: 11px;
                    color: #666;
                    margin-top: 6px;
                    word-break: break-word;
                }
                .print-button {
                    padding: 8px 16px;
                    margin-top: 8px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }

                /* Ensure the badge prints as a single unit and is not split across pages */
                .badge, .qr-wrap { page-break-inside: avoid; -webkit-print-color-adjust: exact; }
            `}</style>

            <div className="badge" role="document" aria-label="Event badge">
                <div style={{ width: '100%' }}>
                    <div style={{ fontSize: 12, color: '#888' }}>Future Tech Addis Expo</div>

                    <div className="qr-wrap" style={{ marginTop: 10 }}>
                        {/* Using size large but wrapper will scale svg to available width to avoid clipping/cutoff */}
                        {orderNo && <QRCode value={String(orderNo)} size={300} />}
                    </div>

                    <div className="name">{name ?? 'Attendee'}</div>
                    <div className="ticket">{ticket ? `Ticket: ${ticket}` : 'Ticket: Event'}</div>
                    <div className="order-no">Code: {orderNo ?? 'N/A'}</div>
                </div>

                <div style={{ width: '100%' }}>
                    <div style={{ fontSize: 12, color: '#666' }}>Please present this badge at the entrance</div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                        <button className="print-button no-print" onClick={() => window.print()}>Print</button>
                        <a className="no-print" href="/" style={{ alignSelf: 'center', color: '#0070f3' }}>Close</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintQRPage;

