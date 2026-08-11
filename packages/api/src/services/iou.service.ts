import { FastifyInstance } from 'fastify';

/**
 * Generate IOU HTML document
 * @param app Fastify instance
 * @param loanId Loan ID
 * @returns Promise resolving to IOU HTML string
 */
export async function generateIOUHtml(app: FastifyInstance, loanId: string): Promise<string> {
  // Get loan with related data
  const loan = await app.db.loan.findUnique({
    where: {
      id: loanId
    },
    include: {
      lender: true,
      borrower: true
    }
  });
  
  if (!loan) {
    throw new Error('Loan not found');
  }
  
  // Generate human-readable IOU ID
  const iouId = `IOU-${new Date().getFullYear()}-${loan.id.substring(0, 6).toUpperCase()}`;
  
  // Format dates
  const dueDateFormatted = new Date(loan.dueDate).toLocaleDateString();
  const createdDateFormatted = new Date(loan.createdAt).toLocaleDateString();
  
  // Generate HTML template
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>IOU - ${iouId}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .iou-container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #333;
            margin: 0;
        }
        .iou-id {
            font-size: 18px;
            color: #666;
            margin-top: 10px;
        }
        .party-section {
            margin-bottom: 30px;
        }
        .party-section h3 {
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        .party-details {
            margin-left: 20px;
        }
        .loan-details {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .detail-label {
            font-weight: bold;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #e74c3c;
        }
        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 45%;
            border-top: 1px solid #333;
            padding-top: 10px;
            text-align: center;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="iou-container">
        <div class="header">
            <h1>IOU AGREEMENT</h1>
            <div class="iou-id">${iouId}</div>
        </div>
        
        <div class="loan-details">
            <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="amount">$${Number(loan.amount).toFixed(2)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Currency:</span>
                <span>${loan.currency}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Purpose:</span>
                <span>${loan.purpose}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Due Date:</span>
                <span>${dueDateFormatted}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Created Date:</span>
                <span>${createdDateFormatted}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span>${loan.status}</span>
            </div>
        </div>
        
        <div class="party-section">
            <h3>Lender</h3>
            <div class="party-details">
                <div><strong>Name:</strong> ${loan.lender.displayName || 'N/A'}</div>
                <div><strong>Phone:</strong> ${loan.lender.phone}</div>
            </div>
        </div>
        
        <div class="party-section">
            <h3>Borrower</h3>
            <div class="party-details">
                <div><strong>Name:</strong> ${loan.borrower.displayName || 'N/A'}</div>
                <div><strong>Phone:</strong> ${loan.borrower.phone}</div>
            </div>
        </div>
        
        <div class="signature-section">
            <div class="signature-box">
                Lender Signature
            </div>
            <div class="signature-box">
                Borrower Signature
            </div>
        </div>
        
        <div class="footer">
            This is a legally binding agreement between the parties mentioned above.
            Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </div>
    </div>
</body>
</html>
  `;
  
  return html;
}