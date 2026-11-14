
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export default function OrderPrintView({ order }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!order || !mounted) return null;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const formatDate = (date) =>
    new Date(`${date}T12:00:00`).toLocaleDateString("en-US");

  return createPortal(
    <article className="order-print-view">

      {/* =================================
          COMPANY HEADER
      ================================= */}

      <header className="print-header">

        <div className="print-brand">
          <Image
            src="/logos/greenLogoTractor.png"
            alt="Pleasant Grove Farms"
            width={185}
            height={135}
            priority
          />

          <div>
            <h1>PLEASANT GROVE FARMS</h1>
            <p>Business Management System</p>
          </div>
        </div>

        <div className="print-document-title">
          <span className="print-document-label">
            INTERNAL DOCUMENT
          </span>

          <h2>ORDER SUMMARY</h2>

          <div className="print-order-number">
            ORDER #{order.id}
          </div>
        </div>

      </header>


      {/* =================================
          ORDER AND CUSTOMER INFORMATION
      ================================= */}

      <div className="print-details-grid">

        {/* Order Information */}

        <section className="print-info-card">

          <div className="print-card-heading">
            ORDER INFORMATION
          </div>

          <div className="print-card-content">

            <div className="print-field">
              <span>Order Number</span>
              <strong>#{order.id}</strong>
            </div>

            <div className="print-field">
              <span>Order Date</span>
              <strong>{formatDate(order.orderDate)}</strong>
            </div>

            <div className="print-field">
              <span>Purchase Order</span>
              <strong>{order.poNumber || "—"}</strong>
            </div>

            <div className="print-field">
              <span>Invoice Number</span>
              <strong>
                {order.invoiceNumber || "Not Invoiced"}
              </strong>
            </div>

          </div>

        </section>


        {/* Customer Information */}

        <section className="print-info-card">

          <div className="print-card-heading">
            CUSTOMER INFORMATION
          </div>

          <div className="print-card-content">

            <div className="print-customer-name">
              {order.customer}
            </div>

            <div className="print-field">
              <span>Customer ID</span>
              <strong>{order.customerId}</strong>
            </div>

          </div>

        </section>

      </div>


      {/* =================================
          ORDER FINANCIAL SUMMARY
      ================================= */}

      <section className="print-financial-section">

        <div className="print-financial-heading">
          ORDER FINANCIAL SUMMARY
        </div>

        <div className="print-total-panel">

          <div>
            <span>Total Order Cost</span>
            <p>Amount recorded for this order</p>
          </div>

          <strong>
            {formatCurrency(order.total)}
          </strong>

        </div>

      </section>


      {/* =================================
          INTERNAL NOTES AREA
      ================================= */}

      <section className="print-notes-section">

        <h3>ORDER NOTES</h3>

        <div className="print-notes-box">
          {/* Reserved for future order notes */}
        </div>

      </section>


      {/* =================================
          DOCUMENT FOOTER
      ================================= */}

      <footer className="print-footer">

        <div>
          <strong>PLEASANT GROVE FARMS</strong>
          <span>Internal Business Record</span>
        </div>

        <div>
          Order #{order.id}
        </div>

      </footer>

    </article>,

    document.body
  );
}
