import { Component } from '@angular/core';
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

export type BarChartOptions = {
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
      {
        breakpoint: 480,
        options: { chart: { width: 300 }, legend: { position: 'bottom' } }
      }
    ],
    title: { text: 'Distribuzione Percentuale' }
  };

  // Bar chart (trend)
 trendChartOptions: {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
} = {
  series: [],
  chart: { type: 'bar', height: 350 },
  xaxis: { categories: [] },
  yaxis: { },
  stroke: { show: true, width: 2 },        // valore di default garantito
  dataLabels: { enabled: false },          // valore di default garantito
  title: { text: 'Andamento nel tempo' }   // valore di default garantito
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
      },
      error: (err) => {
        this.error = 'Errore chiamando il microservizio';
        this.loading = false;
      }
    });
  }

  private updateCharts(data: DashboardData) {
  // Pie chart
  this.pieChartOptions = {
    ...this.pieChartOptions,
    series: data.chartData.map(d => d.value),
    labels: data.chartData.map(d => d.label)
  };

  // Trend chart
  if (data.trend && data.trend.length > 0) {
    // Se trend è un array di oggetti { product, value, time_period }
    const firstProduct = data.trend[0].product; // prendiamo il nome del prodotto
    const categories = data.trend.map(t => t.time_period || ''); // asse X
    const values = data.trend.map(t => t.value); // asse Y

    this.trendChartOptions = {
      ...this.trendChartOptions,
      series: [{ name: firstProduct, data: values }],
      xaxis: { categories },
      dataLabels: { enabled: true },
      stroke: { show: true, width: 2 },
      title: { text: `Andamento nel tempo di ${firstProduct}` }
    };
  } else {
    // nessun trend disponibile
    this.trendChartOptions = {
      ...this.trendChartOptions,
      series: [],
      xaxis: { categories: [] },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2 },
      title: { text: '' }
    };
  }
}

}
