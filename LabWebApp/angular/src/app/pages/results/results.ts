import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-results',
  imports: [CommonModule,RouterLink],
  templateUrl: './results.html',
  styleUrl: './results.scss'
})
export class Results {

  showDashboard = false;
  nomeServizio:string='';
  serviceName?: string;

  constructor(private route: ActivatedRoute) {
    this.serviceName = this.route.snapshot.queryParamMap.get('service') || undefined;
  }

  aiResult = 'Testo generato dal servizio AI...';

  stats = [
    { name: 'Numero parole', value: 123 },
    { name: 'Parole chiave', value: 'Angular, AI, WebApp' },
    { name: 'Percentuale di accuratezza', value: '95%' }
  ];

  toggleView() {
    this.showDashboard = !this.showDashboard;
  }


}
