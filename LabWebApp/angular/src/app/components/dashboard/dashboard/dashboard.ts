import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexDataLabels,
  ApexAxisChartSeries
} from 'ng-apexcharts';
import { ApiService, DashboardData } from '../../../services/api.service';

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  title: ApexTitleSubtitle;
};

export type TrendChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis?: ApexYAxis;
  stroke?: ApexStroke;
  dataLabels?: ApexDataLabels;
  title?: ApexTitleSubtitle;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {

  @Output() responseTTCReceived = new EventEmitter<any>();
  inputText: string = '';
  dashboardData?: DashboardData;
  loading: boolean = false;
  error?: string;

  // Pie chart
  pieChartOptions: PieChartOptions = {
    series: [],
    chart: { type: 'pie', height: 350 },
    labels: [],
    responsive: [
      { breakpoint: 480, options: { chart: { width: 300 }, legend: { position: 'bottom' } } }
    ],
    title: { text: 'Distribuzione Percentuale' }
  };

  // Bar chart trend
trendChartOptions: {
  series: { name: string; data: (number | null)[] }[];
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
} = {
  series: [],
  chart: { type: 'bar', height: 350 },
  xaxis: { categories: [] },
  yaxis: { },                     // sempre definito
  stroke: { show: true, width: 2 },
  dataLabels: { enabled: false },
  title: { text: 'Andamento nel tempo' }
};

// Line chart trend
lineChartOptions: {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
} = {
  series: [],
  chart: { type: 'line', height: 350 },
  xaxis: { categories: [] },
  yaxis: {},                     // sempre definito
  stroke: { show: true, width: 2 },
  dataLabels: { enabled: false },
  title: { text: 'Andamento nel tempo' }
};

  constructor(private apiService: ApiService) {}

  analyzeText() {
    if (!this.inputText.trim()) return;

    this.loading = true;
    this.error = undefined;

    this.apiService.extractDashboardData(this.inputText).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.updateCharts(data);
        this.loading = false;
        this.responseTTCReceived.emit(true);
      },
      error: () => {
        this.error = 'Errore chiamando il microservizio';
        this.loading = false;
      }
    });
  }

 private updateCharts(data: DashboardData) {
  // Pie chart
  this.pieChartOptions.series = data.chartData.map(d => d.value);
  this.pieChartOptions.labels = data.chartData.map(d => d.label);

  // Trend chart multipli
  if (data.trend && data.trend.length > 0) {
    // Ottieni tutte le date ordinate
    const categories = this.sortTimePeriods([...new Set(data.trend.map(t => t.time_period))]);

    // Raggruppa valori per prodotto
    const grouped: Record<string, number[]> = {};
    const products = [...new Set(data.trend.map(t => t.product))];

    for (const product of products) {
      grouped[product] = categories.map(cat => {
        const found = data?.trend?.find(t => t.product === product && t.time_period === cat);
        return found ? found.value : 0; // valore di default 0 se non trovato
      });
    }

    const series = Object.keys(grouped).map(product => ({
      name: product,
      data: grouped[product]
    }));

    // Aggiorna Bar chart
    this.trendChartOptions = {
      ...this.trendChartOptions,
      series,
      xaxis: { categories },
      yaxis: { min: 0 }, // garantisce sempre yaxis definito
      dataLabels: { enabled: true },
      stroke: { show: true, width: 2 },
      title: { text: 'Andamento nel tempo - Bar Chart' }
    };

    // Aggiorna Line chart
    this.lineChartOptions = {
      ...this.lineChartOptions,
      series,
      xaxis: { categories },
      yaxis: { min: 0 },
      dataLabels: { enabled: true },
      stroke: { show: true, width: 2 },
      title: { text: 'Andamento nel tempo - Line Chart' }
    };

  } else {
    // nessun trend disponibile
    this.trendChartOptions.series = [];
    this.lineChartOptions.series = [];
    this.trendChartOptions.xaxis = { categories: [] };
    this.lineChartOptions.xaxis = { categories: [] };
    this.trendChartOptions.yaxis = { min: 0 };
    this.lineChartOptions.yaxis = { min: 0 };
  }
}

private sortTimePeriods(periods: string[]): string[] {
  const toMonths = (p: string): number => {
    const s = p.toLowerCase().trim();

    if (s.includes("oggi")) return -1; // mettiamo oggi alla fine

    let months = 0;

    // Controllo anni
    const yearMatch = s.match(/(\d+)\s*anno/i);
    const yearsMatch = s.match(/(\d+)\s*anni/i);
    if (yearMatch) months = parseInt(yearMatch[1]) * 12;
    else if (yearsMatch) months = parseInt(yearsMatch[1]) * 12;

    // Controllo mesi
    const monthMatch = s.match(/(\d+)\s*mese/i);
    const monthsMatch = s.match(/(\d+)\s*mesi/i);
    if (monthMatch) months = parseInt(monthMatch[1]);
    else if (monthsMatch) months = parseInt(monthsMatch[1]);

    return months;
  };

  return periods.sort((a, b) => {
    const aMonths = toMonths(a);
    const bMonths = toMonths(b);

    if (aMonths === -1) return 1; // oggi sempre in fondo
    if (bMonths === -1) return -1;

    return bMonths - aMonths; // dal più lontano al più vicino
  });
}






}
