import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Contact } from '../../models/contact.interface';

@Component({
  selector: 'app-contact-list',
  imports: [CommonModule],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.css',
})
export class ContactList {
  // Inputs
  contacts = input.required<Contact[]>();
  emptyMessage = input<string>('Agrega tu primer contacto usando el formulario de arriba.');

  // Outputs
  editContact = output<Contact>();
  deleteContact = output<Contact>();

  /**
   * Obtiene las iniciales del nombre para el avatar
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Formatea la fecha de creación
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  // Edición
  onEditContact(contact: Contact): void {
    this.editContact.emit(contact);
  }

  // Eliminación
  onDeleteContact(contact: Contact): void {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${contact.name}?`)) {
      this.deleteContact.emit(contact);
    }
  }
}
