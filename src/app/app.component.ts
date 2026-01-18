import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface CategorySnapshot {
  name: string;
  limit: string;
  spent: string;
  remaining: string;
  status: 'normal' | 'atenção' | 'estourado';
  progress: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  monthLabel = 'Outubro 2024';
  monthlyBudget = 'R$ 8.500';
  totalRemaining = 'R$ 3.280';
  dailyPace = 'R$ 172 / dia';
  projectedEnd = 'R$ 5.210';

  categories: CategorySnapshot[] = [
    {
      name: 'Mercado',
      limit: 'R$ 1.800 (21%)',
      spent: 'R$ 1.240',
      remaining: 'R$ 560',
      status: 'atenção',
      progress: 69
    },
    {
      name: 'Lazer',
      limit: 'R$ 850 (10%)',
      spent: 'R$ 930',
      remaining: '-R$ 80',
      status: 'estourado',
      progress: 110
    },
    {
      name: 'Transporte',
      limit: 'R$ 680 (8%)',
      spent: 'R$ 520',
      remaining: 'R$ 160',
      status: 'normal',
      progress: 76
    }
  ];
}
