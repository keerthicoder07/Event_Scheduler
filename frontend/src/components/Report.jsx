import { useState, useEffect } from 'react';
import api from '../api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function Report() {
    const [reportData, setReportData] = useState([]);
    const [dates, setDates] = useState({ start: '', end: '' });

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        // Construct query
        let query = '';
        if (dates.start && dates.end) {
            query = `?start=${dates.start}&end=${dates.end}`;
        }

        try {
            const res = await api.get(`/report${query}`);
            setReportData(res.data);
        } catch (err) {
            console.error("Failed to fetch report");
        }
    };

    const generatePDF = () => {
        try {
            const doc = new jsPDF();
            const date = new Date().toLocaleDateString();

            // Title
            doc.setFontSize(20);
            doc.setTextColor(40);
            doc.text("Resource Utilization Report", 14, 22);

            // Date
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Generated on: ${date}`, 14, 30);

            if (dates.start && dates.end) {
                doc.text(`Period: ${dates.start} to ${dates.end}`, 14, 36);
            }

            // Table
            const tableColumn = ["Resource", "Type", "Total Hours", "Booking Count"];
            const tableRows = [];

            reportData.forEach(row => {
                const rowData = [
                    row.resource_name,
                    row.resource_type,
                    row.total_hours,
                    row.bookings
                ];
                tableRows.push(rowData);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: dates.start ? 42 : 36,
                theme: 'grid',
                headStyles: { fillColor: [79, 70, 229] } // Indigo 600
            });

            doc.save(`report_${date.replace(/[\/\\]/g, '-')}.pdf`);
            console.log("PDF Generated and saved");
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("Failed to generate PDF. Check console for details.");
        }
    };

    return (
        <div className="card">
            <div className="flex-row justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <h3>Resource Utilization Report</h3>
                <button className="btn btn-primary" onClick={generatePDF} disabled={reportData.length === 0}>
                    Download PDF
                </button>
            </div>

            <div className="flex-row items-center" style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', alignItems: 'flex-end' }}>
                <div className="form-group mb-0" style={{ flex: 1 }}>
                    <label>From</label>
                    <input
                        type="date"
                        className="form-input"
                        value={dates.start}
                        onChange={e => setDates({ ...dates, start: e.target.value })}
                    />
                </div>
                <div className="form-group mb-0" style={{ flex: 1 }}>
                    <label>To</label>
                    <input
                        type="date"
                        className="form-input"
                        value={dates.end}
                        onChange={e => setDates({ ...dates, end: e.target.value })}
                    />
                </div>
                <button className="btn btn-primary" onClick={fetchReport}>
                    Generate Data
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Resource</th>
                            <th>Type</th>
                            <th>Total Hours</th>
                            <th>Booking Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row, idx) => (
                            <tr key={idx}>
                                <td>{row.resource_name}</td>
                                <td><span className="badge badge-gray">{row.resource_type}</span></td>
                                <td>{row.total_hours}</td>
                                <td>{row.bookings}</td>
                            </tr>
                        ))}
                        {reportData.length === 0 && (
                            <tr><td colSpan="4" className="text-subtle" style={{ textAlign: 'center' }}>No data available.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Report;
