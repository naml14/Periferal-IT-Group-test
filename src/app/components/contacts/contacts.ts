import { CommonModule } from '@angular/common';
import { ContactService } from '../../services/contact.service';
import { Component, signal, computed, ViewChild } from '@angular/core';
import { Contact, CreateContactDto } from '../../models/contact.interface';
import { ContactForm } from '../contact-form/contact-form';
import { ContactList } from '../contact-list/contact-list';
import { SearchBar } from '../search-bar/search-bar';

@Component({
  selector: 'app-contacts',
  imports: [CommonModule, ContactForm, ContactList, SearchBar],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css',
})
export class Contacts {
  @ViewChild('contactForm') contactFormRef!: ContactForm;
  @ViewChild('searchBar') searchBarRef!: SearchBar;

  // Signal para el término de búsqueda
  searchTerm = signal<string>('');

  // Signal para el contacto que se está editando
  editingContact = signal<Contact | null>(null);

  // Computed para los contactos filtrados
  filteredContacts = computed(() => {
    const term = this.searchTerm();
    if (!term) {
      return this.contactService.contacts();
    }
    return this.contactService.searchContacts(term);
  });

  constructor(public contactService: ContactService) {}

  /**
   * Maneja la adición o actualización de un contacto
   */
  onContactSubmitted(contactData: CreateContactDto): void {
    const editingContact = this.editingContact();

    if (editingContact) {
      // Actualizar contacto existente
      const updated = this.contactService.updateContact(editingContact.id, contactData);
      if (updated) {
        console.log('Contacto actualizado:', updated);
        this.editingContact.set(null);
      }
    } else {
      // Agregar nuevo contacto
      const newContact = this.contactService.addContact(contactData);
      console.log('Contacto agregado:', newContact);
    }

    // Actualizar el conteo de resultados en la búsqueda
    this.updateSearchResultCount();
  }

  /**
   * Maneja la cancelación de la edición
   */
  onEditCancelled(): void {
    this.editingContact.set(null);
  }

  /**
   * Maneja el cambio en el término de búsqueda
   */
  onSearchChanged(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.updateSearchResultCount();
  }

  /**
   * Maneja la edición de un contacto
   */
  onEditContact(contact: Contact): void {
    this.editingContact.set(contact);
    this.contactFormRef.setEditData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
    });

    // Scroll al formulario
    this.contactFormRef.contactForm.markAsUntouched();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Maneja la eliminación de un contacto
   */
  onDeleteContact(contact: Contact): void {
    const deleted = this.contactService.deleteContact(contact.id);
    if (deleted) {
      console.log('Contacto eliminado:', contact);

      // Si estábamos editando este contacto, cancelar la edición
      if (this.editingContact()?.id === contact.id) {
        this.onEditCancelled();
        this.contactFormRef.onReset();
      }

      this.updateSearchResultCount();
    }
  }

  /**
   * Maneja la eliminación de todos los contactos
   */
  onClearAllContacts(): void {
    const confirmed = confirm(
      `¿Estás seguro de que quieres eliminar todos los ${this.contactService.contactCount()} contactos? Esta acción no se puede deshacer.`
    );

    if (confirmed) {
      this.contactService.clearAllContacts();
      this.editingContact.set(null);
      this.searchTerm.set('');
      this.contactFormRef.onReset();
      console.log('Todos los contactos han sido eliminados');
    }
  }

  /**
   * Obtiene el mensaje apropiado para mostrar cuando no hay contactos
   */
  getEmptyMessage(): string {
    const searchTerm = this.searchTerm();
    if (searchTerm) {
      return `No se encontraron contactos que coincidan con "${searchTerm}". Intenta con otro término de búsqueda.`;
    }
    return 'Agrega tu primer contacto usando el formulario de arriba.';
  }

  /**
   * Actualiza el conteo de resultados en la barra de búsqueda
   */
  private updateSearchResultCount(): void {
    if (this.searchBarRef && this.searchTerm()) {
      this.searchBarRef.updateResultCount(this.filteredContacts().length);
    }
  }
}
