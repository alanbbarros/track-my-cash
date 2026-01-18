import { Component } from '@angular/core';

interface CategorySnapshot {
  name: string;
  limit: string;
  spent: string;
  remaining: string;
  status: 'Normal' | 'Atenção' | 'Estourada';
  progress: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  monthLabel = 'Outubro 2024';
  monthlyBudget = 'R$ 8.500';
  totalRemaining = 'R$ 3.280';
  dailyPace = 'R$ 172 / dia';
  projectedEnd = 'R$ 5.210';

  highlights = [
    {
      title: 'Impacto imediato',
      description: 'Lançamentos entram no mês da compra, não da cobrança.'
    },
    {
      title: 'Consciência por categoria',
      description: 'Alertas suaves mostram onde ajustar antes de estourar.'
    },
    {
      title: 'Cartão é meio, não regra',
      description: 'Faturas são apenas projeção futura, sem mudar o orçamento.'
    }
  ];

  categories: CategorySnapshot[] = [
    {
      name: 'Mercado',
      limit: 'R$ 1.800 (21%)',
      spent: 'R$ 1.240',
      remaining: 'R$ 560',
      status: 'Atenção',
      progress: 69
    },
    {
      name: 'Moradia',
      limit: 'R$ 2.550 (30%)',
      spent: 'R$ 2.050',
      remaining: 'R$ 500',
      status: 'Normal',
      progress: 80
    },
    {
      name: 'Lazer',
      limit: 'R$ 850 (10%)',
      spent: 'R$ 930',
      remaining: '-R$ 80',
      status: 'Estourada',
      progress: 110
    },
    {
      name: 'Transporte',
      limit: 'R$ 680 (8%)',
      spent: 'R$ 320',
      remaining: 'R$ 360',
      status: 'Normal',
      progress: 47
    }
  ];

  quickActions = [
    {
      title: 'Novo lançamento',
      subtitle: 'Registre gastos únicos ou recorrentes'
    },
    {
      title: 'Lançamento parcelado',
      subtitle: 'Distribua parcelas entre meses passados ou futuros'
    },
    {
      title: 'Atualizar orçamento',
      subtitle: 'Categorias sempre em percentual do total'
    }
  ];
}
