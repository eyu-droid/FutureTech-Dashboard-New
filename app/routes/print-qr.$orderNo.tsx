import QRCode from "react-qr-code";
import type { Route } from "../.react-router/types/app/routes/print-qr.$orderNo";

export async function clientLoader({ params, request }: Route.ClientLoaderArgs) {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    return { name, orderNo: params.orderNo };
}

const PrintQRPage = ({ loaderData }: Route.ComponentProps) => {
    const { name, orderNo } = loaderData;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                }
                .print-button {
                    padding: 10px 20px;
                    margin-top: 20px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                }
            `}</style>
            <h2>Hello {name},</h2>
            <p>Here is your QR code for the event. Please present this at the entrance.</p>
            {orderNo && <QRCode value={orderNo} size={256} />}
            <p>Thank you,</p>
            <p>The Future Tech Team</p>
            <button className="print-button no-print" onClick={() => window.print()}>Print</button>
        </div>
    );
};

export default PrintQRPage;

