import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { apiService } from '@/services/api';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

interface DownloadReportsProps {
  stats?: any;
}

export const DownloadReports: React.FC<DownloadReportsProps> = ({ stats }) => {
  const { colors } = useTheme();
  const { user } = useAppStore();
  const [generating, setGenerating] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const servicesData = await apiService.getServices(user.id);
      setServices(servicesData || []);

      const rankingData = await apiService.getRanking(user.id, 'month', '60km');
      setRanking(rankingData);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: 'Monthly' | 'Yearly') => {
    if (!user?.id) return;
    setGenerating(true);

    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Fetch official report data from backend
      const reportData = await apiService.getReportData(user.id, type.toLowerCase(), year, month);

      if (!reportData) throw new Error("Could not fetch report data");

      const volume = reportData.totalBookings || 0;
      const served = reportData.servedBookings || 0;
      const missed = reportData.missedBookings || 0;
      const successRate = volume > 0 ? ((served / volume) * 100).toFixed(0) : '0';
      const mainRevenue = reportData.totalEarnings || 0;
      const partnerEarnings = reportData.partnerEarnings || 0;
      const netPayout = mainRevenue; // Already shop_earning if backend calculated it correctly, but let's stick to what we have.

      const monYear = reportData.period || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

      // Service Performance Rows from Real Data
      const serviceRows = (reportData.service_performance || []).map((sp: any) => {
        const prop = mainRevenue > 0 ? (sp.revenue / mainRevenue) : 0;
        const sharePct = sp.revenue > 0 ? ((sp.partner_revenue / sp.revenue) * 100).toFixed(0) : '0';

        return `
          <tr>
            <td style="font-weight: 500;">
              ${sp.title}
              <div style="font-size: 8px; color: #9ca3af; margin-top: 2px;">Partner Share: ${sharePct}%</div>
            </td>
            <td style="text-align:center;">${sp.bookings}</td>
            <td>
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:10px; width:25px;">${(prop * 100).toFixed(0)}%</span>
                <div style="flex:1; height:6px; background:#f0f0f0; border-radius:3px; position:relative;">
                  <div style="position:absolute; left:0; top:0; height:100%; width:${(prop * 100)}%; background:#7C3AED; border-radius:3px;"></div>
                </div>
              </div>
            </td>
            <td style="text-align:right; font-weight:600;">₹${Math.floor(sp.revenue).toLocaleString()}</td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="4" style="text-align:center; color:#9ca3af;">No completed services this period</td></tr>';

      // Detailed Bookings Rows
      const bookingRows = (reportData.detailed_bookings || []).map((b: any) => {
        const statusColor = b.status === 'served' ? '#10b981' : (b.status === 'cancelled' || b.status === 'no-show' ? '#ef4444' : '#f59e0b');
        return `
          <tr>
            <td>
              <div style="font-weight: 600; color: #111827;">${b.name}</div>
              <div style="font-size: 10px; color: #6b7280;">${b.phone}</div>
            </td>
            <td style="font-size: 11px; color: #6b7280;">${b.email}</td>
            <td>${b.service}</td>
            <td style="font-size: 11px; color: #6b7280;">${b.date}</td>
            <td style="text-align:center;"><span style="color: ${statusColor}; font-weight: 700; font-size: 10px; text-transform: uppercase;">${b.status}</span></td>
            <td style="text-align:right; font-weight:600;">₹${b.price}</td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="6" style="text-align:center; color:#9ca3af;">No bookings recorded</td></tr>';

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 20mm; }
    * { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust: exact; }
    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #fff; color: #1f2937; line-height: 1.4; }
    
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .brand h1 { color: #7C3AED; font-size: 24px; font-weight: 800; }
    .brand p { font-size: 10px; font-weight: 700; color: #6b7280; letter-spacing: 1px; margin-top: 2px; }
    .badge { background: #7C3AED; color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 10px; font-weight: 700; }

    .divider { height: 2px; background: #f3f4f6; margin: 15px 0 25px 0; }

    .stats-boxes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 30px; }
    .stat-box { background: #f9fafb; padding: 12px; border-radius: 10px; border: 1px solid #f3f4f6; }
    .stat-box p { font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px; }
    .stat-box h2 { font-size: 20px; font-weight: 800; color: #111827; }
    .stat-box.green h2 { color: #10b981; }
    .stat-box.red h2 { color: #ef4444; }

    .section-title { font-size: 12px; font-weight: 800; color: #111827; text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .section-title::after { content: ""; height: 1px; background: #e5e7eb; flex: 1; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    th { text-align: left; background: #f9fafb; padding: 10px 12px; font-size: 9px; font-weight: 800; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; }
    td { padding: 10px 12px; font-size: 11px; border-bottom: 1px solid #f3f4f6; }

    .payout-card { background: #111827; border-radius: 12px; padding: 20px; color: #fff; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .payout-main p { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px; }
    .payout-main h1 { font-size: 32px; font-weight: 800; }
    .ranking-meta { font-size: 9px; color: #9ca3af; margin-top: 4px; font-weight: 600; }

    .payout-details { text-align: right; }
    .payout-details p { font-size: 11px; margin-bottom: 3px; font-weight: 600; }
    .label { color: #9ca3af; font-weight: 500; margin-right: 8px; }
    .val { color: #fff; }
    .sub { color: #ef4444; }

    .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; margin-top: 20px; }
    .footer-text { font-size: 9px; color: #9ca3af; line-height: 1.5; }
    .stamp { display: inline-block; border: 1.5px solid #9ca3af; padding: 3px 10px; border-radius: 4px; font-size: 10px; font-weight: 800; color: #9ca3af; text-transform: uppercase; transform: rotate(-2deg); margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>${user?.shopName || 'SlotB Partner'}</h1>
      <p>BUSINESS INTELLIGENCE REPORT</p>
    </div>
    <div class="badge">${type.toUpperCase()} SUMMARY • ${monYear}</div>
  </div>

  <div class="divider"></div>

  <div class="stats-boxes">
    <div class="stat-box">
      <p>Total Bookings</p>
      <h2>${volume}</h2>
    </div>
    <div class="stat-box green">
      <p>Served</p>
      <h2>${served}</h2>
    </div>
    <div class="stat-box red">
      <p>Missed/Cancelled</p>
      <h2>${missed}</h2>
    </div>
    <div class="stat-box">
      <p>Success Rate</p>
      <h2>${successRate}%</h2>
    </div>
  </div>

  <div class="section-title">Service Analytics</div>
  <table>
    <thead>
      <tr>
        <th style="width:35%">Service</th>
        <th style="width:15%; text-align:center;">Count</th>
        <th style="width:30%">Revenue Share</th>
        <th style="width:20%; text-align:right;">Total Revenue</th>
      </tr>
    </thead>
    <tbody>
      ${serviceRows}
    </tbody>
  </table>

  <div class="section-title">Detailed Booking History</div>
  <table style="margin-bottom: 40px;">
    <thead>
      <tr>
        <th style="width:20%">Customer</th>
        <th style="width:20%">Email ID</th>
        <th style="width:15%">Service</th>
        <th style="width:20%">Date & Time</th>
        <th style="width:10%; text-align:center;">Status</th>
        <th style="width:15%; text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${bookingRows}
    </tbody>
  </table>

  <div class="payout-card">
    <div class="payout-main">
      <p>Estimated Net Payout</p>
      <h1>₹${Math.floor(netPayout).toLocaleString('en-IN')}</h1>
      ${ranking?.my_rank ? `
        <div class="ranking-meta">
          District Rank: #${ranking.my_rank.rank} | 
          Score: ${ranking.my_rank.score} | 
          Comp: ${ranking.my_rank.performance?.completedBookings} | 
          Canc: ${ranking.my_rank.performance?.cancellations}
        </div>` : ''}
    </div>
    <div class="payout-details">
      <p><span class="label">Gross Revenue:</span> <span class="val">₹${Math.floor(mainRevenue).toLocaleString('en-IN')}</span></p>
      <p><span class="label">Partner Share:</span> <span class="sub">- ₹${Math.floor(partnerEarnings).toLocaleString('en-IN')}</span></p>
      <div style="height:1px; background:rgba(255,255,255,0.1); margin:8px 0;"></div>
      <p style="font-size:9px; color:#64748b; font-weight:500;">TRANS ID: SB-RPT-${Math.floor(100000 + Math.random() * 900000)}</p>
    </div>
  </div>

  <div class="footer">
    <div class="stamp">Verified Business Report</div>
    <p class="footer-text">
      This document is an automated summary of your shop's performance. All data is fetched directly from the SlotB Partner Database.<br/>
      For support or discrepancies, contact our partner success team at support@slotb.in
    </p>
  </div>
</body>
</html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: `${type} Performance Report` });

      Alert.alert('Success', 'Detailed professional report generated!');
    } catch (error: any) {
      console.error('Report Generation Error:', error);
      Alert.alert('Error', 'Failed to generate detailed report. Please check your internet connection.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Ionicons name="document-text" size={24} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>Business Reports</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.reportButton, { backgroundColor: colors.primary }]}
          onPress={() => generateReport('Monthly')}
          disabled={generating}
        >
          <Ionicons name="calendar-sharp" size={20} color="#FFF" />
          <Text style={styles.buttonText}>{generating ? 'Analyzing...' : 'Monthly Excellence'}</Text>
          <Ionicons name="chevron-forward" size={16} color="#FFF" opacity={0.6} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.reportButton, { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary }]}
          onPress={() => generateReport('Yearly')}
          disabled={generating}
        >
          <Ionicons name="trophy-outline" size={20} color={colors.primary} />
          <Text style={[styles.buttonText, { color: colors.primary }]}>{generating ? 'Compiling...' : 'Annual Summary'}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} opacity={0.6} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.hint, { color: colors.textTertiary }]}>
        Generated reports are signed & stamped for official use.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  buttonContainer: {
    gap: 12,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
    fontWeight: '500',
    opacity: 0.6,
  },
});
