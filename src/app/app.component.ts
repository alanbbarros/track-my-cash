import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface CategoryConfig {
  id: string;
  name: string;
  limitType: 'value' | 'percent';
  limitValue: number;
}

interface CategorySnapshot {
  id: string;
  name: string;
  limitLabel: string;
  spentLabel: string;
  remainingLabel: string;
  status: 'normal' | 'atenção' | 'estourado';
  progress: number;
}

interface TransactionEntry {
  id: string;
  amount: number;
  date: string;
  categoryId: string;
  paymentMethod: string;
}

interface BudgetConfig {
  total: number;
  categories: CategoryConfig[];
}

const STORAGE_KEY = 'track-my-cash-data-v1';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  monthLabel = '';
  monthlyBudget = '';
  totalRemaining = '';
  dailyPace = '';
  projectedEnd = '';

  categories: CategorySnapshot[] = [];

  budgetConfig: BudgetConfig = {
    total: 8500,
    categories: [
      { id: 'market', name: 'Mercado', limitType: 'percent', limitValue: 21 },
      { id: 'housing', name: 'Moradia', limitType: 'percent', limitValue: 30 },
      { id: 'leisure', name: 'Lazer', limitType: 'percent', limitValue: 10 },
      { id: 'transport', name: 'Transporte', limitType: 'percent', limitValue: 8 },
      { id: 'health', name: 'Saúde', limitType: 'percent', limitValue: 6 }
    ]
  };

  transactions: TransactionEntry[] = [];

  newEntry = {
    amount: null as number | null,
    date: this.toDateInputValue(new Date()),
    categoryId: 'market',
    paymentMethod: 'Cartão de crédito'
  };

  paymentMethods = ['Cartão de crédito', 'Cartão de débito', 'Pix', 'Dinheiro'];

  ngOnInit(): void {
    this.loadStoredData();
    this.refreshDashboard();
  }

  addTransaction(): void {
    if (!this.newEntry.amount || this.newEntry.amount <= 0 || !this.newEntry.date) {
      return;
    }

    const entry: TransactionEntry = {
      id: crypto.randomUUID(),
      amount: this.newEntry.amount,
      date: this.newEntry.date,
      categoryId: this.newEntry.categoryId,
      paymentMethod: this.newEntry.paymentMethod
    };

    this.transactions = [entry, ...this.transactions];
    this.persistData();
    this.refreshDashboard();

    this.newEntry = {
      amount: null,
      date: this.toDateInputValue(new Date()),
      categoryId: this.newEntry.categoryId,
      paymentMethod: this.newEntry.paymentMethod
    };
  }

  scrollToForm(): void {
    const form = document.getElementById('entry-form');
    form?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  private refreshDashboard(): void {
    const today = new Date();
    const daysInMonth = this.daysInMonth(today);
    const dayOfMonth = today.getDate();

    this.monthLabel = today.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });

    const monthlyBudgetValue = this.budgetConfig.total;
    const monthTransactions = this.transactions.filter((entry) =>
      this.isSameMonth(entry.date, today)
    );

    const totalSpent = monthTransactions.reduce((sum, entry) => sum + entry.amount, 0);
    const remaining = monthlyBudgetValue - totalSpent;
    const pace = totalSpent / Math.max(dayOfMonth, 1);
    const projectedTotal = pace * daysInMonth;

    this.monthlyBudget = this.formatCurrency(monthlyBudgetValue);
    this.totalRemaining = this.formatCurrency(remaining);
    this.dailyPace = `${this.formatCurrency(pace)} / dia`;
    this.projectedEnd = this.formatCurrency(projectedTotal);

    const categorySnapshots = this.budgetConfig.categories.map((category) => {
      const limitAmount =
        category.limitType === 'percent'
          ? (monthlyBudgetValue * category.limitValue) / 100
          : category.limitValue;
      const spent = monthTransactions
        .filter((entry) => entry.categoryId === category.id)
        .reduce((sum, entry) => sum + entry.amount, 0);
      const remainingValue = limitAmount - spent;
      const progress = limitAmount === 0 ? 0 : Math.round((spent / limitAmount) * 100);
      const status = this.calculateStatus(spent, limitAmount, remainingValue);

      return {
        id: category.id,
        name: category.name,
        limitLabel:
          category.limitType === 'percent'
            ? `${this.formatCurrency(limitAmount)} (${category.limitValue}%)`
            : this.formatCurrency(limitAmount),
        spentLabel: this.formatCurrency(spent),
        remainingLabel: this.formatCurrency(remainingValue),
        status,
        progress
      };
    });

    this.categories = this.getCriticalCategories(categorySnapshots);
  }

  private getCriticalCategories(categories: CategorySnapshot[]): CategorySnapshot[] {
    const statusRank: Record<CategorySnapshot['status'], number> = {
      estourado: 3,
      atenção: 2,
      normal: 1
    };

    return [...categories]
      .sort((a, b) => {
        const statusDiff = statusRank[b.status] - statusRank[a.status];
        if (statusDiff !== 0) {
          return statusDiff;
        }
        return b.progress - a.progress;
      })
      .slice(0, 3);
  }

  private calculateStatus(spent: number, limit: number, remaining: number):
    | 'normal'
    | 'atenção'
    | 'estourado' {
    if (remaining < 0) {
      return 'estourado';
    }

    if (limit > 0 && spent / limit >= 0.85) {
      return 'atenção';
    }

    return 'normal';
  }

  private isSameMonth(dateValue: string, target: Date): boolean {
    const date = new Date(dateValue);
    return date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth();
  }

  private daysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  }

  private toDateInputValue(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private loadStoredData(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw) as {
      budgetConfig?: BudgetConfig;
      transactions?: TransactionEntry[];
    };

    if (parsed.budgetConfig) {
      this.budgetConfig = parsed.budgetConfig;
    }

    if (parsed.transactions) {
      this.transactions = parsed.transactions;
    }
  }

  private persistData(): void {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        budgetConfig: this.budgetConfig,
        transactions: this.transactions
      })
    );
  }
}
