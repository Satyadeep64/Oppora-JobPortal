export const formatInterviewDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    if (typeof dateString === "string" && dateString.includes("-")) {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric"
          });
        }
      }
    }
    return String(dateString);
  }
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

export const formatInterviewTime = (dateString) => {
  if (!dateString) return "N/A";
  if (typeof dateString === "string" && (dateString.includes("AM") || dateString.includes("PM"))) {
    return dateString;
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return String(dateString);
  }
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const extractGoogleMeetId = (url) => {
  if (!url) return "N/A";
  const match = url.match(/meet\.google\.com\/([a-z0-9\-]+)/i);
  if (match && match[1]) {
    return match[1];
  }
  const clean = url.trim().replace(/\/$/, "");
  const parts = clean.split("/");
  return parts[parts.length - 1] || url;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    return false;
  }
};

// Advanced Export Utilities: CSV Export
export const exportToCSV = (interviews, filename = "Interview_Report.csv") => {
  if (!interviews || interviews.length === 0) {
    alert("No interview records available to export.");
    return;
  }

  const headers = ["ID", "Candidate Name", "Candidate Email", "Job Role", "Company", "Status", "Scheduled Date", "Scheduled Time", "Meeting URL"];
  const rows = interviews.map((i) => {
    const round = i.rounds?.[0] || {};
    const startTime = round.scheduledTime ? new Date(round.scheduledTime) : null;

    return [
      i.id,
      `"${i.candidateName || ''}"`,
      `"${i.candidateEmail || ''}"`,
      `"${i.opportunityTitle || ''}"`,
      `"${i.companyName || ''}"`,
      `"${i.overallStatus || ''}"`,
      `"${startTime ? startTime.toLocaleDateString() : 'N/A'}"`,
      `"${startTime ? startTime.toLocaleTimeString() : 'N/A'}"`,
      `"${round.meetingDetails?.meetingUrl || ''}"`
    ];
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Advanced Export Utilities: PDF / Printable Export
export const exportToPDF = (interviews, title = "Interview Dashboard Master Report") => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const rowsHtml = interviews.map(i => {
    const round = i.rounds?.[0] || {};
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>${i.candidateName}</strong><br/><span style="color:#64748b; font-size:12px;">${i.candidateEmail}</span></td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${i.opportunityTitle}<br/><span style="color:#64748b; font-size:12px;">${i.companyName}</span></td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${round.title || 'Round 1'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><span style="padding: 4px 8px; border-radius: 6px; font-weight: bold; background: #e0e7ff; color: #3730a3;">${i.overallStatus}</span></td>
      </tr>
    `;
  }).join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 30px; color: #0f172a; }
        .header { border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: 800; color: #4f46e5; margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
        th { background: #f8fafc; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">${title}</h1>
        <p style="color: #64748b; margin: 5px 0 0 0;">Generated on ${new Date().toLocaleString()} | Total Records: ${interviews.length}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Role & Company</th>
            <th>Round Title</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
};
