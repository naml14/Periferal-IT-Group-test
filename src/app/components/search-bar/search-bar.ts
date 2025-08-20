import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, signal, output, effect } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  searchTerm = signal<string>('');

  resultCount = signal<number | null>(null);

  searchChanged = output<string>();

  constructor() {
    // Effect para emitir cambios cuando cambia el término de búsqueda
    effect(() => {
      this.searchChanged.emit(this.searchTerm());
    });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.resultCount.set(null);
  }

  updateResultCount(count: number): void {
    this.resultCount.set(count);
  }

  getCurrentSearchTerm(): string {
    return this.searchTerm();
  }
}
