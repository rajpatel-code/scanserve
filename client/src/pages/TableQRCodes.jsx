import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TABLES = Array.from({ length: 20 }, (_, i) => i + 1);

export default function TableQRCodes() {
  const navigate = useNavigate();

  const getQRValue = (tableNumber) => {
    return `${window.location.origin}/menu?table=${tableNumber}`;
  };

  const downloadQR = (tableNumber) => {
    const canvas = document.getElementById(`qr-table-${tableNumber}`);

    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `Raj-Cafe-Table-${tableNumber}-QR.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const printQR = (tableNumber) => {
    const canvas = document.getElementById(`qr-table-${tableNumber}`);

    if (!canvas) return;

    const image = canvas.toDataURL("image/png");

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Raj Cafe - Table ${tableNumber} QR</title>
          <style>
            body {
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
              text-align: center;
            }

            .qr-card {
              padding: 40px;
              border: 2px solid #eee;
              border-radius: 20px;
            }

            img {
              width: 300px;
              height: 300px;
            }

            h1 {
              margin-bottom: 10px;
            }

            p {
              color: #666;
              font-size: 18px;
            }
          </style>
        </head>

        <body>
          <div class="qr-card">
            <h1>Raj Cafe</h1>
            <h2>Table ${tableNumber}</h2>
            <img src="${image}" />
            <p>Scan QR to Order</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Table QR Codes
              </h1>

              <p className="text-slate-500 mt-1">
                Generate QR codes for restaurant tables
              </p>
            </div>

            <button
              onClick={() => navigate("/admin")}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>

          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
          <h2 className="font-bold text-blue-900 text-lg">
            How it works
          </h2>

          <p className="text-blue-800 mt-1">
            Each table has a unique QR code. When a customer scans it,
            they will open the restaurant menu with that table number.
          </p>
        </div>

        {/* QR Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {TABLES.map((tableNumber) => (

            <div
              key={tableNumber}
              className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col items-center"
            >

              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Table {tableNumber}
              </h2>

              <div className="bg-white p-4 rounded-xl border mb-4">
                <QRCodeCanvas
                  id={`qr-table-${tableNumber}`}
                  value={getQRValue(tableNumber)}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>

              <p className="text-sm text-slate-500 text-center mb-4 break-all">
                {getQRValue(tableNumber)}
              </p>

              <div className="flex gap-2 w-full">

                <button
                  onClick={() => downloadQR(tableNumber)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700"
                >
                  <Download size={17} />
                  Download
                </button>

                <button
                  onClick={() => printQR(tableNumber)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white py-2.5 rounded-xl font-semibold hover:bg-slate-900"
                >
                  <Printer size={17} />
                  Print
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>
    </div>
  );
}