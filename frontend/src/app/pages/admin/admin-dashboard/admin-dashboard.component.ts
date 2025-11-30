import { RouterLink } from "@angular/router"
import { ToastComponent } from "../../../shared/components/toast/toast.component"
import { Component, inject, ViewChild } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { AdminNavbarComponent } from "../components/admin-navbar/admin-navbar.component"
import { AuthService } from "../../../core/services/auth.service"
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTooltip,
  ApexFill,
  ApexLegend,
  ApexPlotOptions,
  ApexGrid,
} from "ng-apexcharts"

export type ChartOptions = {
  series: ApexAxisChartSeries | number[];
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  grid: ApexGrid;
  labels: string[];
  colors: string[];
};

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, AdminNavbarComponent, NgApexchartsModule, FormsModule, RouterLink, ToastComponent],
  templateUrl: "./admin-dashboard.component.html",
})
export class AdminDashboardComponent {
  private authService = inject(AuthService)

  selectedTab: 'communication' | 'loans' | 'benefits' = 'communication';

  // Date Picker Mock
  startDate: string = '2025-11-01';
  endDate: string = '2025-11-30';

  // Communication Charts - Removendo os ! para evitar erros de tipagem
  commFunnelChart: Partial<ChartOptions> = {};
  commPieChart: Partial<ChartOptions> = {};
  commLineChart: Partial<ChartOptions> = {};
  commBarChart: Partial<ChartOptions> = {};

  // Loans Charts - Removendo os ! para evitar erros de tipagem
  loansFunnelChart: Partial<ChartOptions> = {};
  loansBarChart: Partial<ChartOptions> = {};
  loansLineChart: Partial<ChartOptions> = {};
  loansAreaChart: Partial<ChartOptions> = {};

  // Benefits Charts - Removendo os ! para evitar erros de tipagem
  benefitsPieChart: Partial<ChartOptions> = {};
  benefitsFunnelChart: Partial<ChartOptions> = {};
  benefitsLineChart: Partial<ChartOptions> = {};
  benefitsBarChart: Partial<ChartOptions> = {};

  constructor() {
    this.initCommunicationCharts();
    this.initLoansCharts();
    this.initBenefitsCharts();
  }

  // Getters para garantir que sempre retornamos valores válidos
  get safeCommFunnelChart() {
    return {
      series: this.commFunnelChart.series ?? [],
      chart: this.commFunnelChart.chart ?? { type: 'bar', height: 350 },
      plotOptions: this.commFunnelChart.plotOptions ?? {},
      dataLabels: this.commFunnelChart.dataLabels ?? { enabled: true },
      title: this.commFunnelChart.title ?? { text: '' },
      xaxis: this.commFunnelChart.xaxis ?? { categories: [] },
      colors: this.commFunnelChart.colors ?? []
    };
  }

  get safeCommPieChart() {
    return {
      series: this.commPieChart.series ?? [],
      chart: this.commPieChart.chart ?? { type: 'donut', height: 350 },
      labels: this.commPieChart.labels ?? [],
      title: this.commPieChart.title ?? { text: '' },
      colors: this.commPieChart.colors ?? []
    };
  }

  get safeCommLineChart() {
    return {
      series: this.commLineChart.series ?? [],
      chart: this.commLineChart.chart ?? { type: 'line', height: 350 },
      stroke: this.commLineChart.stroke ?? {},
      title: this.commLineChart.title ?? { text: '' },
      xaxis: this.commLineChart.xaxis ?? { categories: [] },
      colors: this.commLineChart.colors ?? []
    };
  }

  get safeCommBarChart() {
    return {
      series: this.commBarChart.series ?? [],
      chart: this.commBarChart.chart ?? { type: 'bar', height: 350 },
      plotOptions: this.commBarChart.plotOptions ?? {},
      dataLabels: this.commBarChart.dataLabels ?? { enabled: true },
      title: this.commBarChart.title ?? { text: '' },
      xaxis: this.commBarChart.xaxis ?? { categories: [] },
      colors: this.commBarChart.colors ?? []
    };
  }

  get safeLoansFunnelChart() {
    return {
      series: this.loansFunnelChart.series ?? [],
      chart: this.loansFunnelChart.chart ?? { type: 'bar', height: 350 },
      plotOptions: this.loansFunnelChart.plotOptions ?? {},
      dataLabels: this.loansFunnelChart.dataLabels ?? { enabled: true },
      title: this.loansFunnelChart.title ?? { text: '' },
      xaxis: this.loansFunnelChart.xaxis ?? { categories: [] },
      colors: this.loansFunnelChart.colors ?? []
    };
  }

  get safeLoansBarChart() {
    return {
      series: this.loansBarChart.series ?? [],
      chart: this.loansBarChart.chart ?? { type: 'bar', height: 350 },
      title: this.loansBarChart.title ?? { text: '' },
      xaxis: this.loansBarChart.xaxis ?? { categories: [] },
      colors: this.loansBarChart.colors ?? []
    };
  }

  get safeLoansLineChart() {
    return {
      series: this.loansLineChart.series ?? [],
      chart: this.loansLineChart.chart ?? { type: 'line', height: 350 },
      stroke: this.loansLineChart.stroke ?? {},
      title: this.loansLineChart.title ?? { text: '' },
      xaxis: this.loansLineChart.xaxis ?? { categories: [] },
      colors: this.loansLineChart.colors ?? []
    };
  }

  get safeLoansAreaChart() {
    return {
      series: this.loansAreaChart.series ?? [],
      chart: this.loansAreaChart.chart ?? { type: 'area', height: 350 },
      stroke: this.loansAreaChart.stroke ?? {},
      dataLabels: this.loansAreaChart.dataLabels ?? { enabled: true },
      title: this.loansAreaChart.title ?? { text: '' },
      xaxis: this.loansAreaChart.xaxis ?? { categories: [] },
      colors: this.loansAreaChart.colors ?? []
    };
  }

  get safeBenefitsPieChart() {
    return {
      series: this.benefitsPieChart.series ?? [],
      chart: this.benefitsPieChart.chart ?? { type: 'pie', height: 350 },
      labels: this.benefitsPieChart.labels ?? [],
      title: this.benefitsPieChart.title ?? { text: '' },
      colors: this.benefitsPieChart.colors ?? []
    };
  }

  get safeBenefitsFunnelChart() {
    return {
      series: this.benefitsFunnelChart.series ?? [],
      chart: this.benefitsFunnelChart.chart ?? { type: 'bar', height: 350 },
      plotOptions: this.benefitsFunnelChart.plotOptions ?? {},
      dataLabels: this.benefitsFunnelChart.dataLabels ?? { enabled: true },
      title: this.benefitsFunnelChart.title ?? { text: '' },
      xaxis: this.benefitsFunnelChart.xaxis ?? { categories: [] },
      colors: this.benefitsFunnelChart.colors ?? []
    };
  }

  get safeBenefitsLineChart() {
    return {
      series: this.benefitsLineChart.series ?? [],
      chart: this.benefitsLineChart.chart ?? { type: 'line', height: 350 },
      stroke: this.benefitsLineChart.stroke ?? {},
      title: this.benefitsLineChart.title ?? { text: '' },
      xaxis: this.benefitsLineChart.xaxis ?? { categories: [] },
      colors: this.benefitsLineChart.colors ?? []
    };
  }

  get safeBenefitsBarChart() {
    return {
      series: this.benefitsBarChart.series ?? [],
      chart: this.benefitsBarChart.chart ?? { type: 'bar', height: 350 },
      title: this.benefitsBarChart.title ?? { text: '' },
      xaxis: this.benefitsBarChart.xaxis ?? { categories: [] },
      colors: this.benefitsBarChart.colors ?? []
    };
  }

  get currentUser() {
    return this.authService.currentUser()
  }

  setTab(tab: 'communication' | 'loans' | 'benefits') {
    this.selectedTab = tab;
  }

  showExportModal = false;
  exportFormat: 'CSV' | 'XML' | 'PDF' = 'CSV';

  exportData() {
    this.showExportModal = true;
  }

  closeExportModal() {
    this.showExportModal = false;
  }

  confirmExport() {
    this.closeExportModal();
  }

  onDateChange(event: any, type: 'start' | 'end') {
    if (type === 'start') this.startDate = event.target.value;
    else this.endDate = event.target.value;

    // Simulate data reload
    console.log(`Reloading data for period: ${this.startDate} to ${this.endDate}`);
    // In a real app, you would call the API here
  }

  private initCommunicationCharts() {
    // Mock data scaled for ~400 associates
    // Assuming active engagement from a portion of the 400 associates
    this.commFunnelChart = {
      series: [
        {
          name: "Funil",
          data: [380, 350, 290, 180] // Scaled down: Sent to almost all, Received, Read, Clicked
        }
      ],
      chart: {
        type: "bar",
        height: 350,
      },
      plotOptions: {
        bar: {
          borderRadius: 0,
          horizontal: true,
          barHeight: '80%',
          isFunnel: true,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opt) {
          return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val
        },
        dropShadow: { enabled: true },
      },
      title: { text: "Funil de Conversão (Novembro 2025)", align: 'left' },
      xaxis: {
        categories: ["Enviado", "Recebido", "Lido", "Clicado"],
      },
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560'],
      legend: { show: false }
    };

    this.commPieChart = {
      series: [120, 80, 60, 90, 50], // Total ~400 interactions
      chart: { type: "donut", height: 350 },
      labels: ["Atualização Cadastral", "Benefícios Sociais", "Convênios Médicos", "Eventos", "Empréstimos"],
      title: { text: "Ranking de Temas por Cliques", align: 'left' },
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0'],
    };

    this.commLineChart = {
      series: [
        { name: "Enviado", data: [25, 30, 28, 35, 40, 38, 42, 45, 30, 25, 35, 40, 38, 42, 45] },
        { name: "Lido", data: [20, 25, 22, 28, 32, 30, 35, 38, 25, 20, 28, 32, 30, 35, 38] },
        { name: "Clicado", data: [10, 12, 15, 18, 20, 18, 22, 25, 15, 10, 18, 20, 18, 22, 25] }
      ],
      chart: { type: "line", height: 350, toolbar: { show: false } },
      stroke: { curve: "smooth", width: 3 },
      title: { text: "Linha do Tempo - Últimos 15 Dias", align: 'left' },
      xaxis: { categories: ["01/11", "03/11", "05/11", "07/11", "09/11", "11/11", "13/11", "15/11", "17/11", "19/11", "21/11", "23/11", "25/11", "27/11", "29/11"] },
      colors: ['#008FFB', '#00E396', '#FF4560'],
    };

    this.commBarChart = {
      series: [
        { name: "Enviado", data: [25, 30, 28, 35, 40, 38, 42, 45, 30, 25, 35, 40, 38, 42, 45] },
        { name: "Lido", data: [20, 25, 22, 28, 32, 30, 35, 38, 25, 20, 28, 32, 30, 35, 38] }
      ],
      chart: { type: "bar", height: 350, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
      dataLabels: { enabled: false },
      title: { text: "Comparação: Enviados vs Lidos", align: 'left' },
      xaxis: { categories: ["01/11", "03/11", "05/11", "07/11", "09/11", "11/11", "13/11", "15/11", "17/11", "19/11", "21/11", "23/11", "25/11", "27/11", "29/11"] },
      colors: ['#008FFB', '#00E396'],
    };
  }

  private initLoansCharts() {
    // Mock data for loans - 400 associates
    this.loansFunnelChart = {
      series: [
        { name: "Funil", data: [150, 120, 85, 35] } // Simulations, Responses, Accepted, Rejected/Pending
      ],
      chart: { type: "bar", height: 350 },
      plotOptions: {
        bar: { borderRadius: 0, horizontal: true, barHeight: '80%', isFunnel: true },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opt) { return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val },
        dropShadow: { enabled: true },
      },
      title: { text: "Funil de Conversão", align: 'left' },
      xaxis: { categories: ["Simulações", "Análises", "Aprovadas", "Reprovadas"] },
      colors: ['#008FFB', '#FEB019', '#00E396', '#FF4560'],
    };

    this.loansBarChart = {
      series: [
        { name: "Aprovadas", data: [5, 8, 6, 9, 7, 10, 8, 12, 9, 11] },
        { name: "Reprovadas", data: [2, 3, 2, 1, 3, 2, 4, 1, 2, 3] }
      ],
      chart: { type: "bar", height: 350, stacked: false },
      title: { text: "Aprovadas vs Reprovadas - Últimos 10 Dias", align: 'left' },
      xaxis: { categories: ["20/11", "21/11", "22/11", "23/11", "24/11", "25/11", "26/11", "27/11", "28/11", "29/11"] },
      colors: ['#00E396', '#FF4560'],
    };

    this.loansLineChart = {
      series: [
        { name: "Simulações", data: [12, 15, 10, 18, 14, 20, 16, 22, 18, 25, 20, 28, 24, 30, 28] },
        { name: "Análises", data: [10, 12, 8, 15, 12, 18, 14, 20, 16, 22, 18, 25, 22, 28, 26] },
        { name: "Aprovadas", data: [8, 10, 6, 12, 10, 15, 12, 18, 14, 20, 16, 22, 20, 25, 24] }
      ],
      chart: { type: "line", height: 350, toolbar: { show: false } },
      stroke: { curve: "smooth", width: 3 },
      title: { text: "Evolução das Simulações", align: 'left' },
      xaxis: { categories: ["15/11", "16/11", "17/11", "18/11", "19/11", "20/11", "21/11", "22/11", "23/11", "24/11", "25/11", "26/11", "27/11", "28/11", "29/11"] },
      colors: ['#008FFB', '#FEB019', '#00E396'],
    };

    this.loansAreaChart = {
      series: [
        { name: "Simulações", data: [12, 15, 10, 18, 14, 20, 16, 22, 18, 25, 20, 28, 24, 30, 28] },
        { name: "Aprovadas", data: [8, 10, 6, 12, 10, 15, 12, 18, 14, 20, 16, 22, 20, 25, 24] },
        { name: "Reprovadas", data: [2, 3, 2, 4, 2, 3, 2, 2, 2, 3, 2, 4, 2, 3, 2] }
      ],
      chart: { type: "area", height: 350, toolbar: { show: false } },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      title: { text: "Tendências Acumuladas", align: 'left' },
      xaxis: { categories: ["15/11", "16/11", "17/11", "18/11", "19/11", "20/11", "21/11", "22/11", "23/11", "24/11", "25/11", "26/11", "27/11", "28/11", "29/11"] },
      colors: ['#008FFB', '#00E396', '#FF4560'],
    };
  }

  private initBenefitsCharts() {
    // Mock data for benefits - 400 associates
    this.benefitsPieChart = {
      series: [75, 25], // Percentage
      chart: { type: "pie", height: 350 },
      labels: ["Concedidos", "Negados"],
      title: { text: "Status das Solicitações", align: 'left' },
      colors: ['#00E396', '#FF4560'],
    };

    this.benefitsFunnelChart = {
      series: [
        { name: "Funil", data: [280, 250, 210] } // Requests, Analyzed, Granted
      ],
      chart: { type: "bar", height: 350 },
      plotOptions: {
        bar: { borderRadius: 0, horizontal: true, barHeight: '80%', isFunnel: true },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opt) { return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val },
        dropShadow: { enabled: true },
      },
      title: { text: "Funil de Solicitações", align: 'left' },
      xaxis: { categories: ["Solicitadas", "Analisadas", "Concedidas"] },
      colors: ['#008FFB', '#FEB019', '#00E396'],
    };

    this.benefitsLineChart = {
      series: [
        { name: "Solicitadas", data: [15, 18, 12, 20, 16, 22, 18, 25, 20, 28, 22, 30, 26, 32, 30] },
        { name: "Concedidas", data: [12, 15, 10, 16, 14, 18, 15, 20, 16, 22, 18, 25, 22, 28, 26] },
        { name: "Negadas", data: [3, 3, 2, 4, 2, 4, 3, 5, 4, 6, 4, 5, 4, 4, 4] }
      ],
      chart: { type: "line", height: 350, toolbar: { show: false } },
      stroke: { curve: "smooth", width: 3 },
      title: { text: "Histórico de Solicitações", align: 'left' },
      xaxis: { categories: ["15/11", "16/11", "17/11", "18/11", "19/11", "20/11", "21/11", "22/11", "23/11", "24/11", "25/11", "26/11", "27/11", "28/11", "29/11"] },
      colors: ['#008FFB', '#00E396', '#FF4560'],
    };

    this.benefitsBarChart = {
      series: [
        { name: "Concedidas", data: [45, 52, 48, 65] },
        { name: "Negadas", data: [10, 12, 15, 18] }
      ],
      chart: { type: "bar", height: 350 },
      title: { text: "Evolução Mensal (Últimos 4 Meses)", align: 'left' },
      xaxis: { categories: ["Ago", "Set", "Out", "Nov"] },
      colors: ['#00E396', '#FF4560'],
    };
  }
}
